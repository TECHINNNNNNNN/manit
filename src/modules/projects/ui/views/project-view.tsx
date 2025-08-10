"use client";

import {
    ResizableHandle,
    ResizablePanel,
    ResizablePanelGroup,
} from "@/components/ui/resizable";
import { MessagesContainer } from "../components/messages-container";
import { MessagesSkeleton } from "../components/messages-skeleton";
import { Suspense, useState } from "react";
import { Fragment } from "@/generated/prisma";
import { ProjectHeader } from "@/modules/projects/ui/components/project-header";
import { ProjectHeaderSkeleton } from "@/modules/projects/ui/components/project-header-skeleton";
import { FragmentWeb } from "@/modules/projects/ui/components/fragment-web";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { CodeIcon, EyeIcon } from "lucide-react";
import { FileExplorer } from "@/components/ui/file-explorer";
import { ErrorBoundary } from "react-error-boundary";
import { ErrorFallback } from "@/components/ui/error-fallback";
import { AuthSection } from "@/components/ui/auth-section";



interface Props {
    projectId: string;
    hasProAccess: boolean;
};

export const ProjectView = ({ projectId, hasProAccess }: Props) => {
    const [activeFragment, setActiveFragment] = useState<Fragment | null>(null);
    const [tabState, setTabState] = useState<'preview' | 'code'>('preview');

    return (
        <div className="h-screen bg-background">
            <ResizablePanelGroup direction="horizontal">
                <ResizablePanel
                    defaultSize={35}
                    minSize={20}
                    className="flex flex-col bg-card/30 border-r border-border"
                >
                    <ErrorBoundary FallbackComponent={ErrorFallback}>
                        <Suspense fallback={<ProjectHeaderSkeleton />}>
                            <ProjectHeader projectId={projectId} />
                        </Suspense>
                    </ErrorBoundary>
                    <Suspense
                        fallback={<MessagesSkeleton />}
                    >
                        <MessagesContainer
                            projectId={projectId}
                            activeFragment={activeFragment}
                            setActiveFragment={setActiveFragment}
                        />
                    </Suspense>
                </ResizablePanel>
                <ResizableHandle className="hover:bg-primary/20 transition-colors bg-border" />
                <ResizablePanel
                    defaultSize={65}
                    minSize={50}
                    className="bg-background"
                >
                    <Tabs
                        className="h-full gap-y-0"
                        defaultValue="preview"
                        value={tabState}
                        onValueChange={(value) => setTabState(value as 'preview' | 'code')}
                    >
                        <div className="w-full flex items-center p-2 border-b border-border bg-card/20 gap-x-2">
                            <TabsList className="h-8 p-0 border border-border bg-muted/20 rounded-md">
                                <TabsTrigger value="preview">
                                    <EyeIcon /><span className="font-ui">Demo</span>
                                </TabsTrigger>
                                <TabsTrigger value="code">
                                    <CodeIcon /><span className="font-ui">Code</span>
                                </TabsTrigger>
                            </TabsList>
                            <AuthSection hasProAccess={hasProAccess} />

                        </div>
                        <TabsContent value="preview">
                            {!!activeFragment && <FragmentWeb data={activeFragment} />}
                        </TabsContent>
                        <TabsContent value="code" className="min-h-0">
                            {!!activeFragment && (
                                <FileExplorer
                                    files={activeFragment.files as { [path: string]: string }}
                                />
                            )}
                        </TabsContent>
                    </Tabs>

                </ResizablePanel>
            </ResizablePanelGroup>
        </div>
    )
}