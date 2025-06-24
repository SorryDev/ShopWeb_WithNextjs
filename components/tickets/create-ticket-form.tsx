"use client"

import type React from "react"

import { useState } from "react"
import { Button } from "@/components/ui/button"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { Textarea } from "@/components/ui/textarea"
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select"
import { Upload, X, File } from "lucide-react"
import { supabase } from "@/lib/supabase/client"
import { put } from "@vercel/blob"

interface CreateTicketFormProps {
  onSuccess: () => void
}

export default function CreateTicketForm({ onSuccess }: CreateTicketFormProps) {
  const [title, setTitle] = useState("")
  const [description, setDescription] = useState("")
  const [priority, setPriority] = useState<"low" | "medium" | "high" | "urgent">("medium")
  const [files, setFiles] = useState<File[]>([])
  const [loading, setLoading] = useState(false)

  const handleFileChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    if (e.target.files) {
      const newFiles = Array.from(e.target.files)
      setFiles((prev) => [...prev, ...newFiles])
    }
  }

  const removeFile = (index: number) => {
    setFiles((prev) => prev.filter((_, i) => i !== index))
  }

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    if (!title.trim() || !supabase) return

    setLoading(true)
    try {
      const {
        data: { user },
      } = await supabase.auth.getUser()
      if (!user) return

      // Create ticket
      const { data: ticket, error: ticketError } = await supabase
        .from("tickets")
        .insert({
          title: title.trim(),
          description: description.trim() || null,
          priority,
          user_id: user.id,
        })
        .select()
        .single()

      if (ticketError) throw ticketError

      // Upload files if any
      if (files.length > 0) {
        for (const file of files) {
          // Upload to Vercel Blob
          const blob = await put(`tickets/${ticket.id}/${file.name}`, file, {
            access: "public",
          })

          // Save file info to database
          await supabase.from("ticket_files").insert({
            ticket_id: ticket.id,
            filename: file.name,
            file_url: blob.url,
            file_size: file.size,
            file_type: file.type,
            uploaded_by: user.id,
          })
        }
      }

      // Reset form
      setTitle("")
      setDescription("")
      setPriority("medium")
      setFiles([])
      onSuccess()
    } catch (error) {
      console.error("Error creating ticket:", error)
    } finally {
      setLoading(false)
    }
  }

  return (
    <Card>
      <CardHeader>
        <CardTitle>สร้างคำขอใหม่</CardTitle>
        <CardDescription>กรอกรายละเอียดและอัปโหลดไฟล์ที่ต้องการให้ดำเนินการ</CardDescription>
      </CardHeader>
      <CardContent>
        <form onSubmit={handleSubmit} className="space-y-4">
          <div className="space-y-2">
            <Label htmlFor="title">หัวข้อ *</Label>
            <Input
              id="title"
              value={title}
              onChange={(e) => setTitle(e.target.value)}
              placeholder="ระบุหัวข้อคำขอ"
              required
            />
          </div>

          <div className="space-y-2">
            <Label htmlFor="description">รายละเอียด</Label>
            <Textarea
              id="description"
              value={description}
              onChange={(e) => setDescription(e.target.value)}
              placeholder="อธิบายรายละเอียดเพิ่มเติม"
              rows={4}
            />
          </div>

          <div className="space-y-2">
            <Label htmlFor="priority">ระดับความสำคัญ</Label>
            <Select value={priority} onValueChange={(value: any) => setPriority(value)}>
              <SelectTrigger>
                <SelectValue />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="low">ต่ำ</SelectItem>
                <SelectItem value="medium">ปานกลาง</SelectItem>
                <SelectItem value="high">สูง</SelectItem>
                <SelectItem value="urgent">เร่งด่วน</SelectItem>
              </SelectContent>
            </Select>
          </div>

          <div className="space-y-2">
            <Label>ไฟล์แนบ</Label>
            <div className="border-2 border-dashed border-gray-300 rounded-lg p-4">
              <input
                type="file"
                multiple
                onChange={handleFileChange}
                className="hidden"
                id="file-upload"
                accept="*/*"
              />
              <label htmlFor="file-upload" className="flex flex-col items-center justify-center cursor-pointer">
                <Upload className="w-8 h-8 text-gray-400 mb-2" />
                <span className="text-sm text-gray-600">คลิกเพื่อเลือกไฟล์</span>
              </label>
            </div>

            {files.length > 0 && (
              <div className="space-y-2">
                {files.map((file, index) => (
                  <div key={index} className="flex items-center justify-between bg-gray-50 p-2 rounded">
                    <div className="flex items-center space-x-2">
                      <File className="w-4 h-4" />
                      <span className="text-sm">{file.name}</span>
                      <span className="text-xs text-gray-500">({(file.size / 1024 / 1024).toFixed(2)} MB)</span>
                    </div>
                    <Button type="button" variant="ghost" size="sm" onClick={() => removeFile(index)}>
                      <X className="w-4 h-4" />
                    </Button>
                  </div>
                ))}
              </div>
            )}
          </div>

          <Button type="submit" disabled={loading || !title.trim()} className="w-full">
            {loading ? "กำลังสร้างคำขอ..." : "สร้างคำขอ"}
          </Button>
        </form>
      </CardContent>
    </Card>
  )
}
