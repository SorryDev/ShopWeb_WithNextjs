'use server'

import pool from '@/lib/db'
import { RowDataPacket } from 'mysql2'

export interface Product {
  id: string
  category: string
  title: string
  description: string
  points: number
  image: string
  video_url: string | null
  version: string
  details: string
  requirements: string
}

export async function getProducts(): Promise<Product[]> {
  try {
    const [rows] = await pool.query('SELECT * FROM products ORDER BY created_at DESC') as [RowDataPacket[], any]
    return rows as Product[]
  } catch (error) {
    console.error('Failed to fetch products:', error)
    return []
  }
}

export async function getProductById(id: string): Promise<Product | null> {
  try {
    const [rows] = await pool.query('SELECT * FROM products WHERE id = ?', [id]) as [RowDataPacket[], any]
    return (rows[0] as Product) || null
  } catch (error) {
    console.error('Failed to fetch product:', error)
    return null
  }
}
