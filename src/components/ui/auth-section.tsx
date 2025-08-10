"use client";

import { CrownIcon } from "lucide-react";
import Link from "next/link";
import { UserControl } from "./user-control";

interface Props {
    hasProAccess: boolean;
}

export const AuthSection = ({ hasProAccess }: Props) => {
    return (
        <div className="ml-auto flex items-center gap-x-2">
            {!hasProAccess && (
                <button>
                    <Link href="/pricing" className="flex items-center gap-x-2">
                        <CrownIcon />
                        <span className="font-ui">Upgrade</span>
                    </Link>
                </button>
            )}
            <UserControl />
        </div>
    );
};