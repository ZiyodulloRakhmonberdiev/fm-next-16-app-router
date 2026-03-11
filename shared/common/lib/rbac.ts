export type AppUserRole = "ceo" | "administrator" | "moderator" | "ads_manager" | "user" | "ads-manager"
export type NormalizedRole = "ceo" | "administrator" | "moderator" | "ads_manager" | "user"

export function normalizeRole(role?: string | null): NormalizedRole {
  if (!role || typeof role !== "string") return "user"
  const r = role.toLowerCase().trim()
  if (r === "ceo") return "ceo"
  if (r === "administrator") return "administrator"
  if (r === "moderator") return "moderator"
  if (r === "ads_manager" || r === "ads-manager") return "ads_manager"
  return "user"
}

export function getDefaultDashboardPath(role?: string | null): string | null {
  const r = normalizeRole(role)
  if (r === "ceo") return "/dashboard"
  if (r === "administrator") return "/dashboard"
  if (r === "moderator") return "/dashboard/news"
  if (r === "ads_manager") return "/dashboard/ads"
  return null
}

export function canAccessDashboardPath(role: string | null | undefined, path: string): boolean {
  const r = normalizeRole(role)
  if (!path.startsWith("/dashboard")) return true

  if (r === "ceo") return true
  if (r === "administrator") {
    return !path.startsWith("/dashboard/configs")
  }
  if (r === "moderator") {
    return (
      path === "/dashboard/news" ||
      path.startsWith("/dashboard/news/") ||
      path === "/dashboard/categories" ||
      path.startsWith("/dashboard/categories/") ||
      path === "/dashboard/tags" ||
      path.startsWith("/dashboard/tags/") ||
      path === "/dashboard/comments" ||
      path.startsWith("/dashboard/comments/") ||
      path === "/dashboard/settings" ||
      path.startsWith("/dashboard/settings/")
    )
  }
  if (r === "ads_manager") {
    return (
      path === "/dashboard/ads" ||
      path.startsWith("/dashboard/ads/") ||
      path === "/dashboard/settings" ||
      path.startsWith("/dashboard/settings/")
    )
  }
  return false
}
