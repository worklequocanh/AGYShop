import { NextRequest, NextResponse } from "next/server";
import { connectToDatabase } from "@/lib/db/mongodb";
import { Product } from "@/models/Product";
import { cookies } from "next/headers";
import jwt from "jsonwebtoken";

const JWT_SECRET = process.env.JWT_SECRET || "agyshop_secret_key";

export const dynamic = "force-dynamic";

async function verifyAdmin() {
  const cookieStore = cookies();
  const token = cookieStore.get("token")?.value;
  if (!token) return false;
  try {
    const decoded: any = jwt.verify(token, JWT_SECRET);
    return decoded.role === "admin";
  } catch {
    return false;
  }
}

export async function GET(req: NextRequest) {
  try {
    await connectToDatabase();

    const { searchParams } = new URL(req.url);
    const category = searchParams.get("category");
    const minPrice = parseFloat(searchParams.get("minPrice") || "0");
    const maxPrice = parseFloat(searchParams.get("maxPrice") || "999999999");
    const rating = parseFloat(searchParams.get("rating") || "0");
    const search = searchParams.get("search") || "";
    const sortBy = searchParams.get("sortBy") || "id";
    const sortOrder = searchParams.get("sortOrder") || "asc";
    const page = parseInt(searchParams.get("page") || "1", 10);
    const limit = parseInt(searchParams.get("limit") || "12", 10);

    const skip = (page - 1) * limit;

    const filter: any = {};
    filter.price = { $gte: minPrice, $lte: maxPrice };

    if (rating > 0) filter.rating = { $gte: rating };
    if (category) filter.category = category;

    if (search) {
      filter.$or = [
        { title: { $regex: search, $options: "i" } },
        { description: { $regex: search, $options: "i" } },
        { brand: { $regex: search, $options: "i" } },
      ];
    }

    const sort: any = {};
    if (sortBy) {
      sort[sortBy] = sortOrder === "desc" ? -1 : 1;
    }

    const products = await Product.find(filter)
      .sort(sort)
      .skip(skip)
      .limit(limit);

    const total = await Product.countDocuments(filter);

    return NextResponse.json({
      success: true,
      products,
      pagination: {
        total,
        page,
        limit,
        pages: Math.ceil(total / limit) || 1,
      },
    });
  } catch (error: any) {
    console.error("Products API DB Error:", error?.message);
    return NextResponse.json(
      {
        success: true,
        products: [],
        pagination: { total: 0, page: 1, limit: 12, pages: 1 },
        dbConnected: false,
      },
      { status: 200 }
    );
  }
}

// POST: Admin Create New Product
export async function POST(req: NextRequest) {
  try {
    const isAdmin = await verifyAdmin();
    if (!isAdmin) {
      return NextResponse.json(
        { success: false, error: "Quyền truy cập bị từ chối" },
        { status: 403 }
      );
    }

    await connectToDatabase();
    const body = await req.json();
    const { title, price, category, stock, brand, thumbnail, description, discountPercentage } = body;

    if (!title || !price || !category) {
      return NextResponse.json(
        { success: false, error: "Tên sản phẩm, giá và danh mục là bắt buộc" },
        { status: 400 }
      );
    }

    const id = Date.now().toString();

    const newProduct = await Product.create({
      id,
      title,
      price: parseFloat(price),
      discountPercentage: parseFloat(discountPercentage || 0),
      rating: 4.8,
      stock: parseInt(stock || 10, 10),
      brand: brand || "AGYShop",
      category,
      thumbnail: thumbnail || "https://cdn.dummyjson.com/product-images/1/thumbnail.jpg",
      images: [thumbnail || "https://cdn.dummyjson.com/product-images/1/thumbnail.jpg"],
      description: description || "Sản phẩm chính hãng phân phối bởi AGYShop.",
    });

    return NextResponse.json(
      { success: true, message: "Đã tạo sản phẩm thành công", product: newProduct },
      { status: 201 }
    );
  } catch (error: any) {
    return NextResponse.json(
      { success: false, error: error.message },
      { status: 500 }
    );
  }
}
