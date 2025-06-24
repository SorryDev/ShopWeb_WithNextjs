-- Function to handle user creation after Discord auth
CREATE OR REPLACE FUNCTION handle_new_user()
RETURNS TRIGGER AS $$
BEGIN
  INSERT INTO profiles (id, discord_id, username, avatar_url)
  VALUES (
    NEW.id,
    NEW.raw_user_meta_data->>'provider_id',
    NEW.raw_user_meta_data->>'user_name',
    NEW.raw_user_meta_data->>'avatar_url'
  );
  RETURN NEW;
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;

-- Trigger to automatically create profile when user signs up
DROP TRIGGER IF EXISTS on_auth_user_created ON auth.users;
CREATE TRIGGER on_auth_user_created
  AFTER INSERT ON auth.users
  FOR EACH ROW EXECUTE FUNCTION handle_new_user();

-- Function to update ticket status
CREATE OR REPLACE FUNCTION update_ticket_status(
  ticket_id UUID,
  new_status TEXT,
  admin_comment TEXT DEFAULT NULL
)
RETURNS VOID AS $$
BEGIN
  -- Update ticket status
  UPDATE tickets 
  SET status = new_status, updated_at = NOW()
  WHERE id = ticket_id;
  
  -- Add admin comment if provided
  IF admin_comment IS NOT NULL THEN
    INSERT INTO ticket_comments (ticket_id, user_id, comment, is_admin_comment)
    VALUES (ticket_id, auth.uid(), admin_comment, TRUE);
  END IF;
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;
