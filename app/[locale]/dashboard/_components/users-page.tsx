'use client'
/* eslint-disable react/no-unescaped-entities */

import { useMemo, useState } from 'react'
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
import { createUserSchema, type CreateUserInput } from '@/features/users/model/schemas'
import { useUserMutations, useUsersQuery } from '@/features/dashboard/model/admin-hooks'
import { useUsersUiStore } from '@/features/dashboard/model/admin-ui-store'

export const USER_ROLES = [
  { value: 'ceo', label: 'CEO' },
  { value: 'administrator', label: 'Administrator' },
  { value: 'moderator', label: 'Moderator' },
  { value: 'ads_manager', label: 'Ads manager' },
  { value: 'user', label: 'User (no access)' },
] as const

export type UserRole = (typeof USER_ROLES)[number]['value']

export type UserRow = {
  id: string
  full_name: string
  image: string | null
  role: UserRole
  position: string
  login: string
  password: string
}

type UsersPageProps = {
  users?: UserRow[]
}

export function UsersPage({ users: initialUsers }: UsersPageProps) {
  const { data, isLoading, error } = useUsersQuery()
  const { create, update, remove } = useUserMutations()
  const { createOpen, editId, deleteId, setCreateOpen, setEditId, setDeleteId } = useUsersUiStore()
  const users = useMemo<UserRow[]>(
    () =>
      (data ?? initialUsers ?? []).map((u) => ({
        id: 'id' in u ? u.id : u._id,
        full_name: u.full_name,
        image: u.image,
        role: u.role,
        position: u.position ?? '',
        login: u.login,
        password: u.password,
      })),
    [data, initialUsers]
  )

  const [createRole, setCreateRole] = useState<UserRole | ''>('')
  const [editRole, setEditRole] = useState<UserRole | ''>('')
  const editUser = useMemo(() => users.find((u) => u.id === editId) ?? null, [users, editId])
  const deleteUser = useMemo(() => users.find((u) => u.id === deleteId) ?? null, [users, deleteId])

  const handleCreateSubmit = (e: React.FormEvent<HTMLFormElement>) => {
    e.preventDefault()
    const form = e.currentTarget
    const full_name = (form.querySelector('[name="full_name"]') as HTMLInputElement)?.value?.trim() ?? ''
    const role = createRole
    const position = (form.querySelector('[name="position"]') as HTMLInputElement)?.value?.trim() ?? ''
    const login = (form.querySelector('[name="login"]') as HTMLInputElement)?.value?.trim() ?? ''
    const password = (form.querySelector('[name="password"]') as HTMLInputElement)?.value ?? ''

    const imageUrlInput = form.querySelector('[name="image"]') as HTMLInputElement
    const imageFileInput = form.querySelector('[name="image_file"]') as HTMLInputElement
    const file = imageFileInput?.files?.[0]
    const image = file ? URL.createObjectURL(file) : imageUrlInput?.value?.trim() || null

    if (!role || !USER_ROLES.some((r) => r.value === role)) {
      toast.error('Rolni tanlang')
      return
    }

    const candidate: CreateUserInput = {
      full_name,
      image: image ?? null,
      role,
      position: position || null,
      login,
      password,
    }

    const parsed = createUserSchema.safeParse(candidate)
    if (!parsed.success) {
      const firstError = parsed.error.issues[0]
      toast.error(firstError?.message ?? 'Ma\'lumotlarni tekshiring')
      return
    }

    const exists = users.some((u) => u.login.toLowerCase() === login.toLowerCase())
    if (exists) {
      toast.error('Bunday login allaqachon mavjud')
      return
    }
    create.mutate(
      {
        full_name,
        image,
        role: role as UserRole,
        position: position || null,
        login,
        password,
      },
      {
        onSuccess: () => {
          setCreateOpen(false)
          setCreateRole('')
          toast.success('Foydalanuvchi qo\'shildi')
        },
        onError: (err) => toast.error(err.message),
      }
    )
  }

  const handleUpdateSubmit = (e: React.FormEvent<HTMLFormElement>) => {
    e.preventDefault()
    if (!editUser) return
    const form = e.currentTarget
    const full_name = (form.querySelector('[name="full_name"]') as HTMLInputElement)?.value?.trim() ?? ''
    const role = editRole
    const position = (form.querySelector('[name="position"]') as HTMLInputElement)?.value?.trim() ?? ''
    const login = (form.querySelector('[name="login"]') as HTMLInputElement)?.value?.trim() ?? ''
    const passwordInput = form.querySelector('[name="password"]') as HTMLInputElement
    const password = passwordInput?.value?.trim()

    const imageUrlInput = form.querySelector('[name="image"]') as HTMLInputElement
    const imageFileInput = form.querySelector('[name="image_file"]') as HTMLInputElement
    const file = imageFileInput?.files?.[0]
    const image = file ? URL.createObjectURL(file) : imageUrlInput?.value?.trim() || null

    if (!full_name || !login) {
      toast.error('To\'liq ism va login kiritilishi shart')
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
    update.mutate(
      {
        id: editUser.id,
        payload: {
          full_name,
          image,
          role: role as UserRole,
          position: position || null,
          login,
          password: password || editUser.password,
        },
      },
      {
        onSuccess: () => {
          setEditId(null)
          toast.success('Foydalanuvchi yangilandi')
        },
        onError: (err) => toast.error(err.message),
      }
    )
  }

  const handleDeleteConfirm = () => {
    if (!deleteUser) return
    remove.mutate(deleteUser.id, {
      onSuccess: () => {
        setDeleteId(null)
        toast.success('Foydalanuvchi o\'chirildi')
      },
      onError: (err) => toast.error(err.message),
    })
  }

  return (
    <div className="space-y-6 min-w-0 overflow-hidden">
      <Card className="border-primary/30 bg-primary/5">
        <CardHeader className="flex flex-col md:flex-row items-center justify-between gap-4">
          <div>
            <CardTitle className="text-xl flex items-center gap-2">
              <Users className="size-6" />
              Foydalanuvchilar
            </CardTitle>
            <CardDescription>
              Tizimga kirish huquqi berilgan foydalanuvchilar ro'yxati.
            </CardDescription>
          </div>
          <Button onClick={() => setCreateOpen(true)} size="lg" className="shrink-0 w-full md:w-auto">
            <PlusCircle className="size-4 mr-2" />
            Yangi foydalanuvchi
          </Button>
        </CardHeader>
      </Card>

      <Card>
        <CardHeader>
          <CardTitle className="text-base">Ro'yxat</CardTitle>
          <CardDescription>Jami: {users.length} ta foydalanuvchi</CardDescription>
        </CardHeader>
        <CardContent>
          {isLoading ? (
            <p className="text-sm text-muted-foreground">Yuklanmoqda...</p>
          ) : error ? (
            <p className="text-sm text-destructive">Foydalanuvchilarni yuklab bo‘lmadi.</p>
          ) : null}
          <div className="rounded-md border overflow-x-auto">
            <Table>
              <TableHeader>
                <TableRow>
                  <TableHead className="w-14">Rasm</TableHead>
                  <TableHead>To'liq ism</TableHead>
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
                      <TableCell>{row.position || '—'}</TableCell>
                      <TableCell className=" text-sm">{row.login}</TableCell>
                      <TableCell>
                        <div className="flex items-center gap-2">
                          <Button
                            variant="outline"
                            size="sm"
                            onClick={() => {
                              setEditRole(row.role)
                              setEditId(row.id)
                            }}
                          >
                            <Pencil className="size-4" />
                          </Button>
                          <Button variant="outline" size="sm" onClick={() => setDeleteId(row.id)}>
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

      <Dialog open={createOpen} onOpenChange={setCreateOpen}>
        <DialogContent className="sm:max-w-md">
          <DialogHeader>
            <DialogTitle>Yangi foydalanuvchi</DialogTitle>
            <DialogDescription>
              To'liq ism, rasm, rol, lavozim, login va parol kiriting.
            </DialogDescription>
          </DialogHeader>
          <form id="create-user-form" onSubmit={handleCreateSubmit} className="space-y-4">
            <div className="space-y-2">
              <Label htmlFor="create-full_name">To'liq ism</Label>
              <Input id="create-full_name" name="full_name" placeholder="Ism Familiya" required />
            </div>
            <div className="space-y-2">
              <Label htmlFor="create-image">Rasm (URL)</Label>
              <Input id="create-image" name="image" type="url" placeholder="https://..." />
            </div>
            <div className="space-y-2">
              <Label htmlFor="create-image_file">Yoki rasm faylini tanlang</Label>
              <Input id="create-image_file" name="image_file" type="file" accept="image/*" />
            </div>
            <div className="space-y-2">
              <Label htmlFor="create-role">Rol</Label>
              <Select value={createRole || undefined} onValueChange={(v) => setCreateRole(v as UserRole)} required>
                <SelectTrigger id="create-role" className="w-full">
                  <SelectValue placeholder="Tanlang" />
                </SelectTrigger>
                <SelectContent>
                  {USER_ROLES.map((r) => (
                    <SelectItem key={r.value} value={r.value}>{r.label}</SelectItem>
                  ))}
                </SelectContent>
              </Select>
            </div>
            <div className="space-y-2">
              <Label htmlFor="create-position">Lavozim</Label>
              <Input id="create-position" name="position" placeholder="Masalan: Bosh muharrir" />
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
            <Button type="button" variant="outline" onClick={() => setCreateOpen(false)}>Bekor qilish</Button>
            <Button type="submit" form="create-user-form" disabled={create.isPending}>Saqlash</Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>

      <Dialog open={!!editUser} onOpenChange={(open) => !open && setEditId(null)}>
        <DialogContent className="sm:max-w-md">
          <DialogHeader>
            <DialogTitle>Tahrirlash: {editUser?.full_name}</DialogTitle>
            <DialogDescription>Foydalanuvchi ma'lumotlarini o'zgartiring.</DialogDescription>
          </DialogHeader>
          {editUser && (
            <form key={editUser.id} id="edit-user-form" onSubmit={handleUpdateSubmit} className="space-y-4">
              <div className="space-y-2">
                <Label htmlFor="edit-full_name">To'liq ism</Label>
                <Input id="edit-full_name" name="full_name" defaultValue={editUser.full_name} required />
              </div>
              <div className="space-y-2">
                <Label htmlFor="edit-image">Rasm (URL)</Label>
                <Input id="edit-image" name="image" type="url" defaultValue={editUser.image ?? ''} />
              </div>
              <div className="space-y-2">
                <Label htmlFor="edit-image_file">Yoki yangi rasm faylini tanlang</Label>
                <Input id="edit-image_file" name="image_file" type="file" accept="image/*" />
              </div>
              <div className="space-y-2">
                <Label htmlFor="edit-role">Rol</Label>
                <Select value={editRole} onValueChange={(v) => setEditRole(v as UserRole)}>
                  <SelectTrigger id="edit-role" className="w-full">
                    <SelectValue placeholder="Tanlang" />
                  </SelectTrigger>
                  <SelectContent>
                    {USER_ROLES.map((r) => (
                      <SelectItem key={r.value} value={r.value}>{r.label}</SelectItem>
                    ))}
                  </SelectContent>
                </Select>
              </div>
              <div className="space-y-2">
                <Label htmlFor="edit-position">Lavozim</Label>
                <Input id="edit-position" name="position" defaultValue={editUser.position ?? ''} />
              </div>
              <div className="space-y-2">
                <Label htmlFor="edit-login">Login</Label>
                <Input id="edit-login" name="login" defaultValue={editUser.login} required />
              </div>
              <div className="space-y-2">
                <Label htmlFor="edit-password">Yangi parol (ixtiyoriy)</Label>
                <Input id="edit-password" name="password" type="password" placeholder="O'zgartirmasangiz bo'sh qoldiring" />
              </div>
            </form>
          )}
          <DialogFooter>
            <Button type="button" variant="outline" onClick={() => setEditId(null)}>Bekor qilish</Button>
            {editUser && <Button type="submit" form="edit-user-form" disabled={update.isPending}>Saqlash</Button>}
          </DialogFooter>
        </DialogContent>
      </Dialog>

      <Dialog open={!!deleteUser} onOpenChange={(open) => !open && setDeleteId(null)}>
        <DialogContent className="sm:max-w-md">
          <DialogHeader>
            <DialogTitle>Foydalanuvchini o'chirish</DialogTitle>
            <DialogDescription>
              Haqiqatan ham &quot;{deleteUser?.full_name}&quot; (login: {deleteUser?.login}) foydalanuvchisini o'chirishni xohlaysizmi?
            </DialogDescription>
          </DialogHeader>
          <DialogFooter>
            <Button type="button" variant="outline" onClick={() => setDeleteId(null)}>Bekor qilish</Button>
            <Button type="button" variant="destructive" onClick={handleDeleteConfirm} disabled={remove.isPending}>O'chirish</Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>
    </div>
  )
}
