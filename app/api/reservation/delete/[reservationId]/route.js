import { NextResponse } from "next/server";
import db from "@/lib/forum-db";
import jwt from "jsonwebtoken";

export async function DELETE(request, { params }) {
  const { reservationId } = params;
  const authHeader = request.headers.get("authorization");

  if (!authHeader?.startsWith("Bearer ")) {
    return NextResponse.json({ success: false, error: "未授權" }, { status: 401 });
  }

  let userId;
  try {
    const token = authHeader.split(" ")[1];
    const decoded = jwt.verify(token, process.env.JWT_SECRET);
    userId = decoded.userId;
  } catch {
    return NextResponse.json({ success: false, error: "JWT 驗證失敗" }, { status: 401 });
  }

  try {
    const [result] = await db.execute(
      "DELETE FROM course_reservations WHERE id = ? AND user_id = ?",
      [reservationId, userId]
    );

    if (result.affectedRows === 0) {
      return NextResponse.json({ success: false, error: "找不到預約或無權刪除" }, { status: 403 });
    }

    return NextResponse.json({ success: true });
  } catch (err) {
    console.error("刪除失敗:", err);
    return NextResponse.json({ success: false, error: "伺服器錯誤" }, { status: 500 });
  }
}
