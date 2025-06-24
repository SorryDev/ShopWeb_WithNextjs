export interface Profile {
  id: string
  discord_id?: string
  username?: string
  avatar_url?: string
  role: "user" | "admin"
  created_at: string
  updated_at: string
}

export interface Ticket {
  id: string
  title: string
  description?: string
  status: "pending" | "in_progress" | "completed" | "rejected"
  priority: "low" | "medium" | "high" | "urgent"
  user_id: string
  assigned_admin_id?: string
  created_at: string
  updated_at: string
  profiles?: Profile
}

export interface TicketFile {
  id: string
  ticket_id: string
  filename: string
  file_url: string
  file_size?: number
  file_type?: string
  uploaded_by: string
  created_at: string
}

export interface TicketComment {
  id: string
  ticket_id: string
  user_id: string
  comment: string
  is_admin_comment: boolean
  created_at: string
  profiles?: Profile
}
