export type AppUserRole = "ceo" | "administrator" | "moderator" | "ads_manager" | "user"
export type NormalizedRole = "ceo" | "administrator" | "moderator" | "ads_manager" | "user"

export function normalizeRole(role?: string | null): NormalizedRole {
  if (!role || typeof role !== "string") return "user"
  const r = role.toLowerCase().trim()
  if (r === "ceo") return "ceo"
  if (r === "administrator") return "administrator"
  if (r === "moderator") return "moderator"
  if (r === "ads_manager") return "ads_manager"
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

/** Administrator Content delivery (Telegram shu yerda) sahifasiga kira olmaydi. */
function isAdministratorBlockedConfigPath(path: string): boolean {
  return path === "/dashboard/configs/delivery" || path.startsWith("/dashboard/configs/delivery/")
}

export function canAccessDashboardPath(role: string | null | undefined, path: string): boolean {
  const r = normalizeRole(role)
  if (!path.startsWith("/dashboard")) return true

  if (r === "ceo") return true

  if (r === "administrator") {
    if (isAdministratorBlockedConfigPath(path)) return false
    return true
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
      path === "/dashboard/reactions" ||
      path.startsWith("/dashboard/reactions/")
    )
  }

  if (r === "ads_manager") {
    return path === "/dashboard/ads" || path.startsWith("/dashboard/ads/")
  }

  return false
}
