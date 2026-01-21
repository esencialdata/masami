-- ==========================================
-- SCRIPT DE LIMPIEZA DE TRIGGERS (Fix Login)
-- ==========================================

-- El trigger anterior intentaba crear un negocio automáticamente al registrarse.
-- Como ahora tenemos un "Wizard" (Paso a paso), ese trigger falla porque le faltan datos.
-- Este script lo desactiva para que el registro sea limpio.

DROP TRIGGER IF EXISTS on_auth_user_created ON auth.users;
DROP FUNCTION IF EXISTS public.handle_new_user();
