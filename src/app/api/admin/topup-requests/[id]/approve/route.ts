import { NextResponse } from 'next/server'
import { getServerSession } from "next-auth/next"
import { authOptions } from "@/app/api/auth/[...nextauth]/route"
import pool from '@/lib/db'

export async function POST(
  request: Request,
  { params }: { params: { id: string } }
) {
  const session = await getServerSession(authOptions)

  if (!session || session.user?.role !== 'admin') {
    return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })
  }

  const { id } = params

  try {
    // Start a transaction
    await pool.query('START TRANSACTION')

    // Update the top-up request status
    const [updateResult] = await pool.query(
      'UPDATE topup_requests SET status = ? WHERE id = ?',
      ['approved', id]
    )

    // Get the top-up request details
    const [requestRows] = await pool.query(
      'SELECT user_id, points FROM topup_requests WHERE id = ?',
      [id]
    )
    const request = (requestRows as any)[0]

    if (!request) {
      await pool.query('ROLLBACK')
      return NextResponse.json({ error: 'Top-up request not found' }, { status: 404 })
    }

    // Add points to the user's account
    await pool.query(
      'UPDATE users SET points = points + ? WHERE id = ?',
      [request.points, request.user_id]
    )

    // Commit the transaction
    await pool.query('COMMIT')

    return NextResponse.json({ success: true, message: 'Top-up request approved successfully' })
  } catch (error) {
    await pool.query('ROLLBACK')
    console.error('Failed to approve top-up request:', error)
    return NextResponse.json({ error: 'Internal server error' }, { status: 500 })
  }
}
