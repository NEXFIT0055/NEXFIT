import { NextResponse } from "next/server";
import jwt from "jsonwebtoken";
import db from "@/lib/forum-db";

// 取得 user_id from token
function getUserIdFromToken(req) {
  const authHeader = req.headers.get("authorization");
  if (!authHeader || !authHeader.startsWith("Bearer ")) return null;
  const token = authHeader.split(" ")[1];
  try {
    const decoded = jwt.verify(token, process.env.JWT_SECRET);
    return decoded.userId ? Number(decoded.userId) : null;
  } catch {
    return null;
  }
}

// 新增收藏
export async function POST(req) {
  const userId = getUserIdFromToken(req);
  if (!userId) return NextResponse.json({ error: "未登入" }, { status: 401 });
  const { post_id } = await req.json();
  if (!post_id) return NextResponse.json({ error: "缺少 post_id" }, { status: 400 });
  try {
    await db.execute(
      "INSERT IGNORE INTO forum_favorites (user_id, post_id) VALUES (?, ?)",
      [userId, post_id]
    );
    return NextResponse.json({ message: "已收藏" });
  } catch (error) {
    return NextResponse.json({ error: "收藏失敗" }, { status: 500 });
  }
}

// 取消收藏
export async function DELETE(req) {
  const userId = getUserIdFromToken(req);
  if (!userId) return NextResponse.json({ error: "未登入" }, { status: 401 });
  const { post_id } = await req.json();
  if (!post_id) return NextResponse.json({ error: "缺少 post_id" }, { status: 400 });
  try {
    await db.execute(
      "DELETE FROM forum_favorites WHERE user_id = ? AND post_id = ?",
      [userId, post_id]
    );
    return NextResponse.json({ message: "已取消收藏" });
  } catch (error) {
    return NextResponse.json({ error: "取消收藏失敗" }, { status: 500 });
  }
}

// 查詢用戶所有收藏
export async function GET(req) {
  const userId = getUserIdFromToken(req);
  if (!userId) return NextResponse.json({ error: "未登入" }, { status: 401 });
  try {
    // 取得所有收藏的文章id與文章資訊
    const [rows] = await db.execute(
      `SELECT p.* FROM forum_favorites f JOIN forum_posts p ON f.post_id = p.id WHERE f.user_id = ? ORDER BY f.created_at DESC`,
      [userId]
    );
    return NextResponse.json({ favorites: rows });
  } catch (error) {
    return NextResponse.json({ error: "查詢收藏失敗" }, { status: 500 });
  }
}
