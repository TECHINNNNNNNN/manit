/**
 * COMPONENT: MessagesSkeleton
 * PURPOSE: Loading skeleton for message cards in chat interface
 * FLOW: Shows animated placeholders mimicking user/assistant message layout
 * DEPENDENCIES: Skeleton from shadcn/ui
 */

import { Skeleton } from "@/components/ui/skeleton";

/**
 * Skeleton for a user message (right-aligned)
 */
const UserMessageSkeleton = () => {
    return (
        <div className="flex justify-end pb-4 pr-2 pl-10">
            <Skeleton className="h-12 w-48 rounded-lg" />
        </div>
    );
};

/**
 * Skeleton for an assistant message with fragment card
 */
const AssistantMessageSkeleton = () => {
    return (
        <div className="flex flex-col group px-2 pb-4">
            {/* Assistant header */}
            <div className="flex items-center gap-2 pl-2 mb-2">
                <Skeleton className="h-4 w-12 rounded" />
            </div>
            
            {/* Message content */}
            <div className="pl-8.5">
                <Skeleton className="h-4 w-3/4 mb-2" />
                <Skeleton className="h-4 w-2/3 mb-3" />
            </div>
            
            {/* Fragment card skeleton */}
            <div className="pl-8.5">
                <Skeleton className="h-16 w-1/2 rounded-md" />
            </div>
        </div>
    );
};

/**
 * Complete messages container skeleton
 * Shows a realistic conversation loading state
 */
export const MessagesSkeleton = () => {
    return (
        <div className="flex flex-col flex-1 min-h-0 bg-background">
            <div className="flex-1 overflow-y-auto min-h-0">
                <div className="pt-2 pr-1 space-y-2">
                    {/* Show a mix of user and assistant message skeletons */}
                    <UserMessageSkeleton />
                    <AssistantMessageSkeleton />
                    <UserMessageSkeleton />
                    <AssistantMessageSkeleton />
                </div>
            </div>
            
            {/* Message form area skeleton */}
            <div className="relative p-3 pt-1 border-t border-border bg-card/5">
                <Skeleton className="h-24 w-full rounded-lg" />
            </div>
        </div>
    );
};