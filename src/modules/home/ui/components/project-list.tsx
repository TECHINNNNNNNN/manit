"use client";

import { useTRPC } from "@/trpc/client";
import { useQuery } from "@tanstack/react-query";
import Link from "next/link";
import { formatDistanceToNow } from "date-fns";
import { useUser } from "@clerk/nextjs";
import { ProjectListSkeleton } from "./project-card-skeleton";
import { Sparkles } from "lucide-react";

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
                    <div className="col-span-full text-center py-12">
                        <Sparkles className="w-12 h-12 mx-auto mb-4 text-gray-400" />
                        <h3 className="text-lg font-medium mb-2">No projects yet</h3>
                        <p className="text-sm text-muted-foreground mb-6">
                            Create your first AI-powered linktree in seconds
                        </p>
                        <a href="#create-form" className="inline-block px-4 py-2 bg-blue-500 text-white rounded-lg hover:bg-blue-600">
                            Create Your First Linktree
                        </a>
                    </div>
                )}
                {projects?.map((project) => (
                    <Link 
                        key={project.id}
                        href={`/projects/${project.id}`}
                        className="block"
                    >
                        <div className="relative bg-[rgba(21,22,25,0.5)] backdrop-blur-sm border border-[rgba(255,255,255,0.06)] rounded-xl p-4 transition-all duration-300 hover:border-[rgba(255,107,53,0.3)] hover:bg-[rgba(21,22,25,0.7)] hover:shadow-lg hover:shadow-orange-500/10 hover:translate-y-[-2px]">
                            <div className="flex flex-col gap-1">
                                <h3 className="truncate font-medium text-foreground/90 hover:text-orange-400 transition-colors duration-300">
                                    {project.name}
                                </h3>
                                <p className="text-sm text-muted-foreground">
                                    Updated {formatDistanceToNow(project.updatedAt, { addSuffix: true })} ago
                                </p>
                            </div>
                        </div>
                    </Link>
                ))}
            </div>
        </div>
    )

}