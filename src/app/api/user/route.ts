import { NextResponse } from 'next/server'
import { getServerSession } from "next-auth/next"
import { authOptions } from "@/app/api/auth/[...nextauth]/route"
import pool from '@/lib/db'
import { RowDataPacket } from 'mysql2'

export async function GET() {
  const session = await getServerSession(authOptions)

  if (!session?.user?.id) {
    return NextResponse.json({ error: 'Not authenticated' }, { status: 401 })
  }

  try {
    const connection = await pool.getConnection()
    try {
      const [rows] = await connection.query<RowDataPacket[]>(
        'SELECT points, vps_rank, machine_rank, base_rank FROM users WHERE id = ?',
        [session.user.id]
      )
      
      const userData = rows[0]
      
      if (!userData) {
        return NextResponse.json({ error: 'User not found' }, { status: 404 })
      }

      return NextResponse.json(userData)
    } finally {
      connection.release()
    }
  } catch (error) {
    console.error('Failed to fetch user data:', error)
    return NextResponse.json({ error: 'Internal server error' }, { status: 500 })
  }
}

