"use client";

import { useEffect } from "react";
import { useRouter } from "next/navigation";

export default function CompareRedirectPage() {
  const router = useRouter();

  useEffect(() => {
    router.replace("/shop");
  }, [router]);

  return (
    <div className="py-20 text-center space-y-3 animate-pulse">
      <div className="w-10 h-10 border-4 border-gray-900 border-t-transparent rounded-full animate-spin mx-auto" />
      <p className="text-xs font-bold text-gray-500">Đang chuyển đến Cửa Hàng /shop...</p>
    </div>
  );
}
