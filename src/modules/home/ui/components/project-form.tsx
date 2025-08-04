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
    const showUsage = false;
    const clerk = useClerk()

    const form = useForm<z.infer<typeof formSchema>>({
        resolver: zodResolver(formSchema),
        defaultValues: {
            links: [{ platform: "", url: "" }], // Start with one empty link
            styleDescription: "",
        }
    })

    const trpc = useTRPC();
    const queryClient = useQueryClient();

    const createProject = useMutation(trpc.projects.create.mutationOptions({
        onSuccess: (data) => {
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
    const isDisabled = isPending || !form.formState.isValid;


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
            <section className="space-y-6">
                <form
                    onSubmit={form.handleSubmit(onSubmit)}
                    className={cn(
                        "relative border p-4 rounded-xl transition-all duration-200",
                        isFocused && "shadow-xs",
                        showUsage && "rounded-t-none"
                    )}
                >
                    <div className="space-y-4">
                        {/* Links Section */}
                        <div className="space-y-2">
                            <h3 className="text-sm font-medium">Your Links</h3>
                            {fields.map((field, index) => (
                                <div key={field.id} className="flex gap-2">
                                    <input
                                        {...form.register(`links.${index}.platform`)}
                                        placeholder="Platform (e.g., Instagram)"
                                        disabled={isPending}
                                        className="flex-1 px-3 py-2 border rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
                                    />
                                    <input
                                        {...form.register(`links.${index}.url`)}
                                        placeholder="URL (e.g., https://instagram.com/username)"
                                        disabled={isPending}
                                        className="flex-1 px-3 py-2 border rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
                                    />
                                    {fields.length > 1 && (
                                        <button
                                            type="button"
                                            onClick={() => remove(index)}
                                            disabled={isPending}
                                            className="px-3 py-2 text-red-600 hover:text-red-800"
                                        >
                                            Remove
                                        </button>
                                    )}
                                </div>
                            ))}
                            <button
                                type="button"
                                onClick={addLink}
                                disabled={isPending}
                                className="w-full px-3 py-2 border border-dashed border-gray-300 rounded-md hover:border-gray-400 text-gray-600"
                            >
                                + Add Another Link
                            </button>
                        </div>

                        {/* Style Description */}
                        <div className="space-y-2">
                            <h3 className="text-sm font-medium">Style Preferences</h3>
                            <TextareaAutosize
                                {...form.register("styleDescription")}
                                disabled={isPending}
                                placeholder="Describe your preferred style (e.g., minimalist black and white, neon cyberpunk, professional blue...)"
                                onFocus={() => setIsFocused(true)}
                                onBlur={() => setIsFocused(false)}
                                className="w-full px-3 py-2 border rounded-md resize-none focus:outline-none focus:ring-2 focus:ring-blue-500"
                                minRows={2}
                                maxRows={5}
                            />
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
                                className="px-4 py-2 bg-blue-500 text-white rounded hover:bg-blue-600 disabled:opacity-50"
                            >
                                {isPending ? "Creating..." : "Create Linktree"}
                            </button>
                        </div>
                    </div>
                </form>
            </section>
        </>
    )
}