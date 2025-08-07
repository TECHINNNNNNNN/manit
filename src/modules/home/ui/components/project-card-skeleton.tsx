/**
 * COMPONENT: ProjectCardSkeleton
 * PURPOSE: Loading skeleton for project cards
 * FLOW: Displays animated placeholders while projects load
 * DEPENDENCIES: Skeleton from shadcn/ui
 */

import { Skeleton } from "@/components/ui/skeleton";

export const ProjectCardSkeleton = () => {
    return (
        <div className="p-4">
            <div className="flex flex-col space-y-2">
                {/* Title skeleton */}
                <Skeleton className="h-5 w-3/4" />
                {/* Date skeleton */}
                <Skeleton className="h-4 w-1/2" />
            </div>
        </div>
    );
};

/**
 * ProjectListSkeleton
 * Shows multiple skeleton cards for the entire project list
 */
export const ProjectListSkeleton = () => {
    return (
        <div className="w-full bg-white dark:bg-sidebar rounded-xl p-8 border flex flex-col gap-y-6 sm:gap-y-4">
            {/* Header skeleton */}
            <Skeleton className="h-8 w-48" />
            
            {/* Project cards grid */}
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-6">
                {/* Show 4 skeleton cards */}
                {[...Array(4)].map((_, index) => (
                    <div key={index} className="font-normal h-auto justify-start w-full text-start">
                        <ProjectCardSkeleton />
                    </div>
                ))}
            </div>
        </div>
    );
};