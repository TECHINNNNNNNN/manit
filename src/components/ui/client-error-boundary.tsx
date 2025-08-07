"use client";

import { ErrorBoundary } from "react-error-boundary";
import { ReactNode } from "react";
import { ErrorFallback } from "./error-fallback";

interface Props {
    children: ReactNode;
}

export const ClientErrorBoundary = ({ children }: Props) => {
    return (
        <ErrorBoundary FallbackComponent={ErrorFallback}>
            {children}
        </ErrorBoundary>
    );
};