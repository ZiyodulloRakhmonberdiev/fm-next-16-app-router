"use client";
import { type PropsWithChildren } from "react";
import { useState } from "react";


import { ThemeProvider } from "next-themes";
import { Toaster } from "sonner";
import { QueryClient, QueryClientProvider } from "@tanstack/react-query";
import { TooltipProvider } from "@/shared/common/components/ui/tooltip";
import { SidebarProvider } from "@/shared/common/components/ui/sidebar";

export function Providers({ children }: PropsWithChildren<unknown>) {
  const [queryClient] = useState(
    () =>
      new QueryClient({
        defaultOptions: {
          queries: {
            refetchOnWindowFocus: false,
            retry: false,
          },
          mutations: {
            retry: false,
          },
        },
      })
  );
  return (
    <SidebarProvider>
      <ThemeProvider
        attribute="class"
        defaultTheme="system"
        storageKey="start-theme"
        enableSystem
        disableTransitionOnChange
      >
        <QueryClientProvider client={queryClient}>
          <Toaster position="bottom-right" duration={6000} />
          <TooltipProvider>
            {children}
          </TooltipProvider>
        </QueryClientProvider>
      </ThemeProvider>
    </SidebarProvider>
  );
}
