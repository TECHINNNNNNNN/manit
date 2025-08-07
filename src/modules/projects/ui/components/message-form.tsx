import { zodResolver } from "@hookform/resolvers/zod";
import { useForm } from "react-hook-form";
import TextareaAutosize from "react-textarea-autosize";
import { z } from "zod";
import { useState } from "react";
import { useMutation, useQuery, useQueryClient } from "@tanstack/react-query";
import { toast } from "sonner";

import { cn } from "@/lib/utils";
import { useTRPC } from "@/trpc/client";
import { Usage } from "./usage";
import { useRouter } from "next/navigation";
import { Loader2 } from "lucide-react";

interface Props {
    projectId: string;
};

const formSchema = z.object({
    value: z.string()
        .min(1, { message: "Message cannot be empty" })
        .max(1000, { message: "Message cannot be more than 1000 characters" }),
})

export const MessageForm = ({ projectId }: Props) => {
    const [isFocused, setIsFocused] = useState(false);
    const router = useRouter();




    const form = useForm<z.infer<typeof formSchema>>({
        resolver: zodResolver(formSchema),
        defaultValues: {
            value: "",
        }
    })

    const trpc = useTRPC();
    const queryClient = useQueryClient();
    const { data: usage } = useQuery(trpc.usage.status.queryOptions())

    const showUsage = !!usage;

    const createMessage = useMutation(trpc.messages.create.mutationOptions({
        onSuccess: () => {
            form.reset();
            queryClient.invalidateQueries(
                trpc.messages.getMany.queryOptions({ projectId }),
            );
            queryClient.invalidateQueries(
                trpc.usage.status.queryOptions(),
            )
        },
        onError: (error) => {
            toast.error(error.message);
            if (error.message === "You've run out of credits") {
                router.push("/pricing");
            }
        }
    }))

    const isPending = createMessage.isPending;
    const isDisabled = isPending || !form.formState.isValid;


    const onSubmit = async (values: z.infer<typeof formSchema>) => {
        await createMessage.mutateAsync({
            value: values.value,
            projectId,
        })
    }

    return (
        <>
            {showUsage && <Usage points={usage.remainingPoints} msBeforeNext={usage.msBeforeNext} />}
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
                        placeholder="Type your message..."
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
                        >
                            {isPending && <Loader2 className="h-4 w-4 animate-spin" />}
                            {isPending ? "Sending..." : "Send"}
                        </button>
                    </div>
                </div>
            </form>
        </>
    )
}