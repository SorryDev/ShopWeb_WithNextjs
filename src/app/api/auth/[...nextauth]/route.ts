import NextAuth from "next-auth"
import DiscordProvider from "next-auth/providers/discord"
import { NextAuthOptions } from "next-auth"
import pool from '@/lib/db'
import { RowDataPacket, FieldPacket } from 'mysql2/promise'

export const authOptions: NextAuthOptions = {
  providers: [
    DiscordProvider({
      clientId: process.env.DISCORD_CLIENT_ID as string,
      clientSecret: process.env.DISCORD_CLIENT_SECRET as string,
    }),
  ],
  callbacks: {
    async signIn({ user, account }) {
      if (account?.provider === "discord") {
        const [rows] = await pool.query('SELECT * FROM users WHERE id = ?', [user.id])
        if (Array.isArray(rows) && rows.length === 0) {
          // User doesn't exist, create a new one
          await pool.query(
            'INSERT INTO users (id, name, email, image, role) VALUES (?, ?, ?, ?, ?)',
            [user.id, user.name, user.email, user.image, 'user']
          )
        }
      }
      return true
    },
    async jwt({ token, account }) {
      if (account) {
        token.id = account.providerAccountId
      }
      // Fetch user role from database
      const [rows] = await pool.query('SELECT role FROM users WHERE id = ?', [token.id]) as [RowDataPacket[], FieldPacket[]]
      if (rows.length > 0) {
        token.role = (rows[0] as { role: string }).role
      }
      return token
    },
    async session({ session, token }) {
      if (session.user) {
        session.user.id = token.id as string
        session.user.role = token.role as string
      }
      return session
    },
  },
}

const handler = NextAuth(authOptions)

export { handler as GET, handler as POST }

