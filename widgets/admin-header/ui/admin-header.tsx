'use client'

import { useState, useEffect, useRef, useCallback } from 'react'
import { Link } from '@/i18n/navigation'
import { useLocale } from 'next-intl'
import Image from 'next/image'
import { SidebarTrigger } from '@/shared/common/components/ui/sidebar'
import { Button } from '@/shared/common/components/ui/button'
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuSeparator,
  DropdownMenuTrigger,
} from '@/shared/common/components/ui/dropdown-menu'
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
} from '@/shared/common/components/ui/dialog'
import { Input } from '@/shared/common/components/ui/input'
import { Label } from '@/shared/common/components/ui/label'
import { LogOut, Search, User, ExternalLink, Settings, Upload, ImageIcon, Lock } from 'lucide-react'
import { LiaUserEditSolid } from 'react-icons/lia'
import type { NewsItem } from '@/features/news/model'
import { useTheme } from 'next-themes'
import { signOut, useSession } from 'next-auth/react'
import { toast } from 'sonner'
import { normalizeRole } from '@/shared/common/lib/rbac'

const DEBOUNCE_MS = 200

type MePayload = {
  full_name?: string
  position?: string
  image?: string | null
  login?: string
  role?: string
}

function roleLabelUz(role: string | undefined | null) {
  const r = normalizeRole(role ?? undefined)
  switch (r) {
    case 'ceo':
      return 'CEO'
    case 'administrator':
      return 'Administrator'
    case 'moderator':
      return 'Moderator'
    case 'ads_manager':
      return 'Reklama menejeri'
    default:
      return 'Foydalanuvchi'
  }
}

export default function AdminHeader() {
  const locale = useLocale()
  const { data: session, status: sessionStatus } = useSession()
  const [me, setMe] = useState<MePayload | null>(null)
  const [searchQuery, setSearchQuery] = useState('')
  const [results, setResults] = useState<NewsItem[]>([])
  const [isOpen, setIsOpen] = useState(false)
  const [loading, setLoading] = useState(false)
  const wrapperRef = useRef<HTMLDivElement>(null)

  const [profileOpen, setProfileOpen] = useState(false)
  const [fullName, setFullName] = useState('')
  const [position, setPosition] = useState('')
  const [image, setImage] = useState('')
  const [currentPassword, setCurrentPassword] = useState('')
  const [newPassword, setNewPassword] = useState('')
  const [profileSaving, setProfileSaving] = useState(false)
  const [imageUploading, setImageUploading] = useState(false)
  const imageFileRef = useRef<HTMLInputElement>(null)

  const { resolvedTheme } = useTheme()
  const [mounted, setMounted] = useState(false)
  useEffect(() => setMounted(true), [])

  const logoSrc =
    mounted && resolvedTheme === 'light'
      ? '/images/fm-logo-dark.svg'
      : '/images/fm-logo.svg'

  useEffect(() => {
    if (!session?.user?.id) {
      setMe(null)
      return
    }
    void (async () => {
      const res = await fetch('/api/me', { cache: 'no-store' })
      if (!res.ok) return
      const data = (await res.json()) as MePayload
      setMe(data)
    })()
  }, [session?.user?.id])

  useEffect(() => {
    if (!searchQuery.trim()) {
      setResults([])
      setIsOpen(false)
      return
    }
    const t = setTimeout(async () => {
      setLoading(true)
      try {
        const res = await fetch(
          `/api/dashboard/search?q=${encodeURIComponent(searchQuery)}&locale=${locale}`
        )
        const data = await res.json()
        setResults(data.results ?? [])
        setIsOpen(true)
      } catch {
        setResults([])
      } finally {
        setLoading(false)
      }
    }, DEBOUNCE_MS)
    return () => clearTimeout(t)
  }, [searchQuery, locale])

  const handleClickOutside = useCallback((e: MouseEvent) => {
    if (wrapperRef.current && !wrapperRef.current.contains(e.target as Node)) {
      setIsOpen(false)
    }
  }, [])

  useEffect(() => {
    document.addEventListener('mousedown', handleClickOutside)
    return () => document.removeEventListener('mousedown', handleClickOutside)
  }, [handleClickOutside])

  async function openProfileDialog() {
    const res = await fetch('/api/me', { cache: 'no-store' })
    if (res.ok) {
      const data = (await res.json()) as MePayload
      setFullName(data.full_name ?? '')
      setPosition(data.position ?? '')
      setImage(typeof data.image === 'string' ? data.image : '')
    }
    setCurrentPassword('')
    setNewPassword('')
    setProfileOpen(true)
  }

  async function uploadProfileImage(file: File) {
    setImageUploading(true)
    try {
      const formData = new FormData()
      formData.append('file', file)
      formData.append('kind', 'image')
      const res = await fetch('/api/uploads', { method: 'POST', credentials: 'include', body: formData })
      const data = (await res.json().catch(() => null)) as { url?: string; error?: string } | null
      if (!res.ok || !data?.url) {
        toast.error(data?.error ?? "Rasm yuklab bo'lmadi")
        return
      }
      setImage(data.url)
      toast.success('Rasm yuklandi')
    } catch (err) {
      toast.error(err instanceof Error ? err.message : "Rasm yuklab bo'lmadi")
    } finally {
      setImageUploading(false)
      if (imageFileRef.current) imageFileRef.current.value = ''
    }
  }

  async function saveProfile() {
    setProfileSaving(true)
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
    setProfileSaving(false)
    if (!res.ok) {
      const err = await res.json().catch(() => null)
      toast.error(typeof err?.error === 'string' ? err.error : 'Saqlab bo‘lmadi')
      return
    }
    toast.success('Profil yangilandi')
    setCurrentPassword('')
    setNewPassword('')
    setProfileOpen(false)
    const refresh = await fetch('/api/me', { cache: 'no-store' })
    if (refresh.ok) setMe((await refresh.json()) as MePayload)
  }

  const displayName =
    me?.full_name?.trim() ||
    session?.user?.name?.trim() ||
    (session?.user as { login?: string } | undefined)?.login ||
    session?.user?.email ||
    'Foydalanuvchi'
  const displayRole = roleLabelUz(me?.role ?? session?.user?.role)
  const avatarUrl = me?.image?.trim() || (session?.user as { image?: string } | undefined)?.image || ''

  return (
    <>
      <header className="sticky top-0 z-30 flex h-14 items-center gap-4 border-b border-border bg-background px-4 md:px-6">
        <SidebarTrigger className="-ml-1 hidden md:flex" />
        <Link href="/dashboard" className="flex shrink-0 items-center gap-2 md:hidden">
          <Image
            src={mounted ? logoSrc : '/images/fm-logo-dark.svg'}
            alt="Fergana Media"
            width={120}
            height={32}
            className="h-7 w-auto object-contain"
            priority
          />
        </Link>
        <div className="flex flex-1 items-center gap-4">
          <div className="relative hidden max-w-md flex-1 md:block" ref={wrapperRef}>
            <div className="relative">
              <Search className="absolute left-2.5 top-1/2 size-4 -translate-y-1/2 text-muted-foreground" />
              <input
                type="search"
                placeholder="Sarlavha yoki tavsif bo‘yicha qidirish..."
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
                onFocus={() => searchQuery.trim() && results.length > 0 && setIsOpen(true)}
                className="w-full rounded-md border border-input bg-background py-2 pl-8 pr-3 text-sm ring-offset-background placeholder:text-muted-foreground focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring focus-visible:ring-offset-2"
              />
            </div>
            {isOpen && searchQuery.trim() && (
              <div className="absolute left-0 right-0 top-full z-50 mt-1 max-h-[280px] overflow-auto rounded-md border border-border bg-popover text-popover-foreground shadow-md">
                {loading ? (
                  <div className="px-3 py-4 text-sm text-muted-foreground">Qidirilmoqda...</div>
                ) : results.length === 0 ? (
                  <div className="px-3 py-4 text-sm text-muted-foreground">Hech narsa topilmadi</div>
                ) : (
                  <ul className="py-1">
                    {results.map((item) => (
                      <li key={item.slug}>
                        <Link
                          href={`/dashboard/news/${item.slug}/edit`}
                          className="block truncate px-3 py-2 text-sm hover:bg-accent hover:text-accent-foreground"
                          onClick={() => {
                            setIsOpen(false)
                            setSearchQuery('')
                          }}
                        >
                          {item.title}
                        </Link>
                      </li>
                    ))}
                  </ul>
                )}
              </div>
            )}
          </div>
        </div>
        <div className="flex items-center gap-2">
          <DropdownMenu>
            <DropdownMenuTrigger asChild>
              <Button variant="ghost" size="icon" className="rounded-full" disabled={sessionStatus === 'loading'}>
                {avatarUrl ? (
                  // eslint-disable-next-line @next/next/no-img-element
                  <img
                    src={avatarUrl}
                    alt=""
                    className="size-8 rounded-full object-cover"
                  />
                ) : (
                  <span className="flex size-8 items-center justify-center rounded-full bg-primary/10 text-primary">
                    <User className="size-4" />
                  </span>
                )}
                <span className="sr-only">Foydalanuvchi menyu</span>
              </Button>
            </DropdownMenuTrigger>
            <DropdownMenuContent align="end" className="w-60">
              <div className="flex items-center gap-3 px-2 py-2">
                {avatarUrl ? (
                  // eslint-disable-next-line @next/next/no-img-element
                  <img
                    src={avatarUrl}
                    alt=""
                    className="size-10 shrink-0 rounded-full object-cover"
                  />
                ) : (
                  <span className="flex size-10 shrink-0 items-center justify-center rounded-full bg-primary/10 text-primary">
                    <User className="size-5" />
                  </span>
                )}
                <div className="min-w-0 flex-1">
                  <p className="truncate text-sm font-medium">{displayName}</p>
                  <p className="text-xs text-muted-foreground">{displayRole}</p>
                  {session?.user?.email ? (
                    <p className="truncate text-xs text-muted-foreground">{session.user.email}</p>
                  ) : null}
                </div>
              </div>
              <DropdownMenuSeparator />
              <DropdownMenuItem className="cursor-pointer gap-2" onClick={() => void openProfileDialog()}>
                <LiaUserEditSolid className="size-4 shrink-0" />
                Profilni tahrirlash
              </DropdownMenuItem>
              <DropdownMenuSeparator />
              <DropdownMenuItem asChild>
                <Link href="/" className="flex cursor-pointer items-center gap-2">
                  <ExternalLink className="size-4" />
                  Saytga qaytish
                </Link>
              </DropdownMenuItem>
              <DropdownMenuItem
                className="cursor-pointer gap-2 text-destructive focus:text-destructive"
                onClick={() => void signOut({ callbackUrl: '/auth/login' })}
              >
                <LogOut className="size-4" />
                Chiqish
              </DropdownMenuItem>
            </DropdownMenuContent>
          </DropdownMenu>
          <Button variant="outline" size="icon" className="" asChild>
            <Link href="/dashboard/settings" aria-label="Menu">
              <Settings className="size-4" />
            </Link>
          </Button>
        </div>
      </header>

      <Dialog open={profileOpen} onOpenChange={setProfileOpen}>
        <DialogContent className="max-h-[90vh] overflow-y-auto sm:max-w-md">
          <DialogHeader>
            <DialogTitle>Profilni tahrirlash</DialogTitle>
          </DialogHeader>
          <div className="space-y-4 pt-1">
            <div className="space-y-2">
              <Label htmlFor="admin-profile-name">To‘liq ism</Label>
              <div className="relative">
                <User className="absolute left-3 top-1/2 size-4 -translate-y-1/2 text-muted-foreground" />
                <Input
                  id="admin-profile-name"
                  value={fullName}
                  onChange={(e) => setFullName(e.target.value)}
                  className="pl-9"
                />
              </div>
            </div>
            <div className="space-y-2">
              <Label htmlFor="admin-profile-position">Lavozim</Label>
              <Input
                id="admin-profile-position"
                value={position}
                onChange={(e) => setPosition(e.target.value)}
                className="min-w-0"
              />
            </div>
            <div className="space-y-2">
              <Label htmlFor="admin-profile-image">Profil rasmi</Label>
              <div className="flex flex-col gap-2 sm:flex-row sm:items-center">
                <div className="relative min-w-0 flex-1">
                  <ImageIcon className="absolute left-3 top-1/2 size-4 -translate-y-1/2 text-muted-foreground" />
                  <Input
                    id="admin-profile-image"
                    value={image}
                    onChange={(e) => setImage(e.target.value)}
                    placeholder="URL"
                    className="min-w-0 pl-9"
                  />
                </div>
                <input
                  ref={imageFileRef}
                  type="file"
                  accept="image/*"
                  className="hidden"
                  onChange={(e) => {
                    const f = e.target.files?.[0]
                    if (f) void uploadProfileImage(f)
                  }}
                />
                <Button
                  type="button"
                  variant="outline"
                  size="icon"
                  className="shrink-0"
                  disabled={imageUploading}
                  onClick={() => imageFileRef.current?.click()}
                  title="Yuklash"
                >
                  <Upload className="size-4" />
                </Button>
              </div>
            </div>
            <div className="space-y-2">
              <Label htmlFor="admin-profile-current-pw">Joriy parol</Label>
              <div className="relative">
                <Lock className="absolute left-3 top-1/2 size-4 -translate-y-1/2 text-muted-foreground" />
                <Input
                  id="admin-profile-current-pw"
                  type="password"
                  value={currentPassword}
                  onChange={(e) => setCurrentPassword(e.target.value)}
                  className="pl-9"
                />
              </div>
            </div>
            <div className="space-y-2">
              <Label htmlFor="admin-profile-new-pw">Yangi parol</Label>
              <div className="relative">
                <Lock className="absolute left-3 top-1/2 size-4 -translate-y-1/2 text-muted-foreground" />
                <Input
                  id="admin-profile-new-pw"
                  type="password"
                  value={newPassword}
                  onChange={(e) => setNewPassword(e.target.value)}
                  className="pl-9"
                />
              </div>
            </div>
            <Button className="w-full" onClick={() => void saveProfile()} disabled={profileSaving}>
              Saqlash
            </Button>
          </div>
        </DialogContent>
      </Dialog>
    </>
  )
}
