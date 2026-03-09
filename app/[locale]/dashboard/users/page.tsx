import { seed } from '@/scripts/seed'
import type { UserRow } from '@/features/dashboard'
import { DashboardUsersPage } from '@/features/dashboard'

export default async function DashboardUsersPageRoute() {
  const users: UserRow[] = seed.users.map((u) => ({
    id: u.id,
    full_name: u.full_name,
    image: u.image,
    role: u.role,
    lavozim: u.lavozim,
    login: u.login,
    password: u.password,
  }))

  return <DashboardUsersPage users={users} />
}
