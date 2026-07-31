const fs = require("fs");
const path = require("path");
const mongoose = require("mongoose");
const bcrypt = require("bcryptjs");
const dns = require("dns");

// Force Node.js to use Google/Cloudflare DNS to resolve MongoDB Atlas SRV records
try {
  dns.setServers(["8.8.8.8", "1.1.1.1"]);
} catch (err) {
  console.warn("⚠️ Không thể ghi đè DNS, tiếp tục với DNS mặc định.");
}

// 1. Read .env.local file to extract MONGODB_URI
let MONGODB_URI = "";
try {
  const envPath = path.join(__dirname, "..", ".env.local");
  if (fs.existsSync(envPath)) {
    const envContent = fs.readFileSync(envPath, "utf8");
    const lines = envContent.split("\n");
    for (const line of lines) {
      if (line.startsWith("MONGODB_URI=")) {
        MONGODB_URI = line.replace("MONGODB_URI=", "").trim();
      }
    }
  }
} catch (err) {
  console.error("Error reading .env.local:", err.message);
}

if (!MONGODB_URI) {
  console.error("❌ Lỗi: Không tìm thấy biến môi trường MONGODB_URI trong .env.local");
  process.exit(1);
}

// 2. Define Mongoose Schemas directly in script for standalone execution
const CategorySchema = new mongoose.Schema({
  slug: { type: String, required: true, unique: true },
  name: { type: String, required: true },
  image: { type: String, default: "" },
});

const ReviewSchema = new mongoose.Schema({
  rating: { type: Number, required: true },
  comment: { type: String, required: true },
  date: { type: Date, default: Date.now },
  reviewerName: { type: String, required: true },
  reviewerEmail: { type: String, required: true },
});

const ProductSchema = new mongoose.Schema({
  id: { type: Number, required: true, unique: true },
  title: { type: String, required: true },
  description: { type: String, required: true },
  category: { type: String, required: true },
  price: { type: Number, required: true },
  discountPercentage: { type: Number, default: 0 },
  rating: { type: Number, default: 0 },
  stock: { type: Number, default: 0 },
  tags: [{ type: String }],
  brand: { type: String },
  sku: { type: String },
  weight: { type: Number },
  dimensions: {
    width: { type: Number },
    height: { type: Number },
    depth: { type: Number },
  },
  warrantyInformation: { type: String },
  shippingInformation: { type: String },
  availabilityStatus: { type: String },
  reviews: [ReviewSchema],
  images: [{ type: String }],
  thumbnail: { type: String, required: true },
}, { timestamps: true });

const UserSchema = new mongoose.Schema({
  username: { type: String, required: true, unique: true },
  email: { type: String, required: true, unique: true },
  password: { type: String, required: true },
  firstName: { type: String, required: true },
  lastName: { type: String, required: true },
  image: { type: String, default: "" },
  role: { type: String, enum: ["user", "admin"], default: "user" },
}, { timestamps: true });

const Category = mongoose.models.Category || mongoose.model("Category", CategorySchema);
const Product = mongoose.models.Product || mongoose.model("Product", ProductSchema);
const User = mongoose.models.User || mongoose.model("User", UserSchema);

// Image Downloader Helper
async function downloadImage(url, productId, type, index) {
  try {
    const response = await fetch(url);
    if (!response.ok) throw new Error(`Fetch error: ${response.statusText}`);
    const arrayBuffer = await response.arrayBuffer();
    const buffer = Buffer.from(arrayBuffer);

    const publicDir = path.join(process.cwd(), "public");
    const uploadsDir = path.join(publicDir, "uploads", "products");
    
    if (!fs.existsSync(uploadsDir)) {
      fs.mkdirSync(uploadsDir, { recursive: true });
    }

    const urlObj = new URL(url);
    let ext = path.extname(urlObj.pathname);
    if (!ext || ext.length > 5) ext = ".jpg";

    const filename = type === "thumbnail" 
      ? `product_${productId}_thumb${ext}`
      : `product_${productId}_img_${index}${ext}`;

    const filePath = path.join(uploadsDir, filename);
    fs.writeFileSync(filePath, buffer);

    return `/uploads/products/${filename}`;
  } catch (error) {
    console.warn(`⚠️ Lỗi tải ảnh ${url}, dùng link gốc fallback.`);
    return url;
  }
}

async function seed() {
  try {
    console.log("🔌 Đang kết nối tới MongoDB...");
    await mongoose.connect(MONGODB_URI);
    console.log("✅ Kết nối database thành công!");

    // 1. Seed Categories
    console.log("📦 Đang lấy danh mục từ DummyJSON...");
    const catRes = await fetch("https://dummyjson.com/products/categories");
    const rawCategories = await catRes.json();
    
    const categoriesToSave = [];
    for (const cat of rawCategories) {
      const slug = typeof cat === "string" ? cat : cat.slug;
      const name = typeof cat === "string" ? cat.replace(/-/g, " ") : cat.name;
      
      categoriesToSave.push({
        slug,
        name: name.charAt(0).toUpperCase() + name.slice(1),
        image: `/uploads/categories/${slug}.jpg`
      });
    }

    console.log("🧹 Đang làm sạch bảng Category...");
    await Category.deleteMany({});
    await Category.insertMany(categoriesToSave);
    console.log(`✅ Đã nạp thành công ${categoriesToSave.length} danh mục.`);

    // 2. Ensure Demo Accounts exist (without wiping custom user data)
    console.log("👥 Đang kiểm tra và đảm bảo các tài khoản mẫu tồn tại...");
    
    // Check & Upsert Admin account
    const existingAdmin = await User.findOne({ username: "admin" });
    if (!existingAdmin) {
      const adminHash = await bcrypt.hash("admin123", 10);
      await User.create({
        username: "admin",
        email: "admin@ecommerce.com",
        password: adminHash,
        firstName: "Admin",
        lastName: "Super",
        image: "https://dummyjson.com/icon/emilys/128",
        role: "admin",
      });
      console.log("➡️ Đã tạo tài khoản Admin dùng thử.");
    }

    // Check & Upsert Emily normal account
    const existingEmily = await User.findOne({ username: "emilys" });
    if (!existingEmily) {
      const demoHash = await bcrypt.hash("emilyspass", 10);
      await User.create({
        username: "emilys",
        email: "emily.johnson@x.dummyjson.com",
        password: demoHash,
        firstName: "Emily",
        lastName: "Johnson",
        image: "https://dummyjson.com/icon/emilys/128",
        role: "user",
      });
      console.log("➡️ Đã tạo tài khoản User dùng thử.");
    }

    // 3. Seed Products & Download Images
    console.log("🛍️ Đang lấy danh sách sản phẩm và tải ảnh về máy...");
    const productsRes = await fetch("https://dummyjson.com/products?limit=40");
    const productsData = await productsRes.json();
    const rawProducts = productsData.products;

    await Product.deleteMany({});

    const productsToSave = [];
    for (const prod of rawProducts) {
      console.log(`📥 Đang tải ảnh cho sản phẩm [ID: ${prod.id}]: ${prod.title}`);
      
      const localThumbnail = await downloadImage(prod.thumbnail, prod.id, "thumbnail");

      const localImages = [];
      const imagesToDownload = prod.images.slice(0, 2); // Download first 2 images
      for (let i = 0; i < imagesToDownload.length; i++) {
        const localImg = await downloadImage(imagesToDownload[i], prod.id, "image", i);
        localImages.push(localImg);
      }

      const reviews = prod.reviews?.map((r) => ({
        rating: r.rating || 5,
        comment: r.comment || "Sản phẩm tốt, tôi rất hài lòng!",
        date: r.date ? new Date(r.date) : new Date(),
        reviewerName: r.reviewerName || "Khách hàng ẩn danh",
        reviewerEmail: r.reviewerEmail || "customer@example.com",
      })) || [];

      productsToSave.push({
        id: prod.id,
        title: prod.title,
        description: prod.description,
        category: prod.category,
        price: prod.price,
        discountPercentage: prod.discountPercentage || 0,
        rating: prod.rating || 4.5,
        stock: prod.stock || 10,
        tags: prod.tags || [],
        brand: prod.brand || "Generics",
        sku: prod.sku || `SKU-${prod.id}-${Math.floor(Math.random() * 1000)}`,
        weight: prod.weight || 1,
        dimensions: prod.dimensions || { width: 10, height: 10, depth: 10 },
        warrantyInformation: prod.warrantyInformation || "1 year warranty",
        shippingInformation: prod.shippingInformation || "Ships in 3-5 business days",
        availabilityStatus: prod.availabilityStatus || "In Stock",
        reviews,
        images: localImages.length > 0 ? localImages : [localThumbnail],
        thumbnail: localThumbnail,
      });
    }

    await Product.insertMany(productsToSave);
    console.log(`✅ Đã nạp thành công ${productsToSave.length} sản phẩm và lưu ảnh local.`);

    console.log("⭐ HOÀN THÀNH SETUP BACKEND DATABASE THÀNH CÔNG!");
    process.exit(0);
  } catch (error) {
    console.error("❌ Lỗi trong quá trình Seed Database:", error);
    process.exit(1);
  }
}

seed();
