-- ==============================================================================
-- 1. TẠO BẢNG DISCOUNT_CODES
-- ==============================================================================
CREATE TABLE IF NOT EXISTS public.discount_codes (
  id bigint generated always as identity primary key,
  code text not null,
  name text not null,
  description text,
  discount_type text not null check (discount_type in ('percentage', 'fixed_amount', 'free_shipping')),
  discount_value numeric(14,2) not null check (discount_value > 0),
  max_discount_amount numeric(14,2) check (max_discount_amount is null or max_discount_amount >= 0),
  min_order_amount numeric(14,2) not null default 0 check (min_order_amount >= 0),
  usage_limit integer check (usage_limit is null or usage_limit > 0),
  usage_limit_per_user integer not null default 1 check (usage_limit_per_user > 0),
  current_usage integer not null default 0 check (current_usage >= 0),
  starts_at timestamptz,
  expires_at timestamptz,
  is_active boolean not null default true,
  first_order_only boolean not null default false,
  applies_to text not null default 'all' check (applies_to in ('all', 'selected_products', 'selected_categories')),
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now(),
  constraint check_percentage_value check (discount_type != 'percentage' or (discount_value > 0 and discount_value <= 100)),
  constraint check_dates check (expires_at is null or starts_at is null or expires_at > starts_at)
);

CREATE UNIQUE INDEX IF NOT EXISTS discount_codes_upper_code_idx ON public.discount_codes (upper(code));
CREATE INDEX IF NOT EXISTS discount_codes_is_active_idx ON public.discount_codes(is_active);
CREATE INDEX IF NOT EXISTS discount_codes_dates_idx ON public.discount_codes(starts_at, expires_at);

-- Trigger auto update updated_at
CREATE OR REPLACE FUNCTION update_discount_codes_updated_at()
RETURNS TRIGGER AS $$
BEGIN
    NEW.updated_at = now();
    RETURN NEW;
END;
$$ language 'plpgsql';

DROP TRIGGER IF EXISTS trg_discount_codes_updated_at ON public.discount_codes;
CREATE TRIGGER trg_discount_codes_updated_at
BEFORE UPDATE ON public.discount_codes
FOR EACH ROW
EXECUTE FUNCTION update_discount_codes_updated_at();

-- RLS cho discount_codes (Client không được xem list, chỉ verify qua RPC)
ALTER TABLE public.discount_codes ENABLE ROW LEVEL SECURITY;
-- Chúng ta không cần tạo Policy SELECT cho Public/Anon vì RPC dùng SECURITY DEFINER.

-- ==============================================================================
-- 2. TẠO BẢNG REDEMPTIONS
-- ==============================================================================
CREATE TABLE IF NOT EXISTS public.discount_code_redemptions (
  id bigint generated always as identity primary key,
  discount_code_id bigint not null references public.discount_codes(id) on delete restrict,
  user_id uuid not null references auth.users(id) on delete restrict,
  order_id bigint references public.orders(id) on delete set null,
  status text not null default 'reserved' check (status in ('reserved', 'redeemed', 'released')),
  discount_amount numeric(14,2) not null default 0,
  shipping_discount_amount numeric(14,2) not null default 0,
  created_at timestamptz not null default now(),
  redeemed_at timestamptz,
  released_at timestamptz
);

CREATE INDEX IF NOT EXISTS discount_code_redemptions_status_idx ON public.discount_code_redemptions(discount_code_id, status);
CREATE INDEX IF NOT EXISTS discount_code_redemptions_user_idx ON public.discount_code_redemptions(user_id, created_at desc);
CREATE INDEX IF NOT EXISTS discount_code_redemptions_order_idx ON public.discount_code_redemptions(order_id);
CREATE UNIQUE INDEX IF NOT EXISTS discount_code_redemptions_one_per_order_idx ON public.discount_code_redemptions(order_id) WHERE status != 'released';

ALTER TABLE public.discount_code_redemptions ENABLE ROW LEVEL SECURITY;
DROP POLICY IF EXISTS "Users can view their own redemptions" ON public.discount_code_redemptions;
CREATE POLICY "Users can view their own redemptions" ON public.discount_code_redemptions FOR SELECT TO authenticated USING (user_id = auth.uid());

-- ==============================================================================
-- 3. CẬP NHẬT BẢNG ORDERS
-- ==============================================================================
-- Thêm các cột cho order nếu chưa có
ALTER TABLE public.orders ADD COLUMN IF NOT EXISTS discount_code_id bigint references public.discount_codes(id) on delete set null;
ALTER TABLE public.orders ADD COLUMN IF NOT EXISTS discount_code_snapshot text;
ALTER TABLE public.orders ADD COLUMN IF NOT EXISTS discount_type_snapshot text;
ALTER TABLE public.orders ADD COLUMN IF NOT EXISTS discount_value_snapshot numeric(14,2);
ALTER TABLE public.orders ADD COLUMN IF NOT EXISTS shipping_discount_amount numeric(14,2) not null default 0;

-- (discount_amount và shipping_fee đã có sẵn)

-- ==============================================================================
-- 4. RPC: PREVIEW TỔNG TIỀN
-- ==============================================================================
CREATE OR REPLACE FUNCTION public.preview_checkout_totals(
    p_items jsonb,
    p_coupon_code text default null
) RETURNS jsonb AS $$
DECLARE
    v_user_id uuid;
    v_item record;
    v_book record;
    v_subtotal numeric(14,2) := 0;
    v_shipping_fee numeric(14,2) := 30000;
    v_discount_amount numeric(14,2) := 0;
    v_shipping_discount_amount numeric(14,2) := 0;
    v_total_amount numeric(14,2) := 0;
    v_coupon public.discount_codes;
    v_usage_count int;
    v_user_usage_count int;
    v_raw_discount numeric(14,2);
    v_has_previous_order boolean;
BEGIN
    v_user_id := auth.uid();
    IF v_user_id IS NULL THEN
        RETURN jsonb_build_object('coupon_valid', false, 'message', 'Vui lòng đăng nhập để kiểm tra đơn hàng.');
    END IF;

    -- 1. Tính subtotal
    FOR v_item IN SELECT * FROM jsonb_to_recordset(p_items) AS x(book_id bigint, quantity int) LOOP
        IF v_item.quantity <= 0 THEN
            RETURN jsonb_build_object('coupon_valid', false, 'message', 'Số lượng sản phẩm không hợp lệ.');
        END IF;

        SELECT price INTO v_book FROM public.books WHERE id = v_item.book_id;
        IF NOT FOUND OR v_book.price IS NULL THEN
            RETURN jsonb_build_object('coupon_valid', false, 'message', 'Một số sản phẩm không tồn tại hoặc lỗi giá.');
        END IF;

        v_subtotal := v_subtotal + (v_book.price * v_item.quantity);
    END LOOP;

    -- Set shipping fee based on subtotal threshold
    IF v_subtotal >= 200000 THEN
        v_shipping_fee := 0;
    END IF;

    -- 2. Kiểm tra Coupon nếu có
    IF p_coupon_code IS NOT NULL AND trim(p_coupon_code) != '' THEN
        -- Tìm mã (Không khoá row ở preview)
        SELECT * INTO v_coupon FROM public.discount_codes WHERE upper(code) = upper(trim(p_coupon_code));

        IF NOT FOUND THEN
            RETURN jsonb_build_object('coupon_valid', false, 'message', 'Mã giảm giá không tồn tại.');
        END IF;
        IF NOT v_coupon.is_active THEN
            RETURN jsonb_build_object('coupon_valid', false, 'message', 'Mã giảm giá đã bị khoá.');
        END IF;
        IF v_coupon.starts_at IS NOT NULL AND now() < v_coupon.starts_at THEN
            RETURN jsonb_build_object('coupon_valid', false, 'message', 'Mã giảm giá chưa đến thời gian sử dụng.');
        END IF;
        IF v_coupon.expires_at IS NOT NULL AND now() > v_coupon.expires_at THEN
            RETURN jsonb_build_object('coupon_valid', false, 'message', 'Mã giảm giá đã hết hạn.');
        END IF;
        IF v_subtotal < v_coupon.min_order_amount THEN
            RETURN jsonb_build_object('coupon_valid', false, 'message', 'Đơn hàng chưa đạt giá trị tối thiểu ' || v_coupon.min_order_amount::text || ' ₫');
        END IF;
        IF v_coupon.usage_limit IS NOT NULL AND v_coupon.current_usage >= v_coupon.usage_limit THEN
            RETURN jsonb_build_object('coupon_valid', false, 'message', 'Mã giảm giá đã hết lượt sử dụng.');
        END IF;
        
        -- Lượt của user này
        SELECT count(*) INTO v_user_usage_count FROM public.discount_code_redemptions 
        WHERE discount_code_id = v_coupon.id AND user_id = v_user_id AND status != 'released';
        
        IF v_user_usage_count >= v_coupon.usage_limit_per_user THEN
            RETURN jsonb_build_object('coupon_valid', false, 'message', 'Bạn đã sử dụng hết số lần cho phép của mã này.');
        END IF;

        IF v_coupon.first_order_only THEN
            SELECT EXISTS(SELECT 1 FROM public.orders WHERE user_id = v_user_id AND status NOT IN ('cancelled')) INTO v_has_previous_order;
            IF v_has_previous_order THEN
                RETURN jsonb_build_object('coupon_valid', false, 'message', 'Mã chỉ áp dụng cho đơn hàng đầu tiên.');
            END IF;
        END IF;

        -- Tính số tiền giảm
        IF v_coupon.discount_type = 'percentage' THEN
            v_raw_discount := v_subtotal * (v_coupon.discount_value / 100.0);
            IF v_coupon.max_discount_amount IS NOT NULL THEN
                v_discount_amount := least(v_raw_discount, v_coupon.max_discount_amount);
            ELSE
                v_discount_amount := v_raw_discount;
            END IF;
        ELSIF v_coupon.discount_type = 'fixed_amount' THEN
            v_discount_amount := least(v_coupon.discount_value, v_subtotal);
        ELSIF v_coupon.discount_type = 'free_shipping' THEN
            v_discount_amount := 0;
            v_shipping_discount_amount := least(v_shipping_fee, v_coupon.discount_value);
            -- Nếu discount_value rất lớn (ví dụ 999999), giảm toàn bộ phí ship
        END IF;
    END IF;

    -- Tính tổng tiền cuối cùng
    v_total_amount := v_subtotal + v_shipping_fee - v_discount_amount - v_shipping_discount_amount;
    IF v_total_amount < 0 THEN
        v_total_amount := 0;
    END IF;

    -- Trả về preview
    RETURN jsonb_build_object(
        'subtotal', v_subtotal,
        'shipping_fee', v_shipping_fee,
        'discount_amount', v_discount_amount,
        'shipping_discount_amount', v_shipping_discount_amount,
        'total_amount', v_total_amount,
        'coupon_valid', p_coupon_code IS NOT NULL AND trim(p_coupon_code) != '' AND v_coupon.id IS NOT NULL,
        'coupon_code', (CASE WHEN v_coupon.id IS NOT NULL THEN v_coupon.code ELSE null END),
        'coupon_name', (CASE WHEN v_coupon.id IS NOT NULL THEN v_coupon.name ELSE null END),
        'discount_type', (CASE WHEN v_coupon.id IS NOT NULL THEN v_coupon.discount_type ELSE null END),
        'discount_value', (CASE WHEN v_coupon.id IS NOT NULL THEN v_coupon.discount_value ELSE null END),
        'message', 'Hợp lệ'
    );
END;
$$ LANGUAGE plpgsql SECURITY DEFINER SET search_path = public;


-- ==============================================================================
-- 5. CẬP NHẬT LẠI HÀM CREATE_ORDER_FROM_CART (ĐÁNH BAY HÀM CŨ)
-- ==============================================================================
CREATE OR REPLACE FUNCTION public.create_order_from_cart(
  p_address_id bigint,
  p_items jsonb,
  p_payment_method text,
  p_customer_note text default null,
  p_coupon_code text default null
) RETURNS jsonb AS $$
DECLARE
  v_user_id uuid;
  v_address RECORD;
  v_order_id bigint;
  v_order_code text;
  v_subtotal numeric(14,2) := 0;
  v_shipping_fee numeric(14,2) := 30000;
  v_discount_amount numeric(14,2) := 0;
  v_shipping_discount_amount numeric(14,2) := 0;
  v_total_amount numeric(14,2) := 0;
  v_item record;
  v_book record;
  v_line_total numeric(14,2);
  v_order_status text := 'pending';
  v_payment_status text := 'unpaid';
  v_transfer_content text := null;
  
  v_coupon public.discount_codes;
  v_user_usage_count int;
  v_has_previous_order boolean;
  v_raw_discount numeric(14,2);
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
    INTO v_book FROM public.books WHERE id = v_item.book_id;

    IF NOT FOUND THEN RAISE EXCEPTION 'Book with ID % not found', v_item.book_id; END IF;
    IF v_book.price IS NULL THEN RAISE EXCEPTION 'Book with ID % has no price', v_item.book_id; END IF;

    v_line_total := v_book.price * v_item.quantity;
    v_subtotal := v_subtotal + v_line_total;
  END LOOP;

  IF v_subtotal >= 200000 THEN
    v_shipping_fee := 0;
  END IF;

  -- XỬ LÝ MÃ GIẢM GIÁ (LOCK ROW ĐỂ TRÁNH RACE CONDITION)
  IF p_coupon_code IS NOT NULL AND trim(p_coupon_code) != '' THEN
      SELECT * INTO v_coupon FROM public.discount_codes 
      WHERE upper(code) = upper(trim(p_coupon_code))
      FOR UPDATE; -- Khóa row để update an toàn

      IF NOT FOUND THEN RAISE EXCEPTION 'Mã giảm giá không tồn tại'; END IF;
      IF NOT v_coupon.is_active THEN RAISE EXCEPTION 'Mã giảm giá đã bị khoá'; END IF;
      IF v_coupon.starts_at IS NOT NULL AND now() < v_coupon.starts_at THEN RAISE EXCEPTION 'Mã giảm giá chưa bắt đầu'; END IF;
      IF v_coupon.expires_at IS NOT NULL AND now() > v_coupon.expires_at THEN RAISE EXCEPTION 'Mã giảm giá đã hết hạn'; END IF;
      IF v_subtotal < v_coupon.min_order_amount THEN RAISE EXCEPTION 'Đơn hàng chưa đạt giá trị tối thiểu'; END IF;
      IF v_coupon.usage_limit IS NOT NULL AND v_coupon.current_usage >= v_coupon.usage_limit THEN RAISE EXCEPTION 'Mã giảm giá đã hết lượt sử dụng'; END IF;
      
      SELECT count(*) INTO v_user_usage_count FROM public.discount_code_redemptions 
      WHERE discount_code_id = v_coupon.id AND user_id = v_user_id AND status != 'released';
      
      IF v_user_usage_count >= v_coupon.usage_limit_per_user THEN RAISE EXCEPTION 'Bạn đã sử dụng hết lượt cho mã này'; END IF;

      IF v_coupon.first_order_only THEN
          SELECT EXISTS(SELECT 1 FROM public.orders WHERE user_id = v_user_id AND status NOT IN ('cancelled')) INTO v_has_previous_order;
          IF v_has_previous_order THEN RAISE EXCEPTION 'Mã chỉ áp dụng cho đơn hàng đầu tiên'; END IF;
      END IF;

      IF v_coupon.discount_type = 'percentage' THEN
          v_raw_discount := v_subtotal * (v_coupon.discount_value / 100.0);
          IF v_coupon.max_discount_amount IS NOT NULL THEN
              v_discount_amount := least(v_raw_discount, v_coupon.max_discount_amount);
          ELSE
              v_discount_amount := v_raw_discount;
          END IF;
      ELSIF v_coupon.discount_type = 'fixed_amount' THEN
          v_discount_amount := least(v_coupon.discount_value, v_subtotal);
      ELSIF v_coupon.discount_type = 'free_shipping' THEN
          v_discount_amount := 0;
          v_shipping_discount_amount := least(v_shipping_fee, v_coupon.discount_value);
      END IF;

      -- Cập nhật usage ngay trong transaction này
      UPDATE public.discount_codes 
      SET current_usage = current_usage + 1 
      WHERE id = v_coupon.id;
  END IF;

  v_total_amount := v_subtotal + v_shipping_fee - v_discount_amount - v_shipping_discount_amount;
  IF v_total_amount < 0 THEN v_total_amount := 0; END IF;

  -- Determine statuses based on payment method
  IF p_payment_method = 'bank_transfer_qr' THEN
    v_order_status := 'pending_payment'; v_payment_status := 'awaiting_payment'; v_transfer_content := v_order_code;
  ELSIF p_payment_method = 'cod' THEN
    v_order_status := 'pending'; v_payment_status := 'unpaid';
  ELSIF p_payment_method = 'test_payment' THEN
    v_order_status := 'pending_payment'; v_payment_status := 'awaiting_payment'; v_transfer_content := v_order_code;
  END IF;

  -- Insert into orders
  INSERT INTO public.orders (
    order_code, user_id, address_id, status, payment_status, payment_method,
    subtotal, shipping_fee, discount_amount, shipping_discount_amount, total_amount, shipping_address_snapshot, customer_note,
    discount_code_id, discount_code_snapshot, discount_type_snapshot, discount_value_snapshot
  )
  VALUES (
    v_order_code, v_user_id, p_address_id, v_order_status, v_payment_status, p_payment_method,
    v_subtotal, v_shipping_fee, v_discount_amount, v_shipping_discount_amount, v_total_amount,
    jsonb_build_object(
      'recipient_name', v_address.recipient_name, 'phone', v_address.phone, 'address_line', v_address.address_line,
      'ward', v_address.ward, 'district', v_address.district, 'province', v_address.province,
      'postal_code', v_address.postal_code, 'delivery_note', v_address.delivery_note
    ),
    p_customer_note,
    (CASE WHEN v_coupon.id IS NOT NULL THEN v_coupon.id ELSE null END),
    (CASE WHEN v_coupon.id IS NOT NULL THEN v_coupon.code ELSE null END),
    (CASE WHEN v_coupon.id IS NOT NULL THEN v_coupon.discount_type ELSE null END),
    (CASE WHEN v_coupon.id IS NOT NULL THEN v_coupon.discount_value ELSE null END)
  )
  RETURNING id INTO v_order_id;

  -- Tạo redemption
  IF v_coupon.id IS NOT NULL THEN
      INSERT INTO public.discount_code_redemptions (
          discount_code_id, user_id, order_id, status, discount_amount, shipping_discount_amount
      ) VALUES (
          v_coupon.id, v_user_id, v_order_id, 'reserved', v_discount_amount, v_shipping_discount_amount
      );
  END IF;

  -- Insert into order_items
  FOR v_item IN SELECT * FROM jsonb_to_recordset(p_items) AS x(book_id bigint, quantity int)
  LOOP
    SELECT id, title, slug, image_url, price, original_price, source_id
    INTO v_book FROM public.books WHERE id = v_item.book_id;
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
-- 6. TẠO TEST SEED MÃ GIẢM GIÁ
-- ==============================================================================
INSERT INTO public.discount_codes (code, name, description, discount_type, discount_value, max_discount_amount, min_order_amount, usage_limit_per_user, first_order_only)
VALUES 
  ('WELCOME10', 'Giảm 10% Đơn Đầu Tiên', 'Áp dụng cho mọi đơn hàng đầu tiên tối thiểu 200k', 'percentage', 10, 50000, 200000, 1, true),
  ('SAVE50K', 'Giảm Ngay 50K', 'Giảm 50k cho đơn từ 500k', 'fixed_amount', 50000, null, 500000, 1, false),
  ('FREESHIP', 'Miễn phí vận chuyển', 'Freeship tối đa 30K', 'free_shipping', 30000, null, 0, 2, false)
ON CONFLICT DO NOTHING;

-- Revoke permissions for security
REVOKE ALL ON FUNCTION public.preview_checkout_totals(jsonb, text) FROM PUBLIC;
REVOKE ALL ON FUNCTION public.preview_checkout_totals(jsonb, text) FROM anon;
GRANT EXECUTE ON FUNCTION public.preview_checkout_totals(jsonb, text) TO authenticated;
