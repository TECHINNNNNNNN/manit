import { useState, useEffect } from "react";

export const MessageLoading = () => {
    const [step, setStep] = useState(0);

    const steps = [
        "Setting up environment...",
        "Understanding your request...",
        "Writing code...",
        "Testing and optimizing...",
        "Preparing preview..."
    ];

    useEffect(() => {
        //timings totaling ~40 seconds
        const timings = [
            5000,  // Setting up environment (5s)
            6000,  // Understanding request (6s) 
            15000, // Writing code (15s) - longest step
            12000  // Testing and optimizing (12s)
            // Last step "Preparing preview" stays until done
        ];
        let timeoutId: NodeJS.Timeout;

        if (step < 4) {
            timeoutId = setTimeout(() => {
                setStep(prev => prev + 1);
            }, timings[step] || 5000);
        }

        return () => clearTimeout(timeoutId);
    }, [step]);

    return (
        <div className="flex flex-col group px-2 pb-4">
            <div className="flex items-center gap-2 pl-2 mb-2">
                <span className="text-sm font-medium">Manit</span>
                <span className="text-xs text-muted-foreground">
                    Step {step + 1} of {steps.length}
                </span>
            </div>
            <div className="pl-8.5 flex items-center gap-2">
                <div className="flex items-center gap-1">
                    <div className="w-2 h-2 bg-blue-500 rounded-full animate-pulse" />
                    <div className="w-2 h-2 bg-blue-500 rounded-full animate-pulse delay-75" />
                    <div className="w-2 h-2 bg-blue-500 rounded-full animate-pulse delay-150" />
                </div>
                <span className="text-sm text-muted-foreground transition-all duration-300">
                    {steps[step]}
                </span>
            </div>
            {/* Simple progress bar */}
            <div className="pl-8.5 mt-2">
                <div className="w-48 h-1 bg-gray-200 rounded-full overflow-hidden">
                    <div
                        className="h-full bg-blue-500 transition-all duration-500 ease-out"
                        style={{ width: `${((step + 1) / steps.length) * 100}%` }}
                    />
                </div>
            </div>
        </div>
    )
}