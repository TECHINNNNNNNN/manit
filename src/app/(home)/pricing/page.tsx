/**
 * COMPONENT: PricingPage
 * PURPOSE: Pricing page with dark theme styling for Clerk PricingTable
 * FLOW: Dark background container with glass morphism effects
 * DEPENDENCIES: @clerk/nextjs
 */
"use client";

import { PricingTable } from "@clerk/nextjs";

const Page = () => {
    return (
        <div className="min-h-screen bg-background p-4">
            <div className="max-w-7xl mx-auto">
                <div className="text-center mb-12">
                    <h1 className="text-4xl font-display text-gradient-primary mb-4">
                        Choose Your Plan
                    </h1>
                    <p className="text-muted-foreground text-lg font-ui font-light">
                        Select the perfect plan for your project needs
                    </p>
                </div>
                <div className="glass rounded-3xl p-8 glow-primary">
                    <PricingTable 
                        appearance={{
                            elements: {
                                card: "glass hover:glass-hover border-border",
                                cardBox: "bg-transparent",
                                headerTitle: "text-foreground",
                                headerSubtitle: "text-muted-foreground",
                                badge: "bg-primary text-primary-foreground",
                                price: "text-foreground",
                                priceCurrency: "text-muted-foreground",
                                priceInterval: "text-muted-foreground",
                                featureListItem: "text-foreground",
                                button: "btn-primary",
                                buttonSecondary: "btn-secondary"
                            }
                        }}
                    />
                </div>
            </div>
        </div>
    )
}

export default Page;