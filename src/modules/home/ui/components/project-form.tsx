"use client";

import { zodResolver } from "@hookform/resolvers/zod";
import { useForm, useFieldArray } from "react-hook-form";
import TextareaAutosize from "react-textarea-autosize";
import { z } from "zod";
import { useState } from "react";
import { useMutation, useQueryClient } from "@tanstack/react-query";
import { toast } from "sonner";

import { cn } from "@/lib/utils";
import { useTRPC } from "@/trpc/client";
import { useRouter } from "next/navigation";
import { useClerk } from "@clerk/nextjs";
import { Loader2, Check, AlertCircle } from "lucide-react";



const formSchema = z.object({
    links: z.array(z.object({
        platform: z.string().min(1, { message: "Platform name required" }),
        url: z.string().url({ message: "Valid URL required" })
    })).min(1, { message: "At least one link required" }),
    styleDescription: z.string()
        .min(10, { message: "Please describe your preferred style (min 10 characters)" })
        .max(500, { message: "Style description too long (max 500 characters)" }),
})

export const ProjectForm = () => {
    const router = useRouter();
    const [isFocused, setIsFocused] = useState(false);
    const [isRedirecting, setIsRedirecting] = useState(false);
    const showUsage = false;
    const clerk = useClerk()

    const form = useForm<z.infer<typeof formSchema>>({
        resolver: zodResolver(formSchema),
        mode: "onChange", // Enable real-time validation
        defaultValues: {
            links: [{ platform: "", url: "" }], // Start with one empty link
            styleDescription: "",
        }
    })

    const trpc = useTRPC();
    const queryClient = useQueryClient();

    const createProject = useMutation(trpc.projects.create.mutationOptions({
        onSuccess: (data) => {
            setIsRedirecting(true);
            queryClient.invalidateQueries(
                trpc.projects.getMany.queryOptions()
            );
            queryClient.invalidateQueries(
                trpc.usage.status.queryOptions(),
            )
            router.push(`/projects/${data.id}`);
        },
        onError: (error) => {
            if (error.message === "You've run out of credits") {
                router.push("/pricing");
            }
            if (error.data?.code === "UNAUTHORIZED") {
                clerk.openSignIn();
            }
            toast.error(error.message);
        }
    }))

    const isPending = createProject.isPending;
    const isDisabled = isPending || isRedirecting || !form.formState.isValid;


    const onSubmit = async (values: z.infer<typeof formSchema>) => {
        // Combine links and style into a single prompt
        const linksSection = values.links
            .map(link => `${link.platform}: ${link.url}`)
            .join('\n');
        
        const prompt = `Create a linktree page with these links:\n${linksSection}\n\nStyle: ${values.styleDescription}`;
        
        await createProject.mutateAsync({
            value: prompt,
        })
    }

    // Setup useFieldArray for dynamic links
    const { fields, append, remove } = useFieldArray({
        control: form.control,
        name: "links",
    });

    const addLink = () => {
        append({ platform: "", url: "" });
    };

    return (
        <>
            <section className="space-y-6" id="create-form">
                <form
                    onSubmit={form.handleSubmit(onSubmit)}
                    className={cn(
                        "relative border p-4 rounded-xl transition-all duration-200",
                        isFocused && "shadow-xs",
                        showUsage && "rounded-t-none",
                        (isPending || isRedirecting) && "opacity-75"
                    )}
                >
                    <div className="space-y-4">
                        {/* Links Section */}
                        <div className="space-y-2">
                            <h3 className="text-sm font-medium">Your Links</h3>
                            {fields.map((field, index) => {
                                const urlValue = form.watch(`links.${index}.url`);
                                const platformValue = form.watch(`links.${index}.platform`);
                                const urlError = form.formState.errors.links?.[index]?.url;
                                const isValidUrl = urlValue && !urlError && urlValue.startsWith('http');
                                
                                return (
                                    <div key={field.id} className="space-y-1">
                                        <div className="flex gap-2">
                                            <input
                                                {...form.register(`links.${index}.platform`)}
                                                placeholder="Platform (e.g., Instagram)"
                                                disabled={isPending || isRedirecting}
                                                className={cn(
                                                    "flex-1 px-3 py-2 border rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500",
                                                    platformValue && platformValue.length > 0 && "border-green-500"
                                                )}
                                            />
                                            <div className="relative flex-1">
                                                <input
                                                    {...form.register(`links.${index}.url`)}
                                                    placeholder="URL (e.g., https://instagram.com/username)"
                                                    disabled={isPending || isRedirecting}
                                                    className={cn(
                                                        "w-full px-3 py-2 pr-8 border rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500",
                                                        isValidUrl && "border-green-500",
                                                        urlError && urlValue && "border-red-500"
                                                    )}
                                                />
                                                {isValidUrl && (
                                                    <Check className="absolute right-2 top-2.5 w-4 h-4 text-green-500" />
                                                )}
                                                {urlError && urlValue && (
                                                    <AlertCircle className="absolute right-2 top-2.5 w-4 h-4 text-red-500" />
                                                )}
                                            </div>
                                            {fields.length > 1 && (
                                                <button
                                                    type="button"
                                                    onClick={() => remove(index)}
                                                    disabled={isPending || isRedirecting}
                                                    className="px-3 py-2 text-red-600 hover:text-red-800"
                                                >
                                                    Remove
                                                </button>
                                            )}
                                        </div>
                                        {urlError && urlValue && (
                                            <p className="text-xs text-red-500 pl-1">Please enter a valid URL starting with http:// or https://</p>
                                        )}
                                    </div>
                                )
                            })}
                            <button
                                type="button"
                                onClick={addLink}
                                disabled={isPending || isRedirecting}
                                className="w-full px-3 py-2 border border-dashed border-gray-300 rounded-md hover:border-gray-400 text-gray-600"
                            >
                                + Add Another Link
                            </button>
                        </div>

                        {/* Style Description */}
                        <div className="space-y-2">
                            <div className="flex justify-between items-baseline">
                                <h3 className="text-sm font-medium">Style Preferences</h3>
                                <span className={`text-xs ${
                                    form.watch("styleDescription")?.length > 500 ? "text-red-500" :
                                    form.watch("styleDescription")?.length >= 10 ? "text-green-500" : 
                                    "text-gray-400"
                                }`}>
                                    {form.watch("styleDescription")?.length || 0}/500
                                </span>
                            </div>
                            <TextareaAutosize
                                {...form.register("styleDescription")}
                                disabled={isPending || isRedirecting}
                                placeholder="Describe your preferred style (e.g., minimalist black and white, neon cyberpunk, professional blue...)"
                                onFocus={() => setIsFocused(true)}
                                onBlur={() => setIsFocused(false)}
                                className="w-full px-3 py-2 border rounded-md resize-none focus:outline-none focus:ring-2 focus:ring-blue-500"
                                minRows={2}
                                maxRows={5}
                            />
                            {form.watch("styleDescription")?.length > 0 && form.watch("styleDescription")?.length < 10 && (
                                <p className="text-xs text-amber-500">Need at least {10 - form.watch("styleDescription").length} more characters</p>
                            )}
                        </div>

                        {/* Show validation errors */}
                        {form.formState.errors.links && (
                            <p className="text-sm text-red-500">
                                {form.formState.errors.links.message}
                            </p>
                        )}
                        {form.formState.errors.styleDescription && (
                            <p className="text-sm text-red-500">
                                {form.formState.errors.styleDescription.message}
                            </p>
                        )}

                        {/* Submit button */}
                        <div className="flex justify-end">
                            <button
                                type="submit"
                                disabled={isDisabled}
                            >
                                {(isPending || isRedirecting) && <Loader2 className="h-4 w-4 animate-spin" />}
                                {isPending ? "Creating..." : isRedirecting ? "Redirecting..." : "Create Linktree"}
                            </button>
                        </div>
                    </div>
                </form>
            </section>
        </>
    )
}