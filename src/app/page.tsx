"use client"

import { useTRPC } from "@/trpc/client";
import { useMutation } from "@tanstack/react-query";
import { useState } from "react";
import { toast } from "sonner";

export default function Home() {

  const [value, setValue] = useState("");
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
      <input type="text" value={value} onChange={(e) => setValue(e.target.value)} className="border-2 border-gray-300 rounded-md p-2" />
      <button disabled={invoke.isPending} onClick={() => invoke.mutate({ value: value })} className="cursor-pointer bg-blue-500 text-white p-2 rounded-md">Invoke</button>
    </div>
  );
}
