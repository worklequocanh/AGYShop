"use client";

import { useEffect, Suspense } from "react";
import { useRouter, useSearchParams } from "next/navigation";

function SearchRedirectContent() {
  const router = useRouter();
  const searchParams = useSearchParams();
  const q = searchParams.get("q") || searchParams.get("search") || "";

  useEffect(() => {
    if (q) {
      router.replace(`/shop?q=${encodeURIComponent(q)}`);
    } else {
      router.replace("/shop");
    }
  }, [q, router]);

  return (
    <div className="py-20 text-center space-y-3 animate-pulse">
      <div className="w-10 h-10 border-4 border-gray-900 border-t-transparent rounded-full animate-spin mx-auto" />
      <p className="text-xs font-bold text-gray-500">Đang tìm kiếm sản phẩm tại Cửa Hàng /shop...</p>
    </div>
  );
}

export default function SearchPage() {
  return (
    <Suspense fallback={<div className="py-20 text-center text-xs font-bold text-gray-400">Đang tìm kiếm...</div>}>
      <SearchRedirectContent />
    </Suspense>
  );
}
