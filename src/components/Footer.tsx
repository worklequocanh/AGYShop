"use client";

import React from "react";
import Link from "next/link";
import { Package, Mail, Phone, MapPin } from "lucide-react";

export function Footer() {
  return (
    <footer className="bg-gray-900 text-gray-400">

      {/* Main content */}
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-14 grid grid-cols-2 md:grid-cols-4 gap-8">

        {/* Brand */}
        <div className="col-span-2 md:col-span-1 space-y-5">
          <Link href="/" className="inline-flex items-center gap-2">
            <div className="w-8 h-8 bg-white rounded-lg flex items-center justify-center">
              <Package className="w-4 h-4 text-gray-900" strokeWidth={2.5} />
            </div>
            <span className="text-white font-black text-lg tracking-tight">
              AGY<span className="font-light">Shop</span>
            </span>
          </Link>
          <p className="text-sm leading-relaxed text-gray-500 max-w-xs">
            Nền tảng thương mại điện tử hiện đại. Hàng chính hãng, giao hàng nhanh, thanh toán an toàn.
          </p>
          <div className="flex gap-2">
            <a href="#" className="w-8 h-8 bg-gray-800 hover:bg-gray-700 rounded-lg flex items-center justify-center transition-colors">
              <svg className="w-4 h-4 fill-current" viewBox="0 0 24 24"><path d="M22 12c0-5.52-4.48-10-10-10S2 6.48 2 12c0 4.84 3.44 8.87 8 9.8V15H8v-3h2V9.5C10 7.57 11.57 6 13.5 6H16v3h-2c-.55 0-1 .45-1 1v2h3v3h-3v6.95c4.56-.93 8-4.96 8-9.75z"/></svg>
            </a>
            <a href="#" className="w-8 h-8 bg-gray-800 hover:bg-gray-700 rounded-lg flex items-center justify-center transition-colors">
              <svg className="w-4 h-4 fill-none stroke-current stroke-[1.5]" viewBox="0 0 24 24" strokeLinecap="round" strokeLinejoin="round"><rect x="2" y="2" width="20" height="20" rx="5"/><path d="M16 11.37A4 4 0 1 1 12.63 8 4 4 0 0 1 16 11.37z"/><line x1="17.5" y1="6.5" x2="17.51" y2="6.5"/></svg>
            </a>
            <a href="#" className="w-8 h-8 bg-gray-800 hover:bg-gray-700 rounded-lg flex items-center justify-center transition-colors">
              <svg className="w-4 h-4 fill-current" viewBox="0 0 24 24"><path d="M21.58 7.2a2.5 2.5 0 0 0-1.76-1.77C18.25 5 12 5 12 5s-6.25 0-7.82.43A2.5 2.5 0 0 0 2.42 7.2 26 26 0 0 0 2 12a26 26 0 0 0 .42 4.8 2.5 2.5 0 0 0 1.76 1.77C5.75 19 12 19 12 19s6.25 0 7.82-.43a2.5 2.5 0 0 0 1.76-1.77A26 26 0 0 0 22 12a26 26 0 0 0-.42-4.8zM9.75 15V9l6 3-6 3z"/></svg>
            </a>
          </div>
        </div>

        {/* Explore */}
        <div className="space-y-4">
          <h4 className="text-xs font-bold uppercase tracking-widest text-gray-300">Khám phá</h4>
          <ul className="space-y-2.5 text-sm">
            {[
              ["/shop",     "Cửa hàng sản phẩm"],
              ["/about",    "Về chúng tôi"],
              ["/contact",  "Liên hệ hỗ trợ"],
              ["/wishlist", "Danh sách yêu thích"],
              ["/profile",  "Lịch sử đơn hàng"],
            ].map(([href, label]) => (
              <li key={href}>
                <Link href={href} className="hover:text-white transition-colors">{label}</Link>
              </li>
            ))}
          </ul>
        </div>

        {/* Policy */}
        <div className="space-y-4">
          <h4 className="text-xs font-bold uppercase tracking-widest text-gray-300">Chính sách</h4>
          <ul className="space-y-2.5 text-sm">
            {["Chính sách đổi trả", "Chính sách bảo mật", "Điều khoản sử dụng", "Bảo hành sản phẩm"].map((l) => (
              <li key={l}><a href="#" className="hover:text-white transition-colors">{l}</a></li>
            ))}
          </ul>
        </div>

        {/* Contact */}
        <div className="space-y-4">
          <h4 className="text-xs font-bold uppercase tracking-widest text-gray-300">Liên hệ</h4>
          <ul className="space-y-3 text-sm">
            <li className="flex items-start gap-2.5">
              <MapPin className="w-4 h-4 text-gray-500 mt-0.5 flex-shrink-0" />
              <span>12 Trịnh Đình Thảo, P. Hòa Thạnh, Q. Tân Phú, TP.HCM (Trường CĐ CNTT TP.HCM)</span>
            </li>
            <li className="flex items-center gap-2.5">
              <Phone className="w-4 h-4 text-gray-500 flex-shrink-0" />
              <span>1900-8888</span>
            </li>
            <li className="flex items-center gap-2.5">
              <Mail className="w-4 h-4 text-gray-500 flex-shrink-0" />
              <span>cskh@agyshop.vn</span>
            </li>
          </ul>
        </div>
      </div>

      {/* Bottom bar */}
      <div className="border-t border-gray-800">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-4 flex flex-col sm:flex-row items-center justify-between gap-2">
          <p className="text-xs text-gray-600">© {new Date().getFullYear()} AGYShop. Trường Cao đẳng Công nghệ Thông tin TP.HCM (ITC).</p>
          <p className="text-xs text-gray-700">12 Trịnh Đình Thảo, HCM</p>
        </div>
      </div>

    </footer>
  );
}
