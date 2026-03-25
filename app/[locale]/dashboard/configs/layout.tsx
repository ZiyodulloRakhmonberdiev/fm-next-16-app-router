'use client'

import { SiteSettingsProvider } from '@/features/dashboard/configs/site-settings-context'

export default function DashboardConfigsLayout({ children }: { children: React.ReactNode }) {
  return (
    <SiteSettingsProvider>
      {/* Mobil: asosiy `main` px-3 ni qisman yumshatish */}
      <div className="-mx-3 max-w-none px-2 md:mx-0 md:max-w-full md:px-0">
        {children}
      </div>
    </SiteSettingsProvider>
  )
}
