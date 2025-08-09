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
    Share2,
    Globe
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
                    text: 'Deploying... (up to 2 min)', 
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
            
            {/* Share Actions - Show when deploying or deployed */}
            {(status === 'DEPLOYED' || status === 'DEPLOYING') && shareUrl && (
                <>
                    {/* Copy Short URL */}
                    <Button
                        size="sm"
                        variant="outline"
                        onClick={() => copyToClipboard(
                            shareUrl, 
                            status === 'DEPLOYING' 
                                ? "URL copied! Site will be live in ~2 minutes" 
                                : "Short URL copied!"
                        )}
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
                                <svg className="w-4 h-4" viewBox="0 0 24 24" fill="currentColor">
                                    <path d="M18.244 2.25h3.308l-7.227 8.26 8.502 11.24H16.17l-5.214-6.817L4.99 21.75H1.68l7.73-8.835L1.254 2.25H8.08l4.713 6.231zm-1.161 17.52h1.833L7.084 4.126H5.117z"/>
                                </svg>
                                Share on X
                            </DropdownMenuItem>
                            
                            <DropdownMenuItem 
                                onClick={() => {
                                    // LinkedIn sharing - using mini=true for better compatibility
                                    // LinkedIn sometimes ignores the URL in share-offsite, so we include it in the summary
                                    const linkedinUrl = `https://www.linkedin.com/sharing/share-offsite/?mini=true&url=${encodeURIComponent(shareUrl)}&title=${encodeURIComponent(projectName)}&summary=${encodeURIComponent(shareText)}&source=${encodeURIComponent('Manit')}`;
                                    window.open(linkedinUrl, '_blank');
                                }}
                                className="gap-2"
                            >
                                <svg className="w-4 h-4" viewBox="0 0 24 24" fill="currentColor">
                                    <path d="M20.447 20.452h-3.554v-5.569c0-1.328-.027-3.037-1.852-3.037-1.853 0-2.136 1.445-2.136 2.939v5.667H9.351V9h3.414v1.561h.046c.477-.9 1.637-1.85 3.37-1.85 3.601 0 4.267 2.37 4.267 5.455v6.286zM5.337 7.433c-1.144 0-2.063-.926-2.063-2.065 0-1.138.92-2.063 2.063-2.063 1.14 0 2.064.925 2.064 2.063 0 1.139-.925 2.065-2.064 2.065zm1.782 13.019H3.555V9h3.564v11.452zM22.225 0H1.771C.792 0 0 .774 0 1.729v20.542C0 23.227.792 24 1.771 24h20.451C23.2 24 24 23.227 24 22.271V1.729C24 .774 23.2 0 22.222 0h.003z"/>
                                </svg>
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
                                        <svg className="w-4 h-4" viewBox="0 0 24 24" fill="currentColor">
                                            <path d="M12 0c-6.626 0-12 5.373-12 12 0 5.302 3.438 9.8 8.207 11.387.599.111.793-.261.793-.577v-2.234c-3.338.726-4.033-1.416-4.033-1.416-.546-1.387-1.333-1.756-1.333-1.756-1.089-.745.083-.729.083-.729 1.205.084 1.839 1.237 1.839 1.237 1.07 1.834 2.807 1.304 3.492.997.107-.775.418-1.305.762-1.604-2.665-.305-5.467-1.334-5.467-5.931 0-1.311.469-2.381 1.236-3.221-.124-.303-.535-1.524.117-3.176 0 0 1.008-.322 3.301 1.23.957-.266 1.983-.399 3.003-.404 1.02.005 2.047.138 3.006.404 2.291-1.552 3.297-1.23 3.297-1.23.653 1.653.242 2.874.118 3.176.77.84 1.235 1.911 1.235 3.221 0 4.609-2.807 5.624-5.479 5.921.43.372.823 1.102.823 2.222v3.293c0 .319.192.694.801.576 4.765-1.589 8.199-6.086 8.199-11.386 0-6.627-5.373-12-12-12z"/>
                                        </svg>
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