-- ==============================================================================
-- 1. ADMIN AUDIT LOG RPC
-- ==============================================================================
CREATE OR REPLACE FUNCTION public.admin_log_action(
  p_action text,
  p_entity_type text,
  p_entity_id text,
  p_old_data jsonb DEFAULT NULL,
  p_new_data jsonb DEFAULT NULL,
  p_metadata jsonb DEFAULT NULL
)
RETURNS void AS $$
BEGIN
  INSERT INTO public.admin_audit_logs (admin_id, action, entity_type, entity_id, old_data, new_data, metadata)
  VALUES (auth.uid(), p_action, p_entity_type, p_entity_id, p_old_data, p_new_data, p_metadata);
END;
$$ LANGUAGE plpgsql SECURITY DEFINER SET search_path = public;

-- ==============================================================================
-- 2. CUSTOMER MANAGEMENT RPCS
-- ==============================================================================
CREATE OR REPLACE FUNCTION public.admin_set_customer_active(
  p_customer_id uuid,
  p_is_active boolean,
  p_reason text DEFAULT NULL
)
RETURNS void AS $$
DECLARE
  v_old_active boolean;
BEGIN
  IF NOT public.has_admin_permission('customers.status.manage') THEN
    RAISE EXCEPTION 'Admin customer status manage permission required';
  END IF;

  IF NOT p_is_active AND p_reason IS NULL THEN
    RAISE EXCEPTION 'Reason is required when blocking a customer';
  END IF;

  -- Protect against self-blocking
  IF p_customer_id = auth.uid() THEN
    RAISE EXCEPTION 'Cannot block your own account';
  END IF;

  SELECT is_active INTO v_old_active FROM public.profiles WHERE id = p_customer_id;
  IF v_old_active = p_is_active THEN RETURN; END IF;

  UPDATE public.profiles
  SET 
    is_active = p_is_active,
    blocked_reason = CASE WHEN NOT p_is_active THEN p_reason ELSE NULL END,
    blocked_at = CASE WHEN NOT p_is_active THEN now() ELSE NULL END,
    blocked_by = CASE WHEN NOT p_is_active THEN auth.uid() ELSE NULL END
  WHERE id = p_customer_id;

  PERFORM public.admin_log_action(
    CASE WHEN p_is_active THEN 'customer.unblocked' ELSE 'customer.blocked' END,
    'customer',
    p_customer_id::text,
    jsonb_build_object('is_active', v_old_active),
    jsonb_build_object('is_active', p_is_active, 'reason', p_reason)
  );
END;
$$ LANGUAGE plpgsql SECURITY DEFINER SET search_path = public;


CREATE OR REPLACE FUNCTION public.admin_add_customer_note(
  p_customer_id uuid,
  p_note text
)
RETURNS jsonb AS $$
DECLARE
  v_note_id bigint;
BEGIN
  IF NOT public.has_admin_permission('customers.notes.create') THEN
    RAISE EXCEPTION 'Admin customer notes create permission required';
  END IF;

  IF trim(p_note) = '' THEN
    RAISE EXCEPTION 'Note cannot be empty';
  END IF;

  INSERT INTO public.customer_admin_notes (customer_id, admin_id, note)
  VALUES (p_customer_id, auth.uid(), trim(p_note))
  RETURNING id INTO v_note_id;

  PERFORM public.admin_log_action('customer.note_added', 'customer_admin_note', v_note_id::text, NULL, jsonb_build_object('customer_id', p_customer_id));

  RETURN jsonb_build_object('success', true, 'note_id', v_note_id);
END;
$$ LANGUAGE plpgsql SECURITY DEFINER SET search_path = public;

-- ==============================================================================
-- 3. RBAC STAFF RPCS
-- ==============================================================================
CREATE OR REPLACE FUNCTION public.admin_assign_role(
  p_user_id uuid,
  p_role_code text
)
RETURNS void AS $$
DECLARE
  v_role_id bigint;
BEGIN
  IF NOT public.has_admin_permission('roles.manage') THEN
    RAISE EXCEPTION 'Admin roles manage permission required';
  END IF;

  -- Ensure only super_admin can assign super_admin
  IF upper(p_role_code) = 'SUPER_ADMIN' AND NOT public.is_super_admin() THEN
    RAISE EXCEPTION 'Only Super Admin can assign SUPER_ADMIN role';
  END IF;

  SELECT id INTO v_role_id FROM public.admin_roles WHERE upper(code) = upper(p_role_code);
  IF NOT FOUND THEN RAISE EXCEPTION 'Role not found'; END IF;

  INSERT INTO public.admin_user_roles (user_id, role_id, assigned_by)
  VALUES (p_user_id, v_role_id, auth.uid())
  ON CONFLICT (user_id, role_id) DO UPDATE SET is_active = true, assigned_by = auth.uid(), assigned_at = now();

  PERFORM public.admin_log_action('staff.role_assigned', 'staff', p_user_id::text, NULL, jsonb_build_object('role_code', p_role_code));
END;
$$ LANGUAGE plpgsql SECURITY DEFINER SET search_path = public;

CREATE OR REPLACE FUNCTION public.admin_remove_role(
  p_user_id uuid,
  p_role_code text
)
RETURNS void AS $$
DECLARE
  v_role_id bigint;
  v_super_admin_count integer;
BEGIN
  IF NOT public.has_admin_permission('roles.manage') THEN
    RAISE EXCEPTION 'Admin roles manage permission required';
  END IF;

  SELECT id INTO v_role_id FROM public.admin_roles WHERE upper(code) = upper(p_role_code);
  IF NOT FOUND THEN RETURN; END IF;

  -- Protect the last super_admin
  IF upper(p_role_code) = 'SUPER_ADMIN' THEN
    IF NOT public.is_super_admin() THEN
      RAISE EXCEPTION 'Only Super Admin can remove SUPER_ADMIN role';
    END IF;

    SELECT count(*) INTO v_super_admin_count 
    FROM public.admin_user_roles ur 
    WHERE ur.role_id = v_role_id AND ur.is_active = true;

    IF v_super_admin_count <= 1 AND p_user_id = auth.uid() THEN
      RAISE EXCEPTION 'Cannot remove the last active Super Admin';
    END IF;
  END IF;

  DELETE FROM public.admin_user_roles WHERE user_id = p_user_id AND role_id = v_role_id;

  PERFORM public.admin_log_action('staff.role_removed', 'staff', p_user_id::text, jsonb_build_object('role_code', p_role_code), NULL);
END;
$$ LANGUAGE plpgsql SECURITY DEFINER SET search_path = public;
