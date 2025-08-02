"use client";

import {
    ResizableHandle,
    ResizablePanel,
    ResizablePanelGroup,
} from "@/components/ui/resizable";
import { MessagesContainer } from "../components/messages-container";
import { Suspense, useState } from "react";
import { Fragment } from "@/generated/prisma";
import { ProjectHeader } from "@/modules/projects/ui/components/project-header";
import { FragmentWeb } from "@/modules/projects/ui/components/fragment-web";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { CodeIcon, CrownIcon, EyeIcon } from "lucide-react";
import Link from "next/link";
import { FileExplorer } from "@/components/ui/file-explorer";
import { UserControl } from "@/components/ui/user-control";
import { useAuth } from "@clerk/nextjs";
import { ErrorBoundary } from "react-error-boundary";



interface Props {
    projectId: string;
};

export const ProjectView = ({ projectId }: Props) => {
    const [activeFragment, setActiveFragment] = useState<Fragment | null>(null);
    const [tabState, setTabState] = useState<'preview' | 'code'>('preview');
    const { has } = useAuth();
    const hasProAccess = has?.({ plan: "pro" })

    return (
        <div className="h-screen">
            <ResizablePanelGroup direction="horizontal">
                <ResizablePanel
                    defaultSize={35}
                    minSize={20}
                    className="flex flex-col"
                >
                    <ErrorBoundary fallbackRender={() => <div>Error</div>}>
                        <Suspense fallback={<div>Loading project...</div>}>
                            <ProjectHeader projectId={projectId} />
                        </Suspense>
                    </ErrorBoundary>
                    <Suspense
                        fallback={<div>Loading messages...</div>}
                    >
                        <MessagesContainer
                            projectId={projectId}
                            activeFragment={activeFragment}
                            setActiveFragment={setActiveFragment}
                        />
                    </Suspense>
                </ResizablePanel>
                <ResizableHandle className="hover:bg-primary transition-colors" />
                <ResizablePanel
                    defaultSize={65}
                    minSize={50}
                >
                    <Tabs
                        className="h-full gap-y-0"
                        defaultValue="preview"
                        value={tabState}
                        onValueChange={(value) => setTabState(value as 'preview' | 'code')}
                    >
                        <div className="w-full flex items-center p-2 border-b gap-x-2">
                            <TabsList className="h-8 p-0 border rounded-md">
                                <TabsTrigger value="preview">
                                    <EyeIcon /><span>Demo</span>
                                </TabsTrigger>
                                <TabsTrigger value="code">
                                    <CodeIcon /><span>Code</span>
                                </TabsTrigger>
                            </TabsList>
                            <div className="ml-auto flex items-center gap-x-2">
                                {!hasProAccess && <button>
                                    <Link href="/pricing" className="flex items-center gap-x-2">
                                        <CrownIcon />
                                        <span>Upgrade</span>
                                    </Link>
                                </button>}
                                <UserControl />

                            </div>

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