-- ==============================================================================
-- 1. UPDATE ORDERS TABLE CONSTRAINTS
-- ==============================================================================
-- We need to drop existing constraints if any, and add new ones that include 'pending_payment' and 'awaiting_payment'.
ALTER TABLE public.orders DROP CONSTRAINT IF EXISTS orders_status_check;
ALTER TABLE public.orders ADD CONSTRAINT orders_status_check 
  CHECK (status IN ('pending_payment', 'pending', 'confirmed', 'processing', 'shipping', 'delivered', 'cancelled'));

ALTER TABLE public.orders DROP CONSTRAINT IF EXISTS orders_payment_status_check;
ALTER TABLE public.orders ADD CONSTRAINT orders_payment_status_check 
  CHECK (payment_status IN ('unpaid', 'awaiting_payment', 'paid', 'failed', 'refunded'));

ALTER TABLE public.orders DROP CONSTRAINT IF EXISTS orders_payment_method_check;
ALTER TABLE public.orders ADD CONSTRAINT orders_payment_method_check 
  CHECK (payment_method IN ('cod', 'bank_transfer_qr', 'test_payment'));

ALTER TABLE public.orders ALTER COLUMN payment_method SET NOT NULL;

-- ==============================================================================
-- 2. CREATE PAYMENT_TRANSACTIONS TABLE
-- ==============================================================================
CREATE TABLE IF NOT EXISTS public.payment_transactions (
  id bigint generated always as identity primary key,
  order_id bigint not null references public.orders(id) on delete cascade,
  user_id uuid not null references auth.users(id) on delete restrict,
  payment_method text not null,
  amount numeric(14,2) not null check (amount >= 0),
  status text not null default 'pending' check (status in ('pending', 'paid', 'failed', 'cancelled', 'refunded', 'simulated_paid')),
  provider text,
  provider_reference text,
  transfer_content text,
  qr_payload text,
  metadata jsonb not null default '{}'::jsonb,
  created_at timestamptz not null default now(),
  paid_at timestamptz
);

CREATE INDEX IF NOT EXISTS payment_transactions_order_id_idx ON public.payment_transactions(order_id);
CREATE INDEX IF NOT EXISTS payment_transactions_user_id_created_at_idx ON public.payment_transactions(user_id, created_at desc);
CREATE INDEX IF NOT EXISTS payment_transactions_provider_reference_idx ON public.payment_transactions(provider_reference);

ALTER TABLE public.payment_transactions ENABLE ROW LEVEL SECURITY;

CREATE POLICY "Users can view their own payment transactions"
ON public.payment_transactions FOR SELECT
TO authenticated
USING (user_id = auth.uid());

-- ==============================================================================
-- 3. UPDATE CREATE_ORDER_FROM_CART RPC
-- ==============================================================================
CREATE OR REPLACE FUNCTION public.create_order_from_cart(
  p_address_id bigint,
  p_items jsonb, -- Expected format: '[{"book_id": 1, "quantity": 2}, ...]'
  p_payment_method text,
  p_customer_note text default null
) RETURNS jsonb AS $$
DECLARE
  v_user_id uuid;
  v_address RECORD;
  v_order_id bigint;
  v_order_code text;
  v_subtotal numeric(14,2) := 0;
  v_shipping_fee numeric(14,2) := 30000;
  v_discount_amount numeric(14,2) := 0;
  v_total_amount numeric(14,2) := 0;
  v_item record;
  v_book record;
  v_line_total numeric(14,2);
  v_order_status text := 'pending';
  v_payment_status text := 'unpaid';
  v_transfer_content text := null;
BEGIN
  v_user_id := auth.uid();
  IF v_user_id IS NULL THEN
    RAISE EXCEPTION 'Not authenticated';
  END IF;

  -- Verify payment method
  IF p_payment_method NOT IN ('cod', 'bank_transfer_qr', 'test_payment') THEN
    RAISE EXCEPTION 'Invalid payment method';
  END IF;

  -- Verify address
  SELECT * INTO v_address FROM public.shipping_addresses
  WHERE id = p_address_id AND user_id = v_user_id;

  IF NOT FOUND THEN
    RAISE EXCEPTION 'Shipping address not found or not owned by user';
  END IF;

  -- Generate unique order code
  v_order_code := 'FH-' || to_char(now(), 'YYMMDDHH24MISS') || '-' || upper(substring(md5(random()::text) from 1 for 4));

  -- Calculate subtotal
  FOR v_item IN SELECT * FROM jsonb_to_recordset(p_items) AS x(book_id bigint, quantity int)
  LOOP
    IF v_item.quantity <= 0 THEN
       RAISE EXCEPTION 'Quantity must be greater than 0';
    END IF;

    SELECT id, title, slug, image_url, price, original_price, source_id
    INTO v_book
    FROM public.books
    WHERE id = v_item.book_id;

    IF NOT FOUND THEN
      RAISE EXCEPTION 'Book with ID % not found', v_item.book_id;
    END IF;
    IF v_book.price IS NULL THEN
      RAISE EXCEPTION 'Book with ID % has no price', v_item.book_id;
    END IF;

    v_line_total := v_book.price * v_item.quantity;
    v_subtotal := v_subtotal + v_line_total;
  END LOOP;

  IF v_subtotal >= 200000 THEN
    v_shipping_fee := 0;
  END IF;

  v_total_amount := v_subtotal + v_shipping_fee - v_discount_amount;

  -- Determine statuses based on payment method
  IF p_payment_method = 'bank_transfer_qr' THEN
    v_order_status := 'pending_payment';
    v_payment_status := 'awaiting_payment';
    v_transfer_content := v_order_code;
  ELSIF p_payment_method = 'cod' THEN
    v_order_status := 'pending';
    v_payment_status := 'unpaid';
  ELSIF p_payment_method = 'test_payment' THEN
    -- In real life this would only be allowed from server, but for our prototype we accept it
    v_order_status := 'pending_payment';
    v_payment_status := 'awaiting_payment';
    v_transfer_content := v_order_code;
  END IF;

  -- Insert into orders
  INSERT INTO public.orders (
    order_code, user_id, address_id, status, payment_status, payment_method,
    subtotal, shipping_fee, discount_amount, total_amount, shipping_address_snapshot, customer_note
  )
  VALUES (
    v_order_code, v_user_id, p_address_id, v_order_status, v_payment_status, p_payment_method,
    v_subtotal, v_shipping_fee, v_discount_amount, v_total_amount,
    jsonb_build_object(
      'recipient_name', v_address.recipient_name,
      'phone', v_address.phone,
      'address_line', v_address.address_line,
      'ward', v_address.ward,
      'district', v_address.district,
      'province', v_address.province,
      'postal_code', v_address.postal_code,
      'delivery_note', v_address.delivery_note
    ),
    p_customer_note
  )
  RETURNING id INTO v_order_id;

  -- Insert into order_items
  FOR v_item IN SELECT * FROM jsonb_to_recordset(p_items) AS x(book_id bigint, quantity int)
  LOOP
    SELECT id, title, slug, image_url, price, original_price, source_id
    INTO v_book
    FROM public.books
    WHERE id = v_item.book_id;

    v_line_total := v_book.price * v_item.quantity;

    INSERT INTO public.order_items (
      order_id, book_id, source_id, product_title, product_slug, product_image_url,
      unit_price, original_price, quantity, line_total
    )
    VALUES (
      v_order_id, v_book.id, v_book.source_id, v_book.title, v_book.slug, v_book.image_url,
      v_book.price, v_book.original_price, v_item.quantity, v_line_total
    );
  END LOOP;

  -- Create payment transaction if bank_transfer or test_payment
  IF p_payment_method IN ('bank_transfer_qr', 'test_payment') THEN
     INSERT INTO public.payment_transactions (
       order_id, user_id, payment_method, amount, status, transfer_content
     ) VALUES (
       v_order_id, v_user_id, p_payment_method, v_total_amount, 'pending', v_transfer_content
     );
  END IF;

  RETURN jsonb_build_object(
    'order_id', v_order_id,
    'order_code', v_order_code,
    'total_amount', v_total_amount,
    'payment_method', p_payment_method,
    'payment_status', v_payment_status,
    'status', v_order_status,
    'transfer_content', v_transfer_content
  );
END;
$$ LANGUAGE plpgsql SECURITY DEFINER SET search_path = public;

-- ==============================================================================
-- 4. CREATE COMPLETE_TEST_PAYMENT RPC
-- ==============================================================================
-- This function skips RLS and MUST ONLY be called via Service Role Key (Admin client)
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

  -- Update order
  UPDATE public.orders
  SET 
    payment_status = 'paid',
    status = 'delivered',
    paid_at = now(),
    confirmed_at = now(),
    shipped_at = now(),
    delivered_at = now()
  WHERE id = p_order_id;

  RETURN true;
END;
$$ LANGUAGE plpgsql SECURITY DEFINER SET search_path = public;

-- Ensure that complete_test_payment is not executable by anon or authenticated roles
REVOKE ALL ON FUNCTION public.complete_test_payment(bigint, uuid) FROM PUBLIC;
REVOKE ALL ON FUNCTION public.complete_test_payment(bigint, uuid) FROM anon;
REVOKE ALL ON FUNCTION public.complete_test_payment(bigint, uuid) FROM authenticated;
