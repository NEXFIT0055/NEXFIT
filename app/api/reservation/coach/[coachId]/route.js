import { NextResponse } from "next/server";
import db from "@/lib/forum-db";

export async function GET(request, { params }) {
  const coachId = parseInt(params.coachId, 10);

  if (!coachId) {
    return NextResponse.json({
      success: false,
      error: "查無該教練",
      data: {},
    });
  }

  // 查教練基本資料
  const [coachRows] = await db.query(
    `SELECT * FROM coach WHERE id = ?`,
    [coachId]
  );
  if (!coachRows.length) {
    return NextResponse.json({
      success: false,
      error: "沒有該教練資料",
      data: {},
    });
  }
  const coach = coachRows[0];

  // 查教練的運動分類
  const [categoryRows] = await db.query(
    `
    SELECT c.id, c.name
    FROM coach_categories cc
    JOIN categories c ON cc.category_id = c.id
    WHERE cc.coach_id = ?
    `,
    [coachId]
  );
  const categories = categoryRows.map(row => ({
    id: row.id,
    name: row.name,
  }));

  // 查該教練開的所有課程
  const [courseRows] = await db.query(
    `
    SELECT id, name, category_id, description, image, points_required, max_participants
    FROM courses
    WHERE coach_id = ?
    `,
    [coachId]
  );

  const courseIds = courseRows.map(c => c.id);

  // 查每門課的固定上課時間（course_recurrences）
  let recurrencesByCourse = {};
  if (courseIds.length > 0) {
    const [recurRows] = await db.query(
      `
      SELECT id, course_id, weekday, start_time, end_time, start_date, end_date
      FROM course_recurrences
      WHERE course_id IN (?)
      ORDER BY course_id ASC, weekday ASC
      `,
      [courseIds]
    );

    // 整理為 course_id 對應陣列
    recurrencesByCourse = courseIds.reduce((acc, id) => {
      acc[id] = [];
      return acc;
    }, {});

    recurRows.forEach(row => {
      recurrencesByCourse[row.course_id].push({
        id: row.id,
        weekday: row.weekday,
        start_time: row.start_time,
        end_time: row.end_time,
        start_date: row.start_date,
        end_date: row.end_date,
      });
    });
  }

  // 整合課程資料
  const courses = courseRows.map(course => ({
    ...course,
    recurrences: recurrencesByCourse[course.id] || [],
  }));

  return NextResponse.json({
    success: true,
    data: {
      ...coach,
      categories,
      courses,
    },
  });
}
