'use client'

import { useState, useEffect } from 'react'
import Image from 'next/image'
import { Button } from "@/components/ui/button"
import { PurchaseModal } from "@/components/PurchaseModal"
import { useProducts } from '@/app/hooks/use-products'
import { useSession } from "next-auth/react"
import { useRouter } from 'next/navigation'

function getYouTubeEmbedUrl(url: string | null): string | null {
  if (!url) return null
  
  const regExp = /^.*(youtu.be\/|v\/|u\/\w\/|embed\/|watch\?v=|&v=)([^#&?]*).*/
  const match = url.match(regExp)
  
  return match && match[2].length === 11 
    ? `https://www.youtube.com/embed/${match[2]}`
    : null
}

export default function ProductDetail({ params }: { params: { id: string } }) {
  const { product, isLoading } = useProducts(params.id)
  const { data: session, status } = useSession()
  const [isPurchaseModalOpen, setIsPurchaseModalOpen] = useState(false)
  const [userPoints, setUserPoints] = useState<number | null>(null)
  const router = useRouter()

  useEffect(() => {
    async function fetchUserPoints() {
      if (status === "authenticated") {
        try {
          const response = await fetch('/api/user')
          if (response.ok) {
            const data = await response.json()
            setUserPoints(data.points)
          } else {
            console.error('Failed to fetch user points')
          }
        } catch (error) {
          console.error('Error fetching user points:', error)
        }
      }
    }

    fetchUserPoints()
  }, [status, userPoints]) // Add userPoints to the dependency array

  if (isLoading) {
    return <div className="text-center text-white py-8">กำลังโหลด...</div>
  }

  if (!product) {
    return <div className="text-center text-white py-8">ไม่พบสินค้า</div>
  }

  const embedUrl = getYouTubeEmbedUrl(product.video_url)

  const handlePurchaseComplete = (updatedPoints: number) => {
    setUserPoints(updatedPoints)
    router.refresh() // This will trigger a re-render of the page
  }

  const handleRedirectToProfile = () => {
    router.push('/profile')
  }

  return (
    <div className="container mx-auto px-4 py-8">
      <div className="max-w-4xl mx-auto">
        {/* Header */}
        <div className="bg-white/5 backdrop-blur-sm rounded-lg p-4 mb-4">
          <div className="flex justify-between items-center">
            <div className="flex items-center gap-2">
              <span className="text-white">ซื้อ</span>
              <h1 className="text-white font-medium">{product.title}</h1>
              <span className="text-white">ในราคา</span>
            </div>
            <div className="flex items-center gap-4">
              <span className="text-[#5eead4] text-xl font-medium">{product.points.toLocaleString()} Points</span>
              <Button 
                className="bg-[#5eead4] text-black hover:bg-[#5eead4]/90"
                onClick={() => setIsPurchaseModalOpen(true)}
              >
                ซื้อเลย!
              </Button>
            </div>
          </div>
        </div>

        {/* Video Preview */}
        {embedUrl && (
          <div className="aspect-video w-full mb-4">
            <iframe
              className="w-full h-full rounded-lg"
              src={embedUrl}
              title={product.title}
              allow="accelerometer; autoplay; clipboard-write; encrypted-media; gyroscope; picture-in-picture"
              allowFullScreen
              referrerPolicy="strict-origin-when-cross-origin"
            />
          </div>
        )}

        {/* Product Info */}
        <div className="grid gap-4">
          <div className="bg-white/5 backdrop-blur-sm rounded-lg p-4">
            <div className="flex items-center gap-4 mb-4">
              <div className="relative w-32 aspect-video">
                <Image
                  src={product.image}
                  alt={product.title}
                  fill
                  className="object-cover rounded-lg"
                />
              </div>
              <div>
                <div className="text-gray-400 text-sm mb-1">{product.category}</div>
                <h2 className="text-white font-medium">{product.title}</h2>
                <p className="text-gray-400 text-sm mt-1">{product.description}</p>
                <div className="text-[#5eead4] mt-2">{product.points.toLocaleString()} Points</div>
              </div>
            </div>
          </div>

          {/* Product Details */}
          <div className="bg-white/5 backdrop-blur-sm rounded-lg p-4">
            <h3 className="text-white font-medium mb-2">ข้อมูลสินค้า (v{product.version})</h3>
            <div className="bg-[#1a1d21] rounded-lg p-4 text-sm">
              <p className="text-gray-400" dangerouslySetInnerHTML={{ __html: product.details }} />
            </div>
            <div className="bg-[#1a1d21] rounded-lg p-4 mt-4 text-sm">
              <p className="text-gray-400" dangerouslySetInnerHTML={{ __html: product.requirements }} />
            </div>
          </div>
        </div>
      </div>

      <PurchaseModal
        isOpen={isPurchaseModalOpen}
        onClose={() => setIsPurchaseModalOpen(false)}
        onPurchaseComplete={handlePurchaseComplete}
        onRedirectToProfile={handleRedirectToProfile}
        productId={product.id}
        productName={product.title}
        productPrice={product.points}
        userPoints={userPoints || 0}
      />
    </div>
  )
}
