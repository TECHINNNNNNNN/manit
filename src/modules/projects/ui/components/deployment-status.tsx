/**
 * COMPONENT: DeploymentStatus
 * PURPOSE: Display deployment status and share options for projects
 * FLOW: Show status → Provide share URLs → Copy/QR actions
 * DEPENDENCIES: Project deployment data, URL shortener
 */

import { DeploymentStatus as Status } from "@/generated/prisma";
import { useState } from "react";
import { 
    ExternalLink, 
    Check, 
    Loader2, 
    Link2, 
    QrCode,
    Twitter,
    Linkedin,
    Share2,
    Globe,
    Github
} from "lucide-react";
import { toast } from "sonner";
import {
    DropdownMenu,
    DropdownMenuContent,
    DropdownMenuItem,
    DropdownMenuSeparator,
    DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";
import { Button } from "@/components/ui/button";
import {
    Dialog,
    DialogContent,
    DialogHeader,
    DialogTitle,
} from "@/components/ui/dialog";

interface Props {
    status: Status;
    deploymentUrl?: string | null;
    shortUrl?: string | null;
    githubRepo?: string | null;
    projectName: string;
}

export const DeploymentStatusDisplay = ({ 
    status, 
    deploymentUrl, 
    shortUrl, 
    githubRepo,
    projectName 
}: Props) => {
    const [copied, setCopied] = useState(false);
    const [showQR, setShowQR] = useState(false);
    
    const getStatusDisplay = () => {
        switch (status) {
            case 'PENDING':
                return { 
                    text: 'Not deployed', 
                    color: 'text-gray-500', 
                    icon: <Globe className="w-4 h-4 text-gray-400" />,
                    bg: 'bg-gray-50'
                };
            case 'DEPLOYING':
                return { 
                    text: 'Deploying...', 
                    color: 'text-yellow-600', 
                    icon: <Loader2 className="w-4 h-4 animate-spin text-yellow-600" />,
                    bg: 'bg-yellow-50'
                };
            case 'DEPLOYED':
                return { 
                    text: 'Live', 
                    color: 'text-green-600', 
                    icon: <Check className="w-4 h-4 text-green-600" />,
                    bg: 'bg-green-50'
                };
            case 'FAILED':
                return { 
                    text: 'Failed', 
                    color: 'text-red-600', 
                    icon: <ExternalLink className="w-4 h-4 text-red-600" />,
                    bg: 'bg-red-50'
                };
        }
    };
    
    const copyToClipboard = (text: string, message: string) => {
        navigator.clipboard.writeText(text);
        toast.success(message);
        setCopied(true);
        setTimeout(() => setCopied(false), 2000);
    };
    
    const shareUrl = shortUrl || deploymentUrl;
    const shareText = `Check out my linktree: ${projectName}`;
    
    const { text, color, icon, bg } = getStatusDisplay();
    
    return (
        <div className="flex items-center gap-2">
            {/* Status Badge */}
            <div className={`flex items-center gap-1.5 px-2 py-1 rounded-md ${bg}`}>
                {icon}
                <span className={`text-sm font-medium ${color}`}>{text}</span>
            </div>
            
            {/* Share Actions - Only show when deployed */}
            {status === 'DEPLOYED' && shareUrl && (
                <>
                    {/* Copy Short URL */}
                    <Button
                        size="sm"
                        variant="outline"
                        onClick={() => copyToClipboard(shareUrl, "Short URL copied!")}
                        className="gap-1.5"
                    >
                        {copied ? (
                            <Check className="w-3.5 h-3.5 text-green-600" />
                        ) : (
                            <Link2 className="w-3.5 h-3.5" />
                        )}
                        Copy Link
                    </Button>
                    
                    {/* Share Menu */}
                    <DropdownMenu>
                        <DropdownMenuTrigger asChild>
                            <Button size="sm" variant="outline" className="gap-1.5">
                                <Share2 className="w-3.5 h-3.5" />
                                Share
                            </Button>
                        </DropdownMenuTrigger>
                        <DropdownMenuContent align="end" className="w-56">
                            <DropdownMenuItem 
                                onClick={() => setShowQR(true)}
                                className="gap-2"
                            >
                                <QrCode className="w-4 h-4" />
                                Show QR Code
                            </DropdownMenuItem>
                            
                            <DropdownMenuSeparator />
                            
                            <DropdownMenuItem 
                                onClick={() => window.open(
                                    `https://twitter.com/intent/tweet?text=${encodeURIComponent(shareText)}&url=${encodeURIComponent(shareUrl)}`,
                                    '_blank'
                                )}
                                className="gap-2"
                            >
                                <Twitter className="w-4 h-4" />
                                Share on Twitter
                            </DropdownMenuItem>
                            
                            <DropdownMenuItem 
                                onClick={() => window.open(
                                    `https://www.linkedin.com/sharing/share-offsite/?url=${encodeURIComponent(shareUrl)}`,
                                    '_blank'
                                )}
                                className="gap-2"
                            >
                                <Linkedin className="w-4 h-4" />
                                Share on LinkedIn
                            </DropdownMenuItem>
                            
                            {githubRepo && (
                                <>
                                    <DropdownMenuSeparator />
                                    <DropdownMenuItem 
                                        onClick={() => window.open(
                                            `https://github.com/${process.env.NEXT_PUBLIC_GITHUB_USERNAME}/${githubRepo}`,
                                            '_blank'
                                        )}
                                        className="gap-2"
                                    >
                                        <Github className="w-4 h-4" />
                                        View on GitHub
                                    </DropdownMenuItem>
                                </>
                            )}
                        </DropdownMenuContent>
                    </DropdownMenu>
                    
                    {/* View Live Button */}
                    <Button
                        size="sm"
                        onClick={() => window.open(shareUrl, '_blank')}
                        className="gap-1.5"
                    >
                        <ExternalLink className="w-3.5 h-3.5" />
                        View Live
                    </Button>
                </>
            )}
            
            {/* QR Code Dialog */}
            <Dialog open={showQR} onOpenChange={setShowQR}>
                <DialogContent className="sm:max-w-md">
                    <DialogHeader>
                        <DialogTitle>QR Code for {projectName}</DialogTitle>
                    </DialogHeader>
                    <div className="flex flex-col items-center gap-4 py-4">
                        <div className="bg-white p-4 rounded-lg border">
                            <img 
                                src={`https://api.qrserver.com/v1/create-qr-code/?size=256x256&data=${encodeURIComponent(shareUrl)}`}
                                alt="QR Code"
                                className="w-64 h-64"
                            />
                        </div>
                        <p className="text-sm text-gray-600 text-center">
                            Scan this QR code to view your linktree
                        </p>
                        <Button
                            variant="outline"
                            onClick={() => copyToClipboard(shareUrl, "URL copied!")}
                            className="w-full"
                        >
                            {copied ? (
                                <>
                                    <Check className="w-4 h-4 mr-2 text-green-600" />
                                    Copied!
                                </>
                            ) : (
                                <>
                                    <Link2 className="w-4 h-4 mr-2" />
                                    Copy URL
                                </>
                            )}
                        </Button>
                    </div>
                </DialogContent>
            </Dialog>
        </div>
    );
};