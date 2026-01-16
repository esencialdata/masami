-- MANUAL CONFIRMATION SCRIPT
-- Run this if Supabase is not sending emails (common in Free Tier due to limits)

-- Replace 'el_correo_del_usuario@ejemplo.com' with the actual email
UPDATE auth.users
SET email_confirmed_at = now()
WHERE email = 'el_correo_del_usuario@ejemplo.com';

-- Verify the change
SELECT email, email_confirmed_at FROM auth.users WHERE email = 'el_correo_del_usuario@ejemplo.com';
