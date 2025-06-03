// 使用優惠券（更新為已使用）
// api/user-discounts/[user_id]/use/[discount_id]

import { NextResponse } from "next/server";
import db from "@/lib/forum-db";

export async function PATCH(request, { params }) {
  try {
    const userId = parseInt(params.user_id); // 從路由參數中取得 user_id
    const discountId = parseInt(params.discount_id);

    if (isNaN(userId) || isNaN(discountId)) {
      return NextResponse.json(
        { success: false, message: "Invalid user or discount ID" },
        { status: 400 }
      );
    }

    const query = `
            UPDATE user_discounts 
            SET is_used = 1 
            WHERE user_id = ? AND discount_id = ? AND is_used = 0
        `;
    const [result] = await db.query(query, [userId, discountId]);

    if (result.affectedRows === 0) {
      return NextResponse.json(
        { success: false, message: "優惠券無法使用或已使用" },
        { status: 400 }
      );
    }

    return NextResponse.json({ success: true, message: "優惠券使用成功" });
  } catch (error) {
    console.error("Error using discount:", error);
    return NextResponse.json(
      { success: false, message: "Failed to update discount" },
      { status: 500 }
    );
  }
}
