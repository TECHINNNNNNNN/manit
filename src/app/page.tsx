import { getQueryClient, trpc } from "@/trpc/server";
import { dehydrate, HydrationBoundary } from "@tanstack/react-query";
import { Client } from "./client";
import { Suspense } from "react";

export default async function Home() {
  const queryclient = getQueryClient();
  void queryclient.prefetchQuery(trpc.createAI.queryOptions({ text: "Hello, how are you?" }))

  return (
    <HydrationBoundary state={dehydrate(queryclient)}>
      <Suspense fallback={<div>Loading...</div>}>
        <Client />
      </Suspense>
    </HydrationBoundary>
  );
}
