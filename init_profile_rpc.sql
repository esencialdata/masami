-- 🛠️ SCRIPT DE RESPALDO: INICIALIZACIÓN MANUAL DE USUARIO 🛠️
-- Si el "trigger" automático falla, el Frontend llamará a esta función para crearte el perfil.

CREATE OR REPLACE FUNCTION public.init_my_profile(business_name text DEFAULT 'Mi Panadería')
RETURNS jsonb AS $$
DECLARE
  new_tenant_id uuid;
  user_id uuid;
  user_email text;
  user_name text;
  exists_check boolean;
BEGIN
  user_id := auth.uid();
  user_email := auth.email();
  
  -- 1. Verificar si ya existe el perfil
  SELECT EXISTS(SELECT 1 FROM public.profiles WHERE id = user_id) INTO exists_check;
  
  IF exists_check THEN
    RETURN jsonb_build_object('status', 'exists', 'message', 'El perfil ya existía.');
  END IF;

  -- 2. Obtener metadatos (intentar sacar el nombre del token)
  -- Nota: jwt() puede ser null en algunos contextos, usamos defaults.
  user_name := COALESCE(current_setting('request.jwt.claims', true)::jsonb->>'full_name', 'Usuario');

  -- 3. Crear Tenant (Negocio)
  INSERT INTO public.tenants (name, created_at)
  VALUES (COALESCE(business_name, 'Mi Panadería'), now())
  RETURNING id INTO new_tenant_id;

  -- 4. Crear Perfil
  INSERT INTO public.profiles (id, email, full_name, tenant_id, role)
  VALUES (
    user_id,
    user_email,
    user_name,
    new_tenant_id,
    'owner'
  );

  RETURN jsonb_build_object('status', 'created', 'tenant_id', new_tenant_id);
EXCEPTION WHEN OTHERS THEN
  RETURN jsonb_build_object('status', 'error', 'message', SQLERRM);
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;

-- Dar permisos para que cualquiera (logueado) pueda llamarla
GRANT EXECUTE ON FUNCTION public.init_my_profile(text) TO authenticated;
