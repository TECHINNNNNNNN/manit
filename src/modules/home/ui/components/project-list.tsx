"use client";

import { useTRPC } from "@/trpc/client";
import { useQuery } from "@tanstack/react-query";
import Link from "next/link";
import { formatDistanceToNow } from "date-fns";
import { useUser } from "@clerk/nextjs";
import { ProjectListSkeleton } from "./project-card-skeleton";

export const ProjectList = () => {
    const trpc = useTRPC();
    const { user } = useUser();
    const { data: projects, isLoading } = useQuery(trpc.projects.getMany.queryOptions());

    if (!user) return null;

    // Show skeleton while loading
    if (isLoading) {
        return <ProjectListSkeleton />;
    }

    return (
        <div className="w-full bg-white dark:bg-sidebar rounded-xl p-8 border flex flex-col gap-y-6 sm:gap-y-4">
            <h2 className="text-2xl font-bold">
                {user?.firstName}'s projects
            </h2>

            <div className="grid grid-cols-1 sm:grid-cols-2 gap-6">
                {projects?.length === 0 && (
                    <div className="col-span-full text-center">
                        <p className="text-sm text-muted-foreground">
                            No projects yet.
                        </p>
                    </div>
                )}
                {projects?.map((project) => (
                    <button
                        key={project.id}
                        className="font-normal h-auto justify-start w-full text-start p-4"
                    >
                        <Link href={`/projects/${project.id}`}>
                            <div className="flex flex-col">
                                <h3 className="truncate font-medium">
                                    {project.name}
                                </h3>
                                <p className="text-sm text-muted-foreground">
                                    {formatDistanceToNow(project.updatedAt, { addSuffix: true })} ago
                                </p>
                            </div>
                        </Link>

                    </button>
                ))}
            </div>
        </div>
    )

}