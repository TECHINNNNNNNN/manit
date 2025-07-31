import { useTRPC } from "@/trpc/client";
import { useSuspenseQuery } from "@tanstack/react-query";
import { MessageCard } from "@/modules/projects/ui/components/message-card";
import { MessageForm } from "./message-form";
import { useEffect, useRef } from "react";

interface Props {
    projectId: string;
};

export const MessagesContainer = ({ projectId }: Props) => {
    const trpc = useTRPC();
    const { data: messages } = useSuspenseQuery(trpc.messages.getMany.queryOptions({ projectId: projectId, }));
    const bottomRef = useRef<HTMLDivElement>(null);

    useEffect(() => {
        const lastAssistantMessage = messages.findLast((message) => message.role === "ASSISTANT");

        if (lastAssistantMessage) {
            // TODO SET ACTIVE FRAGMENT TO LAST ASSISTANT MESSAGE
        }
    }, [messages]);

    useEffect(() => {
        bottomRef.current?.scrollIntoView();
    }, [messages.length]);

    return (
        <div className="flex flex-col flex-1 min-h-0">
            <div className="flex-1 overflow-y-auto min-h-0">
                <div className="pt-2 pr-1">
                    {messages.map((message) => (
                        <MessageCard
                            key={message.id}
                            content={message.content}
                            role={message.role}
                            fragments={message.fragments}
                            createdAt={message.createdAt}
                            isActiveFragment={false}
                            onFragmentClick={() => { }}
                            type={message.type}
                        />
                    ))}
                    <div ref={bottomRef} />
                </div>
            </div>
            <div className="relative p-3 pt-1">
                <MessageForm
                    projectId={projectId}
                />
            </div>
        </div>
    )
}