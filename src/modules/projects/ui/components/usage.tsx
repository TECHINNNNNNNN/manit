import { formatDuration, intervalToDuration } from "date-fns";
import { CrownIcon } from "lucide-react";
import Link from "next/link";
import { useAuth } from "@clerk/nextjs";
import { useMemo } from "react";

interface UsageProps {
    points: number;
    msBeforeNext: number;
}

export function Usage({ points, msBeforeNext }: UsageProps) {
    const { has } = useAuth();
    const hasProAccess = has?.({ plan: "pro" })

    const resetTime = useMemo(() => {
        try {
            return formatDuration(
                intervalToDuration({
                    start: new Date(),
                    end: new Date(Date.now() + msBeforeNext),
                }),
                { format: ["months", "days", "hours"] }
            )
        } catch (error) {
            console.error("Error formatting duration", error);
            return "unknown";
        }
    }, [msBeforeNext])

    return (
        <div className="rounded-t-xl bg-background border border-b-0 p-2.5">
            <div className="flex items-center justify-between">
                <div>
                    <div className="text-sm">
                        {hasProAccess ? "100" : points} free credits remaining
                    </div>
                    <p className="text-xs text-muted-foreground">
                        Resets in{" "} {resetTime}
                    </p>
                </div>
                {!hasProAccess && <button>
                    <Link href="/pricing">
                        <CrownIcon /> Upgrade
                    </Link>
                </button>}
            </div>
        </div>
    )
}