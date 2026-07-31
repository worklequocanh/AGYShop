"use client";

import { useEffect, Suspense } from "react";
import { useRouter, useSearchParams } from "next/navigation";

function ProductsRedirectContent() {
  const router = useRouter();
  const searchParams = useSearchParams();

  useEffect(() => {
    const paramsString = searchParams.toString();
    if (paramsString) {
      router.replace(`/shop?${paramsString}`);
    } else {
      router.replace("/shop");
    }
  }, [searchParams, router]);

  return (
    <div className="py-20 text-center space-y-3 animate-pulse">
      <div className="w-10 h-10 border-4 border-gray-900 border-t-transparent rounded-full animate-spin mx-auto" />
      <p className="text-xs font-bold text-gray-500">Đang chuyển đến Cửa Hàng /shop...</p>
    </div>
  );
}

export default function ProductsPage() {
  return (
    <Suspense fallback={<div className="py-20 text-center text-xs font-bold text-gray-400">Đang chuyển hướng...</div>}>
      <ProductsRedirectContent />
    </Suspense>
  );
}
