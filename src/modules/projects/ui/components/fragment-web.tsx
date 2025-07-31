import { Fragment } from "@/generated/prisma";
import { useState } from "react";
import { RefreshCw, ExternalLink, Check } from "lucide-react";


interface Props {
    data: Fragment;
}

export const FragmentWeb = ({ data }: Props) => {
    const [fragmentKey, setFragmentKey] = useState(0);
    const [copied, setCopied] = useState(false);

    const onRefresh = () => {
        setFragmentKey(prev => prev + 1);
    }
    const onCopy = () => {
        navigator.clipboard.writeText(data.sandboxUrl);
        setCopied(true);
        setTimeout(() => {
            setCopied(false);
        }, 2000);
    }
    return (
        <div className="flex flex-col w-full h-full">
            <div className="flex items-center gap-2 px-3 py-2 border-b bg-gray-50">
                <button
                    onClick={onRefresh}
                    className="p-1.5 hover:bg-gray-200 rounded transition-colors"
                    title="Refresh"
                >
                    <RefreshCw className="w-4 h-4" />
                </button>
                
                <div 
                    onClick={onCopy}
                    className="flex-1 flex items-center gap-2 px-3 py-1.5 bg-white border rounded-md cursor-pointer hover:bg-gray-50 transition-colors"
                >
                    <span className="text-sm text-gray-600 truncate flex-1">
                        {data.sandboxUrl}
                    </span>
                    {copied && (
                        <Check className="w-4 h-4 text-green-600" />
                    )}
                </div>
                
                <button
                    onClick={() => window.open(data.sandboxUrl, '_blank')}
                    className="p-1.5 hover:bg-gray-200 rounded transition-colors"
                    title="Open in new tab"
                >
                    <ExternalLink className="w-4 h-4" />
                </button>
            </div>
            
            <iframe
                key={fragmentKey}
                className="flex-1 w-full"
                sandbox="allow-forms allow-scripts allow-same-origin"
                src={data.sandboxUrl}
            />
        </div>
    )
}