import { NextResponse } from "next/server";
import db from "@/lib/forum-db";
import jwt from "jsonwebtoken";

export const dynamic = "force-dynamic"; // 強制重新執行 API

export async function GET(request, { params }) {
  const courseId = parseInt(params.courseId, 10);
  const authHeader = request.headers.get("authorization");
  let userId = null;

  if (authHeader && authHeader.startsWith("Bearer ")) {
    try {
      const token = authHeader.split(" ")[1];
      const decoded = jwt.verify(token, process.env.JWT_SECRET);
      userId = decoded.userId;
    } catch (e) {
      console.warn("JWT 驗證失敗：", e.message);
    }
  }

  if (!courseId) {
    return NextResponse.json({
      success: false,
      error: "查無該課程",
      data: {},
    });
  }

  const [courseRows] = await db.query(`SELECT * FROM courses WHERE id = ?`, [courseId]);
  if (!courseRows.length) {
    return NextResponse.json({
      success: false,
      error: "沒有該項課程資料",
      data: {},
    });
  }

  const course = courseRows[0];

  let coach = null;
  if (course.coach_id) {
    const [coachRows] = await db.query(
      `SELECT id, name, location, classroom_name,email,image FROM coach WHERE id = ?`,
      [course.coach_id]
    );
    coach = coachRows[0] || null;
  }

  const [tagsRows] = await db.query(
    `SELECT t.name FROM course_tags_rs ct JOIN course_tags t ON ct.tag_id = t.id WHERE ct.course_id = ?`,
    [courseId]
  );
  const tags = tagsRows.map(row => row.name);

  // 查固定週期（每週幾幾點的排課）
  const [scheduleRows] = await db.query(
    `SELECT id, weekday, start_time, end_time FROM course_recurrences WHERE course_id = ? ORDER BY weekday ASC`,
    [courseId]
  );

  // 查實際開課日（每一堂的時間與人數）
  const [occurRows] = await db.query(
    `SELECT co.id, DATE_FORMAT(co.occurrence_date, '%Y-%m-%d') AS date,
            co.start_time, co.end_time, co.reserved_count,
            c.max_participants
     FROM course_occurrences co
     JOIN courses c ON co.course_id = c.id
     WHERE co.course_id = ?
     ORDER BY co.occurrence_date ASC`,
    [courseId]
  );


  console.log("→ actualDate loaded for course:", courseId);
  console.log("→ count:", occurRows.length);
  console.log("→ first date:", occurRows[0]?.occurrence_date);

  const schedules = scheduleRows.map(row => ({
    id: row.id,
    weekday: row.weekday,
    start_time: row.start_time,
    end_time: row.end_time,
  }));

  const actualDate = occurRows.map(row => ({
    id: row.id,
    date: row.date,
    start_time: row.start_time.slice(0, 5),
    end_time: row.end_time.slice(0, 5),
    reserved_count: row.reserved_count,
    max_participants: row.max_participants,
  }));



  // 查使用者預約紀錄
  let reservedIds = [];
  if (userId) {
    const [resRows] = await db.query(
      `SELECT occurrence_id FROM course_reservations WHERE user_id = ?`,
      [userId]
    );
    reservedIds = resRows.map(r => r.occurrence_id);
  }

  // 查詢是否加入最愛
  let isLiked = false;
  if (userId) {
    const [likeRows] = await db.query(
      `SELECT 1 FROM course_likes WHERE user_id = ? AND course_id = ? LIMIT 1`,
      [userId, courseId]
    );
    isLiked = likeRows.length > 0;
  }

  return NextResponse.json({
    success: true,
    data: {
      ...course,
      coach,
      tags,
      schedules,
      actualDate,
      userId,
      reservedIds,
      isLiked,
    },
  });
}
