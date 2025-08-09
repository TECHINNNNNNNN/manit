/**
 * COMPONENT: ProjectHeaderSkeleton
 * PURPOSE: Loading skeleton for project header
 * FLOW: Shows placeholder for back button, title, and date
 * DEPENDENCIES: Skeleton from shadcn/ui
 */

import { Skeleton } from "@/components/ui/skeleton";
import { ArrowLeft } from "lucide-react";

export const ProjectHeaderSkeleton = () => {
    return (
        <div className="flex items-center justify-between px-4 py-3 border-b border-border bg-card/10">
            <div className="flex items-center gap-2">
                {/* Back button - keep visible but disabled looking */}
                <div className="p-2 opacity-50 text-muted-foreground">
                    <ArrowLeft className="w-4 h-4" />
                </div>
                {/* Project name skeleton */}
                <Skeleton className="h-6 w-32" />
            </div>
            {/* Date skeleton */}
            <Skeleton className="h-4 w-24" />
        </div>
    );
};