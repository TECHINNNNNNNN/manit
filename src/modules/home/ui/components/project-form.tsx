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
    isPersonal: z.boolean(),
    organizationName: z.string().optional(),
    businessType: z.string().optional(),
    targetAudience: z.string().optional(),
    links: z.array(z.object({
        platform: z.string().min(1, { message: "Platform name required" }),
        url: z.string().url({ message: "Valid URL required" })
    })).min(1, { message: "At least one link required" }),
    styleDescription: z.string()
        .min(10, { message: "Please describe your preferred style (min 10 characters)" })
        .max(500, { message: "Style description too long (max 500 characters)" }),
}).superRefine((data, ctx) => {
    // Only validate organization fields when Organization is selected
    if (!data.isPersonal) {
        if (!data.organizationName || data.organizationName.trim().length === 0) {
            ctx.addIssue({
                code: z.ZodIssueCode.custom,
                message: "Organization name is required",
                path: ["organizationName"]
            });
        }
        if (!data.businessType || data.businessType.trim().length === 0) {
            ctx.addIssue({
                code: z.ZodIssueCode.custom,
                message: "Business type is required",
                path: ["businessType"]
            });
        }
    }
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
        reValidateMode: "onChange", // Re-validate on every change after error
        defaultValues: {
            isPersonal: true,
            organizationName: "",
            businessType: "",
            targetAudience: "",
            links: [{ platform: "", url: "" }], // Start with one empty link
            styleDescription: "",
        }
    })

    const trpc = useTRPC();
    const queryClient = useQueryClient();

    const createProject = useMutation(trpc.projects.create.mutationOptions({
        onSuccess: (data) => {
            toast.success("🎉 Linktree created! Redirecting...");
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
                toast.info("No credits left. Redirecting to pricing...");
                router.push("/pricing");
            }
            if (error.data?.code === "UNAUTHORIZED") {
                toast.info("Please sign in to continue");
                clerk.openSignIn();
            }
            toast.error(error.message);
        }
    }))

    const isPending = createProject.isPending;
    const isDisabled = isPending || isRedirecting || !form.formState.isValid;


    const onSubmit = async (values: z.infer<typeof formSchema>) => {
        // Build context section based on personal/organization
        const contextSection = values.isPersonal 
            ? "Personal linktree page"
            : `Business linktree for ${values.organizationName} (${values.businessType})${
                values.targetAudience ? `. Target audience: ${values.targetAudience}` : ''
              }`;
        
        // Combine links into formatted section
        const linksSection = values.links
            .map(link => `${link.platform}: ${link.url}`)
            .join('\n');
        
        const prompt = `Create a linktree page:\nContext: ${contextSection}\nLinks:\n${linksSection}\n\nStyle: ${values.styleDescription}`;
        
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
                        "relative glass p-4 rounded-xl transition-all duration-200",
                        isFocused && "shadow-xs",
                        showUsage && "rounded-t-none",
                        (isPending || isRedirecting) && "opacity-75"
                    )}
                >
                    <div className="space-y-4">
                        {/* Personal/Organization Toggle */}
                        <div className="space-y-2">
                            <h3 className="text-sm font-medium">Profile Type</h3>
                            <div className="flex gap-2">
                                <button
                                    type="button"
                                    onClick={() => {
                                        form.setValue('isPersonal', true);
                                        form.setValue('organizationName', '');
                                        form.setValue('businessType', '');
                                        form.setValue('targetAudience', '');
                                        // Trigger validation to clear any errors
                                        form.trigger();
                                    }}
                                    disabled={isPending || isRedirecting}
                                    className={cn(
                                        "flex-1 px-4 py-2.5 rounded-lg transition-all duration-200 font-medium border",
                                        form.watch('isPersonal') 
                                            ? "bg-gradient-to-r from-orange-500/20 to-amber-500/20 border-orange-500/30 text-orange-400" 
                                            : "bg-transparent border-white/10 text-muted-foreground hover:bg-white/5 hover:text-foreground hover:border-white/20"
                                    )}
                                >
                                    Personal
                                </button>
                                <button
                                    type="button"
                                    onClick={() => {
                                        form.setValue('isPersonal', false);
                                        // Trigger validation to check organization fields
                                        form.trigger();
                                    }}
                                    disabled={isPending || isRedirecting}
                                    className={cn(
                                        "flex-1 px-4 py-2.5 rounded-lg transition-all duration-200 font-medium border",
                                        !form.watch('isPersonal') 
                                            ? "bg-gradient-to-r from-orange-500/20 to-amber-500/20 border-orange-500/30 text-orange-400" 
                                            : "bg-transparent border-white/10 text-muted-foreground hover:bg-white/5 hover:text-foreground hover:border-white/20"
                                    )}
                                >
                                    Organization
                                </button>
                            </div>
                        </div>

                        {/* Organization Fields (conditional) */}
                        {!form.watch('isPersonal') && (
                            <div className="space-y-2 p-3 glass rounded-lg">
                                <div className="space-y-2">
                                    <div className="flex justify-between items-baseline">
                                        <label className="text-sm font-medium">Organization Name *</label>
                                        <span className={`text-xs ${
                                            (form.watch("organizationName")?.length ?? 0) > 100 ? "text-red-500" : 
                                            (form.watch("organizationName")?.length ?? 0) > 0 ? "text-green-500" : "text-muted-foreground"
                                        }`}>
                                            {form.watch("organizationName")?.length || 0}/100
                                        </span>
                                    </div>
                                    <input
                                        {...form.register('organizationName')}
                                        placeholder="e.g., Acme Corp, Creative Studio"
                                        disabled={isPending || isRedirecting}
                                        className={cn(
                                            "w-full px-3 py-2 border rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500",
                                            form.watch('organizationName') && form.watch('organizationName')!.length > 0 && "border-green-500"
                                        )}
                                    />
                                </div>
                                
                                <div className="space-y-2">
                                    <div className="flex justify-between items-baseline">
                                        <label className="text-sm font-medium">Business Type *</label>
                                        <span className={`text-xs ${
                                            (form.watch("businessType")?.length ?? 0) > 100 ? "text-red-500" : 
                                            (form.watch("businessType")?.length ?? 0) > 0 ? "text-green-500" : "text-muted-foreground"
                                        }`}>
                                            {form.watch("businessType")?.length || 0}/100
                                        </span>
                                    </div>
                                    <input
                                        {...form.register('businessType')}
                                        placeholder="e.g., E-commerce, SaaS, Restaurant, Consulting..."
                                        disabled={isPending || isRedirecting}
                                        className={cn(
                                            "w-full px-3 py-2 border rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500",
                                            form.watch('businessType') && form.watch('businessType')!.length > 0 && "border-green-500"
                                        )}
                                    />
                                </div>
                                
                                <div className="space-y-2">
                                    <div className="flex justify-between items-baseline">
                                        <label className="text-sm font-medium">Target Audience (optional)</label>
                                        <span className={`text-xs ${
                                            (form.watch("targetAudience")?.length ?? 0) > 200 ? "text-red-500" : "text-muted-foreground"
                                        }`}>
                                            {form.watch("targetAudience")?.length || 0}/200
                                        </span>
                                    </div>
                                    <TextareaAutosize
                                        {...form.register('targetAudience')}
                                        disabled={isPending || isRedirecting}
                                        placeholder="e.g., Young professionals, Tech enthusiasts, Local community..."
                                        className="w-full px-3 py-2.5 rounded-lg bg-input border border-white/10 resize-none input-glow transition-all duration-200 placeholder:text-muted-foreground/50"
                                        minRows={1}
                                        maxRows={2}
                                    />
                                </div>
                            </div>
                        )}

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
                                className="w-full px-3 py-3 rounded-lg bg-input border border-white/10 resize-none input-glow transition-all duration-200 placeholder:text-muted-foreground/50"
                                minRows={2}
                                maxRows={5}
                            />
                            {form.watch("styleDescription")?.length > 0 && form.watch("styleDescription")?.length < 10 && (
                                <p className="text-xs text-amber-500">Need at least {10 - form.watch("styleDescription").length} more characters</p>
                            )}
                            
                            {/* Example style tags */}
                            <div className="flex flex-wrap gap-2 mt-3">
                                <button
                                    type="button"
                                    onClick={() => form.setValue("styleDescription", "Minimalist design with clean lines and monochrome colors")}
                                    className="btn-tag"
                                    disabled={isPending || isRedirecting}
                                >
                                    <span className="w-2 h-2 rounded-full bg-white/50"></span>
                                    Minimalist
                                </button>
                                <button
                                    type="button"
                                    onClick={() => form.setValue("styleDescription", "Vibrant neon colors with cyberpunk aesthetic and glowing effects")}
                                    className="btn-tag"
                                    disabled={isPending || isRedirecting}
                                >
                                    <span className="w-2 h-2 rounded-full bg-purple-400"></span>
                                    Cyberpunk
                                </button>
                                <button
                                    type="button"
                                    onClick={() => form.setValue("styleDescription", "Professional corporate style with blue tones and clean typography")}
                                    className="btn-tag"
                                    disabled={isPending || isRedirecting}
                                >
                                    <span className="w-2 h-2 rounded-full bg-blue-400"></span>
                                    Professional
                                </button>
                                <button
                                    type="button"
                                    onClick={() => form.setValue("styleDescription", "Playful and colorful design with rounded corners and fun animations")}
                                    className="btn-tag"
                                    disabled={isPending || isRedirecting}
                                >
                                    <span className="w-2 h-2 rounded-full bg-pink-400"></span>
                                    Playful
                                </button>
                            </div>
                        </div>

                        {/* Show validation errors */}
                        {form.formState.errors.organizationName && (
                            <p className="text-sm text-red-500">
                                {form.formState.errors.organizationName.message}
                            </p>
                        )}
                        {form.formState.errors.businessType && (
                            <p className="text-sm text-red-500">
                                {form.formState.errors.businessType.message}
                            </p>
                        )}
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