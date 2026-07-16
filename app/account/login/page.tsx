"use client";

import { useState } from "react";
import { useRouter, useSearchParams } from "next/navigation";
import { createClient } from "@/lib/supabase/client";
import Link from "next/link";
import { EnvelopeSimple, LockKey } from "@phosphor-icons/react";
import { Suspense } from "react";

function LoginContent() {
  const router = useRouter();
  const searchParams = useSearchParams();
  const errorParam = searchParams.get("error");
  
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [error, setError] = useState(errorParam || "");
  const [loading, setLoading] = useState(false);

  const supabase = createClient();

  const handleLogin = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);
    setError("");

    const { error } = await supabase.auth.signInWithPassword({
      email,
      password,
    });

    if (error) {
      if (error.message.includes("Invalid login credentials")) {
        setError("Email hoặc mật khẩu không chính xác.");
      } else {
        setError(error.message);
      }
      setLoading(false);
    } else {
      router.push("/account");
      router.refresh();
    }
  };

  return (
    <div className="w-full max-w-md mx-auto p-8 rounded-2xl bg-white shadow-sm border border-gray-100 my-16">
      <div className="text-center mb-8">
        <h1 className="text-2xl font-bold text-gray-900 mb-2" style={{ fontFamily: "var(--font-outfit)" }}>
          Đăng nhập
        </h1>
        <p className="text-sm text-gray-500">Chào mừng bạn quay trở lại Nhà sách</p>
      </div>

      {error && (
        <div className="mb-6 p-4 rounded-lg bg-red-50 border border-red-100 text-sm text-red-600">
          {error}
        </div>
      )}

      <form onSubmit={handleLogin} className="space-y-5">
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
              placeholder="Nhập mật khẩu"
              required
            />
            <LockKey size={18} className="absolute left-3.5 top-1/2 -translate-y-1/2 text-gray-400" />
          </div>
        </div>

        <button
          type="submit"
          disabled={loading}
          className="w-full py-3 rounded-full font-bold text-sm text-white transition-all hover:opacity-90 disabled:opacity-70 mt-2"
          style={{ background: "var(--color-brand)" }}
        >
          {loading ? "Đang xử lý..." : "Đăng nhập"}
        </button>
      </form>

      <div className="mt-8 text-center text-sm text-gray-500">
        Chưa có tài khoản?{" "}
        <Link href="/account/register" className="font-semibold text-green-700 hover:underline">
          Đăng ký ngay
        </Link>
      </div>
    </div>
  );
}

export default function LoginPage() {
  return (
    <div style={{ background: "var(--color-surface)" }} className="min-h-[70vh] flex items-center justify-center">
      <Suspense fallback={<div className="p-8 text-center text-gray-500">Đang tải...</div>}>
        <LoginContent />
      </Suspense>
    </div>
  );
}
