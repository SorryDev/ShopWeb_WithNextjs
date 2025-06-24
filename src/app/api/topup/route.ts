import { NextResponse } from 'next/server'
import { getServerSession } from "next-auth/next"
import { authOptions } from "@/app/api/auth/[...nextauth]/route"
import pool from '@/lib/db'
import { v4 as uuidv4 } from 'uuid'
import { z } from 'zod'

const topupSchema = z.object({
  points: z.number().positive(),
  amount: z.number().positive(),
  paymentMethod: z.enum(['bank_transfer', 'true_wallet']),
  date: z.string().datetime(),
})

export async function POST(request: Request) {
  const session = await getServerSession(authOptions)

  if (!session?.user?.id) {
    return NextResponse.json({ error: 'Not authenticated' }, { status: 401 })
  }

  try {
    const formData = await request.formData()
    const data = Object.fromEntries(formData)
    
    const validatedData = topupSchema.parse({
      points: Number(data.points),
      amount: Number(data.amount),
      paymentMethod: data.paymentMethod,
      date: data.date,
    })

    const proofFile = formData.get('proof') as File

    // Handle file upload (you'll need to implement your own file upload logic)
    const proofUrl = await uploadFile(proofFile)

    // Create top-up request
    const [result] = await pool.query(
      'INSERT INTO topup_requests (id, user_id, amount, points, payment_method, proof_image, transaction_date, created_at) VALUES (?, ?, ?, ?, ?, ?, ?, NOW())',
      [uuidv4(), session.user.id, validatedData.amount, validatedData.points, validatedData.paymentMethod, proofUrl, new Date(validatedData.date)]
    )

    return NextResponse.json({ success: true, message: 'Top-up request submitted successfully' })
  } catch (error) {
    if (error instanceof z.ZodError) {
      return NextResponse.json({ error: 'Invalid input data', details: error.errors }, { status: 400 })
    }
    console.error('Failed to create top-up request:', error)
    return NextResponse.json({ error: 'An unexpected error occurred' }, { status: 500 })
  }
}

// Implement your own file upload logic
async function uploadFile(file: File): Promise<string> {
  // This is a placeholder. You should implement actual file upload logic
  // For example, upload to a cloud storage service like AWS S3 or Google Cloud Storage
  return '/placeholder-proof.png'
}
