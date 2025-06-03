import { NextResponse } from "next/server";
import db from "@/lib/forum-db";
import { verifyToken } from "@/lib/auth";

async function getUserIdFromRequest(request) {
  const authHeader = request.headers.get("Authorization");
  const token = authHeader?.split(" ")[1];
  if (!token) throw new Error("未授權訪問");

  const decoded = verifyToken(token);
  if (!decoded) throw new Error("無效的 Token");

  if (!decoded.userId) throw new Error("未授權訪問");

  return decoded.userId;
}

export async function GET(request) {
  try {
    console.log("API 開始執行");

    const userId = await getUserIdFromRequest(request);
    console.log("取得用戶 ID:", userId);

    // 先測試簡單的查詢
    const simpleQuery = `
      SELECT 
        ud.id as user_discount_id,
        ud.user_id,
        ud.discount_id,
        ud.is_used,
        ud.expires_at,
        ud.created_at
      FROM user_discounts AS ud
      WHERE ud.user_id = ? 
        AND ud.is_used = 0
      ORDER BY ud.created_at DESC
    `;

    console.log("執行查詢:", simpleQuery);
    console.log("查詢參數:", [userId]);

    const [rows] = await db.query(simpleQuery, [userId]);
    console.log("查詢結果數量:", rows.length);
    console.log("查詢結果:", rows);

    // 如果有資料，再查詢包含 discounts 表的完整資料
    if (rows.length > 0) {
      const fullQuery = `
        SELECT 
          d.id,
          d.name,
          d.discount_value,
          d.discount_type,
          d.is_active,
          ud.expires_at,
          ud.is_used,
          ud.created_at
        FROM user_discounts AS ud
        JOIN discounts AS d ON ud.discount_id = d.id
        WHERE ud.user_id = ? 
          AND ud.is_used = 0
        ORDER BY ud.created_at DESC
      `;

      console.log("執行完整查詢:", fullQuery);
      const [fullRows] = await db.query(fullQuery, [userId]);
      console.log("完整查詢結果:", fullRows);

      // 格式化資料
      const formattedData = fullRows.map((row) => ({
        id: row.id,
        code: `#DISC${row.id}`,
        name: row.name,
        discount_value: row.discount_value,
        discount_type: row.discount_type,
        expires_at: row.expires_at,
        is_used: row.is_used,
        created_at: row.created_at,
        is_active: row.is_active,
      }));

      console.log("格式化後的資料:", formattedData);

      return NextResponse.json({
        success: true,
        data: formattedData,
        count: formattedData.length,
      });
    } else {
      // 沒有資料
      return NextResponse.json({
        success: true,
        data: [],
        count: 0,
        message: "沒有找到可用的優惠券",
      });
    }
  } catch (error) {
    console.error("API 錯誤詳情:", error);
    console.error("錯誤堆疊:", error.stack);

    return NextResponse.json(
      {
        success: false,
        message: error.message || "Failed to fetch user discounts",
        error: process.env.NODE_ENV === "development" ? error.stack : undefined,
      },
      { status: error.message?.includes("未授權") ? 401 : 500 }
    );
  }
}
