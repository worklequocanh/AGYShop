"use client";

import React, { useState, useEffect } from "react";
import Link from "next/link";
import { User, ShoppingBag, Eye, LogOut, Save, FileText, CheckCircle2, ShieldCheck } from "lucide-react";
import { useAuth } from "@/context/AuthContext";
import { useCurrency } from "@/context/CurrencyContext";
import { useToast } from "@/context/ToastContext";
import { ProtectedRoute } from "@/components/ProtectedRoute";
import { BillInvoiceModal } from "@/components/BillInvoiceModal";

const inputCls = "w-full text-xs p-3 bg-gray-50 border border-border rounded-xl focus:outline-none focus:border-accent text-gray-900 font-medium transition-all";
const labelCls = "block text-[10px] font-extrabold uppercase tracking-widest text-gray-500 mb-1";

function ProfileContent() {
  const { user, logout, refreshUser } = useAuth();
  const { formatPrice } = useCurrency();
  const { showToast } = useToast();

  const [orders, setOrders] = useState<any[]>([]);
  const [ordersLoading, setOrdersLoading] = useState(true);
  const [saving, setSaving] = useState(false);

  // Selected Order for Bill Modal
  const [selectedOrder, setSelectedOrder] = useState<any | null>(null);
  const [isBillOpen, setIsBillOpen] = useState(false);

  // Profile Form state
  const [firstName, setFirstName] = useState("");
  const [lastName, setLastName] = useState("");
  const [phone, setPhone] = useState("");
  const [address, setAddress] = useState("");

  useEffect(() => {
    if (!user) return;
    setFirstName(user.firstName || "");
    setLastName(user.lastName || "");
    setPhone(user.phone || "");
    setAddress(user.address || "");

    (async () => {
      setOrdersLoading(true);
      try {
        const res = await fetch(`/api/orders?username=${user.username}`);
        const data = await res.json();
        if (data.success) setOrders(data.orders);
      } catch {} finally { setOrdersLoading(false); }
    })();
  }, [user]);

  const handleSaveProfile = async (e: React.FormEvent) => {
    e.preventDefault();
    setSaving(true);
    try {
      const res = await fetch("/api/auth/me", {
        method: "PUT",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ firstName, lastName, phone, address }),
      });
      const data = await res.json();
      if (data.success) {
        showToast("Cập nhật thông tin tài khoản thành công!", "success");
        if (refreshUser) refreshUser();
      } else {
        showToast(data.error || "Lỗi cập nhật hồ sơ", "error");
      }
    } catch {
      showToast("Lỗi kết nối máy chủ", "error");
    } finally {
      setSaving(false);
    }
  };

  const handleOpenBill = (order: any) => {
    setSelectedOrder(order);
    setIsBillOpen(true);
  };

  if (!user) return null;

  return (
    <div className="space-y-8 pb-16 animate-fade-up">

      {/* Title */}
      <div className="border-b border-border pb-5">
        <h1 className="text-2xl sm:text-3xl font-black text-gray-900">Quản Lý Tài Khoản & Đơn Hàng</h1>
        <p className="text-sm text-gray-500 mt-1">Cập nhật thông tin giao hàng mặc định và theo dõi lịch sử mua hàng.</p>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-12 gap-8 items-start">

        {/* Column 1: Account Avatar & Basic Status */}
        <div className="lg:col-span-4 space-y-6">
          <div className="bg-white border border-border rounded-3xl p-6 shadow-sm space-y-5 text-center">
            <div className="w-24 h-24 rounded-3xl border-2 border-border overflow-hidden mx-auto bg-gray-100 shadow-sm relative">
              {user.image ? (
                <img src={user.image} alt={user.username} className="w-full h-full object-cover" />
              ) : (
                <div className="w-full h-full flex items-center justify-center bg-blue-50">
                  <User className="w-10 h-10 text-accent" />
                </div>
              )}
            </div>

            <div>
              <h3 className="font-black text-gray-900 text-xl">{user.firstName} {user.lastName}</h3>
              <p className="text-xs text-gray-400 font-mono mt-0.5">@{user.username}</p>
              <div className="mt-2">
                <span className={`text-[10px] font-extrabold px-3 py-1 rounded-full uppercase tracking-widest ${
                  user.role === "admin" ? "bg-amber-100 text-amber-800" : "bg-blue-50 text-accent"
                }`}>
                  {user.role === "admin" ? "🛡️ Quản Trị Viên (Admin)" : "👤 Khách Hàng Thành Viên"}
                </span>
              </div>
            </div>

            <div className="border-t border-gray-100 pt-4 space-y-2.5 text-xs text-left">
              <div className="flex justify-between text-gray-500">
                <span>Email tài khoản:</span>
                <span className="font-bold text-gray-900 truncate max-w-[140px]">{user.email}</span>
              </div>
              <div className="flex justify-between text-gray-500">
                <span>Trạng thái hồ sơ:</span>
                {user.phone && user.address ? (
                  <span className="font-bold text-emerald-600 flex items-center gap-1">
                    <CheckCircle2 className="w-3.5 h-3.5" /> Đã hoàn thiện
                  </span>
                ) : (
                  <span className="font-bold text-rose-500">Chưa đầy đủ</span>
                )}
              </div>
            </div>

            <button
              onClick={() => { logout(); showToast("Đã đăng xuất", "info"); }}
              className="w-full border border-rose-200 text-rose-600 hover:bg-rose-50 font-bold py-3 rounded-2xl flex items-center justify-center gap-2 transition-all text-xs"
            >
              <LogOut className="w-4 h-4" /> Đăng xuất tài khoản
            </button>
          </div>
        </div>

        {/* Column 2: Edit Form & Orders List */}
        <div className="lg:col-span-8 space-y-8">

          {/* Section: Update Profile Information & Address */}
          <div className="bg-white border border-border rounded-3xl p-6 sm:p-8 shadow-sm space-y-6">
            <div className="border-b border-border pb-4 flex items-center justify-between">
              <div>
                <h3 className="font-black text-lg text-gray-900 flex items-center gap-2">
                  <User className="w-5 h-5 text-accent" /> Cập Nhật Thông Tin Cá Nhân & Giao Hàng
                </h3>
                <p className="text-xs text-gray-500 mt-0.5">
                  Điền đầy đủ thông tin để tự động sử dụng khi Đặt hàng ở bước Thanh toán.
                </p>
              </div>
            </div>

            <form onSubmit={handleSaveProfile} className="space-y-4">
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                <div>
                  <label className={labelCls}>Họ</label>
                  <input
                    type="text"
                    value={lastName}
                    onChange={(e) => setLastName(e.target.value)}
                    placeholder="Nguyễn"
                    className={inputCls}
                    required
                  />
                </div>
                <div>
                  <label className={labelCls}>Tên</label>
                  <input
                    type="text"
                    value={firstName}
                    onChange={(e) => setFirstName(e.target.value)}
                    placeholder="Văn A"
                    className={inputCls}
                    required
                  />
                </div>
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

              <div>
                <label className={labelCls}>Địa chỉ nhận hàng (Ghi rõ số nhà, đường, quận/huyện, tỉnh/thành)</label>
                <input
                  type="text"
                  placeholder="Ví dụ: Số 123, Đường Nguyễn Huệ, Phường Bến Nghé, Quận 1, Hồ Chí Minh"
                  value={address}
                  onChange={(e) => setAddress(e.target.value)}
                  className={inputCls}
                  required
                />
              </div>

              <div className="pt-2 flex justify-end">
                <button
                  type="submit"
                  disabled={saving}
                  className="bg-gray-900 hover:bg-gray-800 text-white font-extrabold py-3.5 px-8 rounded-2xl text-xs flex items-center justify-center gap-2 transition-all shadow-md disabled:opacity-50"
                >
                  <Save className="w-4 h-4 text-amber-400" />
                  {saving ? "Đang lưu..." : "Lưu Thông Tin Cá Nhân"}
                </button>
              </div>
            </form>
          </div>

          {/* Section: Order History */}
          <div className="bg-white border border-border rounded-3xl overflow-hidden shadow-sm">
            <div className="px-6 py-5 border-b border-gray-100 flex items-center justify-between">
              <h3 className="font-black text-lg text-gray-900 flex items-center gap-2">
                <ShoppingBag className="w-5 h-5 text-accent" /> Lịch Sử Đơn Hàng ({orders.length})
              </h3>
            </div>

            {ordersLoading ? (
              <div className="p-12 text-center text-sm text-gray-400 animate-pulse">Đang nạp đơn hàng...</div>
            ) : orders.length === 0 ? (
              <div className="p-12 text-center space-y-3">
                <ShoppingBag className="w-10 h-10 text-gray-200 mx-auto" />
                <p className="text-sm text-gray-500">Bạn chưa có đơn hàng nào.</p>
                <Link href="/products" className="inline-block text-sm font-bold text-accent hover:underline">
                  Khám phá sản phẩm ngay →
                </Link>
              </div>
            ) : (
              <div className="overflow-x-auto">
                <table className="w-full text-left text-xs">
                  <thead>
                    <tr className="bg-gray-50 text-gray-400 font-bold uppercase tracking-widest text-[10px]">
                      <th className="px-6 py-3.5">Mã đơn</th>
                      <th className="px-6 py-3.5">Ngày đặt</th>
                      <th className="px-6 py-3.5 hidden md:table-cell">Sản phẩm</th>
                      <th className="px-6 py-3.5">Thanh toán</th>
                      <th className="px-6 py-3.5">Tổng tiền</th>
                      <th className="px-6 py-3.5 text-center">Xem Hóa Đơn</th>
                    </tr>
                  </thead>
                  <tbody className="divide-y divide-gray-100 font-medium text-gray-700">
                    {orders.map((order) => (
                      <tr key={order._id} className="hover:bg-gray-50 transition-colors">
                        <td className="px-6 py-4 font-mono font-bold text-gray-900">{order.orderCode}</td>
                        <td className="px-6 py-4 text-gray-500">{new Date(order.createdAt).toLocaleDateString("vi-VN")}</td>
                        <td className="px-6 py-4 text-gray-600 max-w-[180px] truncate hidden md:table-cell">
                          {order.items.map((i: any) => `${i.title} ×${i.quantity}`).join(", ")}
                        </td>
                        <td className="px-6 py-4">
                          <span className={`text-[10px] font-bold px-2.5 py-1 rounded-full uppercase ${
                            order.paymentStatus === "paid" ? "bg-emerald-100 text-emerald-700" : "bg-amber-100 text-amber-700"
                          }`}>
                            {order.paymentMethod} • {order.paymentStatus === "paid" ? "Đã trả" : "Chờ trả"}
                          </span>
                        </td>
                        <td className="px-6 py-4 font-black text-gray-900">{formatPrice(order.totalAmount)}</td>
                        <td className="px-6 py-4 text-center">
                          <button
                            onClick={() => handleOpenBill(order)}
                            className="inline-flex items-center gap-1 bg-gray-900 hover:bg-gray-800 text-white font-bold text-[11px] px-3 py-1.5 rounded-xl transition-all shadow-sm"
                          >
                            <FileText className="w-3.5 h-3.5 text-amber-400" /> Xem Bill
                          </button>
                        </td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>
            )}
          </div>

        </div>

      </div>

      {/* Bill Invoice Modal Panel */}
      <BillInvoiceModal
        order={selectedOrder}
        isOpen={isBillOpen}
        onClose={() => setIsBillOpen(false)}
      />
    </div>
  );
}

export default function ProfilePage() {
  return (
    <ProtectedRoute>
      <ProfileContent />
    </ProtectedRoute>
  );
}
