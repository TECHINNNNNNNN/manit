import { Fragment } from "@/generated/prisma";
import { useState } from "react";
import { RefreshCw, ExternalLink, Check, Loader2 } from "lucide-react";


interface Props {
    data: Fragment;
}

export const FragmentWeb = ({ data }: Props) => {
    const [fragmentKey, setFragmentKey] = useState(0);
    const [copied, setCopied] = useState(false);
    const [isLoading, setIsLoading] = useState(true);

    const onRefresh = () => {
        setIsLoading(true);
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
            
            <div className="relative flex-1">
                {/* Loading overlay */}
                {isLoading && (
                    <div className="absolute inset-0 bg-white/80 flex flex-col items-center justify-center z-10 transition-opacity duration-300">
                        <Loader2 className="w-8 h-8 animate-spin text-blue-500 mb-3" />
                        <p className="text-sm text-gray-600">Preparing preview...</p>
                    </div>
                )}
                
                <iframe
                    key={fragmentKey}
                    className={`w-full h-full transition-opacity duration-500 ${isLoading ? 'opacity-0' : 'opacity-100'}`}
                    sandbox="allow-forms allow-scripts allow-same-origin"
                    src={data.sandboxUrl}
                    onLoad={() => setIsLoading(false)}
                    onError={() => setIsLoading(false)}
                />
            </div>
        </div>
    )
}