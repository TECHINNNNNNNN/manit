"use client"

import { useTRPC } from "@/trpc/client";
import { useMutation } from "@tanstack/react-query";
import { useState } from "react";
import { toast } from "sonner";
import { useRouter } from "next/navigation";

export default function Home() {

  const router = useRouter()

  const [value, setValue] = useState("");
  const trpc = useTRPC();
  const createProject = useMutation(trpc.projects.create.mutationOptions({
    onSuccess: (data) => {
      router.push(`/projects/${data.id}`)
      toast.success("Project created!", {
        description: "waiting for the AI to respond..."
      })
    },
    onError: (error) => {
      toast.error("Error creating project", {
        description: error.message
      })
    }
  }))

  return (
    <div className="min-h-screen flex flex-col items-center justify-center">
      <h1 className="text-2xl font-bold">Manit AI</h1>
      <input type="text" value={value} onChange={(e) => setValue(e.target.value)} className="border-2 border-gray-300 rounded-md p-2" />
      <button disabled={createProject.isPending} onClick={() => createProject.mutate({ value: value })} className="cursor-pointer bg-blue-500 text-white p-2 rounded-md">Let's go!</button>
    </div>
  );
}
