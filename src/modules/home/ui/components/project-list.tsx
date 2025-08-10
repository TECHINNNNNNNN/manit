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
                        <div className="relative group">
                            {/* Subtle aura glow effect */}
                            <div className="absolute inset-0 rounded-xl bg-gradient-to-br from-orange-500/5 via-amber-500/5 to-purple-500/5 opacity-50 blur-md group-hover:opacity-100 transition-opacity duration-300" />
                            
                            {/* Main card */}
                            <div className="relative bg-[rgba(30,31,35,0.8)] backdrop-blur-md border border-[rgba(255,255,255,0.08)] rounded-xl p-4 shadow-[0_2px_12px_rgba(0,0,0,0.3)] transition-all duration-300 group-hover:border-[rgba(255,107,53,0.35)] group-hover:bg-[rgba(30,31,35,0.9)] group-hover:shadow-[0_4px_20px_rgba(255,107,53,0.15)] group-hover:translate-y-[-2px]">
                                <div className="flex flex-col gap-1">
                                    <h3 className="truncate font-medium text-foreground group-hover:text-orange-400 transition-colors duration-300">
                                        {project.name}
                                    </h3>
                                    <p className="text-sm text-muted-foreground">
                                        Updated {formatDistanceToNow(project.updatedAt, { addSuffix: true })} ago
                                    </p>
                                </div>
                            </div>
                        </div>
                    </Link>
                ))}
            </div>
        </div>
    )

}