"use client"

import { useEffect, useState } from "react"
import { Button } from "@/components/ui/button"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs"
import { ArrowLeft, Users, FileText, CheckCircle, Clock } from "lucide-react"
import { supabase } from "@/lib/supabase/client"
import AdminTicketList from "@/components/admin/admin-ticket-list"
import type { Profile } from "@/lib/types"

export default function AdminPage() {
  const [profile, setProfile] = useState<Profile | null>(null)
  const [stats, setStats] = useState({
    totalTickets: 0,
    pendingTickets: 0,
    completedTickets: 0,
    totalUsers: 0,
  })
  const [loading, setLoading] = useState(true)

  useEffect(() => {
    const checkAdminAccess = async () => {
      const {
        data: { user },
      } = await supabase.auth.getUser()
      if (!user) {
        window.location.href = "/"
        return
      }

      // Get user profile and check admin role
      const { data: profileData } = await supabase.from("profiles").select("*").eq("id", user.id).single()

      if (!profileData || profileData.role !== "admin") {
        window.location.href = "/dashboard"
        return
      }

      setProfile(profileData)

      // Fetch stats
      const [ticketsResult, usersResult] = await Promise.all([
        supabase.from("tickets").select("status"),
        supabase.from("profiles").select("id"),
      ])

      const tickets = ticketsResult.data || []
      const users = usersResult.data || []

      setStats({
        totalTickets: tickets.length,
        pendingTickets: tickets.filter((t) => t.status === "pending").length,
        completedTickets: tickets.filter((t) => t.status === "completed").length,
        totalUsers: users.length,
      })

      setLoading(false)
    }

    checkAdminAccess()
  }, [])

  if (loading) {
    return <div className="min-h-screen flex items-center justify-center">กำลังโหลด...</div>
  }

  return (
    <div className="min-h-screen bg-gray-50">
      {/* Header */}
      <header className="bg-white shadow-sm border-b">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="flex justify-between items-center h-16">
            <div className="flex items-center space-x-4">
              <Button variant="ghost" size="sm" onClick={() => (window.location.href = "/dashboard")}>
                <ArrowLeft className="w-4 h-4 mr-2" />
                กลับ
              </Button>
              <h1 className="text-xl font-semibold">แผงควบคุมแอดมิน</h1>
            </div>
            <div className="flex items-center space-x-2">
              {profile?.avatar_url && (
                <img src={profile.avatar_url || "/placeholder.svg"} alt="Avatar" className="w-8 h-8 rounded-full" />
              )}
              <span className="text-sm font-medium">{profile?.username}</span>
            </div>
          </div>
        </div>
      </header>

      {/* Main Content */}
      <main className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        {/* Stats Cards */}
        <div className="grid grid-cols-1 md:grid-cols-4 gap-6 mb-8">
          <Card>
            <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
              <CardTitle className="text-sm font-medium">คำขอทั้งหมด</CardTitle>
              <FileText className="h-4 w-4 text-muted-foreground" />
            </CardHeader>
            <CardContent>
              <div className="text-2xl font-bold">{stats.totalTickets}</div>
            </CardContent>
          </Card>
          <Card>
            <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
              <CardTitle className="text-sm font-medium">รอดำเนินการ</CardTitle>
              <Clock className="h-4 w-4 text-muted-foreground" />
            </CardHeader>
            <CardContent>
              <div className="text-2xl font-bold text-yellow-600">{stats.pendingTickets}</div>
            </CardContent>
          </Card>
          <Card>
            <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
              <CardTitle className="text-sm font-medium">เสร็จสิ้น</CardTitle>
              <CheckCircle className="h-4 w-4 text-muted-foreground" />
            </CardHeader>
            <CardContent>
              <div className="text-2xl font-bold text-green-600">{stats.completedTickets}</div>
            </CardContent>
          </Card>
          <Card>
            <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
              <CardTitle className="text-sm font-medium">ผู้ใช้ทั้งหมด</CardTitle>
              <Users className="h-4 w-4 text-muted-foreground" />
            </CardHeader>
            <CardContent>
              <div className="text-2xl font-bold">{stats.totalUsers}</div>
            </CardContent>
          </Card>
        </div>

        {/* Tickets Management */}
        <Tabs defaultValue="all-tickets" className="space-y-6">
          <TabsList>
            <TabsTrigger value="all-tickets">จัดการคำขอ</TabsTrigger>
          </TabsList>

          <TabsContent value="all-tickets">
            <Card>
              <CardHeader>
                <CardTitle>คำขอทั้งหมด</CardTitle>
                <CardDescription>จัดการและอัปเดตสถานะคำขอจากผู้ใช้</CardDescription>
              </CardHeader>
              <CardContent>
                <AdminTicketList />
              </CardContent>
            </Card>
          </TabsContent>
        </Tabs>
      </main>
    </div>
  )
}
