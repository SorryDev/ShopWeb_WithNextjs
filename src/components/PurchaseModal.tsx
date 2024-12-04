'use client'

import { useState, useEffect } from 'react'
import { XCircle } from 'lucide-react'
import { Button } from "@/components/ui/button"
import {
  Dialog,
  DialogContent,
  DialogFooter,
} from "@/components/ui/dialog"

interface PurchaseModalProps {
  isOpen: boolean
  onClose: () => void
  onPurchaseComplete: (updatedPoints: number) => void
  productId: string
  productName: string
  productPrice: number
  userPoints: number
  onRedirectToProfile: () => void // Add this line
}

export function PurchaseModal({
  isOpen,
  onClose,
  onPurchaseComplete,
  productId,
  productName,
  productPrice,
  userPoints,
  onRedirectToProfile // Add this line
}: PurchaseModalProps) {
  const [isLoading, setIsLoading] = useState(false)
  const [hasEnoughPoints, setHasEnoughPoints] = useState(false)
  const [pointsNeeded, setPointsNeeded] = useState(0)
  const [error, setError] = useState<string | null>(null)

  useEffect(() => {
    setHasEnoughPoints(userPoints >= productPrice)
    setPointsNeeded(Math.max(0, productPrice - userPoints))
  }, [userPoints, productPrice])

  const handleConfirm = async () => {
    setIsLoading(true)
    setError(null)

    try {
      const response = await fetch('/api/purchase', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({ productId }),
      })

      if (!response.ok) {
        const data = await response.json()
        throw new Error(data.error || 'Failed to process purchase')
      }

      const updatedPoints = userPoints - productPrice
      onPurchaseComplete(updatedPoints)
      onRedirectToProfile() // Add this line
      onClose()
    } catch (err) {
      setError(err instanceof Error ? err.message : 'An unexpected error occurred')
    } finally {
      setIsLoading(false)
    }
  }

  return (
    <Dialog open={isOpen} onOpenChange={onClose}>
      <DialogContent className="sm:max-w-[425px] p-0 overflow-hidden bg-gray-50 rounded-lg">
        {!hasEnoughPoints && (
          <div className="p-6">
            <div className="flex flex-col items-center text-center">
              <XCircle className="w-8 h-8 text-red-500 mb-4" />
              <p className="text-gray-900 mb-2">
                คุณมีเงินไม่เพียงพอในการซื้อสินค้านี้
              </p>
              <p className="text-gray-600 text-sm">
                *คุณต้องเติมเงินเพิ่มอีกอย่างน้อย {pointsNeeded.toLocaleString()} Points
              </p>
            </div>
            <DialogFooter className="mt-6">
              <Button 
                className="w-full bg-[#5eead4] text-black hover:bg-[#5eead4]/90"
                onClick={onClose}
              >
                รับทราบ
              </Button>
            </DialogFooter>
          </div>
        )}
        
        {hasEnoughPoints && (
          <div className="p-6">
            <div className="text-center mb-6">
              <h3 className="text-lg font-medium text-gray-800 mb-2">
                ยืนยันการซื้อ
              </h3>
              <p className="text-gray-700">
                คุณต้องการซื้อ {productName} ในราคา {productPrice.toLocaleString()} Points หรือไม่?
              </p>
            </div>
            {error && (
              <div className="bg-red-100 border border-red-400 text-red-700 px-4 py-3 rounded relative mb-4" role="alert">
                <strong className="font-bold">Error:</strong>
                <span className="block sm:inline"> {error}</span>
              </div>
            )}
            <DialogFooter className="flex gap-2">
              <Button
                variant="outline"
                onClick={onClose}
                className="flex-1 text-black"
              >
                ยกเลิก
              </Button>
              <Button
                onClick={handleConfirm}
                disabled={isLoading}
                className="flex-1 bg-[#5eead4] text-black hover:bg-[#5eead4]/90"
              >
                {isLoading ? 'กำลังดำเนินการ...' : 'ยืนยันการซื้อ'}
              </Button>
            </DialogFooter>
          </div>
        )}
      </DialogContent>
    </Dialog>
  )
}

