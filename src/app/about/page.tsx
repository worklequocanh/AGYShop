"use client";

import React from "react";
import Link from "next/link";
import {
  Package, ShieldCheck, Truck, Sparkles, Award, Users,
  CheckCircle2, ArrowRight, HeartHandshake, Zap, Clock
} from "lucide-react";

export default function AboutPage() {
  return (
    <div className="space-y-12 pb-20 animate-fade-up">

      {/* Hero Banner */}
      <div className="bg-gradient-to-r from-gray-900 via-slate-900 to-indigo-950 text-white rounded-3xl p-8 sm:p-14 shadow-xl text-center space-y-4 relative overflow-hidden">
        <div className="inline-flex items-center gap-2 bg-white/10 backdrop-blur-md px-4 py-1.5 rounded-full text-xs font-bold text-amber-300">
          <Sparkles className="w-3.5 h-3.5" /> Câu Chuyện Thương Hiệu AGYShop
        </div>
        <h1 className="text-3xl sm:text-5xl font-black tracking-tight leading-tight">
          Nền Tảng Mua Sắm Trực Tuyến <br /> Hàng Đầu Việt Nam
        </h1>
        <p className="text-xs sm:text-sm text-gray-300 max-w-2xl mx-auto leading-relaxed">
          AGYShop cam kết mang tới cho khách hàng trải nghiệm mua sắm hiện đại, sản phẩm chính hãng 100% cùng dịch vụ giao hàng siêu tốc và hỗ trợ tận tâm 24/7.
        </p>

        <div className="pt-4 flex justify-center gap-4">
          <Link
            href="/shop"
            className="bg-white hover:bg-gray-100 text-gray-900 font-extrabold text-xs sm:text-sm px-7 py-3.5 rounded-2xl shadow-lg transition-all flex items-center gap-2"
          >
            Khám Phá Cửa Hàng <ArrowRight className="w-4 h-4 text-accent" />
          </Link>
          <Link
            href="/contact"
            className="bg-white/10 hover:bg-white/20 text-white font-bold text-xs sm:text-sm px-6 py-3.5 rounded-2xl border border-white/20 transition-all"
          >
            Liên Hệ Với Chúng Tôi
          </Link>
        </div>
      </div>

      {/* Stats Counter Grid */}
      <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
        {[
          { label: "Khách hàng tin dùng", val: "50,000+", icon: Users, color: "text-blue-600 bg-blue-50" },
          { label: "Tỷ lệ hài lòng", val: "99.8%", icon: HeartHandshake, color: "text-emerald-600 bg-emerald-50" },
          { label: "Giao hàng chuẩn xác", val: "2 Giờ", icon: Zap, color: "text-amber-600 bg-amber-50" },
          { label: "Cam kết chính hãng", val: "100%", icon: ShieldCheck, color: "text-purple-600 bg-purple-50" },
        ].map((s) => (
          <div key={s.label} className="bg-white border border-border rounded-3xl p-6 text-center space-y-2 shadow-sm">
            <div className={`w-12 h-12 rounded-2xl flex items-center justify-center mx-auto ${s.color}`}>
              <s.icon className="w-6 h-6" />
            </div>
            <p className="text-2xl sm:text-3xl font-black text-gray-900">{s.val}</p>
            <p className="text-xs text-gray-400 font-medium">{s.label}</p>
          </div>
        ))}
      </div>

      {/* Core Values Section */}
      <div className="bg-white border border-border rounded-3xl p-8 sm:p-12 shadow-sm space-y-8">
        <div className="text-center max-w-xl mx-auto space-y-2">
          <h2 className="text-2xl sm:text-3xl font-black text-gray-900">
            Giá Trị Cốt Lõi Của AGYShop
          </h2>
          <p className="text-xs sm:text-sm text-gray-500">
            Chúng tôi luôn đặt lợi ích và sự hài lòng của khách hàng làm trung tâm cho mọi quyết định.
          </p>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
          {[
            {
              title: "Sản Phẩm Chính Hãng 100%",
              desc: "Toàn bộ mặt hàng tại AGYShop đều được kiểm định chất lượng nghiêm ngặt và nhập khẩu chính ngạch từ các thương hiệu uy tín thế giới.",
              icon: Award,
              color: "text-accent bg-blue-50",
            },
            {
              title: "Giao Hàng Siêu Tốc & An Toàn",
              desc: "Hệ thống kho bãi hiện đại cùng đối tác vận chuyển hỏa tốc giúp đơn hàng đến tay quý khách nhanh chóng và hoàn toàn miễn phí từ 500K.",
              icon: Truck,
              color: "text-emerald-600 bg-emerald-50",
            },
            {
              title: "Thanh Toán Đa Dạng & Bảo Mật",
              desc: "Hỗ trợ đầy đủ phương thức thanh toán Tiền mặt COD và Quét mã VietQR Ngân hàng nhanh chóng, an toàn và cực kỳ tiện lợi.",
              icon: ShieldCheck,
              color: "text-amber-600 bg-amber-50",
            },
          ].map((item) => (
            <div key={item.title} className="bg-gray-50/70 border border-gray-100 rounded-3xl p-6 space-y-3">
              <div className={`w-12 h-12 rounded-2xl flex items-center justify-center ${item.color}`}>
                <item.icon className="w-6 h-6" />
              </div>
              <h3 className="font-extrabold text-base text-gray-900">{item.title}</h3>
              <p className="text-xs text-gray-500 leading-relaxed">{item.desc}</p>
            </div>
          ))}
        </div>
      </div>

    </div>
  );
}
