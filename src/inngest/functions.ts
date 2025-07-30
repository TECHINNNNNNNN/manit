import { openai, createAgent } from "@inngest/agent-kit";
import { Sandbox } from "@e2b/code-interpreter";

import { inngest } from "./client";
import { getSandbox } from "./utils";

export const helloWorld = inngest.createFunction(
    { id: "hello-world" },
    { event: "test/hello.world" },
    async ({ event, step }) => {
        const sandboxId = await step.run("get-sandbox-id", async () => {
            const sandbox = await Sandbox.create("manit-techin-test-2");
            return sandbox.sandboxId;
        })
        const codeAgent = createAgent({
            name: "code-writer",
            system: "You are an expert code writer and a god-tier UI/UX designer.  You write code in HTML and CSS.  You are also a master of Tailwind CSS.  You are also a master of React.  You are also a master of Next.js.  You are also a master of Shadcn UI.  You are also a master of Tailwind CSS.",
            model: openai({ model: "gpt-4o" }),
        });
        const { output } = await codeAgent.run(
            `Write a HTML page from the following text: ${event.data.value}`,
        );

        const sandboxUrl = await step.run("get-sandbox-url", async () => {
            const sandbox = await getSandbox(sandboxId)
            const host = sandbox.getHost(3000)
            return `http://${host}`
        })

        return { output, sandboxUrl };
    },
);