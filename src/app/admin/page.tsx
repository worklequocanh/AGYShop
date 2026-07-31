"use client";

import React, { useState, useEffect } from "react";
import { useRouter } from "next/navigation";
import {
  ShieldCheck, RefreshCw, Package, ShoppingBag, Plus, Trash2, Edit3,
  DollarSign, Database, CheckCircle2, FileText, Mail, MessageSquare,
  BarChart3, Check, X, Search, Filter, Clock
} from "lucide-react";
import { useAuth } from "@/context/AuthContext";
import { useCurrency } from "@/context/CurrencyContext";
import { useToast } from "@/context/ToastContext";
import { ProtectedRoute } from "@/components/ProtectedRoute";
import { BillInvoiceModal } from "@/components/BillInvoiceModal";
import { AdminAnalyticsCharts } from "@/components/AdminAnalyticsCharts";

function AdminContent() {
  const router = useRouter();
  const { user } = useAuth();
  const { formatPrice } = useCurrency();
  const { showToast } = useToast();

  const [activeTab, setActiveTab] = useState<"analytics" | "products" | "orders" | "messages">("analytics");
  const [seeding, setSeeding] = useState(false);
  
  // Data states
  const [orders, setOrders] = useState<any[]>([]);
  const [products, setProducts] = useState<any[]>([]);
  const [messages, setMessages] = useState<any[]>([]);
  const [productsCount, setProductsCount] = useState(0);
  const [loading, setLoading] = useState(true);

  // Selected Order for Bill Modal
  const [selectedOrder, setSelectedOrder] = useState<any | null>(null);
  const [isBillOpen, setIsBillOpen] = useState(false);

  // Modal Create / Edit Product
  const [isProductModalOpen, setIsProductModalOpen] = useState(false);
  const [editingProduct, setEditingProduct] = useState<any | null>(null);
  const [prodTitle, setProdTitle] = useState("");
  const [prodPrice, setProdPrice] = useState("");
  const [prodCategory, setProdCategory] = useState("laptops");
  const [prodStock, setProdStock] = useState("15");
  const [prodBrand, setProdBrand] = useState("AGYShop");
  const [prodThumbnail, setProdThumbnail] = useState("");
  const [prodDescription, setProdDescription] = useState("");

  // Product Search / Filter
  const [productSearch, setProductSearch] = useState("");

  const fetchAdminData = async () => {
    setLoading(true);
    try {
      const [ordRes, prodRes, msgRes] = await Promise.all([
        fetch("/api/orders?all=true"),
        fetch("/api/products?limit=50"),
        fetch("/api/contact"),
      ]);

      if (ordRes.ok) {
        const d = await ordRes.json();
        if (d.success) setOrders(d.orders);
      }
      if (prodRes.ok) {
        const d = await prodRes.json();
        if (d.success) {
          setProducts(d.products);
          setProductsCount(d.pagination?.total || d.products.length);
        }
      }
      if (msgRes.ok) {
        const d = await msgRes.json();
        if (d.success) setMessages(d.messages);
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

  // Toggle Order Payment Status
  const handleTogglePaymentStatus = async (orderId: string, currentStatus: string) => {
    const newStatus = currentStatus === "paid" ? "unpaid" : "paid";
    try {
      const res = await fetch(`/api/orders/${orderId}`, {
        method: "PUT",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ paymentStatus: newStatus, isPaid: newStatus === "paid" }),
      });
      const data = await res.json();
      if (data.success) {
        showToast(`Đã cập nhật trạng thái thanh toán đơn hàng sang: ${newStatus === "paid" ? "ĐÃ THANH TOÁN" : "CHỜ THANH TOÁN"}`, "success");
        fetchAdminData();
      } else {
        showToast("Lỗi: " + data.error, "error");
      }
    } catch {
      showToast("Lỗi cập nhật trạng thái đơn", "error");
    }
  };

  // Open Modal Create Product
  const handleOpenCreateProduct = () => {
    setEditingProduct(null);
    setProdTitle("");
    setProdPrice("");
    setProdCategory("laptops");
    setProdStock("15");
    setProdBrand("AGYShop");
    setProdThumbnail("https://cdn.dummyjson.com/product-images/1/thumbnail.jpg");
    setProdDescription("Sản phẩm công nghệ cao phân phối bởi AGYShop.");
    setIsProductModalOpen(true);
  };

  // Open Modal Edit Product
  const handleOpenEditProduct = (prod: any) => {
    setEditingProduct(prod);
    setProdTitle(prod.title);
    setProdPrice(prod.price?.toString() || "");
    setProdCategory(prod.category || "laptops");
    setProdStock(prod.stock?.toString() || "10");
    setProdBrand(prod.brand || "AGYShop");
    setProdThumbnail(prod.thumbnail || "");
    setProdDescription(prod.description || "");
    setIsProductModalOpen(true);
  };

  // Save Product (Create or Edit)
  const handleSaveProduct = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!prodTitle.trim() || !prodPrice.trim()) {
      showToast("Vui lòng nhập đầy đủ tên và giá sản phẩm", "error");
      return;
    }

    const payload = {
      title: prodTitle,
      price: parseFloat(prodPrice),
      category: prodCategory,
      stock: parseInt(prodStock || "10", 10),
      brand: prodBrand,
      thumbnail: prodThumbnail,
      description: prodDescription,
    };

    try {
      if (editingProduct) {
        // Edit Product
        const res = await fetch(`/api/products/${editingProduct.id}`, {
          method: "PUT",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify(payload),
        });
        const data = await res.json();
        if (data.success) {
          showToast("Đã cập nhật thông tin sản phẩm thành công!", "success");
          setIsProductModalOpen(false);
          fetchAdminData();
        } else {
          showToast("Lỗi cập nhật: " + data.error, "error");
        }
      } else {
        // Create Product
        const res = await fetch("/api/products", {
          method: "POST",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify(payload),
        });
        const data = await res.json();
        if (data.success) {
          showToast("Đã tạo sản phẩm mới thành công!", "success");
          setIsProductModalOpen(false);
          fetchAdminData();
        } else {
          showToast("Lỗi tạo sản phẩm: " + data.error, "error");
        }
      }
    } catch {
      showToast("Lỗi kết nối máy chủ", "error");
    }
  };

  // Delete Product
  const handleDeleteProduct = async (id: string, title: string) => {
    if (!confirm(`Bạn có chắc chắn muốn xóa sản phẩm "${title}" khỏi hệ thống?`)) return;
    try {
      const res = await fetch(`/api/products/${id}`, { method: "DELETE" });
      const data = await res.json();
      if (data.success) {
        showToast(`Đã xóa sản phẩm ${title} thành công`, "info");
        fetchAdminData();
      } else {
        showToast("Lỗi xóa sản phẩm: " + data.error, "error");
      }
    } catch {
      showToast("Lỗi xóa sản phẩm", "error");
    }
  };

  // Resolve Contact Message
  const handleResolveMessage = async (msgId: string) => {
    try {
      const res = await fetch("/api/contact", {
        method: "PATCH",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ id: msgId, status: "resolved" }),
      });
      const data = await res.json();
      if (data.success) {
        showToast("Đã đánh dấu lời nhắn là ĐÃ XỬ LÝ!", "success");
        fetchAdminData();
      } else {
        showToast("Lỗi: " + data.error, "error");
      }
    } catch {
      showToast("Lỗi cập nhật tin nhắn", "error");
    }
  };

  // Delete Contact Message
  const handleDeleteMessage = async (msgId: string) => {
    if (!confirm("Bạn có chắc chắn muốn xóa lời nhắn này?")) return;
    try {
      const res = await fetch(`/api/contact?id=${msgId}`, { method: "DELETE" });
      const data = await res.json();
      if (data.success) {
        showToast("Đã xóa tin nhắn thành công", "info");
        fetchAdminData();
      } else {
        showToast("Lỗi: " + data.error, "error");
      }
    } catch {
      showToast("Lỗi xóa tin nhắn", "error");
    }
  };

  if (user?.role !== "admin") {
    return (
      <div className="py-20 text-center space-y-4">
        <ShieldCheck className="w-12 h-12 text-rose-500 mx-auto" />
        <p className="font-bold text-gray-800">Quyền truy cập bị từ chối</p>
      </div>
    );
  }

  const filteredProducts = products.filter(
    (p) =>
      p.title.toLowerCase().includes(productSearch.toLowerCase()) ||
      p.category?.toLowerCase().includes(productSearch.toLowerCase())
  );

  const unreadMessagesCount = messages.filter((m) => m.status === "unread").length;

  return (
    <div className="space-y-8 pb-16 animate-fade-up">
      
      {/* Header */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 border-b border-border pb-5">
        <div>
          <div className="flex items-center gap-2">
            <span className="bg-gray-900 text-white text-[10px] font-black px-2.5 py-1 rounded-md uppercase tracking-widest">
              ADMIN DASHBOARD 2.0
            </span>
            <h1 className="text-2xl sm:text-3xl font-black text-gray-900">Trung Tâm Quản Trị</h1>
          </div>
          <p className="text-sm text-gray-500 mt-1">
            Báo cáo Analytics doanh thu, Quản lý sản phẩm MongoDB & Xử lý tin nhắn khách hàng.
          </p>
        </div>

        <div className="flex items-center gap-2">
          <button
            onClick={fetchAdminData}
            className="p-2.5 bg-white border border-border text-gray-700 hover:bg-gray-50 rounded-xl transition-colors shadow-xs"
            title="Tải lại dữ liệu"
          >
            <RefreshCw className="w-4 h-4" />
          </button>
          <button
            onClick={handleSeedDB}
            disabled={seeding}
            className="inline-flex items-center gap-2 bg-gray-900 hover:bg-gray-700 text-white font-bold text-xs px-5 py-2.5 rounded-xl transition-all shadow-sm disabled:opacity-50"
          >
            <Database className="w-4 h-4 text-amber-400" />
            {seeding ? "Đang nạp DB..." : "Nạp Dữ Liệu DummyJSON (Seed)"}
          </button>
        </div>
      </div>

      {/* Navigation Tabs */}
      <div className="flex flex-wrap items-center gap-2 border-b border-border pb-3">
        {[
          { id: "analytics", label: "📊 Analytics Doanh Thu", icon: BarChart3 },
          { id: "products", label: `📦 Quản Lý Sản Phẩm (${productsCount})`, icon: Package },
          { id: "orders", label: `💳 Quản Lý Đơn Hàng (${orders.length})`, icon: ShoppingBag },
          { id: "messages", label: `📩 Lời Nhắn Khách Hàng (${messages.length})`, badge: unreadMessagesCount, icon: MessageSquare },
        ].map((tab) => (
          <button
            key={tab.id}
            onClick={() => setActiveTab(tab.id as any)}
            className={`flex items-center gap-2 px-4 py-2.5 rounded-2xl text-xs font-bold transition-all relative ${
              activeTab === tab.id
                ? "bg-gray-900 text-white shadow-md"
                : "bg-white border border-border text-gray-600 hover:bg-gray-100"
            }`}
          >
            <tab.icon className="w-4 h-4" />
            {tab.label}
            {tab.badge !== undefined && tab.badge > 0 && (
              <span className="ml-1 bg-rose-500 text-white text-[10px] font-black px-1.5 py-0.5 rounded-full animate-pulse">
                {tab.badge}
              </span>
            )}
          </button>
        ))}
      </div>

      {/* TAB 1: VISUAL ANALYTICS CHARTS */}
      {activeTab === "analytics" && (
        <AdminAnalyticsCharts orders={orders} productsCount={productsCount} />
      )}

      {/* TAB 2: PRODUCT MANAGEMENT */}
      {activeTab === "products" && (
        <div className="bg-white border border-border rounded-3xl p-6 shadow-sm space-y-6">
          <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4 border-b border-border pb-4">
            <div>
              <h3 className="font-black text-lg text-gray-900">Danh Sách Sản Phẩm Trong MongoDB</h3>
              <p className="text-xs text-gray-500">Thêm mới, chỉnh sửa giá/kho hàng hoặc xóa sản phẩm khỏi Cửa hàng</p>
            </div>
            
            <div className="flex items-center gap-3 w-full sm:w-auto">
              <div className="relative flex-1 sm:w-64">
                <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-gray-400" />
                <input
                  type="text"
                  placeholder="Tìm sản phẩm..."
                  value={productSearch}
                  onChange={(e) => setProductSearch(e.target.value)}
                  className="w-full pl-9 pr-3 py-2 text-xs bg-gray-50 border border-border rounded-xl font-medium focus:outline-none focus:border-accent"
                />
              </div>

              <button
                onClick={handleOpenCreateProduct}
                className="bg-gray-900 hover:bg-gray-800 text-white font-extrabold text-xs px-4 py-2 rounded-xl transition-all shadow-sm flex items-center gap-1.5 whitespace-nowrap"
              >
                <Plus className="w-4 h-4 text-amber-400" /> Thêm Sản Phẩm Mới
              </button>
            </div>
          </div>

          {/* Product Table */}
          <div className="overflow-x-auto border border-border rounded-2xl">
            <table className="w-full text-left text-xs">
              <thead>
                <tr className="bg-gray-50 text-gray-400 font-bold uppercase text-[10px] tracking-widest">
                  <th className="px-4 py-3">Ảnh</th>
                  <th className="px-4 py-3">Tên sản phẩm</th>
                  <th className="px-4 py-3">Danh mục</th>
                  <th className="px-4 py-3">Giá bán</th>
                  <th className="px-4 py-3 text-center">Tồn kho</th>
                  <th className="px-4 py-3 text-center">Thao tác</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-gray-100 font-medium text-gray-700">
                {filteredProducts.map((prod) => (
                  <tr key={prod.id || prod._id} className="hover:bg-gray-50 transition-colors">
                    <td className="px-4 py-3">
                      <div className="w-10 h-10 rounded-xl bg-gray-50 border border-border overflow-hidden p-1">
                        <img src={prod.thumbnail} alt={prod.title} className="w-full h-full object-contain" />
                      </div>
                    </td>
                    <td className="px-4 py-3">
                      <p className="font-bold text-gray-900 max-w-xs truncate">{prod.title}</p>
                      <p className="text-[10px] text-gray-400">Hãng: {prod.brand || "N/A"}</p>
                    </td>
                    <td className="px-4 py-3">
                      <span className="bg-gray-100 text-gray-700 text-[10px] font-bold px-2 py-0.5 rounded-md capitalize">
                        {prod.category}
                      </span>
                    </td>
                    <td className="px-4 py-3 font-black text-gray-900">{formatPrice(prod.price)}</td>
                    <td className="px-4 py-3 text-center">
                      <span className={`font-bold px-2 py-0.5 rounded-md text-[11px] ${
                        prod.stock === 0 ? "bg-rose-100 text-rose-600" : "bg-emerald-100 text-emerald-700"
                      }`}>
                        {prod.stock || 0} món
                      </span>
                    </td>
                    <td className="px-4 py-3 text-center">
                      <div className="flex items-center justify-center gap-1">
                        <button
                          onClick={() => handleOpenEditProduct(prod)}
                          className="p-1.5 text-gray-600 hover:text-accent hover:bg-blue-50 rounded-lg transition-colors"
                          title="Sửa sản phẩm"
                        >
                          <Edit3 className="w-4 h-4" />
                        </button>
                        <button
                          onClick={() => handleDeleteProduct(prod.id || prod._id, prod.title)}
                          className="p-1.5 text-gray-400 hover:text-rose-600 hover:bg-rose-50 rounded-lg transition-colors"
                          title="Xóa sản phẩm"
                        >
                          <Trash2 className="w-4 h-4" />
                        </button>
                      </div>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </div>
      )}

      {/* TAB 3: ORDER MANAGEMENT */}
      {activeTab === "orders" && (
        <div className="bg-white border border-border rounded-3xl p-6 shadow-sm space-y-4">
          <div className="flex items-center justify-between border-b border-border pb-4">
            <div>
              <h3 className="font-black text-lg text-gray-900">Quản Lý Tất Cả Đơn Hàng Khách Hàng</h3>
              <p className="text-xs text-gray-500">Duyệt thanh toán, chuyển trạng thái giao hàng và in bill PDF</p>
            </div>
          </div>

          <div className="overflow-x-auto border border-border rounded-2xl">
            <table className="w-full text-left text-xs">
              <thead>
                <tr className="bg-gray-50 text-gray-400 font-bold uppercase tracking-widest text-[10px]">
                  <th className="px-5 py-3.5">Mã Đơn</th>
                  <th className="px-5 py-3.5">Khách Hàng</th>
                  <th className="px-5 py-3.5">Ngày Đặt</th>
                  <th className="px-5 py-3.5">Thanh Toán</th>
                  <th className="px-5 py-3.5">Tổng Tiền</th>
                  <th className="px-5 py-3.5 text-center">Hóa Đơn / Bill</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-gray-100 font-medium text-gray-700">
                {orders.map((o) => {
                  const isPaid = o.paymentStatus === "paid" || o.isPaid;
                  return (
                    <tr key={o._id} className="hover:bg-gray-50 transition-colors">
                      <td className="px-5 py-4 font-mono font-bold text-gray-900">#{o.orderCode || o.id}</td>
                      <td className="px-5 py-4">
                        <p className="font-bold text-gray-800">@{o.username || "khach"}</p>
                        <p className="text-[10px] text-gray-400">{o.shippingAddress?.name || "N/A"}</p>
                      </td>
                      <td className="px-5 py-4 text-gray-500">{new Date(o.createdAt).toLocaleDateString("vi-VN")}</td>
                      <td className="px-5 py-4">
                        <button
                          onClick={() => handleTogglePaymentStatus(o._id, o.paymentStatus)}
                          className={`text-[10px] font-extrabold px-3 py-1 rounded-full uppercase transition-transform active:scale-95 flex items-center gap-1 ${
                            isPaid ? "bg-emerald-100 text-emerald-800 border border-emerald-300" : "bg-amber-100 text-amber-800 border border-amber-300"
                          }`}
                          title="Bấm để đổi trạng thái thanh toán"
                        >
                          <CheckCircle2 className="w-3 h-3" />
                          {o.paymentMethod || "vietqr"} • {isPaid ? "Đã trả" : "Chờ"}
                        </button>
                      </td>
                      <td className="px-5 py-4 font-black text-gray-900">{formatPrice(o.totalAmount)}</td>
                      <td className="px-5 py-4 text-center">
                        <button
                          onClick={() => handleOpenBill(o)}
                          className="inline-flex items-center gap-1 bg-gray-900 hover:bg-gray-800 text-white font-bold text-[11px] px-3 py-1.5 rounded-xl transition-all shadow-sm"
                        >
                          <FileText className="w-3.5 h-3.5 text-amber-400" /> Xem Bill & Timeline
                        </button>
                      </td>
                    </tr>
                  );
                })}
              </tbody>
            </table>
          </div>
        </div>
      )}

      {/* TAB 4: CONTACT MESSAGES */}
      {activeTab === "messages" && (
        <div className="bg-white border border-border rounded-3xl p-6 shadow-sm space-y-4">
          <div className="flex items-center justify-between border-b border-border pb-4">
            <div>
              <h3 className="font-black text-lg text-gray-900 flex items-center gap-2">
                <Mail className="w-5 h-5 text-accent" /> Tin Nhắn Khách Hàng Gửi Từ Form Liên Hệ
              </h3>
              <p className="text-xs text-gray-500">Danh sách phản hồi lưu trực tiếp trong MongoDB Atlas</p>
            </div>
          </div>

          {messages.length === 0 ? (
            <div className="p-12 text-center text-sm text-gray-400">Chưa có tin nhắn liên hệ nào.</div>
          ) : (
            <div className="overflow-x-auto border border-border rounded-2xl">
              <table className="w-full text-left text-xs">
                <thead>
                  <tr className="bg-gray-50 text-gray-400 font-bold uppercase tracking-widest text-[10px]">
                    <th className="px-5 py-3.5">Người gửi</th>
                    <th className="px-5 py-3.5">Liên hệ</th>
                    <th className="px-5 py-3.5">Chủ đề & Nội dung</th>
                    <th className="px-5 py-3.5">Trạng thái</th>
                    <th className="px-5 py-3.5 text-center">Thao tác</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-gray-100 font-medium text-gray-700">
                  {messages.map((m) => {
                    const isResolved = m.status === "resolved";
                    return (
                      <tr key={m._id} className="hover:bg-gray-50 transition-colors">
                        <td className="px-5 py-4 font-bold text-gray-900">{m.name}</td>
                        <td className="px-5 py-4 text-xs space-y-0.5">
                          <p className="text-gray-800 font-semibold">{m.email}</p>
                          <p className="text-gray-400 text-[11px]">{m.phone}</p>
                        </td>
                        <td className="px-5 py-4 max-w-sm">
                          <p className="font-bold text-accent">{m.subject}</p>
                          <p className="text-gray-600 text-xs mt-1 leading-snug">{m.message}</p>
                        </td>
                        <td className="px-5 py-4">
                          <span className={`text-[10px] font-black px-2.5 py-1 rounded-full uppercase ${
                            isResolved ? "bg-emerald-100 text-emerald-700" : "bg-rose-100 text-rose-700"
                          }`}>
                            {isResolved ? "Đã xử lý" : "Tin mới"}
                          </span>
                        </td>
                        <td className="px-5 py-4 text-center">
                          <div className="flex items-center justify-center gap-1.5">
                            {!isResolved && (
                              <button
                                onClick={() => handleResolveMessage(m._id)}
                                className="bg-emerald-600 hover:bg-emerald-700 text-white font-bold text-[10px] px-2.5 py-1.5 rounded-lg transition-colors shadow-xs"
                              >
                                Đã xử lý
                              </button>
                            )}
                            <button
                              onClick={() => handleDeleteMessage(m._id)}
                              className="p-1.5 text-gray-400 hover:text-rose-600 hover:bg-rose-50 rounded-lg transition-colors"
                              title="Xóa tin nhắn"
                            >
                              <Trash2 className="w-4 h-4" />
                            </button>
                          </div>
                        </td>
                      </tr>
                    );
                  })}
                </tbody>
              </table>
            </div>
          )}
        </div>
      )}

      {/* CREATE / EDIT PRODUCT MODAL */}
      {isProductModalOpen && (
        <div className="fixed inset-0 z-[9999] bg-black/50 backdrop-blur-xs flex items-center justify-center p-4">
          <div className="bg-white border border-border rounded-3xl shadow-2xl w-full max-w-lg p-6 space-y-4 animate-fade-up">
            <div className="flex items-center justify-between border-b border-border pb-3">
              <h3 className="font-black text-base text-gray-900">
                {editingProduct ? "Chỉnh Sửa Sản Phẩm" : "Thêm Sản Phẩm Mới Vào MongoDB"}
              </h3>
              <button onClick={() => setIsProductModalOpen(false)} className="p-1.5 text-gray-400 hover:text-gray-600 rounded-lg">
                <X className="w-4.5 h-4.5" />
              </button>
            </div>

            <form onSubmit={handleSaveProduct} className="space-y-3.5 text-xs">
              <div>
                <label className="block text-[10px] font-bold uppercase text-gray-400 mb-1">Tên sản phẩm</label>
                <input
                  type="text"
                  value={prodTitle}
                  onChange={(e) => setProdTitle(e.target.value)}
                  placeholder="Ví dụ: Laptop Dell XPS 15"
                  className="w-full p-3 bg-gray-50 border border-border rounded-xl font-medium focus:outline-none focus:border-accent text-gray-900"
                  required
                />
              </div>

              <div className="grid grid-cols-2 gap-3">
                <div>
                  <label className="block text-[10px] font-bold uppercase text-gray-400 mb-1">Giá ($ USD)</label>
                  <input
                    type="number"
                    step="0.01"
                    value={prodPrice}
                    onChange={(e) => setProdPrice(e.target.value)}
                    placeholder="999.99"
                    className="w-full p-3 bg-gray-50 border border-border rounded-xl font-medium focus:outline-none focus:border-accent text-gray-900"
                    required
                  />
                </div>
                <div>
                  <label className="block text-[10px] font-bold uppercase text-gray-400 mb-1">Số lượng kho</label>
                  <input
                    type="number"
                    value={prodStock}
                    onChange={(e) => setProdStock(e.target.value)}
                    placeholder="20"
                    className="w-full p-3 bg-gray-50 border border-border rounded-xl font-medium focus:outline-none focus:border-accent text-gray-900"
                    required
                  />
                </div>
              </div>

              <div className="grid grid-cols-2 gap-3">
                <div>
                  <label className="block text-[10px] font-bold uppercase text-gray-400 mb-1">Danh mục</label>
                  <input
                    type="text"
                    value={prodCategory}
                    onChange={(e) => setProdCategory(e.target.value)}
                    placeholder="laptops / smartphones"
                    className="w-full p-3 bg-gray-50 border border-border rounded-xl font-medium focus:outline-none focus:border-accent text-gray-900"
                    required
                  />
                </div>
                <div>
                  <label className="block text-[10px] font-bold uppercase text-gray-400 mb-1">Thương hiệu</label>
                  <input
                    type="text"
                    value={prodBrand}
                    onChange={(e) => setProdBrand(e.target.value)}
                    placeholder="Apple / Samsung / AGY"
                    className="w-full p-3 bg-gray-50 border border-border rounded-xl font-medium focus:outline-none focus:border-accent text-gray-900"
                  />
                </div>
              </div>

              <div>
                <label className="block text-[10px] font-bold uppercase text-gray-400 mb-1">Link Ảnh Sản Phẩm (Thumbnail URL)</label>
                <input
                  type="text"
                  value={prodThumbnail}
                  onChange={(e) => setProdThumbnail(e.target.value)}
                  placeholder="https://..."
                  className="w-full p-3 bg-gray-50 border border-border rounded-xl font-medium focus:outline-none focus:border-accent text-gray-900"
                />
              </div>

              <div>
                <label className="block text-[10px] font-bold uppercase text-gray-400 mb-1">Mô tả sản phẩm</label>
                <textarea
                  rows={3}
                  value={prodDescription}
                  onChange={(e) => setProdDescription(e.target.value)}
                  placeholder="Nhập mô tả sản phẩm..."
                  className="w-full p-3 bg-gray-50 border border-border rounded-xl font-medium focus:outline-none focus:border-accent text-gray-900 resize-none"
                />
              </div>

              <div className="pt-2 flex justify-end gap-2">
                <button
                  type="button"
                  onClick={() => setIsProductModalOpen(false)}
                  className="px-4 py-2.5 bg-gray-100 text-gray-700 font-bold rounded-xl hover:bg-gray-200"
                >
                  Hủy
                </button>
                <button
                  type="submit"
                  className="px-6 py-2.5 bg-gray-900 hover:bg-gray-800 text-white font-extrabold rounded-xl shadow-md"
                >
                  Lưu Sản Phẩm
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

      {/* BILL INVOICE MODAL */}
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
