'use client'

import { useEffect, useState } from 'react'
import { signIn, useSession } from "next-auth/react"
import { useRouter, useSearchParams } from 'next/navigation'

export default function SignIn() {
  const router = useRouter()
  const { data: session, status } = useSession()
  const [isLoading, setIsLoading] = useState(true)
  const searchParams = useSearchParams()
  const callbackUrl = searchParams.get('callbackUrl') || '/'

  useEffect(() => {
    if (session) {
      router.push(callbackUrl)
    } else if (status !== 'loading') {
      setIsLoading(false)
    }
  }, [session, status, router, callbackUrl])

  const handleSignIn = async () => {
    try {
      await signIn('discord', { callbackUrl })
    } catch (error) {
      console.error('Sign in error:', error)
    }
  }

  if (isLoading) {
    return <div>Loading...</div>
  }

  return (
    <div className="flex items-center justify-center min-h-screen bg-gray-100">
      <div className="p-6 bg-white rounded-lg shadow-md">
        <h1 className="text-2xl font-bold mb-4">เข้าสู่ระบบ</h1>
        <button
          className="bg-[#5865F2] text-white px-4 py-2 rounded-md hover:bg-[#5865F2]/90 transition flex items-center gap-2"
          onClick={handleSignIn}
        >
          เข้าสู่ระบบด้วย Discord
        </button>
      </div>
    </div>
  )
}

