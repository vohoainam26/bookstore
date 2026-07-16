"use client";

import { useState, useEffect, useRef } from "react";
import { useRouter } from "next/navigation";
import { useCartStore } from "@/store/cartStore";
import { createClient } from "@/lib/supabase/client";
import { getUserAddresses, ShippingAddress } from "@/lib/data/addresses";
import Link from "next/link";
import { MapPin, Plus, Money, Bank, Info, SpinnerGap } from "@phosphor-icons/react";
import CouponInput from "@/components/checkout/coupon-input";
import { previewCoupon, CheckoutTotals } from "./coupon-actions";

export default function CheckoutPage() {
  const router = useRouter();
  const { cartItems, getCartTotal, clearCart } = useCartStore();
  const isCheckingOut = useRef(false);
  const [user, setUser] = useState<any>(null);
  const [addresses, setAddresses] = useState<ShippingAddress[]>([]);
  const [selectedAddressId, setSelectedAddressId] = useState<number | null>(null);
  const [paymentMethod, setPaymentMethod] = useState<string>("cod");
  const [customerNote, setCustomerNote] = useState("");
  const [loading, setLoading] = useState(true);
  const [submitting, setSubmitting] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [couponData, setCouponData] = useState<CheckoutTotals | null>(null);
  const [applyingCoupon, setApplyingCoupon] = useState(false);

  useEffect(() => {
    if (isCheckingOut.current) return;
    
    if (cartItems.length === 0) {
      router.push("/products");
      return;
    }

    const loadData = async () => {
      const supabase = createClient();
      const { data: { user } } = await supabase.auth.getUser();
      if (!user) {
        router.push("/account/login?next=/checkout");
        return;
      }
      setUser(user);

      const { addresses } = await getUserAddresses();
      setAddresses(addresses);
      if (addresses.length > 0) {
        setSelectedAddressId(addresses[0].id);
      }

      // Check for coupon in URL
      const urlParams = new URLSearchParams(window.location.search);
      const urlCoupon = urlParams.get('coupon');
      if (urlCoupon) {
        const items = cartItems.map(i => ({ book_id: parseInt(i.product.id), quantity: i.quantity }));
        const res = await previewCoupon(items, urlCoupon);
        if (res.success && res.data && res.data.coupon_valid) {
          setCouponData(res.data);
        }
      }

      setLoading(false);
    };

    loadData();
  }, [cartItems, router]);

  const handleCheckout = async () => {
    if (!selectedAddressId) {
      setError("Vui lòng chọn địa chỉ giao hàng");
      return;
    }

    isCheckingOut.current = true;
    setSubmitting(true);
    setError(null);

    try {
      const supabase = createClient();
      const itemsPayload = cartItems.map(item => ({
        book_id: parseInt(item.product.id),
        quantity: item.quantity
      }));

      const { data, error } = await supabase.rpc('create_order_from_cart', {
        p_address_id: selectedAddressId,
        p_items: itemsPayload,
        p_payment_method: paymentMethod,
        p_customer_note: customerNote || null,
        p_coupon_code: couponData?.coupon_valid ? couponData.coupon_code : null
      });

      if (error) throw error;

      clearCart();

      // Redirect based on payment method
      if (paymentMethod === 'bank_transfer_qr' || paymentMethod === 'test_payment') {
        router.push(`/checkout/payment/${data.order_code}`);
      } else {
        router.push(`/checkout/success/${data.order_code}`);
      }
    } catch (err: any) {
      isCheckingOut.current = false;
      console.error("Checkout error detail:", JSON.stringify(err, Object.getOwnPropertyNames(err)));
      setError(err.message || (typeof err === 'object' ? JSON.stringify(err) : "Đã xảy ra lỗi khi tạo đơn hàng."));
      setSubmitting(false);
    }
  };

  if (loading) {
    return <div className="min-h-screen flex justify-center items-center"><SpinnerGap size={32} className="animate-spin text-blue-600" /></div>;
  }

  const handleApplyCoupon = async (code: string) => {
    setApplyingCoupon(true);
    setError(null);
    const items = cartItems.map(i => ({ book_id: parseInt(i.product.id), quantity: i.quantity }));
    const res = await previewCoupon(items, code);
    if (res.success && res.data) {
      if (res.data.coupon_valid) {
        setCouponData(res.data);
      } else {
        setError(res.data.message || "Mã giảm giá không hợp lệ");
        setCouponData(null);
      }
    } else {
      setError(res.error || "Có lỗi xảy ra");
      setCouponData(null);
    }
    setApplyingCoupon(false);
  };

  const handleRemoveCoupon = () => {
    setCouponData(null);
    setError(null);
  };

  const subtotal = couponData ? couponData.subtotal : getCartTotal();
  const shippingFee = couponData ? couponData.shipping_fee : (subtotal >= 200000 ? 0 : 30000);
  const discountAmount = couponData ? couponData.discount_amount : 0;
  const shippingDiscount = couponData ? couponData.shipping_discount_amount : 0;
  const total = couponData ? couponData.total_amount : (subtotal + shippingFee);

  return (
    <div className="bg-gray-50 min-h-screen py-10">
      <div className="max-w-[1000px] mx-auto px-4 md:px-0">
        <h1 className="text-2xl font-bold text-gray-900 mb-8">Thanh toán</h1>
        
        <div className="grid grid-cols-1 md:grid-cols-3 gap-8">
          <div className="md:col-span-2 space-y-6">
            
            {/* Address Selection */}
            <div className="bg-white p-6 rounded-xl shadow-sm border border-gray-100">
              <h2 className="text-lg font-bold text-gray-800 mb-4 flex items-center gap-2">
                <MapPin size={20} className="text-blue-600" weight="fill" /> Địa chỉ giao hàng
              </h2>
              
              {addresses.length === 0 ? (
                <div className="bg-yellow-50 border border-yellow-200 text-yellow-800 p-4 rounded-lg text-sm mb-4">
                  Bạn chưa có địa chỉ giao hàng nào. Vui lòng thêm địa chỉ trước khi thanh toán.
                  <div className="mt-3">
                    <Link href="/account/addresses" className="bg-blue-600 text-white px-4 py-2 rounded shadow text-sm font-medium">
                      + Thêm địa chỉ mới
                    </Link>
                  </div>
                </div>
              ) : (
                <div className="space-y-3">
                  {addresses.map(addr => (
                    <label key={addr.id} className={`flex items-start gap-3 p-4 border rounded-lg cursor-pointer transition-colors ${selectedAddressId === addr.id ? 'border-blue-500 bg-blue-50' : 'border-gray-200 hover:bg-gray-50'}`}>
                      <input 
                        type="radio" 
                        name="address" 
                        value={addr.id} 
                        checked={selectedAddressId === addr.id}
                        onChange={() => setSelectedAddressId(addr.id)}
                        className="mt-1"
                      />
                      <div>
                        <p className="font-medium text-gray-900">{addr.recipient_name} - {addr.phone}</p>
                        <p className="text-sm text-gray-600 mt-1">
                          {[addr.address_line, addr.ward, addr.district, addr.province].filter(Boolean).join(", ")}
                        </p>
                      </div>
                    </label>
                  ))}
                  <div className="mt-2 text-right">
                    <Link href="/account/addresses" className="text-sm text-blue-600 hover:underline">
                      Quản lý địa chỉ
                    </Link>
                  </div>
                </div>
              )}
            </div>

            {/* Payment Method */}
            <div className="bg-white p-6 rounded-xl shadow-sm border border-gray-100">
              <h2 className="text-lg font-bold text-gray-800 mb-4 flex items-center gap-2">
                <Money size={20} className="text-blue-600" weight="fill" /> Phương thức thanh toán
              </h2>
              <div className="space-y-3">
                <label className={`flex items-center gap-3 p-4 border rounded-lg cursor-pointer transition-colors ${paymentMethod === 'cod' ? 'border-blue-500 bg-blue-50' : 'border-gray-200 hover:bg-gray-50'}`}>
                  <input 
                    type="radio" 
                    name="payment" 
                    value="cod" 
                    checked={paymentMethod === 'cod'}
                    onChange={() => setPaymentMethod('cod')}
                  />
                  <div>
                    <p className="font-medium text-gray-900">Thanh toán tiền mặt khi nhận hàng (COD)</p>
                  </div>
                </label>
                
                <label className={`flex items-center gap-3 p-4 border rounded-lg cursor-pointer transition-colors ${paymentMethod === 'bank_transfer_qr' ? 'border-blue-500 bg-blue-50' : 'border-gray-200 hover:bg-gray-50'}`}>
                  <input 
                    type="radio" 
                    name="payment" 
                    value="bank_transfer_qr" 
                    checked={paymentMethod === 'bank_transfer_qr'}
                    onChange={() => setPaymentMethod('bank_transfer_qr')}
                  />
                  <div>
                    <p className="font-medium text-gray-900">Chuyển khoản qua mã QR (VietQR)</p>
                  </div>
                </label>

                {process.env.NEXT_PUBLIC_PAYMENT_TEST_MODE === 'true' && (
                  <label className={`flex items-start gap-3 p-4 border rounded-lg cursor-pointer transition-colors ${paymentMethod === 'test_payment' ? 'border-amber-500 bg-amber-50' : 'border-gray-200 hover:bg-gray-50'}`}>
                    <input 
                      type="radio" 
                      name="payment" 
                      value="test_payment" 
                      checked={paymentMethod === 'test_payment'}
                      onChange={() => setPaymentMethod('test_payment')}
                      className="mt-1"
                    />
                    <div>
                      <p className="font-medium text-amber-900 flex items-center gap-1">
                        <Bank weight="fill" /> Thanh toán thử nghiệm (TEST MODE)
                      </p>
                      <p className="text-xs text-amber-700 mt-1">
                        Phương thức này chỉ dùng để kiểm tra hệ thống, mô phỏng việc thanh toán thành công ngay lập tức mà không phát sinh giao dịch thật.
                      </p>
                    </div>
                  </label>
                )}
              </div>
            </div>

            {/* Note */}
            <div className="bg-white p-6 rounded-xl shadow-sm border border-gray-100">
              <h2 className="text-lg font-bold text-gray-800 mb-4">Ghi chú đơn hàng</h2>
              <textarea 
                className="w-full border border-gray-300 rounded-lg p-3 text-sm focus:outline-none focus:ring-2 focus:ring-blue-500"
                rows={3}
                placeholder="Ghi chú về việc giao hàng (tùy chọn)"
                value={customerNote}
                onChange={(e) => setCustomerNote(e.target.value)}
              />
            </div>
          </div>

          <div className="md:col-span-1">
            <div className="sticky top-24">
              <CouponInput 
                onApply={handleApplyCoupon}
                onRemove={handleRemoveCoupon}
                loading={applyingCoupon}
                couponData={couponData}
              />

              <div className="bg-white p-6 rounded-xl shadow-sm border border-gray-100">
                <h2 className="text-lg font-bold text-gray-800 mb-4">Thông tin đơn hàng</h2>
              
              <div className="space-y-4 mb-6 max-h-64 overflow-y-auto pr-2">
                {cartItems.map((item) => (
                  <div key={`${item.product.id}-${item.selectedCover}`} className="flex justify-between text-sm">
                    <div className="flex-1 pr-4">
                      <p className="text-gray-800 line-clamp-2">{item.product.name}</p>
                      <p className="text-gray-500 text-xs mt-0.5">SL: {item.quantity}</p>
                    </div>
                    <span className="font-medium text-gray-900 whitespace-nowrap">
                      {(item.product.price * item.quantity).toLocaleString("vi-VN")} đ
                    </span>
                  </div>
                ))}
              </div>

              <div className="border-t border-gray-100 pt-4 space-y-3 text-sm">
                <div className="flex justify-between text-gray-600">
                  <span>Tạm tính</span>
                  <span>{subtotal.toLocaleString("vi-VN")} đ</span>
                </div>
                <div className="flex justify-between text-gray-600">
                  <span>Phí vận chuyển</span>
                  <span>{shippingFee === 0 ? "Miễn phí" : `${shippingFee.toLocaleString("vi-VN")} đ`}</span>
                </div>
                {discountAmount > 0 && (
                  <div className="flex justify-between text-green-600">
                    <span>Giảm giá</span>
                    <span>-{discountAmount.toLocaleString("vi-VN")} đ</span>
                  </div>
                )}
                {shippingDiscount > 0 && (
                  <div className="flex justify-between text-green-600">
                    <span>Giảm phí vận chuyển</span>
                    <span>-{shippingDiscount.toLocaleString("vi-VN")} đ</span>
                  </div>
                )}
                {shippingFee > 0 && shippingDiscount < shippingFee && (
                  <p className="text-xs text-blue-600 bg-blue-50 p-2 rounded">
                    <Info size={14} className="inline mr-1" /> Mua thêm {(200000 - subtotal).toLocaleString("vi-VN")}đ để được freeship
                  </p>
                )}
                <div className="flex justify-between font-bold text-lg pt-2 border-t border-gray-100">
                  <span className="text-gray-900">Tổng cộng</span>
                  <span className="text-red-600">{total.toLocaleString("vi-VN")} đ</span>
                </div>
              </div>

              {error && (
                <div className="mt-4 p-3 bg-red-50 text-red-600 text-sm rounded-lg border border-red-100">
                  {error}
                </div>
              )}

              <button
                onClick={handleCheckout}
                disabled={submitting || !selectedAddressId}
                className={`w-full mt-6 py-3 rounded-xl font-bold text-white shadow-sm transition-all flex items-center justify-center gap-2 ${
                  submitting || !selectedAddressId ? 'bg-gray-400 cursor-not-allowed' : 'bg-red-600 hover:bg-red-700'
                }`}
              >
                {submitting ? (
                  <><SpinnerGap size={20} className="animate-spin" /> Đang xử lý...</>
                ) : (
                  paymentMethod === 'cod' ? "ĐẶT HÀNG" : "TIẾP TỤC THANH TOÁN"
                )}
              </button>
            </div>
          </div>
        </div>
      </div>
    </div>
    </div>
  );
}
