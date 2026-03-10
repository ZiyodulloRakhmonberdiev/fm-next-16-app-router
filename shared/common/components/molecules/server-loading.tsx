"use client"

import { Loader2 } from "lucide-react"

type ServerLoadingProps = {
  className?: string
}

export default function ServerLoading({ className = "" }: ServerLoadingProps) {
  return (
    <div className={`flex min-h-[50vh] w-full items-center justify-center px-4 ${className}`}>
      <div className="flex flex-col items-center text-center">
        <Loader2 className="h-8 w-8 animate-spin text-muted-foreground" />
        <p className="mt-3 text-sm text-muted-foreground md:text-base">Yuklanmoqda...</p>
      </div>
    </div>
  )
}
