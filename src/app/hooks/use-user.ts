'use client'

import { useState, useEffect } from 'react'
import { useSession } from 'next-auth/react'

interface User {
  id: string
  name: string
  email: string
  points: number
}

export function useUser() {
  const { data: session, status } = useSession()
  const [user, setUser] = useState<User | null>(null)

  useEffect(() => {
    async function fetchUserData() {
      if (session?.user?.id) {
        // Replace this with an actual API call to fetch user data
        const response = await fetch(`/api/users/${session.user.id}`)
        const userData = await response.json()
        setUser(userData)
      }
    }

    if (status === 'authenticated') {
      fetchUserData()
    }
  }, [session, status])

  return { user, isLoading: status === 'loading' }
}

