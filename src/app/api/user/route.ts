import { NextResponse } from 'next/server'
import { getServerSession } from "next-auth/next"
import { authOptions } from "@/app/api/auth/[...nextauth]/route"
import pool from '@/lib/db'
import { RowDataPacket } from 'mysql2'

export async function GET() {
  const session = await getServerSession(authOptions)

  if (!session || !session.user?.id) {
    return NextResponse.json({ error: 'Not authenticated' }, { status: 401 })
  }

  try {
    const [rows] = await pool.query<RowDataPacket[]>('SELECT points, vps_rank, machine_rank, base_rank FROM users WHERE id = ?', [session.user.id])

    if (rows.length === 0) {
      return NextResponse.json({ error: 'User not found' }, { status: 404 })
    }

    const { points, vps_rank, machine_rank, base_rank } = rows[0]
    return NextResponse.json({ points, vps_rank, machine_rank, base_rank })
  } catch (error) {
    console.error('Failed to fetch user data:', error)
    return NextResponse.json({ error: 'Internal server error' }, { status: 500 })
  }
}

