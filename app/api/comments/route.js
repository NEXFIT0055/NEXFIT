import { NextResponse } from "next/server";
import db from "@/lib/forum-db";

// export async function GET(request) {
//   try {
//     const url = new URL(request.url);
//     const productId = url.searchParams.get("product_id");
//     const orderId = url.searchParams.get("order_id");

//     if (!productId) {
//       return NextResponse.json({ error: "缺少 product_id" }, { status: 400 });
//     }

//     let query = "SELECT * FROM comments WHERE product_id = ?";
//     let params = [productId];

//     if (orderId) {
//       query += " AND order_id = ?";
//       params.push(orderId);
//     }

//     const [rows] = await db.query(query, params);

//     // 強制回傳合法 JSON（即使是空）
//     return NextResponse.json(rows ?? []);
//   } catch (err) {
//     console.error("❌ API 錯誤：", err);
//     return NextResponse.json({ error: "內部錯誤" }, { status: 500 });
//   }
// }

// ✅ POST: 新增評論（包含 order_id）

export async function GET(request) {
  try {
    const url = new URL(request.url);
    const productId = url.searchParams.get("product_id");
    const orderId = url.searchParams.get("order_id");

    if (!productId) {
      return NextResponse.json({ error: "缺少 product_id" }, { status: 400 });
    }

    // let query = "SELECT * FROM comments WHERE product_id = ?";
    // let params = [productId];

    // if (orderId) {
    //   query += " AND order_id = ?";
    //   params.push(orderId);
    // }

    // const [comments] = await db.query(query, params);

    // 修改查詢語句，加入 ORDER BY created_at DESC
    let query =
      "SELECT * FROM comments WHERE product_id = ? ORDER BY created_at DESC";
    let params = [productId];

    if (orderId) {
      query =
        "SELECT * FROM comments WHERE product_id = ? AND order_id = ? ORDER BY created_at DESC";
      params = [productId, orderId];
    }

    const [comments] = await db.query(query, params);

    // 加入統計資料
    const [stats] = await db.query(
      `SELECT 
         ROUND(AVG(rating), 1) AS average_rating,
         COUNT(*) AS total_reviews
       FROM comments
       WHERE product_id = ?`,
      [productId]
    );

    // 回傳評論與統計
    return NextResponse.json({
      comments: comments ?? [],
      stats: stats[0] ?? { average_rating: 0, total_reviews: 0 },
    });
  } catch (err) {
    console.error("❌ API 錯誤：", err);
    return NextResponse.json({ error: "內部錯誤" }, { status: 500 });
  }
}

export async function POST(request) {
  const body = await request.json();
  let { order_id, product_id, user_name, comment_text, rating } = body;

  // 強制轉成數字
  rating = parseInt(rating, 10);

  // 若 rating 無效就設為 null 或回傳錯誤
  if (isNaN(rating) || rating < 1 || rating > 5) {
    return NextResponse.json(
      { error: "請提供 1～5 分的評分" },
      { status: 400 }
    );
  }

  if (!order_id || !product_id || !user_name || !comment_text) {
    return NextResponse.json({ error: "缺少欄位" }, { status: 400 });
  }

  // 檢查是否已經留言過（針對這筆訂單 + 商品）
  const [exist] = await db.query(
    "SELECT * FROM comments WHERE order_id = ? AND product_id = ? AND user_name = ?",
    [order_id, product_id, user_name]
  );

  if (exist.length > 0) {
    return NextResponse.json({ error: "已經評論過了" }, { status: 409 });
  }

  const [result] = await db.query(
    "INSERT INTO comments (order_id, product_id, user_name, comment_text, rating) VALUES (?, ?, ?, ?, ?)",
    [order_id, product_id, user_name, comment_text, rating]
  );

  return NextResponse.json({ success: true, id: result.insertId });
}
