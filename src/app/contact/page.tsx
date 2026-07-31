"use client";

import React, { useState } from "react";
import {
  Phone, Mail, MapPin, Clock, Send, MessageSquare, HelpCircle, School, Navigation
} from "lucide-react";
import { useToast } from "@/context/ToastContext";

const inputCls = "w-full text-xs p-3.5 bg-gray-50 border border-border rounded-2xl focus:outline-none focus:border-accent text-gray-900 font-medium transition-all";
const labelCls = "block text-[10px] font-extrabold uppercase tracking-widest text-gray-500 mb-1";

export default function ContactPage() {
  const { showToast } = useToast();
  const [submitting, setSubmitting] = useState(false);

  const [name, setName] = useState("");
  const [email, setEmail] = useState("");
  const [phone, setPhone] = useState("");
  const [subject, setSubject] = useState("");
  const [message, setMessage] = useState("");

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    setSubmitting(true);
    setTimeout(() => {
      showToast("Cảm ơn bạn! Tin nhắn liên hệ đã được gửi thành công. Bộ phận CSKH sẽ phản hồi sớm nhất.", "success");
      setName("");
      setEmail("");
      setPhone("");
      setSubject("");
      setMessage("");
      setSubmitting(false);
    }, 600);
  };

  const mapEmbedUrl = "https://maps.google.com/maps?q=12%20Tr%E1%BB%8Bnh%20%C4%90%C3%ACnh%20Th%E1%BA%A3o%2C%20H%C3%B2a%20Th%E1%BA%A3nh%2C%20T%C3%A2n%20Ph%C3%BA%2C%20H%E1%BB%93%20Ch%C3%AD%20Minh&t=&z=16&ie=UTF8&iwloc=&output=embed";

  return (
    <div className="space-y-12 pb-20 animate-fade-up">

      {/* Header Banner */}
      <div className="bg-gradient-to-r from-blue-900 via-gray-900 to-indigo-950 text-white rounded-3xl p-8 sm:p-12 shadow-xl text-center space-y-3">
        <span className="bg-white/10 backdrop-blur-md text-amber-300 text-xs font-bold px-3.5 py-1 rounded-full inline-block">
          Hỗ Trợ Khách Hàng 24/7
        </span>
        <h1 className="text-3xl sm:text-4xl font-black tracking-tight">Liên Hệ Với AGYShop</h1>
        <p className="text-xs sm:text-sm text-gray-300 max-w-lg mx-auto">
          Trường Cao đẳng Công nghệ Thông tin TP.HCM (ITC) - Nơi khởi nguồn đam mê công nghệ.
        </p>
      </div>

      {/* Contact Cards Grid */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
        {[
          { title: "Hotline Hỗ Trợ", detail: "1900-8888", sub: "Tư vấn miễn phí 24/7", icon: Phone, color: "text-blue-600 bg-blue-50" },
          { title: "Email Chăm Sóc", detail: "cskh@agyshop.vn", sub: "Phản hồi trong 24 giờ", icon: Mail, color: "text-emerald-600 bg-emerald-50" },
          { title: "Địa Chỉ Trụ Sở", detail: "12 Trịnh Đình Thảo, HCM", sub: "Trường CĐ Công nghệ Thông tin TP.HCM", icon: MapPin, color: "text-rose-600 bg-rose-50" },
          { title: "Giờ Làm Việc", detail: "08:00 - 22:00", sub: "Tất cả các ngày trong tuần", icon: Clock, color: "text-amber-600 bg-amber-50" },
        ].map((card) => (
          <div key={card.title} className="bg-white border border-border rounded-3xl p-6 shadow-sm space-y-3">
            <div className={`w-11 h-11 rounded-2xl flex items-center justify-center ${card.color}`}>
              <card.icon className="w-5.5 h-5.5" />
            </div>
            <div>
              <p className="text-xs font-bold text-gray-400">{card.title}</p>
              <p className="text-sm sm:text-base font-black text-gray-900 mt-0.5">{card.detail}</p>
              <p className="text-[11px] text-gray-500 mt-0.5">{card.sub}</p>
            </div>
          </div>
        ))}
      </div>

      {/* EMBEDDED GOOGLE MAPS SECTION */}
      <div className="bg-white border border-border rounded-3xl p-6 sm:p-8 shadow-sm space-y-6">
        <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4 border-b border-border pb-4">
          <div className="flex items-center gap-3">
            <div className="w-12 h-12 rounded-2xl bg-indigo-50 text-indigo-600 flex items-center justify-center flex-shrink-0">
              <School className="w-6 h-6" />
            </div>
            <div>
              <h3 className="font-black text-lg text-gray-900 flex items-center gap-2">
                Bản Đồ Vị Trí Trụ Sở <Navigation className="w-4 h-4 text-accent" />
              </h3>
              <p className="text-xs text-gray-500">
                12 Trịnh Đình Thảo, Phường Hòa Thạnh, Quận Tân Phú, TP. Hồ Chí Minh (Trường CĐ Công nghệ Thông tin TP.HCM)
              </p>
            </div>
          </div>

          <a
            href="https://maps.google.com/?q=12+Trịnh+Đình+Thảo,+Hòa+Thạnh,+Tân+Phú,+Hồ+Chí+Minh"
            target="_blank"
            rel="noopener noreferrer"
            className="bg-gray-900 hover:bg-gray-800 text-white font-extrabold text-xs px-5 py-2.5 rounded-xl transition-all shadow-sm flex items-center gap-1.5"
          >
            <MapPin className="w-3.5 h-3.5 text-amber-400" /> Xem trên Google Maps ↗
          </a>
        </div>

        {/* Responsive Google Maps iFrame */}
        <div className="relative w-full h-[380px] rounded-2xl overflow-hidden border border-border bg-gray-100 shadow-inner">
          <iframe
            title="Google Maps Location - ITC College 12 Trinh Dinh Thao"
            src={mapEmbedUrl}
            width="100%"
            height="100%"
            style={{ border: 0 }}
            allowFullScreen
            loading="lazy"
            referrerPolicy="no-referrer-when-downgrade"
            className="w-full h-full"
          />
        </div>
      </div>

      {/* Form & FAQ Section */}
      <div className="grid grid-cols-1 lg:grid-cols-12 gap-8 items-start">

        {/* Contact Form */}
        <div className="lg:col-span-7 bg-white border border-border rounded-3xl p-6 sm:p-8 shadow-sm space-y-6">
          <div className="border-b border-border pb-4">
            <h3 className="font-black text-xl text-gray-900 flex items-center gap-2">
              <MessageSquare className="w-5 h-5 text-accent" /> Gửi Lời Nhắn Cho Chúng Tôi
            </h3>
            <p className="text-xs text-gray-500 mt-1">
              Vui lòng điền thông tin bên dưới, nhân viên chăm sóc khách hàng sẽ liên hệ lại ngay.
            </p>
          </div>

          <form onSubmit={handleSubmit} className="space-y-4">
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
              <div>
                <label className={labelCls}>Họ và tên của bạn</label>
                <input
                  type="text"
                  placeholder="Nguyễn Văn A"
                  value={name}
                  onChange={(e) => setName(e.target.value)}
                  className={inputCls}
                  required
                />
              </div>
              <div>
                <label className={labelCls}>Địa chỉ Email</label>
                <input
                  type="email"
                  placeholder="name@example.com"
                  value={email}
                  onChange={(e) => setEmail(e.target.value)}
                  className={inputCls}
                  required
                />
              </div>
            </div>

            <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
              <div>
                <label className={labelCls}>Số điện thoại</label>
                <input
                  type="tel"
                  placeholder="0987654321"
                  value={phone}
                  onChange={(e) => setPhone(e.target.value)}
                  className={inputCls}
                  required
                />
              </div>
              <div>
                <label className={labelCls}>Chủ đề cần hỗ trợ</label>
                <input
                  type="text"
                  placeholder="Ví dụ: Tư vấn đơn hàng / Bảo hành"
                  value={subject}
                  onChange={(e) => setSubject(e.target.value)}
                  className={inputCls}
                  required
                />
              </div>
            </div>

            <div>
              <label className={labelCls}>Nội dung tin nhắn</label>
              <textarea
                rows={4}
                placeholder="Nhập nội dung câu hỏi hoặc phản hồi của bạn tại đây..."
                value={message}
                onChange={(e) => setMessage(e.target.value)}
                className={`${inputCls} resize-none`}
                required
              />
            </div>

            <button
              type="submit"
              disabled={submitting}
              className="w-full bg-gray-900 hover:bg-gray-800 text-white font-extrabold py-4 rounded-2xl flex items-center justify-center gap-2 transition-all shadow-md text-xs disabled:opacity-50"
            >
              <Send className="w-4 h-4 text-amber-400" />
              {submitting ? "Đang gửi tin nhắn..." : "Gửi Tin Nhắn Liên Hệ"}
            </button>
          </form>
        </div>

        {/* FAQ List */}
        <div className="lg:col-span-5 bg-white border border-border rounded-3xl p-6 sm:p-8 shadow-sm space-y-6">
          <h3 className="font-black text-xl text-gray-900 flex items-center gap-2 border-b border-border pb-4">
            <HelpCircle className="w-5 h-5 text-amber-500" /> Câu Hỏi Thường Gặp
          </h3>

          <div className="space-y-4 text-xs">
            {[
              {
                q: "Địa chỉ trường ở đâu?",
                a: "Trường Cao đẳng Công nghệ Thông tin TP.HCM (ITC) nằm tại địa chỉ: Số 12 Trịnh Đình Thảo, Phường Hòa Thạnh, Quận Tân Phú, TP. Hồ Chí Minh."
              },
              {
                q: "Chính sách đổi trả hàng áp dụng trong bao lâu?",
                a: "AGYShop hỗ trợ đổi trả miễn phí trong vòng 30 ngày kể từ ngày nhận hàng nếu sản phẩm còn nguyên tem mác hoặc có lỗi từ nhà sản xuất."
              },
              {
                q: "Phí vận chuyển được tính như thế nào?",
                a: "Chúng tôi miễn phí vận chuyển 100% cho mọi đơn hàng có giá trị từ 500.000 VNĐ trên toàn quốc. Các đơn hàng dưới 500k áp dụng phí đồng giá 30.000 VNĐ."
              },
            ].map((faq, idx) => (
              <div key={idx} className="bg-gray-50/80 border border-gray-200 rounded-2xl p-4 space-y-2">
                <p className="font-bold text-gray-900 text-xs flex items-start gap-2">
                  <span className="text-accent font-black">Q:</span> {faq.q}
                </p>
                <p className="text-gray-500 text-[11px] leading-relaxed pl-5">
                  {faq.a}
                </p>
              </div>
            ))}
          </div>
        </div>

      </div>

    </div>
  );
}
