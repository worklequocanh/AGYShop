"use client";

import React, { useState, useEffect, Suspense } from "react";
import { useSearchParams, useRouter } from "next/navigation";
import { ProductCard } from "@/components/ProductCard";
import {
  SlidersHorizontal, ArrowUpDown, ChevronLeft, ChevronRight,
  LayoutGrid, LayoutList, Search, X, Filter, Tag, Check, RefreshCw
} from "lucide-react";
import { useCurrency } from "@/context/CurrencyContext";

function ShopContent() {
  const router = useRouter();
  const searchParams = useSearchParams();
  const { formatPrice } = useCurrency();

  // URL Query Params Init
  const initialCategory = searchParams.get("category") || "";
  const initialSearch = searchParams.get("q") || searchParams.get("search") || "";
  const initialMinPrice = searchParams.get("minPrice") || "";
  const initialMaxPrice = searchParams.get("maxPrice") || "";
  const initialRating = searchParams.get("rating") || "";
  const initialBrand = searchParams.get("brand") || "";
  const initialSortBy = searchParams.get("sortBy") || "id";
  const initialSortOrder = searchParams.get("sortOrder") || "asc";
  const initialPage = parseInt(searchParams.get("page") || "1", 10);

  // States
  const [products, setProducts] = useState<any[]>([]);
  const [categories, setCategories] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);

  const [searchQuery, setSearchQuery] = useState(initialSearch);
  const [selectedCategory, setSelectedCategory] = useState(initialCategory);
  const [minPrice, setMinPrice] = useState(initialMinPrice);
  const [maxPrice, setMaxPrice] = useState(initialMaxPrice);
  const [selectedRating, setSelectedRating] = useState(initialRating);
  const [selectedBrand, setSelectedBrand] = useState(initialBrand);
  const [sortBy, setSortBy] = useState(initialSortBy);
  const [sortOrder, setSortOrder] = useState(initialSortOrder);
  const [viewMode, setViewMode] = useState<"grid" | "list">("grid");

  const [page, setPage] = useState(initialPage);
  const [totalPages, setTotalPages] = useState(1);
  const [totalCount, setTotalCount] = useState(0);
  const limit = 12;

  const [showMobileFilters, setShowMobileFilters] = useState(false);

  // Sync state when URL searchParams change
  useEffect(() => {
    setSelectedCategory(searchParams.get("category") || "");
    setSearchQuery(searchParams.get("q") || searchParams.get("search") || "");
    setMinPrice(searchParams.get("minPrice") || "");
    setMaxPrice(searchParams.get("maxPrice") || "");
    setSelectedRating(searchParams.get("rating") || "");
    setSelectedBrand(searchParams.get("brand") || "");
    setSortBy(searchParams.get("sortBy") || "id");
    setSortOrder(searchParams.get("sortOrder") || "asc");
    setPage(parseInt(searchParams.get("page") || "1", 10));
  }, [searchParams]);

  // Update URL helper
  const updateUrlParams = (newParams: Record<string, string>) => {
    const params = new URLSearchParams(searchParams.toString());
    Object.entries(newParams).forEach(([key, value]) => {
      if (value) {
        params.set(key, value);
      } else {
        params.delete(key);
      }
    });
    router.push(`/shop?${params.toString()}`);
  };

  // Fetch Categories once
  useEffect(() => {
    async function fetchCats() {
      try {
        const res = await fetch("/api/categories");
        if (!res.ok) return;
        const data = await res.json();
        if (data.success) setCategories(data.categories);
      } catch {}
    }
    fetchCats();
  }, []);

  // Fetch Products with all unified parameters
  const fetchProducts = async () => {
    setLoading(true);
    try {
      let url = `/api/products?page=${page}&limit=${limit}`;
      if (selectedCategory) url += `&category=${encodeURIComponent(selectedCategory)}`;
      if (searchQuery) url += `&search=${encodeURIComponent(searchQuery)}`;
      if (minPrice) url += `&minPrice=${minPrice}`;
      if (maxPrice) url += `&maxPrice=${maxPrice}`;
      if (selectedRating) url += `&rating=${selectedRating}`;
      if (selectedBrand) url += `&brand=${encodeURIComponent(selectedBrand)}`;
      if (sortBy) url += `&sortBy=${sortBy}&sortOrder=${sortOrder}`;

      const res = await fetch(url);
      if (!res.ok) return;
      const data = await res.json();
      if (data.success) {
        setProducts(data.products);
        setTotalPages(data.pagination.pages);
        setTotalCount(data.pagination.total);
      }
    } catch {} finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchProducts();
  }, [page, selectedCategory, searchQuery, selectedRating, selectedBrand, sortBy, sortOrder, minPrice, maxPrice]);

  const handleSearchSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    updateUrlParams({ q: searchQuery, page: "1" });
  };

  const handleApplyPrice = (e: React.FormEvent) => {
    e.preventDefault();
    updateUrlParams({ minPrice, maxPrice, page: "1" });
  };

  const handleQuickPrice = (min: string, max: string) => {
    setMinPrice(min);
    setMaxPrice(max);
    updateUrlParams({ minPrice: min, maxPrice: max, page: "1" });
  };

  const handleClearAllFilters = () => {
    setSearchQuery("");
    setSelectedCategory("");
    setMinPrice("");
    setMaxPrice("");
    setSelectedRating("");
    setSelectedBrand("");
    setSortBy("id");
    setSortOrder("asc");
    setPage(1);
    router.push("/shop");
  };

  const selectedCatObj = categories.find((c) => c.slug === selectedCategory);

  return (
    <div className="space-y-8 pb-16 animate-fade-up">

      {/* Header Title & Integrated Live Search Banner */}
      <div className="bg-gradient-to-r from-gray-900 via-slate-900 to-indigo-950 text-white rounded-3xl p-6 sm:p-10 shadow-xl space-y-6">
        <div className="max-w-2xl space-y-2">
          <div className="inline-flex items-center gap-2 bg-white/10 backdrop-blur-md px-3.5 py-1 rounded-full text-xs font-bold text-amber-300">
            <Tag className="w-3.5 h-3.5" /> Tất Cả Sản Phẩm & Tìm Kiếm Nâng Cao
          </div>
          <h1 className="text-2xl sm:text-4xl font-black tracking-tight">
            {selectedCatObj ? `Danh Mục: ${selectedCatObj.name}` : "Cửa Hàng AGYShop"}
          </h1>
          <p className="text-xs sm:text-sm text-gray-300">
            Khám phá hàng ngàn sản phẩm chính hãng với bộ lọc thông minh real-time.
          </p>
        </div>

        {/* Search Bar Input */}
        <form onSubmit={handleSearchSubmit} className="relative max-w-xl">
          <Search className="absolute left-4 top-1/2 -translate-y-1/2 w-5 h-5 text-gray-400" />
          <input
            type="text"
            placeholder="Tìm kiếm sản phẩm, thương hiệu..."
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
            className="w-full pl-12 pr-28 py-3.5 bg-white text-gray-900 placeholder-gray-400 rounded-2xl font-medium text-sm focus:outline-none focus:ring-4 focus:ring-accent/30 transition-all shadow-inner"
          />
          {searchQuery && (
            <button
              type="button"
              onClick={() => { setSearchQuery(""); updateUrlParams({ q: "", page: "1" }); }}
              className="absolute right-24 top-1/2 -translate-y-1/2 p-1 text-gray-400 hover:text-gray-600"
            >
              <X className="w-4 h-4" />
            </button>
          )}
          <button
            type="submit"
            className="absolute right-2 top-1/2 -translate-y-1/2 bg-gray-900 hover:bg-gray-800 text-white font-bold text-xs px-5 py-2.5 rounded-xl transition-all shadow-sm"
          >
            Tìm kiếm
          </button>
        </form>
      </div>

      {/* ACTIVE FILTER BADGES BAR */}
      {(selectedCategory || searchQuery || minPrice || maxPrice || selectedRating || selectedBrand) && (
        <div className="bg-blue-50/60 border border-blue-100 rounded-2xl p-4 flex flex-wrap items-center gap-2 text-xs">
          <span className="font-extrabold text-gray-700 flex items-center gap-1 mr-1">
            <Filter className="w-3.5 h-3.5 text-accent" /> Bộ lọc đang áp dụng:
          </span>

          {searchQuery && (
            <span className="bg-white border border-blue-200 text-gray-900 font-bold px-3 py-1 rounded-xl flex items-center gap-1.5 shadow-sm">
              Từ khóa: "{searchQuery}"
              <button onClick={() => { setSearchQuery(""); updateUrlParams({ q: "" }); }}>
                <X className="w-3 h-3 text-rose-500" />
              </button>
            </span>
          )}

          {selectedCategory && (
            <span className="bg-white border border-blue-200 text-gray-900 font-bold px-3 py-1 rounded-xl flex items-center gap-1.5 shadow-sm capitalize">
              Danh mục: {selectedCatObj?.name || selectedCategory}
              <button onClick={() => { setSelectedCategory(""); updateUrlParams({ category: "" }); }}>
                <X className="w-3 h-3 text-rose-500" />
              </button>
            </span>
          )}

          {(minPrice || maxPrice) && (
            <span className="bg-white border border-blue-200 text-gray-900 font-bold px-3 py-1 rounded-xl flex items-center gap-1.5 shadow-sm">
              Giá: ${minPrice || "0"} - ${maxPrice || "∞"}
              <button onClick={() => { setMinPrice(""); setMaxPrice(""); updateUrlParams({ minPrice: "", maxPrice: "" }); }}>
                <X className="w-3 h-3 text-rose-500" />
              </button>
            </span>
          )}

          {selectedRating && (
            <span className="bg-white border border-blue-200 text-gray-900 font-bold px-3 py-1 rounded-xl flex items-center gap-1.5 shadow-sm">
              Từ {selectedRating}★ trở lên
              <button onClick={() => { setSelectedRating(""); updateUrlParams({ rating: "" }); }}>
                <X className="w-3 h-3 text-rose-500" />
              </button>
            </span>
          )}

          <button
            onClick={handleClearAllFilters}
            className="text-xs font-bold text-rose-600 hover:underline ml-auto"
          >
            Xóa tất cả lọc
          </button>
        </div>
      )}

      {/* MAIN LAYOUT: Sidebar Filter & Products Display */}
      <div className="flex flex-col lg:flex-row gap-8 items-start">

        {/* LEFT SIDEBAR: ADVANCED FILTERS */}
        <aside className="hidden lg:block w-72 flex-shrink-0 bg-white border border-border rounded-3xl p-6 space-y-6 sticky top-24 shadow-sm">
          
          <div className="flex items-center justify-between border-b border-border pb-4">
            <h3 className="font-black text-base text-gray-900 flex items-center gap-2">
              <SlidersHorizontal className="w-4.5 h-4.5 text-accent" /> Bộ Lọc Nâng Cao
            </h3>
            <button
              onClick={handleClearAllFilters}
              className="text-xs font-extrabold text-rose-500 hover:underline"
            >
              Đặt lại
            </button>
          </div>

          {/* 1. Category Filter */}
          <div className="space-y-3">
            <h4 className="text-[10px] font-black text-gray-400 uppercase tracking-widest">Danh Mục Sản Phẩm</h4>
            <div className="space-y-1.5 max-h-56 overflow-y-auto pr-1">
              <label
                onClick={() => { setSelectedCategory(""); updateUrlParams({ category: "", page: "1" }); }}
                className={`flex items-center justify-between p-2 rounded-xl text-xs font-bold cursor-pointer transition-colors ${
                  selectedCategory === "" ? "bg-gray-900 text-white" : "hover:bg-gray-100 text-gray-700"
                }`}
              >
                <span>Tất cả danh mục</span>
                {selectedCategory === "" && <Check className="w-3.5 h-3.5" />}
              </label>

              {categories.map((cat) => (
                <label
                  key={cat.slug}
                  onClick={() => { setSelectedCategory(cat.slug); updateUrlParams({ category: cat.slug, page: "1" }); }}
                  className={`flex items-center justify-between p-2 rounded-xl text-xs font-bold cursor-pointer capitalize transition-colors ${
                    selectedCategory === cat.slug ? "bg-gray-900 text-white" : "hover:bg-gray-100 text-gray-700"
                  }`}
                >
                  <span className="truncate">{cat.name}</span>
                  {selectedCategory === cat.slug && <Check className="w-3.5 h-3.5 flex-shrink-0" />}
                </label>
              ))}
            </div>
          </div>

          {/* 2. Price Filter & Presets */}
          <div className="space-y-3 border-t border-border pt-4">
            <h4 className="text-[10px] font-black text-gray-400 uppercase tracking-widest">Khoảng Giá ($ USD)</h4>
            
            <form onSubmit={handleApplyPrice} className="space-y-3">
              <div className="grid grid-cols-2 gap-2">
                <input
                  type="number"
                  placeholder="Min ($)"
                  value={minPrice}
                  onChange={(e) => setMinPrice(e.target.value)}
                  className="w-full text-xs font-bold p-2.5 bg-gray-50 border border-border rounded-xl focus:outline-none focus:border-accent text-gray-900"
                />
                <input
                  type="number"
                  placeholder="Max ($)"
                  value={maxPrice}
                  onChange={(e) => setMaxPrice(e.target.value)}
                  className="w-full text-xs font-bold p-2.5 bg-gray-50 border border-border rounded-xl focus:outline-none focus:border-accent text-gray-900"
                />
              </div>
              <button
                type="submit"
                className="w-full bg-gray-900 hover:bg-gray-800 text-white font-extrabold text-xs py-2.5 rounded-xl transition-all shadow-sm"
              >
                Áp dụng khoảng giá
              </button>
            </form>

            {/* Quick Price Buttons */}
            <div className="grid grid-cols-2 gap-1.5 pt-1">
              {[
                { label: "Dưới $25", min: "0", max: "25" },
                { label: "$25 - $100", min: "25", max: "100" },
                { label: "$100 - $500", min: "100", max: "500" },
                { label: "Trên $500", min: "500", max: "10000" },
              ].map((p) => (
                <button
                  key={p.label}
                  onClick={() => handleQuickPrice(p.min, p.max)}
                  className="p-1.5 bg-gray-50 hover:bg-gray-100 text-[11px] font-bold text-gray-700 rounded-lg text-center transition-colors border border-border"
                >
                  {p.label}
                </button>
              ))}
            </div>
          </div>

          {/* 3. Star Rating Filter */}
          <div className="space-y-3 border-t border-border pt-4">
            <h4 className="text-[10px] font-black text-gray-400 uppercase tracking-widest">Đánh Giá Sao</h4>
            <div className="space-y-1.5">
              {[4, 3, 2].map((star) => (
                <button
                  key={star}
                  onClick={() => { setSelectedRating(star.toString()); updateUrlParams({ rating: star.toString(), page: "1" }); }}
                  className={`w-full text-left p-2 rounded-xl text-xs font-bold flex items-center justify-between transition-colors ${
                    selectedRating === star.toString() ? "bg-amber-100 text-amber-900 border border-amber-300" : "hover:bg-gray-50 text-gray-700"
                  }`}
                >
                  <span>Từ {star}★ trở lên</span>
                  {selectedRating === star.toString() && <Check className="w-3.5 h-3.5" />}
                </button>
              ))}
              <button
                onClick={() => { setSelectedRating(""); updateUrlParams({ rating: "", page: "1" }); }}
                className={`w-full text-left p-2 rounded-xl text-xs font-bold transition-colors ${
                  selectedRating === "" ? "text-gray-900 font-extrabold" : "text-gray-400 hover:text-gray-600"
                }`}
              >
                Tất cả sao
              </button>
            </div>
          </div>

        </aside>

        {/* RIGHT CONTENT: PRODUCTS GRID / LIST */}
        <div className="flex-1 w-full space-y-6">
          
          {/* Top Control Bar */}
          <div className="flex flex-wrap gap-4 items-center justify-between bg-white border border-border rounded-3xl p-4 shadow-sm">
            
            <div className="flex items-center gap-3">
              <button
                onClick={() => setShowMobileFilters(true)}
                className="lg:hidden flex items-center gap-1.5 text-xs font-bold bg-gray-900 text-white px-4 py-2.5 rounded-xl"
              >
                <SlidersHorizontal className="w-4 h-4" /> Lọc
              </button>

              <p className="text-xs font-bold text-gray-600">
                Hiển thị <span className="font-black text-gray-900">{products.length}</span> / <span className="font-black text-accent">{totalCount}</span> sản phẩm
              </p>
            </div>

            {/* Controls: View Mode & Sorting */}
            <div className="flex items-center gap-3">
              <div className="flex border border-border rounded-xl overflow-hidden p-0.5 bg-gray-50">
                <button
                  onClick={() => setViewMode("grid")}
                  className={`p-2 rounded-lg transition-all ${viewMode === "grid" ? "bg-white text-gray-900 shadow-sm font-bold" : "text-gray-400 hover:text-gray-600"}`}
                >
                  <LayoutGrid className="w-4 h-4" />
                </button>
                <button
                  onClick={() => setViewMode("list")}
                  className={`p-2 rounded-lg transition-all ${viewMode === "list" ? "bg-white text-gray-900 shadow-sm font-bold" : "text-gray-400 hover:text-gray-600"}`}
                >
                  <LayoutList className="w-4 h-4" />
                </button>
              </div>

              <div className="flex items-center gap-1.5">
                <ArrowUpDown className="w-4 h-4 text-gray-400" />
                <select
                  value={`${sortBy}-${sortOrder}`}
                  onChange={(e) => {
                    const [field, order] = e.target.value.split("-");
                    setSortBy(field);
                    setSortOrder(order);
                    updateUrlParams({ sortBy: field, sortOrder: order, page: "1" });
                  }}
                  className="text-xs font-bold p-2.5 bg-gray-50 border border-border rounded-xl focus:outline-none focus:border-accent text-gray-900"
                >
                  <option value="id-asc">Mặc định</option>
                  <option value="price-asc">Giá: Thấp đến Cao</option>
                  <option value="price-desc">Giá: Cao đến Thấp</option>
                  <option value="rating-desc">Đánh giá cao nhất</option>
                  <option value="title-asc">Tên: A - Z</option>
                </select>
              </div>
            </div>

          </div>

          {/* PRODUCTS GRID / LIST DISPLAY */}
          {loading ? (
            <div className="grid grid-cols-2 md:grid-cols-3 gap-6">
              {Array.from({ length: 6 }).map((_, idx) => (
                <div key={idx} className="h-80 bg-white border border-border rounded-3xl animate-pulse" />
              ))}
            </div>
          ) : products.length === 0 ? (
            <div className="text-center py-20 bg-white border border-border rounded-3xl p-8 space-y-4 shadow-sm">
              <Search className="w-12 h-12 text-gray-300 mx-auto" />
              <div className="space-y-1">
                <h3 className="font-black text-lg text-gray-900">Không tìm thấy sản phẩm phù hợp</h3>
                <p className="text-xs text-gray-500 max-w-sm mx-auto">
                  Thử tìm kiếm với từ khóa khác hoặc bấm nút bên dưới để bỏ bớt các tiêu chí lọc.
                </p>
              </div>
              <button
                onClick={handleClearAllFilters}
                className="bg-gray-900 text-white font-bold text-xs px-6 py-3 rounded-2xl shadow-sm"
              >
                Xóa tất cả bộ lọc
              </button>
            </div>
          ) : viewMode === "grid" ? (
            <div className="grid grid-cols-2 md:grid-cols-3 gap-6">
              {products.map((prod) => (
                <ProductCard key={prod.id} product={prod} />
              ))}
            </div>
          ) : (
            /* List View Mode */
            <div className="space-y-4">
              {products.map((prod) => (
                <div
                  key={prod.id}
                  className="flex flex-col sm:flex-row items-center gap-5 bg-white border border-border rounded-3xl p-5 shadow-sm hover:shadow-md transition-all group"
                >
                  <img
                    src={prod.thumbnail}
                    alt={prod.title}
                    className="w-28 h-28 object-contain p-2 rounded-2xl bg-gray-50 border border-border flex-shrink-0"
                  />
                  <div className="flex-1 min-w-0 space-y-1 text-center sm:text-left">
                    <span className="text-[10px] font-extrabold uppercase tracking-widest text-accent bg-blue-50 px-2.5 py-0.5 rounded-full">
                      {prod.category}
                    </span>
                    <h3 className="font-black text-base text-gray-900 truncate group-hover:text-accent transition-colors">
                      {prod.title}
                    </h3>
                    <p className="text-xs text-gray-500 line-clamp-2 leading-relaxed">{prod.description}</p>
                    <div className="text-gray-900 font-black text-lg pt-1">{formatPrice(prod.price)}</div>
                  </div>
                </div>
              ))}
            </div>
          )}

          {/* SERVER-SIDE PAGINATION */}
          {totalPages > 1 && (
            <div className="flex items-center justify-center gap-3 pt-6">
              <button
                onClick={() => {
                  const newP = Math.max(1, page - 1);
                  setPage(newP);
                  updateUrlParams({ page: newP.toString() });
                }}
                disabled={page === 1}
                className="w-10 h-10 rounded-2xl flex items-center justify-center bg-white hover:bg-gray-100 border border-border text-gray-800 disabled:opacity-40 disabled:cursor-not-allowed transition-all shadow-sm"
              >
                <ChevronLeft className="w-5 h-5" />
              </button>

              <span className="text-xs font-bold text-gray-700 bg-white border border-border px-4 py-2.5 rounded-2xl shadow-sm">
                Trang <span className="text-gray-900 font-black">{page}</span> / {totalPages}
              </span>

              <button
                onClick={() => {
                  const newP = Math.min(totalPages, page + 1);
                  setPage(newP);
                  updateUrlParams({ page: newP.toString() });
                }}
                disabled={page === totalPages}
                className="w-10 h-10 rounded-2xl flex items-center justify-center bg-white hover:bg-gray-100 border border-border text-gray-800 disabled:opacity-40 disabled:cursor-not-allowed transition-all shadow-sm"
              >
                <ChevronRight className="w-5 h-5" />
              </button>
            </div>
          )}

        </div>

      </div>

      {/* MOBILE FILTER DRAWER OVERLAY */}
      {showMobileFilters && (
        <div className="fixed inset-0 z-[9999] lg:hidden">
          <div onClick={() => setShowMobileFilters(false)} className="absolute inset-0 bg-black/50 backdrop-blur-sm" />
          <div className="absolute top-0 bottom-0 left-0 w-80 max-w-xs bg-white p-6 space-y-6 flex flex-col justify-between overflow-y-auto shadow-2xl animate-fade-up">
            
            <div className="space-y-6">
              <div className="flex justify-between items-center pb-4 border-b border-border">
                <h3 className="font-black text-base text-gray-900">Bộ Lọc Di Động</h3>
                <button onClick={() => setShowMobileFilters(false)} className="p-1.5 text-gray-400 hover:text-gray-700">
                  <X className="w-5 h-5" />
                </button>
              </div>

              <div className="space-y-2">
                <h4 className="text-[10px] font-bold text-gray-400 uppercase tracking-widest">Danh mục</h4>
                <select
                  value={selectedCategory}
                  onChange={(e) => { setSelectedCategory(e.target.value); updateUrlParams({ category: e.target.value, page: "1" }); }}
                  className="w-full text-xs font-bold p-3 bg-gray-50 border border-border rounded-xl"
                >
                  <option value="">Tất cả danh mục</option>
                  {categories.map((c) => (
                    <option key={c.slug} value={c.slug}>{c.name}</option>
                  ))}
                </select>
              </div>

              <div className="space-y-2">
                <h4 className="text-[10px] font-bold text-gray-400 uppercase tracking-widest">Đánh giá sao</h4>
                <select
                  value={selectedRating}
                  onChange={(e) => { setSelectedRating(e.target.value); updateUrlParams({ rating: e.target.value, page: "1" }); }}
                  className="w-full text-xs font-bold p-3 bg-gray-50 border border-border rounded-xl"
                >
                  <option value="">Tất cả sao</option>
                  <option value="4">Từ 4 sao trở lên</option>
                  <option value="3">Từ 3 sao trở lên</option>
                </select>
              </div>
            </div>

            <button
              onClick={() => setShowMobileFilters(false)}
              className="bg-gray-900 text-white font-extrabold py-3.5 rounded-2xl w-full text-center text-xs shadow-md"
            >
              Áp dụng lọc
            </button>
          </div>
        </div>
      )}

    </div>
  );
}

export default function ShopPage() {
  return (
    <Suspense fallback={<div className="py-20 text-center text-xs font-bold text-gray-400">Đang tải cửa hàng...</div>}>
      <ShopContent />
    </Suspense>
  );
}
