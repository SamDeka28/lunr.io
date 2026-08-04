-- Add INSERT policy for profiles table
-- This allows users to create their own profile if the trigger doesn't fire (e.g., OAuth users)

CREATE POLICY "Allow users to insert their own profile"
  ON profiles FOR INSERT
  TO authenticated
  WITH CHECK (auth.uid() = id);
