import { Link } from "@/i18n/navigation"

export default function UserDashboardPage() {
  return (
    <div className="space-y-4">
      <h1 className="text-2xl font-semibold">Mening kabinetim</h1>
      <div className="grid gap-4 md:grid-cols-2">
        <Link href="/user/comments" className="rounded-lg border p-4 hover:bg-muted/40">
          Mening izohlarim
        </Link>
        <Link href="/user/reactions" className="rounded-lg border p-4 hover:bg-muted/40">
          Mening reaksiyalarim
        </Link>
      </div>
    </div>
  )
}
