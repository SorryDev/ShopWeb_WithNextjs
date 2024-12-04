import { NextResponse } from 'next/server'
import { getServerSession } from "next-auth/next"
import { authOptions } from "@/app/api/auth/[...nextauth]/route"
import pool from '@/lib/db'

export async function GET() {
  const session = await getServerSession(authOptions)

  if (!session || !session.user?.id) {
    return NextResponse.json({ error: 'Not authenticated' }, { status: 401 })
  }

  try {
    const [rows] = await pool.query(`
      SELECT p.id, p.title, p.description, p.image, up.product_id, up.id, up.purchased_at, up.ip_server, up.status, up.last_ip_update
      FROM user_products up
      JOIN products p ON up.product_id = p.id
      WHERE up.user_id = ?
      ORDER BY up.purchased_at DESC
    `, [session.user.id])
    console.log(rows)
    return NextResponse.json(rows)
  } catch (error) {
    console.error('Failed to fetch purchased products:', error)
    return NextResponse.json({ error: 'Internal server error' }, { status: 500 })
  }
}

