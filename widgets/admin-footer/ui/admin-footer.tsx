'use client'

import { Link } from '@/i18n/navigation'

export default function AdminFooter() {
  const currentYear = new Date().getFullYear()

  return (
    <footer className="border-t border-border bg-muted/30 py-3 px-4 md:px-6 z-30 mb-16 md:mb-0">
      <div className="flex flex-col sm:flex-row items-center justify-between gap-2 text-sm text-muted-foreground">
        <p>
          © {currentYear} Admin panel. Barcha huquqlar himoyalangan.
        </p>
        <div className="flex items-center gap-4">
          <Link href="/dashboard/configs" className="hover:text-foreground transition-colors">
            Configs
          </Link>
          <Link href="/" className="hover:text-foreground transition-colors">
            Saytga qaytish
          </Link>
        </div>
      </div>
    </footer>
  )
}
