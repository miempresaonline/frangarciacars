/*
  # Fix RLS Infinite Recursion in Profiles Table

  ## Problem
  The original RLS policies for the profiles table contained self-referential subqueries
  that caused infinite recursion when Supabase evaluated policies. Specifically, the
  "Admins can view all profiles" policy tried to check if a user was an admin by querying
  the profiles table, which triggered RLS evaluation again, creating a loop.

  ## Solution
  Create a SECURITY DEFINER function that bypasses RLS to check user roles, then use
  that function in policies instead of recursive subqueries.

  ## Changes
  1. Create is_admin() function with SECURITY DEFINER
  2. Drop problematic recursive policies from profiles table
  3. Recreate profiles policies using the new function
*/

-- Create helper function with SECURITY DEFINER to avoid RLS recursion
CREATE OR REPLACE FUNCTION is_admin(user_id uuid)
RETURNS boolean AS $$
BEGIN
  RETURN EXISTS (SELECT 1 FROM profiles WHERE id = user_id AND role = 'admin');
END;
$$ LANGUAGE plpgsql STABLE SECURITY DEFINER SET search_path = public;

-- Drop existing problematic policies on profiles table
DROP POLICY IF EXISTS "Admins can view all profiles" ON profiles;
DROP POLICY IF EXISTS "Users can view own profile" ON profiles;
DROP POLICY IF EXISTS "Admins can insert profiles" ON profiles;
DROP POLICY IF EXISTS "Admins can update all profiles" ON profiles;
DROP POLICY IF EXISTS "Users can update own profile" ON profiles;

-- Recreate profiles policies without recursive subqueries
CREATE POLICY "Users can view own profile"
  ON profiles FOR SELECT
  TO authenticated
  USING (id = auth.uid());

CREATE POLICY "Admins can view all profiles"
  ON profiles FOR SELECT
  TO authenticated
  USING (is_admin(auth.uid()));

CREATE POLICY "Admins can insert profiles"
  ON profiles FOR INSERT
  TO authenticated
  WITH CHECK (is_admin(auth.uid()));

CREATE POLICY "Admins can update all profiles"
  ON profiles FOR UPDATE
  TO authenticated
  USING (is_admin(auth.uid()))
  WITH CHECK (is_admin(auth.uid()));

CREATE POLICY "Users can update own profile"
  ON profiles FOR UPDATE
  TO authenticated
  USING (id = auth.uid())
  WITH CHECK (id = auth.uid());
