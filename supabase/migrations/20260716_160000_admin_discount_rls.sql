-- Fix RLS for discount_codes so admins can view them in the dashboard
CREATE POLICY "Admins can view discount codes" 
ON public.discount_codes 
FOR SELECT 
TO authenticated 
USING (public.is_admin());
