-- Create profiles table for user information
CREATE TABLE IF NOT EXISTS profiles (
  id UUID REFERENCES auth.users(id) PRIMARY KEY,
  discord_id TEXT,
  username TEXT,
  avatar_url TEXT,
  role TEXT DEFAULT 'user' CHECK (role IN ('user', 'admin')),
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- Create tickets table
CREATE TABLE IF NOT EXISTS tickets (
  id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
  title TEXT NOT NULL,
  description TEXT,
  status TEXT DEFAULT 'pending' CHECK (status IN ('pending', 'in_progress', 'completed', 'rejected')),
  priority TEXT DEFAULT 'medium' CHECK (priority IN ('low', 'medium', 'high', 'urgent')),
  user_id UUID REFERENCES profiles(id) NOT NULL,
  assigned_admin_id UUID REFERENCES profiles(id),
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- Create files table for uploaded files
CREATE TABLE IF NOT EXISTS ticket_files (
  id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
  ticket_id UUID REFERENCES tickets(id) ON DELETE CASCADE NOT NULL,
  filename TEXT NOT NULL,
  file_url TEXT NOT NULL,
  file_size BIGINT,
  file_type TEXT,
  uploaded_by UUID REFERENCES profiles(id) NOT NULL,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- Create ticket_comments table for communication
CREATE TABLE IF NOT EXISTS ticket_comments (
  id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
  ticket_id UUID REFERENCES tickets(id) ON DELETE CASCADE NOT NULL,
  user_id UUID REFERENCES profiles(id) NOT NULL,
  comment TEXT NOT NULL,
  is_admin_comment BOOLEAN DEFAULT FALSE,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- Enable Row Level Security
ALTER TABLE profiles ENABLE ROW LEVEL SECURITY;
ALTER TABLE tickets ENABLE ROW LEVEL SECURITY;
ALTER TABLE ticket_files ENABLE ROW LEVEL SECURITY;
ALTER TABLE ticket_comments ENABLE ROW LEVEL SECURITY;

-- RLS Policies for profiles
CREATE POLICY "Users can view their own profile" ON profiles
  FOR SELECT USING (auth.uid() = id);

CREATE POLICY "Users can update their own profile" ON profiles
  FOR UPDATE USING (auth.uid() = id);

CREATE POLICY "Admins can view all profiles" ON profiles
  FOR SELECT USING (
    EXISTS (
      SELECT 1 FROM profiles 
      WHERE id = auth.uid() AND role = 'admin'
    )
  );

-- RLS Policies for tickets
CREATE POLICY "Users can view their own tickets" ON tickets
  FOR SELECT USING (user_id = auth.uid());

CREATE POLICY "Users can create tickets" ON tickets
  FOR INSERT WITH CHECK (user_id = auth.uid());

CREATE POLICY "Users can update their own tickets" ON tickets
  FOR UPDATE USING (user_id = auth.uid());

CREATE POLICY "Admins can view all tickets" ON tickets
  FOR ALL USING (
    EXISTS (
      SELECT 1 FROM profiles 
      WHERE id = auth.uid() AND role = 'admin'
    )
  );

-- RLS Policies for ticket_files
CREATE POLICY "Users can view files from their tickets" ON ticket_files
  FOR SELECT USING (
    EXISTS (
      SELECT 1 FROM tickets 
      WHERE id = ticket_files.ticket_id AND user_id = auth.uid()
    )
  );

CREATE POLICY "Users can upload files to their tickets" ON ticket_files
  FOR INSERT WITH CHECK (
    EXISTS (
      SELECT 1 FROM tickets 
      WHERE id = ticket_files.ticket_id AND user_id = auth.uid()
    )
  );

CREATE POLICY "Admins can view all ticket files" ON ticket_files
  FOR ALL USING (
    EXISTS (
      SELECT 1 FROM profiles 
      WHERE id = auth.uid() AND role = 'admin'
    )
  );

-- RLS Policies for ticket_comments
CREATE POLICY "Users can view comments from their tickets" ON ticket_comments
  FOR SELECT USING (
    EXISTS (
      SELECT 1 FROM tickets 
      WHERE id = ticket_comments.ticket_id AND user_id = auth.uid()
    )
  );

CREATE POLICY "Users can add comments to their tickets" ON ticket_comments
  FOR INSERT WITH CHECK (
    EXISTS (
      SELECT 1 FROM tickets 
      WHERE id = ticket_comments.ticket_id AND user_id = auth.uid()
    )
  );

CREATE POLICY "Admins can view and add all comments" ON ticket_comments
  FOR ALL USING (
    EXISTS (
      SELECT 1 FROM profiles 
      WHERE id = auth.uid() AND role = 'admin'
    )
  );
