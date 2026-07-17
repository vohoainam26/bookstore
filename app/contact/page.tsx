"use client";

import { useState } from "react";
import { siteConfig } from "@/lib/site-config";
import { supabase } from "@/lib/supabase";
import { MapPin, Phone, EnvelopeSimple } from "@phosphor-icons/react";

export default function ContactPage() {
  const [formData, setFormData] = useState({
    fullName: "",
    email: "",
    phone: "",
    subject: "",
    message: ""
  });

  const [status, setStatus] = useState<"idle" | "loading" | "success" | "error">("idle");
  const [errorMsg, setErrorMsg] = useState("");

  const validate = () => {
    if (formData.fullName.trim().length < 2 || formData.fullName.trim().length > 100) return "Họ tên phải từ 2-100 ký tự.";
    if (!/^\S+@\S+\.\S+$/.test(formData.email)) return "Email không hợp lệ.";
    if (formData.subject.trim().length < 3 || formData.subject.trim().length > 150) return "Chủ đề phải từ 3-150 ký tự.";
    if (formData.message.trim().length < 10 || formData.message.trim().length > 3000) return "Nội dung phải từ 10-3000 ký tự.";
    return null;
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    const err = validate();
    if (err) {
      setErrorMsg(err);
      return;
    }

    setStatus("loading");
    setErrorMsg("");

    try {
      const { data, error } = await supabase.rpc("submit_contact_message", {
        p_full_name: formData.fullName,
        p_email: formData.email,
        p_phone: formData.phone,
        p_subject: formData.subject,
        p_message: formData.message
      });

      if (error) throw error;
      setStatus("success");
      setFormData({ fullName: "", email: "", phone: "", subject: "", message: "" });
    } catch (err: any) {
      console.error(err);
      setStatus("error");
      setErrorMsg(err.message || "Đã xảy ra lỗi khi gửi tin nhắn. Vui lòng thử lại sau.");
    }
  };

  return (
    <main className="min-h-screen bg-gray-50 py-16 px-4">
      <div className="max-w-6xl mx-auto">
        <div className="text-center mb-16">
          <h1 className="text-4xl font-extrabold text-gray-900 mb-4" style={{ fontFamily: "var(--font-display)" }}>
            Liên hệ chúng tôi
          </h1>
          <p className="text-gray-600 max-w-2xl mx-auto">
            Nếu bạn có bất kỳ câu hỏi nào, xin vui lòng liên hệ. Chúng tôi luôn sẵn sàng hỗ trợ bạn.
          </p>
        </div>

        <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
          {/* Contact Info */}
          <div className="lg:col-span-1 space-y-6">
            <div className="bg-white rounded-2xl p-8 shadow-sm border border-gray-100 h-full">
              <h3 className="text-xl font-bold text-gray-900 mb-6">Thông tin liên hệ</h3>
              
              <div className="space-y-6">
                <div className="flex items-start gap-4">
                  <div className="w-10 h-10 rounded-full bg-red-50 flex items-center justify-center flex-shrink-0 text-red-600">
                    <MapPin size={20} weight="fill" />
                  </div>
                  <div>
                    <p className="font-semibold text-gray-900">Địa chỉ</p>
                    <p className="text-gray-600 text-sm mt-1">{siteConfig.contact.address}</p>
                  </div>
                </div>

                <div className="flex items-start gap-4">
                  <div className="w-10 h-10 rounded-full bg-red-50 flex items-center justify-center flex-shrink-0 text-red-600">
                    <Phone size={20} weight="fill" />
                  </div>
                  <div>
                    <p className="font-semibold text-gray-900">Điện thoại</p>
                    <p className="text-gray-600 text-sm mt-1">{siteConfig.contact.phone}</p>
                  </div>
                </div>

                <div className="flex items-start gap-4">
                  <div className="w-10 h-10 rounded-full bg-red-50 flex items-center justify-center flex-shrink-0 text-red-600">
                    <EnvelopeSimple size={20} weight="fill" />
                  </div>
                  <div>
                    <p className="font-semibold text-gray-900">Email</p>
                    <p className="text-gray-600 text-sm mt-1">{siteConfig.contact.email}</p>
                  </div>
                </div>
              </div>
            </div>
          </div>

          {/* Contact Form */}
          <div className="lg:col-span-2">
            <div className="bg-white rounded-2xl p-8 shadow-sm border border-gray-100">
              {status === "success" ? (
                <div className="text-center py-12">
                  <div className="w-16 h-16 bg-green-100 text-green-600 rounded-full flex items-center justify-center mx-auto mb-4">
                    <svg className="w-8 h-8" fill="none" stroke="currentColor" viewBox="0 0 24 24" xmlns="http://www.w3.org/2000/svg"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M5 13l4 4L19 7" /></svg>
                  </div>
                  <h3 className="text-2xl font-bold text-gray-900 mb-2">Gửi thành công!</h3>
                  <p className="text-gray-600 mb-6">Cảm ơn bạn đã liên hệ. Chúng tôi sẽ phản hồi trong thời gian sớm nhất.</p>
                  <button onClick={() => setStatus("idle")} className="text-red-600 font-semibold hover:underline">
                    Gửi tin nhắn khác
                  </button>
                </div>
              ) : (
                <form onSubmit={handleSubmit} className="space-y-5">
                  <div className="grid grid-cols-1 md:grid-cols-2 gap-5">
                    <div>
                      <label className="block text-sm font-medium text-gray-700 mb-1">Họ và tên <span className="text-red-500">*</span></label>
                      <input 
                        type="text" 
                        required 
                        disabled={status === "loading"}
                        className="w-full px-4 py-2.5 rounded-xl border border-gray-200 focus:outline-none focus:ring-2 focus:ring-red-500/20 focus:border-red-500 transition-all"
                        value={formData.fullName}
                        onChange={e => setFormData({...formData, fullName: e.target.value})}
                      />
                    </div>
                    <div>
                      <label className="block text-sm font-medium text-gray-700 mb-1">Email <span className="text-red-500">*</span></label>
                      <input 
                        type="email" 
                        required 
                        disabled={status === "loading"}
                        className="w-full px-4 py-2.5 rounded-xl border border-gray-200 focus:outline-none focus:ring-2 focus:ring-red-500/20 focus:border-red-500 transition-all"
                        value={formData.email}
                        onChange={e => setFormData({...formData, email: e.target.value})}
                      />
                    </div>
                  </div>

                  <div className="grid grid-cols-1 md:grid-cols-2 gap-5">
                    <div>
                      <label className="block text-sm font-medium text-gray-700 mb-1">Số điện thoại</label>
                      <input 
                        type="tel" 
                        disabled={status === "loading"}
                        className="w-full px-4 py-2.5 rounded-xl border border-gray-200 focus:outline-none focus:ring-2 focus:ring-red-500/20 focus:border-red-500 transition-all"
                        value={formData.phone}
                        onChange={e => setFormData({...formData, phone: e.target.value})}
                      />
                    </div>
                    <div>
                      <label className="block text-sm font-medium text-gray-700 mb-1">Chủ đề <span className="text-red-500">*</span></label>
                      <input 
                        type="text" 
                        required 
                        disabled={status === "loading"}
                        className="w-full px-4 py-2.5 rounded-xl border border-gray-200 focus:outline-none focus:ring-2 focus:ring-red-500/20 focus:border-red-500 transition-all"
                        value={formData.subject}
                        onChange={e => setFormData({...formData, subject: e.target.value})}
                      />
                    </div>
                  </div>

                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-1">Nội dung <span className="text-red-500">*</span></label>
                    <textarea 
                      required 
                      rows={5}
                      disabled={status === "loading"}
                      className="w-full px-4 py-2.5 rounded-xl border border-gray-200 focus:outline-none focus:ring-2 focus:ring-red-500/20 focus:border-red-500 transition-all resize-none"
                      value={formData.message}
                      onChange={e => setFormData({...formData, message: e.target.value})}
                    ></textarea>
                  </div>

                  {errorMsg && (
                    <div className="p-3 bg-red-50 text-red-600 rounded-lg text-sm font-medium">
                      {errorMsg}
                    </div>
                  )}

                  <button 
                    type="submit" 
                    disabled={status === "loading"}
                    className="w-full md:w-auto px-8 py-3 rounded-xl font-bold text-white transition-all disabled:opacity-70 hover:opacity-90 active:scale-95"
                    style={{ background: "var(--color-brand)" }}
                  >
                    {status === "loading" ? "Đang gửi..." : "Gửi tin nhắn"}
                  </button>
                </form>
              )}
            </div>
          </div>
        </div>
      </div>
    </main>
  );
}
