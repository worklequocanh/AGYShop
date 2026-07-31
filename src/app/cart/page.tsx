"use client";

import React, { useState } from "react";
import Link from "next/link";
import {
  ShoppingBag, Trash2, ArrowRight, Tag, X, Plus, Minus,
  ShieldCheck, Truck, RotateCcw, Heart, CheckCircle2, Sparkles
} from "lucide-react";
import { useCart } from "@/context/CartContext";
import { useWishlist } from "@/context/WishlistContext";
import { useCurrency } from "@/context/CurrencyContext";
import { useToast } from "@/context/ToastContext";
import { ProtectedRoute } from "@/components/ProtectedRoute";

function CartContent() {
  const {
    cartItems, removeFromCart, updateQuantity, clearCart,
    getCartSubtotal, getDiscountAmount, getCartTotal,
    shippingFee, coupon, discountPercent, applyCoupon, removeCoupon,
  } = useCart();
  const { toggleWishlist, isInWishlist } = useWishlist();
  const { formatPrice } = useCurrency();
  const { showToast } = useToast();
  const [couponInput, setCouponInput] = useState("");

  const subtotal = getCartSubtotal();
  const freeShippingThreshold = 500;
  const isFreeShipping = subtotal >= freeShippingThreshold;
  const progressPercent = Math.min(100, (subtotal / freeShippingThreshold) * 100);
  const remainingForFreeShipping = Math.max(0, freeShippingThreshold - subtotal);

  const handleCoupon = (e: React.FormEvent) => {
    e.preventDefault();
    if (!couponInput.trim()) return;
    if (applyCoupon(couponInput)) {
      showToast(`Áp dụng mã ${couponInput.toUpperCase()} thành công!`, "success");
      setCouponInput("");
    } else {
      showToast("Mã giảm giá không hợp lệ", "error");
    }
  };

  const handleMoveToWishlist = (item: any) => {
    if (!isInWishlist(item.id)) {
      toggleWishlist(item);
    }
    removeFromCart(item.id);
    showToast(`Đã chuyển ${item.title} sang danh sách yêu thích!`, "info");
  };

  if (cartItems.length === 0) {
    return (
      <div className="max-w-xl mx-auto py-16 px-4 text-center space-y-6 animate-fade-up">
        <div className="w-24 h-24 bg-blue-50 border border-blue-100 rounded-3xl flex items-center justify-center mx-auto shadow-sm">
          <ShoppingBag className="w-12 h-12 text-accent" />
        </div>
        <div className="space-y-2">
          <h2 className="text-2xl sm:text-3xl font-black text-gray-900">Giỏ hàng của bạn đang trống</h2>
          <p className="text-sm text-gray-500 max-w-md mx-auto">
            Hãy khám phá hàng ngàn sản phẩm chất lượng cao và chọn món hàng yêu thích của bạn ngay hôm nay!
          </p>
        </div>

        <div className="pt-2">
          <Link
            href="/products"
            className="inline-flex items-center gap-2 bg-gray-900 hover:bg-gray-800 text-white font-bold py-3.5 px-8 rounded-2xl text-sm transition-all shadow-md hover:shadow-lg transform hover:-translate-y-0.5"
          >
            <Sparkles className="w-4 h-4 text-amber-400" />
            Khám phá sản phẩm ngay
          </Link>
        </div>
      </div>
    );
  }

  return (
    <div className="space-y-8 pb-16 animate-fade-up">

      {/* Header & Stepper */}
      <div className="flex flex-col md:flex-row md:items-center justify-between gap-4 border-b border-border pb-6">
        <div>
          <h1 className="text-2xl sm:text-3xl font-black text-gray-900">Giỏ Hàng Mua Sắm</h1>
          <p className="text-sm text-gray-500 mt-1">
            Bạn có <span className="font-bold text-accent">{cartItems.length}</span> sản phẩm trong giỏ hàng.
          </p>
        </div>

        {/* Stepper Progress */}
        <div className="flex items-center gap-2 text-xs font-bold bg-white border border-border px-4 py-2.5 rounded-2xl shadow-sm">
          <span className="text-accent flex items-center gap-1.5">
            <span className="w-5 h-5 rounded-full bg-accent text-white flex items-center justify-center text-[10px]">1</span>
            Giỏ hàng
          </span>
          <span className="text-gray-300">/</span>
          <span className="text-gray-400 flex items-center gap-1.5">
            <span className="w-5 h-5 rounded-full bg-gray-100 text-gray-400 flex items-center justify-center text-[10px]">2</span>
            Thanh toán
          </span>
          <span className="text-gray-300">/</span>
          <span className="text-gray-400 flex items-center gap-1.5">
            <span className="w-5 h-5 rounded-full bg-gray-100 text-gray-400 flex items-center justify-center text-[10px]">3</span>
            Hoàn tất
          </span>
        </div>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-12 gap-8 items-start">

        {/* Main Cart Items Area */}
        <div className="lg:col-span-8 space-y-6">

          {/* Free Shipping Progress Bar */}
          <div className="bg-white border border-border rounded-2xl p-4 shadow-sm space-y-2.5">
            <div className="flex items-center justify-between text-xs font-bold">
              <span className="flex items-center gap-1.5 text-gray-800">
                <Truck className="w-4 h-4 text-accent" />
                {isFreeShipping ? (
                  <span className="text-emerald-600 font-bold flex items-center gap-1">
                    <CheckCircle2 className="w-3.5 h-3.5" /> Đơn hàng của bạn đủ điều kiện MIỄN PHÍ VẬN CHUYỂN!
                  </span>
                ) : (
                  <span>
                    Mua thêm <span className="text-accent font-extrabold">{formatPrice(remainingForFreeShipping)}</span> để được Miễn phí giao hàng!
                  </span>
                )}
              </span>
              <span className="text-gray-400 text-[11px]">{Math.round(progressPercent)}%</span>
            </div>
            <div className="w-full h-2 bg-gray-100 rounded-full overflow-hidden">
              <div
                className={`h-full transition-all duration-500 rounded-full ${
                  isFreeShipping ? "bg-emerald-500" : "bg-accent"
                }`}
                style={{ width: `${progressPercent}%` }}
              />
            </div>
          </div>

          {/* Cart Table Container */}
          <div className="bg-white border border-border rounded-3xl overflow-hidden shadow-sm">
            <div className="px-6 py-4 border-b border-border flex justify-between items-center bg-gray-50/50">
              <h3 className="font-bold text-sm text-gray-900 flex items-center gap-2">
                <ShoppingBag className="w-4 h-4 text-accent" />
                Sản phẩm đã chọn ({cartItems.length})
              </h3>
              <button
                onClick={() => { clearCart(); showToast("Đã xóa toàn bộ sản phẩm khỏi giỏ hàng", "info"); }}
                className="text-xs font-semibold text-rose-500 hover:text-rose-700 hover:underline transition-colors"
              >
                Xóa tất cả
              </button>
            </div>

            {/* List */}
            <div className="divide-y divide-gray-100">
              {cartItems.map((item) => (
                <div key={item.id} className="p-5 sm:p-6 flex flex-col sm:flex-row sm:items-center gap-5 hover:bg-gray-50/40 transition-colors group">
                  
                  {/* Thumbnail */}
                  <Link href={`/product/${item.id}`} className="w-20 h-20 sm:w-24 sm:h-24 rounded-2xl overflow-hidden border border-border bg-gray-50 flex-shrink-0 relative group-hover:border-accent/40 transition-colors">
                    <img src={item.thumbnail} alt={item.title} className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-300" />
                  </Link>

                  {/* Info */}
                  <div className="flex-1 min-w-0 space-y-1">
                    <Link href={`/product/${item.id}`} className="font-bold text-base text-gray-900 hover:text-accent transition-colors line-clamp-1">
                      {item.title}
                    </Link>
                    <div className="flex items-center gap-2 text-xs text-gray-400">
                      <span>Mã SP: #{item.id}</span>
                      <span>•</span>
                      <span className="text-emerald-600 font-semibold bg-emerald-50 px-2 py-0.5 rounded-md">Còn hàng</span>
                    </div>
                    <p className="text-sm font-bold text-gray-900 sm:hidden mt-1">
                      {formatPrice(item.price)}
                    </p>
                  </div>

                  {/* Controls & Price */}
                  <div className="flex items-center justify-between sm:justify-end gap-6 flex-shrink-0 pt-2 sm:pt-0 border-t sm:border-0 border-gray-100">
                    
                    {/* Quantity Picker */}
                    <div className="flex items-center border border-border rounded-xl bg-gray-50 overflow-hidden">
                      <button
                        onClick={() => updateQuantity(item.id, item.quantity - 1)}
                        disabled={item.quantity <= 1}
                        className="w-8 h-8 flex items-center justify-center hover:bg-gray-200 text-gray-600 disabled:opacity-30 transition-colors"
                      >
                        <Minus className="w-3.5 h-3.5" />
                      </button>
                      <span className="w-10 text-center text-sm font-extrabold text-gray-900">{item.quantity}</span>
                      <button
                        onClick={() => updateQuantity(item.id, item.quantity + 1)}
                        disabled={item.quantity >= item.stock}
                        className="w-8 h-8 flex items-center justify-center hover:bg-gray-200 text-gray-600 disabled:opacity-30 transition-colors"
                      >
                        <Plus className="w-3.5 h-3.5" />
                      </button>
                    </div>

                    {/* Total Price */}
                    <div className="text-right min-w-[90px]">
                      <p className="font-black text-base text-gray-900">{formatPrice(item.price * item.quantity)}</p>
                      <p className="text-[11px] text-gray-400">đơn giá: {formatPrice(item.price)}</p>
                    </div>

                    {/* Actions */}
                    <div className="flex items-center gap-1">
                      <button
                        onClick={() => handleMoveToWishlist(item)}
                        title="Chuyển sang yêu thích"
                        className="p-2 text-gray-400 hover:text-rose-500 hover:bg-rose-50 rounded-xl transition-colors"
                      >
                        <Heart className="w-4 h-4" />
                      </button>

                      <button
                        onClick={() => { removeFromCart(item.id); showToast(`Đã xóa ${item.title}`, "info"); }}
                        title="Xóa khỏi giỏ hàng"
                        className="p-2 text-gray-400 hover:text-rose-500 hover:bg-rose-50 rounded-xl transition-colors"
                      >
                        <Trash2 className="w-4 h-4" />
                      </button>
                    </div>

                  </div>

                </div>
              ))}
            </div>

            {/* Footer Back */}
            <div className="px-6 py-4 bg-gray-50/50 border-t border-border flex items-center justify-between">
              <Link href="/products" className="text-xs font-bold text-accent hover:underline flex items-center gap-1.5">
                ← Tiếp tục tìm kiếm sản phẩm khác
              </Link>
            </div>
          </div>

        </div>

        {/* Order Summary Sidebar */}
        <div className="lg:col-span-4 space-y-5 sticky top-24">
          
          <div className="bg-white border border-border rounded-3xl p-6 shadow-sm space-y-6">
            <h3 className="font-black text-lg text-gray-900 pb-4 border-b border-gray-100 flex items-center justify-between">
              <span>Tóm Tắt Đơn Hàng</span>
              <span className="text-xs font-normal text-gray-400">{cartItems.length} món</span>
            </h3>

            {/* Price Details */}
            <div className="space-y-3.5 text-sm">
              <div className="flex justify-between text-gray-500">
                <span>Tạm tính tiền hàng:</span>
                <span className="font-bold text-gray-900">{formatPrice(subtotal)}</span>
              </div>

              <div className="flex justify-between text-gray-500">
                <span>Phí vận chuyển:</span>
                {isFreeShipping ? (
                  <span className="font-bold text-emerald-600">MIỄN PHÍ</span>
                ) : (
                  <span className="font-bold text-gray-900">{formatPrice(shippingFee)}</span>
                )}
              </div>

              {discountPercent > 0 && (
                <div className="flex justify-between text-emerald-600 bg-emerald-50 border border-emerald-100 p-3 rounded-2xl text-xs font-bold">
                  <span>Mã ưu đãi (-{discountPercent}%):</span>
                  <span>-{formatPrice(getDiscountAmount())}</span>
                </div>
              )}

              <div className="border-t border-gray-100 pt-4 flex justify-between items-baseline">
                <div>
                  <span className="font-black text-lg text-gray-900 block">Tổng Thanh Toán:</span>
                  <span className="text-[11px] text-gray-400">(Đã bao gồm thuế VAT nếu có)</span>
                </div>
                <span className="font-black text-2xl text-accent">
                  {formatPrice(getCartTotal())}
                </span>
              </div>
            </div>

            {/* Promo Code Box */}
            <div className="space-y-2.5 pt-2 border-t border-gray-100">
              <label className="text-[10px] font-black text-gray-400 uppercase tracking-widest block">
                Mã Giảm Giá / Ưu Đãi
              </label>

              {coupon ? (
                <div className="flex items-center justify-between bg-blue-50 border border-blue-100 p-3 rounded-2xl">
                  <span className="text-xs font-bold text-accent flex items-center gap-1.5">
                    <Tag className="w-4 h-4" /> {coupon}
                  </span>
                  <button onClick={removeCoupon} className="text-gray-400 hover:text-rose-500 transition-colors">
                    <X className="w-4 h-4" />
                  </button>
                </div>
              ) : (
                <form onSubmit={handleCoupon} className="flex gap-2">
                  <input
                    type="text"
                    placeholder="Mã: ANTIGRAVITY"
                    value={couponInput}
                    onChange={(e) => setCouponInput(e.target.value)}
                    className="flex-1 text-xs px-3.5 py-2.5 bg-gray-50 border border-border rounded-xl focus:outline-none focus:border-accent font-medium uppercase tracking-wider text-gray-900"
                  />
                  <button
                    type="submit"
                    className="bg-gray-900 hover:bg-gray-800 text-white font-bold text-xs px-4 rounded-xl transition-colors whitespace-nowrap"
                  >
                    Áp dụng
                  </button>
                </form>
              )}

              {/* Coupon Suggestions */}
              <div className="flex flex-wrap gap-1.5 pt-1">
                {["ANTIGRAVITY", "SALE20", "FREESHIP"].map((code) => (
                  <button
                    key={code}
                    onClick={() => applyCoupon(code)}
                    className="text-[10px] font-bold bg-gray-100 hover:bg-blue-50 hover:text-accent text-gray-600 px-2.5 py-1 rounded-lg border border-transparent transition-colors"
                  >
                    +{code}
                  </button>
                ))}
              </div>
            </div>

            {/* Checkout CTA */}
            <Link
              href="/checkout"
              className="w-full bg-gray-900 hover:bg-gray-800 text-white font-extrabold py-4 px-6 rounded-2xl flex items-center justify-center gap-2 transition-all shadow-lg hover:shadow-xl text-sm transform hover:-translate-y-0.5"
            >
              Tiến Hành Thanh Toán <ArrowRight className="w-4.5 h-4.5" />
            </Link>

            {/* Trust Badges */}
            <div className="pt-2 grid grid-cols-3 gap-2 text-center border-t border-gray-100">
              <div className="space-y-1">
                <ShieldCheck className="w-4 h-4 text-emerald-600 mx-auto" />
                <span className="text-[10px] font-semibold text-gray-500 block">Bảo mật SSL</span>
              </div>
              <div className="space-y-1">
                <Truck className="w-4 h-4 text-blue-600 mx-auto" />
                <span className="text-[10px] font-semibold text-gray-500 block">Giao nhanh 2h</span>
              </div>
              <div className="space-y-1">
                <RotateCcw className="w-4 h-4 text-amber-600 mx-auto" />
                <span className="text-[10px] font-semibold text-gray-500 block">Đổi trả 30 ngày</span>
              </div>
            </div>

          </div>

        </div>

      </div>
    </div>
  );
}

export default function CartPage() {
  return (
    <ProtectedRoute>
      <CartContent />
    </ProtectedRoute>
  );
}
