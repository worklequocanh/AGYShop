"use client";

import React, { useState, useEffect } from "react";
import Link from "next/link";
import { useRouter } from "next/navigation";
import {
  ShieldCheck, RefreshCw, Package, ShoppingBag,
  Users, DollarSign, Database, CheckCircle, ArrowUpRight, FileText
} from "lucide-react";
import { useAuth } from "@/context/AuthContext";
import { useCurrency } from "@/context/CurrencyContext";
import { useToast } from "@/context/ToastContext";
import { ProtectedRoute } from "@/components/ProtectedRoute";
import { BillInvoiceModal } from "@/components/BillInvoiceModal";

function AdminContent() {
  const router = useRouter();
  const { user } = useAuth();
  const { formatPrice } = useCurrency();
  const { showToast } = useToast();

  const [seeding, setSeeding] = useState(false);
  const [orders, setOrders] = useState<any[]>([]);
  const [productsCount, setProductsCount] = useState(0);
  const [categoriesCount, setCategoriesCount] = useState(0);
  const [loading, setLoading] = useState(true);

  // Selected Order for Bill Modal
  const [selectedOrder, setSelectedOrder] = useState<any | null>(null);
  const [isBillOpen, setIsBillOpen] = useState(false);

  const fetchAdminData = async () => {
    setLoading(true);
    try {
      const [ordRes, prodRes, catRes] = await Promise.all([
        fetch("/api/orders?all=true"),
        fetch("/api/products?limit=1"),
        fetch("/api/categories"),
      ]);

      if (ordRes.ok) {
        const d = await ordRes.json();
        if (d.success) setOrders(d.orders);
      }
      if (prodRes.ok) {
        const d = await prodRes.json();
        if (d.success) setProductsCount(d.pagination?.total || 0);
      }
      if (catRes.ok) {
        const d = await catRes.json();
        if (d.success) setCategoriesCount(d.categories?.length || 0);
      }
    } catch {} finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    if (user && user.role !== "admin") {
      showToast("Chỉ tài khoản Admin mới có quyền truy cập trang này", "error");
      router.replace("/");
      return;
    }
    fetchAdminData();
  }, [user]);

  const handleSeedDB = async () => {
    setSeeding(true);
    showToast("Đang nạp dữ liệu từ DummyJSON API vào MongoDB...", "info");
    try {
      const res = await fetch("/api/seed");
      const data = await res.json();
      if (data.success) {
        showToast("Nạp dữ liệu thành công! Đã nạp danh mục và sản phẩm.", "success");
        fetchAdminData();
      } else {
        showToast("Lỗi nạp DB: " + data.error, "error");
      }
    } catch {
      showToast("Lỗi kết nối máy chủ", "error");
    } finally {
      setSeeding(false);
    }
  };

  const handleOpenBill = (order: any) => {
    setSelectedOrder(order);
    setIsBillOpen(true);
  };

  if (user?.role !== "admin") {
    return (
      <div className="py-20 text-center space-y-4">
        <ShieldCheck className="w-12 h-12 text-rose-500 mx-auto" />
        <p className="font-bold text-gray-800">Quyền truy cập bị từ chối</p>
      </div>
    );
  }

  const totalRevenue = orders.reduce((sum, o) => sum + (o.totalAmount || 0), 0);

  return (
    <div className="space-y-8 pb-16">
      
      {/* Header */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 border-b border-gray-200 pb-5">
        <div>
          <div className="flex items-center gap-2">
            <span className="bg-gray-900 text-white text-[10px] font-black px-2.5 py-1 rounded-md uppercase tracking-widest">
              ADMIN PANEL
            </span>
            <h1 className="text-2xl sm:text-3xl font-black text-gray-900">Quản Trị Hệ Thống</h1>
          </div>
          <p className="text-sm text-gray-500 mt-1">
            Quản lý dữ liệu MongoDB, đơn hàng toàn bộ khách hàng và danh mục sản phẩm.
          </p>
        </div>

        <button
          onClick={handleSeedDB}
          disabled={seeding}
          className="inline-flex items-center gap-2 bg-gray-900 hover:bg-gray-700 text-white font-bold text-sm px-5 py-2.5 rounded-xl transition-colors disabled:opacity-50 shadow-sm"
        >
          <Database className="w-4 h-4 text-amber-400" />
          {seeding ? "Đang nạp DB..." : "Nạp Dữ Liệu MongoDB (1-Click Seed)"}
        </button>
      </div>

      {/* Overview Stats */}
      <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
        {[
          { label: "Tổng đơn hàng", val: orders.length, icon: ShoppingBag, color: "text-blue-600 bg-blue-50" },
          { label: "Doanh thu", val: formatPrice(totalRevenue), icon: DollarSign, color: "text-emerald-600 bg-emerald-50" },
          { label: "Sản phẩm DB", val: productsCount, icon: Package, color: "text-purple-600 bg-purple-50" },
          { label: "Danh mục DB", val: categoriesCount, icon: Database, color: "text-amber-600 bg-amber-50" },
        ].map((s) => (
          <div key={s.label} className="bg-white border border-border rounded-2xl p-5 shadow-sm space-y-2">
            <div className="flex items-center justify-between">
              <span className="text-xs font-bold text-gray-400 uppercase tracking-widest">{s.label}</span>
              <div className={`w-8 h-8 rounded-xl flex items-center justify-center ${s.color}`}>
                <s.icon className="w-4 h-4" />
              </div>
            </div>
            <p className="text-2xl font-black text-gray-900">{s.val}</p>
          </div>
        ))}
      </div>

      {/* Orders Table */}
      <div className="bg-white border border-border rounded-2xl overflow-hidden shadow-sm space-y-4">
        <div className="px-6 py-4 border-b border-gray-100 flex items-center justify-between">
          <div>
            <h3 className="font-bold text-base text-gray-900">Tất Cả Đơn Hàng Khách Hàng</h3>
            <p className="text-xs text-gray-500">Danh sách đơn hàng lưu trong MongoDB Atlas</p>
          </div>
          <button onClick={fetchAdminData} className="p-2 text-gray-400 hover:text-gray-600 rounded-lg hover:bg-gray-50">
            <RefreshCw className="w-4 h-4" />
          </button>
        </div>

        {loading ? (
          <div className="p-12 text-center text-sm text-gray-400 animate-pulse">Đang nạp đơn hàng...</div>
        ) : orders.length === 0 ? (
          <div className="p-12 text-center space-y-3">
            <ShoppingBag className="w-10 h-10 text-gray-200 mx-auto" />
            <p className="text-sm text-gray-500">Chưa có đơn hàng nào trong hệ thống.</p>
          </div>
        ) : (
          <div className="overflow-x-auto">
            <table className="w-full text-left text-xs">
              <thead>
                <tr className="bg-gray-50 text-gray-400 font-bold uppercase tracking-widest text-[10px]">
                  <th className="px-6 py-3">Mã Đơn</th>
                  <th className="px-6 py-3">Khách Hàng</th>
                  <th className="px-6 py-3">Ngày Đặt</th>
                  <th className="px-6 py-3">Thanh Toán</th>
                  <th className="px-6 py-3">Tổng Tiền</th>
                  <th className="px-6 py-3 text-center">In / Xem Bill</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-gray-100 font-medium text-gray-700">
                {orders.map((o) => (
                  <tr key={o._id} className="hover:bg-gray-50 transition-colors">
                    <td className="px-6 py-4 font-mono font-bold text-gray-900">{o.orderCode}</td>
                    <td className="px-6 py-4">
                      <p className="font-bold text-gray-800">@{o.username}</p>
                      <p className="text-[10px] text-gray-400">{o.shippingAddress?.name || "N/A"}</p>
                    </td>
                    <td className="px-6 py-4 text-gray-500">{new Date(o.createdAt).toLocaleDateString("vi-VN")}</td>
                    <td className="px-6 py-4">
                      <span className={`text-[10px] font-bold px-2.5 py-1 rounded-full uppercase ${
                        o.paymentStatus === "paid" ? "bg-emerald-100 text-emerald-700" : "bg-amber-100 text-amber-700"
                      }`}>
                        {o.paymentMethod} • {o.paymentStatus === "paid" ? "Đã trả" : "Chờ"}
                      </span>
                    </td>
                    <td className="px-6 py-4 font-black text-gray-900">{formatPrice(o.totalAmount)}</td>
                    <td className="px-6 py-4 text-center">
                      <button
                        onClick={() => handleOpenBill(o)}
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

      {/* Bill Invoice Modal */}
      <BillInvoiceModal
        order={selectedOrder}
        isOpen={isBillOpen}
        onClose={() => setIsBillOpen(false)}
      />

    </div>
  );
}

export default function AdminPage() {
  return (
    <ProtectedRoute>
      <AdminContent />
    </ProtectedRoute>
  );
}
