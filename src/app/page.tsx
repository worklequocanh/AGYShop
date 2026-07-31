"use client";

import React, { useState, useEffect } from "react";
import Link from "next/link";
import {
  ArrowRight, Truck, ShieldCheck, RefreshCw,
  Zap, ChevronRight, Tag, PackageCheck
} from "lucide-react";
import { ProductCard } from "@/components/ProductCard";

const TRUST = [
  { icon: Truck,       title: "Giao hàng nhanh 2h",      desc: "Nội thành Hà Nội & TP.HCM" },
  { icon: ShieldCheck, title: "100% hàng chính hãng",     desc: "Đền 200% nếu phát hiện hàng giả" },
  { icon: RefreshCw,   title: "Đổi trả trong 30 ngày",   desc: "Hoàn tiền 100% không điều kiện" },
  { icon: PackageCheck, title: "Đóng gói cẩn thận",      desc: "Kiểm tra hàng trước khi nhận" },
];

const CAT_EMOJI: Record<string, string> = {
  smartphones: "📱", laptops: "💻", tablets: "📟", "mobile-accessories": "🎧",
  "mens-shirts": "👔", "womens-dresses": "👗", fragrances: "🌸", skincare: "✨",
  furniture: "🛋️", "home-decoration": "🏠", groceries: "🥦", "sports-accessories": "⚽",
  sunglasses: "🕶️", automotive: "🚗", motorcycle: "🏍️", "kitchen-accessories": "🍳",
};

const pad = (n: number) => String(n).padStart(2, "0");

export default function HomePage() {
  const [products,   setProducts]   = useState<any[]>([]);
  const [categories, setCategories] = useState<any[]>([]);
  const [loading,    setLoading]    = useState(true);
  const [seeding,    setSeeding]    = useState(false);
  const [time,       setTime]       = useState({ h: 5, m: 59, s: 59 });

  // Countdown
  useEffect(() => {
    const t = setInterval(() => setTime((p) => {
      if (p.s > 0) return { ...p, s: p.s - 1 };
      if (p.m > 0) return { ...p, m: p.m - 1, s: 59 };
      if (p.h > 0) return { h: p.h - 1, m: 59, s: 59 };
      return { h: 5, m: 59, s: 59 };
    }), 1000);
    return () => clearInterval(t);
  }, []);

  // Fetch data
  useEffect(() => {
    (async () => {
      setLoading(true);
      try {
        const [pR, cR] = await Promise.all([
          fetch("/api/products?limit=8"),
          fetch("/api/categories"),
        ]);
        if (pR.ok) { const pD = await pR.json(); if (pD.success) setProducts(pD.products); }
        if (cR.ok) { const cD = await cR.json(); if (cD.success) setCategories(cD.categories.slice(0, 8)); }
      } catch {} finally { setLoading(false); }
    })();
  }, []);

  const handleSeed = async () => {
    setSeeding(true);
    try {
      const r = await fetch("/api/seed");
      const d = await r.json();
      if (d.success) setTimeout(() => location.reload(), 800);
      else alert("Lỗi: " + d.error);
    } finally { setSeeding(false); }
  };

  return (
    <div className="space-y-14 pb-20">

      {/* ═══════════════════════════════════════
          HERO
      ═══════════════════════════════════════ */}
      <section className="relative rounded-3xl overflow-hidden bg-gray-900 min-h-[420px] sm:min-h-[480px] flex items-center">
        {/* Subtle background pattern */}
        <div className="absolute inset-0 opacity-[0.04]"
          style={{
            backgroundImage: `radial-gradient(circle at 1px 1px, white 1px, transparent 0)`,
            backgroundSize: "40px 40px",
          }} />

        {/* Accent line top */}
        <div className="absolute top-0 left-0 right-0 h-0.5 bg-gradient-to-r from-transparent via-accent to-transparent" />

        <div className="relative z-10 max-w-3xl mx-auto px-8 sm:px-12 py-16 text-center space-y-7">
          <span className="inline-flex items-center gap-2 text-xs font-bold uppercase tracking-[0.15em] text-accent border border-accent/30 bg-accent/10 px-4 py-2 rounded-full">
            <span className="w-1.5 h-1.5 bg-accent rounded-full animate-pulse" />
            Bộ sưu tập 2026
          </span>

          <h1 className="text-4xl sm:text-6xl font-black text-white leading-[1.05] tracking-tight">
            Mua sắm thông minh,<br />
            <span className="text-accent">Sống đẳng cấp hơn</span>
          </h1>

          <p className="text-gray-400 text-base sm:text-lg leading-relaxed max-w-xl mx-auto">
            Hàng nghìn sản phẩm chính hãng. Giao hàng nhanh. Thanh toán an toàn. Đổi trả dễ dàng.
          </p>

          <div className="flex flex-wrap items-center justify-center gap-3 pt-1">
            <Link href="/products"
              className="inline-flex items-center gap-2 bg-white text-gray-900 font-black px-7 py-3.5 rounded-2xl hover:bg-gray-100 transition-colors text-sm shadow-lg">
              Mua ngay <ArrowRight className="w-4 h-4" />
            </Link>
            <Link href="/products"
              className="inline-flex items-center gap-2 border border-white/20 text-white/80 hover:text-white hover:border-white/40 font-semibold px-7 py-3.5 rounded-2xl transition-colors text-sm">
              Xem sản phẩm
            </Link>
          </div>

          {/* Stats row */}
          <div className="flex items-center justify-center gap-8 sm:gap-12 pt-4 border-t border-white/10">
            {[["10,000+", "Sản phẩm"], ["50,000+", "Khách hàng"], ["4.9 ★", "Đánh giá"]].map(([v, l]) => (
              <div key={l} className="text-center">
                <p className="text-xl sm:text-2xl font-black text-white">{v}</p>
                <p className="text-xs text-gray-500 font-medium mt-0.5">{l}</p>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* ═══════════════════════════════════════
          TRUST BADGES
      ═══════════════════════════════════════ */}
      <section className="grid grid-cols-2 lg:grid-cols-4 gap-3">
        {TRUST.map(({ icon: Icon, title, desc }) => (
          <div key={title} className="flex items-start gap-3 bg-white border border-border rounded-2xl p-4 hover:border-gray-300 transition-colors">
            <div className="w-9 h-9 rounded-xl bg-gray-100 flex items-center justify-center flex-shrink-0">
              <Icon className="w-4.5 h-4.5 text-gray-700" />
            </div>
            <div>
              <p className="text-xs font-bold text-gray-800 leading-tight">{title}</p>
              <p className="text-[11px] text-gray-500 mt-0.5 leading-tight">{desc}</p>
            </div>
          </div>
        ))}
      </section>

      {/* ═══════════════════════════════════════
          CATEGORIES
      ═══════════════════════════════════════ */}
      {categories.length > 0 && (
        <section className="space-y-5">
          <div className="flex items-end justify-between">
            <div>
              <p className="text-xs font-bold text-gray-400 uppercase tracking-widest mb-1">Duyệt theo</p>
              <h2 className="text-2xl font-black text-gray-900">Danh Mục</h2>
            </div>
            <Link href="/products" className="flex items-center gap-1 text-sm font-semibold text-accent hover:underline">
              Tất cả <ChevronRight className="w-4 h-4" />
            </Link>
          </div>

          <div className="grid grid-cols-4 sm:grid-cols-8 gap-2.5">
            {categories.map((cat) => (
              <Link key={cat.slug} href={`/category/${cat.slug}`}
                className="group flex flex-col items-center gap-2 p-3 bg-white border border-border rounded-2xl hover:border-accent/40 hover:shadow-md transition-all cursor-pointer">
                <span className="text-2xl sm:text-3xl">{CAT_EMOJI[cat.slug] || "🏷️"}</span>
                <span className="text-[10px] sm:text-xs font-semibold text-gray-600 group-hover:text-accent transition-colors capitalize text-center leading-tight line-clamp-2">
                  {cat.name}
                </span>
              </Link>
            ))}
          </div>
        </section>
      )}

      {/* ═══════════════════════════════════════
          FEATURED PRODUCTS
      ═══════════════════════════════════════ */}
      <section className="space-y-6">
        <div className="flex items-end justify-between">
          <div>
            <p className="text-xs font-bold text-gray-400 uppercase tracking-widest mb-1">Bán chạy nhất</p>
            <h2 className="text-2xl font-black text-gray-900">Sản Phẩm Nổi Bật</h2>
          </div>
          <Link href="/products" className="flex items-center gap-1 text-sm font-semibold text-accent hover:underline whitespace-nowrap">
            Xem tất cả <ChevronRight className="w-4 h-4" />
          </Link>
        </div>

        {loading ? (
          <div className="grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-4 gap-4">
            {Array.from({ length: 8 }).map((_, i) => (
              <div key={i} className="bg-white rounded-2xl border border-border overflow-hidden animate-pulse">
                <div className="aspect-square bg-gray-100" />
                <div className="p-4 space-y-2">
                  <div className="h-2.5 bg-gray-100 rounded w-1/2" />
                  <div className="h-4 bg-gray-100 rounded w-3/4" />
                  <div className="h-2.5 bg-gray-100 rounded w-1/3" />
                </div>
              </div>
            ))}
          </div>
        ) : products.length === 0 ? (
          <div className="flex flex-col items-center justify-center py-20 gap-5 bg-white rounded-3xl border border-border border-dashed">
            <span className="text-5xl">📦</span>
            <div className="text-center">
              <p className="font-bold text-gray-800">Chưa có sản phẩm</p>
              <p className="text-sm text-gray-500 mt-1">Hãy nạp dữ liệu từ DummyJSON API</p>
            </div>
            <button onClick={handleSeed} disabled={seeding}
              className="px-6 py-2.5 bg-gray-900 hover:bg-gray-700 text-white font-bold rounded-xl text-sm transition-colors disabled:opacity-50">
              {seeding ? "Đang nạp..." : "Nạp dữ liệu ngay"}
            </button>
          </div>
        ) : (
          <div className="grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-4 gap-4">
            {products.map((p) => <ProductCard key={p.id} product={p} />)}
          </div>
        )}
      </section>

      {/* ═══════════════════════════════════════
          FLASH SALE BANNER
      ═══════════════════════════════════════ */}
      <section className="bg-gray-900 rounded-3xl p-7 sm:p-10 flex flex-col sm:flex-row items-center justify-between gap-6">
        <div className="space-y-2 text-center sm:text-left">
          <div className="flex items-center justify-center sm:justify-start gap-2 text-accent font-black text-sm uppercase tracking-widest">
            <Zap className="w-4 h-4 fill-accent" /> Flash Sale
          </div>
          <h2 className="text-3xl sm:text-4xl font-black text-white">Giảm đến 70%</h2>
          <p className="text-gray-500 text-sm">Ưu đãi kết thúc sau:</p>
        </div>

        <div className="flex items-center gap-2 sm:gap-3">
          {[["GIỜ", time.h], ["PHÚT", time.m], ["GIÂY", time.s]].map(([lbl, val], i) => (
            <React.Fragment key={lbl}>
              {i > 0 && <span className="text-2xl font-black text-gray-700 mb-4">:</span>}
              <div className="flex flex-col items-center gap-1.5">
                <div className="w-16 h-16 sm:w-20 sm:h-20 bg-white rounded-2xl flex items-center justify-center font-black text-2xl sm:text-3xl text-gray-900 tabular-nums">
                  {pad(val as number)}
                </div>
                <span className="text-[9px] sm:text-[10px] font-bold uppercase tracking-widest text-gray-600">{lbl}</span>
              </div>
            </React.Fragment>
          ))}
        </div>
      </section>

      {/* ═══════════════════════════════════════
          PROMO BANNERS
      ═══════════════════════════════════════ */}
      <section className="grid grid-cols-1 sm:grid-cols-2 gap-4">
        <div className="relative overflow-hidden rounded-3xl bg-accent p-8 text-white">
          <div className="absolute -right-6 -top-6 w-32 h-32 bg-white/10 rounded-full" />
          <div className="absolute -right-2 -bottom-8 w-24 h-24 bg-white/10 rounded-full" />
          <div className="relative z-10 space-y-3">
            <Tag className="w-6 h-6 text-white/80" />
            <h3 className="text-2xl font-black leading-tight">Ưu đãi<br />thành viên mới</h3>
            <p className="text-white/80 text-sm">Đăng ký ngay và nhận voucher giảm 15% cho đơn đầu tiên.</p>
            <Link href="/login"
              className="inline-flex items-center gap-2 bg-white text-accent font-black text-sm px-5 py-2.5 rounded-xl hover:bg-white/90 transition-colors">
              Đăng ký <ArrowRight className="w-4 h-4" />
            </Link>
          </div>
        </div>

        <div className="relative overflow-hidden rounded-3xl bg-gray-100 border border-border p-8">
          <div className="absolute -right-6 -top-6 w-32 h-32 bg-gray-200/80 rounded-full" />
          <div className="relative z-10 space-y-3">
            <Truck className="w-6 h-6 text-gray-500" />
            <h3 className="text-2xl font-black leading-tight text-gray-900">Miễn phí<br />vận chuyển</h3>
            <p className="text-gray-500 text-sm">Đơn hàng từ 500K được miễn phí vận chuyển toàn quốc.</p>
            <Link href="/products"
              className="inline-flex items-center gap-2 bg-gray-900 text-white font-black text-sm px-5 py-2.5 rounded-xl hover:bg-gray-700 transition-colors">
              Mua ngay <ArrowRight className="w-4 h-4" />
            </Link>
          </div>
        </div>
      </section>

    </div>
  );
}
