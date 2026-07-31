"use client";

import { useEffect } from "react";
import { useRouter } from "next/navigation";

export default function CategorySlugPage({ params }: { params: { slug: string } }) {
  const router = useRouter();

  useEffect(() => {
    if (params?.slug) {
      router.replace(`/shop?category=${encodeURIComponent(params.slug)}`);
    } else {
      router.replace("/shop");
    }
  }, [params, router]);

  return (
    <div className="py-20 text-center space-y-3 animate-pulse">
      <div className="w-10 h-10 border-4 border-gray-900 border-t-transparent rounded-full animate-spin mx-auto" />
      <p className="text-xs font-bold text-gray-500">Đang chuyển đến Cửa Hàng /shop...</p>
    </div>
  );
}
