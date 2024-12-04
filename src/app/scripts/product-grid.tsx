'use client'

import Image from 'next/image'
import Link from 'next/link'
import { useProducts } from './use-products'
import type { Product } from '../actions/products'

export default function ProductGrid() {
  const { products, loading } = useProducts()

  if (loading) {
    return <div className="text-white text-center">กำลังโหลด...</div>
  }

  return (
    <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
      {products.map((product) => (
        <Link 
          key={product.id} 
          href={`/scripts/${product.id}`}
          className="bg-[#1a1d21] rounded-lg overflow-hidden hover:ring-2 hover:ring-[#5eead4]/50 transition-all duration-200"
        >
          <div className="relative aspect-video">
            <Image
              src={product.image}
              alt={product.title}
              fill
              className="object-cover"
            />
          </div>
          <div className="p-4">
            <div className="text-sm text-gray-400 mb-1">{product.category}</div>
            <h2 className="text-white font-medium mb-1">{product.title}</h2>
            <p className="text-gray-400 text-sm mb-2">{product.description}</p>
            <div className="text-[#5eead4]">{product.points.toLocaleString()} Points</div>
          </div>
        </Link>
      ))}
    </div>
  )
}

