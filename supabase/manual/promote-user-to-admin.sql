-- ==============================================================================
-- PROMOTE USER TO ADMIN
-- ==============================================================================
-- IMPORTANT: Run this manually in the Supabase SQL Editor.
-- Replace 'REPLACE_WITH_ADMIN_EMAIL' with your actual account email.

UPDATE public.profiles
SET
  role = 'admin',
  is_active = true,
  updated_at = now()
WHERE id = (
  SELECT id
  FROM auth.users
  WHERE email = 'REPLACE_WITH_ADMIN_EMAIL'
);

-- Verify the update:
SELECT
  u.id,
  u.email,
  p.role,
  p.is_active
FROM auth.users u
JOIN public.profiles p ON p.id = u.id
WHERE u.email = 'REPLACE_WITH_ADMIN_EMAIL';
