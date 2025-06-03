import { verifyToken } from "@/lib/auth";
import db from "@/lib/forum-db";
import { NextResponse } from "next/server";

export async function POST(req) {
  try {
    const token = req.headers.get("authorization")?.split(" ")[1];

    if (!token) {
      return NextResponse.json({
        success: false,
        message: "未提供認證token",
        status: 401,
      });
    }

    const decoded = verifyToken(token);
    if (!decoded) {
      return NextResponse.json({
        success: false,
        message: "無效或過期的token",
        status: 401,
      });
    }

    const [users] = await db.query(
      "SELECT u.id, u.email FROM users u WHERE u.id = ?",
      [decoded.userId]
    );

    if (users.length === 0) {
      return NextResponse.json({
        success: false,
        message: "用戶不存在",
        status: 404,
      });
    }

    return NextResponse.json({
      success: true,
      userId: decoded.userId,
      email: users[0].email,
      name: users[0].name,
      status: 200,
    });
  } catch (error) {
    console.error("驗證失敗:", error);
    return NextResponse.json({
      success: false,
      message: "驗證失敗: " + error.message,
      status: 500,
    });
  }
}
