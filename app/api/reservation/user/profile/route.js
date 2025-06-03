import { NextResponse } from "next/server";
import db from "@/lib/forum-db";
import jwt from "jsonwebtoken";

export async function GET(req) {
  try {
    const authHeader = req.headers.get("authorization");
    console.log("authHeader:", authHeader);
    if (!authHeader || !authHeader.startsWith("Bearer ")) {
      return NextResponse.json({ message: "未登入" }, { status: 401 });
    }

    const token = authHeader.split(" ")[1];
    const decoded = jwt.verify(token, process.env.JWT_SECRET);
    console.log("decoded:", decoded);

    const userId = decoded.userId;

    // 取得使用者基本資料
    const [rows] = await db.query(
      `SELECT 
         u.id AS user_id, 
         u.email,
         p.name, 
         p.phone, 
         p.nickname, 
         p.avatar_url
       FROM users u
       JOIN user_profiles p ON u.id = p.user_id
       WHERE u.id = ?`,
      [userId]
    );

    console.log("user rows:", rows);

    if (!rows || rows.length === 0) {
      return NextResponse.json({ message: "找不到用戶" }, { status: 404 });
    }

    const user = rows[0];

    // 查詢該用戶所有預約紀錄（含時間）
    const [reservationRows] = await db.query(
      `SELECT r.id, r.occurrence_id, o.course_id, 
              DATE_FORMAT(o.occurrence_date, '%Y-%m-%d') AS date,
              TIME_FORMAT(o.start_time, '%H:%i') AS start_time,
              TIME_FORMAT(o.end_time, '%H:%i') AS end_time
       FROM course_reservations r
       JOIN course_occurrences o ON r.occurrence_id = o.id
       WHERE r.user_id = ?`,
      [userId]
    );

    const reservations = reservationRows.map(r => ({
      id: r.id,
      course_id: r.course_id,
      date: r.date,
      start_time: r.start_time,
      end_time: r.end_time
    }));

    return NextResponse.json({
      success: true,
      data: {
        user_id: user.user_id,
        name: user.name,
        email: user.email,
        phone: user.phone,
        nickname: user.nickname,
        avatar_url: user.avatar_url,
        reservations
      }
    });

  } catch (error) {
    console.error("JWT 錯誤:", error.message);
    if (error.name === 'JsonWebTokenError') {
      return NextResponse.json({ message: "JWT 無效" }, { status: 401 });
    }
    return NextResponse.json({ message: "伺服器錯誤" }, { status: 500 });
  }
} 