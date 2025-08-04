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

const Page = async ({ params }: Props) => {
    const { projectId } = await params;
    
    // Check auth server-side
    const { has } = await auth();
    const hasProAccess = has?.({ plan: "pro" }) ?? false;

    const queryClient = getQueryClient();
    void queryClient.prefetchQuery(trpc.messages.getMany.queryOptions({ projectId, }));
    void queryClient.prefetchQuery(trpc.projects.getOne.queryOptions({ id: projectId, }));

    return (
        <HydrationBoundary state={dehydrate(queryClient)}>
            <ClientErrorBoundary>
                <Suspense fallback={<div>Loading...</div>}>
                    <ProjectView projectId={projectId} hasProAccess={hasProAccess} />
                </Suspense>
            </ClientErrorBoundary>
        </HydrationBoundary>
    )
}

export default Page;