"use client";

import React, { useState, useEffect } from "react";
import { X, ShoppingBag, Heart, Star, Minus, Plus } from "lucide-react";
import Link from "next/link";
import { useQuickView } from "@/context/QuickViewContext";
import { useCart } from "@/context/CartContext";
import { useWishlist } from "@/context/WishlistContext";
import { useCurrency } from "@/context/CurrencyContext";
import { useToast } from "@/context/ToastContext";

export function QuickViewModal() {
  const { activeProduct: p, isOpen, closeQuickView } = useQuickView();
  const { addToCart } = useCart();
  const { toggleWishlist, isInWishlist } = useWishlist();
  const { formatPrice } = useCurrency();
  const { showToast } = useToast();

  const [img, setImg] = useState("");
  const [qty, setQty] = useState(1);

  useEffect(() => {
    if (p) { setImg(p.thumbnail || p.images?.[0] || ""); setQty(1); }
  }, [p]);

  if (!isOpen || !p) return null;

  const discounted = p.price * (1 - (p.discountPercentage || 0) / 100);
  const inWL = isInWishlist(p.id);

  const handleAdd = () => {
    addToCart(p, qty);
    showToast(`Đã thêm ${qty}× ${p.title} vào giỏ`, "cart", p.thumbnail);
    closeQuickView();
  };

  return (
    <div className="fixed inset-0 z-[960] flex items-center justify-center p-4">
      <div onClick={closeQuickView} className="absolute inset-0 bg-black/40" />

      <div className="relative w-full max-w-2xl bg-white rounded-2xl overflow-hidden shadow-2xl border border-border flex flex-col sm:flex-row animate-scale-in max-h-[90vh]">

        <button onClick={closeQuickView}
          className="absolute right-3 top-3 z-10 w-8 h-8 bg-white rounded-lg border border-border flex items-center justify-center text-gray-400 hover:text-gray-700 transition-colors shadow-sm">
          <X className="w-4 h-4" />
        </button>

        {/* Gallery */}
        <div className="w-full sm:w-5/12 bg-gray-50 p-5 flex flex-col gap-3 flex-shrink-0">
          <div className="aspect-square rounded-xl overflow-hidden bg-white border border-border flex items-center justify-center">
            <img src={img} alt={p.title} className="w-full h-full object-contain p-4" />
          </div>
          {p.images?.length > 1 && (
            <div className="flex gap-2 overflow-x-auto pb-1">
              {p.images.map((i: string, idx: number) => (
                <button key={idx} onClick={() => setImg(i)}
                  className={`w-11 h-11 rounded-lg overflow-hidden border-2 flex-shrink-0 bg-white transition-all ${img === i ? "border-gray-900" : "border-transparent opacity-50 hover:opacity-100"}`}>
                  <img src={i} alt="" className="w-full h-full object-cover" />
                </button>
              ))}
            </div>
          )}
        </div>

        {/* Info */}
        <div className="flex-1 p-5 flex flex-col gap-4 overflow-y-auto">
          <div>
            <p className="text-xs font-bold uppercase tracking-widest text-gray-400 mb-1">{p.brand || "Generic"}</p>
            <h2 className="text-xl font-black text-gray-900 leading-tight">{p.title}</h2>
          </div>

          {/* Stars */}
          <div className="flex items-center gap-1.5">
            {Array.from({ length: 5 }).map((_, i) => (
              <Star key={i} className={`w-4 h-4 ${i < Math.floor(p.rating) ? "fill-amber-400 text-amber-400" : "fill-gray-200 text-gray-200"}`} />
            ))}
            <span className="text-xs text-gray-500 font-medium ml-1">({p.rating?.toFixed(1)})</span>
          </div>

          {/* Price */}
          <div className="flex items-baseline gap-2.5">
            <span className="text-2xl font-black text-gray-900">{formatPrice(discounted)}</span>
            {p.discountPercentage > 0 && (
              <>
                <span className="text-sm text-gray-400 line-through">{formatPrice(p.price)}</span>
                <span className="text-xs font-bold bg-red-100 text-red-600 px-2 py-0.5 rounded-lg">
                  -{Math.round(p.discountPercentage)}%
                </span>
              </>
            )}
          </div>

          <p className="text-sm text-gray-500 leading-relaxed line-clamp-3">{p.description}</p>

          {/* Stock */}
          <div className="flex items-center gap-2">
            <span className={`w-2 h-2 rounded-full ${p.stock > 0 ? "bg-emerald-500" : "bg-red-400"}`} />
            <span className="text-xs font-medium text-gray-600">
              {p.stock > 0 ? `Còn ${p.stock} sản phẩm` : "Hết hàng"}
            </span>
          </div>

          {/* Qty + CTA */}
          {p.stock > 0 && (
            <div className="flex items-center gap-2 pt-3 border-t border-gray-100">
              <div className="flex items-center border border-border rounded-xl overflow-hidden">
                <button onClick={() => setQty(Math.max(1, qty - 1))}
                  className="w-9 h-9 flex items-center justify-center text-gray-500 hover:bg-gray-100 transition-colors">
                  <Minus className="w-3.5 h-3.5" />
                </button>
                <span className="w-10 text-center text-sm font-black text-gray-900">{qty}</span>
                <button onClick={() => setQty(Math.min(p.stock, qty + 1))}
                  className="w-9 h-9 flex items-center justify-center text-gray-500 hover:bg-gray-100 transition-colors">
                  <Plus className="w-3.5 h-3.5" />
                </button>
              </div>

              <button onClick={handleAdd}
                className="flex-1 bg-gray-900 hover:bg-accent text-white font-bold py-2.5 px-4 rounded-xl flex items-center justify-center gap-2 transition-colors text-sm">
                <ShoppingBag className="w-4 h-4" /> Thêm vào giỏ
              </button>

              <button onClick={() => { toggleWishlist(p); showToast(inWL ? "Đã xóa" : "Đã thêm vào yêu thích", "success"); }}
                className={`w-10 h-10 rounded-xl border flex items-center justify-center transition-colors ${
                  inWL ? "bg-rose-50 border-rose-200 text-rose-500" : "border-border text-gray-400 hover:text-rose-500 hover:border-rose-300"
                }`}>
                <Heart className={`w-4 h-4 ${inWL ? "fill-rose-500" : ""}`} />
              </button>
            </div>
          )}

          <Link href={`/product/${p.id}`} onClick={closeQuickView}
            className="text-xs text-gray-400 hover:text-accent hover:underline text-center transition-colors">
            Xem trang sản phẩm đầy đủ →
          </Link>
        </div>
      </div>
    </div>
  );
}
