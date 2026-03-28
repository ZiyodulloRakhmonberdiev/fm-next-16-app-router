'use client'

import { useState, useEffect, useRef, useCallback } from 'react'
import { Link, usePathname, useRouter } from '@/i18n/navigation'
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
import { LogOut, Search, User, ExternalLink, LayoutGrid, Upload, ImageIcon, Lock, ArrowLeft, Undo2, Loader2, RefreshCw } from 'lucide-react'
import { LiaUserEditSolid } from 'react-icons/lia'
import type { NewsItem } from '@/features/news/model'
import { useTheme } from 'next-themes'
import { signOut, useSession } from 'next-auth/react'
import { toast } from 'sonner'
import { normalizeRole } from '@/shared/common/lib/rbac'
import { ThemeSwitcherForHeader } from '@/widgets/theme-switcher'
import { resizeImageToSquareJpeg } from '@/features/user/lib/resize-profile-avatar'

function canOpenDashboardMenuHub(role: ReturnType<typeof normalizeRole>): boolean {
  return role === 'ceo' || role === 'administrator'
}

const DEBOUNCE_MS = 200
const AVATAR_SIZE = 100

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
  const router = useRouter()
  const pathname = usePathname()
  const locale = useLocale()
  const showBack = pathname !== '/dashboard'
  const { data: session, status: sessionStatus } = useSession()
  const menuHubRole = normalizeRole(session?.user?.role)
  const showMenuHubButton = canOpenDashboardMenuHub(menuHubRole)
  const [me, setMe] = useState<MePayload | null>(null)
  const [searchQuery, setSearchQuery] = useState('')
  const [results, setResults] = useState<NewsItem[]>([])
  const [isOpen, setIsOpen] = useState(false)
  const [loading, setLoading] = useState(false)
  const wrapperRef = useRef<HTMLDivElement>(null)

  const [profileOpen, setProfileOpen] = useState(false)
  const [isRefreshing, setIsRefreshing] = useState(false)
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

  function handleRefresh() {
    setIsRefreshing(true)
    router.refresh()
    setTimeout(() => setIsRefreshing(false), 800)
  }

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
      const blob = await resizeImageToSquareJpeg(file, AVATAR_SIZE)
      const fd = new FormData()
      fd.append('file', new File([blob], 'avatar.jpg', { type: 'image/jpeg' }))
      const res = await fetch('/api/me/avatar', { method: 'POST', credentials: 'include', body: fd })
      const data = (await res.json().catch(() => null)) as { url?: string; error?: string } | null
      if (!res.ok) {
        toast.error(data?.error ?? "Rasm yuklab bo'lmadi")
        return
      }
      if (data?.url) setImage(data.url)
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
      <header className="sticky top-0 z-30 flex h-14 items-center gap-2 border-b border-border bg-background px-4 md:gap-4 md:px-6">
        <SidebarTrigger className="-ml-1 hidden md:flex" />
        {/* Desktop: Back + Refresh tugmalari — pill shaklidagi guruh */}
        {showBack ? (
          <div className="hidden shrink-0 items-center gap-0.5 rounded-lg border border-border/60 bg-muted/40 p-0.5 shadow-sm backdrop-blur md:flex">
            <Button
              type="button"
              variant="ghost"
              size="icon"
              className="size-8 rounded-md text-muted-foreground transition-colors hover:bg-background hover:text-foreground hover:shadow-sm"
              onClick={() => router.back()}
              aria-label="Orqaga"
            >
              <Undo2 className="size-4" />
            </Button>
            <div className="h-4 w-px bg-border/70" />
            <Button
              type="button"
              variant="ghost"
              size="icon"
              className="size-8 rounded-md text-muted-foreground transition-colors hover:bg-background hover:text-foreground hover:shadow-sm"
              onClick={handleRefresh}
              aria-label="Yangilash"
              disabled={isRefreshing}
            >
              <RefreshCw className={`size-4 transition-transform duration-700 ${isRefreshing ? 'animate-spin' : ''}`} />
            </Button>
          </div>
        ) : null}

        {/* Mobile: Back tugmasi */}
        {showBack ? (
          <Button
            type="button"
            variant="ghost"
            size="icon"
            className="shrink-0 md:hidden"
            onClick={() => router.back()}
            aria-label="Orqaga"
          >
            <ArrowLeft className="size-5" />
          </Button>
        ) : (
          <span className="inline-flex size-9 shrink-0 md:hidden" aria-hidden />
        )}
        <div className="relative min-w-0 flex-1 md:flex md:items-center md:gap-4">
          <Link
            href="/dashboard"
            className="absolute left-1/2 top-1/2 z-0 flex -translate-x-1/2 -translate-y-1/2 md:hidden"
          >
            <Image
              src={mounted ? logoSrc : '/images/fm-logo-dark.svg'}
              alt="Fergana Media"
              width={120}
              height={32}
              className="h-7 w-auto object-contain"
              priority
            />
          </Link>
          <div className="relative z-1 mx-auto hidden w-full max-w-md flex-1 md:block" ref={wrapperRef}>
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
        <div className="relative z-1 flex shrink-0 items-center gap-2">
          <DropdownMenu>
            <DropdownMenuTrigger asChild>
              <Button
                variant="ghost"
                className="h-9 md:w-auto md:gap-2 md:rounded-full md:border md:border-border/60 md:bg-background md:px-1 md:pr-3 md:shadow-sm p-0"
                disabled={sessionStatus === 'loading'}
              >
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
                <div className='flex min-w-0 flex-col justify-center items-start'>
                  <span className="text-xs truncate max-w-28 hidden md:block">{displayName}</span>
                  <span className="text-xs text-muted-foreground truncate max-w-28 hidden md:block">{displayRole}</span>
                </div>
              </Button>
            </DropdownMenuTrigger>
            <DropdownMenuContent align="end" className="w-[92vw] max-w-72 p-1 md:w-64">
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
                  <p className="text-sm font-medium">{displayName}</p>
                  <p className="text-xs text-muted-foreground">{displayRole}</p>
                  {session?.user?.email ? (
                    <p className="truncate text-xs text-muted-foreground">{session.user.email}</p>
                  ) : null}
                </div>
              </div>
              <DropdownMenuSeparator />
              <div className="px-2 py-1.5">
                <div className="flex items-center justify-between gap-3">
                  <span className="text-xs text-muted-foreground">Tema</span>
                  <ThemeSwitcherForHeader />
                </div>
              </div>
              <DropdownMenuSeparator />
              <DropdownMenuItem className="min-h-10 cursor-pointer gap-2" onClick={() => void openProfileDialog()}>
                <LiaUserEditSolid className="size-4 shrink-0" />
                Profilni tahrirlash
              </DropdownMenuItem>
              <DropdownMenuSeparator />
              <DropdownMenuItem asChild>
                <Link href="/" className="flex min-h-10 cursor-pointer items-center gap-2">
                  <ExternalLink className="size-4" />
                  Asosiy saytga qaytish
                </Link>
              </DropdownMenuItem>
              <DropdownMenuItem
                className="min-h-10 cursor-pointer gap-2"
                onClick={() => void signOut({ callbackUrl: '/auth/login' })}
              >
                <LogOut className="size-4" />
                Chiqish
              </DropdownMenuItem>
            </DropdownMenuContent>
          </DropdownMenu>
          {showMenuHubButton ? (
            <Button variant="outline" size="icon" className="hidden" asChild>
              <Link href="/dashboard/settings" aria-label="Menu">
                <LayoutGrid className="size-4" />
              </Link>
            </Button>
          ) : null}
        </div>
      </header>

      <Dialog open={profileOpen} onOpenChange={setProfileOpen}>
        <DialogContent className="max-h-[90vh] w-[calc(100vw-1.25rem)] overflow-y-auto rounded-2xl p-5 sm:max-w-md">
          <DialogHeader>
            <DialogTitle>Profilni tahrirlash</DialogTitle>
          </DialogHeader>
          <div className="space-y-4 pt-1">
            <div className="space-y-2">
              <Label htmlFor="admin-profile-name">To'liq ism</Label>
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
              <div className="flex flex-col gap-3 sm:flex-row sm:items-start">
                <div className="shrink-0">
                  {image ? (
                    // eslint-disable-next-line @next/next/no-img-element
                    <img
                      src={image}
                      alt=""
                      width={AVATAR_SIZE}
                      height={AVATAR_SIZE}
                      className="size-[100px] rounded-md border border-border object-cover"
                    />
                  ) : (
                    <div className="flex size-[100px] items-center justify-center rounded-md border border-dashed border-border bg-muted/40 text-muted-foreground">
                      <ImageIcon className="size-8 opacity-50" aria-hidden />
                    </div>
                  )}
                </div>
                <div className="min-w-0 flex-1 space-y-2">
                  <input
                    ref={imageFileRef}
                    type="file"
                    accept="image/jpeg,image/png,image/webp,image/gif"
                    className="sr-only"
                    onChange={(e) => {
                      const f = e.target.files?.[0]
                      if (f) void uploadProfileImage(f)
                    }}
                  />
                  <Button
                    type="button"
                    variant="outline"
                    size="sm"
                    className="w-full gap-2 sm:w-auto"
                    disabled={imageUploading}
                    onClick={() => imageFileRef.current?.click()}
                  >
                    {imageUploading ? (
                      <Loader2 className="size-4 animate-spin" aria-hidden />
                    ) : (
                      <Upload className="size-4" aria-hidden />
                    )}
                    Rasm yuklash
                  </Button>
                  <p className="text-[11px] leading-snug text-muted-foreground">
                    Profil rasmi kvadratga moslab, siqilgan holda yuklanadi.
                  </p>
                  <div className="relative min-w-0">
                    <ImageIcon className="absolute left-3 top-1/2 size-4 -translate-y-1/2 text-muted-foreground" />
                    <Input
                      id="admin-profile-image"
                      value={image}
                      onChange={(e) => setImage(e.target.value)}
                      placeholder="https://..."
                      className="min-w-0 pl-9"
                    />
                  </div>
                </div>
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
