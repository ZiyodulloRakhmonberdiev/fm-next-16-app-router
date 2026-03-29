import type { LocaleMap } from '@/shared/common/lib/locale-types'
import type { NewsStatus, RawNewsItem } from '@/features/news/model'

type ApiNewsListResponse = {
  data: RawNewsItem[]
  meta: {
    total: number
    page: number
    limit: number
    totalPages: number
  }
}

export type AdminCategory = {
  _id: string
  slug: string
  href: string
  name: LocaleMap
  priority?: number
}

export type AdminTag = {
  _id: string
  slug: string
  name: LocaleMap
}

export type AdminTheme = {
  _id: string
  slug: string
  name: LocaleMap
  subtitle: LocaleMap
  description: LocaleMap
  status: "active" | "inactive"
}

export type AdminUserRole = 'ceo' | 'administrator' | 'moderator' | 'ads_manager' | 'user'

export type AdminUser = {
  _id: string
  full_name: string
  image: string | null
  role: AdminUserRole
  position: string
  login: string
  password: string
}

export type CreateCategoryPayload = {
  slug: string
  href: string
  name: LocaleMap
  priority?: number
}

export type CreateTagPayload = {
  slug: string
  name: LocaleMap
}

export type CreateThemePayload = {
  slug: string
  name: LocaleMap
  subtitle: LocaleMap
  description: LocaleMap
  status: "active" | "inactive"
}

export type CreateUserPayload = {
  full_name: string
  image: string | null
  role: AdminUserRole
  position: string | null
  login: string
  password: string
}

export class ApiError extends Error {
  status: number
  description?: string

  constructor(message: string, status: number, description?: string) {
    super(message)
    this.name = 'ApiError'
    this.status = status
    this.description = description
  }
}

type ApiErrorPayload = {
  error?: string
  message?: string
  issues?: {
    formErrors?: string[]
    fieldErrors?: Record<string, string[] | undefined>
  }
}

function buildValidationDescription(payload: ApiErrorPayload): string | undefined {
  const issues = payload.issues
  if (!issues) return undefined

  const lines: string[] = []
  if (issues.formErrors?.length) {
    lines.push(...issues.formErrors)
  }
  if (issues.fieldErrors) {
    for (const [field, msgs] of Object.entries(issues.fieldErrors)) {
      if (!msgs || msgs.length === 0) continue
      lines.push(`${field}: ${msgs.join(', ')}`)
    }
  }
  return lines.length ? lines.join('\n') : undefined
}

export function getApiErrorDescription(error: unknown): string | undefined {
  if (error instanceof ApiError) return error.description
  return undefined
}

async function apiFetch<T>(input: string, init?: RequestInit): Promise<T> {
  const res = await fetch(input, {
    ...init,
    cache: 'no-store',
    headers: {
      'Content-Type': 'application/json',
      ...(init?.headers ?? {}),
    },
  })

  const data = await res.json().catch(() => null)
  if (!res.ok) {
    const payload = (data ?? {}) as ApiErrorPayload
    const message =
      (typeof payload.message === 'string'
        ? payload.message
        : null) ||
      (typeof payload.error === 'string'
        ? payload.error
        : null) ||
      'So‘rov muvaffaqiyatsiz yakunlandi'
    const description = buildValidationDescription(payload)
    throw new ApiError(message, res.status, description)
  }

  return data as T
}

export function getCategories() {
  return apiFetch<AdminCategory[]>('/api/categories')
}

export function createCategory(payload: CreateCategoryPayload) {
  return apiFetch<AdminCategory>('/api/categories', {
    method: 'POST',
    body: JSON.stringify(payload),
  })
}

export function updateCategory(id: string, payload: CreateCategoryPayload) {
  return apiFetch<AdminCategory>(`/api/categories/${id}`, {
    method: 'PUT',
    body: JSON.stringify(payload),
  })
}

export function deleteCategory(id: string) {
  return apiFetch<{ ok: true }>(`/api/categories/${id}`, { method: 'DELETE' })
}

export function getTags() {
  return apiFetch<AdminTag[]>('/api/tags')
}

export function getThemes() {
  return apiFetch<AdminTheme[]>('/api/themes')
}

export function createTag(payload: CreateTagPayload) {
  return apiFetch<AdminTag>('/api/tags', {
    method: 'POST',
    body: JSON.stringify(payload),
  })
}

export function updateTag(id: string, payload: CreateTagPayload) {
  return apiFetch<AdminTag>(`/api/tags/${id}`, {
    method: 'PUT',
    body: JSON.stringify(payload),
  })
}

export function deleteTag(id: string) {
  return apiFetch<{ ok: true }>(`/api/tags/${id}`, { method: 'DELETE' })
}

export function createTheme(payload: CreateThemePayload) {
  return apiFetch<AdminTheme>('/api/themes', {
    method: 'POST',
    body: JSON.stringify(payload),
  })
}

export function updateTheme(id: string, payload: CreateThemePayload) {
  return apiFetch<AdminTheme>(`/api/themes/${id}`, {
    method: 'PUT',
    body: JSON.stringify(payload),
  })
}

export function deleteTheme(id: string) {
  return apiFetch<{ ok: true }>(`/api/themes/${id}`, { method: 'DELETE' })
}

export function getUsers() {
  return apiFetch<AdminUser[]>('/api/users')
}

export function createUser(payload: CreateUserPayload) {
  return apiFetch<AdminUser>('/api/users', {
    method: 'POST',
    body: JSON.stringify(payload),
  })
}

export function updateUser(id: string, payload: CreateUserPayload) {
  return apiFetch<AdminUser>(`/api/users/${id}`, {
    method: 'PUT',
    body: JSON.stringify(payload),
  })
}

export function deleteUser(id: string) {
  return apiFetch<{ ok: true }>(`/api/users/${id}`, { method: 'DELETE' })
}

export function getNews(status?: NewsStatus) {
  const qs = new URLSearchParams({
    page: '1',
    limit: '500',
    admin: '1',
  })
  if (status) qs.set('status', status)
  return apiFetch<ApiNewsListResponse>(`/api/news?${qs.toString()}`)
}

// ——— Reaksiyalar (dashboard) ———
export type ReactionType = 'like' | 'love' | 'laugh' | 'sad' | 'angry'

export type ReactionRow = {
  _id: string
  newsSlug: string
  newsTitle?: string
  userId?: string
  anonId?: string
  userName: string
  type: ReactionType
  createdAt: string
}

export type ReactionsResponse = {
  data: ReactionRow[]
  meta: { total: number; page: number; limit: number; totalPages: number }
  count: number
}

export type ReactionsParams = {
  page?: number
  limit?: number
  type?: string
  q?: string
}

export function getReactions(params: ReactionsParams = {}) {
  const qs = new URLSearchParams()
  qs.set('page', String(params.page ?? 1))
  qs.set('limit', String(params.limit ?? 30))
  if (params.type && params.type !== 'all') qs.set('type', params.type)
  if (params.q?.trim()) qs.set('q', params.q.trim())
  return apiFetch<ReactionsResponse>(`/api/reactions?${qs.toString()}`)
}

export function deleteReaction(id: string) {
  return apiFetch<{ ok: true }>(`/api/reactions/${id}`, { method: 'DELETE' })
}
