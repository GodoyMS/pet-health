import React from "react";
import ReactDOM from "react-dom/client";
import { RouterProvider } from "react-router-dom";
import { QueryClient, QueryClientProvider } from "@tanstack/react-query";
import "@shared/styles/global.css";
import { router } from "@app/router";
import { reloadForFreshAssets } from "@shared/utils/chunkLoadRecovery";

const queryClient = new QueryClient({
  defaultOptions: {
    queries: {
      retry: 1,
      refetchOnWindowFocus: false
    }
  }
});

// After a deploy, Vite-preloaded chunks with old hashes 404. Reload once so the
// browser picks up the new index.html — see Vite "Load Error Handling".
window.addEventListener("vite:preloadError", (event) => {
  event.preventDefault();
  reloadForFreshAssets();
});

const rootElement = document.getElementById("root")!;

ReactDOM.createRoot(rootElement).render(
  <React.StrictMode>
    <QueryClientProvider client={queryClient}>
      <RouterProvider router={router} />
    </QueryClientProvider>
  </React.StrictMode>
);

