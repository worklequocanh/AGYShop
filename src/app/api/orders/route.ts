import { NextRequest, NextResponse } from "next/server";
import { connectToDatabase } from "@/lib/db/mongodb";
import { Order } from "@/models/Order";
import { Product } from "@/models/Product";
import jwt from "jsonwebtoken";

export const dynamic = "force-dynamic";

const JWT_SECRET = process.env.JWT_SECRET || "super_secret_jwt_key_antigravity_2026";

// Create order
export async function POST(req: NextRequest) {
  try {
    await connectToDatabase();

    const body = await req.json();
    const { items, totalAmount, shippingAddress, paymentMethod } = body;

    if (!items || items.length === 0 || !totalAmount || !shippingAddress || !paymentMethod) {
      return NextResponse.json(
        { success: false, error: "Thiếu thông tin đặt hàng" },
        { status: 400 }
      );
    }

    let username = "guest";
    let token = req.cookies.get("token")?.value;
    if (!token) {
      const authHeader = req.headers.get("Authorization");
      if (authHeader && authHeader.startsWith("Bearer ")) {
        token = authHeader.substring(7);
      }
    }

    if (token) {
      try {
        const decoded: any = jwt.verify(token, JWT_SECRET);
        username = decoded.username;
      } catch (err) {
        // ignore
      }
    }

    // Deduct stock and verify price
    for (const item of items) {
      const product = await Product.findOne({ id: item.productId });
      if (!product) {
        return NextResponse.json(
          { success: false, error: `Sản phẩm ${item.title} không tồn tại` },
          { status: 404 }
        );
      }

      if (product.stock < item.quantity) {
        return NextResponse.json(
          { success: false, error: `Sản phẩm ${product.title} không đủ hàng trong kho (Còn: ${product.stock})` },
          { status: 400 }
        );
      }

      product.stock -= item.quantity;
      await product.save();
    }

    const orderCode = `ORD-${Date.now().toString().slice(-6)}-${Math.floor(1000 + Math.random() * 9000)}`;

    const newOrder = new Order({
      orderCode,
      username,
      items,
      totalAmount,
      shippingAddress,
      paymentMethod,
      paymentStatus: "pending", // Payment starts pending for both COD and QR
      orderStatus: "pending",
    });

    await newOrder.save();

    return NextResponse.json({
      success: true,
      message: "Tạo đơn hàng thành công!",
      order: newOrder,
    });
  } catch (error: any) {
    console.error("Create order error:", error);
    return NextResponse.json(
      { success: false, error: error.message },
      { status: 500 }
    );
  }
}

// Get user orders
export async function GET(req: NextRequest) {
  try {
    await connectToDatabase();

    const { searchParams } = new URL(req.url);
    let username = searchParams.get("username");

    if (!username) {
      let token = req.cookies.get("token")?.value;
      if (!token) {
        const authHeader = req.headers.get("Authorization");
        if (authHeader && authHeader.startsWith("Bearer ")) {
          token = authHeader.substring(7);
        }
      }

      if (token) {
        try {
          const decoded: any = jwt.verify(token, JWT_SECRET);
          username = decoded.username;
        } catch (err) {
          // ignore
        }
      }
    }

    let orders;
    if (searchParams.get("all") === "true" || username === "admin" || username === "all") {
      orders = await Order.find({}).sort({ createdAt: -1 });
    } else {
      orders = await Order.find({ username }).sort({ createdAt: -1 });
    }

    return NextResponse.json({ success: true, orders });
  } catch (error: any) {
    return NextResponse.json(
      { success: false, error: error.message },
      { status: 500 }
    );
  }
}
