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
  pages: {
    signIn: '/api/auth/signin/discord',
    error: '/auth/error',
  },
  callbacks: {
    async signIn({ user, account }) {
      if (account?.provider === "discord") {
        const connection = await pool.getConnection()
        try {
          const [rows] = await connection.query('SELECT * FROM users WHERE id = ?', [user.id])
          if (Array.isArray(rows) && rows.length === 0) {
            // User doesn't exist, create a new one
            await connection.query(
              'INSERT INTO users (id, name, email, image, role) VALUES (?, ?, ?, ?, ?)',
              [user.id, user.name, user.email, user.image, 'user']
            )
          }
          return true
        } finally {
          connection.release()
        }
      }
      return true
    },
    async jwt({ token, account, profile }) {
      if (account) {
        token.id = account.providerAccountId
      }
      
      // Fetch user role from database
      if (token.id) {
        const connection = await pool.getConnection()
        try {
          const [rows] = await connection.query('SELECT role FROM users WHERE id = ?', [token.id]) as [RowDataPacket[], FieldPacket[]]
          if (rows.length > 0) {
            token.role = (rows[0] as { role: string }).role
          }
        } finally {
          connection.release()
        }
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
    async redirect({ url, baseUrl }) {
      // Allow relative URLs
      if (url.startsWith("/")) return `${baseUrl}${url}`
      // Allow URLs from the same origin
      else if (new URL(url).origin === baseUrl) return url
      return baseUrl
    },
  },
  session: {
    strategy: "jwt",
  },
  secret: process.env.NEXTAUTH_SECRET,
}

const handler = NextAuth(authOptions)

export { handler as GET, handler as POST }

