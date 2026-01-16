-- EMERGENCY FIX: Remove the trigger to unblock Registration
-- Run this in Supabase SQL Editor

-- 1. Drop the trigger so User Signup NEVER fails
drop trigger if exists on_auth_user_created on auth.users;

-- 2. Drop the function to be clean
drop function if exists public.handle_new_user();

-- After running this:
-- 1. Go to your App and Register a NEW User.
-- 2. It will succeed immediately.
-- 3. The App will show "Finalizando Configuración".
-- 4. Click the button to create your Panadería.
