"use client";

import React, { useState, useEffect } from "react";
import { Star, ShoppingBag, Heart, Calendar, MessageCircle } from "lucide-react";
import Link from "next/link";
import { useCart } from "@/context/CartContext";
import { useWishlist } from "@/context/WishlistContext";
import { useCurrency } from "@/context/CurrencyContext";
import { useToast } from "@/context/ToastContext";
import { ProductCard } from "@/components/ProductCard";

export default function ProductDetailPage({ params }: { params: { id: string } }) {
  const { addToCart } = useCart();
  const { toggleWishlist, isInWishlist } = useWishlist();
  const { formatPrice } = useCurrency();
  const { showToast } = useToast();

  const [product, setProduct] = useState<any>(null);
  const [relatedProducts, setRelatedProducts] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);

  // Gallery
  const [activeImage, setActiveImage] = useState("");
  const [quantity, setQuantity] = useState(1);

  // Tab State
  const [activeTab, setActiveTab] = useState<"desc" | "specs" | "reviews">("desc");

  // Review Form State
  const [reviewerName, setReviewerName] = useState("");
  const [reviewerEmail, setReviewerEmail] = useState("");
  const [reviewRating, setReviewRating] = useState(5);
  const [reviewComment, setReviewComment] = useState("");
  const [submittingReview, setSubmittingReview] = useState(false);

  const fetchProductDetails = async () => {
    try {
      const res = await fetch(`/api/products/${params.id}`);
      if (!res.ok) return;
      const data = await res.json();
      if (data.success) {
        setProduct(data.product);
        setActiveImage(data.product.thumbnail);

        const relRes = await fetch(`/api/products?category=${data.product.category}&limit=5`);
        if (relRes.ok) {
          const relData = await relRes.json();
          if (relData.success) {
            const filtered = relData.products.filter((p: any) => p.id !== data.product.id).slice(0, 4);
            setRelatedProducts(filtered);
          }
        }
      }
    } catch {} finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchProductDetails();
  }, [params.id]);

  if (loading) {
    return <div className="py-20 text-center text-sm text-gray-400 animate-pulse">Đang tải sản phẩm...</div>;
  }

  if (!product) {
    return (
      <div className="text-center py-20 bg-white border border-border rounded-2xl p-6">
        <h3 className="font-bold text-gray-800">Không tìm thấy sản phẩm</h3>
        <p className="text-sm text-gray-500 mt-1">Sản phẩm này không tồn tại.</p>
        <Link href="/shop" className="inline-block mt-4 text-accent font-bold hover:underline">
          Quay lại cửa hàng
        </Link>
      </div>
    );
  }

  const discountPrice = product.price * (1 - (product.discountPercentage || 0) / 100);
  const isLoved = isInWishlist(product.id);

  const handleAddToCart = () => {
    if (product.stock === 0) return;
    addToCart(product, quantity);
    showToast(`Đã thêm ${quantity}× ${product.title} vào giỏ hàng`, "cart", product.thumbnail);
  };

  const handleToggleWishlist = () => {
    toggleWishlist(product);
    showToast(!isLoved ? `Đã thêm vào yêu thích` : `Đã xóa khỏi yêu thích`, "success");
  };

  const handleReviewSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!reviewerName || !reviewerEmail || !reviewComment) {
      showToast("Vui lòng điền đầy đủ thông tin đánh giá", "error");
      return;
    }

    setSubmittingReview(true);
    try {
      const res = await fetch(`/api/products/${product.id}`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          rating: reviewRating,
          comment: reviewComment,
          reviewerName,
          reviewerEmail,
        }),
      });

      const data = await res.json();
      if (data.success) {
        showToast("Đánh giá của bạn đã được gửi!", "success");
        setReviewComment("");
        fetchProductDetails();
      } else {
        showToast(data.error || "Gửi đánh giá thất bại", "error");
      }
    } catch {
      showToast("Lỗi kết nối máy chủ", "error");
    } finally {
      setSubmittingReview(false);
    }
  };

  const totalReviews = product.reviews?.length || 0;
  const ratingCounts = [0, 0, 0, 0, 0];
  product.reviews?.forEach((rev: any) => {
    const r = Math.round(rev.rating);
    if (r >= 1 && r <= 5) ratingCounts[5 - r]++;
  });

  return (
    <div className="space-y-10 pb-12">
      
      {/* Breadcrumb */}
      <div className="flex items-center gap-2 text-xs font-semibold text-gray-500">
        <Link href="/" className="hover:text-gray-900 transition-colors">Trang chủ</Link>
        <span>/</span>
        <Link href="/shop" className="hover:text-gray-900 transition-colors">Sản phẩm</Link>
        <span>/</span>
        <span className="text-gray-900 truncate max-w-[200px]">{product.title}</span>
      </div>

      {/* Product Presentation Box */}
      <section className="flex flex-col md:flex-row gap-8 lg:gap-12 bg-white border border-border rounded-2xl p-6 sm:p-8 shadow-sm">
        
        {/* Left Gallery */}
        <div className="w-full md:w-1/2 space-y-4">
          <div className="aspect-square rounded-2xl overflow-hidden border border-border bg-gray-50 p-6 flex items-center justify-center">
            <img src={activeImage} alt={product.title} className="w-full h-full object-contain hover:scale-105 transition-transform duration-300" />
          </div>

          {/* Thumbnails */}
          {product.images && product.images.length > 0 && (
            <div className="flex gap-2 overflow-x-auto py-1">
              {product.images.map((img: string, idx: number) => (
                <button
                  key={idx}
                  onClick={() => setActiveImage(img)}
                  className={`w-14 h-14 rounded-xl overflow-hidden border-2 flex-shrink-0 bg-gray-50 transition-all ${
                    activeImage === img ? "border-gray-900 scale-105" : "border-transparent opacity-60 hover:opacity-100"
                  }`}
                >
                  <img src={img} alt="" className="w-full h-full object-cover" />
                </button>
              ))}
            </div>
          )}
        </div>

        {/* Right Info */}
        <div className="w-full md:w-1/2 flex flex-col justify-between space-y-6">
          <div className="space-y-4">
            <div>
              <span className="text-[10px] font-bold uppercase tracking-widest text-gray-400 bg-gray-100 px-3 py-1 rounded-full">
                {product.brand || "GENERIC"}
              </span>
              <h1 className="text-2xl sm:text-3xl font-black text-gray-900 mt-3 leading-tight">
                {product.title}
              </h1>
            </div>

            {/* Rating summary */}
            <div className="flex items-center gap-2">
              <div className="flex text-amber-400">
                {Array.from({ length: 5 }).map((_, i) => (
                  <Star
                    key={i}
                    className={`w-4 h-4 ${i < Math.floor(product.rating) ? "fill-amber-400" : "text-gray-200"}`}
                  />
                ))}
              </div>
              <span className="text-xs font-bold text-gray-800">{product.rating} / 5</span>
              <span className="text-xs text-gray-400">({totalReviews} đánh giá)</span>
            </div>

            {/* Pricing Section */}
            <div className="flex items-baseline gap-3 py-3 border-y border-gray-100">
              <span className="text-3xl font-black text-gray-900">
                {formatPrice(discountPrice)}
              </span>
              {product.discountPercentage > 0 && (
                <>
                  <span className="text-base text-gray-400 line-through">
                    {formatPrice(product.price)}
                  </span>
                  <span className="bg-red-100 text-red-600 text-xs px-2.5 py-0.5 rounded-md font-bold">
                    -{Math.round(product.discountPercentage)}%
                  </span>
                </>
              )}
            </div>

            <p className="text-sm text-gray-500 leading-relaxed">
              {product.description}
            </p>

            {/* Stock info */}
            <div className="space-y-1 text-xs font-medium text-gray-600">
              <div>SKU: <span className="font-bold text-gray-800">{product.sku || "N/A"}</span></div>
              <div>
                Tình trạng:{" "}
                {product.stock > 0 ? (
                  <span className="text-emerald-600 font-bold">Còn hàng ({product.stock} sản phẩm)</span>
                ) : (
                  <span className="text-rose-500 font-bold">Hết hàng</span>
                )}
              </div>
              <div>Bảo hành: <span className="text-gray-800">{product.warrantyInformation || "12 Tháng"}</span></div>
              <div>Vận chuyển: <span className="text-gray-800">{product.shippingInformation || "Miễn phí toàn quốc"}</span></div>
            </div>
          </div>

          {/* Actions */}
          <div className="space-y-4 pt-4 border-t border-gray-100">
            {product.stock > 0 && (
              <div className="flex items-center gap-3">
                <span className="text-xs font-bold text-gray-500 uppercase tracking-widest">Số lượng:</span>
                <div className="flex items-center border border-border rounded-xl overflow-hidden bg-gray-50">
                  <button
                    onClick={() => setQuantity(Math.max(1, quantity - 1))}
                    className="px-3 py-1.5 hover:bg-gray-100 transition-colors text-gray-600 font-bold"
                  >
                    -
                  </button>
                  <span className="px-4 text-sm font-black text-gray-900">{quantity}</span>
                  <button
                    onClick={() => setQuantity(Math.min(product.stock, quantity + 1))}
                    className="px-3 py-1.5 hover:bg-gray-100 transition-colors text-gray-600 font-bold"
                  >
                    +
                  </button>
                </div>
              </div>
            )}

            <div className="flex flex-wrap gap-3">
              <button
                onClick={handleAddToCart}
                disabled={product.stock === 0}
                className="flex-1 min-w-[200px] bg-gray-900 hover:bg-gray-700 disabled:bg-gray-200 text-white font-bold py-3.5 px-6 rounded-xl flex items-center justify-center gap-2 transition-colors text-sm disabled:cursor-not-allowed shadow-sm"
              >
                <ShoppingBag className="w-4 h-4" /> Thêm vào giỏ hàng
              </button>

              <button
                onClick={handleToggleWishlist}
                className={`p-3.5 rounded-xl border transition-colors ${
                  isLoved ? "border-rose-200 bg-rose-50 text-rose-500" : "border-border text-gray-400 hover:text-rose-500 hover:border-rose-200"
                }`}
                title="Yêu thích"
              >
                <Heart className={`w-4.5 h-4.5 ${isLoved ? "fill-rose-500" : ""}`} />
              </button>
            </div>
          </div>

        </div>
      </section>

      {/* Tabs */}
      <section className="bg-white border border-border rounded-2xl overflow-hidden shadow-sm">
        <div className="flex border-b border-gray-100 bg-gray-50 p-1.5 gap-1">
          {[
            { key: "desc", label: "Mô tả sản phẩm" },
            { key: "specs", label: "Thông số kỹ thuật" },
            { key: "reviews", label: `Đánh giá (${totalReviews})` },
          ].map((t) => (
            <button
              key={t.key}
              onClick={() => setActiveTab(t.key as any)}
              className={`px-5 py-2.5 rounded-xl text-xs font-bold transition-all ${
                activeTab === t.key ? "bg-white text-gray-900 shadow-sm" : "text-gray-500 hover:text-gray-700"
              }`}
            >
              {t.label}
            </button>
          ))}
        </div>

        <div className="p-6">
          {activeTab === "desc" && (
            <div className="space-y-3">
              <h3 className="font-bold text-base text-gray-900">Chi tiết sản phẩm</h3>
              <p className="text-sm text-gray-500 leading-relaxed">
                {product.description}. Sản phẩm được bảo chứng chính hãng với chất lượng kiểm định nghiêm ngặt.
              </p>
            </div>
          )}

          {activeTab === "specs" && (
            <div className="space-y-4 max-w-md">
              <h3 className="font-bold text-base text-gray-900">Thông số kỹ thuật</h3>
              <div className="border border-border rounded-xl overflow-hidden divide-y divide-gray-100 text-xs">
                {product.brand && <div className="flex justify-between p-3"><span className="text-gray-400">Thương hiệu</span><span className="font-semibold text-gray-800">{product.brand}</span></div>}
                <div className="flex justify-between p-3"><span className="text-gray-400">Danh mục</span><span className="font-semibold text-gray-800 capitalize">{product.category}</span></div>
                <div className="flex justify-between p-3"><span className="text-gray-400">Trọng lượng</span><span className="font-semibold text-gray-800">{product.weight || 0.5} kg</span></div>
                <div className="flex justify-between p-3"><span className="text-gray-400">Mã SKU</span><span className="font-mono text-gray-800">{product.sku}</span></div>
              </div>
            </div>
          )}

          {activeTab === "reviews" && (
            <div className="space-y-8">
              <div className="flex flex-col sm:flex-row gap-6 items-center bg-gray-50 p-5 rounded-xl border border-border">
                <div className="text-center space-y-1">
                  <div className="text-4xl font-black text-gray-900">{product.rating}</div>
                  <div className="text-xs text-gray-400">trên 5 sao</div>
                  <div className="flex text-amber-400 justify-center">
                    {Array.from({ length: 5 }).map((_, i) => (
                      <Star key={i} className={`w-3.5 h-3.5 ${i < Math.floor(product.rating) ? "fill-amber-400" : "text-gray-200"}`} />
                    ))}
                  </div>
                </div>

                <div className="flex-1 w-full space-y-1 text-xs">
                  {ratingCounts.map((count, index) => {
                    const stars = 5 - index;
                    const percent = totalReviews > 0 ? (count / totalReviews) * 100 : 0;
                    return (
                      <div key={index} className="flex items-center gap-3">
                        <span className="w-10 text-right text-gray-500 font-bold">{stars} sao</span>
                        <div className="flex-1 h-2 bg-gray-200 rounded-full overflow-hidden">
                          <div className="h-full bg-gray-900 rounded-full" style={{ width: `${percent}%` }} />
                        </div>
                        <span className="w-8 text-gray-400">({count})</span>
                      </div>
                    );
                  })}
                </div>
              </div>

              {/* Review List */}
              <div className="space-y-4">
                <h4 className="font-bold text-xs uppercase tracking-widest text-gray-400">Đánh giá khách hàng</h4>
                {(!product.reviews || product.reviews.length === 0) ? (
                  <p className="text-xs text-gray-400">Chưa có đánh giá nào cho sản phẩm này.</p>
                ) : (
                  <div className="divide-y divide-gray-100 space-y-4">
                    {product.reviews.map((rev: any, index: number) => (
                      <div key={index} className="pt-4 first:pt-0 space-y-2">
                        <div className="flex items-center justify-between text-xs">
                          <div className="flex items-center gap-2">
                            <div className="w-7 h-7 rounded-full bg-gray-200 flex items-center justify-center text-gray-700 font-bold uppercase text-[10px]">
                              {rev.reviewerName?.charAt(0) || "U"}
                            </div>
                            <div>
                              <div className="font-bold text-gray-800">{rev.reviewerName}</div>
                              <div className="text-[10px] text-gray-400 flex items-center gap-1">
                                <Calendar className="w-3 h-3" /> {new Date(rev.date).toLocaleDateString("vi-VN")}
                              </div>
                            </div>
                          </div>
                          <div className="flex text-amber-400">
                            {Array.from({ length: 5 }).map((_, i) => (
                              <Star key={i} className={`w-3 h-3 ${i < rev.rating ? "fill-amber-400" : "text-gray-200"}`} />
                            ))}
                          </div>
                        </div>
                        <p className="text-xs sm:text-sm text-gray-600 leading-relaxed pl-9">
                          {rev.comment}
                        </p>
                      </div>
                    ))}
                  </div>
                )}
              </div>

              {/* Form */}
              <div className="pt-6 border-t border-gray-100 space-y-4">
                <h4 className="font-bold text-xs uppercase tracking-widest text-gray-400 flex items-center gap-1.5">
                  <MessageCircle className="w-4 h-4" /> Viết đánh giá của bạn
                </h4>
                <form onSubmit={handleReviewSubmit} className="space-y-4 max-w-xl bg-gray-50 p-5 rounded-2xl border border-border">
                  <div className="grid grid-cols-2 gap-3">
                    <div>
                      <label className="block text-[10px] font-bold uppercase tracking-widest text-gray-400 mb-1">Họ tên</label>
                      <input type="text" placeholder="Nhập tên" value={reviewerName} onChange={(e) => setReviewerName(e.target.value)}
                        className="w-full text-xs p-2.5 bg-white border border-border rounded-xl outline-none" required />
                    </div>
                    <div>
                      <label className="block text-[10px] font-bold uppercase tracking-widest text-gray-400 mb-1">Email</label>
                      <input type="email" placeholder="Nhập email" value={reviewerEmail} onChange={(e) => setReviewerEmail(e.target.value)}
                        className="w-full text-xs p-2.5 bg-white border border-border rounded-xl outline-none" required />
                    </div>
                  </div>

                  <div>
                    <label className="block text-[10px] font-bold uppercase tracking-widest text-gray-400 mb-1">Đánh giá sao</label>
                    <div className="flex gap-1">
                      {[1, 2, 3, 4, 5].map((star) => (
                        <button key={star} type="button" onClick={() => setReviewRating(star)} className="p-0.5">
                          <Star className={`w-5 h-5 ${star <= reviewRating ? "fill-amber-400 text-amber-400" : "text-gray-200"}`} />
                        </button>
                      ))}
                    </div>
                  </div>

                  <div>
                    <label className="block text-[10px] font-bold uppercase tracking-widest text-gray-400 mb-1">Nội dung</label>
                    <textarea rows={3} placeholder="Viết nhận xét của bạn..." value={reviewComment} onChange={(e) => setReviewComment(e.target.value)}
                      className="w-full text-xs p-2.5 bg-white border border-border rounded-xl outline-none resize-none" required />
                  </div>

                  <button type="submit" disabled={submittingReview}
                    className="bg-gray-900 hover:bg-gray-700 text-white font-bold text-xs py-2.5 px-6 rounded-xl transition-colors disabled:opacity-50">
                    {submittingReview ? "Đang gửi..." : "Gửi đánh giá"}
                  </button>
                </form>
              </div>
            </div>
          )}
        </div>
      </section>

      {/* Related Products */}
      {relatedProducts.length > 0 && (
        <section className="space-y-4">
          <h2 className="text-xl font-black text-gray-900">Sản Phẩm Tương Tự</h2>
          <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
            {relatedProducts.map((prod) => (
              <ProductCard key={prod.id} product={prod} />
            ))}
          </div>
        </section>
      )}

    </div>
  );
}
