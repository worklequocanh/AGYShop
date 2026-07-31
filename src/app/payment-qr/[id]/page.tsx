"use client";

import React, { useState, useEffect } from "react";
import Link from "next/link";
import { useParams, useRouter } from "next/navigation";
import {
  QrCode, CheckCircle2, Copy, Clock, ShieldCheck, ArrowRight,
  AlertCircle, Sparkles, Building2, ExternalLink
} from "lucide-react";
import { useCurrency } from "@/context/CurrencyContext";
import { useToast } from "@/context/ToastContext";
import { ProtectedRoute } from "@/components/ProtectedRoute";

function PaymentQRContent() {
  const params = useParams();
  const router = useRouter();
  const orderId = params?.id as string;
  const { formatPrice } = useCurrency();
  const { showToast } = useToast();

  const [order, setOrder] = useState<any>(null);
  const [loading, setLoading] = useState(true);
  const [simulating, setSimulating] = useState(false);
  const [timeLeft, setTimeLeft] = useState(900); // 15 minutes countdown

  useEffect(() => {
    if (!orderId) return;
    const fetchOrder = async () => {
      try {
        const res = await fetch(`/api/orders/${orderId}`);
        const data = await res.json();
        if (data.success) {
          setOrder(data.order);
        } else {
          showToast("Không tìm thấy thông tin đơn hàng", "error");
        }
      } catch {
        showToast("Lỗi kết nối máy chủ", "error");
      } finally {
        setLoading(false);
      }
    };
    fetchOrder();
  }, [orderId]);

  // Timer countdown
  useEffect(() => {
    if (timeLeft <= 0) return;
    const timer = setInterval(() => {
      setTimeLeft((prev) => prev - 1);
    }, 1000);
    return () => clearInterval(timer);
  }, [timeLeft]);

  const minutes = Math.floor(timeLeft / 60);
  const seconds = timeLeft % 60;
  const timeFormatted = `${minutes.toString().padStart(2, "0")}:${seconds.toString().padStart(2, "0")}`;

  const copyToClipboard = (text: string, label: string) => {
    navigator.clipboard.writeText(text);
    showToast(`Đã chép ${label}!`, "info");
  };

  const handleSimulatePayment = async () => {
    setSimulating(true);
    showToast("Đang xác nhận thông tin chuyển khoản...", "info");

    try {
      const res = await fetch(`/api/orders/${orderId}`, {
        method: "PATCH",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ paymentStatus: "paid" }),
      });
      const data = await res.json();

      if (data.success) {
        showToast("Xác nhận thanh toán thành công!", "success");
        setTimeout(() => {
          router.push(`/order-success/${order?.orderCode || orderId}`);
        }, 1000);
      } else {
        showToast(data.error || "Lỗi cập nhật trạng thái", "error");
      }
    } catch {
      showToast("Lỗi kết nối máy chủ", "error");
    } finally {
      setSimulating(false);
    }
  };

  if (loading) {
    return (
      <div className="py-20 text-center space-y-3 animate-pulse">
        <QrCode className="w-12 h-12 text-accent mx-auto" />
        <p className="font-bold text-gray-700">Đang tải trang thanh toán QR...</p>
      </div>
    );
  }

  if (!order) {
    return (
      <div className="max-w-md mx-auto py-16 text-center space-y-4">
        <AlertCircle className="w-12 h-12 text-rose-500 mx-auto" />
        <h2 className="text-xl font-bold text-gray-900">Không tìm thấy đơn hàng</h2>
        <Link href="/" className="inline-block bg-gray-900 text-white font-bold px-6 py-2.5 rounded-xl text-sm">
          Quay lại trang chủ
        </Link>
      </div>
    );
  }

  const qrData = `STK: 999988887777 | MBBANK | SO TIEN: ${order.totalAmount} | NOI DUNG: ${order.orderCode}`;
  const qrUrl = `https://api.qrserver.com/v1/create-qr-code/?size=250x250&data=${encodeURIComponent(qrData)}`;

  return (
    <div className="max-w-3xl mx-auto space-y-8 pb-16 animate-fade-up">
      
      {/* Header Banner */}
      <div className="bg-gradient-to-r from-blue-900 via-gray-900 to-indigo-950 text-white rounded-3xl p-6 sm:p-8 shadow-xl text-center space-y-3 relative overflow-hidden">
        <div className="inline-flex items-center gap-2 bg-white/10 backdrop-blur-md px-4 py-1.5 rounded-full text-xs font-bold text-amber-300">
          <Clock className="w-3.5 h-3.5" /> Thời gian chờ thanh toán: {timeFormatted}
        </div>
        <h1 className="text-2xl sm:text-3xl font-black">Cổng Thanh Toán Chuyển Khoản QR</h1>
        <p className="text-sm text-gray-300 max-w-lg mx-auto">
          Mở ứng dụng Ngân hàng (MB, VCB, Techcombank...) hoặc Ví điện tử để quét mã bên dưới.
        </p>
      </div>

      {/* Main Grid */}
      <div className="grid grid-cols-1 md:grid-cols-12 gap-8 items-start">
        
        {/* Left: QR Code Card */}
        <div className="md:col-span-6 bg-white border border-border rounded-3xl p-6 text-center space-y-5 shadow-sm">
          <div className="inline-block p-4 border-2 border-dashed border-accent/40 rounded-2xl bg-blue-50/40 relative">
            <img src={qrUrl} alt="VietQR Code" className="w-52 h-52 object-contain mx-auto rounded-lg shadow-sm" />
            <span className="absolute -top-3 left-1/2 -translate-x-1/2 bg-accent text-white text-[10px] font-black px-3 py-0.5 rounded-full uppercase tracking-wider">
              Mã QR VietQR
            </span>
          </div>

          <div className="space-y-1">
            <p className="text-xs text-gray-400 font-medium">Tổng tiền cần chuyển</p>
            <p className="text-3xl font-black text-gray-900">{formatPrice(order.totalAmount)}</p>
          </div>

          <div className="pt-2 border-t border-gray-100 flex items-center justify-center gap-2 text-xs font-bold text-emerald-600 bg-emerald-50 py-2 rounded-xl">
            <ShieldCheck className="w-4 h-4" /> Hệ thống kiểm tra giao dịch tự động
          </div>
        </div>

        {/* Right: Bank Transfer Details */}
        <div className="md:col-span-6 space-y-5">
          <div className="bg-white border border-border rounded-3xl p-6 shadow-sm space-y-4">
            <h3 className="font-bold text-base text-gray-900 flex items-center gap-2 border-b border-gray-100 pb-3">
              <Building2 className="w-5 h-5 text-accent" /> Thông tin tài khoản ngân hàng
            </h3>

            <div className="space-y-3 text-xs">
              
              {/* Bank Name */}
              <div className="flex justify-between items-center bg-gray-50 p-3 rounded-2xl">
                <span className="text-gray-500 font-medium">Ngân hàng:</span>
                <span className="font-black text-gray-900 flex items-center gap-1.5">
                  MBBANK (Ngân Hàng Quân Đội)
                </span>
              </div>

              {/* Account Number */}
              <div className="flex justify-between items-center bg-gray-50 p-3 rounded-2xl">
                <div>
                  <span className="text-gray-500 font-medium block">Số tài khoản:</span>
                  <span className="font-mono font-extrabold text-sm text-gray-900">999988887777</span>
                </div>
                <button
                  onClick={() => copyToClipboard("999988887777", "Số tài khoản")}
                  className="p-2 bg-white border border-border hover:bg-gray-100 rounded-xl text-gray-700 transition-colors flex items-center gap-1 text-[11px] font-bold"
                >
                  <Copy className="w-3.5 h-3.5" /> Chép
                </button>
              </div>

              {/* Account Name */}
              <div className="flex justify-between items-center bg-gray-50 p-3 rounded-2xl">
                <span className="text-gray-500 font-medium">Chủ tài khoản:</span>
                <span className="font-bold text-gray-900">CÔNG TY TNHH SHOP AGY</span>
              </div>

              {/* Transfer Syntax / Order Code */}
              <div className="flex justify-between items-center bg-blue-50/60 border border-blue-100 p-3 rounded-2xl">
                <div>
                  <span className="text-gray-500 font-medium block">Nội dung chuyển khoản:</span>
                  <span className="font-mono font-black text-sm text-accent">{order.orderCode}</span>
                </div>
                <button
                  onClick={() => copyToClipboard(order.orderCode, "Nội dung chuyển khoản")}
                  className="p-2 bg-white border border-blue-200 hover:bg-blue-50 text-accent rounded-xl transition-colors flex items-center gap-1 text-[11px] font-bold"
                >
                  <Copy className="w-3.5 h-3.5" /> Chép
                </button>
              </div>

            </div>
          </div>

          {/* Simulator Action Button */}
          <div className="bg-gradient-to-br from-amber-50 to-orange-50 border border-amber-200 rounded-3xl p-5 space-y-3">
            <div className="flex items-start gap-2.5">
              <Sparkles className="w-5 h-5 text-amber-600 flex-shrink-0 mt-0.5" />
              <div>
                <p className="font-bold text-xs text-amber-900">Môi trường Giả Lập Mua Sắm</p>
                <p className="text-[11px] text-amber-700 mt-0.5">
                  Bấm nút bên dưới để mô phỏng sự kiện Ngân hàng báo đã nhận được tiền thành công.
                </p>
              </div>
            </div>

            <button
              onClick={handleSimulatePayment}
              disabled={simulating}
              className="w-full bg-emerald-600 hover:bg-emerald-700 text-white font-extrabold py-3.5 px-6 rounded-2xl flex items-center justify-center gap-2 transition-all shadow-md text-sm disabled:opacity-50"
            >
              <CheckCircle2 className="w-5 h-5" />
              {simulating ? "Đang xác nhận tiền về..." : "Mô Phỏng Đã Chuyển Khoản Thành Công"}
            </button>
          </div>

        </div>

      </div>

    </div>
  );
}

export default function PaymentQRPage() {
  return (
    <ProtectedRoute>
      <PaymentQRContent />
    </ProtectedRoute>
  );
}
