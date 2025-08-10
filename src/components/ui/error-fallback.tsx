/**
 * COMPONENT: ErrorFallback
 * PURPOSE: User-friendly error display with recovery options
 * FLOW: Shows contextual error message and retry button
 * DEPENDENCIES: lucide-react for icons
 */

import { AlertCircle, RefreshCw, WifiOff } from "lucide-react";
import { FallbackProps } from "react-error-boundary";

export const ErrorFallback = ({ error, resetErrorBoundary }: FallbackProps) => {
    // Detect if user is offline
    const isOffline = !navigator.onLine;
    
    // Determine error type and message
    const getErrorInfo = () => {
        if (isOffline) {
            return {
                title: "You're offline",
                message: "Please check your internet connection and try again.",
                icon: <WifiOff className="w-8 h-8 text-gray-400" />
            };
        }
        
        // Check for specific error types
        if (error?.message?.includes("fetch")) {
            return {
                title: "Connection issue",
                message: "We couldn't load the data. Please try again.",
                icon: <AlertCircle className="w-8 h-8 text-orange-500" />
            };
        }
        
        if (error?.message?.includes("permission") || error?.message?.includes("auth")) {
            return {
                title: "Access denied",
                message: "You don't have permission to view this content.",
                icon: <AlertCircle className="w-8 h-8 text-red-500" />
            };
        }
        
        // Default error
        return {
            title: "Something went wrong",
            message: "An unexpected error occurred. Please try again.",
            icon: <AlertCircle className="w-8 h-8 text-red-500" />
        };
    };
    
    const { title, message, icon } = getErrorInfo();
    
    // Log error in development
    if (process.env.NODE_ENV === "development") {
        console.error("Error caught by boundary:", error);
    }
    
    return (
        <div className="flex flex-col items-center justify-center min-h-[200px] p-6 text-center">
            {icon}
            <h3 className="mt-4 text-lg font-ui font-semibold text-gray-900">{title}</h3>
            <p className="mt-2 text-sm text-gray-600 max-w-md font-ui">{message}</p>
            
            <button
                onClick={resetErrorBoundary}
                className="mt-4 btn-primary"
            >
                <RefreshCw className="w-4 h-4" />
                <span className="font-ui">Try Again</span>
            </button>
            
            {/* Show error details in development */}
            {process.env.NODE_ENV === "development" && error?.message && (
                <details className="mt-4 text-left">
                    <summary className="text-xs text-gray-500 cursor-pointer font-ui">
                        Error details
                    </summary>
                    <pre className="mt-2 p-2 bg-gray-100 rounded text-xs overflow-auto max-w-md font-mono">
                        {error.message}
                    </pre>
                </details>
            )}
        </div>
    );
};