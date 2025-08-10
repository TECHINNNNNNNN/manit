"use client";

import { UserControl } from "@/components/ui/user-control";
import { SignedIn, SignedOut, SignInButton, SignUpButton } from "@clerk/nextjs";
import Link from "next/link";


export const Navbar = () => {
    return (
        <nav
            className="p-4 bg-transparent flex top-0 left-0 right-0 z-50 transition-all duration-300 border-b border-transparent"
        >
            <div className="max-w-5xl mx-auto flex items-center w-full justify-between">
                <Link href="/" className="flex items-center gap-2">
                    <span className="text-2xl font-brand font-semibold">Manit</span>
                </Link>
                <SignedOut>
                    <div className="flex gap-2">
                        <SignUpButton>
                            <button className="bg-primary text-white px-4 py-2 rounded-md cursor-pointer">
                                Sign Up
                            </button>
                        </SignUpButton>
                        <SignInButton>
                            <button className="bg-primary text-white px-4 py-2 rounded-md cursor-pointer">
                                Sign In
                            </button>
                        </SignInButton>
                    </div>
                </SignedOut>
                <SignedIn>
                    <UserControl showName />
                </SignedIn>
            </div>
        </nav>
    )
}