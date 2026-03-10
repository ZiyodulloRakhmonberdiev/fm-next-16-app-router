import { useMutation, useQuery, useQueryClient } from '@tanstack/react-query'
import {
  createCategory,
  createTag,
  createUser,
  deleteCategory,
  deleteTag,
  deleteUser,
  getCategories,
  getNews,
  getTags,
  getUsers,
  updateCategory,
  updateTag,
  updateUser,
  type CreateCategoryPayload,
  type CreateTagPayload,
  type CreateUserPayload,
} from './admin-api'
import type { NewsStatus } from '@/features/news/model'

export const adminQueryKeys = {
  categories: ['admin', 'categories'] as const,
  tags: ['admin', 'tags'] as const,
  users: ['admin', 'users'] as const,
  news: (status?: NewsStatus) => ['admin', 'news', status ?? 'all'] as const,
}

export function useCategoriesQuery() {
  return useQuery({
    queryKey: adminQueryKeys.categories,
    queryFn: getCategories,
  })
}

export function useCategoryMutations() {
  const queryClient = useQueryClient()

  const create = useMutation({
    mutationFn: (payload: CreateCategoryPayload) => createCategory(payload),
    onSuccess: () => queryClient.invalidateQueries({ queryKey: adminQueryKeys.categories }),
  })

  const update = useMutation({
    mutationFn: ({ id, payload }: { id: string; payload: CreateCategoryPayload }) =>
      updateCategory(id, payload),
    onSuccess: () => queryClient.invalidateQueries({ queryKey: adminQueryKeys.categories }),
  })

  const remove = useMutation({
    mutationFn: (id: string) => deleteCategory(id),
    onSuccess: () => queryClient.invalidateQueries({ queryKey: adminQueryKeys.categories }),
  })

  return { create, update, remove }
}

export function useTagsQuery() {
  return useQuery({
    queryKey: adminQueryKeys.tags,
    queryFn: getTags,
  })
}

export function useTagMutations() {
  const queryClient = useQueryClient()

  const create = useMutation({
    mutationFn: (payload: CreateTagPayload) => createTag(payload),
    onSuccess: () => queryClient.invalidateQueries({ queryKey: adminQueryKeys.tags }),
  })

  const update = useMutation({
    mutationFn: ({ id, payload }: { id: string; payload: CreateTagPayload }) => updateTag(id, payload),
    onSuccess: () => queryClient.invalidateQueries({ queryKey: adminQueryKeys.tags }),
  })

  const remove = useMutation({
    mutationFn: (id: string) => deleteTag(id),
    onSuccess: () => queryClient.invalidateQueries({ queryKey: adminQueryKeys.tags }),
  })

  return { create, update, remove }
}

export function useUsersQuery() {
  return useQuery({
    queryKey: adminQueryKeys.users,
    queryFn: getUsers,
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
  })
}
