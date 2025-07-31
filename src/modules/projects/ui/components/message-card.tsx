import { Fragment, MessageRole, MessageType } from "@/generated/prisma";
import { cn } from "@/lib/utils";
import { format } from "date-fns";
import { ChevronRightIcon, Code2Icon } from "lucide-react";

interface UserMessageProps {
    content: string;
}

const UserMessage = ({ content }: UserMessageProps) => {
    return (
        <div className="flex justify-end pb-4 pr-2 pl-10">
            <div className="bg-blue-100 rounded-lg px-4 py-2 shadow-sm">
                {content}
            </div>
        </div>
    )
}

interface FragmentCardProps {
    fragment: Fragment;
    isActiveFragment: boolean;
    onFragmentClick: (fragment: Fragment) => void;
}

const FragmentCard = ({ fragment, isActiveFragment, onFragmentClick }: FragmentCardProps) => {
    return (
        <button
            className={cn(
                "flex w-1/2 items-center gap-2 px-2 py-5 rounded-md transition-all cursor-pointer hover:bg-blue-500 hover:text-white transition-colors duration-200",
                isActiveFragment && "bg-blue-500 text-white",
            )}
            onClick={() => onFragmentClick(fragment)}
        >
            <Code2Icon className="size-4 mt-0.5" />
            <div className="flex flex-col flex-1">
                <span className="text-sm font-medium line-clamp-1">
                    {fragment.title}
                </span>
                <span className="text-sm">Preview</span>
            </div>
            <div className="flex items-center justify-center mt-0">
                <ChevronRightIcon className="size-4" />
            </div>
        </button>
    )
}

interface AssistantMessageProps {
    content: string;
    fragments: Fragment | null;
    createdAt: Date;
    isActiveFragment: boolean;
    onFragmentClick: (fragment: Fragment) => void;
    type: MessageType;
}

const AssistantMessage = ({
    content,
    fragments,
    createdAt,
    isActiveFragment,
    onFragmentClick,
    type,
}: AssistantMessageProps) => {
    return (
        <div className={cn(
            "flex flex-col group px-2 pb-4",
            type === "ERROR" && "text-red-700 dark:text-red-500",
        )}>
            <div className="flex items-center gap-2 pl-2 mb-2">
                <span className="text-sm font-medium">Manit</span>
                <span className="text-xs text-muted-foreground opacity-0 transition-opacity group-hover:opacity-100">
                    {format(createdAt, "HH:mm 'on' MMM dd, yyyy")}
                </span>
            </div>
            <div className="pl-8.5 flex flex-col gap-y-4">
                <span className="text-sm">{content}</span>
                {fragments && type === "RESULT" && (
                    <FragmentCard
                        fragment={fragments}
                        isActiveFragment={isActiveFragment}
                        onFragmentClick={onFragmentClick}
                    />
                )}
            </div>
        </div>
    )
}



interface MessageCardProps {
    content: string;
    role: MessageRole;
    fragments: Fragment | null;
    createdAt: Date;
    isActiveFragment: boolean;
    onFragmentClick: (fragment: Fragment) => void;
    type: MessageType;
};

export const MessageCard = ({
    content,
    role,
    fragments,
    createdAt,
    isActiveFragment,
    onFragmentClick,
    type,
}: MessageCardProps) => {
    if (role === "ASSISTANT") {
        return (
            <AssistantMessage
                content={content}
                fragments={fragments}
                createdAt={createdAt}
                isActiveFragment={isActiveFragment}
                onFragmentClick={onFragmentClick}
                type={type}
            />
        )
    }

    return (
        <UserMessage
            content={content}
        />
    )
};