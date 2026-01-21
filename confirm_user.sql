-- ==========================================
-- SCRIPT DE CONFIRMACIÓN MANUAL (Bypass Email)
-- ==========================================

-- Supabase Free Tier limita los emails a 3 por hora.
-- Usa este script para confirmar tu usuario manualmente sin esperar el correo.

-- Confirmar TODOS los usuarios pendientes:
UPDATE auth.users
SET email_confirmed_at = now()
WHERE email_confirmed_at IS NULL;

-- O confirma uno específico (descomenta y edita si prefieres):
-- UPDATE auth.users
-- SET email_confirmed_at = now()
-- WHERE email = 'tu_correo@ejemplo.com';
