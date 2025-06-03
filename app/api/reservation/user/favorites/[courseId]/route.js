import { NextResponse } from "next/server";
import db from "@/lib/forum-db";
import jwt from "jsonwebtoken";

// 加入最愛
export async function POST(req, { params }) {
  const authHeader = req.headers.get("authorization");

  if (!authHeader || !authHeader.startsWith("Bearer ")) {
    return NextResponse.json({ success: false, error: "未登入" }, { status: 401 });
  }

  const token = authHeader.split(" ")[1];
  let userId;

  try {
    const decoded = jwt.verify(token, process.env.JWT_SECRET);
    userId = decoded.userId;
  } catch (err) {
    return NextResponse.json({ success: false, error: "JWT 驗證失敗" }, { status: 401 });
  }

  const courseId = parseInt(params.courseId, 10);
  if (!courseId) {
    return NextResponse.json({ success: false, error: "缺少課程 ID" }, { status: 400 });
  }

  try {
    await db.query(
      `INSERT IGNORE INTO course_likes (user_id, course_id, created_at) VALUES (?, ?, NOW())`,
      [userId, courseId]
    );

    return NextResponse.json({ success: true, message: "已加入最愛" });
  } catch (err) {
    console.error("加入最愛失敗：", err);
    return NextResponse.json({ success: false, error: "伺服器錯誤" }, { status: 500 });
  }
}

// 取消最愛
export async function DELETE(req, { params }) {
  const authHeader = req.headers.get("authorization");

  if (!authHeader || !authHeader.startsWith("Bearer ")) {
    return NextResponse.json({ success: false, error: "未登入" }, { status: 401 });
  }

  const token = authHeader.split(" ")[1];
  let userId;

  try {
    const decoded = jwt.verify(token, process.env.JWT_SECRET);
    userId = decoded.userId;
  } catch (err) {
    return NextResponse.json({ success: false, error: "JWT 驗證失敗" }, { status: 401 });
  }

  const courseId = parseInt(params.courseId, 10);
  if (!courseId) {
    return NextResponse.json({ success: false, error: "缺少課程 ID" }, { status: 400 });
  }

  try {
    await db.query(
      `DELETE FROM course_likes WHERE user_id = ? AND course_id = ?`,
      [userId, courseId]
    );

    return NextResponse.json({ success: true, message: "已取消最愛" });
  } catch (err) {
    console.error("取消最愛失敗：", err);
    return NextResponse.json({ success: false, error: "伺服器錯誤" }, { status: 500 });
  }
}
