// app/api/favorites/products/route.js
import { NextResponse } from "next/server";
import db from "@/lib/forum-db";
import { verifyToken } from "@/lib/auth"; // 你自己的驗證函式

// 驗證並取得 userId
async function getUserId(request) {
  const token = request.headers.get("Authorization")?.replace("Bearer ", "");
  const decoded = verifyToken(token);
  return decoded?.userId;
}

// 加入收藏 POST
export async function POST(request) {
  const { productId } = await request.json();
  const userId = await getUserId(request);
  if (!userId) return NextResponse.json({ error: "未登入" }, { status: 401 });

  await db.execute(
    "INSERT IGNORE INTO favorites_products (user_id, product_id) VALUES (?, ?)",
    [userId, productId]
  );
  return NextResponse.json({ success: true });
}

// 取消收藏 DELETE
export async function DELETE(request) {
  const { productId } = await request.json();
  const userId = await getUserId(request);
  if (!userId) return NextResponse.json({ error: "未登入" }, { status: 401 });

  await db.execute(
    "DELETE FROM favorites_products WHERE user_id = ? AND product_id = ?",
    [userId, productId]
  );
  return NextResponse.json({ success: true });
}

// 取得我的收藏 GET
export async function GET(request) {
  const userId = await getUserId(request);
  if (!userId) return NextResponse.json({ error: "未登入" }, { status: 401 });

  const [rows] = await db.execute(
    "SELECT product_id FROM favorites_products WHERE user_id = ?",
    [userId]
  );
  const productIds = rows.map((row) => row.product_id);
  return NextResponse.json({ favorites: productIds });
}
