import { NextResponse } from "next/server";
import { connectToDatabase } from "@/lib/db/mongodb";
import { Product } from "@/models/Product";
import { Category } from "@/models/Category";
import { User } from "@/models/User";
import { downloadImage } from "@/lib/seed/downloader";
import { categoryTranslations, productTranslations } from "@/lib/seed/vietnameseData";
import bcrypt from "bcryptjs";

export const maxDuration = 60;
export const dynamic = "force-dynamic";

export async function GET() {
  try {
    await connectToDatabase();

    // 1. Fetch products from DummyJSON (limit=80 to populate lots of products quickly)
    console.log("Seeding Vietnamese products & downloading images...");
    const productsResponse = await fetch("https://dummyjson.com/products?limit=80");
    const productsData = await productsResponse.json();
    const rawProducts = productsData.products;

    await Product.deleteMany({});

    const productsToSave = [];
    const activeCategorySlugs = new Set<string>();

    for (const prod of rawProducts) {
      console.log(`Processing product ${prod.id}: ${prod.title}`);

      // Track active category
      activeCategorySlugs.add(prod.category);

      // Download Thumbnail & Images
      const localThumbnail = await downloadImage(prod.thumbnail, prod.id, "thumbnail");
      const localImages: string[] = [];
      const imagesToDownload = (prod.images || []).slice(0, 3);
      for (let i = 0; i < imagesToDownload.length; i++) {
        const localImg = await downloadImage(imagesToDownload[i], prod.id, "image", i);
        localImages.push(localImg);
      }

      // Vietnamese translation lookup
      const viData = productTranslations[prod.id] || {};
      const title = viData.title || `Sản phẩm ${prod.title}`;
      const description = viData.description || prod.description || "Sản phẩm chất lượng cao chính hãng phân phối tại AGYShop.";
      const brand = viData.brand || prod.brand || "AGY Brand";
      const warrantyInformation = viData.warrantyInformation || "Bảo hành 12 tháng chính hãng";
      const shippingInformation = viData.shippingInformation || "Giao hàng hỏa tốc 2-3 ngày toàn quốc";

      const reviews = [
        { rating: 5, comment: "Sản phẩm chất lượng tuyệt vời, đóng gói cẩn thận!", date: new Date(), reviewerName: "Nguyễn Văn A", reviewerEmail: "a@gmail.com" },
        { rating: 4, comment: "Giao hàng cực kỳ nhanh chóng, rất hài lòng.", date: new Date(), reviewerName: "Trần Thị B", reviewerEmail: "b@gmail.com" }
      ];

      productsToSave.push({
        id: prod.id,
        title,
        description,
        category: prod.category,
        price: prod.price, // KEPT IN USD PRICE NUMBERS
        discountPercentage: prod.discountPercentage || 0,
        rating: prod.rating || 4.7,
        stock: prod.stock || 20,
        tags: prod.tags || [],
        brand,
        sku: prod.sku || `SKU-${prod.id}-${Math.floor(Math.random() * 1000)}`,
        weight: prod.weight || 1,
        dimensions: prod.dimensions || { width: 10, height: 10, depth: 10 },
        warrantyInformation,
        shippingInformation,
        availabilityStatus: "Còn hàng",
        reviews,
        images: localImages.length > 0 ? localImages : [localThumbnail],
        thumbnail: localThumbnail,
      });
    }

    await Product.insertMany(productsToSave);

    // 2. Fetch and Clean Categories (KEEP ONLY CATEGORIES THAT HAVE AT LEAST 1 PRODUCT)
    console.log("Seeding and cleaning categories (removing empty categories)...");
    const catResponse = await fetch("https://dummyjson.com/products/categories");
    const rawCategories = await catResponse.json();

    const categoriesToSave = [];
    for (const cat of rawCategories) {
      const slug = typeof cat === "string" ? cat : cat.slug;
      const originalName = typeof cat === "string" ? cat.replace(/-/g, " ") : cat.name;

      // Clean up: Only add category if it has products in our seeded products list
      if (activeCategorySlugs.has(slug)) {
        const name = categoryTranslations[slug] || (originalName.charAt(0).toUpperCase() + originalName.slice(1));
        categoriesToSave.push({
          slug,
          name,
          image: `/uploads/categories/${slug}.jpg`
        });
      }
    }

    await Category.deleteMany({});
    await Category.insertMany(categoriesToSave);

    // 3. Ensure Demo Accounts exist
    console.log("Ensuring demo users exist...");
    const existingAdmin = await User.findOne({ username: "admin" });
    if (!existingAdmin) {
      const adminPasswordHash = await bcrypt.hash("admin123", 10);
      await User.create({
        username: "admin",
        email: "admin@ecommerce.com",
        password: adminPasswordHash,
        firstName: "Quản Trị",
        lastName: "Hệ Thống",
        image: "https://dummyjson.com/icon/emilys/128",
        role: "admin",
      });
    }

    const existingEmily = await User.findOne({ username: "emilys" });
    if (!existingEmily) {
      const demoPasswordHash = await bcrypt.hash("emilyspass", 10);
      await User.create({
        username: "emilys",
        email: "emily.johnson@x.dummyjson.com",
        password: demoPasswordHash,
        firstName: "Emily",
        lastName: "Johnson",
        phone: "0988776655",
        address: "Số 123, Đường Nguyễn Huệ, Phường Bến Nghé, Quận 1, TP. Hồ Chí Minh",
        image: "https://dummyjson.com/icon/emilys/128",
        role: "user",
      });
    }

    return NextResponse.json({
      success: true,
      message: "Thêm sản phẩm và xóa sạch các danh mục rỗng thành công!",
      productsCount: productsToSave.length,
      activeCategoriesCount: categoriesToSave.length,
    });
  } catch (error: any) {
    console.error("Seed error:", error);
    return NextResponse.json(
      { success: false, error: error.message },
      { status: 500 }
    );
  }
}
