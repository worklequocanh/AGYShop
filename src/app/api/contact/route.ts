import { NextResponse } from "next/server";
import { connectToDatabase } from "@/lib/db/mongodb";
import ContactMessage from "@/models/ContactMessage";
import { cookies } from "next/headers";
import jwt from "jsonwebtoken";

const JWT_SECRET = process.env.JWT_SECRET || "agyshop_secret_key";

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

// POST: Public submission from /contact page
export async function POST(req: Request) {
  try {
    await connectToDatabase();
    const body = await req.json();
    const { name, email, phone, subject, message } = body;

    if (!name || !email || !phone || !subject || !message) {
      return NextResponse.json(
        { success: false, error: "Vui lòng nhập đầy đủ các trường thông tin" },
        { status: 400 }
      );
    }

    const contactMsg = await ContactMessage.create({
      name,
      email,
      phone,
      subject,
      message,
      status: "unread",
    });

    return NextResponse.json(
      {
        success: true,
        message: "Cảm ơn bạn! Tin nhắn liên hệ đã được lưu vào hệ thống.",
        contact: contactMsg,
      },
      { status: 201 }
    );
  } catch (error: any) {
    return NextResponse.json(
      { success: false, error: error.message },
      { status: 500 }
    );
  }
}

// GET: Fetch all contact messages for Admin
export async function GET() {
  try {
    const isAdmin = await verifyAdmin();
    if (!isAdmin) {
      return NextResponse.json(
        { success: false, error: "Quyền truy cập bị từ chối" },
        { status: 403 }
      );
    }

    await connectToDatabase();
    const messages = await ContactMessage.find().sort({ createdAt: -1 });

    return NextResponse.json({ success: true, messages });
  } catch (error: any) {
    return NextResponse.json(
      { success: false, error: error.message },
      { status: 500 }
    );
  }
}

// PATCH: Update message status (e.g. mark as resolved)
export async function PATCH(req: Request) {
  try {
    const isAdmin = await verifyAdmin();
    if (!isAdmin) {
      return NextResponse.json(
        { success: false, error: "Quyền truy cập bị từ chối" },
        { status: 403 }
      );
    }

    await connectToDatabase();
    const { id, status } = await req.json();

    if (!id || !status) {
      return NextResponse.json(
        { success: false, error: "Thiếu ID hoặc trạng thái" },
        { status: 400 }
      );
    }

    const updated = await ContactMessage.findByIdAndUpdate(
      id,
      { status },
      { new: true }
    );

    if (!updated) {
      return NextResponse.json(
        { success: false, error: "Không tìm thấy tin nhắn" },
        { status: 404 }
      );
    }

    return NextResponse.json({ success: true, contact: updated });
  } catch (error: any) {
    return NextResponse.json(
      { success: false, error: error.message },
      { status: 500 }
    );
  }
}

// DELETE: Remove a contact message
export async function DELETE(req: Request) {
  try {
    const isAdmin = await verifyAdmin();
    if (!isAdmin) {
      return NextResponse.json(
        { success: false, error: "Quyền truy cập bị từ chối" },
        { status: 403 }
      );
    }

    const { searchParams } = new URL(req.url);
    const id = searchParams.get("id");

    if (!id) {
      return NextResponse.json(
        { success: false, error: "Thiếu ID tin nhắn" },
        { status: 400 }
      );
    }

    await connectToDatabase();
    await ContactMessage.findByIdAndDelete(id);

    return NextResponse.json({ success: true, message: "Đã xóa tin nhắn" });
  } catch (error: any) {
    return NextResponse.json(
      { success: false, error: error.message },
      { status: 500 }
    );
  }
}
