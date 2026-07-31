"use client";

import React, { useState, useEffect } from "react";
import Link from "next/link";
import { useRouter } from "next/navigation";
import {
  Check, ShieldCheck, CreditCard, QrCode, Truck, ArrowLeft, ArrowRight,
  UserCheck, AlertTriangle, Edit3, CheckCircle2, User, Building
} from "lucide-react";
import { useAuth } from "@/context/AuthContext";
import { useCart } from "@/context/CartContext";
import { useCurrency } from "@/context/CurrencyContext";
import { useToast } from "@/context/ToastContext";
import { ProtectedRoute } from "@/components/ProtectedRoute";

const inputCls = "w-full text-sm p-3 bg-gray-50 border border-border rounded-xl focus:outline-none focus:border-accent text-gray-800 placeholder-gray-400 transition-all";
const labelCls = "block text-[10px] font-bold uppercase tracking-widest text-gray-500 mb-1.5";

function CheckoutContent() {
  const router = useRouter();
  const { user } = useAuth();
  const { cartItems, getCartTotal, clearCart } = useCart();
  const { formatPrice } = useCurrency();
  const { showToast } = useToast();

  const [step, setStep] = useState(1);
  const [addressMode, setAddressMode] = useState<"ACCOUNT" | "MANUAL">("ACCOUNT");

  // Manual Shipping Form
  const [name, setName] = useState("");
  const [phone, setPhone] = useState("");
  const [address, setAddress] = useState("");

  const [payment, setPayment] = useState<"COD" | "QR">("COD");
  const [submitting, setSubmitting] = useState(false);

  // Pre-fill manual form if user info changes
  useEffect(() => {
    if (user) {
      setName(`${user.firstName || ""} ${user.lastName || ""}`.trim());
      setPhone(user.phone || "");
      setAddress(user.address || "");
    }
  }, [user]);

  // Check if current user profile has complete shipping info
  const isProfileComplete = Boolean(
    user &&
    user.firstName &&
    user.lastName &&
    user.phone &&
    user.phone.trim().length >= 8 &&
    user.address &&
    user.address.trim().length >= 5
  );

  const getEffectiveShippingInfo = () => {
    if (addressMode === "ACCOUNT" && user) {
      return {
        name: `${user.firstName} ${user.lastName}`.trim(),
        phone: user.phone || "",
        address: user.address || "",
      };
    }
    return { name, phone, address };
  };

  const handleProceedToPayment = (e: React.FormEvent) => {
    e.preventDefault();

    if (addressMode === "ACCOUNT") {
      if (!isProfileComplete) {
        showToast("Thông tin tài khoản chưa đầy đủ, vui lòng cập nhật hồ sơ", "error");
        return;
      }
    } else {
      if (!name.trim() || !phone.trim() || !address.trim()) {
        showToast("Vui lòng điền đầy đủ tất cả các trường thông tin thủ công", "error");
        return;
      }
    }

    setStep(2);
  };

  const handleOrder = async () => {
    setSubmitting(true);
    const shippingInfo = getEffectiveShippingInfo();

    try {
      const res = await fetch("/api/orders", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          items: cartItems.map((i) => ({
            productId: i.id,
            title: i.title,
            price: i.price,
            quantity: i.quantity,
            thumbnail: i.thumbnail,
          })),
          totalAmount: getCartTotal(),
          shippingAddress: shippingInfo,
          paymentMethod: payment,
        }),
      });

      const data = await res.json();
      if (data.success) {
        clearCart();
        const orderCode = data.order.orderCode;

        if (payment === "QR") {
          showToast("Đã tạo đơn hàng! Đang chuyển đến trang thanh toán QR...", "info");
          router.push(`/payment-qr/${orderCode}`);
        } else {
          showToast("Đặt hàng thành công!", "success");
          router.push(`/order-success/${orderCode}`);
        }
      } else {
        showToast(data.error || "Gửi đơn hàng thất bại", "error");
      }
    } catch {
      showToast("Lỗi kết nối máy chủ", "error");
    } finally {
      setSubmitting(false);
    }
  };

  if (cartItems.length === 0) {
    return (
      <div className="max-w-md mx-auto py-20 text-center space-y-4">
        <h2 className="text-xl font-bold text-gray-800">Giỏ hàng rỗng</h2>
        <p className="text-sm text-gray-500">Vui lòng thêm sản phẩm trước khi thanh toán.</p>
        <Link href="/products" className="inline-block bg-gray-900 text-white font-bold px-6 py-2.5 rounded-xl text-sm">
          Xem sản phẩm
        </Link>
      </div>
    );
  }

  const total = getCartTotal();
  const effectiveInfo = getEffectiveShippingInfo();

  return (
    <div className="max-w-4xl mx-auto space-y-8 pb-16 animate-fade-up">
      
      {/* Stepper Header */}
      <div className="flex items-center justify-center gap-3">
        {[{ n: 1, label: "Thông tin giao hàng" }, { n: 2, label: "Phương thức thanh toán" }].map((s, i) => (
          <React.Fragment key={s.n}>
            {i > 0 && <div className={`h-0.5 w-12 ${step >= s.n ? "bg-gray-900" : "bg-gray-200"}`} />}
            <div className="flex items-center gap-2">
              <div className={`w-8 h-8 rounded-full flex items-center justify-center text-xs font-black transition-colors ${step >= s.n ? "bg-gray-900 text-white" : "bg-gray-200 text-gray-500"}`}>
                {step > s.n ? <Check className="w-4 h-4" /> : s.n}
              </div>
              <span className={`text-xs font-bold ${step >= s.n ? "text-gray-900" : "text-gray-400"}`}>{s.label}</span>
            </div>
          </React.Fragment>
        ))}
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-12 gap-8 items-start">

        {/* Left Form Area */}
        <div className="lg:col-span-8 space-y-6">

          {/* STEP 1: Shipping Info Choice */}
          {step === 1 && (
            <div className="bg-white border border-border rounded-3xl p-6 shadow-sm space-y-6">
              
              <div className="flex items-center justify-between border-b border-border pb-4">
                <div>
                  <h3 className="font-black text-lg text-gray-900 flex items-center gap-2">
                    <Truck className="w-5 h-5 text-accent" /> Thông Tin Giao Hàng
                  </h3>
                  <p className="text-xs text-gray-500 mt-0.5">Chọn phương thức địa chỉ nhận hàng của bạn</p>
                </div>
              </div>

              {/* Mode Tabs */}
              <div className="grid grid-cols-2 gap-3">
                <button
                  type="button"
                  onClick={() => setAddressMode("ACCOUNT")}
                  className={`p-4 border-2 rounded-2xl flex flex-col items-start gap-1.5 transition-all text-left ${
                    addressMode === "ACCOUNT" ? "border-gray-900 bg-gray-50/80" : "border-border hover:border-gray-300"
                  }`}
                >
                  <div className="flex items-center justify-between w-full">
                    <span className="font-bold text-xs text-gray-900 flex items-center gap-1.5">
                      <UserCheck className="w-4 h-4 text-accent" /> Thông tin tài khoản
                    </span>
                    {addressMode === "ACCOUNT" && <CheckCircle2 className="w-4 h-4 text-emerald-600" />}
                  </div>
                  <span className="text-[11px] text-gray-400">Sử dụng địa chỉ lưu trong hồ sơ</span>
                </button>

                <button
                  type="button"
                  onClick={() => setAddressMode("MANUAL")}
                  className={`p-4 border-2 rounded-2xl flex flex-col items-start gap-1.5 transition-all text-left ${
                    addressMode === "MANUAL" ? "border-gray-900 bg-gray-50/80" : "border-border hover:border-gray-300"
                  }`}
                >
                  <div className="flex items-center justify-between w-full">
                    <span className="font-bold text-xs text-gray-900 flex items-center gap-1.5">
                      <Edit3 className="w-4 h-4 text-amber-600" /> Nhập thông tin mới
                    </span>
                    {addressMode === "MANUAL" && <CheckCircle2 className="w-4 h-4 text-emerald-600" />}
                  </div>
                  <span className="text-[11px] text-gray-400">Nhập thủ công địa chỉ giao mới</span>
                </button>
              </div>

              {/* Option 1: Account Profile Info */}
              {addressMode === "ACCOUNT" && (
                <div className="space-y-4 pt-2">
                  {isProfileComplete ? (
                    <div className="bg-emerald-50/60 border border-emerald-200 rounded-2xl p-5 space-y-3">
                      <div className="flex items-center justify-between border-b border-emerald-100 pb-2.5">
                        <span className="text-xs font-bold text-emerald-800 flex items-center gap-1.5">
                          <CheckCircle2 className="w-4 h-4 text-emerald-600" /> Đã xác nhận thông tin tài khoản hợp lệ
                        </span>
                        <Link href="/profile" className="text-[11px] font-bold text-emerald-700 hover:underline">
                          Chỉnh sửa hồ sơ →
                        </Link>
                      </div>

                      <div className="grid grid-cols-2 gap-3 text-xs">
                        <div>
                          <span className="text-gray-400 block">Họ và tên người nhận:</span>
                          <span className="font-bold text-gray-900">{user?.firstName} {user?.lastName}</span>
                        </div>
                        <div>
                          <span className="text-gray-400 block">Số điện thoại:</span>
                          <span className="font-bold text-gray-900">{user?.phone}</span>
                        </div>
                        <div className="col-span-2">
                          <span className="text-gray-400 block">Địa chỉ giao hàng:</span>
                          <span className="font-bold text-gray-900">{user?.address}</span>
                        </div>
                      </div>
                    </div>
                  ) : (
                    /* Incomplete Profile Warning & Redirect Button */
                    <div className="bg-rose-50 border border-rose-200 rounded-2xl p-5 space-y-4 text-center sm:text-left">
                      <div className="flex flex-col sm:flex-row items-center gap-3">
                        <div className="w-10 h-10 rounded-2xl bg-rose-100 flex items-center justify-center flex-shrink-0">
                          <AlertTriangle className="w-5 h-5 text-rose-600" />
                        </div>
                        <div>
                          <p className="font-bold text-sm text-rose-900">Thông tin tài khoản chưa đầy đủ!</p>
                          <p className="text-xs text-rose-700 mt-0.5">
                            Tài khoản của bạn còn thiếu Số điện thoại hoặc Địa chỉ giao hàng. Vui lòng cập nhật trước khi đặt hàng.
                          </p>
                        </div>
                      </div>

                      <div className="pt-1 flex flex-col sm:flex-row gap-3">
                        <Link
                          href="/profile"
                          className="bg-rose-600 hover:bg-rose-700 text-white font-extrabold text-xs py-3 px-6 rounded-xl flex items-center justify-center gap-2 transition-colors shadow-sm"
                        >
                          <User className="w-4 h-4" /> Cập Nhật Hồ Sơ Ngay
                        </Link>

                        <button
                          type="button"
                          onClick={() => setAddressMode("MANUAL")}
                          className="bg-white border border-rose-300 text-rose-800 font-bold text-xs py-3 px-6 rounded-xl hover:bg-rose-50 transition-colors"
                        >
                          Hoặc nhập thông tin thủ công
                        </button>
                      </div>
                    </div>
                  )}
                </div>
              )}

              {/* Option 2: Manual Form */}
              {addressMode === "MANUAL" && (
                <form onSubmit={handleProceedToPayment} className="space-y-4 pt-2">
                  <div className="grid grid-cols-2 gap-4">
                    <div>
                      <label className={labelCls}>Họ và tên người nhận</label>
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
                      <label className={labelCls}>Số điện thoại liên hệ</label>
                      <input
                        type="tel"
                        placeholder="0987654321"
                        value={phone}
                        onChange={(e) => setPhone(e.target.value)}
                        className={inputCls}
                        required
                      />
                    </div>
                  </div>

                  <div>
                    <label className={labelCls}>Địa chỉ nhận hàng (1 dòng đầy đủ)</label>
                    <input
                      type="text"
                      placeholder="Ví dụ: Số 123, Đường Nguyễn Huệ, Phường Bến Nghé, Quận 1, TP. Hồ Chí Minh"
                      value={address}
                      onChange={(e) => setAddress(e.target.value)}
                      className={inputCls}
                      required
                    />
                  </div>
                </form>
              )}

              {/* Next Step Button (Only visible if info is complete in selected mode) */}
              {(addressMode === "MANUAL" || isProfileComplete) && (
                <button
                  type="button"
                  onClick={handleProceedToPayment}
                  className="w-full bg-gray-900 hover:bg-gray-800 text-white font-extrabold py-4 rounded-2xl flex items-center justify-center gap-2 transition-all shadow-md text-sm mt-4"
                >
                  Tiếp tục sang bước Thanh Toán <ArrowRight className="w-4.5 h-4.5" />
                </button>
              )}

            </div>
          )}

          {/* STEP 2: Payment Method Choice */}
          {step === 2 && (
            <div className="bg-white border border-border rounded-3xl p-6 shadow-sm space-y-6">
              
              <div className="flex items-center gap-3 border-b border-border pb-4">
                <button
                  onClick={() => setStep(1)}
                  className="p-2 hover:bg-gray-100 rounded-xl transition-colors text-gray-500"
                >
                  <ArrowLeft className="w-4 h-4" />
                </button>
                <div>
                  <h3 className="font-black text-lg text-gray-900 flex items-center gap-2">
                    <CreditCard className="w-5 h-5 text-accent" /> Chọn Phương Thức Thanh Toán
                  </h3>
                  <p className="text-xs text-gray-500">2 phương thức hỗ trợ thanh toán an toàn</p>
                </div>
              </div>

              {/* 2 Payment Options */}
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                
                {/* Method 1: COD */}
                <button
                  type="button"
                  onClick={() => setPayment("COD")}
                  className={`p-5 border-2 rounded-2xl flex flex-col items-start gap-2.5 transition-all text-left ${
                    payment === "COD" ? "border-gray-900 bg-gray-50/80" : "border-border hover:border-gray-300"
                  }`}
                >
                  <div className="flex items-center justify-between w-full">
                    <div className="w-9 h-9 rounded-xl bg-blue-100 flex items-center justify-center">
                      <Truck className="w-5 h-5 text-accent" />
                    </div>
                    {payment === "COD" && <CheckCircle2 className="w-5 h-5 text-emerald-600" />}
                  </div>
                  <div>
                    <span className="font-black text-sm text-gray-900 block">Thanh toán Tiền mặt (COD)</span>
                    <span className="text-xs text-gray-400 mt-0.5 block">Thanh toán trực tiếp cho nhân viên giao hàng khi nhận hàng.</span>
                  </div>
                </button>

                {/* Method 2: VietQR */}
                <button
                  type="button"
                  onClick={() => setPayment("QR")}
                  className={`p-5 border-2 rounded-2xl flex flex-col items-start gap-2.5 transition-all text-left ${
                    payment === "QR" ? "border-gray-900 bg-gray-50/80" : "border-border hover:border-gray-300"
                  }`}
                >
                  <div className="flex items-center justify-between w-full">
                    <div className="w-9 h-9 rounded-xl bg-amber-100 flex items-center justify-center">
                      <QrCode className="w-5 h-5 text-amber-600" />
                    </div>
                    {payment === "QR" && <CheckCircle2 className="w-5 h-5 text-emerald-600" />}
                  </div>
                  <div>
                    <span className="font-black text-sm text-gray-900 block">Chuyển khoản QR Ngân hàng</span>
                    <span className="text-xs text-gray-400 mt-0.5 block">Quét mã VietQR (MBBank) và giả lập xác nhận chuyển khoản.</span>
                  </div>
                </button>

              </div>

              {/* Confirm Order CTA */}
              <button
                onClick={handleOrder}
                disabled={submitting}
                className="w-full bg-emerald-600 hover:bg-emerald-700 text-white font-extrabold py-4 rounded-2xl flex items-center justify-center gap-2 transition-all shadow-lg text-sm disabled:opacity-50 mt-4"
              >
                <ShieldCheck className="w-5 h-5" />
                {submitting
                  ? "Đang tạo đơn hàng..."
                  : payment === "QR"
                  ? `Xác Nhận Đặt Hàng & Quét Mã QR (${formatPrice(total)})`
                  : `Xác Nhận Đặt Hàng COD (${formatPrice(total)})`}
              </button>

            </div>
          )}

        </div>

        {/* Right Summary Sidebar */}
        <div className="lg:col-span-4 bg-white border border-border rounded-3xl p-6 shadow-sm space-y-4 sticky top-24">
          <h3 className="font-black text-base text-gray-900 pb-3 border-b border-gray-100 flex justify-between items-center">
            <span>Tóm Tắt Đơn</span>
            <span className="text-xs font-normal text-gray-400">{cartItems.length} sản phẩm</span>
          </h3>

          <div className="space-y-3 max-h-60 overflow-y-auto pr-1">
            {cartItems.map((item) => (
              <div key={item.id} className="flex items-center gap-3 text-xs">
                <img src={item.thumbnail} alt="" className="w-10 h-10 rounded-xl object-cover bg-gray-50 border border-border flex-shrink-0" />
                <div className="flex-1 min-w-0">
                  <p className="font-bold text-gray-800 truncate">{item.title}</p>
                  <p className="text-gray-400">{item.quantity} × {formatPrice(item.price)}</p>
                </div>
                <span className="font-black text-gray-900">{formatPrice(item.price * item.quantity)}</span>
              </div>
            ))}
          </div>

          <div className="border-t border-gray-100 pt-3 space-y-2 text-xs">
            <div className="flex justify-between text-gray-500">
              <span>Người nhận:</span>
              <span className="font-bold text-gray-900 truncate max-w-[130px]">{effectiveInfo.name || "Chưa điền"}</span>
            </div>
            <div className="flex justify-between text-gray-500">
              <span>Số điện thoại:</span>
              <span className="font-bold text-gray-900">{effectiveInfo.phone || "Chưa điền"}</span>
            </div>
            <div className="flex justify-between text-gray-900 font-black text-base pt-3 border-t border-gray-100">
              <span>Tổng cộng:</span>
              <span className="text-accent">{formatPrice(total)}</span>
            </div>
          </div>
        </div>

      </div>
    </div>
  );
}

export default function CheckoutPage() {
  return (
    <ProtectedRoute>
      <CheckoutContent />
    </ProtectedRoute>
  );
}
