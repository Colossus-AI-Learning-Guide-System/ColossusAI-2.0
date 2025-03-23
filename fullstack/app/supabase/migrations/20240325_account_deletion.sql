-- Enable RLS on profiles table
ALTER TABLE profiles ENABLE ROW LEVEL SECURITY;

-- Create policy to allow users to delete only their own profile
CREATE POLICY "Users can delete their own profile"
  ON profiles
  FOR DELETE
  USING (auth.uid() = id);

-- Update user_files table policy to allow deletion
CREATE POLICY "Users can delete their own files"
  ON user_files
  FOR DELETE
  USING (auth.uid() = user_id);

-- Add any other tables that need deletion policies here
-- Example:
-- CREATE POLICY "Users can delete their own messages"
--   ON messages
--   FOR DELETE
--   USING (auth.uid() = user_id);

-- Create function to check if a user can perform admin actions (for staff/admins)
CREATE OR REPLACE FUNCTION can_delete_users()
RETURNS boolean AS $$
BEGIN
  -- Add logic here if you need role-based checks
  -- For now, only the user themselves can delete their account
  RETURN TRUE;
END;
$$ LANGUAGE plpgsql SECURITY DEFINER; 