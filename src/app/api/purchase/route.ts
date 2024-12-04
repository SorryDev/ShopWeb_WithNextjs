import { NextResponse } from 'next/server'
import { getServerSession } from "next-auth/next"
import { authOptions } from "@/app/api/auth/[...nextauth]/route"
import pool from '@/lib/db'

export async function POST(request: Request) {
  const session = await getServerSession(authOptions)

  if (!session || !session.user?.id) {
    return NextResponse.json({ error: 'Not authenticated' }, { status: 401 })
  }

  const { productId } = await request.json()

  if (!productId) {
    return NextResponse.json({ error: 'Product ID is required' }, { status: 400 })
  }

  try {
    // Start a transaction
    await pool.query('BEGIN')

    // Get the product details
    const { rows: productRows } = await pool.query('SELECT * FROM products WHERE id = $1', [productId])
    const product = productRows[0]

    if (!product) {
      await pool.query('ROLLBACK')
      return NextResponse.json({ error: 'Product not found' }, { status: 404 })
    }

    // Check if the user has enough points
    const { rows: userRows } = await pool.query('SELECT points FROM users WHERE id = $1', [session.user.id])
    const user = userRows[0]

    if (user.points < product.points) {
      await pool.query('ROLLBACK')
      return NextResponse.json({ error: 'Insufficient points' }, { status: 400 })
    }

    // Deduct points from the user
    await pool.query('UPDATE users SET points = points - $1 WHERE id = $2', [product.points, session.user.id])

    // Add the product to the user's inventory
    await pool.query('INSERT INTO user_products (user_id, product_id, purchased_at) VALUES ($1, $2, NOW())', [session.user.id, productId])

    // Commit the transaction
    await pool.query('COMMIT')

    return NextResponse.json({ success: true, message: 'Purchase successful' })
  } catch (error) {
    await pool.query('ROLLBACK')
    console.error('Failed to process purchase:', error)
    return NextResponse.json({ error: 'Failed to process purchase' }, { status: 500 })
  }
}

