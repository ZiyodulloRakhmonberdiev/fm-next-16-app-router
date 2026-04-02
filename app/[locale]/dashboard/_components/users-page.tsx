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
import { Textarea } from '@/shared/common/components/ui/textarea'
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
import { useSession } from 'next-auth/react'
import { normalizeRole } from '@/shared/common/lib/rbac'
import { useLocale } from 'next-intl'
import { getLocaleValue, type LocaleMap } from '@/shared/common/lib/locale-types'
import type { AppLocale } from '@/shared/common/lib/locale-api'
import { uploadFileViaPresignedUrl } from '@/shared/infra/cloudinary-client-upload'

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
  full_name: string | LocaleMap
  description?: LocaleMap
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
  const { data: session } = useSession()
  const locale = useLocale()
  const actorRole = normalizeRole(session?.user?.role)
  const canAssignCeo = actorRole === 'ceo'
  const assignableRoles = USER_ROLES.filter((r) => canAssignCeo || r.value !== 'ceo')

  const displayName = (value: UserRow['full_name']) => {
    if (typeof value === 'string') return value
    return (getLocaleValue(value, locale as AppLocale) ?? value.uz ?? '').toString()
  }

  const buildLocaleMap = (form: HTMLFormElement, prefix: string): LocaleMap => ({
    uz: ((form.querySelector(`[name="${prefix}_uz"]`) as HTMLInputElement | HTMLTextAreaElement | null)?.value ?? '').trim(),
    uzb: ((form.querySelector(`[name="${prefix}_uzb"]`) as HTMLInputElement | HTMLTextAreaElement | null)?.value ?? '').trim(),
    ru: ((form.querySelector(`[name="${prefix}_ru"]`) as HTMLInputElement | HTMLTextAreaElement | null)?.value ?? '').trim(),
    en: ((form.querySelector(`[name="${prefix}_en"]`) as HTMLInputElement | HTMLTextAreaElement | null)?.value ?? '').trim(),
  })

  const cleanLocaleMap = (value: LocaleMap): LocaleMap | undefined => {
    const cleaned: LocaleMap = {
      uz: value.uz.trim(),
      uzb: value.uzb.trim(),
      ru: value.ru.trim(),
      en: value.en.trim(),
    }
    if (!cleaned.uz && !cleaned.uzb && !cleaned.ru && !cleaned.en) return undefined
    return cleaned
  }

  const { data, isLoading, error } = useUsersQuery()
  const { create, update, remove } = useUserMutations()
  const { createOpen, editId, deleteId, setCreateOpen, setEditId, setDeleteId } = useUsersUiStore()
  const users = useMemo<UserRow[]>(
    () =>
      (data ?? initialUsers ?? []).map((u) => ({
        id: 'id' in u ? u.id : u._id,
        full_name: u.full_name,
        description: 'description' in u ? u.description : undefined,
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
  const [searchQuery, setSearchQuery] = useState('')
  const [roleFilter, setRoleFilter] = useState<UserRole | 'all'>('all')
  const editUser = useMemo(() => users.find((u) => u.id === editId) ?? null, [users, editId])
  const deleteUser = useMemo(() => users.find((u) => u.id === deleteId) ?? null, [users, deleteId])
  const filteredUsers = useMemo(() => {
    const query = searchQuery.trim().toLowerCase()

    return users.filter((row) => {
      const matchesRole = roleFilter === 'all' || row.role === roleFilter
      if (!matchesRole) return false
      if (!query) return true

      return (
        displayName(row.full_name).toLowerCase().includes(query) ||
        row.login.toLowerCase().includes(query) ||
        row.position.toLowerCase().includes(query)
      )
    })
  }, [users, roleFilter, searchQuery, displayName])

  const editRoleOptions = useMemo(() => {
    if (canAssignCeo) return USER_ROLES
    if (editUser?.role === 'ceo') return USER_ROLES.filter((r) => r.value === 'ceo')
    return assignableRoles
  }, [canAssignCeo, editUser?.role, assignableRoles])

  const handleCreateSubmit = async (e: React.FormEvent<HTMLFormElement>) => {
    e.preventDefault()
    const form = e.currentTarget
    const fullNameMap = buildLocaleMap(form, 'full_name')
    const descriptionMap = cleanLocaleMap(buildLocaleMap(form, 'description'))
    const full_name = cleanLocaleMap(fullNameMap)
    const role = createRole
    const position = (form.querySelector('[name="position"]') as HTMLInputElement)?.value?.trim() ?? ''
    const login = (form.querySelector('[name="login"]') as HTMLInputElement)?.value?.trim() ?? ''
    const password = (form.querySelector('[name="password"]') as HTMLInputElement)?.value ?? ''

    const imageUrlInput = form.querySelector('[name="image"]') as HTMLInputElement
    const imageFileInput = form.querySelector('[name="image_file"]') as HTMLInputElement
    const file = imageFileInput?.files?.[0]
    let image = imageUrlInput?.value?.trim() || null
    if (file) {
      try {
        image = await uploadFileViaPresignedUrl(file, 'image')
      } catch (err) {
        toast.error(err instanceof Error ? err.message : "Rasmni yuklab bo'lmadi")
        return
      }
    }

    if (!role || !assignableRoles.some((r) => r.value === role)) {
      toast.error('Rolni tanlang')
      return
    }

    const candidate: CreateUserInput = {
      full_name: full_name ?? fullNameMap,
      description: descriptionMap,
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
        full_name: full_name ?? fullNameMap,
        description: descriptionMap,
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

  const handleUpdateSubmit = async (e: React.FormEvent<HTMLFormElement>) => {
    e.preventDefault()
    if (!editUser) return
    const form = e.currentTarget
    const fullNameMap = buildLocaleMap(form, 'full_name')
    const descriptionMap = cleanLocaleMap(buildLocaleMap(form, 'description'))
    const full_name = cleanLocaleMap(fullNameMap)
    const role = editRole
    const position = (form.querySelector('[name="position"]') as HTMLInputElement)?.value?.trim() ?? ''
    const login = (form.querySelector('[name="login"]') as HTMLInputElement)?.value?.trim() ?? ''
    const passwordInput = form.querySelector('[name="password"]') as HTMLInputElement
    const password = passwordInput?.value?.trim()

    const imageUrlInput = form.querySelector('[name="image"]') as HTMLInputElement
    const imageFileInput = form.querySelector('[name="image_file"]') as HTMLInputElement
    const file = imageFileInput?.files?.[0]
    let image = imageUrlInput?.value?.trim() || null
    if (file) {
      try {
        image = await uploadFileViaPresignedUrl(file, 'image')
      } catch (err) {
        toast.error(err instanceof Error ? err.message : "Rasmni yuklab bo'lmadi")
        return
      }
    }

    if (!full_name || !login) {
      toast.error('To\'liq ism va login kiritilishi shart')
      return
    }
    if (!role || !editRoleOptions.some((r) => r.value === role)) {
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
          description: descriptionMap,
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
          <CardDescription>
            Jami: {users.length} ta foydalanuvchi. Ko'rsatilmoqda: {filteredUsers.length} ta
          </CardDescription>
        </CardHeader>
        <CardContent>
          <div className="mb-4 grid gap-3 md:grid-cols-2">
            <Input
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              placeholder="Ism, login yoki lavozim bo'yicha qidirish..."
            />
            <Select value={roleFilter} onValueChange={(v) => setRoleFilter(v as UserRole | 'all')}>
              <SelectTrigger>
                <SelectValue placeholder="Rol bo'yicha filter" />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="all">Barcha rollar</SelectItem>
                {USER_ROLES.map((role) => (
                  <SelectItem key={role.value} value={role.value}>
                    {role.label}
                  </SelectItem>
                ))}
              </SelectContent>
            </Select>
          </div>
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
                {filteredUsers.length === 0 ? (
                  <TableRow>
                    <TableCell colSpan={6} className="text-center text-muted-foreground py-8">
                      {users.length === 0 ? 'Foydalanuvchi topilmadi' : "Filter bo'yicha natija topilmadi"}
                    </TableCell>
                  </TableRow>
                ) : (
                  filteredUsers.map((row) => (
                    <TableRow key={row.id}>
                      <TableCell>
                        {row.image ? (
                          <Image
                            src={row.image}
                            alt={displayName(row.full_name)}
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
                      <TableCell className="font-medium">{displayName(row.full_name)}</TableCell>
                      <TableCell>
                        {USER_ROLES.find((r) => r.value === row.role)?.label ?? row.role}
                      </TableCell>
                      <TableCell>{row.position || '—'}</TableCell>
                      <TableCell className=" text-sm">{row.login}</TableCell>
                      <TableCell>
                        <div className="flex items-center gap-2">
                          <Button
                            variant="secondary"
                            title="Tahrirlash"
                            size="sm"
                            onClick={() => {
                              setEditRole(row.role)
                              setEditId(row.id)
                            }}
                          >
                            <Pencil className="size-4" />
                          </Button>
                          <Button variant="secondary" title="O'chirish" size="sm" onClick={() => setDeleteId(row.id)}>
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
        <DialogContent className="sm:max-w-2xl max-h-[85vh] overflow-y-auto">
          <DialogHeader>
            <DialogTitle>Yangi foydalanuvchi</DialogTitle>
            <DialogDescription>
              To'liq ism, rasm, rol, lavozim, login va parol kiriting.
            </DialogDescription>
          </DialogHeader>
          <form id="create-user-form" onSubmit={handleCreateSubmit} className="space-y-4">
            <div className="space-y-2">
              <Label>To'liq ism (4 tilda)</Label>
              <div className="grid gap-2 sm:grid-cols-2">
                <Input id="create-full_name_uz" name="full_name_uz" placeholder="Uzbek (Lotin)" required />
                <Input id="create-full_name_uzb" name="full_name_uzb" placeholder="Uzbek (Kiril)" />
                <Input id="create-full_name_ru" name="full_name_ru" placeholder="Russian" />
                <Input id="create-full_name_en" name="full_name_en" placeholder="English" />
              </div>
            </div>
            <div className="space-y-2">
              <Label>Tavsif / Bio (4 tilda)</Label>
              <div className="grid gap-2 sm:grid-cols-2">
                <Textarea name="description_uz" placeholder="Uzbek (Lotin)" maxLength={512} rows={3} />
                <Textarea name="description_uzb" placeholder="Uzbek (Kiril)" maxLength={512} rows={3} />
                <Textarea name="description_ru" placeholder="Russian" maxLength={512} rows={3} />
                <Textarea name="description_en" placeholder="English" maxLength={512} rows={3} />
              </div>
              <p className="text-xs text-muted-foreground">Har bir tilda maksimal 512 belgi.</p>
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
                  {assignableRoles.map((r) => (
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
        <DialogContent className="sm:max-w-2xl max-h-[85vh] overflow-y-auto">
          <DialogHeader>
            <DialogTitle>Tahrirlash: {editUser ? displayName(editUser.full_name) : ''}</DialogTitle>
            <DialogDescription>Foydalanuvchi ma'lumotlarini o'zgartiring.</DialogDescription>
          </DialogHeader>
          {editUser && (
            <form key={editUser.id} id="edit-user-form" onSubmit={handleUpdateSubmit} className="space-y-4">
              <div className="space-y-2">
                <Label>To'liq ism (4 tilda)</Label>
                <div className="grid gap-2 sm:grid-cols-2">
                  <Input
                    id="edit-full_name_uz"
                    name="full_name_uz"
                    defaultValue={typeof editUser.full_name === 'string' ? editUser.full_name : (editUser.full_name.uz ?? '')}
                    placeholder="Uzbek (Lotin)"
                    required
                  />
                  <Input
                    id="edit-full_name_uzb"
                    name="full_name_uzb"
                    defaultValue={typeof editUser.full_name === 'string' ? '' : (editUser.full_name.uzb ?? '')}
                    placeholder="Uzbek (Kiril)"
                  />
                  <Input
                    id="edit-full_name_ru"
                    name="full_name_ru"
                    defaultValue={typeof editUser.full_name === 'string' ? '' : (editUser.full_name.ru ?? '')}
                    placeholder="Russian"
                  />
                  <Input
                    id="edit-full_name_en"
                    name="full_name_en"
                    defaultValue={typeof editUser.full_name === 'string' ? '' : (editUser.full_name.en ?? '')}
                    placeholder="English"
                  />
                </div>
              </div>
              <div className="space-y-2">
                <Label>Tavsif / Bio (4 tilda)</Label>
                <div className="grid gap-2 sm:grid-cols-2">
                  <Textarea
                    name="description_uz"
                    defaultValue={editUser.description?.uz ?? ''}
                    placeholder="Uzbek (Lotin)"
                    maxLength={512}
                    rows={3}
                  />
                  <Textarea
                    name="description_uzb"
                    defaultValue={editUser.description?.uzb ?? ''}
                    placeholder="Uzbek (Kiril)"
                    maxLength={512}
                    rows={3}
                  />
                  <Textarea
                    name="description_ru"
                    defaultValue={editUser.description?.ru ?? ''}
                    placeholder="Russian"
                    maxLength={512}
                    rows={3}
                  />
                  <Textarea
                    name="description_en"
                    defaultValue={editUser.description?.en ?? ''}
                    placeholder="English"
                    maxLength={512}
                    rows={3}
                  />
                </div>
                <p className="text-xs text-muted-foreground">Har bir tilda maksimal 512 belgi.</p>
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
                    {editRoleOptions.map((r) => (
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
              Haqiqatan ham &quot;{deleteUser ? displayName(deleteUser.full_name) : ''}&quot; (login: {deleteUser?.login}) foydalanuvchisini o'chirishni xohlaysizmi?
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
