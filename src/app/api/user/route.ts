import { NextResponse } from 'next/server'
import { getServerSession } from "next-auth/next"
import { authOptions } from "@/app/api/auth/[...nextauth]/route"
import pool from '@/lib/db'
import { RowDataPacket } from 'mysql2'
import { cacheData, clearCache } from '@/lib/cache'

export async function GET() {
  const session = await getServerSession(authOptions)

  if (!session?.user?.id) {
    return NextResponse.json({ error: 'Not authenticated' }, { status: 401 })
  }

  try {
    // Use a shorter TTL (5 minutes) to ensure data doesn't get too stale
    const userData = await cacheData(
      `user:${session.user.id}`,
      300,
      async () => {
        const connection = await pool.getConnection()
        try {
          const [rows] = await connection.query<RowDataPacket[]>(
            'SELECT points, vps_rank, machine_rank, base_rank FROM users WHERE id = ?',
            [session.user.id]
          )
          return rows[0] || null
        } finally {
          connection.release()
        }
      }
    )

    if (!userData) {
      return NextResponse.json({ error: 'User not found' }, { status: 404 })
    }

    return NextResponse.json(userData)
  } catch (error) {
    console.error('Failed to fetch user data:', error)
    return NextResponse.json(
      { error: 'Internal server error', details: process.env.NODE_ENV === 'development' ? error : undefined },
      { status: 500 }
    )
  }
}

// Add a helper function to clear user cache when data is updated
export async function clearUserCache(userId: string) {
  await clearCache(`user:${userId}`)
}

