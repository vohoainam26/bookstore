-- ==============================================================================
-- 1. ANALYTICS: REVENUE SERIES
-- ==============================================================================
CREATE OR REPLACE FUNCTION public.admin_get_revenue_series(p_start_date date, p_end_date date)
RETURNS jsonb AS $$
DECLARE
  v_result jsonb;
BEGIN
  IF NOT public.has_admin_permission('analytics.view') THEN
    RAISE EXCEPTION 'Admin analytics permission required';
  END IF;

  WITH date_series AS (
    SELECT generate_series(p_start_date::timestamp, p_end_date::timestamp, '1 day'::interval)::date AS date
  ),
  daily_data AS (
    SELECT 
      d.date,
      coalesce(sum(o.total_amount), 0) as revenue,
      count(o.id) as orders
    FROM date_series d
    LEFT JOIN public.orders o ON d.date = o.created_at::date AND o.payment_status = 'paid' AND o.status != 'cancelled'
    GROUP BY d.date
    ORDER BY d.date
  )
  SELECT jsonb_agg(
    jsonb_build_object(
      'date', date,
      'revenue', revenue,
      'orders', orders
    )
  ) INTO v_result
  FROM daily_data;

  RETURN coalesce(v_result, '[]');
END;
$$ LANGUAGE plpgsql SECURITY DEFINER SET search_path = public;

-- ==============================================================================
-- 2. SHIPPING RPCS
-- ==============================================================================
CREATE OR REPLACE FUNCTION public.admin_create_shipping_zone(
  p_code text,
  p_name text,
  p_priority integer DEFAULT 0,
  p_description text DEFAULT NULL
)
RETURNS jsonb AS $$
DECLARE
  v_id bigint;
BEGIN
  IF NOT public.has_admin_permission('shipping.manage') THEN RAISE EXCEPTION 'Admin shipping permission required'; END IF;
  
  INSERT INTO public.shipping_zones (code, name, priority, description)
  VALUES (p_code, p_name, p_priority, p_description)
  RETURNING id INTO v_id;

  PERFORM public.admin_log_action('shipping.zone_created', 'shipping_zone', v_id::text, NULL, jsonb_build_object('code', p_code));
  RETURN jsonb_build_object('success', true, 'id', v_id);
END;
$$ LANGUAGE plpgsql SECURITY DEFINER SET search_path = public;

CREATE OR REPLACE FUNCTION public.admin_create_shipping_method(
  p_code text,
  p_name text,
  p_min_days integer,
  p_max_days integer,
  p_supports_cod boolean
)
RETURNS jsonb AS $$
DECLARE
  v_id bigint;
BEGIN
  IF NOT public.has_admin_permission('shipping.manage') THEN RAISE EXCEPTION 'Admin shipping permission required'; END IF;
  
  INSERT INTO public.shipping_methods (code, name, min_delivery_days, max_delivery_days, supports_cod)
  VALUES (p_code, p_name, p_min_days, p_max_days, p_supports_cod)
  RETURNING id INTO v_id;

  PERFORM public.admin_log_action('shipping.method_created', 'shipping_method', v_id::text, NULL, jsonb_build_object('code', p_code));
  RETURN jsonb_build_object('success', true, 'id', v_id);
END;
$$ LANGUAGE plpgsql SECURITY DEFINER SET search_path = public;
