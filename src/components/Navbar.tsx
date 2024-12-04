'use client'

import { useEffect, useState } from 'react'
import Image from 'next/image'
import Link from 'next/link'
import { useRouter, usePathname } from 'next/navigation'
import { DiscordLogoIcon } from '@radix-ui/react-icons'
import { signIn, signOut, useSession } from "next-auth/react"
import { Button } from "@/components/ui/button"

export default function Navbar() {
  const { data: session, status } = useSession()
  const [error, setError] = useState<string | null>(null)
  const [imageError, setImageError] = useState(false)
  const [userPoints, setUserPoints] = useState<number | null>(null)
  const [isPointsLoading, setIsPointsLoading] = useState(false);
  const [userRanks, setUserRanks] = useState<{ vps_rank: number; machine_rank: number; base_rank: number } | null>(null);
  const router = useRouter()
  const pathname = usePathname()

  useEffect(() => {
    async function fetchUserData() {
      if (status === "authenticated") {
        setIsPointsLoading(true)
        try {
          const response = await fetch('/api/user')
          if (response.ok) {
            const data = await response.json()
            setUserPoints(data.points)
            setUserRanks({
              vps_rank: data.vps_rank,
              machine_rank: data.machine_rank,
              base_rank: data.base_rank
            })
          } else {
            console.error('Failed to fetch user data')
          }
        } catch (error) {
          console.error('Error fetching user data:', error)
        } finally {
          setIsPointsLoading(false)
        }
      }
    }

    fetchUserData()
  }, [status, pathname])

  const handleSignIn = async () => {
    try {
      const result = await signIn('discord', { redirect: false })
      if (result?.error) {
        setError(result.error)
      } else if (result?.url) {
        router.push(result.url)
      }
    } catch (e) {
      setError('An unexpected error occurred')
    }
  }

  const handleSignOut = async () => {
    const data = await signOut({ redirect: false, callbackUrl: "/" })
    router.push(data.url)
  }

  const handleImageError = () => {
    setImageError(true)
  }

  return (
    <nav className="bg-[rgb(26,29,35)] fixed w-full z-50">
      <div className="container mx-auto px-4 py-2">
        <div className="w-full flex items-center justify-between">
          <div className="flex items-center gap-8">
            <Link href="/" className="flex items-center gap-2">
              <Image 
                src="/logo.png"
                alt="Zc Developer"
                width={40}
                height={40}
                className="rounded-lg"
              />
              <span className="text-white font-medium">Zc-Developer</span>
            </Link>
            
            <div className="hidden md:flex items-center gap-6 text-gray-400">
              <Link href="/scripts" className="hover:text-white transition">สคริปต์</Link>
              <Link href="/theme" className="hover:text-white transition">Theme</Link>
              <Link href="/guide" className="hover:text-white transition">คู่มือการใช้งาน</Link>
              <Link href="/discord" className="hover:text-white transition">Discord</Link>
            </div>
          </div>

          {status === "authenticated" && session ? (
            <div className="flex items-center gap-4">
              <Link href="/topup" className="text-[#5eead4] hover:underline">
                เติมเงิน
              </Link>
              <div className="text-gray-400">
                <span className="mr-1">{isPointsLoading ? 'Loading...' : userPoints !== null ? userPoints.toLocaleString() : '0'}</span>
                Points
              </div>
              {session.user.role === 'admin' && (
                <Link href="/admin">
                  <Button variant="outline" size="sm" className="text-white">
                    Admin Dashboard
                  </Button>
                </Link>
              )}
              {userRanks?.vps_rank === 1 && (
                <Button
                  onClick={() => router.push('/vps')}
                  variant="outline"
                  size="sm"
                  className="text-white"
                >
                  VPS Dashboard
                </Button>
              )}
              <div className="flex items-center gap-2">
                <Link href="/profile">
                  {session.user.image && !imageError ? (
                    <Image
                      src={session.user.image}
                      alt={session.user.name || 'User'}
                      width={32}
                      height={32}
                      className="rounded-full hover:opacity-80 transition"
                      onError={handleImageError}
                    />
                  ) : (
                    <div className="w-8 h-8 rounded-full bg-gray-600 flex items-center justify-center text-white hover:bg-gray-500 transition">
                      {session.user.name ? session.user.name[0].toUpperCase() : 'U'}
                    </div>
                  )}
                </Link>
                <button 
                  className="text-gray-400 hover:text-white transition"
                  onClick={handleSignOut}
                  aria-label="Logout"
                >
                  <svg
                    xmlns="http://www.w3.org/2000/svg"
                    width="20"
                    height="20"
                    viewBox="0 0 24 24"
                    fill="none"
                    stroke="currentColor"
                    strokeWidth="2"
                    strokeLinecap="round"
                    strokeLinejoin="round"
                  >
                    <path d="M9 21H5a2 2 0 0 1-2-2V5a2 2 0 0 1 2-2h4" />
                    <polyline points="16 17 21 12 16 7" />
                    <line x1="21" y1="12" x2="9" y2="12" />
                  </svg>
                </button>
              </div>
            </div>
          ) : (
            <button
              onClick={handleSignIn}
              className="bg-[#5865F2] text-white px-4 py-2 rounded-md hover:bg-[#5865F2]/90 transition flex items-center gap-2"
            >
              <DiscordLogoIcon className="w-5 h-5" />
              เข้าสู่ระบบด้วย Discord
            </button>
          )}
        </div>
        {error && (
          <div className="bg-red-500 text-white p-2 text-center mt-2">
            Error: {error}
          </div>
        )}
      </div>
    </nav>
  )
}

