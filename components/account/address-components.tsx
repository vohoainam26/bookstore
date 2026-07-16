"use client";

import { useState } from "react";
import { MapPin, Plus, Trash, Star, X } from "@phosphor-icons/react";
import { ShippingAddress, createAddress, deleteAddress, setDefaultAddress } from "@/lib/data/addresses";
import { useCartStore } from "@/store/cartStore";

export function AddressList({ addresses }: { addresses: ShippingAddress[] }) {
  const [showForm, setShowForm] = useState(false);
  const { addToast } = useCartStore();

  const handleDelete = async (id: number) => {
    if (!confirm("Bạn có chắc chắn muốn xóa địa chỉ này?")) return;
    const res = await deleteAddress(id);
    if (res.success) {
      addToast("Đã xóa địa chỉ", "success");
    } else {
      addToast(res.error || "Có lỗi xảy ra", "error");
    }
  };

  const handleSetDefault = async (id: number) => {
    const res = await setDefaultAddress(id);
    if (res.success) {
      addToast("Đã cập nhật địa chỉ mặc định", "success");
    } else {
      addToast(res.error || "Có lỗi xảy ra", "error");
    }
  };

  return (
    <div>
      <div className="flex items-center justify-between mb-6">
        <h2 className="text-xl font-bold text-gray-900" style={{ fontFamily: "var(--font-outfit)" }}>
          Địa chỉ giao hàng
        </h2>
        <button
          onClick={() => setShowForm(true)}
          className="flex items-center gap-2 px-4 py-2 rounded-full text-sm font-semibold transition-all hover:opacity-90"
          style={{ background: "var(--color-brand)", color: "white", fontFamily: "var(--font-outfit)" }}
        >
          <Plus size={14} weight="bold" />
          Thêm địa chỉ mới
        </button>
      </div>

      {showForm && (
        <div className="mb-6">
          <AddressForm onCancel={() => setShowForm(false)} />
        </div>
      )}

      {addresses.length === 0 && !showForm ? (
        <div className="text-center py-12 bg-white rounded-2xl shadow-sm">
          <MapPin size={48} className="mx-auto text-gray-300 mb-3" />
          <p className="text-gray-500 font-medium">Bạn chưa có địa chỉ giao hàng nào.</p>
        </div>
      ) : (
        <div className="space-y-4">
          {addresses.map((addr) => (
            <div
              key={addr.id}
              className="p-5 rounded-2xl relative bg-white shadow-sm"
              style={{
                border: `1px solid ${addr.is_default ? "var(--color-forest-300)" : "var(--color-border)"}`,
                boxShadow: addr.is_default ? "0 0 0 2px var(--color-forest-100)" : "none",
              }}
            >
              <div className="flex items-start justify-between gap-3">
                <div className="flex items-center gap-2 mb-2">
                  <MapPin size={16} style={{ color: "var(--color-brand)" }} />
                  <span className="font-bold text-sm text-gray-900" style={{ fontFamily: "var(--font-outfit)" }}>
                    {addr.label || "Địa chỉ"}
                  </span>
                  {addr.is_default && (
                    <span
                      className="text-xs px-2 py-0.5 rounded-full font-semibold"
                      style={{ background: "var(--color-forest-100)", color: "var(--color-brand)" }}
                    >
                      Mặc định
                    </span>
                  )}
                </div>
                <div className="flex gap-2">
                  {!addr.is_default && (
                    <button
                      onClick={() => handleSetDefault(addr.id)}
                      className="text-xs font-medium text-gray-500 hover:text-[var(--color-brand)] transition-colors flex items-center gap-1"
                    >
                      <Star size={14} /> Mặc định
                    </button>
                  )}
                  <button
                    onClick={() => handleDelete(addr.id)}
                    className="text-xs font-medium text-red-500 hover:text-red-600 transition-colors flex items-center gap-1 ml-2"
                  >
                    <Trash size={14} /> Xóa
                  </button>
                </div>
              </div>
              <p className="text-sm font-medium text-gray-800">{addr.recipient_name} - {addr.phone}</p>
              <p className="text-sm mt-0.5 text-gray-600">{addr.address_line}</p>
              <p className="text-sm mt-0.5 text-gray-500">
                {[addr.ward, addr.district, addr.province].filter(Boolean).join(", ")}
              </p>
            </div>
          ))}
        </div>
      )}
    </div>
  );
}

export function AddressForm({ onCancel }: { onCancel: () => void }) {
  const { addToast } = useCartStore();
  const [loading, setLoading] = useState(false);

  const handleSubmit = async (e: React.FormEvent<HTMLFormElement>) => {
    e.preventDefault();
    setLoading(true);
    const formData = new FormData(e.currentTarget);
    const res = await createAddress(formData);
    setLoading(false);
    
    if (res.success) {
      addToast("Thêm địa chỉ thành công", "success");
      onCancel();
    } else {
      addToast(res.error || "Vui lòng kiểm tra lại thông tin", "error");
    }
  };

  return (
    <form onSubmit={handleSubmit} className="bg-white p-6 rounded-2xl shadow-sm border border-gray-100 relative">
      <button 
        type="button" 
        onClick={onCancel}
        className="absolute top-4 right-4 text-gray-400 hover:text-gray-600"
      >
        <X size={20} />
      </button>
      <h3 className="font-bold text-gray-900 mb-4" style={{ fontFamily: "var(--font-outfit)" }}>Thêm địa chỉ giao hàng</h3>
      
      <div className="grid grid-cols-1 md:grid-cols-2 gap-4 mb-4">
        <div>
          <label className="block text-xs font-semibold text-gray-500 mb-1">Họ tên người nhận *</label>
          <input required name="recipient_name" type="text" className="w-full px-3 py-2 border rounded-lg text-sm" placeholder="Nhập họ tên" />
        </div>
        <div>
          <label className="block text-xs font-semibold text-gray-500 mb-1">Số điện thoại *</label>
          <input required name="phone" type="tel" className="w-full px-3 py-2 border rounded-lg text-sm" placeholder="Nhập SĐT" />
        </div>
        <div className="md:col-span-2">
          <label className="block text-xs font-semibold text-gray-500 mb-1">Địa chỉ chi tiết (Số nhà, đường) *</label>
          <input required name="address_line" type="text" className="w-full px-3 py-2 border rounded-lg text-sm" placeholder="Ví dụ: 123 Nguyễn Huệ" />
        </div>
        <div>
          <label className="block text-xs font-semibold text-gray-500 mb-1">Tỉnh/Thành phố *</label>
          <input required name="province" type="text" className="w-full px-3 py-2 border rounded-lg text-sm" placeholder="Tỉnh/Thành phố" />
        </div>
        <div>
          <label className="block text-xs font-semibold text-gray-500 mb-1">Quận/Huyện</label>
          <input name="district" type="text" className="w-full px-3 py-2 border rounded-lg text-sm" placeholder="Quận/Huyện" />
        </div>
        <div>
          <label className="block text-xs font-semibold text-gray-500 mb-1">Phường/Xã</label>
          <input name="ward" type="text" className="w-full px-3 py-2 border rounded-lg text-sm" placeholder="Phường/Xã" />
        </div>
        <div>
          <label className="block text-xs font-semibold text-gray-500 mb-1">Nhãn (Ví dụ: Nhà riêng, Công ty)</label>
          <input name="label" type="text" className="w-full px-3 py-2 border rounded-lg text-sm" placeholder="Nhà riêng" />
        </div>
      </div>
      
      <div className="flex items-center gap-2 mb-6">
        <input type="checkbox" id="is_default" name="is_default" value="true" className="rounded text-[var(--color-brand)] focus:ring-[var(--color-brand)]" />
        <label htmlFor="is_default" className="text-sm font-medium text-gray-700">Đặt làm địa chỉ mặc định</label>
      </div>

      <div className="flex gap-3 justify-end">
        <button type="button" onClick={onCancel} className="px-4 py-2 rounded-lg text-sm font-semibold text-gray-600 bg-gray-100 hover:bg-gray-200">
          Hủy
        </button>
        <button type="submit" disabled={loading} className="px-4 py-2 rounded-lg text-sm font-semibold text-white bg-[var(--color-brand)] hover:opacity-90 disabled:opacity-50">
          {loading ? "Đang lưu..." : "Lưu địa chỉ"}
        </button>
      </div>
    </form>
  );
}
