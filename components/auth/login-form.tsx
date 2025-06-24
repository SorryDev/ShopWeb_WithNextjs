"use client"

import { useState } from "react"
import { Button } from "@/components/ui/button"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { supabase } from "@/lib/supabase/client"
import { MessageSquare } from "lucide-react"

export default function LoginForm() {
  const [loading, setLoading] = useState(false)

  const handleDiscordLogin = async () => {
    if (!supabase) {
      alert("Supabase is not configured. Please add the Supabase integration.")
      return
    }

    try {
      setLoading(true)
      const { error } = await supabase.auth.signInWithOAuth({
        provider: "discord",
        options: {
          redirectTo: `${window.location.origin}/auth/callback`,
        },
      })

      if (error) {
        console.error("Error logging in:", error.message)
      }
    } catch (error) {
      console.error("Error:", error)
    } finally {
      setLoading(false)
    }
  }

  return (
    <div className="min-h-screen flex items-center justify-center bg-gradient-to-br from-blue-50 to-indigo-100">
      <Card className="w-full max-w-md">
        <CardHeader className="text-center">
          <div className="mx-auto mb-4 w-12 h-12 bg-indigo-100 rounded-full flex items-center justify-center">
            <MessageSquare className="w-6 h-6 text-indigo-600" />
          </div>
          <CardTitle className="text-2xl">ระบบจัดการไฟล์งาน</CardTitle>
          <CardDescription>เข้าสู่ระบบด้วย Discord เพื่อสร้างและจัดการคำขอของคุณ</CardDescription>
        </CardHeader>
        <CardContent>
          <Button
            onClick={handleDiscordLogin}
            disabled={loading}
            className="w-full bg-[#5865F2] hover:bg-[#4752C4] text-white"
            size="lg"
          >
            {loading ? "กำลังเข้าสู่ระบบ..." : "เข้าสู่ระบบด้วย Discord"}
          </Button>
        </CardContent>
      </Card>
    </div>
  )
}
