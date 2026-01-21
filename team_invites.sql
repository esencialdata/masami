-- ==========================================
-- SCRIPT DE GESTIÓN DE EQUIPOS (Invitaciones)
-- ==========================================

-- 1. Tabla de Invitaciones
CREATE TABLE IF NOT EXISTS public.invitations (
    id UUID DEFAULT uuid_generate_v4() PRIMARY KEY,
    tenant_id UUID REFERENCES public.tenants(id) ON DELETE CASCADE,
    email TEXT NOT NULL,
    role user_role_enum DEFAULT 'baker',
    status TEXT DEFAULT 'pending', -- pending, accepted
    token UUID DEFAULT uuid_generate_v4(), -- Para links (opcional por ahora)
    created_at TIMESTAMPTZ DEFAULT now(),
    created_by UUID REFERENCES auth.users(id)
);

-- RLS para Invitaciones
ALTER TABLE public.invitations ENABLE ROW LEVEL SECURITY;

-- Owner puede ver y crear invitaciones de SU tenant
CREATE POLICY "Owner gestiona invitaciones" ON public.invitations
    FOR ALL USING (
        tenant_id IN (SELECT tenant_id FROM public.profiles WHERE id = auth.uid() AND role = 'owner')
    );

-- 2. RPC: Buscar Invitaciones Pendientes (Para el Wizard)
--    Permite a un usuario nuevo ver si alguien lo invitó por su email.
CREATE OR REPLACE FUNCTION public.get_my_invitation(check_email TEXT)
RETURNS TABLE (
    invitation_id UUID,
    tenant_name TEXT,
    role user_role_enum
) AS $$
BEGIN
    RETURN QUERY
    SELECT i.id, t.name, i.role
    FROM public.invitations i
    JOIN public.tenants t ON i.tenant_id = t.id
    WHERE i.email = check_email AND i.status = 'pending'
    LIMIT 1;
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;

-- 3. RPC: Aceptar Invitación
--    Convierte el usuario en miembro del equipo y borra/marca la invitación.
CREATE OR REPLACE FUNCTION public.accept_invitation(invite_id UUID)
RETURNS JSON AS $$
DECLARE
    v_tenant_id UUID;
    v_role user_role_enum;
    v_email TEXT;
    v_full_name TEXT;
BEGIN
    -- Verificar invitación
    SELECT tenant_id, role, email INTO v_tenant_id, v_role, v_email
    FROM public.invitations
    WHERE id = invite_id AND status = 'pending';

    IF v_tenant_id IS NULL THEN
        RAISE EXCEPTION 'Invitación inválida o expirada';
    END IF;

    -- Obtener metadata del usuario actual
    SELECT email, COALESCE(raw_user_meta_data->>'full_name', 'Nuevo Miembro')
    INTO v_email, v_full_name
    FROM auth.users
    WHERE id = auth.uid();

    -- Crear Perfil vinculado
    INSERT INTO public.profiles (id, tenant_id, role, full_name, email)
    VALUES (
        auth.uid(),
        v_tenant_id,
        v_role,
        v_full_name,
        v_email
    )
    ON CONFLICT (id) DO UPDATE
    SET tenant_id = v_tenant_id, role = v_role;

    -- Actualizar Invitación
    UPDATE public.invitations SET status = 'accepted' WHERE id = invite_id;

    RETURN json_build_object('status', 'success', 'tenant_id', v_tenant_id);
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;
