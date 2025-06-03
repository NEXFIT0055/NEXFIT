import { NextResponse } from "next/server";
import db from "@/lib/forum-db";
import jwt from "jsonwebtoken";

export async function GET(req) {
  try {
    const authHeader = req.headers.get("authorization");

    if (!authHeader || !authHeader.startsWith("Bearer ")) {
      return NextResponse.json({ message: "未登入" }, { status: 401 });
    }

    const token = authHeader.split(" ")[1];
    const decoded = jwt.verify(token, process.env.JWT_SECRET);
    const userId = decoded.userId;

    // 取得使用者按讚的課程及對應教練與標籤
    const [courses] = await db.query(
      `
      SELECT
        c.id AS id,
        c.name,
        c.description,
        c.image,
        c.points_required,
        c.max_participants,
        coach.id AS coach_id,
        coach.name AS coach_name,
        coach.location,
        coach.classroom_name,
        GROUP_CONCAT(DISTINCT t.name) AS tags
      FROM course_likes cl
      JOIN courses c ON cl.course_id = c.id
      LEFT JOIN coach ON c.coach_id = coach.id
      LEFT JOIN course_tags_rs ct ON ct.course_id = c.id
      LEFT JOIN course_tags t ON ct.tag_id = t.id
      WHERE cl.user_id = ?
      GROUP BY c.id
      ORDER BY cl.created_at DESC
      `,
      [userId]
    );

    const result = courses.map((course) => ({
      id: course.id,
      name: course.name,
      description: course.description,
      image: course.image,
      points_required: course.points_required,
      max_participants: course.max_participants,
      tags: course.tags ? course.tags.split(",") : [],
      coach: {
        id: course.coach_id,
        name: course.coach_name,
        location: course.location,
        classroom_name: course.classroom_name,
      },
      is_favorite: true,
    }));

    return NextResponse.json({ success: true, favorites: result });
  } catch (error) {
    console.error("查詢使用者最愛課程錯誤：", error);
    return NextResponse.json({ message: "伺服器錯誤" }, { status: 500 });
  }
}
