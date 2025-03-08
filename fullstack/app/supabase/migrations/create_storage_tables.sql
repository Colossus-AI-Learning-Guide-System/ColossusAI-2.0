-- Update the profiles table
ALTER TABLE profiles
ADD COLUMN subscription_plan text DEFAULT 'free',
ADD COLUMN memory_enabled boolean DEFAULT true;

-- Create a table for tracking file storage
CREATE TABLE user_files (
  id uuid DEFAULT uuid_generate_v4() PRIMARY KEY,
  user_id uuid REFERENCES auth.users NOT NULL,
  file_name text NOT NULL,
  file_size bigint NOT NULL,
  file_type text,
  created_at timestamp with time zone DEFAULT timezone('utc'::text, now()) NOT NULL
);

-- Add RLS policies
ALTER TABLE user_files ENABLE ROW LEVEL SECURITY;

CREATE POLICY "Users can only access their own files"
  ON user_files
  FOR ALL
  USING (auth.uid() = user_id);

