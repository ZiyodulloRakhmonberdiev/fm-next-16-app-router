'use client'

import { useState, useEffect } from 'react'
import { toast } from 'sonner'
import Image from 'next/image'
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
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
} from '@/shared/common/components/ui/dialog'
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from '@/shared/common/components/ui/table'
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from '@/shared/common/components/ui/select'
import { Users, PlusCircle, Pencil, Trash2, User } from 'lucide-react'

export const USER_ROLES = [
  { value: 'ceo', label: 'CEO' },
  { value: 'administrator', label: 'Administrator' },
  { value: 'moderator', label: 'Moderator' },
  { value: 'ads-manager', label: 'Ads manager' },
] as const

export type UserRole = (typeof USER_ROLES)[number]['value']

export type UserRow = {
  id: string
  full_name: string
  image: string | null
  role: UserRole
  lavozim: string
  login: string
  password: string
}

type DashboardUsersPageProps = {
  users: UserRow[]
}

function generateId(): string {
  return `user-${Date.now()}-${Math.random().toString(36).slice(2, 9)}`
}

export function DashboardUsersPage({ users: initialUsers }: DashboardUsersPageProps) {
  const [users, setUsers] = useState<UserRow[]>(initialUsers)
  const [createOpen, setCreateOpen] = useState(false)
  const [createRole, setCreateRole] = useState<UserRole | ''>('')
  const [editUser, setEditUser] = useState<UserRow | null>(null)
  const [editRole, setEditRole] = useState<UserRole | ''>('')
  const [deleteUser, setDeleteUser] = useState<UserRow | null>(null)

  useEffect(() => {
    if (editUser) setEditRole(editUser.role)
  }, [editUser])

  const handleCreateSubmit = (e: React.FormEvent<HTMLFormElement>) => {
    e.preventDefault()
    const form = e.currentTarget
    const full_name = (form.querySelector('[name="full_name"]') as HTMLInputElement)?.value?.trim() ?? ''
    const role = createRole
    const lavozim = (form.querySelector('[name="lavozim"]') as HTMLInputElement)?.value?.trim() ?? ''
    const login = (form.querySelector('[name="login"]') as HTMLInputElement)?.value?.trim() ?? ''
    const password = (form.querySelector('[name="password"]') as HTMLInputElement)?.value ?? ''
    const imageInput = form.querySelector('[name="image"]') as HTMLInputElement
    const image = imageInput?.value?.trim() || null

    if (!full_name || !login || !password) {
      toast.error('To‘liq ism, login va parol kiritilishi shart')
      return
    }
    if (!role || !USER_ROLES.some((r) => r.value === role)) {
      toast.error('Rolni tanlang')
      return
    }
    const exists = users.some((u) => u.login.toLowerCase() === login.toLowerCase())
    if (exists) {
      toast.error('Bunday login allaqachon mavjud')
      return
    }
    setUsers((prev) => [
      ...prev,
      { id: generateId(), full_name, image, role: role as UserRole, lavozim, login, password },
    ])
    setCreateOpen(false)
    setCreateRole('')
    toast.success('Foydalanuvchi qo‘shildi')
  }

  const handleUpdateSubmit = (e: React.FormEvent<HTMLFormElement>) => {
    e.preventDefault()
    if (!editUser) return
    const form = e.currentTarget
    const full_name = (form.querySelector('[name="full_name"]') as HTMLInputElement)?.value?.trim() ?? ''
    const role = editRole
    const lavozim = (form.querySelector('[name="lavozim"]') as HTMLInputElement)?.value?.trim() ?? ''
    const login = (form.querySelector('[name="login"]') as HTMLInputElement)?.value?.trim() ?? ''
    const passwordInput = form.querySelector('[name="password"]') as HTMLInputElement
    const password = passwordInput?.value?.trim()
    const imageInput = form.querySelector('[name="image"]') as HTMLInputElement
    const image = imageInput?.value?.trim() || null

    if (!full_name || !login) {
      toast.error('To‘liq ism va login kiritilishi shart')
      return
    }
    if (!role || !USER_ROLES.some((r) => r.value === role)) {
      toast.error('Rolni tanlang')
      return
    }
    const otherWithLogin = users.filter((u) => u.id !== editUser.id && u.login.toLowerCase() === login.toLowerCase())
    if (otherWithLogin.length > 0) {
      toast.error('Bunday login boshqa foydalanuvchida mavjud')
      return
    }
    setUsers((prev) =>
      prev.map((u) =>
        u.id === editUser.id
          ? {
              ...u,
              full_name,
              image,
              role: role as UserRole,
              lavozim,
              login,
              ...(password ? { password } : {}),
            }
          : u
      )
    )
    setEditUser(null)
    toast.success('Foydalanuvchi yangilandi')
  }

  const handleDeleteConfirm = () => {
    if (!deleteUser) return
    setUsers((prev) => prev.filter((u) => u.id !== deleteUser.id))
    setDeleteUser(null)
    toast.success('Foydalanuvchi o‘chirildi')
  }

  return (
    <div className="space-y-6 min-w-0 overflow-hidden">
      <Card className="border-primary/30 bg-primary/5">
        <CardHeader className="flex flex-row items-center justify-between gap-4">
          <div>
            <CardTitle className="text-xl flex items-center gap-2">
              <Users className="size-6" />
              Foydalanuvchilar
            </CardTitle>
            <CardDescription>
              Tizimga kirish huquqi berilgan foydalanuvchilar ro‘yxati. To‘liq ism, rasm, lavozim, login va parol.
            </CardDescription>
          </div>
          <Button onClick={() => setCreateOpen(true)} size="lg" className="shrink-0">
            <PlusCircle className="size-4 mr-2" />
            Yangi foydalanuvchi
          </Button>
        </CardHeader>
      </Card>

      <Card>
        <CardHeader>
          <CardTitle className="text-base">Ro‘yxat</CardTitle>
          <CardDescription>Jami: {users.length} ta foydalanuvchi</CardDescription>
        </CardHeader>
        <CardContent>
          <div className="rounded-md border overflow-x-auto">
            <Table>
              <TableHeader>
                <TableRow>
                  <TableHead className="w-14">Rasm</TableHead>
                  <TableHead>To‘liq ism</TableHead>
                  <TableHead>Rol</TableHead>
                  <TableHead>Lavozim</TableHead>
                  <TableHead>Login</TableHead>
                  <TableHead className="w-[120px]">Amallar</TableHead>
                </TableRow>
              </TableHeader>
              <TableBody>
                {users.length === 0 ? (
                  <TableRow>
                    <TableCell colSpan={6} className="text-center text-muted-foreground py-8">
                      Foydalanuvchi topilmadi
                    </TableCell>
                  </TableRow>
                ) : (
                  users.map((row) => (
                    <TableRow key={row.id}>
                      <TableCell>
                        {row.image ? (
                          <Image
                            src={row.image}
                            alt={row.full_name}
                            width={40}
                            height={40}
                            className="rounded-full size-10 object-cover"
                            unoptimized
                          />
                        ) : (
                          <span className="flex size-10 items-center justify-center rounded-full bg-muted">
                            <User className="size-5 text-muted-foreground" />
                          </span>
                        )}
                      </TableCell>
                      <TableCell className="font-medium">{row.full_name}</TableCell>
                      <TableCell>
                        {USER_ROLES.find((r) => r.value === row.role)?.label ?? row.role}
                      </TableCell>
                      <TableCell>{row.lavozim || '—'}</TableCell>
                      <TableCell className="font-mono text-sm">{row.login}</TableCell>
                      <TableCell>
                        <div className="flex items-center gap-2">
                          <Button
                            variant="outline"
                            size="sm"
                            onClick={() => setEditUser(row)}
                            className="gap-1"
                          >
                            <Pencil className="size-4" />
                          </Button>
                          <Button
                            variant="outline"
                            size="sm"
                            onClick={() => setDeleteUser(row)}
                            className="gap-1"
                          >
                            <Trash2 className="size-4" />
                          </Button>
                        </div>
                      </TableCell>
                    </TableRow>
                  ))
                )}
              </TableBody>
            </Table>
          </div>
        </CardContent>
      </Card>

      {/* Create user modal */}
      <Dialog open={createOpen} onOpenChange={setCreateOpen}>
        <DialogContent className="sm:max-w-md">
          <DialogHeader>
            <DialogTitle>Yangi foydalanuvchi</DialogTitle>
            <DialogDescription>
              To‘liq ism, rasm URL, rol, lavozim, tizimga kirish uchun login va parol kiriting.
            </DialogDescription>
          </DialogHeader>
          <form id="create-user-form" onSubmit={handleCreateSubmit} className="space-y-4">
            <div className="space-y-2">
              <Label htmlFor="create-full_name">To‘liq ism</Label>
              <Input id="create-full_name" name="full_name" placeholder="Ism Familiya" required />
            </div>
            <div className="space-y-2">
              <Label htmlFor="create-image">Rasm (URL)</Label>
              <Input id="create-image" name="image" type="url" placeholder="https://..." />
            </div>
            <div className="space-y-2">
              <Label htmlFor="create-role">Rol</Label>
              <Select
                value={createRole || undefined}
                onValueChange={(v) => setCreateRole(v as UserRole)}
                required
              >
                <SelectTrigger id="create-role" className="w-full">
                  <SelectValue placeholder="Tanlang" />
                </SelectTrigger>
                <SelectContent>
                  {USER_ROLES.map((r) => (
                    <SelectItem key={r.value} value={r.value}>
                      {r.label}
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
            </div>
            <div className="space-y-2">
              <Label htmlFor="create-lavozim">Lavozim</Label>
              <Input id="create-lavozim" name="lavozim" placeholder="Masalan: Bosh muharrir, Reklama bo‘limi mudiri" />
            </div>
            <div className="space-y-2">
              <Label htmlFor="create-login">Login</Label>
              <Input id="create-login" name="login" placeholder="tizimga kirish uchun" required />
            </div>
            <div className="space-y-2">
              <Label htmlFor="create-password">Parol</Label>
              <Input id="create-password" name="password" type="password" placeholder="••••••••" required />
            </div>
          </form>
          <DialogFooter>
            <Button type="button" variant="outline" onClick={() => setCreateOpen(false)}>
              Bekor qilish
            </Button>
            <Button type="submit" form="create-user-form">
              Saqlash
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>

      {/* Edit user modal */}
      <Dialog open={!!editUser} onOpenChange={(open) => !open && setEditUser(null)}>
        <DialogContent className="sm:max-w-md">
          <DialogHeader>
            <DialogTitle>Tahrirlash: {editUser?.full_name}</DialogTitle>
            <DialogDescription>
              Foydalanuvchi ma’lumotlarini o‘zgartiring. Parolni o‘zgartirmasangiz bo‘sh qoldiring.
            </DialogDescription>
          </DialogHeader>
          {editUser && (
            <form key={editUser.id} id="edit-user-form" onSubmit={handleUpdateSubmit} className="space-y-4">
              <div className="space-y-2">
                <Label htmlFor="edit-full_name">To‘liq ism</Label>
                <Input
                  id="edit-full_name"
                  name="full_name"
                  defaultValue={editUser.full_name}
                  placeholder="Ism Familiya"
                  required
                />
              </div>
              <div className="space-y-2">
                <Label htmlFor="edit-image">Rasm (URL)</Label>
                <Input
                  id="edit-image"
                  name="image"
                  type="url"
                  defaultValue={editUser.image ?? ''}
                  placeholder="https://..."
                />
              </div>
              <div className="space-y-2">
                <Label htmlFor="edit-role">Rol</Label>
                <Select
                  value={editRole}
                  onValueChange={(v) => setEditRole(v as UserRole)}
                >
                  <SelectTrigger id="edit-role" className="w-full">
                    <SelectValue placeholder="Tanlang" />
                  </SelectTrigger>
                  <SelectContent>
                    {USER_ROLES.map((r) => (
                      <SelectItem key={r.value} value={r.value}>
                        {r.label}
                      </SelectItem>
                    ))}
                  </SelectContent>
                </Select>
              </div>
              <div className="space-y-2">
                <Label htmlFor="edit-lavozim">Lavozim</Label>
                <Input
                  id="edit-lavozim"
                  name="lavozim"
                  defaultValue={editUser.lavozim ?? ''}
                  placeholder="Masalan: Bosh muharrir, Reklama bo‘limi mudiri"
                />
              </div>
              <div className="space-y-2">
                <Label htmlFor="edit-login">Login</Label>
                <Input
                  id="edit-login"
                  name="login"
                  defaultValue={editUser.login}
                  placeholder="tizimga kirish uchun"
                  required
                />
              </div>
              <div className="space-y-2">
                <Label htmlFor="edit-password">Yangi parol (ixtiyoriy)</Label>
                <Input id="edit-password" name="password" type="password" placeholder="O‘zgartirmasangiz bo‘sh qoldiring" />
              </div>
            </form>
          )}
          <DialogFooter>
            <Button type="button" variant="outline" onClick={() => setEditUser(null)}>
              Bekor qilish
            </Button>
            {editUser && (
              <Button type="submit" form="edit-user-form">
                Saqlash
              </Button>
            )}
          </DialogFooter>
        </DialogContent>
      </Dialog>

      {/* Delete confirm modal */}
      <Dialog open={!!deleteUser} onOpenChange={(open) => !open && setDeleteUser(null)}>
        <DialogContent className="sm:max-w-md">
          <DialogHeader>
            <DialogTitle>Foydalanuvchini o‘chirish</DialogTitle>
            <DialogDescription>
              Haqiqatan ham "{deleteUser?.full_name}" (login: {deleteUser?.login}) foydalanuvchisini o‘chirishni xohlaysizmi?
            </DialogDescription>
          </DialogHeader>
          <DialogFooter>
            <Button type="button" variant="outline" onClick={() => setDeleteUser(null)}>
              Bekor qilish
            </Button>
            <Button type="button" variant="destructive" onClick={handleDeleteConfirm}>
              O‘chirish
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>
    </div>
  )
}
