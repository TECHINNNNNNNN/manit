"use client";

import { zodResolver } from "@hookform/resolvers/zod";
import { useForm } from "react-hook-form";
import TextareaAutosize from "react-textarea-autosize";
import { z } from "zod";
import { useState } from "react";
import { useMutation, useQueryClient } from "@tanstack/react-query";
import { toast } from "sonner";

import { cn } from "@/lib/utils";
import { useTRPC } from "@/trpc/client";
import { useRouter } from "next/navigation";
import { PROJECT_TEMPLATES } from "@/modules/home/constant";
import { useClerk } from "@clerk/nextjs";



const formSchema = z.object({
    value: z.string()
        .min(1, { message: "Message cannot be empty" })
        .max(1000, { message: "Message cannot be more than 1000 characters" }),
})

export const ProjectForm = () => {
    const router = useRouter();
    const [isFocused, setIsFocused] = useState(false);
    const showUsage = false;
    const clerk = useClerk()

    const form = useForm<z.infer<typeof formSchema>>({
        resolver: zodResolver(formSchema),
        defaultValues: {
            value: "",
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
        await createProject.mutateAsync({
            value: values.value,
        })
    }

    const onSelect = (value: string) => {
        form.setValue('value', value, {
            shouldDirty: true,
            shouldTouch: true,
            shouldValidate: true,
        });
    }

    return (
        <>
            <section className="space-y-6">
                <form
                    onSubmit={form.handleSubmit(onSubmit)}
                    className={cn(
                        "relative border p-4 pt-1 rounded-xl transition-all duration-200",
                        isFocused && "shadow-xs",
                        showUsage && "rounded-t-none"
                    )}
                >
                    {/* Let's add a proper input field to demonstrate correct usage */}
                    <div className="space-y-2">
                        <TextareaAutosize
                            {...form.register("value")}
                            disabled={isPending}
                            placeholder="Type your project name..."
                            onFocus={() => setIsFocused(true)}
                            onBlur={() => setIsFocused(false)}
                            className="w-full resize-none border-0 bg-transparent focus:outline-none"
                            minRows={1}
                            maxRows={10}
                            onKeyDown={(e) => {
                                if (e.key === "Enter" && !e.shiftKey) {
                                    e.preventDefault();
                                    form.handleSubmit(onSubmit)(e);
                                }
                            }}
                        />

                        {/* Show validation errors */}
                        {form.formState.errors.value && (
                            <p className="text-sm text-red-500">
                                {form.formState.errors.value.message}
                            </p>
                        )}

                        {/* Submit button */}
                        <div className="flex justify-end">
                            <button
                                type="submit"
                                disabled={isDisabled}
                                className="px-4 py-2 bg-blue-500 text-white rounded hover:bg-blue-600 disabled:opacity-50"
                            >
                                {isPending ? "Sending..." : "Send"}
                            </button>
                        </div>
                    </div>
                </form>

                <div className='flex-wrap justify-center gap-2 hidden md:flex max-w-3xl'>
                    {PROJECT_TEMPLATES.map((prompt) => (
                        <button onClick={() => onSelect(prompt.prompt)} key={prompt.title} className="px-4 py-2 bg-blue-500 text-white rounded hover:bg-blue-600 disabled:opacity-50">
                            {prompt.emoji} {prompt.title}
                        </button>
                    ))}
                </div>
            </section>
        </>
    )
}