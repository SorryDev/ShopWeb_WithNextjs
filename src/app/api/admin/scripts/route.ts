import { NextResponse } from 'next/server'
import { getServerSession } from "next-auth/next"
import { authOptions } from "@/app/api/auth/[...nextauth]/route"
import pool from '@/lib/db'
import { RowDataPacket } from 'mysql2'

export async function GET() {
  const session = await getServerSession(authOptions)

  if (!session || session.user?.role !== 'admin') {
    return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })
  }

  try {
    const [rows] = await pool.query<RowDataPacket[]>('SELECT * FROM products ORDER BY created_at DESC')
    return NextResponse.json(rows)
  } catch (error) {
    console.error('Failed to fetch scripts:', error)
    return NextResponse.json({ error: 'Internal server error' }, { status: 500 })
  }
}

export async function POST(request: Request) {
  const session = await getServerSession(authOptions)

  if (!session || session.user?.role !== 'admin') {
    return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })
  }

  try {
    const data = await request.json()
    const { title, category, description, points, image, video_url, version, details, requirements } = data

    const [result] = await pool.query(
      'INSERT INTO products (title, category, description, points, image, video_url, version, details, requirements) VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?)',
      [title, category, description, points, image, video_url, version, details, requirements]
    )

    return NextResponse.json({ id: (result as any).insertId }, { status: 201 })
  } catch (error) {
    console.error('Failed to create script:', error)
    return NextResponse.json({ error: 'Internal server error' }, { status: 500 })
  }
}

