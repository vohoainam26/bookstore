-- ==============================================================================
-- FIX: ADD paid_at TO ORDERS TABLE
-- ==============================================================================

ALTER TABLE public.orders ADD COLUMN IF NOT EXISTS paid_at timestamptz;
