import type { ReactNode } from 'react'

export function ConfigsPageShell({ children }: { children: ReactNode }) {
  return (
    <div className="mx-auto w-full space-y-4 md:space-y-6">{children}</div>
  )
}

export function ConfigsLoading() {
  return (
    <div className="flex items-center justify-center py-12 text-muted-foreground">
      Yuklanmoqda...
    </div>
  )
}
