import { NextResponse } from "next/server";
import db from "@/lib/forum-db";
import jwt from "jsonwebtoken";


export const dynamic = "force-dynamic";

export async function GET(req, { params }) {
  const reservationId = parseInt(params.reservationId, 10);

  if (!reservationId) {
    return NextResponse.json({ success: false, error: "缺少預約 ID" }, { status: 400 });
  }

  try {
    // 查詢預約紀錄及關聯資料
    const [rows] = await db.query(`
      SELECT 
        r.id AS reservation_id,
        r.note,
        o.occurrence_date,
        TIME_FORMAT(o.start_time, '%H:%i') AS start_time,
        TIME_FORMAT(o.end_time, '%H:%i') AS end_time,
        c.name AS course_name,
        c.image,
        c.description AS course_description,
        c.points_required,
        u.email,
        p.name AS user_name,
        p.phone,
        coach.name AS coach_name,
        coach.location AS coach_location,
        coach.classroom_name
      FROM course_reservations r
      JOIN course_occurrences o ON r.occurrence_id = o.id
      JOIN courses c ON o.course_id = c.id
      JOIN users u ON r.user_id = u.id
      JOIN user_profiles p ON u.id = p.user_id
      LEFT JOIN coach ON c.coach_id = coach.id
      WHERE r.id = ?
    `, [reservationId]);

    if (!rows.length) {
      return NextResponse.json({ success: false, error: "查無預約紀錄" }, { status: 404 });
    }

    const data = rows[0];

    return NextResponse.json({
      success: true,
      data: {
        reservation_id: data.reservation_id,
        note: data.note,
        course_name: data.course_name,
        image: data.image,
        description: data.course_description,
        points: data.points_required,
        date: data.occurrence_date,
        start_time: data.start_time,
        end_time: data.end_time,
        user: {
          name: data.user_name,
          email: data.email,
          phone: data.phone,
        },
        coach: {
          name: data.coach_name,
          location: data.coach_location,
          studio: data.classroom_name,
        },
      },
    });

  } catch (err) {
    console.error("取得預約資料失敗：", err);
    return NextResponse.json({ success: false, error: "伺服器錯誤" }, { status: 500 });
  }
}
