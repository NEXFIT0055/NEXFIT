import { NextResponse } from "next/server";
import db from "@/lib/forum-db";
import jwt from "jsonwebtoken";

export const dynamic = "force-dynamic";

export async function GET(request, { params }) {
  const occurrenceId = parseInt(params.id, 10); // ← 這裡是 [id] 而不是 [courseId]
  const authHeader = request.headers.get("authorization");
  let userId = null;

  // 解析 JWT 取得使用者 ID
  if (authHeader && authHeader.startsWith("Bearer ")) {
    try {
      const token = authHeader.split(" ")[1];
      const decoded = jwt.verify(token, process.env.JWT_SECRET);
      userId = decoded.userId;
    } catch (e) {
      console.warn("JWT 驗證失敗：", e.message);
    }
  }

  // 找出這筆 occurrence
  const [occurRows] = await db.query(
    `SELECT * FROM course_occurrences WHERE id = ?`,
    [occurrenceId]
  );

  if (!occurRows.length) {
    return NextResponse.json({
      success: false,
      error: "找不到該場次",
      data: {},
    }, { status: 404 });
  }

  const occurrence = occurRows[0];

  // 找出對應課程
  const [courseRows] = await db.query(
    `SELECT * FROM courses WHERE id = ?`,
    [occurrence.course_id]
  );
  if (!courseRows.length) {
    return NextResponse.json({
      success: false,
      error: "找不到課程資料",
      data: {},
    }, { status: 404 });
  }
  const course = courseRows[0];

  // 找出教練
  let coach = null;
  if (course.coach_id) {
    const [coachRows] = await db.query(
      `SELECT id, name, location, classroom_name FROM coach WHERE id = ?`,
      [course.coach_id]
    );
    coach = coachRows[0] || null;
  }

  return NextResponse.json({
    success: true,
    data: {
      userId,
      courseId: course.id,
      courseName: course.name,
      image: course.image || "",
      description: course.description,
      points: course.points_required,
      instructor: coach?.name || "未知",
      location: {
        address: coach?.location || "",
        name: coach?.classroom_name || "",
      },
      occurrence: {
        id: occurrence.id,
        date: occurrence.occurrence_date,
        start_time: occurrence.start_time.slice(0, 5),
        end_time: occurrence.end_time.slice(0, 5),
      },
    },
  });
}
