"use client"

import { useTRPC } from "@/trpc/client";
import { useMutation } from "@tanstack/react-query";
import { toast } from "sonner";

export default function Home() {
  const trpc = useTRPC();
  const invoke = useMutation(trpc.invoke.mutationOptions({
    onSuccess: () => {
      toast.success("Invoked background job!", {
        description: "This will take 10 seconds to complete"
      })
    }
  }))

  return (
    <div>
      <button disabled={invoke.isPending} onClick={() => invoke.mutate({ text: "johnny" })} className="cursor-pointer bg-blue-500 text-white p-2 rounded-md">Invoke</button>
    </div>
  );
}
