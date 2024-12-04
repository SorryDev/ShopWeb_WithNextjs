import { NextResponse } from 'next/server'
import { getServerSession } from "next-auth/next"
import { authOptions } from "@/app/api/auth/[...nextauth]/route"
import pool from '@/lib/db'
import { RowDataPacket, ResultSetHeader } from 'mysql2'

export async function POST(request: Request) {
  const session = await getServerSession(authOptions)

  if (!session || !session.user?.id) {
    return NextResponse.json({ error: 'Not authenticated' }, { status: 401 })
  }

  const { productId } = await request.json()

  if (!productId) {
    return NextResponse.json({ error: 'Product ID is required' }, { status: 400 })
  }

  const connection = await pool.getConnection()

  try {
    await connection.beginTransaction()

    // Get the product details
    const [productRows] = await connection.query<RowDataPacket[]>(
      'SELECT * FROM products WHERE id = ?',
      [productId]
    )
    const product = productRows[0]

    if (!product) {
      await connection.rollback()
      return NextResponse.json({ error: 'Product not found' }, { status: 404 })
    }

    // Check if the user has enough points
    const [userRows] = await connection.query<RowDataPacket[]>(
      'SELECT points FROM users WHERE id = ?',
      [session.user.id]
    )
    const user = userRows[0]

    if (user.points < product.points) {
      await connection.rollback()
      return NextResponse.json({ error: 'Insufficient points' }, { status: 400 })
    }

    // Deduct points from the user
    await connection.query<ResultSetHeader>(
      'UPDATE users SET points = points - ? WHERE id = ?',
      [product.points, session.user.id]
    )

    // Add the product to the user's inventory
    await connection.query<ResultSetHeader>(
      'INSERT INTO user_products (user_id, product_id, purchased_at) VALUES (?, ?, NOW())',
      [session.user.id, productId]
    )

    // Commit the transaction
    await connection.commit()

    return NextResponse.json({ success: true, message: 'Purchase successful' })
  } catch (error) {
    await connection.rollback()
    console.error('Failed to process purchase:', error)
    return NextResponse.json({ error: 'Failed to process purchase' }, { status: 500 })
  } finally {
    connection.release()
  }
}

