CREATE OR REPLACE FUNCTION public.complete_test_payment(
  p_order_id bigint,
  p_user_id uuid
) RETURNS boolean AS $$
DECLARE
  v_order RECORD;
BEGIN
  -- Verify order belongs to user and is in awaiting_payment status
  SELECT * INTO v_order 
  FROM public.orders 
  WHERE id = p_order_id AND user_id = p_user_id FOR UPDATE;

  IF NOT FOUND THEN
    RAISE EXCEPTION 'Order not found or not owned by user';
  END IF;

  IF v_order.payment_status = 'paid' THEN
    -- Idempotent: already paid
    RETURN true;
  END IF;

  IF v_order.payment_method NOT IN ('bank_transfer_qr', 'test_payment') THEN
    RAISE EXCEPTION 'Order payment method does not support test completion';
  END IF;

  -- Update transaction
  UPDATE public.payment_transactions
  SET 
    status = 'simulated_paid',
    paid_at = now(),
    provider = 'test_bank_qr',
    metadata = metadata || '{"simulated": true}'::jsonb
  WHERE order_id = p_order_id AND status = 'pending';

  -- Update order (Bỏ paid_at đi để tránh lỗi thiếu cột ở Database cũ)
  UPDATE public.orders
  SET 
    payment_status = 'paid',
    status = 'delivered',
    confirmed_at = now(),
    shipped_at = now(),
    delivered_at = now()
  WHERE id = p_order_id;

  RETURN true;
END;
$$ LANGUAGE plpgsql SECURITY DEFINER SET search_path = public;
