import { createClient } from "@supabase/supabase-js"
import { cookies } from "next/headers"

export async function createServerClient() {
  const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL
  const supabaseAnonKey = process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY

  if (!supabaseUrl || !supabaseAnonKey) {
    throw new Error("Supabase environment variables are not configured")
  }

  const cookieStore = await cookies()

  return createClient(supabaseUrl, supabaseAnonKey, {
    auth: {
      storage: {
        getItem: (key: string) => {
          return cookieStore.get(key)?.value
        },
        setItem: (key: string, value: string) => {
          cookieStore.set({ name: key, value })
        },
        removeItem: (key: string) => {
          cookieStore.set({ name: key, value: "", expires: new Date(0) })
        },
      },
    },
  })
}
