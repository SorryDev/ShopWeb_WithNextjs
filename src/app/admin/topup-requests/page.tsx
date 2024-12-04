'use client'

import { useSession } from "next-auth/react"
import { useRouter } from "next/navigation"
import { useEffect, useState } from "react"
import Image from 'next/image'
import { ImageModal } from "@/components/ImageModal"
import { Button } from "@/components/ui/button"

interface TopUpRequest {
  id: string
  userId: string
  userName: string
  userImage: string
  amount: number
  points: number
  paymentMethod: string
  proofImage: string
  status: 'pending' | 'approved' | 'rejected'
  createdAt: string
  transactionDate: string
}

export default function ManageTopUpRequests() {
  const { data: session, status } = useSession()
  const router = useRouter()
  const [requests, setRequests] = useState<TopUpRequest[]>([])
  const [selectedImage, setSelectedImage] = useState<string | null>(null)

  useEffect(() => {
    if (status === "unauthenticated") {
      router.push("/login")
    } else if (status === "authenticated" && session?.user?.role !== "admin") {
      router.push("/")
    } else if (status === "authenticated" && session?.user?.role === "admin") {
      fetchTopUpRequests()
    }
  }, [status, session, router])

  const fetchTopUpRequests = async () => {
    const response = await fetch('/api/admin/topup-requests')
    if (response.ok) {
      const data = await response.json()
      setRequests(data)
    }
  }

  const handleApprove = async (id: string) => {
    try {
      const response = await fetch(`/api/admin/topup-requests/${id}/approve`, {
        method: 'POST',
      })
      if (response.ok) {
        const data = await response.json()
        alert(data.message)
        fetchTopUpRequests()
      } else {
        const errorData = await response.json()
        throw new Error(errorData.error || 'Failed to approve the request')
      }
    } catch (error) {
      alert(error instanceof Error ? error.message : 'An unexpected error occurred')
    }
  }

  const handleReject = async (id: string) => {
    const response = await fetch(`/api/admin/topup-requests/${id}/reject`, {
      method: 'POST',
    })
    if (response.ok) {
      fetchTopUpRequests()
    } else {
      alert('Failed to reject the request')
    }
  }

  const formatDate = (dateString: string) => {
    const date = new Date(dateString)
    return isNaN(date.getTime()) ? 'Invalid Date' : date.toLocaleString('th-TH', { timeZone: 'Asia/Bangkok' })
  }

  if (status === "loading") {
    return <div>Loading...</div>
  }

  if (status === "authenticated" && session?.user?.role === "admin") {
    return (
      <div className="container mx-auto px-4 py-8">
        <h1 className="text-2xl font-bold mb-6">Manage Top-up Requests</h1>
        <div className="overflow-x-auto">
          <table className="min-w-full bg-white">
            <thead>
              <tr>
                <th className="px-4 py-2 text-left text-black">User</th>
                <th className="px-4 py-2 text-left text-black">Amount</th>
                <th className="px-4 py-2 text-left text-black">Points</th>
                <th className="px-4 py-2 text-left text-black">Payment Method</th>
                <th className="px-4 py-2 text-left text-black">Transaction Date</th>
                <th className="px-4 py-2 text-left text-black">Proof</th>
                <th className="px-4 py-2 text-left text-black">Status</th>
                <th className="px-4 py-2 text-left text-black">Created At</th>
                <th className="px-4 py-2 text-left text-black">Actions</th>
              </tr>
            </thead>
            <tbody>
              {requests.map((request) => (
                <tr key={request.id}>
                  <td className="border px-4 py-2 text-black">
                    <div className="flex items-center space-x-3">
                      <div className="relative w-10 h-10 rounded-full overflow-hidden">
                        <Image
                          src={request.userImage || '/placeholder-avatar.png'}
                          alt={request.userName}
                          layout="fill"
                          objectFit="cover"
                        />
                      </div>
                      <div>
                        <div>{request.userName}</div>
                        <div className="text-sm text-gray-500">{request.userId}</div>
                      </div>
                    </div>
                  </td>
                  <td className="border px-4 py-2 text-black">{request.amount}</td>
                  <td className="border px-4 py-2 text-black">{request.points}</td>
                  <td className="border px-4 py-2 text-black">
                    {request.paymentMethod === 'bank_transfer' ? 'Bank Transfer' : 'True Money Wallet'}
                  </td>
                  <td className="border px-4 py-2 text-black">{formatDate(request.transactionDate)}</td>
                  <td className="border px-4 py-2 text-black">
                    {request.proofImage && (
                      <Button
                        variant="ghost"
                        className="p-0"
                        onClick={() => setSelectedImage(request.proofImage)}
                      >
                        <Image
                          src={request.proofImage}
                          alt="Proof"
                          width={50}
                          height={50}
                          className="rounded-md"
                        />
                      </Button>
                    )}
                  </td>
                  <td className="border px-4 py-2 text-black">{request.status}</td>
                  <td className="border px-4 py-2 text-black">{formatDate(request.createdAt)}</td>
                  <td className="border px-4 py-2 text-black">
                    {request.status === 'pending' && (
                      <>
                        <Button
                          onClick={() => handleApprove(request.id)}
                          variant="outline"
                          size="sm"
                          className="mr-2"
                        >
                          Approve
                        </Button>
                        <Button
                          onClick={() => handleReject(request.id)}
                          variant="outline"
                          size="sm"
                        >
                          Reject
                        </Button>
                      </>
                    )}
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
        <ImageModal
          isOpen={!!selectedImage}
          onClose={() => setSelectedImage(null)}
          imageUrl={selectedImage || ''}
        />
      </div>
    )
  }

  return null
}

