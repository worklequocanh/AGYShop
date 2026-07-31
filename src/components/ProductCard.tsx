"use client";

import React from "react";
import Link from "next/link";
import { ShoppingCart, Heart, Eye, Star } from "lucide-react";
import { useCart } from "@/context/CartContext";
import { useWishlist } from "@/context/WishlistContext";
import { useCurrency } from "@/context/CurrencyContext";
import { useQuickView } from "@/context/QuickViewContext";
import { useToast } from "@/context/ToastContext";

export function ProductCard({ product }: { product: any }) {
  const { addToCart } = useCart();
  const { toggleWishlist, isInWishlist } = useWishlist();
  const { formatPrice } = useCurrency();
  const { openQuickView } = useQuickView();
  const { showToast } = useToast();

  const price = product.price * (1 - (product.discountPercentage || 0) / 100);
  const inWL = isInWishlist(product.id);
  const sold = product.stock === 0;

  const onCart = (e: React.MouseEvent) => {
    e.preventDefault();
    if (sold) { showToast("Sản phẩm đã hết hàng", "error"); return; }
    addToCart(product, 1);
    showToast("Đã thêm vào giỏ hàng", "cart", product.thumbnail);
  };
  const onWL = (e: React.MouseEvent) => {
    e.preventDefault();
    toggleWishlist(product);
    showToast(inWL ? "Đã xóa khỏi yêu thích" : "Đã thêm vào yêu thích", "success");
  };
  const onQV = (e: React.MouseEvent) => {
    e.preventDefault();
    openQuickView(product);
  };

  return (
    <article className="product-card group bg-card rounded-2xl sm:rounded-3xl border border-border overflow-hidden flex flex-col hover:shadow-lg transition-all duration-300">

      {/* Image */}
      <div className="relative img-zoom-wrap bg-gray-50 aspect-square">
        <Link href={`/product/${product.id}`} className="block h-full">
          <img
            src={product.thumbnail}
            alt={product.title}
            className="img-zoom w-full h-full object-contain p-3 sm:p-5"
          />
        </Link>

        {/* Discount badge */}
        {product.discountPercentage > 0 && (
          <span className="absolute top-2.5 left-2.5 sm:top-3 sm:left-3 bg-rose-600 text-white text-[9px] sm:text-[10px] font-black px-2 py-0.5 rounded-md shadow-xs">
            -{Math.round(product.discountPercentage)}%
          </span>
        )}
        {sold && (
          <span className="absolute top-2.5 left-2.5 sm:top-3 sm:left-3 bg-gray-600 text-white text-[9px] sm:text-[10px] font-black px-2 py-0.5 rounded-md">
            Hết hàng
          </span>
        )}

        {/* Wishlist Mobile Toggle Button */}
        <button
          onClick={onWL}
          title="Yêu thích"
          className="absolute top-2.5 right-2.5 sm:top-3 sm:right-3 w-7 h-7 sm:w-8 sm:h-8 rounded-full bg-white/90 backdrop-blur-md border border-border flex items-center justify-center shadow-sm text-gray-600 hover:text-rose-600 active:scale-90 transition-all z-10"
        >
          <Heart className={`w-3.5 h-3.5 ${inWL ? "fill-rose-500 text-rose-500" : ""}`} />
        </button>

        {/* Desktop Hover action strip */}
        <div className="hidden sm:flex absolute bottom-0 left-0 right-0 items-center justify-center gap-2 py-2 bg-white/90 backdrop-blur-sm border-t border-gray-100 translate-y-full group-hover:translate-y-0 transition-transform duration-200">
          <button onClick={onWL} title="Yêu thích"
            className={`flex items-center gap-1.5 px-3 py-1.5 rounded-xl text-xs font-semibold transition-colors ${
              inWL ? "bg-rose-100 text-rose-600" : "bg-gray-100 text-gray-600 hover:bg-rose-100 hover:text-rose-600"
            }`}>
            <Heart className={`w-3.5 h-3.5 ${inWL ? "fill-rose-500" : ""}`} />
            {inWL ? "Đã thích" : "Yêu thích"}
          </button>
          <button onClick={onQV} title="Xem nhanh"
            className="flex items-center gap-1.5 px-3 py-1.5 rounded-xl text-xs font-semibold bg-gray-100 text-gray-600 hover:bg-accent/10 hover:text-accent transition-colors">
            <Eye className="w-3.5 h-3.5" /> Xem nhanh
          </button>
        </div>
      </div>

      {/* Info */}
      <div className="p-3 sm:p-4 flex flex-col gap-1.5 sm:gap-2 flex-1">
        <div className="flex items-center justify-between gap-1">
          <span className="text-[9px] sm:text-[10px] font-extrabold uppercase tracking-widest text-gray-400 truncate">
            {product.brand || product.category}
          </span>
          <span className="flex items-center gap-0.5 text-[10px] font-semibold text-gray-500 flex-shrink-0">
            <Star className="w-3 h-3 fill-amber-400 text-amber-400" />
            {product.rating?.toFixed(1)}
          </span>
        </div>

        <Link href={`/product/${product.id}`} className="flex-1">
          <h3 className="text-xs sm:text-sm font-bold text-gray-800 hover:text-accent transition-colors line-clamp-2 leading-snug">
            {product.title}
          </h3>
        </Link>

        {/* Price + CTA */}
        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-2 pt-2 border-t border-gray-100">
          <div>
            <span className="text-sm sm:text-base font-black text-gray-900">{formatPrice(price)}</span>
            {product.discountPercentage > 0 && (
              <span className="ml-1 sm:ml-1.5 text-[10px] sm:text-xs text-gray-400 line-through block sm:inline">{formatPrice(product.price)}</span>
            )}
          </div>
          <button
            onClick={onCart}
            disabled={sold}
            className={`flex items-center justify-center gap-1.5 px-2.5 sm:px-3.5 py-1.5 sm:py-2 rounded-xl text-[11px] sm:text-xs font-bold transition-all w-full sm:w-auto ${
              sold
                ? "bg-gray-100 text-gray-400 cursor-not-allowed"
                : "bg-gray-900 text-white hover:bg-accent active:scale-95 shadow-sm"
            }`}
          >
            <ShoppingCart className="w-3.5 h-3.5" />
            {sold ? "Hết" : "Thêm giỏ"}
          </button>
        </div>
      </div>
    </article>
  );
}
