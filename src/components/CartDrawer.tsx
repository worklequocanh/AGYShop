"use client";

import React, { useRef, useEffect } from "react";
import { X, ShoppingBag, Trash2, Plus, Minus, ArrowRight } from "lucide-react";
import Link from "next/link";
import { useCart } from "@/context/CartContext";
import { useCurrency } from "@/context/CurrencyContext";

export function CartDrawer() {
  const { cartItems, isCartOpen, setIsCartOpen, removeFromCart, updateQuantity, getCartSubtotal } = useCart();
  const { formatPrice } = useCurrency();
  const ref = useRef<HTMLDivElement>(null);

  const count = cartItems.reduce((a, i) => a + i.quantity, 0);

  useEffect(() => {
    const fn = (e: MouseEvent) => {
      if (ref.current && !ref.current.contains(e.target as Node) && isCartOpen)
        setIsCartOpen(false);
    };
    document.addEventListener("mousedown", fn);
    return () => document.removeEventListener("mousedown", fn);
  }, [isCartOpen, setIsCartOpen]);

  useEffect(() => {
    document.body.style.overflow = isCartOpen ? "hidden" : "";
    return () => { document.body.style.overflow = ""; };
  }, [isCartOpen]);

  return (
    <>
      {/* Overlay */}
      <div className={`fixed inset-0 bg-black/30 z-[950] transition-opacity duration-300 ${isCartOpen ? "opacity-100" : "opacity-0 pointer-events-none"}`} />

      {/* Drawer */}
      <div ref={ref} className={`fixed right-0 top-0 bottom-0 w-full sm:max-w-sm bg-white border-l border-border z-[951] flex flex-col shadow-2xl transition-transform duration-300 ${isCartOpen ? "translate-x-0" : "translate-x-full"}`}>

        {/* Header */}
        <div className="flex items-center justify-between px-5 h-14 border-b border-border flex-shrink-0">
          <div className="flex items-center gap-2">
            <ShoppingBag className="w-[18px] h-[18px] text-gray-700" />
            <span className="font-bold text-gray-900 text-[15px]">Giỏ hàng</span>
            {count > 0 && (
              <span className="bg-gray-900 text-white text-[10px] font-bold px-1.5 py-0.5 rounded-full">{count}</span>
            )}
          </div>
          <button onClick={() => setIsCartOpen(false)}
            className="w-8 h-8 flex items-center justify-center rounded-lg text-gray-400 hover:text-gray-600 hover:bg-gray-100 transition-colors">
            <X className="w-4 h-4" />
          </button>
        </div>

        {/* Items */}
        <div className="flex-1 overflow-y-auto p-4 space-y-3">
          {cartItems.length === 0 ? (
            <div className="h-full flex flex-col items-center justify-center text-center py-12 gap-4">
              <div className="w-16 h-16 bg-gray-100 rounded-2xl flex items-center justify-center">
                <ShoppingBag className="w-7 h-7 text-gray-300" />
              </div>
              <div>
                <p className="font-semibold text-gray-700 text-sm">Giỏ hàng trống</p>
                <p className="text-xs text-gray-400 mt-1">Hãy thêm sản phẩm vào giỏ nhé!</p>
              </div>
              <button onClick={() => setIsCartOpen(false)}
                className="px-5 py-2.5 bg-gray-900 hover:bg-gray-700 text-white text-sm font-semibold rounded-xl transition-colors">
                Tiếp tục mua sắm
              </button>
            </div>
          ) : (
            cartItems.map((item) => (
              <div key={item.id} className="flex gap-3 bg-gray-50 rounded-xl p-3 border border-gray-100">
                <div className="w-[60px] h-[60px] rounded-lg overflow-hidden bg-white border border-border flex-shrink-0">
                  <img src={item.thumbnail} alt={item.title} className="w-full h-full object-cover" />
                </div>
                <div className="flex-1 min-w-0">
                  <p className="text-sm font-semibold text-gray-800 line-clamp-1">{item.title}</p>
                  <p className="text-sm font-black text-gray-900 mt-0.5">{formatPrice(item.price)}</p>
                  <div className="flex items-center gap-2 mt-2">
                    <button onClick={() => updateQuantity(item.id, item.quantity - 1)} disabled={item.quantity <= 1}
                      className="w-6 h-6 rounded-md bg-white border border-border flex items-center justify-center text-gray-600 disabled:opacity-40 hover:bg-gray-100 transition-colors">
                      <Minus className="w-3 h-3" />
                    </button>
                    <span className="text-sm font-bold text-gray-900 w-5 text-center">{item.quantity}</span>
                    <button onClick={() => updateQuantity(item.id, item.quantity + 1)} disabled={item.quantity >= item.stock}
                      className="w-6 h-6 rounded-md bg-white border border-border flex items-center justify-center text-gray-600 disabled:opacity-40 hover:bg-gray-100 transition-colors">
                      <Plus className="w-3 h-3" />
                    </button>
                  </div>
                </div>
                <button onClick={() => removeFromCart(item.id)}
                  className="p-1.5 text-gray-300 hover:text-rose-500 hover:bg-rose-50 rounded-lg transition-colors self-start">
                  <Trash2 className="w-3.5 h-3.5" />
                </button>
              </div>
            ))
          )}
        </div>

        {/* Footer */}
        {cartItems.length > 0 && (
          <div className="p-4 border-t border-border flex-shrink-0 space-y-3 bg-white">
            <div className="flex justify-between items-center">
              <span className="text-sm text-gray-500 font-medium">Tạm tính</span>
              <span className="text-lg font-black text-gray-900">{formatPrice(getCartSubtotal())}</span>
            </div>
            <p className="text-xs text-gray-400">Phí vận chuyển & khuyến mãi tính khi thanh toán.</p>
            <div className="grid grid-cols-2 gap-2">
              <Link href="/cart" onClick={() => setIsCartOpen(false)}
                className="text-center py-2.5 border border-gray-300 text-sm font-semibold text-gray-700 rounded-xl hover:bg-gray-50 transition-colors">
                Xem giỏ
              </Link>
              <Link href="/checkout" onClick={() => setIsCartOpen(false)}
                className="text-center py-2.5 bg-gray-900 hover:bg-gray-700 text-white text-sm font-semibold rounded-xl flex items-center justify-center gap-1.5 transition-colors">
                Thanh toán <ArrowRight className="w-4 h-4" />
              </Link>
            </div>
          </div>
        )}
      </div>
    </>
  );
}
