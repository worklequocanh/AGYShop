"use client";

import React, { useEffect } from "react";
import { useRouter, usePathname } from "next/navigation";
import { useAuth } from "@/context/AuthContext";
import { useToast } from "@/context/ToastContext";
import { ShieldAlert } from "lucide-react";

export function ProtectedRoute({ children }: { children: React.ReactNode }) {
  const router = useRouter();
  const pathname = usePathname();
  const { user, loading } = useAuth();
  const { showToast } = useToast();

  useEffect(() => {
    if (!loading && !user) {
      showToast("Vui lòng đăng nhập để truy cập trang này", "info");
      router.replace(`/login?redirect=${encodeURIComponent(pathname)}`);
    }
  }, [user, loading, router, pathname, showToast]);

  if (loading || !user) {
    return (
      <div className="min-h-[60vh] flex flex-col items-center justify-center space-y-4 py-16">
        <div className="w-12 h-12 border-4 border-gray-200 border-t-gray-900 rounded-full animate-spin" />
        <div className="text-center space-y-1">
          <p className="text-base font-bold text-gray-900">Đang kiểm tra quyền truy cập...</p>
          <p className="text-xs text-gray-400">Trang này yêu cầu đăng nhập tài khoản</p>
        </div>
      </div>
    );
  }

  return <>{children}</>;
}
