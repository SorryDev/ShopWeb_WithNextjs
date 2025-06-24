"use client"

import { useEffect, useState } from "react"
import { Dialog, DialogContent, DialogDescription, DialogHeader, DialogTitle } from "@/components/ui/dialog"
import { Badge } from "@/components/ui/badge"
import { Button } from "@/components/ui/button"
import { Textarea } from "@/components/ui/textarea"
import { Separator } from "@/components/ui/separator"
import { Download, File, MessageCircle, Send, Calendar, User } from "lucide-react"
import { supabase } from "@/lib/supabase/client"
import type { Ticket, TicketFile, TicketComment } from "@/lib/types"

interface TicketDetailModalProps {
  ticket: Ticket | null
  open: boolean
  onClose: () => void
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

export default function TicketDetailModal({ ticket, open, onClose }: TicketDetailModalProps) {
  const [files, setFiles] = useState<TicketFile[]>([])
  const [comments, setComments] = useState<TicketComment[]>([])
  const [newComment, setNewComment] = useState("")
  const [loading, setLoading] = useState(false)

  const fetchTicketDetails = async () => {
    if (!ticket) return

    try {
      // Fetch files
      const { data: filesData } = await supabase
        .from("ticket_files")
        .select("*")
        .eq("ticket_id", ticket.id)
        .order("created_at", { ascending: true })

      setFiles(filesData || [])

      // Fetch comments
      const { data: commentsData } = await supabase
        .from("ticket_comments")
        .select(`
          *,
          profiles:user_id (
            username,
            avatar_url,
            role
          )
        `)
        .eq("ticket_id", ticket.id)
        .order("created_at", { ascending: true })

      setComments(commentsData || [])
    } catch (error) {
      console.error("Error fetching ticket details:", error)
    }
  }

  const handleAddComment = async () => {
    if (!ticket || !newComment.trim()) return

    setLoading(true)
    try {
      const {
        data: { user },
      } = await supabase.auth.getUser()
      if (!user) return

      const { error } = await supabase.from("ticket_comments").insert({
        ticket_id: ticket.id,
        user_id: user.id,
        comment: newComment.trim(),
        is_admin_comment: false,
      })

      if (error) throw error

      setNewComment("")
      fetchTicketDetails()
    } catch (error) {
      console.error("Error adding comment:", error)
    } finally {
      setLoading(false)
    }
  }

  useEffect(() => {
    if (open && ticket) {
      fetchTicketDetails()
    }
  }, [open, ticket])

  if (!ticket) return null

  return (
    <Dialog open={open} onOpenChange={onClose}>
      <DialogContent className="max-w-4xl max-h-[80vh] overflow-y-auto">
        <DialogHeader>
          <div className="flex items-start justify-between">
            <div>
              <DialogTitle className="text-xl">{ticket.title}</DialogTitle>
              <DialogDescription className="mt-2">รหัสคำขอ: #{ticket.id.substring(0, 8)}</DialogDescription>
            </div>
            <div className="flex flex-col gap-2">
              <Badge className={statusColors[ticket.status]}>{statusLabels[ticket.status]}</Badge>
              <Badge variant="outline">{priorityLabels[ticket.priority]}</Badge>
            </div>
          </div>
        </DialogHeader>

        <div className="space-y-6">
          {/* Ticket Info */}
          <div className="grid grid-cols-2 gap-4 text-sm">
            <div className="flex items-center space-x-2">
              <Calendar className="w-4 h-4 text-gray-500" />
              <span>สร้างเมื่อ: {new Date(ticket.created_at).toLocaleString("th-TH")}</span>
            </div>
            <div className="flex items-center space-x-2">
              <User className="w-4 h-4 text-gray-500" />
              <span>อัปเดตล่าสุด: {new Date(ticket.updated_at).toLocaleString("th-TH")}</span>
            </div>
          </div>

          {/* Description */}
          {ticket.description && (
            <div>
              <h4 className="font-medium mb-2">รายละเอียด</h4>
              <p className="text-gray-700 bg-gray-50 p-3 rounded-lg">{ticket.description}</p>
            </div>
          )}

          {/* Files */}
          {files.length > 0 && (
            <div>
              <h4 className="font-medium mb-3">ไฟล์แนบ ({files.length})</h4>
              <div className="grid grid-cols-1 md:grid-cols-2 gap-3">
                {files.map((file) => (
                  <div key={file.id} className="flex items-center justify-between bg-gray-50 p-3 rounded-lg">
                    <div className="flex items-center space-x-3">
                      <File className="w-5 h-5 text-gray-500" />
                      <div>
                        <p className="font-medium text-sm">{file.filename}</p>
                        {file.file_size && (
                          <p className="text-xs text-gray-500">{(file.file_size / 1024 / 1024).toFixed(2)} MB</p>
                        )}
                      </div>
                    </div>
                    <Button variant="ghost" size="sm" onClick={() => window.open(file.file_url, "_blank")}>
                      <Download className="w-4 h-4" />
                    </Button>
                  </div>
                ))}
              </div>
            </div>
          )}

          <Separator />

          {/* Comments */}
          <div>
            <h4 className="font-medium mb-3 flex items-center space-x-2">
              <MessageCircle className="w-4 h-4" />
              <span>ความคิดเห็น ({comments.length})</span>
            </h4>

            <div className="space-y-4 max-h-60 overflow-y-auto">
              {comments.map((comment) => (
                <div
                  key={comment.id}
                  className={`p-3 rounded-lg ${
                    comment.is_admin_comment ? "bg-blue-50 border-l-4 border-blue-500" : "bg-gray-50"
                  }`}
                >
                  <div className="flex items-center justify-between mb-2">
                    <div className="flex items-center space-x-2">
                      <span className="font-medium text-sm">{comment.profiles?.username || "ผู้ใช้"}</span>
                      {comment.is_admin_comment && (
                        <Badge variant="secondary" className="text-xs">
                          แอดมิน
                        </Badge>
                      )}
                    </div>
                    <span className="text-xs text-gray-500">
                      {new Date(comment.created_at).toLocaleString("th-TH")}
                    </span>
                  </div>
                  <p className="text-sm text-gray-700">{comment.comment}</p>
                </div>
              ))}
            </div>

            {/* Add Comment */}
            <div className="mt-4 space-y-3">
              <Textarea
                value={newComment}
                onChange={(e) => setNewComment(e.target.value)}
                placeholder="เพิ่มความคิดเห็น..."
                rows={3}
              />
              <Button onClick={handleAddComment} disabled={loading || !newComment.trim()} size="sm">
                <Send className="w-4 h-4 mr-2" />
                {loading ? "กำลังส่ง..." : "ส่งความคิดเห็น"}
              </Button>
            </div>
          </div>
        </div>
      </DialogContent>
    </Dialog>
  )
}
