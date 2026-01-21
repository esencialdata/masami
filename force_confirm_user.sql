-- ⚠️ SCRIPT DE EMERGENCIA: CONFIRMACIÓN MANUAL DE USUARIO
-- Usa esto si el correo de Supabase no llega o tarda mucho.

BEGIN;

-- 1. Confirmar el último usuario registrado (el que acabas de crear)
WITH target_user AS (
    SELECT id, email 
    FROM auth.users 
    ORDER BY created_at DESC 
    LIMIT 1
)
UPDATE auth.users
SET 
    email_confirmed_at = now(),
    confirmed_at = now(),
    last_sign_in_at = now(),
    raw_app_meta_data = raw_app_meta_data || '{"provider": "email", "providers": ["email"]}'::jsonb
FROM target_user
WHERE auth.users.id = target_user.id
RETURNING auth.users.email as "Usuario Confirmado", auth.users.email_confirmed_at as "Fecha Confirmación";

-- 2. Asegurarse que tenga un perfil creado (por si el trigger falló al no estar confirmado)
INSERT INTO public.profiles (id, full_name, role)
SELECT 
    id, 
    COALESCE(raw_user_meta_data->>'full_name', 'Usuario Nuevo'), 
    'owner'
FROM auth.users
WHERE id = (SELECT id FROM auth.users ORDER BY created_at DESC LIMIT 1)
ON CONFLICT (id) DO NOTHING;

COMMIT;
