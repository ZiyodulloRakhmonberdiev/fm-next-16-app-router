'use client'

import { useState } from 'react'
import { toast } from 'sonner'
import { ThemeSwitcher } from '@/widgets/theme-switcher'
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
import { Settings, Save } from 'lucide-react'

export function DashboardUserSettingsPage() {
  const [fullName, setFullName] = useState('Admin Foydalanuvchi')
  const [email, setEmail] = useState('admin@example.uz')
  const [currentPassword, setCurrentPassword] = useState('')
  const [newPassword, setNewPassword] = useState('')

  const handleSaveProfile = () => {
    toast.success('Profil ma’lumotlari saqlandi (demo)')
  }

  const handleChangePassword = () => {
    if (!currentPassword || !newPassword) {
      toast.error('Joriy va yangi parolni kiriting')
      return
    }
    toast.success('Parol yangilandi (demo)')
    setCurrentPassword('')
    setNewPassword('')
  }

  return (
    <div className="space-y-6 max-w-3xl">
      <div>
        <h1 className="text-xl md:text-2xl font-semibold tracking-tight">Sozlamalar</h1>
        <p className="text-sm text-muted-foreground">
          Tizim ko‘rinishi va shaxsiy ma’lumotlaringizni boshqaring.
        </p>
      </div>

      <Card className="border-primary/30 bg-primary/5">
        <CardHeader className="flex flex-row items-center justify-between gap-4">
          <div>
            <CardTitle className="text-xl flex items-center gap-2">
              <Settings className="size-6" />
              Foydalanuvchi sozlamalari
            </CardTitle>
            <CardDescription>
              Tema, profil ma’lumotlari va xavfsizlikni boshqarish.
            </CardDescription>
          </div>
        </CardHeader>
      </Card>

      <Card>
        <CardHeader>
          <CardTitle className="text-base">Tema</CardTitle>
          <CardDescription>Yorug‘ yoki qorong‘i rejimni tanlang.</CardDescription>
        </CardHeader>
        <CardContent>
          <div className="flex items-center gap-4">
            <ThemeSwitcher />
          </div>
        </CardContent>
      </Card>

      <Card>
        <CardHeader>
          <CardTitle className="text-base">Profil ma’lumotlari</CardTitle>
          <CardDescription>Admin ismi va email.</CardDescription>
        </CardHeader>
        <CardContent className="space-y-4">
          <div className="space-y-2">
            <Label>To‘liq ism</Label>
            <Input
              value={fullName}
              onChange={(e) => setFullName(e.target.value)}
              placeholder="Ism Familiya"
            />
          </div>
          <div className="space-y-2">
            <Label>Email</Label>
            <Input
              type="email"
              value={email}
              onChange={(e) => setEmail(e.target.value)}
              placeholder="admin@example.uz"
            />
          </div>
          <div className="flex justify-end">
            <Button type="button" onClick={handleSaveProfile} className="gap-2">
              <Save className="size-4" />
              Saqlash
            </Button>
          </div>
        </CardContent>
      </Card>

      <Card>
        <CardHeader>
          <CardTitle className="text-base">Parolni almashtirish</CardTitle>
          <CardDescription>Hisobingiz xavfsizligini ta’minlang.</CardDescription>
        </CardHeader>
        <CardContent className="space-y-4">
          <div className="space-y-2">
            <Label>Joriy parol</Label>
            <Input
              type="password"
              value={currentPassword}
              onChange={(e) => setCurrentPassword(e.target.value)}
              placeholder="••••••••"
            />
          </div>
          <div className="space-y-2">
            <Label>Yangi parol</Label>
            <Input
              type="password"
              value={newPassword}
              onChange={(e) => setNewPassword(e.target.value)}
              placeholder="••••••••"
            />
          </div>
          <div className="flex justify-end">
            <Button type="button" onClick={handleChangePassword} className="gap-2">
              <Save className="size-4" />
              Yangilash
            </Button>
          </div>
        </CardContent>
      </Card>
    </div>
  )
}

