import { getServerSession } from "next-auth"
import { authOptions } from "@/shared/common/lib/auth-options"
import { normalizeRole, type NormalizedRole } from "@/shared/common/lib/rbac"

export async function requireAdminSession(allowedRoles?: NormalizedRole[]) {
  const session = await getServerSession(authOptions)
  if (!session?.user?.id) {
    return Response.json({ error: "Unauthorized" }, { status: 401 })
  }
  if (allowedRoles && allowedRoles.length > 0) {
    const role = normalizeRole(session.user.role)
    if (!allowedRoles.includes(role)) {
      return Response.json({ error: "Forbidden" }, { status: 403 })
    }
  }
  return null
}
