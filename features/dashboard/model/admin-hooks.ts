import { useMutation, useQuery, useQueryClient } from '@tanstack/react-query'
import {
  createCategory,
  createTheme,
  createTag,
  createUser,
  deleteCategory,
  deleteReaction,
  deleteTheme,
  deleteTag,
  deleteUser,
  getCategories,
  getNews,
  getReactions,
  getThemes,
  getTags,
  getUsers,
  updateCategory,
  updateTheme,
  updateTag,
  updateUser,
  type CreateCategoryPayload,
  type CreateThemePayload,
  type CreateTagPayload,
  type CreateUserPayload,
  type ReactionsParams,
} from './admin-api'
import type { NewsStatus } from '@/features/news/model'
import { invalidatePublicClientCaches } from '@/features/news/model/invalidate-public-client-cache'

export const adminQueryKeys = {
  categories: ['admin', 'categories'] as const,
  themes: ['admin', 'themes'] as const,
  tags: ['admin', 'tags'] as const,
  users: ['admin', 'users'] as const,
  news: (status?: NewsStatus) => ['admin', 'news', status ?? 'all'] as const,
  reactions: (params: ReactionsParams) => ['admin', 'reactions', params] as const,
}

/**
 * Dashboard query: polling yo'q (Fluid Active CPU tejash).
 * Yangilanish — mutation onSuccess dagi invalidateQueries (+ kerak joyda router.refresh).
 * Tabga qaytganda / reconnect da yumshoq refetch.
 */
function adminQueryOptions() {
  return {
    staleTime: 60_000,
    refetchInterval: false as const,
    refetchIntervalInBackground: false,
    refetchOnWindowFocus: true,
    refetchOnReconnect: true,
  } as const
}

export function useCategoriesQuery() {
  return useQuery({
    queryKey: adminQueryKeys.categories,
    queryFn: getCategories,
    ...adminQueryOptions(),
  })
}

export function useCategoryMutations() {
  const queryClient = useQueryClient()

  const create = useMutation({
    mutationFn: (payload: CreateCategoryPayload) => createCategory(payload),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: adminQueryKeys.categories })
      invalidatePublicClientCaches(queryClient)
    },
  })

  const update = useMutation({
    mutationFn: ({ id, payload }: { id: string; payload: CreateCategoryPayload }) =>
      updateCategory(id, payload),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: adminQueryKeys.categories })
      invalidatePublicClientCaches(queryClient)
    },
  })

  const remove = useMutation({
    mutationFn: (id: string) => deleteCategory(id),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: adminQueryKeys.categories })
      invalidatePublicClientCaches(queryClient)
    },
  })

  return { create, update, remove }
}

export function useTagsQuery() {
  return useQuery({
    queryKey: adminQueryKeys.tags,
    queryFn: getTags,
    ...adminQueryOptions(),
  })
}

export function useThemesQuery() {
  return useQuery({
    queryKey: adminQueryKeys.themes,
    queryFn: getThemes,
    ...adminQueryOptions(),
  })
}

export function useThemeMutations() {
  const queryClient = useQueryClient()

  const create = useMutation({
    mutationFn: (payload: CreateThemePayload) => createTheme(payload),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: adminQueryKeys.themes })
      invalidatePublicClientCaches(queryClient)
    },
  })

  const update = useMutation({
    mutationFn: ({ id, payload }: { id: string; payload: CreateThemePayload }) => updateTheme(id, payload),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: adminQueryKeys.themes })
      invalidatePublicClientCaches(queryClient)
    },
  })

  const remove = useMutation({
    mutationFn: (id: string) => deleteTheme(id),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: adminQueryKeys.themes })
      invalidatePublicClientCaches(queryClient)
    },
  })

  return { create, update, remove }
}

export function useTagMutations() {
  const queryClient = useQueryClient()

  const create = useMutation({
    mutationFn: (payload: CreateTagPayload) => createTag(payload),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: adminQueryKeys.tags })
      invalidatePublicClientCaches(queryClient)
    },
  })

  const update = useMutation({
    mutationFn: ({ id, payload }: { id: string; payload: CreateTagPayload }) => updateTag(id, payload),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: adminQueryKeys.tags })
      invalidatePublicClientCaches(queryClient)
    },
  })

  const remove = useMutation({
    mutationFn: (id: string) => deleteTag(id),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: adminQueryKeys.tags })
      invalidatePublicClientCaches(queryClient)
    },
  })

  return { create, update, remove }
}

export function useUsersQuery() {
  return useQuery({
    queryKey: adminQueryKeys.users,
    queryFn: getUsers,
    ...adminQueryOptions(),
  })
}

export function useUserMutations() {
  const queryClient = useQueryClient()

  const create = useMutation({
    mutationFn: (payload: CreateUserPayload) => createUser(payload),
    onSuccess: () => queryClient.invalidateQueries({ queryKey: adminQueryKeys.users }),
  })

  const update = useMutation({
    mutationFn: ({ id, payload }: { id: string; payload: CreateUserPayload }) =>
      updateUser(id, payload),
    onSuccess: () => queryClient.invalidateQueries({ queryKey: adminQueryKeys.users }),
  })

  const remove = useMutation({
    mutationFn: (id: string) => deleteUser(id),
    onSuccess: () => queryClient.invalidateQueries({ queryKey: adminQueryKeys.users }),
  })

  return { create, update, remove }
}

export function useNewsQuery(status?: NewsStatus) {
  return useQuery({
    queryKey: adminQueryKeys.news(status),
    queryFn: () => getNews(status),
    ...adminQueryOptions(),
  })
}

export function useReactionsQuery(params: ReactionsParams = {}) {
  return useQuery({
    queryKey: adminQueryKeys.reactions(params),
    queryFn: () => getReactions(params),
    ...adminQueryOptions(),
  })
}

export function useDeleteReactionMutation() {
  const queryClient = useQueryClient()
  return useMutation({
    mutationFn: (id: string) => deleteReaction(id),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['admin', 'reactions'] })
    },
  })
}
