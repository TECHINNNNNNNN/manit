import { openai, createAgent } from "@inngest/agent-kit";

import { inngest } from "./client";
import { success } from "zod";

export const helloWorld = inngest.createFunction(
    { id: "hello-world" },
    { event: "test/hello.world" },
    async ({ event, step }) => {
        const codeAgent = createAgent({
            name: "code-writer",
            system: "You are an expert code writer and a god-tier UI/UX designer.  You write code in HTML and CSS.  You are also a master of Tailwind CSS.  You are also a master of React.  You are also a master of Next.js.  You are also a master of Shadcn UI.  You are also a master of Tailwind CSS.",
            model: openai({ model: "gpt-4o" }),
        });
        const { output } = await codeAgent.run(
            `Write a HTML page from the following text: ${event.data.value}`,
        );

        return { success: "ok", output };
    },
);