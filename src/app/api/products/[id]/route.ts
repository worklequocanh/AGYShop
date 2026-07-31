import { NextRequest, NextResponse } from "next/server";
import { connectToDatabase } from "@/lib/db/mongodb";
import { Product } from "@/models/Product";

export const dynamic = "force-dynamic";

export async function GET(
  req: NextRequest,
  { params }: { params: { id: string } }
) {
  try {
    await connectToDatabase();
    
    const idNum = parseInt(params.id, 10);
    let product;
    if (isNaN(idNum)) {
      product = await Product.findById(params.id);
    } else {
      product = await Product.findOne({ id: idNum });
    }

    if (!product) {
      return NextResponse.json(
        { success: false, error: "Không tìm thấy sản phẩm" },
        { status: 404 }
      );
    }

    return NextResponse.json({ success: true, product });
  } catch (error: any) {
    console.error("Product detail DB Error:", error?.message);
    return NextResponse.json(
      { success: false, error: "Lỗi kết nối cơ sở dữ liệu MongoDB Atlas (Kiểm tra IP Whitelist)" },
      { status: 200 }
    );
  }
}

export async function POST(
  req: NextRequest,
  { params }: { params: { id: string } }
) {
  try {
    await connectToDatabase();
    const idNum = parseInt(params.id, 10);
    const body = await req.json();
    const { rating, comment, reviewerName, reviewerEmail } = body;

    if (!rating || !comment || !reviewerName || !reviewerEmail) {
      return NextResponse.json(
        { success: false, error: "Vui lòng nhập đầy đủ thông tin đánh giá" },
        { status: 400 }
      );
    }

    const product = await Product.findOne({ id: idNum });
    if (!product) {
      return NextResponse.json(
        { success: false, error: "Không tìm thấy sản phẩm" },
        { status: 404 }
      );
    }

    const newReview = {
      rating: Number(rating),
      comment,
      reviewerName,
      reviewerEmail,
      date: new Date()
    };

    product.reviews.push(newReview);

    const totalRating = product.reviews.reduce((sum: number, r: any) => sum + r.rating, 0);
    product.rating = Number((totalRating / product.reviews.length).toFixed(2));

    await product.save();

    return NextResponse.json({ success: true, reviews: product.reviews, rating: product.rating });
  } catch (error: any) {
    return NextResponse.json(
      { success: false, error: "Lỗi kết nối cơ sở dữ liệu MongoDB Atlas" },
      { status: 200 }
    );
  }
}
