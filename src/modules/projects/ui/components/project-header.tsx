import { useTRPC } from "@/trpc/client";
import { useQuery } from "@tanstack/react-query";
import { ArrowLeft } from "lucide-react";
import Link from "next/link";
import { DeploymentStatusDisplay } from "./deployment-status";
import { DeploymentStatus } from "@/generated/prisma";

interface Props {
    projectId: string;
}

/**
 * COMPONENT: ProjectHeader
 * PURPOSE: Displays project header with deployment status
 * FLOW: Fetches project data -> Shows loading state -> Displays status with polling
 * DEPENDENCIES: useQuery for data fetching with polling support
 */
export const ProjectHeader = ({ projectId }: Props) => {
    const trpc = useTRPC();
    
    // Use useQuery instead of useSuspenseQuery for loading states
    const { data: project, isLoading, error } = useQuery({
        ...trpc.projects.getOne.queryOptions({ id: projectId }),
        // Poll every 3 seconds if deployment is in progress
        refetchInterval: (query) => {
            const projectData = query.state.data;
            const isDeploying = projectData?.deploymentStatus === DeploymentStatus.DEPLOYING || 
                               projectData?.deploymentStatus === DeploymentStatus.PENDING;
            return isDeploying ? 3000 : false; // Poll every 3 seconds while deploying
        },
        refetchIntervalInBackground: true, // Keep polling even if tab loses focus
    });

    // Show loading skeleton while fetching initial data
    if (isLoading) {
        return (
            <div className="flex items-center justify-between px-4 py-3 border-b border-border bg-card/10">
                <div className="flex items-center gap-2">
                    <Link href="/" className="btn-ghost p-2 rounded-md">
                        <ArrowLeft className="w-4 h-4" />
                    </Link>
                </div>
                <div className="flex items-center gap-4">
                    {/* Beautiful skeleton matching DeploymentStatusDisplay layout */}
                    <div className="flex items-center gap-2">
                        {/* Status badge skeleton */}
                        <div className="flex items-center gap-1.5 px-2 py-1 rounded-md bg-gray-50 animate-pulse">
                            <div className="w-4 h-4 bg-gray-200 rounded-full" />
                            <div className="w-20 h-4 bg-gray-200 rounded" />
                        </div>
                        
                        {/* Button skeletons matching the share buttons */}
                        <div className="h-8 w-24 bg-muted/10 border border-border rounded-md animate-pulse" />
                        <div className="h-8 w-20 bg-muted/10 border border-border rounded-md animate-pulse" />
                        <div className="h-8 w-24 bg-primary/10 rounded-md animate-pulse" />
                    </div>
                    
                    {/* Date skeleton */}
                    <div className="w-20 h-4 bg-muted/20 rounded animate-pulse" />
                </div>
            </div>
        );
    }

    // Handle error state
    if (error || !project) {
        return (
            <div className="flex items-center justify-between px-4 py-3 border-b border-border bg-card/10">
                <div className="flex items-center gap-2">
                    <Link href="/" className="btn-ghost p-2 rounded-md">
                        <ArrowLeft className="w-4 h-4" />
                    </Link>
                </div>
                <div className="text-sm text-destructive">
                    Failed to load project
                </div>
            </div>
        );
    }

    return (
        <div className="flex items-center justify-between px-4 py-3 border-b border-border bg-card/10">
            <div className="flex items-center gap-2">
                <Link href="/" className="btn-ghost p-2 rounded-md">
                    <ArrowLeft className="w-4 h-4" />
                </Link>
            </div>
            <div className="flex items-center gap-4">
                <DeploymentStatusDisplay
                    status={project.deploymentStatus}
                    deploymentUrl={project.deploymentUrl}
                    shortUrl={project.shortUrl}
                    githubRepo={project.githubRepo}
                    projectName={project.name}
                />
                <div className="text-sm text-muted-foreground font-ui">
                    {new Date(project.createdAt).toLocaleDateString()}
                </div>
            </div>
        </div>
    )
}