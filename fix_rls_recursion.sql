-- FIX: Infinite Recursion in RLS Policies
-- The previous policy caused a loop because checking permission required reading the table, which checked permission again.

-- 1. Create a secure function to get the current user's tenant_id.
-- 'SECURITY DEFINER' means it runs with the permissions of the creator (Admin), 
-- effectively bypassing RLS for this specific lookup.
CREATE OR REPLACE FUNCTION public.get_my_tenant_id()
RETURNS uuid AS $$
BEGIN
  RETURN (SELECT tenant_id FROM public.profiles WHERE id = auth.uid());
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;

-- 2. Drop the recursive policy
DROP POLICY IF EXISTS "Users can view tenant members" ON public.profiles;

-- 3. Create the new SAFE policy
CREATE POLICY "Users can view tenant members" ON public.profiles
  FOR SELECT USING (
    tenant_id = public.get_my_tenant_id()
  );

-- 4. Also ensure the "Self View" policy is robust (it was fine, but good to ensure)
DROP POLICY IF EXISTS "Users can see self" ON public.profiles;
CREATE POLICY "Users can see self" ON public.profiles
  FOR SELECT USING (
    id = auth.uid()
  );
