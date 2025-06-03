import { NextResponse } from "next/server";
import db from "@/lib/forum-db";

// 取得全部商品資料
export async function GET(request) {
  const { searchParams } = new URL(request.url);
  const perPage = 12;
  let page = parseInt(searchParams.get("page") || "1", 10);
  const category = searchParams.get("category");
  const search = searchParams.get("search");
  const sortBy = searchParams.get("sortBy"); // 新增排序參數

  if (isNaN(page) || page < 1) page = 1;

  // 建構 WHERE 條件
  let whereConditions = [];
  let queryParams = [];

  // 分類篩選
  if (category && category !== "全部商品") {
    whereConditions.push("category = ?");
    queryParams.push(category);
  }

  // 搜尋篩選 - FIXED: Only push 2 parameters for 2 placeholders
  if (search && search.trim()) {
    whereConditions.push("(name LIKE ? OR brand LIKE ?)");
    const searchTerm = `%${search.trim()}%`;
    queryParams.push(searchTerm, searchTerm); // Fixed: removed the third parameter
  }

  // 組合 WHERE 子句
  const whereClause =
    whereConditions.length > 0 ? `WHERE ${whereConditions.join(" AND ")}` : "";

  // 排序邏輯
  let orderByClause = "ORDER BY created_at DESC"; // 預設排序：最新商品在前
  switch (sortBy) {
    case "上架時間：由新到舊":
      orderByClause = "ORDER BY created_at DESC";
      break;
    case "上架時間：由舊到新":
      orderByClause = "ORDER BY created_at ASC";
      break;
    case "價格：由高至低":
      orderByClause = "ORDER BY price DESC";
      break;
    case "價格：由低至高":
      orderByClause = "ORDER BY price ASC";
      break;
    default:
      orderByClause = "ORDER BY created_at DESC";
  }

  try {
    // 計算總筆數
    const countSql = `SELECT COUNT(1) AS totalRows FROM products ${whereClause}`;
    const [[{ totalRows }]] = await db.query(countSql, queryParams);

    let totalPages = Math.ceil(totalRows / perPage);
    if (page > totalPages && totalPages > 0) page = totalPages;

    let rows = [];
    if (totalRows > 0) {
      // 查詢商品資料
      const sql = `SELECT * FROM products ${whereClause} ${orderByClause} LIMIT ${
        (page - 1) * perPage
      }, ${perPage}`;
      [rows] = await db.query(sql, queryParams);

      // 處理圖片 URL，將字串分割成陣列
      rows = rows.map((product) => ({
        ...product,
        image_urls: product.image_url ? product.image_url.split(",") : [],
      }));
    }

    return NextResponse.json({
      perPage,
      page,
      totalRows,
      totalPages,
      rows,
      query: Object.fromEntries(searchParams),
      filters: {
        category,
        search,
        sortBy,
      },
    });
  } catch (error) {
    console.error("Database query error:", error);
    return NextResponse.json(
      { error: "Failed to fetch products" },
      { status: 500 }
    );
  }
}
