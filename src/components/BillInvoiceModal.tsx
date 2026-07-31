"use client";

import React, { useEffect, useState } from "react";
import { createPortal } from "react-dom";
import { X, Printer, CheckCircle2, Package, ShieldCheck, QrCode, FileText } from "lucide-react";
import { useCurrency } from "@/context/CurrencyContext";

interface BillInvoiceModalProps {
  order: any | null;
  isOpen: boolean;
  onClose: () => void;
}

export function BillInvoiceModal({ order, isOpen, onClose }: BillInvoiceModalProps) {
  const { formatPrice } = useCurrency();
  const [mounted, setMounted] = useState(false);

  useEffect(() => {
    setMounted(true);
  }, []);

  useEffect(() => {
    const handleKeyDown = (e: KeyboardEvent) => {
      if (e.key === "Escape" && isOpen) onClose();
    };
    window.addEventListener("keydown", handleKeyDown);
    return () => window.removeEventListener("keydown", handleKeyDown);
  }, [isOpen, onClose]);

  if (!mounted || !isOpen || !order) return null;

  const handlePrint = () => {
    window.print();
  };

  const invoiceDate = order.createdAt ? new Date(order.createdAt).toLocaleString("vi-VN") : new Date().toLocaleString("vi-VN");
  const isPaid = order.paymentStatus === "paid";

  const modalContent = (
    <div
      style={{
        position: "fixed",
        inset: 0,
        zIndex: 999999,
        backgroundColor: "rgba(17, 24, 39, 0.6)",
        backdropFilter: "blur(4px)",
        display: "flex",
        alignItems: "center",
        justifyContent: "center",
        padding: "16px",
      }}
      onClick={onClose}
    >
      <div
        className="bg-white border border-gray-200 rounded-3xl shadow-2xl w-full max-w-2xl max-h-[90vh] flex flex-col overflow-hidden animate-fade-up text-gray-900"
        onClick={(e) => e.stopPropagation()}
        style={{ pointerEvents: "auto" }}
      >
        
        {/* Header Action Controls (Hidden on Print) */}
        <div className="px-6 py-4 border-b border-gray-100 flex items-center justify-between bg-gray-50 print:hidden">
          <div className="flex items-center gap-2">
            <FileText className="w-5 h-5 text-accent" />
            <span className="font-extrabold text-sm text-gray-900">Chi Tiết Hóa Đơn Điện Tử</span>
          </div>
          
          <div className="flex items-center gap-2">
            <button
              onClick={handlePrint}
              className="inline-flex items-center gap-1.5 bg-gray-900 hover:bg-gray-800 text-white text-xs font-bold px-4 py-2 rounded-xl transition-all shadow-sm"
            >
              <Printer className="w-4 h-4 text-amber-400" /> In / Tải PDF
            </button>
            <button
              onClick={onClose}
              className="p-2 text-gray-400 hover:text-gray-700 rounded-xl hover:bg-gray-200 transition-colors"
            >
              <X className="w-4 h-4" />
            </button>
          </div>
        </div>

        {/* PRINTABLE BILL TEMPLATE */}
        <div className="p-6 sm:p-8 overflow-y-auto space-y-6 bg-white font-sans text-xs">
          
          {/* Bill Top Header */}
          <div className="flex flex-col sm:flex-row sm:items-start justify-between gap-4 border-b border-gray-200 pb-5">
            <div>
              <div className="flex items-center gap-2">
                <div className="w-7 h-7 bg-gray-900 rounded-lg flex items-center justify-center text-white font-black text-xs">
                  AGY
                </div>
                <span className="font-black text-xl tracking-tighter text-gray-900">AGYShop E-Commerce</span>
              </div>
              <p className="text-[11px] text-gray-500 mt-1">Cửa Hàng Mua Sắm Trực Tuyến Chính Hãng</p>
              <p className="text-[11px] text-gray-400">Hotline: 1900-8888 • Email: cskh@agyshop.vn</p>
            </div>

            <div className="sm:text-right space-y-1">
              <h2 className="text-xl font-black uppercase text-gray-900 tracking-wider">HÓA ĐƠN BÁN HÀNG</h2>
              <p className="font-mono text-xs text-accent font-bold">Mã đơn: {order.orderCode}</p>
              <p className="text-[11px] text-gray-500">Ngày lập: {invoiceDate}</p>

              {/* Status Stamp */}
              <div className="pt-1">
                <span className={`inline-flex items-center gap-1 px-3 py-1 rounded-full text-[10px] font-black uppercase tracking-wider ${
                  isPaid ? "bg-emerald-100 text-emerald-800 border border-emerald-300" : "bg-amber-100 text-amber-800 border border-amber-300"
                }`}>
                  <CheckCircle2 className="w-3 h-3" /> {isPaid ? "ĐÃ THANH TOÁN" : "CHỜ THANH TOÁN"}
                </span>
              </div>
            </div>
          </div>

          {/* Customer & Shipping Info */}
          <div className="bg-gray-50/80 border border-gray-200 rounded-2xl p-4 grid grid-cols-1 sm:grid-cols-2 gap-3">
            <div>
              <span className="text-gray-400 font-bold uppercase text-[9px] tracking-wider block">Khách hàng nhận hàng</span>
              <p className="font-bold text-gray-900 text-xs mt-0.5">{order.shippingAddress?.name || "Khách hàng"}</p>
              <p className="text-gray-500 text-[11px]">SĐT: {order.shippingAddress?.phone || "N/A"}</p>
              <p className="text-gray-500 text-[11px]">Tài khoản: @{order.username || "guest"}</p>
            </div>
            <div>
              <span className="text-gray-400 font-bold uppercase text-[9px] tracking-wider block">Địa chỉ giao hàng</span>
              <p className="font-medium text-gray-800 text-[11px] mt-0.5 leading-relaxed">
                {order.shippingAddress?.address}
              </p>
              <p className="text-gray-500 text-[11px] mt-1">
                Phương thức: <span className="font-bold uppercase text-gray-800">{order.paymentMethod}</span>
              </p>
            </div>
          </div>

          {/* Items Table */}
          <div className="border border-gray-200 rounded-2xl overflow-hidden shadow-sm">
            <table className="w-full text-left text-xs">
              <thead>
                <tr className="bg-gray-900 text-white font-bold uppercase text-[9px] tracking-widest">
                  <th className="px-4 py-2.5">STT</th>
                  <th className="px-4 py-2.5">Tên sản phẩm</th>
                  <th className="px-4 py-2.5 text-center">SL</th>
                  <th className="px-4 py-2.5 text-right">Đơn giá</th>
                  <th className="px-4 py-2.5 text-right">Thành tiền</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-gray-200 font-medium">
                {order.items?.map((item: any, idx: number) => (
                  <tr key={idx} className="hover:bg-gray-50/50">
                    <td className="px-4 py-3 font-mono text-gray-400 text-center">{idx + 1}</td>
                    <td className="px-4 py-3 font-bold text-gray-900">{item.title}</td>
                    <td className="px-4 py-3 text-center font-extrabold text-gray-900">{item.quantity}</td>
                    <td className="px-4 py-3 text-right text-gray-600">{formatPrice(item.price)}</td>
                    <td className="px-4 py-3 text-right font-black text-gray-900">{formatPrice(item.price * item.quantity)}</td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>

          {/* Calculation Summary */}
          <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4 pt-2">
            
            {/* Barcode & Verification */}
            <div className="flex items-center gap-3 bg-gray-50 p-3 rounded-2xl border border-gray-200 w-full sm:w-auto">
              <img
                src={`https://api.qrserver.com/v1/create-qr-code/?size=60x60&data=${encodeURIComponent(`VERIFY-INVOICE-${order.orderCode}`)}`}
                alt="Verification QR"
                className="w-12 h-12 object-contain rounded-md"
              />
              <div className="text-[10px] text-gray-500">
                <p className="font-bold text-gray-800">Xác thực Hóa đơn Điện tử</p>
                <p className="font-mono text-gray-400">AGY-VERIFIED-SYSTEM</p>
              </div>
            </div>

            {/* Price Total Box */}
            <div className="w-full sm:w-64 space-y-2 border-t sm:border-t-0 border-gray-200 pt-3 sm:pt-0">
              <div className="flex justify-between text-gray-500">
                <span>Tạm tính tiền hàng:</span>
                <span className="font-bold text-gray-800">{formatPrice(order.totalAmount)}</span>
              </div>
              <div className="flex justify-between text-gray-500">
                <span>Phí vận chuyển:</span>
                <span className="font-bold text-emerald-600">MIỄN PHÍ</span>
              </div>
              <div className="flex justify-between text-gray-900 border-t border-gray-200 pt-2 font-black text-base">
                <span>TỔNG CỘNG:</span>
                <span className="text-accent">{formatPrice(order.totalAmount)}</span>
              </div>
            </div>

          </div>

          {/* Footer Notes */}
          <div className="border-t border-gray-200 pt-4 text-center space-y-1 text-[11px] text-gray-500">
            <p className="font-bold text-gray-800">Cảm ơn quý khách đã mua sắm tại AGYShop!</p>
            <p>Hóa đơn được khởi tạo tự động từ hệ thống thương mại điện tử AGYShop 2026.</p>
          </div>

        </div>

      </div>
    </div>
  );

  return createPortal(modalContent, document.body);
}
