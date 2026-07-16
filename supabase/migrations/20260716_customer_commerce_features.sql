-- Migration: E-commerce features (Shipping Addresses, Orders, Reviews)
-- Date: 2026-07-16

-- ==============================================================================
-- 1. SHIPPING ADDRESSES
-- ==============================================================================
CREATE TABLE IF NOT EXISTS public.shipping_addresses (
  id bigint generated always as identity primary key,
  user_id uuid not null references auth.users(id) on delete cascade,
  label text,
  recipient_name text not null check (trim(recipient_name) <> ''),
  phone text not null check (trim(phone) <> ''),
  address_line text not null check (trim(address_line) <> ''),
  ward text,
  district text,
  province text not null check (trim(province) <> ''),
  postal_code text,
  delivery_note text,
  is_default boolean not null default false,
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now()
);

-- Partial unique index to enforce 1 default address per user
CREATE UNIQUE INDEX IF NOT EXISTS shipping_addresses_user_id_is_default_idx
  ON public.shipping_addresses (user_id)
  WHERE is_default = true;

CREATE INDEX IF NOT EXISTS shipping_addresses_user_id_idx ON public.shipping_addresses (user_id);
CREATE INDEX IF NOT EXISTS shipping_addresses_user_id_created_at_idx ON public.shipping_addresses (user_id, created_at desc);

-- Trigger for updated_at
CREATE OR REPLACE FUNCTION update_updated_at_column()
RETURNS TRIGGER AS $$
BEGIN
  NEW.updated_at = now();
  RETURN NEW;
END;
$$ LANGUAGE plpgsql;

DROP TRIGGER IF EXISTS update_shipping_addresses_updated_at ON public.shipping_addresses;
CREATE TRIGGER update_shipping_addresses_updated_at
BEFORE UPDATE ON public.shipping_addresses
FOR EACH ROW
EXECUTE FUNCTION update_updated_at_column();

-- RPC: set_default_shipping_address
CREATE OR REPLACE FUNCTION public.set_default_shipping_address(p_address_id bigint)
RETURNS void AS $$
BEGIN
  -- Verify the address belongs to the authenticated user
  IF NOT EXISTS (
    SELECT 1 FROM public.shipping_addresses
    WHERE id = p_address_id AND user_id = auth.uid()
  ) THEN
    RAISE EXCEPTION 'Address not found or not owned by user';
  END IF;

  -- Reset all user's addresses to not default
  UPDATE public.shipping_addresses
  SET is_default = false
  WHERE user_id = auth.uid() AND is_default = true;

  -- Set the specific address to default
  UPDATE public.shipping_addresses
  SET is_default = true
  WHERE id = p_address_id AND user_id = auth.uid();
END;
$$ LANGUAGE plpgsql SECURITY DEFINER SET search_path = public;

-- Enable RLS for shipping_addresses
ALTER TABLE public.shipping_addresses ENABLE ROW LEVEL SECURITY;

CREATE POLICY "Users can view their own addresses"
ON public.shipping_addresses FOR SELECT
TO authenticated
USING (user_id = auth.uid());

CREATE POLICY "Users can insert their own addresses"
ON public.shipping_addresses FOR INSERT
TO authenticated
WITH CHECK (user_id = auth.uid());

CREATE POLICY "Users can update their own addresses"
ON public.shipping_addresses FOR UPDATE
TO authenticated
USING (user_id = auth.uid())
WITH CHECK (user_id = auth.uid());

CREATE POLICY "Users can delete their own addresses"
ON public.shipping_addresses FOR DELETE
TO authenticated
USING (user_id = auth.uid());

-- ==============================================================================
-- 2. ORDERS
-- ==============================================================================
CREATE TABLE IF NOT EXISTS public.orders (
  id bigint generated always as identity primary key,
  order_code text not null unique,
  user_id uuid references auth.users(id) on delete set null,
  address_id bigint references public.shipping_addresses(id) on delete set null,
  status text not null default 'pending' check (status in ('pending', 'confirmed', 'processing', 'shipping', 'delivered', 'cancelled')),
  payment_status text not null default 'unpaid' check (payment_status in ('unpaid', 'paid', 'refunded')),
  payment_method text,
  subtotal numeric(14,2) not null default 0 check (subtotal >= 0),
  shipping_fee numeric(14,2) not null default 0 check (shipping_fee >= 0),
  discount_amount numeric(14,2) not null default 0 check (discount_amount >= 0),
  total_amount numeric(14,2) not null default 0 check (total_amount >= 0),
  shipping_address_snapshot jsonb not null,
  customer_note text,
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now(),
  confirmed_at timestamptz,
  shipped_at timestamptz,
  delivered_at timestamptz,
  cancelled_at timestamptz
);

CREATE INDEX IF NOT EXISTS orders_user_id_created_at_idx ON public.orders (user_id, created_at desc);
CREATE INDEX IF NOT EXISTS orders_status_idx ON public.orders (status);
CREATE INDEX IF NOT EXISTS orders_order_code_idx ON public.orders (order_code);

DROP TRIGGER IF EXISTS update_orders_updated_at ON public.orders;
CREATE TRIGGER update_orders_updated_at
BEFORE UPDATE ON public.orders
FOR EACH ROW
EXECUTE FUNCTION update_updated_at_column();

-- Enable RLS for orders
ALTER TABLE public.orders ENABLE ROW LEVEL SECURITY;

CREATE POLICY "Users can view their own orders"
ON public.orders FOR SELECT
TO authenticated
USING (user_id = auth.uid());

-- ==============================================================================
-- 3. ORDER ITEMS
-- ==============================================================================
CREATE TABLE IF NOT EXISTS public.order_items (
  id bigint generated always as identity primary key,
  order_id bigint not null references public.orders(id) on delete cascade,
  book_id bigint references public.books(id) on delete set null,
  source_id text,
  product_title text not null,
  product_slug text,
  product_image_url text,
  unit_price numeric(14,2) not null check (unit_price >= 0),
  original_price numeric(14,2) check (original_price IS NULL OR original_price >= 0),
  quantity integer not null check (quantity > 0),
  line_total numeric(14,2) not null check (line_total >= 0),
  created_at timestamptz not null default now()
);

CREATE INDEX IF NOT EXISTS order_items_order_id_idx ON public.order_items (order_id);
CREATE INDEX IF NOT EXISTS order_items_book_id_idx ON public.order_items (book_id);

-- Enable RLS for order_items
ALTER TABLE public.order_items ENABLE ROW LEVEL SECURITY;

CREATE POLICY "Users can view their own order items"
ON public.order_items FOR SELECT
TO authenticated
USING (
  order_id IN (
    SELECT id FROM public.orders WHERE user_id = auth.uid()
  )
);

-- ==============================================================================
-- 4. CREATE ORDER RPC
-- ==============================================================================
CREATE OR REPLACE FUNCTION public.create_order_from_cart(
  p_address_id bigint,
  p_items jsonb, -- Expected format: '[{"book_id": 1, "quantity": 2}, ...]'
  p_payment_method text,
  p_customer_note text
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
BEGIN
  v_user_id := auth.uid();
  IF v_user_id IS NULL THEN
    RAISE EXCEPTION 'Not authenticated';
  END IF;

  -- 1. Verify and snapshot the address
  SELECT * INTO v_address FROM public.shipping_addresses
  WHERE id = p_address_id AND user_id = v_user_id;

  IF NOT FOUND THEN
    RAISE EXCEPTION 'Shipping address not found or not owned by user';
  END IF;

  -- 2. Generate unique order code (e.g. ORD-TIMESTAMP-RAND)
  v_order_code := 'ORD-' || to_char(now(), 'YYMMDDHH24MISS') || '-' || upper(substring(md5(random()::text) from 1 for 4));

  -- 3. Calculate subtotal by querying the real books table
  FOR v_item IN SELECT * FROM jsonb_to_recordset(p_items) AS x(book_id bigint, quantity int)
  LOOP
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

  -- 4. Insert into orders
  INSERT INTO public.orders (
    order_code, user_id, address_id, status, payment_status, payment_method,
    subtotal, shipping_fee, discount_amount, total_amount, shipping_address_snapshot, customer_note
  )
  VALUES (
    v_order_code, v_user_id, p_address_id, 'pending', 'unpaid', p_payment_method,
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

  -- 5. Insert into order_items
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

  RETURN jsonb_build_object(
    'order_id', v_order_id,
    'order_code', v_order_code,
    'total_amount', v_total_amount
  );
END;
$$ LANGUAGE plpgsql SECURITY DEFINER SET search_path = public;

-- ==============================================================================
-- 5. PRODUCT REVIEWS
-- ==============================================================================
CREATE TABLE IF NOT EXISTS public.product_reviews (
  id bigint generated always as identity primary key,
  user_id uuid not null references auth.users(id) on delete cascade,
  book_id bigint not null references public.books(id) on delete cascade,
  rating smallint not null check (rating >= 1 AND rating <= 5),
  review_text text check (length(review_text) <= 2000),
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now(),
  unique (user_id, book_id)
);

CREATE INDEX IF NOT EXISTS product_reviews_book_id_created_at_idx ON public.product_reviews (book_id, created_at desc);
CREATE INDEX IF NOT EXISTS product_reviews_user_id_created_at_idx ON public.product_reviews (user_id, created_at desc);
CREATE INDEX IF NOT EXISTS product_reviews_book_id_rating_idx ON public.product_reviews (book_id, rating);

DROP TRIGGER IF EXISTS update_product_reviews_updated_at ON public.product_reviews;
CREATE TRIGGER update_product_reviews_updated_at
BEFORE UPDATE ON public.product_reviews
FOR EACH ROW
EXECUTE FUNCTION update_updated_at_column();

-- Function to check if user has purchased the book and it's delivered
CREATE OR REPLACE FUNCTION public.has_purchased_book(p_book_id bigint)
RETURNS boolean AS $$
DECLARE
  v_user_id uuid;
  v_has_purchased boolean;
BEGIN
  v_user_id := auth.uid();
  IF v_user_id IS NULL THEN
    RETURN false;
  END IF;

  SELECT EXISTS (
    SELECT 1
    FROM public.orders o
    JOIN public.order_items oi ON o.id = oi.order_id
    WHERE o.user_id = v_user_id
      AND oi.book_id = p_book_id
      AND o.status = 'delivered'
  ) INTO v_has_purchased;

  RETURN v_has_purchased;
END;
$$ LANGUAGE plpgsql SECURITY DEFINER SET search_path = public;

-- Enable RLS for product_reviews
ALTER TABLE public.product_reviews ENABLE ROW LEVEL SECURITY;

CREATE POLICY "Anyone can view product reviews"
ON public.product_reviews FOR SELECT
USING (true);

CREATE POLICY "Authenticated users can insert review if they purchased"
ON public.product_reviews FOR INSERT
TO authenticated
WITH CHECK (
  user_id = auth.uid() AND
  public.has_purchased_book(book_id) = true
);

CREATE POLICY "Users can update their own reviews"
ON public.product_reviews FOR UPDATE
TO authenticated
USING (user_id = auth.uid())
WITH CHECK (user_id = auth.uid());

CREATE POLICY "Users can delete their own reviews"
ON public.product_reviews FOR DELETE
TO authenticated
USING (user_id = auth.uid());
