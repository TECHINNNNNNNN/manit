import { Fragment } from "@/generated/prisma";
import { useState } from "react";
import { RefreshCw, ExternalLink, Check, Loader2, Globe, Cloud } from "lucide-react";
import { toast } from "sonner";


interface Props {
    data: Fragment;
}

export const FragmentWeb = ({ data }: Props) => {
    const [fragmentKey, setFragmentKey] = useState(0);
    const [copied, setCopied] = useState(false);
    const [isLoading, setIsLoading] = useState(true);
    const [useDeployedUrl, setUseDeployedUrl] = useState(!!data.deploymentUrl);
    
    // Use deployed URL if available, otherwise sandbox URL
    const currentUrl = useDeployedUrl && data.deploymentUrl ? data.deploymentUrl : data.sandboxUrl;
    const isDeployed = data.deploymentStatus === 'DEPLOYED';

    const onRefresh = () => {
        setIsLoading(true);
        setFragmentKey(prev => prev + 1);
    }
    
    const onCopy = () => {
        navigator.clipboard.writeText(currentUrl);
        toast.success("URL copied!");
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
                    className="btn-icon"
                    title="Refresh"
                >
                    <RefreshCw className="w-4 h-4" />
                </button>
                
                {/* URL Switcher if deployed */}
                {isDeployed && (
                    <div className="flex items-center gap-1 px-2 py-1 bg-white border rounded-md">
                        <button
                            onClick={() => setUseDeployedUrl(false)}
                            className={`p-1 rounded transition-colors ${!useDeployedUrl ? 'bg-blue-100 text-blue-600' : 'text-gray-500 hover:text-gray-700'}`}
                            title="Sandbox URL (temporary)"
                        >
                            <Globe className="w-3.5 h-3.5" />
                        </button>
                        <button
                            onClick={() => setUseDeployedUrl(true)}
                            className={`p-1 rounded transition-colors ${useDeployedUrl ? 'bg-blue-100 text-blue-600' : 'text-gray-500 hover:text-gray-700'}`}
                            title="Deployed URL (permanent)"
                        >
                            <Cloud className="w-3.5 h-3.5" />
                        </button>
                    </div>
                )}
                
                <div 
                    onClick={onCopy}
                    className="flex-1 flex items-center gap-2 px-3 py-1.5 bg-white border rounded-md cursor-pointer hover:bg-gray-50 transition-colors"
                >
                    {/* Status indicator */}
                    {isDeployed && useDeployedUrl && (
                        <span className="px-1.5 py-0.5 text-xs font-medium bg-green-100 text-green-700 rounded">
                            Deployed
                        </span>
                    )}
                    {data.deploymentStatus === 'PENDING' && (
                        <span className="px-1.5 py-0.5 text-xs font-medium bg-yellow-100 text-yellow-700 rounded">
                            Deploying...
                        </span>
                    )}
                    {data.deploymentStatus === 'FAILED' && (
                        <span className="px-1.5 py-0.5 text-xs font-medium bg-red-100 text-red-700 rounded" title={data.deploymentError || 'Deployment failed'}>
                            Failed
                        </span>
                    )}
                    
                    <span className="text-sm text-gray-600 truncate flex-1">
                        {currentUrl}
                    </span>
                    {copied && (
                        <Check className="w-4 h-4 text-green-600" />
                    )}
                </div>
                
                <button
                    onClick={() => window.open(currentUrl, '_blank')}
                    className="btn-icon"
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
                    key={`${fragmentKey}-${currentUrl}`}
                    className={`w-full h-full transition-opacity duration-500 ${isLoading ? 'opacity-0' : 'opacity-100'}`}
                    sandbox="allow-forms allow-scripts allow-same-origin"
                    src={currentUrl}
                    onLoad={() => setIsLoading(false)}
                    onError={() => {
                        setIsLoading(false);
                        toast.error("Preview failed to load. Try refreshing.");
                    }}
                />
            </div>
        </div>
    )
}