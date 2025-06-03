import { NextResponse } from "next/server";
import db from "@/lib/forum-db";

export async function GET(request) {
  try {
    const { searchParams } = new URL(request.url);
    const perPage = parseInt(searchParams.get("perPage")) || 9;
    let page = parseInt(searchParams.get("page")) || 1;
    if (page < 1) page = 1;

    // 取得總筆數
    const [[{ totalRows }]] = await db.query(`SELECT COUNT(*) AS totalRows FROM coach`);
    const totalPages = Math.ceil(totalRows / perPage);
    if (page > totalPages && totalPages > 0) page = totalPages;

    let rows = [];
    if (totalRows > 0) {
      // 取得當頁教練資料
      const offset = (page - 1) * perPage;
      const sql = `SELECT * FROM coach ORDER BY id LIMIT ?, ?`;
      [rows] = await db.query(sql, [offset, perPage]);

      const coachIds = rows.map(coach => coach.id);
      let categoriesData = [];

      if (coachIds.length > 0) {
        const placeholders = coachIds.map(() => "?").join(",");
        const categorySql = `
          SELECT cc.coach_id, c.id AS category_id, c.name
          FROM coach_categories cc
          JOIN categories c ON cc.category_id = c.id
          WHERE cc.coach_id IN (${placeholders})
        `;
        [categoriesData] = await db.query(categorySql, coachIds);
      }

      // 整合 categories 到教練物件
      rows = rows.map(coach => {
        const categories = categoriesData
          .filter(cat => cat.coach_id === coach.id)
          .map(cat => ({
            id: cat.category_id,
            name: cat.name,
          }));

        return {
          ...coach,
          categories,
        };
      });
    }

    return NextResponse.json({
      success: true,
      perPage,
      page,
      totalRows,
      totalPages,
      rows,
      query: Object.fromEntries(searchParams),
    });
  } catch (error) {
    console.error("API error:", error);
    return NextResponse.json({
      success: false,
      error: "伺服器錯誤，請稍後再試。",
    }, { status: 500 });
  }
}
