'use client'

import { useRouter } from 'next/navigation'
import ProductGrid from './product-grid'

export default function ScriptsPage() {
  const router = useRouter()

  const handleSetupIPClick = () => {
    router.push('/profile')
  }

  return (
    <div className="container mx-auto px-4 py-8">
      <div className="flex items-center justify-between mb-6">
        <h1 className="text-2xl font-semibold text-white">สคริปต์ของเรา</h1>
        <button 
          onClick={handleSetupIPClick}
          className="bg-[#5eead4] text-black px-4 py-2 rounded-md hover:bg-[#5eead4]/90 transition"
        >
          ตั้งค่า IP Server
        </button>
      </div>
      <ProductGrid />
    </div>
  )
}
