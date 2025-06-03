// 新增優惠卷到某個會員身上
import { NextResponse } from "next/server";
import db from "@/lib/forum-db";

// *** 請求範例 ***
// method: POST
// http://localhost:3000/api/user-discounts/[user_id]/add

// JSON BODY:
// {
//   "discount_id": 3,
//   "expires_at": "2025-12-31"
// }

export async function POST(request, { params }) {
  try {
    const userId = parseInt(params.user_id);
    const { discount_id, expires_at } = await request.json();

    if (isNaN(userId) || isNaN(discount_id)) {
      return NextResponse.json(
        { success: false, message: "Invalid user or discount ID" },
        { status: 400 }
      );
    }

    const query =
      "INSERT INTO user_discounts (user_id, discount_id, expires_at) VALUES (?, ?, ?)";
    const [result] = await db.query(query, [userId, discount_id, expires_at]);

    return NextResponse.json({
      success: true,
      message: "優惠券已成功加入會員",
    });
  } catch (error) {
    console.error("Error adding discount to user:", error);
    return NextResponse.json(
      { success: false, message: "Failed to add discount to user" },
      { status: 500 }
    );
  }
}
