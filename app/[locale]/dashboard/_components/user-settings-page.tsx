'use client'
import { ThemeSwitcher } from '@/widgets/theme-switcher'
import { useSession } from 'next-auth/react'
import { useEffect, useState } from 'react'
import { toast } from 'sonner'
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from '@/shared/common/components/ui/card'
import { Input } from '@/shared/common/components/ui/input'
import { Label } from '@/shared/common/components/ui/label'
import { Button } from '@/shared/common/components/ui/button'
import { Settings } from 'lucide-react'
import { normalizeRole } from '@/shared/common/lib/rbac'

export function DashboardUserSettingsPage() {
  const { data: session } = useSession()
  const role = normalizeRole(session?.user?.role)
  const canEditProfile = role === 'ceo' || role === 'administrator'
  const [fullName, setFullName] = useState('')
  const [position, setPosition] = useState('')
  const [image, setImage] = useState('')
  const [currentPassword, setCurrentPassword] = useState('')
  const [newPassword, setNewPassword] = useState('')
  const [loading, setLoading] = useState(false)

  useEffect(() => {
    if (!canEditProfile) return
    void (async () => {
      const res = await fetch('/api/me', { cache: 'no-store' })
      if (!res.ok) return
      const data = await res.json()
      setFullName(data.full_name ?? '')
      setPosition(data.position ?? '')
      setImage(data.image ?? '')
    })()
  }, [canEditProfile])

  async function saveProfile() {
    setLoading(true)
    const res = await fetch('/api/me', {
      method: 'PATCH',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({
        full_name: fullName,
        position,
        image: image || null,
        currentPassword: currentPassword || undefined,
        newPassword: newPassword || undefined,
      }),
    })
    setLoading(false)
    if (!res.ok) {
      const err = await res.json().catch(() => null)
      toast.error(err?.error ?? 'Saqlab bo‘lmadi')
      return
    }
    setCurrentPassword('')
    setNewPassword('')
    toast.success('Profil yangilandi')
  }

  return (
    <div className="space-y-6 max-w-3xl">
      <div>
        <h1 className="text-xl md:text-2xl font-semibold tracking-tight">Sozlamalar</h1>
        <p className="text-sm text-muted-foreground">
          Bu bo&apos;limda faqat tema boshqaruvi mavjud.
        </p>
      </div>

      <Card className="border-primary/30 bg-primary/5">
        <CardHeader className="flex flex-row items-center justify-between gap-4">
          <div>
            <CardTitle className="text-xl flex items-center gap-2">
              <Settings className="size-6" />
              Sozlamalar
            </CardTitle>
            <CardDescription>
              Sozlamalar bo&apos;limi.
            </CardDescription>
          </div>
        </CardHeader>
      </Card>

      <Card>
        <CardHeader>
          <CardTitle className="text-base">Tema</CardTitle>
          <CardDescription>Yorug' yoki qorong'i rejimni tanlang.</CardDescription>
        </CardHeader>
        <CardContent>
          <div className="flex items-center gap-4">
            <ThemeSwitcher />
          </div>
        </CardContent>
      </Card>

      {canEditProfile ? (
        <Card>
          <CardHeader>
            <CardTitle className="text-base">Profil ma&apos;lumotlari</CardTitle>
            <CardDescription>Admin/CEO profilini yangilash.</CardDescription>
          </CardHeader>
          <CardContent className="space-y-4">
            <div className="space-y-2">
              <Label>Full name</Label>
              <Input value={fullName} onChange={(e) => setFullName(e.target.value)} />
            </div>
            <div className="space-y-2">
              <Label>Position</Label>
              <Input value={position} onChange={(e) => setPosition(e.target.value)} />
            </div>
            <div className="space-y-2">
              <Label>Image URL</Label>
              <Input value={image} onChange={(e) => setImage(e.target.value)} />
            </div>
            <div className="grid gap-3 md:grid-cols-2">
              <div className="space-y-2">
                <Label>Joriy parol</Label>
                <Input type="password" value={currentPassword} onChange={(e) => setCurrentPassword(e.target.value)} />
              </div>
              <div className="space-y-2">
                <Label>Yangi parol</Label>
                <Input type="password" value={newPassword} onChange={(e) => setNewPassword(e.target.value)} />
              </div>
            </div>
            <Button onClick={() => void saveProfile()} disabled={loading}>Saqlash</Button>
          </CardContent>
        </Card>
      ) : null}
    </div>
  )
}
