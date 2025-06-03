import { NextResponse } from "next/server";
import db from "@/lib/forum-db";
import jwt from "jsonwebtoken";

// GET /api/reservation/course
export async function GET(request) {
  const { searchParams } = new URL(request.url);
  const perPage = 6;
  let page = parseInt(searchParams.get("page") || "1", 10);
  const keyword = searchParams.get("keyword")?.trim() || "";
  const tagParams = searchParams.getAll("tags");
  const dayFilters = searchParams.getAll("days");
  const timeFilters = searchParams.getAll("times");
  const areaFilters = searchParams.getAll("areas"); // ✅ 地區篩選

  if (isNaN(page) || page < 1) page = 1;

  // 解析 JWT token，取得登入使用者 ID
  const authHeader = request.headers.get("authorization");
  let userId = null;
  if (authHeader && authHeader.startsWith("Bearer ")) {
    try {
      const token = authHeader.split(" ")[1];
      const decoded = jwt.verify(token, process.env.JWT_SECRET);
      userId = decoded.userId;
    } catch (err) {
      console.warn("JWT 驗證失敗：", err.message);
    }
  }

  const whereClauses = [];
  const queryParams = [];

  if (keyword) {
    whereClauses.push("c.name LIKE ?");
    queryParams.push(`%${keyword}%`);
  }

  if (tagParams.length > 0) {
    const tagPlaceholders = tagParams.map(() => "?").join(", ");
    whereClauses.push(`
      EXISTS (
        SELECT 1 FROM course_tags_rs ct
        JOIN course_tags t ON ct.tag_id = t.id
        WHERE ct.course_id = c.id
        AND t.name IN (${tagPlaceholders})
      )
    `);
    queryParams.push(...tagParams);
  }

  // 時間與星期篩選
  const weekdayToNumber = {
    "週日": 0, "週一": 1, "週二": 2, "週三": 3,
    "週四": 4, "週五": 5, "週六": 6,
  };
  const timeRanges = {
    "早上": ["06:00:00", "11:59:59"],
    "下午": ["12:00:00", "17:59:59"],
    "晚上": ["18:00:00", "23:59:59"],
  };

  let recurrenceCourseIds = null;

  if (dayFilters.length > 0 || timeFilters.length > 0) {
    const whereParts = [];
    const whereValues = [];

    if (dayFilters.length > 0) {
      const dayNums = dayFilters.map((d) => weekdayToNumber[d]);
      whereParts.push(`weekday IN (${dayNums.map(() => "?").join(",")})`);
      whereValues.push(...dayNums);
    }

    if (timeFilters.length > 0) {
      const timeConds = timeFilters.map(() => "(start_time BETWEEN ? AND ?)").join(" OR ");
      whereParts.push(`(${timeConds})`);
      timeFilters.forEach((t) => {
        const range = timeRanges[t];
        if (!range) return;
        const [start, end] = range;
        whereValues.push(start, end);
      });
    }

    const recurrenceSql = `
      SELECT DISTINCT course_id FROM course_recurrences
      WHERE ${whereParts.join(" AND ")}
    `;
    const [recurrenceRows] = await db.query(recurrenceSql, whereValues);

    if (recurrenceRows.length === 0) {
      return NextResponse.json({
        perPage,
        page,
        totalRows: 0,
        totalPages: 0,
        rows: [],
        query: Object.fromEntries(searchParams),
      });
    }

    recurrenceCourseIds = recurrenceRows.map((r) => r.course_id);
  }

  // ✅ 加入 recurrence 篩選條件
  if (recurrenceCourseIds) {
    whereClauses.push(`c.id IN (${recurrenceCourseIds.map(() => "?").join(",")})`);
    queryParams.push(...recurrenceCourseIds);
  }

  // ✅ 加入地區篩選條件
  if (areaFilters.length > 0) {
    whereClauses.push(`
      EXISTS (
        SELECT 1 FROM coach co
        WHERE co.id = c.coach_id
        AND (${areaFilters.map(() => "co.location LIKE ?").join(" OR ")})
      )
    `);
    queryParams.push(...areaFilters.map(a => `${a}%`));
  }

  const whereClause = whereClauses.length > 0 ? `WHERE ${whereClauses.join(" AND ")}` : "";

  const countSql = `SELECT COUNT(*) AS totalRows FROM courses c ${whereClause}`;
  const [[{ totalRows }]] = await db.query(countSql, queryParams);
  const totalPages = Math.ceil(totalRows / perPage);
  if (page > totalPages && totalPages > 0) page = totalPages;

  let rows = [];
  if (totalRows > 0) {
    const dataSql = `
      SELECT * FROM courses c
      ${whereClause}
      ORDER BY c.id
      LIMIT ?, ?
    `;
    const dataParams = [...queryParams, (page - 1) * perPage, perPage];
    [rows] = await db.query(dataSql, dataParams);

    const courseIds = rows.map((c) => c.id);
    const coachIds = [...new Set(rows.map((c) => c.coach_id))];

    let tagsData = [];
    let coachesData = [];
    let favorites = [];

    if (courseIds.length > 0) {
      [tagsData] = await db.query(
        `SELECT ct.course_id, t.name FROM course_tags_rs ct
         JOIN course_tags t ON ct.tag_id = t.id
         WHERE ct.course_id IN (${courseIds.map(() => "?").join(",")})`,
        courseIds
      );
    }

    if (coachIds.length > 0) {
      [coachesData] = await db.query(
        `SELECT * FROM coach WHERE id IN (${coachIds.map(() => "?").join(",")})`,
        coachIds
      );
    }

    if (userId && courseIds.length > 0) {
      [favorites] = await db.query(
        `SELECT course_id FROM course_likes
         WHERE user_id = ? AND course_id IN (${courseIds.map(() => "?").join(",")})`,
        [userId, ...courseIds]
      );
    }

    const favoriteIds = new Set(favorites.map((f) => f.course_id));

    rows = rows.map((course) => {
      const courseTags = tagsData.filter((t) => t.course_id === course.id).map((t) => t.name);
      const coach = coachesData.find((c) => c.id === course.coach_id);
      return {
        ...course,
        is_favorite: favoriteIds.has(course.id),
        tags: courseTags,
        coach,
      };
    });
  }

  const [locationRows] = await db.query(`
    SELECT DISTINCT LEFT(location, 2) AS area FROM coach
    WHERE location IS NOT NULL AND location != ''
  `);
  const allAreas = locationRows.map(r => r.area);

  return NextResponse.json({
    perPage,
    page,
    totalRows,
    totalPages,
    rows,
    allAreas,
    query: Object.fromEntries(searchParams),
  });
}
