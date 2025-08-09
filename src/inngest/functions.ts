import { openai, createAgent, createTool, createNetwork, type Tool, createState } from "@inngest/agent-kit";
import { Sandbox } from "@e2b/code-interpreter";
import { FRAGMENT_TITLE_PROMPT, PROJECT_TITLE_PROMPT, PROMPT, RESPONSE_PROMPT } from "@/prompt";

import { inngest } from "./client";
import { getSandbox, lastAssistantTextMessageContent } from "./utils";
import { z } from "zod";
import { stderr } from "process";
import prisma from "@/lib/db";
import { StepToolOptions } from "inngest/components/InngestStepTools";
import { Message } from "@prisma/client";
import { SANDBOX_TIMEOUT } from "./types";
import { deployToGitHubPages } from "@/lib/github-deploy";
import { generateShortCode, buildShortUrl } from "@/lib/url-shortener";

interface AgentState {
    summary: string;
    files: { [path: string]: string };
}

const parseAgentOutput = (value: Message[]) => {
    const output = value[0];

    if (output.type !== "text") {
        return "Fragment";
    }

    if (Array.isArray(output.content)) {
        return output.content.map((txt: string) => txt).join("");
    }

    return output.content;
}

export const codeAgentFunction = inngest.createFunction(
    { id: "code-agent" },
    { event: "code-agent/run" },
    async ({ event, step }) => {
        const sandboxId = await step.run("get-sandbox-id", async () => {
            const sandbox = await Sandbox.create("manit-techin-linktree-1");
            await sandbox.setTimeout(SANDBOX_TIMEOUT);
            return sandbox.sandboxId;
        })

        const project = await step.run("get-project", async () => {
            return await prisma.project.findUnique({
                where: { id: event.data.projectId }
            });
        });

        const previousMessages = await step.run("get-previos-messages", async () => {
            const formattedMessages: Message[] = [];

            const messages = await prisma.message.findMany({
                where: {
                    projectId: event.data.projectId,
                },
                orderBy: {
                    createdAt: "desc",
                },
                take: 10,
            })

            for (const message of messages) {
                formattedMessages.push({
                    type: "text",
                    role: message.role === "ASSISTANT" ? "assistant" : "user",
                    content: message.content,
                })
            }

            return formattedMessages.reverse();
        })
        const state = createState<AgentState>(
            {
                summary: "",
                files: {},
            },
            {
                messages: previousMessages,
            }
        )

        const codeAgent = createAgent<AgentState>({
            name: "code-writer",
            description: "An expert coding agent",
            system: PROMPT,
            model: openai({
                model: "gpt-4.1", defaultParameters: {
                    temperature: 0.1,
                }
            }),
            tools: [
                createTool({
                    name: "terminal",
                    description: "Use this tool to run terminal commands",
                    parameters: z.object({
                        command: z.string(),
                    }),
                    handler: async ({ command }, { step }) => {
                        return await step?.run("terminal", async () => {
                            const buffers = { stdout: "", stderr: "" };

                            try {
                                const sandbox = await getSandbox(sandboxId)
                                const result = await sandbox.commands.run(command, {
                                    onStdout: (data: string) => {
                                        buffers.stdout += data;
                                    },
                                    onStderr: (data: string) => {
                                        buffers.stderr += data;
                                    }
                                })
                                return result.stdout;
                            } catch (error) {
                                console.error(
                                    `Command failed ${error} \nstdout: ${buffers.stdout} \nstderr: ${buffers.stderr}`
                                )
                                return `Command failed ${error} \nstdout: ${buffers.stdout} \nstderr: ${buffers.stderr}`
                            }
                        })
                    }
                }),
                createTool({
                    name: "createOrUpdateFiles",
                    description: "Create or update files in the sandbox",
                    parameters: z.object({
                        files: z.array(z.object({
                            path: z.string(),
                            content: z.string(),
                        })),
                    }),
                    handler: async (
                        { files },
                        { step, network }: Tool.Options<AgentState>
                    ) => {
                        const newFiles = await step?.run("createOrUpdateFiles", async () => {
                            try {
                                const updatedFiles = network.state.data.files || {};
                                const sandbox = await getSandbox(sandboxId)
                                for (const file of files) {
                                    await sandbox.files.write(file.path, file.content);
                                    updatedFiles[file.path] = file.content;
                                }

                                return updatedFiles;
                            } catch (error) {
                                return `Failed to create or update files: ${error}`;
                            }
                        })

                        if (typeof newFiles === "object") {
                            network.state.data.files = newFiles;
                        }
                    }
                }),
                createTool({
                    name: "readFiles",
                    description: "Read files from the sandbox",
                    parameters: z.object({
                        files: z.array(z.string()),
                    }),
                    handler: async ({ files }, { step, network }) => {
                        return await step?.run("readFiles", async () => {
                            try {
                                const sandbox = await getSandbox(sandboxId)
                                const contents = [];
                                for (const file of files) {
                                    const content = await sandbox.files.read(file);
                                    contents.push({ path: file, content });
                                }
                                return JSON.stringify(contents);
                            } catch (error) {
                                return `Failed to read files: ${error}`;
                            }
                        })
                    }
                })
            ],
            lifecycle: {
                onResponse: async ({ result, network }) => {
                    const lastAssistantTextMessageText = lastAssistantTextMessageContent(result);

                    if (lastAssistantTextMessageText && network) {
                        if (lastAssistantTextMessageText.includes("<task_summary>")) {
                            network.state.data.summary = lastAssistantTextMessageText;
                        }
                    }

                    return result;
                }
            }
        });

        const network = createNetwork<AgentState>({
            name: "coding-agent-network",
            agents: [codeAgent],
            maxIter: 15,
            defaultState: state,
            router: async ({ network }) => {
                const summary = network.state.data.summary;

                if (summary) {
                    return;
                }

                return codeAgent;
            }
        })

        const result = await network.run(event.data.value, { state });

        const fragmentTitleGenerator = createAgent({
            name: "fragment-title-generator",
            description: "An assistant that generates a short, descriptive title for a code fragment based on its <task_summary>.",
            system: FRAGMENT_TITLE_PROMPT,
            model: openai({
                model: "gpt-4o-mini", defaultParameters: {}
            })
        })

        const responseGenerator = createAgent({
            name: "response-generator",
            description: "An assistant that generates a short, user-friendly message explaining what was just built, based on the <task_summary> provided by the other agents.",
            system: RESPONSE_PROMPT,
            model: openai({
                model: "gpt-4o-mini", defaultParameters: {}
            })
        })

        const { output: fragmentTitleOutput } = await fragmentTitleGenerator.run(result.state.data.summary);
        const { output: responseOutput } = await responseGenerator.run(result.state.data.summary);
        
        // Only generate project title if current name is temporary
        const needsProjectTitle = project?.name?.startsWith("untitled-");
        let projectTitleOutput = null;
        
        if (needsProjectTitle) {
            const projectTitleGenerator = createAgent({
                name: "project-title-generator",
                description: "An assistant that generates a kebab-case project name for a linktree based on its <task_summary>.",
                system: PROJECT_TITLE_PROMPT,
                model: openai({
                    model: "gpt-4o-mini", defaultParameters: {}
                })
            });
            const { output } = await projectTitleGenerator.run(result.state.data.summary);
            projectTitleOutput = output;
        }



        const isError = !result.state.data.summary || Object.keys(result.state.data.files).length === 0;

        const sandboxUrl = await step.run("get-sandbox-url", async () => {
            const sandbox = await getSandbox(sandboxId)
            const host = sandbox.getHost(3000)
            return `http://${host}`
        })

        const savedMessage = await step.run("save-result", async () => {
            if (isError) {
                return await prisma.message.create({
                    data: {
                        projectId: event.data.projectId,
                        content: "Something went wrong. Please Please try again.",
                        role: "ASSISTANT",
                        type: "ERROR",
                    }
                })
            }
            
            // Update project name only if we generated a new title
            if (projectTitleOutput) {
                try {
                    const projectTitle = parseAgentOutput(projectTitleOutput);
                    // Only update if we got a valid title
                    if (projectTitle && projectTitle.trim() !== "" && projectTitle !== "Fragment") {
                        await prisma.project.update({
                            where: { id: event.data.projectId },
                            data: { name: projectTitle }
                        });
                    } else {
                        // Fallback: generate a random name if title generation failed
                        const { generateSlug } = await import("random-word-slugs");
                        const fallbackName = generateSlug(2, { format: "kebab" });
                        await prisma.project.update({
                            where: { id: event.data.projectId },
                            data: { name: fallbackName }
                        });
                    }
                } catch (error) {
                    console.error("Failed to update project name:", error);
                    // If all else fails, keep the temporary name
                }
            }
            
            return await prisma.message.create({
                data: {
                    projectId: event.data.projectId,
                    content: parseAgentOutput(responseOutput),
                    role: "ASSISTANT",
                    type: "RESULT",
                    fragments: {
                        create: {
                            sandboxUrl: sandboxUrl,
                            title: parseAgentOutput(fragmentTitleOutput),
                            files: result.state.data.files,
                        }
                    }
                }
            })
        })
        
        // Deploy to GitHub Pages automatically after successful generation
        await step.run("deploy-to-github", async () => {
            if (!isError && result.state.data.files?.["index.html"]) {
                try {
                    // Update status to deploying
                    await prisma.project.update({
                        where: { id: event.data.projectId },
                        data: { deploymentStatus: "DEPLOYING" }
                    });
                    
                    // Get the latest project name
                    const updatedProject = await prisma.project.findUnique({
                        where: { id: event.data.projectId }
                    });
                    
                    if (!updatedProject) {
                        throw new Error("Project not found");
                    }
                    
                    // Deploy to GitHub Pages
                    const deployResult = await deployToGitHubPages(
                        event.data.projectId,
                        updatedProject.name,
                        result.state.data.files["index.html"]
                    );
                    
                    if (deployResult.success) {
                        // Generate short URL
                        const shortCode = generateShortCode(event.data.projectId);
                        const shortUrl = buildShortUrl(shortCode);
                        
                        // Update project with deployment info
                        await prisma.project.update({
                            where: { id: event.data.projectId },
                            data: {
                                githubRepo: deployResult.repoName,
                                deploymentUrl: deployResult.pagesUrl,
                                deploymentStatus: "DEPLOYED",
                                deployedAt: new Date(),
                                shortUrl: shortUrl,
                            }
                        });
                        
                        console.log(`Successfully deployed project ${event.data.projectId} to ${deployResult.pagesUrl}`);
                    } else {
                        // Deployment failed
                        await prisma.project.update({
                            where: { id: event.data.projectId },
                            data: { deploymentStatus: "FAILED" }
                        });
                        
                        console.error(`Failed to deploy project ${event.data.projectId}: ${deployResult.error}`);
                    }
                } catch (error) {
                    console.error(`Deployment error for project ${event.data.projectId}:`, error);
                    
                    await prisma.project.update({
                        where: { id: event.data.projectId },
                        data: { deploymentStatus: "FAILED" }
                    });
                }
            }
        })

        return {
            url: sandboxUrl,
            title: "Fragment",
            files: result.state.data.files,
            summary: result.state.data.summary,
        };
    },
);