import { getServerSession } from "next-auth/next"
import { authOptions } from "@/app/api/auth/[...nextauth]/route"
import pool from '@/lib/db'
import Image from 'next/image'

interface PurchasedProduct {
  id: string
  title: string
  description: string
  image: string
  purchased_at: string
}

async function getPurchasedProducts(userId: string): Promise<PurchasedProduct[]> {
  const [rows] = await pool.query(`
    SELECT p.id, p.title, p.description, p.image, up.purchased_at
    FROM user_products up
    JOIN products p ON up.product_id = p.id
    WHERE up.user_id = ?
    ORDER BY up.purchased_at DESC
  `, [userId])
  
  return rows as PurchasedProduct[]
}

export default async function PurchasedProductsPage() {
  const session = await getServerSession(authOptions)
  
  if (!session || !session.user?.id) {
    return <div className="text-center text-white py-8">Please log in to view your purchased products.</div>
  }

  const purchasedProducts = await getPurchasedProducts(session.user.id)

  return (
    <div className="container mx-auto px-4 py-8">
      <h1 className="text-2xl font-bold text-white mb-6">Your Purchased Products</h1>
      {purchasedProducts.length === 0 ? (
        <p className="text-white">You haven't purchased any products yet.</p>
      ) : (
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
          {purchasedProducts.map((product) => (
            <div key={product.id} className="bg-white/5 backdrop-blur-sm rounded-lg overflow-hidden">
              <div className="relative aspect-video">
                <Image
                  src={product.image}
                  alt={product.title}
                  fill
                  className="object-cover"
                />
              </div>
              <div className="p-4">
                <h2 className="text-white font-medium mb-2">{product.title}</h2>
                <p className="text-gray-400 text-sm mb-2">{product.description}</p>
                <p className="text-gray-400 text-xs">
                  Purchased on: {new Date(product.purchased_at).toLocaleDateString()}
                </p>
              </div>
            </div>
          ))}
        </div>
      )}
    </div>
  )
}

