"use client";

import { useState } from "react";
import { useRouter, useSearchParams } from "next/navigation";
import { Suspense } from "react";
import { createClient } from "@/lib/supabase/client";
import Link from "next/link";
import { EnvelopeSimple, LockKey, User } from "@phosphor-icons/react";

function RegisterContent() {
  const router = useRouter();
  const searchParams = useSearchParams();
  const nextParam = searchParams.get("next");
  const emailParam = searchParams.get("email");
  
  const [fullName, setFullName] = useState("");
  const [email, setEmail] = useState(emailParam || "");
  const [password, setPassword] = useState("");
  const [confirmPassword, setConfirmPassword] = useState("");
  const [error, setError] = useState("");
  const [success, setSuccess] = useState(false);
  const [loading, setLoading] = useState(false);

  const supabase = createClient();

  const handleRegister = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);
    setError("");

    // Validation
    if (password.length < 8) {
      setError("Mật khẩu phải có ít nhất 8 ký tự.");
      setLoading(false);
      return;
    }
    if (password !== confirmPassword) {
      setError("Mật khẩu xác nhận không khớp.");
      setLoading(false);
      return;
    }

    const { error: signUpError } = await supabase.auth.signUp({
      email,
      password,
      options: {
        data: {
          full_name: fullName,
        },
        emailRedirectTo: `${window.location.origin}/auth/confirm${nextParam ? `?next=${encodeURIComponent(nextParam)}` : ""}`,
      },
    });

    if (signUpError) {
      if (signUpError.message.includes("already registered")) {
        setError("Email này đã được đăng ký.");
      } else {
        setError(signUpError.message);
      }
      setLoading(false);
    } else {
      setSuccess(true);
      setLoading(false);
    }
  };

  if (success) {
    return (
      <div style={{ background: "var(--color-surface)" }} className="min-h-[70vh] flex items-center justify-center">
        <div className="w-full max-w-md mx-auto p-8 rounded-2xl bg-white shadow-sm border border-gray-100 my-16 text-center">
          <div className="w-16 h-16 bg-green-100 text-green-600 rounded-full flex items-center justify-center mx-auto mb-6">
            <EnvelopeSimple size={32} />
          </div>
          <h1 className="text-2xl font-bold text-gray-900 mb-4" style={{ fontFamily: "var(--font-outfit)" }}>
            Kiểm tra email của bạn
          </h1>
          <p className="text-gray-500 mb-6">
            Chúng tôi đã gửi một liên kết xác nhận đến <strong>{email}</strong>. Vui lòng kiểm tra hộp thư đến (và thư mục spam) để kích hoạt tài khoản.
          </p>
          <Link href={`/account/login${nextParam ? `?next=${encodeURIComponent(nextParam)}` : ""}`} className="font-semibold text-green-700 hover:underline">
            Quay lại trang đăng nhập
          </Link>
        </div>
      </div>
    );
  }

  return (
    <div style={{ background: "var(--color-surface)" }} className="min-h-[70vh] flex items-center justify-center py-12">
      <div className="w-full max-w-md mx-auto p-8 rounded-2xl bg-white shadow-sm border border-gray-100">
        <div className="text-center mb-8">
          <h1 className="text-2xl font-bold text-gray-900 mb-2" style={{ fontFamily: "var(--font-outfit)" }}>
            Tạo tài khoản
          </h1>
          <p className="text-sm text-gray-500">Đăng ký để nhận nhiều ưu đãi từ Nhà sách</p>
        </div>

        {error && (
          <div className="mb-6 p-4 rounded-lg bg-red-50 border border-red-100 text-sm text-red-600">
            {error}
          </div>
        )}

        <form onSubmit={handleRegister} className="space-y-5">
          <div>
            <label className="block text-sm font-semibold text-gray-700 mb-1.5">Họ và tên</label>
            <div className="relative">
              <input
                type="text"
                value={fullName}
                onChange={(e) => setFullName(e.target.value)}
                className="w-full pl-10 pr-4 py-2.5 rounded-xl text-sm border focus:outline-none focus:border-green-600 focus:ring-1 focus:ring-green-600 bg-gray-50"
                placeholder="Nhập họ và tên"
                required
              />
              <User size={18} className="absolute left-3.5 top-1/2 -translate-y-1/2 text-gray-400" />
            </div>
          </div>

          <div>
            <label className="block text-sm font-semibold text-gray-700 mb-1.5">Email</label>
            <div className="relative">
              <input
                type="email"
                value={email}
                onChange={(e) => setEmail(e.target.value)}
                className="w-full pl-10 pr-4 py-2.5 rounded-xl text-sm border focus:outline-none focus:border-green-600 focus:ring-1 focus:ring-green-600 bg-gray-50"
                placeholder="Nhập email của bạn"
                required
              />
              <EnvelopeSimple size={18} className="absolute left-3.5 top-1/2 -translate-y-1/2 text-gray-400" />
            </div>
          </div>

          <div>
            <label className="block text-sm font-semibold text-gray-700 mb-1.5">Mật khẩu</label>
            <div className="relative">
              <input
                type="password"
                value={password}
                onChange={(e) => setPassword(e.target.value)}
                className="w-full pl-10 pr-4 py-2.5 rounded-xl text-sm border focus:outline-none focus:border-green-600 focus:ring-1 focus:ring-green-600 bg-gray-50"
                placeholder="Tạo mật khẩu (ít nhất 8 ký tự)"
                required
                minLength={8}
              />
              <LockKey size={18} className="absolute left-3.5 top-1/2 -translate-y-1/2 text-gray-400" />
            </div>
          </div>

          <div>
            <label className="block text-sm font-semibold text-gray-700 mb-1.5">Xác nhận mật khẩu</label>
            <div className="relative">
              <input
                type="password"
                value={confirmPassword}
                onChange={(e) => setConfirmPassword(e.target.value)}
                className="w-full pl-10 pr-4 py-2.5 rounded-xl text-sm border focus:outline-none focus:border-green-600 focus:ring-1 focus:ring-green-600 bg-gray-50"
                placeholder="Nhập lại mật khẩu"
                required
                minLength={8}
              />
              <LockKey size={18} className="absolute left-3.5 top-1/2 -translate-y-1/2 text-gray-400" />
            </div>
          </div>

          <button
            type="submit"
            disabled={loading}
            className="w-full py-3 rounded-full font-bold text-sm text-white transition-all hover:opacity-90 disabled:opacity-70 mt-4"
            style={{ background: "var(--color-brand)" }}
          >
            {loading ? "Đang xử lý..." : "Đăng ký tài khoản"}
          </button>
        </form>

        <div className="mt-8 text-center text-sm text-gray-500">
          Đã có tài khoản?{" "}
          <Link href={`/account/login${nextParam ? `?next=${encodeURIComponent(nextParam)}` : ""}`} className="font-semibold text-green-700 hover:underline">
            Đăng nhập ngay
          </Link>
        </div>
      </div>
    </div>
  );
}

export default function RegisterPage() {
  return (
    <Suspense fallback={<div className="p-8 text-center text-gray-500">Đang tải...</div>}>
      <RegisterContent />
    </Suspense>
  );
}
