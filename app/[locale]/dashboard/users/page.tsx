import type { UserRow } from '@/features/dashboard'
import { UsersPage } from '@/features/dashboard'

export default async function DashboardUsersPageRoute() {
  const res = await fetch('http://localhost:3000/api/users', {
    cache: 'no-store',
  })
  if (!res.ok) {
    throw new Error('Foydalanuvchilarni yuklab bo‘lmadi')
  }
  const data = (await res.json()) as any[]

  const users: UserRow[] = data.map((u) => ({
    id: u._id,
    full_name: u.full_name,
    image: u.image,
    role: u.role,
    position: u.position,
    login: u.login,
    password: u.password,
  }))

  return <UsersPage users={users} />
}
