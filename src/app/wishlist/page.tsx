"use client";

import React from "react";
import Link from "next/link";
import { Heart } from "lucide-react";
import { useWishlist } from "@/context/WishlistContext";
import { ProductCard } from "@/components/ProductCard";
import { ProtectedRoute } from "@/components/ProtectedRoute";

function WishlistContent() {
  const { wishlistItems } = useWishlist();

  if (wishlistItems.length === 0) {
    return (
      <div className="max-w-sm mx-auto py-20 text-center space-y-5 bg-white border border-border rounded-2xl p-8 shadow-sm">
        <div className="w-14 h-14 bg-rose-50 rounded-2xl flex items-center justify-center mx-auto">
          <Heart className="w-7 h-7 text-rose-500" />
        </div>
        <div>
          <h2 className="font-bold text-gray-900">Danh sách yêu thích trống</h2>
          <p className="text-sm text-gray-500 mt-1">Lưu trữ sản phẩm bạn quan tâm để xem lại sau.</p>
        </div>
        <Link
          href="/products"
          className="inline-block bg-gray-900 hover:bg-gray-700 text-white font-bold py-2.5 px-6 rounded-xl text-sm transition-colors"
        >
          Khám phá cửa hàng
        </Link>
      </div>
    );
  }

  return (
    <div className="space-y-6 pb-12">
      <div>
        <h1 className="text-3xl font-black text-gray-900">Sản Phẩm Yêu Thích</h1>
        <p className="text-sm text-gray-500 mt-1">
          Danh sách sản phẩm bạn đã lưu ({wishlistItems.length}).
        </p>
      </div>

      <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
        {wishlistItems.map((prod) => (
          <ProductCard key={prod.id} product={prod} />
        ))}
      </div>
    </div>
  );
}

export default function WishlistPage() {
  return (
    <ProtectedRoute>
      <WishlistContent />
    </ProtectedRoute>
  );
}
