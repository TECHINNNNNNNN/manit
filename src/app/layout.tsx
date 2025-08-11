import type { Metadata } from "next";
import { Geist, Geist_Mono } from "next/font/google";
import localFont from "next/font/local";
import "./globals.css";
import { TRPCReactProvider } from "@/trpc/client";
import { Toaster } from "sonner";
import { ClerkProvider } from "@clerk/nextjs";
import { AnimatedBackground } from "@/components/ui/animated-background";

const geistSans = Geist({
  variable: "--font-geist-sans",
  subsets: ["latin"],
});

const geistMono = Geist_Mono({
  variable: "--font-geist-mono",
  subsets: ["latin"],
});

/**
 * FONT CONFIGURATION
 * PURPOSE: Typography hierarchy for vibrant dark theme
 * FLOW: Display > Brand > UI > Body > Code
 * DEPENDENCIES: Local font files in /public/font
 */

// Display font for hero headlines - warm & engaging
const pacifico = localFont({
  src: "../../public/font/Pacifico-Regular.ttf",
  variable: "--font-pacifico",
  display: "swap",
  weight: "400",
});

// Brand font for logo & special headings - friendly yet professional
const playpenSans = localFont({
  src: "../../public/font/PlaypenSans-VariableFont_wght.ttf",
  variable: "--font-playpen",
  display: "swap",
  weight: "300 800",
});

// UI font for interface elements - modern & clean
const plusJakarta = localFont({
  src: [
    {
      path: "../../public/font/PlusJakartaSans-VariableFont_wght.ttf",
      style: "normal",
    },
    {
      path: "../../public/font/PlusJakartaSans-Italic-VariableFont_wght.ttf",
      style: "italic",
    },
  ],
  variable: "--font-plus-jakarta",
  display: "swap",
  weight: "200 800",
});

const appUrl = process.env.NEXT_PUBLIC_APP_URL || "http://localhost:3000";

export const metadata: Metadata = {
  title: "Manit AI - AI-Powered Linktree Generator",
  description: "Create stunning, personalized link-in-bio pages instantly with AI. Just describe your vision and Manit builds your perfect linktree in seconds - no coding required.",
  keywords: ["linktree", "AI", "link in bio", "social media links", "creator tools", "AI generator", "bio link", "link page", "social media", "content creator"],
  authors: [{ name: "Manit AI" }],
  creator: "Manit AI",
  publisher: "Manit AI",
  metadataBase: new URL(appUrl),
  robots: {
    index: true,
    follow: true,
    googleBot: {
      index: true,
      follow: true,
      "max-video-preview": -1,
      "max-image-preview": "large",
      "max-snippet": -1,
    },
  },
  openGraph: {
    title: "Manit AI - AI-Powered Linktree Generator",
    description: "Create stunning link-in-bio pages instantly with AI. Just describe what you want and watch the magic happen.",
    url: appUrl,
    siteName: "Manit AI",
    type: "website",
    locale: "en_US",
    images: [
      {
        url: "/og-image.png",
        width: 1200,
        height: 630,
        alt: "Manit AI - Create AI-Powered Linktrees",
      },
    ],
  },
  twitter: {
    card: "summary_large_image",
    title: "Manit AI - AI-Powered Linktree Generator",
    description: "Create stunning link-in-bio pages instantly with AI. Just describe what you want and watch the magic happen.",
    images: ["/og-image.png"],
    creator: "@manitai",
  },
  alternates: {
    canonical: appUrl,
  },
  category: "Technology",
};

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <ClerkProvider>
      <TRPCReactProvider>
        <html lang="en">
          <body
            className={`${geistSans.variable} ${geistMono.variable} ${pacifico.variable} ${playpenSans.variable} ${plusJakarta.variable} antialiased`}
          >
            <AnimatedBackground />
            <Toaster />
            {children}
          </body>
        </html>
      </TRPCReactProvider>
    </ClerkProvider>
  );
}
