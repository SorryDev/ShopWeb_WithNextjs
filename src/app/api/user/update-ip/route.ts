import { NextResponse } from 'next/server'
import { getServerSession } from "next-auth/next"
import { authOptions } from "@/app/api/auth/[...nextauth]/route"
import pool from '@/lib/db'

export async function POST(request: Request) {
  const session = await getServerSession(authOptions)

  if (!session || !session.user?.id) {
    return NextResponse.json({ error: 'Not authenticated' }, { status: 401 })
  }

  try {
    const { id, productId, ipAddress } = await request.json()
    if (!id || !productId || !ipAddress) {
      return NextResponse.json({ error: 'ID, Product ID, and IP address are required' }, { status: 400 })
    }

    const connection = await pool.getConnection()
    try {
      await connection.beginTransaction()

      // First, check if the product exists and belongs to the user
      const [rows] = await connection.query(
        'SELECT * FROM user_products WHERE product_id = ? AND id = ? AND user_id = ?',
        [productId, id, session.user.id]
      )

      console.log('Query result:', rows) // Log the query result

      if ((rows as any[]).length === 0) {
        await connection.rollback()
        console.log('Product not found or not owned by user. User ID:', session.user.id, 'Product ID:', productId)
        return NextResponse.json({ error: 'Product not found or not owned by user' }, { status: 404 })
      }

      // If the product exists and belongs to the user, update the IP
      const [result] = await connection.query(
        'UPDATE user_products SET ip_server = ?, last_ip_update = NOW() WHERE id = ? AND product_id = ? AND user_id = ?',
        [ipAddress, id, productId, session.user.id]
      )

      console.log('Update result:', result) // Log the update result

      if ((result as any).affectedRows === 0) {
        await connection.rollback()
        console.log('Failed to update IP address. User ID:', session.user.id, 'Product ID:', productId)
        return NextResponse.json({ error: 'Failed to update IP address' }, { status: 500 })
      }

      await connection.commit()
      return NextResponse.json({ success: true, message: 'IP address updated successfully', id })
    } catch (error) {
      await connection.rollback()
      console.error('Database error:', error)
      return NextResponse.json({ error: 'Database error', details: (error as Error).message }, { status: 500 })
    } finally {
      connection.release()
    }
  } catch (error) {
    console.error('Server error:', error)
    return NextResponse.json({ error: 'Server error', details: (error as Error).message }, { status: 500 })
  }
}

