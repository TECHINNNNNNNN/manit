/**
 * COMPONENT: SignUpPage
 * PURPOSE: Sign-up page with glass morphism container for Clerk authentication
 * FLOW: Dark theme wrapper around Clerk SignUp component
 * DEPENDENCIES: @clerk/nextjs
 */
import { SignUp } from '@clerk/nextjs'

export default function Page() {
    return (
        <div className="min-h-screen bg-background flex items-center justify-center p-4">
            <div className="glass glow-primary rounded-2xl p-8 w-full max-w-md">
                <SignUp 
                    appearance={{
                        elements: {
                            card: "bg-transparent shadow-none border-none",
                            headerTitle: "text-foreground text-2xl font-semibold",
                            headerSubtitle: "text-muted-foreground",
                            socialButtonsBlockButton: "glass hover:glass-hover text-foreground border-border",
                            dividerLine: "bg-border",
                            dividerText: "text-muted-foreground",
                            formFieldLabel: "text-foreground",
                            formFieldInput: "input-glow bg-input text-foreground border-border focus:border-primary",
                            footerActionLink: "text-primary hover:text-primary/80",
                            identityPreviewText: "text-foreground",
                            formButtonPrimary: "btn-primary"
                        }
                    }}
                />
            </div>
        </div>
    )
}