"use client";

import React, { useState, useEffect, useRef } from "react";
import Link from "next/link";
import { useRouter, usePathname } from "next/navigation";
import {
  Search, ShoppingBag, Heart, User, LogOut,
  ChevronDown, X, Menu, Package, ShieldCheck, Database
} from "lucide-react";
import { useAuth } from "@/context/AuthContext";
import { useCart } from "@/context/CartContext";
import { useWishlist } from "@/context/WishlistContext";
import { useCurrency } from "@/context/CurrencyContext";
import { useToast } from "@/context/ToastContext";
import { CartDrawer } from "./CartDrawer";

export function Header() {
  const router = useRouter();
  const pathname = usePathname();
  const { user, logout } = useAuth();
  const { cartItems } = useCart();
  const { wishlistItems } = useWishlist();
  const { currency, toggleCurrency, formatPrice } = useCurrency();
  const { showToast } = useToast();

  const [categories, setCategories] = useState<any[]>([]);
  const [mobileOpen, setMobileOpen] = useState(false);
  const [searchQuery, setSearchQuery] = useState("");
  const [searchResults, setSearchResults] = useState<any[]>([]);
  const [searchOpen, setSearchOpen] = useState(false);
  const [searching, setSearching] = useState(false);
  const [seeding, setSeeding] = useState(false);
  const searchRef = useRef<HTMLDivElement>(null);

  const cartCount = cartItems.reduce((a, i) => a + i.quantity, 0);

  const fetchCategories = async () => {
    try {
      const r = await fetch("/api/categories");
      if (!r.ok) return;
      const d = await r.json();
      if (d.success) setCategories(d.categories.slice(0, 10));
    } catch {}
  };

  useEffect(() => {
    fetchCategories();
  }, []);

  useEffect(() => {
    if (!searchQuery.trim()) { setSearchResults([]); return; }
    const t = setTimeout(async () => {
      setSearching(true);
      try {
        const r = await fetch(`/api/products?search=${encodeURIComponent(searchQuery)}&limit=5`);
        if (!r.ok) return;
        const d = await r.json();
        if (d.success) setSearchResults(d.products);
      } catch {} finally { setSearching(false); }
    }, 300);
    return () => clearTimeout(t);
  }, [searchQuery]);

  useEffect(() => {
    const fn = (e: MouseEvent) => {
      if (searchRef.current && !searchRef.current.contains(e.target as Node))
        setSearchOpen(false);
    };
    document.addEventListener("mousedown", fn);
    return () => document.removeEventListener("mousedown", fn);
  }, []);

  const handleSeedDB = async () => {
    setSeeding(true);
    showToast("Đang nạp dữ liệu từ DummyJSON API...", "info");
    try {
      const r = await fetch("/api/seed");
      const d = await r.json();
      if (d.success) {
        showToast("Nạp dữ liệu thành công! Đang tải lại...", "success");
        fetchCategories();
        setTimeout(() => location.reload(), 800);
      } else {
        showToast("Lỗi: " + d.error, "error");
      }
    } catch {
      showToast("Lỗi kết nối máy chủ", "error");
    } finally {
      setSeeding(false);
    }
  };

  const handleSearch = (e: React.FormEvent) => {
    e.preventDefault();
    if (!searchQuery.trim()) return;
    setSearchOpen(false);
    router.push(`/shop?q=${encodeURIComponent(searchQuery.trim())}`);
  };

  const isActive = (path: string) => {
    if (path === "/") return pathname === "/";
    return pathname.startsWith(path);
  };

  const getNavLinkClass = (path: string) => {
    const active = isActive(path);
    return `px-3.5 py-2 text-sm font-semibold rounded-xl transition-all duration-150 ${
      active
        ? "bg-gray-900 text-white shadow-sm"
        : "text-gray-700 hover:text-gray-900 hover:bg-gray-100"
    }`;
  };

  return (
    <>
      {/* ── Fixed Top Navbar Container ── */}
      <header className="fixed top-0 left-0 right-0 z-50 bg-white/95 backdrop-blur-md border-b border-border shadow-sm">
        
        {/* Top Announcement Bar */}
        <div className="bg-gray-900 text-white text-xs text-center py-1.5 px-4 font-medium tracking-wide">
          🚚 Miễn phí vận chuyển cho đơn hàng trên 500K &nbsp;|&nbsp; Đổi trả trong 30 ngày
        </div>

        {/* Main Header Bar */}
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="flex items-center h-16 gap-4">

            {/* Logo */}
            <Link href="/" className="flex items-center gap-2.5 flex-shrink-0 mr-4">
              <div className="w-8.5 h-8.5 bg-gray-900 rounded-xl flex items-center justify-center shadow-md">
                <Package className="w-5 h-5 text-white" strokeWidth={2.5} />
              </div>
              <div>
                <span className="font-black text-gray-900 text-xl leading-none tracking-tighter">AGY</span>
                <span className="font-light text-gray-900 text-xl leading-none tracking-tighter">Shop</span>
              </div>
            </Link>

            {/* Nav Desktop */}
            <nav className="hidden lg:flex items-center gap-1.5 flex-1">
              <Link href="/" className={getNavLinkClass("/")}>
                Trang chủ
              </Link>
              <Link href="/shop" className={getNavLinkClass("/shop")}>
                Cửa Hàng
              </Link>

              {/* Dropdown categories */}
              <div className="relative group">
                <button className={`flex items-center gap-1 px-3.5 py-2 text-sm font-semibold rounded-xl transition-all duration-150 ${
                  pathname.includes("category=") ? "bg-gray-900 text-white shadow-sm" : "text-gray-700 hover:text-gray-900 hover:bg-gray-100"
                }`}>
                  Danh mục <ChevronDown className="w-3.5 h-3.5 text-gray-400 group-hover:rotate-180 transition-transform duration-200" />
                </button>
                <div className="absolute top-full left-0 w-64 pt-2 opacity-0 invisible group-hover:opacity-100 group-hover:visible transition-all duration-150 pointer-events-none group-hover:pointer-events-auto z-50">
                  <div className="bg-white border border-border rounded-2xl shadow-xl p-2 space-y-1">
                    {categories.length === 0 ? (
                      <div className="p-3 text-center space-y-2">
                        <p className="text-xs text-gray-500 font-medium">Chưa có dữ liệu danh mục</p>
                        {user?.role === "admin" && (
                          <button
                            onClick={handleSeedDB}
                            disabled={seeding}
                            className="w-full bg-gray-900 text-white text-xs font-bold py-2 rounded-xl hover:bg-gray-700 transition-colors flex items-center justify-center gap-1.5"
                          >
                            <Database className="w-3.5 h-3.5 text-amber-400" />
                            {seeding ? "Đang nạp..." : "Nạp DB ngay (Admin)"}
                          </button>
                        )}
                      </div>
                    ) : (
                      <>
                        {categories.map((cat) => (
                          <Link key={cat.slug} href={`/shop?category=${cat.slug}`}
                            className="block px-3 py-2 text-sm text-gray-700 hover:text-accent hover:bg-gray-50 rounded-xl capitalize transition-colors font-medium">
                            {cat.name}
                          </Link>
                        ))}
                        <div className="border-t border-border mt-1 pt-1">
                          <Link href="/shop" className="block px-3 py-2 text-sm font-semibold text-accent hover:bg-blue-50 rounded-xl">
                            Xem tất cả sản phẩm →
                          </Link>
                        </div>
                      </>
                    )}
                  </div>
                </div>
              </div>

              {/* About Link */}
              <Link href="/about" className={getNavLinkClass("/about")}>
                Giới thiệu
              </Link>

              {/* Contact Link */}
              <Link href="/contact" className={getNavLinkClass("/contact")}>
                Liên hệ
              </Link>

              {user?.role === "admin" && (
                <Link
                  href="/admin"
                  className={`ml-1 px-3 py-1.5 text-xs font-bold rounded-xl transition-colors flex items-center gap-1 ${
                    pathname.startsWith("/admin")
                      ? "bg-amber-800 text-white shadow-sm"
                      : "text-amber-800 bg-amber-100/70 hover:bg-amber-200/80 border border-amber-300"
                  }`}
                >
                  <ShieldCheck className="w-3.5 h-3.5" />
                  Admin
                </Link>
              )}
            </nav>

            {/* Search Bar */}
            <div ref={searchRef} className="relative flex-1 max-w-xs hidden md:block">
              <form onSubmit={handleSearch}>
                <div className="relative">
                  <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-gray-400 pointer-events-none" />
                  <input
                    type="text"
                    placeholder="Tìm sản phẩm..."
                    value={searchQuery}
                    onChange={(e) => { setSearchQuery(e.target.value); setSearchOpen(true); }}
                    onFocus={() => setSearchOpen(true)}
                    className="w-full pl-9 pr-4 py-2.5 text-xs bg-gray-100 border border-transparent rounded-xl text-gray-800 placeholder-gray-400 focus:outline-none focus:bg-white focus:border-accent/50 transition-all font-medium"
                  />
                </div>
              </form>

              {/* Live Search Dropdown */}
              {searchOpen && searchQuery.trim() && (
                <div className="absolute top-full left-0 right-0 mt-1.5 bg-white border border-border rounded-2xl shadow-xl overflow-hidden z-50 animate-fade-up">
                  {searching ? (
                    <div className="px-4 py-6 text-center text-xs text-gray-400">Đang tìm...</div>
                  ) : searchResults.length === 0 ? (
                    <div className="px-4 py-6 text-center text-xs text-gray-400">Không có kết quả</div>
                  ) : (
                    <div className="p-2">
                      <p className="px-2 py-1 text-[10px] font-bold uppercase tracking-widest text-gray-400">Gợi ý sản phẩm</p>
                      {searchResults.map((p) => (
                        <Link key={p.id} href={`/product/${p.id}`} onClick={() => setSearchOpen(false)}
                          className="flex items-center gap-3 p-2 rounded-xl hover:bg-gray-50 transition-colors group">
                          <div className="w-9 h-9 rounded-lg overflow-hidden border border-border flex-shrink-0 bg-gray-50">
                            <img src={p.thumbnail} alt={p.title} className="w-full h-full object-cover" />
                          </div>
                          <div className="flex-1 min-w-0">
                            <p className="text-xs font-bold text-gray-800 truncate group-hover:text-accent">{p.title}</p>
                            <p className="text-xs font-black text-accent">{formatPrice(p.price)}</p>
                          </div>
                        </Link>
                      ))}
                      <div className="border-t border-border mt-1 pt-1 px-2">
                        <button onClick={handleSearch} className="text-xs font-bold text-accent hover:underline w-full text-left py-1">
                          Xem tất cả kết quả cho &quot;{searchQuery}&quot; →
                        </button>
                      </div>
                    </div>
                  )}
                </div>
              )}
            </div>

            {/* Actions (Wishlist & Cart & Profile) */}
            <div className="flex items-center gap-1">
              <button onClick={toggleCurrency}
                className="hidden sm:flex w-9 h-9 items-center justify-center text-xs font-extrabold text-gray-700 hover:bg-gray-100 rounded-xl transition-colors">
                {currency}
              </button>

              {/* Wishlist Link */}
              <Link href="/wishlist"
                className={`flex w-9 h-9 items-center justify-center relative rounded-xl transition-colors ${
                  pathname === "/wishlist" ? "bg-rose-50 text-rose-600 font-bold" : "text-gray-700 hover:bg-gray-100"
                }`}
                title="Yêu thích">
                <Heart className="w-[19px] h-[19px]" />
                {wishlistItems.length > 0 && (
                  <span className="absolute -top-0.5 -right-0.5 w-[16px] h-[16px] bg-rose-500 text-white text-[9px] font-black rounded-full flex items-center justify-center">{wishlistItems.length}</span>
                )}
              </Link>

              {/* Shopping Bag Link */}
              <Link
                href={user ? "/cart" : "/login?redirect=/cart"}
                className={`flex w-9 h-9 items-center justify-center relative rounded-xl transition-colors ${
                  pathname === "/cart" ? "bg-gray-900 text-white" : "text-gray-700 hover:bg-gray-100"
                }`}
                title="Giỏ hàng"
              >
                <ShoppingBag className="w-[19px] h-[19px]" />
                {cartCount > 0 && (
                  <span className="absolute -top-0.5 -right-0.5 w-[16px] h-[16px] bg-gray-900 text-white text-[9px] font-black rounded-full flex items-center justify-center border border-white">{cartCount}</span>
                )}
              </Link>

              {user ? (
                <div className="relative group ml-1">
                  <button className={`w-9 h-9 rounded-xl overflow-hidden border-2 transition-colors flex items-center justify-center bg-gray-100 shadow-sm ${
                    pathname === "/profile" ? "border-gray-900 ring-2 ring-gray-900/20" : "border-gray-200 hover:border-accent/60"
                  }`}>
                    {user.image ? (
                      <img src={user.image} alt={user.username} className="w-full h-full object-cover" />
                    ) : (
                      <User className="w-4 h-4 text-gray-500" />
                    )}
                  </button>
                  <div className="absolute right-0 top-full w-56 pt-2 opacity-0 invisible group-hover:opacity-100 group-hover:visible transition-all duration-150 pointer-events-none group-hover:pointer-events-auto z-50">
                    <div className="bg-white border border-border rounded-2xl shadow-xl p-1.5 space-y-1">
                      <div className="px-3 py-2.5 border-b border-border">
                        <div className="flex items-center justify-between">
                          <p className="text-[10px] text-gray-400 font-medium">Đăng nhập với</p>
                          {user.role === "admin" && (
                            <span className="text-[9px] font-black bg-amber-100 text-amber-800 px-1.5 py-0.5 rounded">ADMIN</span>
                          )}
                        </div>
                        <p className="text-sm font-bold text-gray-900 mt-0.5">{user.firstName} {user.lastName}</p>
                      </div>

                      {user.role === "admin" && (
                        <Link href="/admin" className="flex items-center gap-2 px-3 py-2 text-sm font-bold text-amber-700 hover:bg-amber-50 rounded-xl transition-colors">
                          <ShieldCheck className="w-4 h-4 text-amber-600" /> Dashboard Quản Trị
                        </Link>
                      )}

                      <Link href="/profile" className="flex items-center gap-2 px-3 py-2 text-sm text-gray-700 hover:bg-gray-50 rounded-xl transition-colors font-medium">
                        <User className="w-4 h-4" /> Hồ sơ & Đơn hàng
                      </Link>

                      <button onClick={() => { logout(); showToast("Đã đăng xuất", "info"); }}
                        className="w-full flex items-center gap-2 px-3 py-2 text-sm text-rose-500 hover:bg-rose-50 rounded-xl transition-colors font-medium">
                        <LogOut className="w-4 h-4" /> Đăng xuất
                      </button>
                    </div>
                  </div>
                </div>
              ) : (
                <Link href="/login"
                  className="ml-1 px-4 py-2 bg-gray-900 hover:bg-gray-800 text-white text-xs font-extrabold rounded-xl transition-colors shadow-sm">
                  Đăng nhập
                </Link>
              )}

              <button onClick={() => setMobileOpen(!mobileOpen)}
                className="lg:hidden w-9 h-9 flex items-center justify-center text-gray-600 hover:bg-gray-100 rounded-xl transition-colors ml-1">
                {mobileOpen ? <X className="w-5 h-5" /> : <Menu className="w-5 h-5" />}
              </button>
            </div>
          </div>
        </div>

        {/* Mobile Menu */}
        {mobileOpen && (
          <div className="lg:hidden border-t border-border bg-white animate-fade-up">
            <div className="max-w-7xl mx-auto px-4 py-4 space-y-1">
              <form onSubmit={handleSearch} className="mb-3">
                <div className="relative">
                  <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-gray-400" />
                  <input type="text" placeholder="Tìm sản phẩm..." value={searchQuery}
                    onChange={(e) => setSearchQuery(e.target.value)}
                    className="w-full pl-9 pr-4 py-2.5 text-sm bg-gray-100 rounded-xl outline-none" />
                </div>
              </form>

              {[
                { href: "/", label: "Trang chủ" },
                { href: "/shop", label: "Cửa hàng (/shop)" },
                { href: "/about", label: "Giới thiệu" },
                { href: "/contact", label: "Liên hệ" },
                { href: "/cart", label: "Giỏ hàng" },
                { href: "/wishlist", label: "Yêu thích" },
              ].map((l) => (
                <Link key={l.href} href={l.href} onClick={() => setMobileOpen(false)}
                  className={`block px-3 py-2.5 text-sm font-semibold rounded-xl transition-colors ${
                    isActive(l.href)
                      ? "bg-gray-900 text-white"
                      : "text-gray-700 hover:bg-gray-50"
                  }`}>
                  {l.label}
                </Link>
              ))}

              <div className="pt-2 border-t border-border">
                <p className="px-3 text-[10px] font-bold text-gray-400 uppercase tracking-widest mb-2">Danh mục</p>
                <div className="grid grid-cols-2 gap-1">
                  {categories.map((cat) => (
                    <Link key={cat.slug} href={`/shop?category=${cat.slug}`} onClick={() => setMobileOpen(false)}
                      className="px-3 py-2 text-sm text-gray-600 hover:text-accent hover:bg-gray-50 rounded-xl capitalize">
                      {cat.name}
                    </Link>
                  ))}
                </div>
              </div>
            </div>
          </div>
        )}
      </header>

      {/* Spacer div for fixed top header */}
      <div className="h-[92px]" />

      <CartDrawer />
    </>
  );
}
