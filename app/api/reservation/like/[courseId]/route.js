import { NextResponse } from "next/server";
import db from "@/lib/forum-db";
import jwt from "jsonwebtoken";

export const dynamic = "force-dynamic";

export async function POST(request, { params }) {
  const courseId = parseInt(params.courseId, 10);
  const authHeader = request.headers.get("authorization");
  let userId = null;

  if (!authHeader?.startsWith("Bearer ")) {
    return NextResponse.json({ success: false, error: "未授權" }, { status: 401 });
  }

  try {
    const token = authHeader.split(" ")[1];
    const decoded = jwt.verify(token, process.env.JWT_SECRET);
    userId = decoded.userId;
  } catch (err) {
    return NextResponse.json({ success: false, error: "JWT 驗證失敗" }, { status: 403 });
  }

  if (!courseId || !userId) {
    return NextResponse.json({ success: false, error: "缺少必要參數" }, { status: 400 });
  }

  // 避免重複 insert
  await db.query(
    `INSERT IGNORE INTO course_likes (user_id, course_id, created_at)
     VALUES (?, ?, NOW())`,
    [userId, courseId]
  );

  return NextResponse.json({ success: true, message: "已加入最愛" });
}

export async function DELETE(request, { params }) {
  const courseId = parseInt(params.courseId, 10);
  const authHeader = request.headers.get("authorization");
  let userId = null;

  if (!authHeader?.startsWith("Bearer ")) {
    return NextResponse.json({ success: false, error: "未授權" }, { status: 401 });
  }

  try {
    const token = authHeader.split(" ")[1];
    const decoded = jwt.verify(token, process.env.JWT_SECRET);
    userId = decoded.userId;
  } catch (err) {
    return NextResponse.json({ success: false, error: "JWT 驗證失敗" }, { status: 403 });
  }

  if (!courseId || !userId) {
    return NextResponse.json({ success: false, error: "缺少必要參數" }, { status: 400 });
  }

  await db.query(
    `DELETE FROM course_likes WHERE user_id = ? AND course_id = ?`,
    [userId, courseId]
  );

  return NextResponse.json({ success: true, message: "已取消最愛" });
}
