import { NextRequest, NextResponse } from "next/server";
import { connectToDatabase } from "@/lib/db/mongodb";
import { User } from "@/models/User";
import jwt from "jsonwebtoken";

export const dynamic = "force-dynamic";

const JWT_SECRET = process.env.JWT_SECRET || "super_secret_jwt_key_antigravity_2026";

function getToken(req: NextRequest) {
  let token = req.cookies.get("token")?.value;
  if (!token) {
    const authHeader = req.headers.get("Authorization");
    if (authHeader && authHeader.startsWith("Bearer ")) {
      token = authHeader.substring(7);
    }
  }
  return token;
}

export async function GET(req: NextRequest) {
  try {
    await connectToDatabase();
    const token = getToken(req);

    if (!token) {
      return NextResponse.json({ success: false, error: "Chưa đăng nhập" }, { status: 401 });
    }

    const decoded: any = jwt.verify(token, JWT_SECRET);
    const user = await User.findOne({ username: decoded.username }).select("-password");

    if (!user) {
      return NextResponse.json({ success: false, error: "Người dùng không tồn tại" }, { status: 404 });
    }

    return NextResponse.json({ success: true, user });
  } catch (error: any) {
    return NextResponse.json({ success: false, error: "Phiên đăng nhập không hợp lệ" }, { status: 401 });
  }
}

export async function PUT(req: NextRequest) {
  try {
    await connectToDatabase();
    const token = getToken(req);

    if (!token) {
      return NextResponse.json({ success: false, error: "Chưa đăng nhập" }, { status: 401 });
    }

    const decoded: any = jwt.verify(token, JWT_SECRET);
    const body = await req.json();
    const { firstName, lastName, phone, address, city } = body;

    const user = await User.findOneAndUpdate(
      { username: decoded.username },
      {
        $set: {
          ...(firstName && { firstName }),
          ...(lastName && { lastName }),
          ...(phone !== undefined && { phone }),
          ...(address !== undefined && { address }),
          ...(city !== undefined && { city }),
        },
      },
      { new: true }
    ).select("-password");

    return NextResponse.json({ success: true, user, message: "Cập nhật thông tin thành công!" });
  } catch (error: any) {
    return NextResponse.json({ success: false, error: error.message }, { status: 500 });
  }
}
