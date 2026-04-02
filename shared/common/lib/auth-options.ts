import type { NextAuthOptions } from "next-auth"
import CredentialsProvider from "next-auth/providers/credentials"
import GoogleProvider from "next-auth/providers/google"
import { compare } from "bcryptjs"
import { dbConnect } from "@/shared/common/lib/db"
import { UserModel } from "@/features/users/model/user.model"
import { normalizeRole } from "@/shared/common/lib/rbac"
import { pickUserLocaleText } from "@/features/users/lib/user-locale"

export const authOptions: NextAuthOptions = {
  session: { strategy: "jwt" },
  secret: process.env.NEXTAUTH_SECRET || process.env.AUTH_SECRET,
  providers: [
    ...(process.env.GOOGLE_CLIENT_ID && process.env.GOOGLE_CLIENT_SECRET
      ? [
          GoogleProvider({
            clientId: process.env.GOOGLE_CLIENT_ID,
            clientSecret: process.env.GOOGLE_CLIENT_SECRET,
          }),
        ]
      : []),
    CredentialsProvider({
      name: "credentials",
      credentials: {
        login: { label: "Username", type: "text" },
        password: { label: "Password", type: "password" },
      },
      async authorize(credentials) {
        const login = credentials?.login?.trim()
        const password = credentials?.password
        if (!login || !password) return null

        await dbConnect()
        const user = await UserModel.findOne({ login }).lean()
        if (!user) return null

        const storedPassword = String(user.password ?? "")
        const bcryptLike = /^\$2[aby]\$\d{2}\$/.test(storedPassword)
        const passwordMatch = bcryptLike
          ? await compare(password, storedPassword)
          : storedPassword === password
        if (!passwordMatch) return null

        return {
          id: user._id,
          name: pickUserLocaleText(user.full_name, "uz"),
          login: user.login,
          role: user.role,
        }
      },
    }),
  ],
  callbacks: {
    async jwt({ token, user }) {
      if (user) {
        token.id = user.id
        token.role = normalizeRole((user as { role?: string }).role)
        token.login = (user as { login?: string }).login
      }
      return token
    },
    async session({ session, token }) {
      if (session.user) {
        session.user.id = String(token.id ?? "")
        session.user.role = typeof token.role === "string" ? token.role : undefined
        session.user.login = typeof token.login === "string" ? token.login : undefined
      }
      return session
    },
  },
}
