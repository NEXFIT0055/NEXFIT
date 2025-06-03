// *** 查詢使用者所有訂單 (GET)
import { NextResponse } from "next/server";
import db from "@/lib/forum-db";
import { verifyToken } from "@/lib/auth"; // 你自己的驗證函式

async function getUserIdFromRequest(request) {
  const authHeader = request.headers.get("Authorization");
  if (!authHeader) throw new Error("未授權訪問");

  const token = authHeader.split(" ")[1];
  if (!token) throw new Error("Token 不存在");

  const decoded = verifyToken(token);
  if (!decoded || !decoded.userId) throw new Error("無效的 Token");

  return decoded.userId;
}

export async function GET(request) {
  try {
    const user_id = await getUserIdFromRequest(request);

    const [orders] = await db.execute(
      `SELECT o.*, p.method AS payment_method, p.status AS payment_status, 
              s.method AS shipping_method, s.status AS shipping_status, s.store_name, s.store_address 
       FROM orders o
       LEFT JOIN payments p ON o.payment_id = p.id
       LEFT JOIN shippings s ON o.shipping_id = s.id
       WHERE o.user_id = ?
       ORDER BY o.created_at DESC`,
      [user_id]
    );

    return NextResponse.json({ orders });
  } catch (error) {
    console.error("查詢使用者所有訂單失敗：", error.message);
    const status = error.message.includes("未授權") ? 401 : 500;
    return NextResponse.json({ message: error.message }, { status });
  }
}
