"use client";

import React from "react";
import { Package, CreditCard, Truck, CheckCircle2, Clock } from "lucide-react";

interface OrderTimelineProps {
  order: any;
}

export function OrderTimeline({ order }: OrderTimelineProps) {
  // Determine current active step (1 to 4)
  const isPaid = order?.isPaid || order?.paymentStatus === "paid";
  const shippingStatus = order?.shippingStatus || (isPaid ? "shipping" : "processing");

  let currentStep = 1;
  if (shippingStatus === "completed" || shippingStatus === "delivered") {
    currentStep = 4;
  } else if (shippingStatus === "shipping") {
    currentStep = 3;
  } else if (isPaid || shippingStatus === "confirmed") {
    currentStep = 2;
  } else {
    currentStep = 1;
  }

  const steps = [
    {
      step: 1,
      title: "Đã Đặt Hàng",
      desc: "Ghi nhận đơn vào hệ thống",
      icon: Package,
      time: order?.createdAt ? new Date(order.createdAt).toLocaleDateString("vi-VN") : "Hôm nay",
    },
    {
      step: 2,
      title: "Xác Nhận / Thanh Toán",
      desc: isPaid ? "Đã xác nhận thanh toán" : "Chờ quét VietQR / COD",
      icon: CreditCard,
      time: isPaid ? "Đã duyệt" : "Đang chờ",
    },
    {
      step: 3,
      title: "Đang Vận Chuyển",
      desc: "Đang giao từ 12 Trịnh Đình Thảo, HCM",
      icon: Truck,
      time: currentStep >= 3 ? "Đang vận chuyển" : "Dự kiến 2h",
    },
    {
      step: 4,
      title: "Giao Thành Công",
      desc: "Hoàn tất đơn hàng",
      icon: CheckCircle2,
      time: currentStep === 4 ? "Đã nhận hàng" : "Dự kiến hôm nay",
    },
  ];

  return (
    <div className="bg-white border border-border rounded-3xl p-6 shadow-sm space-y-6">
      <div className="flex items-center justify-between border-b border-border pb-4">
        <div>
          <h3 className="font-black text-base text-gray-900 flex items-center gap-2">
            <Truck className="w-5 h-5 text-accent" /> Hành Trình Vận Chuyển Đơn Hàng #{order?.id || order?._id}
          </h3>
          <p className="text-xs text-gray-500 mt-0.5">
            Điểm xuất phát: <span className="font-bold text-gray-800">12 Trịnh Đình Thảo, Tân Phú, TP.HCM (Trường ITC)</span>
          </p>
        </div>
        <span className={`text-xs font-black px-3 py-1.5 rounded-xl flex items-center gap-1.5 ${
          currentStep === 4
            ? "bg-emerald-100 text-emerald-800"
            : currentStep === 3
            ? "bg-blue-100 text-blue-800"
            : "bg-amber-100 text-amber-800"
        }`}>
          <Clock className="w-3.5 h-3.5" />
          {currentStep === 4 ? "Đã giao thành công" : currentStep === 3 ? "Đang giao hàng" : "Đang xử lý đơn"}
        </span>
      </div>

      {/* Graphical 4-Step Timeline */}
      <div className="relative pt-4 pb-2">
        {/* Background Connecting Line */}
        <div className="hidden sm:block absolute top-[38px] left-[10%] right-[10%] h-1 bg-gray-100 z-0" />
        
        {/* Completed Progress Line */}
        <div
          className="hidden sm:block absolute top-[38px] left-[10%] h-1 bg-gray-900 transition-all duration-500 z-0"
          style={{ width: `${((currentStep - 1) / 3) * 80}%` }}
        />

        <div className="grid grid-cols-1 sm:grid-cols-4 gap-6 sm:gap-2 relative z-10">
          {steps.map((s) => {
            const isDone = s.step <= currentStep;
            const isCurrent = s.step === currentStep;
            const IconComponent = s.icon;

            return (
              <div key={s.step} className="flex sm:flex-col items-center sm:text-center gap-4 sm:gap-2">
                <div
                  className={`w-12 h-12 rounded-2xl flex items-center justify-center font-black transition-all duration-300 flex-shrink-0 shadow-sm ${
                    isCurrent
                      ? "bg-gray-900 text-white ring-4 ring-gray-900/20 scale-110"
                      : isDone
                      ? "bg-emerald-500 text-white"
                      : "bg-gray-100 text-gray-400 border border-border"
                  }`}
                >
                  <IconComponent className="w-5 h-5" />
                </div>

                <div className="space-y-0.5">
                  <p className={`text-xs font-black ${isDone ? "text-gray-900" : "text-gray-400"}`}>
                    {s.title}
                  </p>
                  <p className="text-[11px] text-gray-500 font-medium leading-tight">{s.desc}</p>
                  <span className="text-[10px] font-bold text-accent inline-block pt-0.5">{s.time}</span>
                </div>
              </div>
            );
          })}
        </div>
      </div>
    </div>
  );
}
