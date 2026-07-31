import { NextResponse } from "next/server";
import { connectToDatabase } from "@/lib/db/mongodb";
import { Category } from "@/models/Category";

export const dynamic = "force-dynamic";

export async function GET() {
  try {
    await connectToDatabase();
    const categories = await Category.find({});
    return NextResponse.json({ success: true, categories });
  } catch (error: any) {
    console.error("Categories API DB Error:", error?.message);
    // Graceful fallback to avoid HTTP 500 error in browser
    return NextResponse.json({ success: true, categories: [], dbConnected: false }, { status: 200 });
  }
}
