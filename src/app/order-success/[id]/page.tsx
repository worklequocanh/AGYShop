"use client";

import React, { useEffect, useState } from "react";
import Link from "next/link";
import confetti from "canvas-confetti";
import { CheckCircle, FileText, ArrowRight } from "lucide-react";
import { useCurrency } from "@/context/CurrencyContext";
import { BillInvoiceModal } from "@/components/BillInvoiceModal";

export default function OrderSuccessPage({ params }: { params: { id: string } }) {
  const { formatPrice } = useCurrency();
  const [order, setOrder] = useState<any>(null);
  const [loading, setLoading] = useState(true);
  const [isBillOpen, setIsBillOpen] = useState(false);

  useEffect(() => {
    confetti({ particleCount: 120, spread: 80, origin: { y: 0.55 } });
  }, []);

  useEffect(() => {
    async function getOrderDetails() {
      try {
        const res = await fetch(`/api/orders/${params.id}`);
        if (!res.ok) {
          // Fallback to fetch all orders
          const resAll = await fetch(`/api/orders`);
          if (resAll.ok) {
            const dataAll = await resAll.json();
            if (dataAll.success) {
              const found = dataAll.orders.find((o: any) => o.orderCode === params.id || o._id === params.id);
              if (found) setOrder(found);
            }
          }
          return;
        }
        const data = await res.json();
        if (data.success) {
          setOrder(data.order);
        }
      } catch {} finally {
        setLoading(false);
      }
    }
    getOrderDetails();
  }, [params.id]);

  return (
    <div className="max-w-2xl mx-auto py-12 space-y-6">
      <div className="bg-white border border-border rounded-3xl p-6 sm:p-10 shadow-sm text-center space-y-6">
        
        <div className="w-16 h-16 bg-emerald-100 rounded-2xl flex items-center justify-center mx-auto text-emerald-600">
          <CheckCircle className="w-10 h-10" />
        </div>

        <div className="space-y-2">
          <h1 className="text-2xl sm:text-3xl font-black text-gray-900">
            Đặt Hàng Thành Công!
          </h1>
          <p className="text-sm text-gray-500 max-w-sm mx-auto">
            Cảm ơn bạn đã mua sắm tại AGYShop. Đơn hàng của bạn đã được ghi nhận.
          </p>
        </div>

        {loading ? (
          <div className="py-6 text-center text-xs text-gray-400 animate-pulse">Đang tải thông tin đơn hàng...</div>
        ) : order ? (
          <div className="bg-gray-50 border border-border rounded-2xl p-5 text-xs text-left space-y-3">
            <div className="grid grid-cols-2 gap-4 border-b border-gray-200 pb-3">
              <div>
                <span className="text-gray-400 block font-semibold mb-0.5">Mã đơn hàng:</span>
                <span className="font-mono font-black text-gray-900 text-sm">{order.orderCode}</span>
              </div>
              <div>
                <span className="text-gray-400 block font-semibold mb-0.5">Ngày đặt hàng:</span>
                <span className="font-bold text-gray-800">
                  {new Date(order.createdAt).toLocaleDateString("vi-VN")}
                </span>
              </div>
            </div>

            <div className="grid grid-cols-2 gap-4 border-b border-gray-200 pb-3">
              <div>
                <span className="text-gray-400 block font-semibold mb-0.5">Người nhận hàng:</span>
                <span className="font-bold text-gray-800">{order.shippingAddress?.name}</span>
              </div>
              <div>
                <span className="text-gray-400 block font-semibold mb-0.5">Số điện thoại:</span>
                <span className="font-bold text-gray-800">{order.shippingAddress?.phone}</span>
              </div>
            </div>

            <div>
              <span className="text-gray-400 block font-semibold mb-0.5">Địa chỉ giao:</span>
              <span className="font-bold text-gray-800 leading-relaxed">
                {order.shippingAddress?.address}
              </span>
            </div>

            <div className="grid grid-cols-2 gap-4 border-t border-gray-200 pt-3">
              <div>
                <span className="text-gray-400 block font-semibold mb-0.5">Thanh toán:</span>
                <span className="font-bold text-gray-800 uppercase">{order.paymentMethod}</span>
              </div>
              <div>
                <span className="text-gray-400 block font-semibold mb-0.5">Tổng số tiền:</span>
                <span className="font-black text-sm text-gray-900">{formatPrice(order.totalAmount)}</span>
              </div>
            </div>

            {/* View Bill Invoice Trigger Button */}
            <div className="pt-2">
              <button
                onClick={() => setIsBillOpen(true)}
                className="w-full bg-gray-900 hover:bg-gray-800 text-white font-extrabold py-3.5 px-4 rounded-xl flex items-center justify-center gap-2 transition-all shadow-md text-xs"
              >
                <FileText className="w-4 h-4 text-amber-400" /> Xem & In Hóa Đơn Bill Điện Tử
              </button>
            </div>
          </div>
        ) : (
          <div className="text-xs text-rose-500 font-bold bg-rose-50 p-4 rounded-xl">
            Mã đơn hàng `{params.id}` đã được lưu. Bạn có thể xem lại trong trang Hồ sơ cá nhân.
          </div>
        )}

        <div className="grid grid-cols-2 gap-3 pt-2">
          <Link
            href="/products"
            className="w-full text-center border border-border text-gray-700 font-bold py-3.5 rounded-2xl hover:bg-gray-50 text-xs sm:text-sm transition-colors"
          >
            Tiếp tục mua sắm
          </Link>
          <Link
            href="/profile"
            className="w-full text-center bg-gray-100 hover:bg-gray-200 text-gray-900 font-bold py-3.5 rounded-2xl text-xs sm:text-sm transition-colors"
          >
            Lịch sử đơn hàng
          </Link>
        </div>

      </div>

      {/* Bill Invoice Modal */}
      <BillInvoiceModal
        order={order}
        isOpen={isBillOpen}
        onClose={() => setIsBillOpen(false)}
      />
    </div>
  );
}
