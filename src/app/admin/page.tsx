'use client'

import { useSession } from "next-auth/react"
import { useRouter } from "next/navigation"
import { useEffect } from "react"
import Link from "next/link"

export default function AdminDashboard() {
  const { data: session, status } = useSession()
  const router = useRouter()

  useEffect(() => {
    if (status === "unauthenticated") {
      router.push("/login")
    } else if (status === "authenticated" && session?.user?.role !== "admin") {
      router.push("/")
    }
  }, [status, session, router])

  if (status === "loading") {
    return <div>Loading...</div>
  }

  if (status === "authenticated" && session?.user?.role === "admin") {
    return (
      <div className="container mx-auto px-4 py-8">
        <h1 className="text-2xl font-bold mb-6">Admin Dashboard</h1>
        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
          <Link href="/admin/scripts" className="p-4 bg-blue-500 text-white rounded-lg hover:bg-blue-600 transition">
            Manage Scripts
          </Link>
          <Link href="/admin/topup-requests" className="p-4 bg-green-500 text-white rounded-lg hover:bg-green-600 transition">
            Manage Top-up Requests
          </Link>
        </div>
      </div>
    )
  }

  return null
}

