"use client"

import { useEffect, useState } from "react"
import { Button } from "@/components/ui/button"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs"
import { LogOut, FileText, Settings } from "lucide-react"
import { supabase } from "@/lib/supabase/client"
import CreateTicketForm from "@/components/tickets/create-ticket-form"
import TicketList from "@/components/tickets/ticket-list"
import TicketDetailModal from "@/components/tickets/ticket-detail-modal"
import type { Ticket, Profile } from "@/lib/types"

export default function DashboardPage() {
  const [user, setUser] = useState<any>(null)
  const [profile, setProfile] = useState<Profile | null>(null)
  const [selectedTicket, setSelectedTicket] = useState<Ticket | null>(null)
  const [showCreateForm, setShowCreateForm] = useState(false)
  const [refreshTrigger, setRefreshTrigger] = useState(0)
  const [loading, setLoading] = useState(true)

  useEffect(() => {
    const getUser = async () => {
      if (!supabase) {
        window.location.href = "/"
        return
      }

      const {
        data: { user },
      } = await supabase.auth.getUser()
      if (!user) {
        window.location.href = "/"
        return
      }

      setUser(user)

      // Get user profile
      const { data: profileData } = await supabase.from("profiles").select("*").eq("id", user.id).single()

      setProfile(profileData)
      setLoading(false)
    }

    getUser()
  }, [])

  const handleSignOut = async () => {
    await supabase.auth.signOut()
    window.location.href = "/"
  }

  const handleCreateSuccess = () => {
    setShowCreateForm(false)
    setRefreshTrigger((prev) => prev + 1)
  }

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
              <FileText className="w-8 h-8 text-indigo-600" />
              <h1 className="text-xl font-semibold">ระบบจัดการไฟล์งาน</h1>
            </div>
            <div className="flex items-center space-x-4">
              <div className="flex items-center space-x-2">
                {profile?.avatar_url && (
                  <img src={profile.avatar_url || "/placeholder.svg"} alt="Avatar" className="w-8 h-8 rounded-full" />
                )}
                <span className="text-sm font-medium">{profile?.username || user?.email}</span>
                {profile?.role === "admin" && (
                  <Button variant="outline" size="sm" onClick={() => (window.location.href = "/admin")}>
                    <Settings className="w-4 h-4 mr-2" />
                    แอดมิน
                  </Button>
                )}
              </div>
              <Button variant="ghost" size="sm" onClick={handleSignOut}>
                <LogOut className="w-4 h-4 mr-2" />
                ออกจากระบบ
              </Button>
            </div>
          </div>
        </div>
      </header>

      {/* Main Content */}
      <main className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        <Tabs defaultValue="tickets" className="space-y-6">
          <div className="flex items-center justify-between">
            <TabsList>
              <TabsTrigger value="tickets">คำขอของฉัน</TabsTrigger>
              <TabsTrigger value="create">สร้างคำขอใหม่</TabsTrigger>
            </TabsList>
          </div>

          <TabsContent value="tickets" className="space-y-6">
            <Card>
              <CardHeader>
                <CardTitle>คำขอทั้งหมด</CardTitle>
                <CardDescription>จัดการและติดตามสถานะคำขอของคุณ</CardDescription>
              </CardHeader>
              <CardContent>
                <TicketList onViewTicket={setSelectedTicket} refreshTrigger={refreshTrigger} />
              </CardContent>
            </Card>
          </TabsContent>

          <TabsContent value="create">
            <CreateTicketForm onSuccess={handleCreateSuccess} />
          </TabsContent>
        </Tabs>
      </main>

      {/* Ticket Detail Modal */}
      <TicketDetailModal ticket={selectedTicket} open={!!selectedTicket} onClose={() => setSelectedTicket(null)} />
    </div>
  )
}
