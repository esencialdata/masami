-- ALERTA: La tabla configuration seguía bloqueada ('true').
-- Este script lo corrige.

ALTER TABLE public.configuration DISABLE ROW LEVEL SECURITY;

-- Verificación final
SELECT tablename, rowsecurity FROM pg_tables WHERE tablename = 'configuration';
