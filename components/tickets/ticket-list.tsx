"use client"

import { useEffect, useState } from "react"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { Badge } from "@/components/ui/badge"
import { Button } from "@/components/ui/button"
import { Eye, Calendar, User, AlertCircle } from "lucide-react"
import { supabase } from "@/lib/supabase/client"
import type { Ticket } from "@/lib/types"

interface TicketListProps {
  onViewTicket: (ticket: Ticket) => void
  refreshTrigger?: number
}

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

const priorityColors = {
  low: "bg-gray-100 text-gray-800",
  medium: "bg-blue-100 text-blue-800",
  high: "bg-orange-100 text-orange-800",
  urgent: "bg-red-100 text-red-800",
}

export default function TicketList({ onViewTicket, refreshTrigger }: TicketListProps) {
  const [tickets, setTickets] = useState<Ticket[]>([])
  const [loading, setLoading] = useState(true)

  const fetchTickets = async () => {
    if (!supabase) return

    try {
      const {
        data: { user },
      } = await supabase.auth.getUser()
      if (!user) return

      const { data, error } = await supabase
        .from("tickets")
        .select(`
          *,
          profiles:user_id (
            username,
            avatar_url
          )
        `)
        .eq("user_id", user.id)
        .order("created_at", { ascending: false })

      if (error) throw error
      setTickets(data || [])
    } catch (error) {
      console.error("Error fetching tickets:", error)
    } finally {
      setLoading(false)
    }
  }

  useEffect(() => {
    fetchTickets()
  }, [refreshTrigger])

  if (loading) {
    return <div className="text-center py-8">กำลังโหลด...</div>
  }

  if (tickets.length === 0) {
    return (
      <Card>
        <CardContent className="text-center py-8">
          <AlertCircle className="w-12 h-12 text-gray-400 mx-auto mb-4" />
          <p className="text-gray-600">ยังไม่มีคำขอ</p>
        </CardContent>
      </Card>
    )
  }

  return (
    <div className="space-y-4">
      {tickets.map((ticket) => (
        <Card key={ticket.id} className="hover:shadow-md transition-shadow">
          <CardHeader>
            <div className="flex items-start justify-between">
              <div className="flex-1">
                <CardTitle className="text-lg">{ticket.title}</CardTitle>
                {ticket.description && (
                  <CardDescription className="mt-1">
                    {ticket.description.length > 100
                      ? `${ticket.description.substring(0, 100)}...`
                      : ticket.description}
                  </CardDescription>
                )}
              </div>
              <div className="flex flex-col gap-2 ml-4">
                <Badge className={statusColors[ticket.status]}>{statusLabels[ticket.status]}</Badge>
                <Badge variant="outline" className={priorityColors[ticket.priority]}>
                  {priorityLabels[ticket.priority]}
                </Badge>
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
                  <span>#{ticket.id.substring(0, 8)}</span>
                </div>
              </div>
              <Button variant="outline" size="sm" onClick={() => onViewTicket(ticket)}>
                <Eye className="w-4 h-4 mr-2" />
                ดูรายละเอียด
              </Button>
            </div>
          </CardContent>
        </Card>
      ))}
    </div>
  )
}
