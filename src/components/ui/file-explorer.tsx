import { cn, converFilesToTreeItems } from "@/lib/utils";
import { Fragment, useCallback, useMemo, useState } from "react";
import { ResizablePanel, ResizablePanelGroup } from "./resizable";
import { PanelResizeHandle } from "react-resizable-panels";
import { CopyIcon } from "lucide-react";
import { CodeView } from "../code-view";
import { TreeView } from "./tree-view";
import { Breadcrumb, BreadcrumbEllipsis, BreadcrumbItem, BreadcrumbList, BreadcrumbPage, BreadcrumbSeparator } from "./breadcrumb";


type FileCollection = { [path: string]: string }

function getLanguageFromExtension(filename: string): string {
    const extension = filename.split('.').pop()?.toLowerCase();

    return extension || 'text';
}

interface FileBreadcrumbProps {
    filePath: string;
}

const FileBreadcrumb = ({ filePath }: FileBreadcrumbProps) => {
    const pathSegments = filePath.split('/');
    const maxSegments = 4;


    const renderBreadcrumbItems = () => {
        if (pathSegments.length <= maxSegments) {
            // show all segments if 4 or less
            return pathSegments.map((segment, index) => {
                const isLast = index === pathSegments.length - 1;


                return (
                    <Fragment key={index}>
                        <BreadcrumbItem>
                            {isLast ? (
                                <BreadcrumbPage className="text-sm font-medium">
                                    {segment}
                                </BreadcrumbPage>
                            ) : (
                                <span className="text-sm font-medium">
                                    {segment}
                                </span>
                            )}
                        </BreadcrumbItem>
                        {!isLast && <BreadcrumbSeparator />}
                    </Fragment>
                )
            })
        } else {
            const firstSegments = pathSegments[0];
            const lastSegments = pathSegments[pathSegments.length - 1];
            return (
                <>
                    <BreadcrumbItem>
                        <span className="text-sm font-medium">
                            {firstSegments}
                        </span>
                    </BreadcrumbItem>
                    <BreadcrumbSeparator />
                    <BreadcrumbItem>
                        <BreadcrumbEllipsis />
                    </BreadcrumbItem>
                    <BreadcrumbSeparator />
                    <BreadcrumbItem>
                        <BreadcrumbPage className="text-sm font-medium">
                            {lastSegments}
                        </BreadcrumbPage>
                    </BreadcrumbItem>
                </>
            )
        }

        return (
            <Breadcrumb>
                <BreadcrumbList>
                    {renderBreadcrumbItems()}
                </BreadcrumbList>
            </Breadcrumb>
        )
    }

    return (
        <Breadcrumb>
            <BreadcrumbList>
                {renderBreadcrumbItems()}
            </BreadcrumbList>
        </Breadcrumb>
    )
}

interface FileExplorerProps {
    files: FileCollection;

}

export const FileExplorer = ({ files }: FileExplorerProps) => {
    const [selectedFile, setSelectedFile] = useState<string | null>(() => {
        const fileKeys = Object.keys(files);
        return fileKeys.length > 0 ? fileKeys[0] : null;
    });
    const [copied, setCopied] = useState(false);
    const treeData = useMemo(() => {
        return converFilesToTreeItems(files);
    }, [files])

    const handleFileSelect = useCallback((filePath: string) => {
        if (files[filePath]) {
            setSelectedFile(filePath);
        }
    }, [files])

    const handleCopy = useCallback(() => {
        if (selectedFile) {
            navigator.clipboard.writeText(files[selectedFile]);
            setCopied(true);
            setTimeout(() => {
                setCopied(false);
            }, 2000);
        }
    }, [selectedFile, files])

    return (

        <ResizablePanelGroup direction="horizontal">
            <ResizablePanel defaultSize={30} minSize={30} className="">
                <TreeView
                    data={treeData}
                    value={selectedFile}
                    onSelect={handleFileSelect}
                />
            </ResizablePanel>
            <PanelResizeHandle />
            <ResizablePanel defaultSize={70} minSize={50} className="">
                {selectedFile && files[selectedFile] ? (
                    <div className="h-full w-full flex flex-col">
                        <div className="border-b bg-sidebar px-4 py-2 flex justify-between items-center">
                            <FileBreadcrumb filePath={selectedFile} />
                            <button className="ml-auto" onClick={handleCopy} disabled={copied}>
                                <CopyIcon className={cn(copied && "animate-pulse")} />
                            </button>
                        </div>
                        <div className="flex-1 overflow-auto">
                            <CodeView
                                lang={getLanguageFromExtension(selectedFile)}
                                code={files[selectedFile]}
                            />
                        </div>
                    </div>
                ) : (
                    <div className="flex items-center justify-center h-full">
                        <p>No file selected</p>
                    </div>
                )}
            </ResizablePanel>
        </ResizablePanelGroup>

    )

}