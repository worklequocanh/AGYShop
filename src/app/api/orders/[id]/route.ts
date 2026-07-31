import { NextRequest, NextResponse } from "next/server";
import { connectToDatabase } from "@/lib/db/mongodb";
import { Order } from "@/models/Order";

export const dynamic = "force-dynamic";

export async function GET(
  req: NextRequest,
  { params }: { params: { id: string } }
) {
  try {
    await connectToDatabase();
    const orderCodeOrId = params.id;

    let order = await Order.findOne({
      $or: [
        { orderCode: orderCodeOrId },
        { _id: orderCodeOrId.match(/^[0-9a-fA-F]{24}$/) ? orderCodeOrId : null }
      ]
    });

    if (!order) {
      return NextResponse.json({ success: false, error: "Không tìm thấy đơn hàng" }, { status: 404 });
    }

    return NextResponse.json({ success: true, order });
  } catch (error: any) {
    return NextResponse.json({ success: false, error: error.message }, { status: 500 });
  }
}

export async function PATCH(
  req: NextRequest,
  { params }: { params: { id: string } }
) {
  try {
    await connectToDatabase();
    const orderCodeOrId = params.id;
    const body = await req.json();
    const { paymentStatus } = body;

    const order = await Order.findOneAndUpdate(
      {
        $or: [
          { orderCode: orderCodeOrId },
          { _id: orderCodeOrId.match(/^[0-9a-fA-F]{24}$/) ? orderCodeOrId : null }
        ]
      },
      { $set: { paymentStatus: paymentStatus || "paid" } },
      { new: true }
    );

    if (!order) {
      return NextResponse.json({ success: false, error: "Không tìm thấy đơn hàng" }, { status: 404 });
    }

    return NextResponse.json({ success: true, order, message: "Thanh toán thành công!" });
  } catch (error: any) {
    return NextResponse.json({ success: false, error: error.message }, { status: 500 });
  }
}
