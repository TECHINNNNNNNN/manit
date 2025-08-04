"use client";

import { ErrorBoundary } from "react-error-boundary";
import { ReactNode } from "react";

interface Props {
    children: ReactNode;
}

export const ClientErrorBoundary = ({ children }: Props) => {
    return (
        <ErrorBoundary fallback={<div>Error</div>}>
            {children}
        </ErrorBoundary>
    );
};