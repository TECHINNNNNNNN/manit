/**
 * COMPONENT: ProjectPage
 * PURPOSE: Individual project view with dark theme and loading states
 * FLOW: Server-side auth check → data prefetching → client-side rendering
 * DEPENDENCIES: ProjectView, tRPC, Clerk auth, React Query
 */
import { ProjectView } from "@/modules/projects/ui/views/project-view";
import { getQueryClient, trpc } from "@/trpc/server";
import { dehydrate, HydrationBoundary } from "@tanstack/react-query";
import { Suspense } from "react";
import { ClientErrorBoundary } from "@/components/ui/client-error-boundary";
import { auth } from "@clerk/nextjs/server";

interface Props {
    params: Promise<{
        projectId: string
    }>
}

const ProjectLoadingSkeleton = () => (
    <div className="h-screen bg-background flex items-center justify-center">
        <div className="glass rounded-2xl p-8 flex flex-col items-center gap-4">
            <div className="animate-spin w-8 h-8 border-2 border-primary border-t-transparent rounded-full" />
            <p className="text-muted-foreground">Loading project...</p>
        </div>
    </div>
);

const Page = async ({ params }: Props) => {
    const { projectId } = await params;
    
    // Check auth server-side
    const { has } = await auth();
    const hasProAccess = has?.({ plan: "pro" }) ?? false;

    const queryClient = getQueryClient();
    void queryClient.prefetchQuery(trpc.messages.getMany.queryOptions({ projectId, }));
    void queryClient.prefetchQuery(trpc.projects.getOne.queryOptions({ id: projectId, }));

    return (
        <div className="bg-background">
            <HydrationBoundary state={dehydrate(queryClient)}>
                <ClientErrorBoundary>
                    <Suspense fallback={<ProjectLoadingSkeleton />}>
                        <ProjectView projectId={projectId} hasProAccess={hasProAccess} />
                    </Suspense>
                </ClientErrorBoundary>
            </HydrationBoundary>
        </div>
    )
}

export default Page;