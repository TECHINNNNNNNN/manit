"use client"

import { useTRPC } from "@/trpc/client";
import { useMutation, useQuery } from "@tanstack/react-query";
import { useState } from "react";
import { toast } from "sonner";

export default function Home() {

  const [value, setValue] = useState("");
  const trpc = useTRPC();
  const { data: messages } = useQuery(trpc.messages.getMany.queryOptions())
  const createMessage = useMutation(trpc.messages.create.mutationOptions({
    onSuccess: () => {
      toast.success("Message created!", {
        description: "waiting for the AI to respond..."
      })
    }
  }))

  return (
    <div>
      <input type="text" value={value} onChange={(e) => setValue(e.target.value)} className="border-2 border-gray-300 rounded-md p-2" />
      <button disabled={createMessage.isPending} onClick={() => createMessage.mutate({ value: value })} className="cursor-pointer bg-blue-500 text-white p-2 rounded-md">Invoke</button>
      {JSON.stringify(messages, null, 2)}
    </div>
  );
}
