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
    const [rows] = await pool.query<RowDataPacket[]>(
      `SELECT 
        tr.id, 
        tr.user_id, 
        u.name as user_name,
        u.image as user_image,
        tr.amount, 
        tr.points, 
        tr.payment_method, 
        tr.proof_image, 
        tr.transaction_date, 
        tr.status, 
        tr.created_at
      FROM topup_requests tr
      JOIN users u ON tr.user_id = u.id
      ORDER BY tr.created_at DESC`
    )
    
    const formattedRows = rows.map(row => ({
      ...row,
      transactionDate: row.transaction_date.toISOString(),
      createdAt: row.created_at.toISOString(),
      paymentMethod: row.payment_method,
      proofImage: row.proof_image,
      userName: row.user_name,
      userId: row.user_id,
      userImage: row.user_image
    }))
    
    return NextResponse.json(formattedRows)
  } catch (error) {
    console.error('Failed to fetch top-up requests:', error)
    return NextResponse.json({ error: 'Internal server error' }, { status: 500 })
  }
}

