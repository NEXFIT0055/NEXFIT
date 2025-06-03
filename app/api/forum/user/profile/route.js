import { NextResponse } from "next/server";
import jwt from "jsonwebtoken";
import db from "@/lib/forum-db";

export async function GET(req) {
  try {
    // 取得 token
    const authHeader = req.headers.get("authorization");
    if (!authHeader || !authHeader.startsWith("Bearer ")) {
      return NextResponse.json({ message: "未登入" }, { status: 401 });
    }
    const token = authHeader.split(" ")[1];
    let decoded;
    try {
      decoded = jwt.verify(token, process.env.JWT_SECRET);
    } catch (err) {
      return NextResponse.json({ message: "無效的 token" }, { status: 401 });
    }
    const userId = decoded.userId;
    if (!userId) {
      return NextResponse.json({ message: "無效的 token" }, { status: 401 });
    }
    // 查詢 user_profiles
    const [rows] = await db.query(
      "SELECT user_id, name, nickname, avatar_url FROM user_profiles WHERE user_id = ?",
      [userId]
    );
    if (!rows || rows.length === 0) {
      return NextResponse.json({ message: "找不到用戶" }, { status: 404 });
    }
    const user = rows[0];
    // 這裡可根據你有無積分欄位調整
    return NextResponse.json({
      user_id: user.user_id,
      name: user.name,
      nickname: user.nickname,
      avatar_url: user.avatar_url,
      points: 0 // 如有積分欄位請改成 user.points
    });
  } catch (error) {
    console.error("取得用戶資料失敗:", error);
    return NextResponse.json({ message: "伺服器錯誤" }, { status: 500 });
  }
} 