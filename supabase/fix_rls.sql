-- Fix RLS policy for user_settings table
-- This allows users to insert their own settings during registration

-- Drop existing policy if it exists
DROP POLICY IF EXISTS "Users can insert their own settings" ON user_settings;

-- Create new policy that allows users to insert their own settings
CREATE POLICY "Users can insert their own settings"
ON user_settings
FOR INSERT
TO authenticated
WITH CHECK (auth.uid() = user_id);

-- Verify the policy
SELECT schemaname, tablename, policyname, permissive, roles, cmd, qual, with_check
FROM pg_policies
WHERE tablename = 'user_settings';
