import { NextResponse } from "next/server";
import db from "@/lib/forum-db";

// 取得全部商品資料，含平均評分與評論數
export async function GET(request) {
  const { searchParams } = new URL(request.url);
  const perPage = 12;
  let page = parseInt(searchParams.get("page") || "1", 10);
  const category = searchParams.get("category");
  const search = searchParams.get("search");
  const sortBy = searchParams.get("sortBy");

  if (isNaN(page) || page < 1) page = 1;

  // 建構 WHERE 條件
  let whereConditions = [];
  let queryParams = [];

  if (category && category !== "全部商品") {
    whereConditions.push("p.category = ?");
    queryParams.push(category);
  }

  if (search && search.trim()) {
    whereConditions.push("(p.name LIKE ? OR p.brand LIKE ?)");
    const searchTerm = `%${search.trim()}%`;
    queryParams.push(searchTerm, searchTerm);
  }

  const whereClause =
    whereConditions.length > 0 ? `WHERE ${whereConditions.join(" AND ")}` : "";

  // 排序邏輯
  let orderByClause = "ORDER BY p.created_at DESC";
  switch (sortBy) {
    case "上架時間：由新到舊":
      orderByClause = "ORDER BY p.created_at DESC";
      break;
    case "上架時間：由舊到新":
      orderByClause = "ORDER BY p.created_at ASC";
      break;
    case "價格：由高至低":
      orderByClause = "ORDER BY p.price DESC";
      break;
    case "價格：由低至高":
      orderByClause = "ORDER BY p.price ASC";
      break;
    default:
      orderByClause = "ORDER BY p.created_at DESC";
  }

  try {
    // 計算總筆數
    const countSql = `SELECT COUNT(1) AS totalRows FROM products p ${whereClause}`;
    const [[{ totalRows }]] = await db.query(countSql, queryParams);

    let totalPages = Math.ceil(totalRows / perPage);
    if (page > totalPages && totalPages > 0) page = totalPages;

    let rows = [];
    if (totalRows > 0) {
      // 查詢商品資料與評分統計資料（左聯結）
      const sql = `
        SELECT 
          p.*,
          IFNULL(AVG(c.rating), 0) AS average_rating,
          COUNT(c.id) AS total_reviews
        FROM products p
        LEFT JOIN comments c ON p.id = c.product_id
        ${whereClause}
        GROUP BY p.id
        ${orderByClause}
        LIMIT ?, ?`;

      // 補上分頁查詢參數
      const queryParamsWithPagination = [
        ...queryParams,
        (page - 1) * perPage,
        perPage,
      ];

      [rows] = await db.query(sql, queryParamsWithPagination);

      // 處理圖片 URL
      rows = rows.map((product) => ({
        ...product,
        image_urls: product.image_url ? product.image_url.split(",") : [],
        average_rating: parseFloat(product.average_rating).toFixed(1), // 評分保留一位小數
        total_reviews: product.total_reviews,
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
