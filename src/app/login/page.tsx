"use client";

import React, { useState, useEffect, Suspense } from "react";
import { useRouter, useSearchParams } from "next/navigation";
import { useAuth } from "@/context/AuthContext";
import { useToast } from "@/context/ToastContext";
import { Lock, User, Mail, Eye, EyeOff, Key, ShoppingBag } from "lucide-react";

/* ── Shared input styles ── */
const inputCls =
  "w-full bg-gray-50 border border-border rounded-xl px-4 py-2.5 text-sm text-gray-900 placeholder-gray-400 focus:outline-none focus:border-accent focus:bg-white transition-all";
const labelCls =
  "block text-[10px] font-bold uppercase tracking-widest text-gray-500 mb-1.5";

function LoginContent() {
  const router = useRouter();
  const searchParams = useSearchParams();
  const targetRedirect = searchParams.get("redirect") || "/";

  const { user, login, loading: authLoading } = useAuth();
  const { showToast } = useToast();

  const [tab, setTab] = useState<"login" | "register">("login");

  /* Redirect if already logged in */
  useEffect(() => {
    if (!authLoading && user) {
      router.replace(targetRedirect === "/login" ? "/profile" : targetRedirect);
    }
  }, [user, authLoading, router, targetRedirect]);

  /* Login state */
  const [lu, setLu] = useState("");
  const [lp, setLp] = useState("");
  const [showPw, setShowPw] = useState(false);
  const [lLoading, setLLoading] = useState(false);

  /* Register state */
  const [rFirst, setRFirst]   = useState("");
  const [rLast,  setRLast]    = useState("");
  const [rUser,  setRUser]    = useState("");
  const [rEmail, setREmail]   = useState("");
  const [rPass,  setRPass]    = useState("");
  const [rLoading, setRLoading] = useState(false);

  const handleLogin = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!lu || !lp) { showToast("Vui lòng nhập đầy đủ thông tin", "error"); return; }
    setLLoading(true);
    const res = await login(lu, lp);
    setLLoading(false);
    if (res.success) {
      showToast("Đăng nhập thành công!", "success");
      router.push(targetRedirect === "/login" ? "/" : targetRedirect);
    } else {
      showToast(res.error || "Sai tài khoản hoặc mật khẩu", "error");
    }
  };

  const handleRegister = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!rFirst || !rLast || !rUser || !rEmail || !rPass) {
      showToast("Vui lòng điền đầy đủ thông tin", "error"); return;
    }
    setRLoading(true);
    try {
      const r = await fetch("/api/auth/register", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ username: rUser, email: rEmail, password: rPass, firstName: rFirst, lastName: rLast }),
      });
      const d = await r.json();
      setRLoading(false);
      if (d.success) {
        showToast("Đăng ký thành công! Hãy đăng nhập bằng tài khoản của bạn.", "success");
        setLu(rUser); setTab("login");
        setRFirst(""); setRLast(""); setRUser(""); setREmail(""); setRPass("");
      } else showToast(d.error || "Đăng ký thất bại", "error");
    } catch { setRLoading(false); showToast("Lỗi kết nối máy chủ", "error"); }
  };

  const quickLogin = async (u: string, p: string) => {
    setLLoading(true);
    const r = await login(u, p);
    setLLoading(false);
    if (r.success) {
      showToast("Đăng nhập thành công!", "success");
      router.push(targetRedirect === "/login" ? "/" : targetRedirect);
    } else {
      showToast(r.error || "Lỗi đăng nhập. Vui lòng nạp DB trước.", "error");
    }
  };

  if (authLoading || user) {
    return (
      <div className="min-h-[60vh] flex flex-col items-center justify-center space-y-3">
        <div className="w-8 h-8 border-4 border-gray-200 border-t-gray-900 rounded-full animate-spin" />
        <p className="text-sm text-gray-500 font-medium">Bạn đã đăng nhập, đang chuyển hướng...</p>
      </div>
    );
  }

  return (
    <div className="min-h-[70vh] flex items-center justify-center py-10">
      <div className="w-full max-w-md space-y-4">

        {/* Logo + Heading */}
        <div className="text-center space-y-2 mb-6">
          <div className="w-12 h-12 bg-gray-900 rounded-2xl flex items-center justify-center mx-auto shadow-md">
            <ShoppingBag className="w-6 h-6 text-white" />
          </div>
          <h1 className="text-2xl font-black text-gray-900">
            {tab === "login" ? "Chào mừng trở lại" : "Tạo tài khoản"}
          </h1>
          <p className="text-sm text-gray-500">
            {tab === "login"
              ? "Đăng nhập để tiếp tục mua sắm và quản lý đơn hàng"
              : "Điền thông tin để tạo tài khoản mua sắm mới"}
          </p>
        </div>

        {/* Tab switcher */}
        <div className="flex bg-gray-100 p-1 rounded-xl gap-1">
          {(["login", "register"] as const).map((t) => (
            <button
              key={t}
              onClick={() => setTab(t)}
              className={`flex-1 py-2 text-sm font-bold rounded-lg transition-all ${
                tab === t
                  ? "bg-white text-gray-900 shadow-sm"
                  : "text-gray-500 hover:text-gray-700"
              }`}
            >
              {t === "login" ? "Đăng nhập" : "Đăng ký"}
            </button>
          ))}
        </div>

        {/* Form card */}
        <div className="bg-white border border-border rounded-2xl p-6 shadow-sm space-y-5">
          {tab === "login" ? (
            <form onSubmit={handleLogin} className="space-y-4">
              <div>
                <label className={labelCls}>Tên đăng nhập</label>
                <div className="relative">
                  <User className="w-4 h-4 text-gray-400 absolute left-3 top-1/2 -translate-y-1/2 pointer-events-none" />
                  <input
                    type="text"
                    placeholder="Nhập username"
                    value={lu}
                    onChange={(e) => setLu(e.target.value)}
                    className={inputCls + " pl-9"}
                    required
                  />
                </div>
              </div>

              <div>
                <label className={labelCls}>Mật khẩu</label>
                <div className="relative">
                  <Lock className="w-4 h-4 text-gray-400 absolute left-3 top-1/2 -translate-y-1/2 pointer-events-none" />
                  <input
                    type={showPw ? "text" : "password"}
                    placeholder="Nhập mật khẩu"
                    value={lp}
                    onChange={(e) => setLp(e.target.value)}
                    className={inputCls + " pl-9 pr-10"}
                    required
                  />
                  <button
                    type="button"
                    onClick={() => setShowPw(!showPw)}
                    className="absolute right-3 top-1/2 -translate-y-1/2 text-gray-400 hover:text-gray-600 transition-colors"
                  >
                    {showPw ? <EyeOff className="w-4 h-4" /> : <Eye className="w-4 h-4" />}
                  </button>
                </div>
              </div>

              <button
                type="submit"
                disabled={lLoading}
                className="w-full bg-gray-900 hover:bg-gray-700 text-white font-bold py-3 rounded-xl transition-colors disabled:opacity-50 text-sm shadow-sm"
              >
                {lLoading ? "Đang xác thực..." : "Đăng nhập"}
              </button>
            </form>
          ) : (
            <form onSubmit={handleRegister} className="space-y-3">
              <div className="grid grid-cols-2 gap-3">
                <div>
                  <label className={labelCls}>Họ</label>
                  <input type="text" placeholder="Nguyễn" value={rLast} onChange={(e) => setRLast(e.target.value)} className={inputCls} required />
                </div>
                <div>
                  <label className={labelCls}>Tên</label>
                  <input type="text" placeholder="Văn A" value={rFirst} onChange={(e) => setRFirst(e.target.value)} className={inputCls} required />
                </div>
              </div>

              <div>
                <label className={labelCls}>Tên đăng nhập</label>
                <div className="relative">
                  <User className="w-4 h-4 text-gray-400 absolute left-3 top-1/2 -translate-y-1/2 pointer-events-none" />
                  <input type="text" placeholder="username duy nhất" value={rUser} onChange={(e) => setRUser(e.target.value)} className={inputCls + " pl-9"} required />
                </div>
              </div>

              <div>
                <label className={labelCls}>Email</label>
                <div className="relative">
                  <Mail className="w-4 h-4 text-gray-400 absolute left-3 top-1/2 -translate-y-1/2 pointer-events-none" />
                  <input type="email" placeholder="email@example.com" value={rEmail} onChange={(e) => setREmail(e.target.value)} className={inputCls + " pl-9"} required />
                </div>
              </div>

              <div>
                <label className={labelCls}>Mật khẩu</label>
                <div className="relative">
                  <Lock className="w-4 h-4 text-gray-400 absolute left-3 top-1/2 -translate-y-1/2 pointer-events-none" />
                  <input type="password" placeholder="Mật khẩu của bạn" value={rPass} onChange={(e) => setRPass(e.target.value)} className={inputCls + " pl-9"} required />
                </div>
              </div>

              <button
                type="submit"
                disabled={rLoading}
                className="w-full bg-gray-900 hover:bg-gray-700 text-white font-bold py-3 rounded-xl transition-colors disabled:opacity-50 text-sm mt-1 shadow-sm"
              >
                {rLoading ? "Đang xử lý..." : "Tạo tài khoản"}
              </button>
            </form>
          )}
        </div>

        {/* Quick login (demo accounts) */}
        {tab === "login" && (
          <div className="bg-white border border-border rounded-2xl p-5 space-y-3 shadow-sm">
            <div className="flex items-center gap-2">
              <Key className="w-4 h-4 text-gray-400" />
              <span className="text-xs font-bold text-gray-600 uppercase tracking-widest">Tài khoản thử nghiệm</span>
            </div>
            <p className="text-xs text-gray-400">Đăng nhập nhanh 1 click (yêu cầu đã nạp DB)</p>
            <div className="grid grid-cols-2 gap-2">
              <button
                onClick={() => quickLogin("emilys", "emilyspass")}
                className="p-3 border border-border rounded-xl hover:border-gray-400 hover:bg-gray-50 transition-all text-left group"
              >
                <p className="text-xs font-bold text-gray-800 group-hover:text-gray-900">Tài khoản User</p>
                <p className="text-[10px] text-gray-400 font-mono mt-0.5">emilys / emilyspass</p>
              </button>
              <button
                onClick={() => quickLogin("admin", "admin123")}
                className="p-3 border border-border rounded-xl hover:border-gray-400 hover:bg-gray-50 transition-all text-left group"
              >
                <p className="text-xs font-bold text-gray-800 group-hover:text-gray-900">Tài khoản Admin</p>
                <p className="text-[10px] text-gray-400 font-mono mt-0.5">admin / admin123</p>
              </button>
            </div>
          </div>
        )}
      </div>
    </div>
  );
}

export default function LoginPage() {
  return (
    <Suspense fallback={<div className="min-h-[60vh] flex items-center justify-center text-sm text-gray-400">Đang tải...</div>}>
      <LoginContent />
    </Suspense>
  );
}
