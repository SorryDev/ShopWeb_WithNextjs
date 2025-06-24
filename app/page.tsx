import { createServerClient } from "@/lib/supabase/server"
import { redirect } from "next/navigation"
import LoginForm from "@/components/auth/login-form"
import SetupRequired from "@/components/setup-required"

export default async function HomePage() {
  // Check if Supabase is configured
  const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL
  const supabaseAnonKey = process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY

  if (!supabaseUrl || !supabaseAnonKey) {
    return <SetupRequired />
  }

  try {
    const supabase = await createServerClient()
    const {
      data: { user },
    } = await supabase.auth.getUser()

    if (user) {
      redirect("/dashboard")
    }
  } catch (error) {
    console.warn("Error checking user:", error)
  }

  return <LoginForm />
}
