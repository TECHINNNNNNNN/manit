import { useTRPC } from "@/trpc/client";
import { useSuspenseQuery } from "@tanstack/react-query";
import { MessageCard } from "@/modules/projects/ui/components/message-card";
import { MessageForm } from "./message-form";
import { MessageLoading } from "@/modules/projects/ui/components/message-loading";
import { useEffect, useRef } from "react";
import { Fragment } from "@/generated/prisma";

interface Props {
    projectId: string;
    activeFragment: Fragment | null;
    setActiveFragment: (fragment: Fragment) => void;
};

export const MessagesContainer = ({ projectId, activeFragment, setActiveFragment }: Props) => {
    const trpc = useTRPC();
    const { data: messages } = useSuspenseQuery(trpc.messages.getMany.queryOptions({ projectId: projectId, }));
    const bottomRef = useRef<HTMLDivElement>(null);

    useEffect(() => {
        if (!activeFragment) {
            const lastAssistantMessage = messages.findLast((message) => message.role === "ASSISTANT");

            if (lastAssistantMessage?.fragments) {
                setActiveFragment(lastAssistantMessage.fragments);
            }
        }
    }, [messages, setActiveFragment, activeFragment]);

    useEffect(() => {
        bottomRef.current?.scrollIntoView();
    }, [messages.length]);

    const lastMessage = messages[messages.length - 1];
    const isLastMessageUser = lastMessage.role === "USER";

    return (
        <div className="flex flex-col flex-1 min-h-0 bg-background">
            <div className="flex-1 overflow-y-auto min-h-0">
                <div className="pt-2 pr-1 space-y-2">
                    {messages.map((message) => (
                        <MessageCard
                            key={message.id}
                            content={message.content}
                            role={message.role}
                            fragments={message.fragments}
                            createdAt={message.createdAt}
                            isActiveFragment={activeFragment?.id === message.fragments?.id}
                            onFragmentClick={() => {
                                if (message.fragments) {
                                    setActiveFragment(message.fragments);
                                }
                            }}
                            type={message.type}
                        />
                    ))}
                    {isLastMessageUser && <MessageLoading />}
                    <div ref={bottomRef} />
                </div>
            </div>
            <div className="relative p-3 pt-1 border-t border-border bg-card/5">
                <MessageForm
                    projectId={projectId}
                />
            </div>
        </div>
    )
}