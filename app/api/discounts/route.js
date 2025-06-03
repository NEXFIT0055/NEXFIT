import { NextResponse } from "next/server";
import db from "@/lib/forum-db";

// 取得所有有效優惠券
// /api/discounts
export async function GET() {
  try {
    const query = "SELECT * FROM discounts WHERE is_active = 1";
    const [rows] = await db.query(query);
    return NextResponse.json({ success: true, data: rows });
  } catch (error) {
    console.error("Error fetching discounts:", error);
    return NextResponse.json(
      { success: false, message: "Failed to fetch discounts" },
      { status: 500 }
    );
  }
}
