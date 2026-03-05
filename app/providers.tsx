"use client";
import { type PropsWithChildren } from "react";


import { ThemeProvider } from "next-themes";
import { Toaster } from "sonner";
import { QueryClient, QueryClientProvider } from "@tanstack/react-query";

export function Providers({ children }: PropsWithChildren<unknown>) {
  const queryClient = new QueryClient({
    defaultOptions: {
      queries: {
        refetchOnWindowFocus: false,
        retry: false,
      },
      mutations: {
        retry: false,
      },
    }
  });
  return (
    <ThemeProvider
      attribute="class"
      defaultTheme="system"
      storageKey="start-theme"
      enableSystem
      disableTransitionOnChange
    >
      <QueryClientProvider client={queryClient}>
        <Toaster position="bottom-right" duration={6000} />
        {children}
      </QueryClientProvider>
    </ThemeProvider>
  );
}
