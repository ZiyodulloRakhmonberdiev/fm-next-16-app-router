"use client"

import type { QueryClient } from "@tanstack/react-query"
import {
  publicAdsQueryKeyPrefix,
  publicCategoriesQueryKey,
  publicNewsQueryKey,
  publicThemesQueryKey,
} from "@/shared/common/lib/public-query-keys"

export {
  publicAdsQueryKeyPrefix,
  publicCategoriesQueryKey,
  publicNewsQueryKey,
  publicThemesQueryKey,
} from "@/shared/common/lib/public-query-keys"

/**
 * Admin panelda yozuvdan keyin client-side React Query keshini yangilaydi.
 * Server `revalidateTag` bilan birga ishlatiladi.
 */
export function invalidatePublicClientCaches(queryClient: QueryClient) {
  void queryClient.invalidateQueries({ queryKey: publicNewsQueryKey })
  void queryClient.invalidateQueries({ queryKey: publicCategoriesQueryKey })
  void queryClient.invalidateQueries({ queryKey: publicThemesQueryKey })
  void queryClient.invalidateQueries({ queryKey: publicAdsQueryKeyPrefix })
}
