"use client"

import { useEffect, useState } from "react"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { Badge } from "@/components/ui/badge"
import { Button } from "@/components/ui/button"
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select"
import { Textarea } from "@/components/ui/textarea"
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
} from "@/components/ui/dialog"
import { Calendar, User, MessageSquare } from "lucide-react"
import { supabase } from "@/lib/supabase/client"
import type { Ticket } from "@/lib/types"

const statusLabels = {
  pending: "รอดำเนินการ",
  in_progress: "กำลังดำเนินการ",
  completed: "เสร็จสิ้น",
  rejected: "ปฏิเสธ",
}

const statusColors = {
  pending: "bg-yellow-100 text-yellow-800",
  in_progress: "bg-blue-100 text-blue-800",
  completed: "bg-green-100 text-green-800",
  rejected: "bg-red-100 text-red-800",
}

const priorityLabels = {
  low: "ต่ำ",
  medium: "ปานกลาง",
  high: "สูง",
  urgent: "เร่งด่วน",
}

export default function AdminTicketList() {
  const [tickets, setTickets] = useState<Ticket[]>([])
  const [loading, setLoading] = useState(true)
  const [selectedTicket, setSelectedTicket] = useState<Ticket | null>(null)
  const [newStatus, setNewStatus] = useState<string>("")
  const [adminComment, setAdminComment] = useState("")
  const [updating, setUpdating] = useState(false)

  const fetchTickets = async () => {
    try {
      const { data, error } = await supabase
        .from("tickets")
        .select(`
          *,
          profiles:user_id (
            username,
            avatar_url,
            discord_id
          )
        `)
        .order("created_at", { ascending: false })

      if (error) throw error
      setTickets(data || [])
    } catch (error) {
      console.error("Error fetching tickets:", error)
    } finally {
      setLoading(false)
    }
  }

  const handleUpdateStatus = async () => {
    if (!selectedTicket || !newStatus) return

    setUpdating(true)
    try {
      // Update ticket status
      const { error: updateError } = await supabase
        .from("tickets")
        .update({
          status: newStatus,
          updated_at: new Date().toISOString(),
        })
        .eq("id", selectedTicket.id)

      if (updateError) throw updateError

      // Add admin comment if provided
      if (adminComment.trim()) {
        const {
          data: { user },
        } = await supabase.auth.getUser()
        if (user) {
          const { error: commentError } = await supabase.from("ticket_comments").insert({
            ticket_id: selectedTicket.id,
            user_id: user.id,
            comment: adminComment.trim(),
            is_admin_comment: true,
          })

          if (commentError) throw commentError
        }
      }

      // Reset form and refresh
      setSelectedTicket(null)
      setNewStatus("")
      setAdminComment("")
      fetchTickets()
    } catch (error) {
      console.error("Error updating ticket:", error)
    } finally {
      setUpdating(false)
    }
  }

  useEffect(() => {
    fetchTickets()
  }, [])

  if (loading) {
    return <div className="text-center py-8">กำลังโหลด...</div>
  }

  return (
    <div className="space-y-4">
      {tickets.map((ticket) => (
        <Card key={ticket.id} className="hover:shadow-md transition-shadow">
          <CardHeader>
            <div className="flex items-start justify-between">
              <div className="flex-1">
                <CardTitle className="text-lg">{ticket.title}</CardTitle>
                <CardDescription className="mt-1">
                  ผู้สร้าง: {ticket.profiles?.username || "ไม่ระบุ"} • รหัส: #{ticket.id.substring(0, 8)}
                </CardDescription>
                {ticket.description && (
                  <p className="text-sm text-gray-600 mt-2">
                    {ticket.description.length > 150
                      ? `${ticket.description.substring(0, 150)}...`
                      : ticket.description}
                  </p>
                )}
              </div>
              <div className="flex flex-col gap-2 ml-4">
                <Badge className={statusColors[ticket.status]}>{statusLabels[ticket.status]}</Badge>
                <Badge variant="outline">{priorityLabels[ticket.priority]}</Badge>
              </div>
            </div>
          </CardHeader>
          <CardContent>
            <div className="flex items-center justify-between">
              <div className="flex items-center space-x-4 text-sm text-gray-600">
                <div className="flex items-center space-x-1">
                  <Calendar className="w-4 h-4" />
                  <span>{new Date(ticket.created_at).toLocaleDateString("th-TH")}</span>
                </div>
                <div className="flex items-center space-x-1">
                  <User className="w-4 h-4" />
                  <span>อัปเดต: {new Date(ticket.updated_at).toLocaleDateString("th-TH")}</span>
                </div>
              </div>
              <Dialog>
                <DialogTrigger asChild>
                  <Button
                    variant="outline"
                    size="sm"
                    onClick={() => {
                      setSelectedTicket(ticket)
                      setNewStatus(ticket.status)
                    }}
                  >
                    <MessageSquare className="w-4 h-4 mr-2" />
                    จัดการ
                  </Button>
                </DialogTrigger>
                <DialogContent className="max-w-md">
                  <DialogHeader>
                    <DialogTitle>อัปเดตสถานะคำขอ</DialogTitle>
                    <DialogDescription>
                      #{selectedTicket?.id.substring(0, 8)} - {selectedTicket?.title}
                    </DialogDescription>
                  </DialogHeader>
                  <div className="space-y-4">
                    <div className="space-y-2">
                      <label className="text-sm font-medium">สถานะใหม่</label>
                      <Select value={newStatus} onValueChange={setNewStatus}>
                        <SelectTrigger>
                          <SelectValue />
                        </SelectTrigger>
                        <SelectContent>
                          <SelectItem value="pending">รอดำเนินการ</SelectItem>
                          <SelectItem value="in_progress">กำลังดำเนินการ</SelectItem>
                          <SelectItem value="completed">เสร็จสิ้น</SelectItem>
                          <SelectItem value="rejected">ปฏิเสธ</SelectItem>
                        </SelectContent>
                      </Select>
                    </div>
                    <div className="space-y-2">
                      <label className="text-sm font-medium">ความคิดเห็นจากแอดมิน (ไม่บังคับ)</label>
                      <Textarea
                        value={adminComment}
                        onChange={(e) => setAdminComment(e.target.value)}
                        placeholder="เพิ่มความคิดเห็นหรือหมายเหตุ..."
                        rows={3}
                      />
                    </div>
                    <div className="flex justify-end space-x-2">
                      <Button
                        variant="outline"
                        onClick={() => {
                          setSelectedTicket(null)
                          setNewStatus("")
                          setAdminComment("")
                        }}
                      >
                        ยกเลิก
                      </Button>
                      <Button onClick={handleUpdateStatus} disabled={updating || !newStatus}>
                        {updating ? "กำลังอัปเดต..." : "อัปเดต"}
                      </Button>
                    </div>
                  </div>
                </DialogContent>
              </Dialog>
            </div>
          </CardContent>
        </Card>
      ))}
    </div>
  )
}
