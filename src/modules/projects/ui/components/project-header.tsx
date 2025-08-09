import { useTRPC } from "@/trpc/client";
import { useSuspenseQuery } from "@tanstack/react-query";
import { ArrowLeft } from "lucide-react";
import Link from "next/link";
import { DeploymentStatusDisplay } from "./deployment-status";

interface Props {
    projectId: string;
}

export const ProjectHeader = ({ projectId }: Props) => {
    const trpc = useTRPC();
    const { data: project } = useSuspenseQuery(
        trpc.projects.getOne.queryOptions({ id: projectId })
    )

    return (
        <div className="flex items-center justify-between px-4 py-3 border-b">
            <div className="flex items-center gap-2">
                <Link href="/" className="p-1 hover:bg-gray-100 rounded">
                    <ArrowLeft className="w-4 h-4" />
                </Link>
                <h1 className="text-lg font-semibold">{project.name}</h1>
            </div>
            <div className="flex items-center gap-4">
                <DeploymentStatusDisplay 
                    status={project.deploymentStatus}
                    deploymentUrl={project.deploymentUrl}
                    shortUrl={project.shortUrl}
                    githubRepo={project.githubRepo}
                    projectName={project.name}
                />
                <div className="text-sm text-gray-500">
                    {new Date(project.createdAt).toLocaleDateString()}
                </div>
            </div>
        </div>
    )
}