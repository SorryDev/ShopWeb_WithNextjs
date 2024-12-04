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
    const connection = await pool.getConnection()
    try {
      const [rows] = await connection.query<RowDataPacket[]>(`
        SELECT 
          'top-up' as type,
          id,
          amount,
          points,
          status,
          created_at as createdAt,
          CONCAT('เติมเงิน ', 
            CASE 
              WHEN payment_method = 'bank_transfer' THEN 'ผ่านการโอนเงิน'
              WHEN payment_method = 'true_wallet' THEN 'ผ่าน True Money Wallet'
              ELSE 'ผ่านช่องทางอื่น'
            END
          ) as details
        FROM topup_requests
        WHERE user_id = ?
        UNION ALL
        SELECT
          'purchase' as type,
          up.id,
          p.points as amount,
          p.points,
          'approved' as status,
          up.purchased_at as createdAt,
          CONCAT('ซื้อสินค้า ', p.title) as details
        FROM user_products up
        JOIN products p ON up.product_id = p.id
        WHERE up.user_id = ?
        ORDER BY createdAt DESC
      `, [session.user.id, session.user.id])
      
      return NextResponse.json(rows)
    } finally {
      connection.release()
    }
  } catch (error) {
    console.error('Failed to fetch financial transactions:', error)
    return NextResponse.json({ error: 'An unexpected error occurred' }, { status: 500 })
  }
}

