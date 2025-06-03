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
    console.log("=== API 開始執行 ===");
    console.log("請求 URL:", request.url);
    console.log("請求 headers:", Object.fromEntries(request.headers.entries()));

    const userId = await getUserIdFromRequest(request);
    console.log("取得用戶 ID:", userId);

    // 檢查資料庫連接
    console.log("檢查資料庫連接...");

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
        AND d.is_active = 1
      ORDER BY ud.created_at DESC
    `;

    console.log("執行查詢:", fullQuery);
    console.log("查詢參數:", [userId]);

    const [rows] = await db.query(fullQuery, [userId]);
    console.log("查詢結果數量:", rows.length);
    console.log("查詢結果:", JSON.stringify(rows, null, 2));

    const formattedData = rows.map((row) => ({
      id: row.id,
      name: row.name,
      discount_value: row.discount_value,
      discount_type: row.discount_type,
      expires_at: row.expires_at,
      is_used: row.is_used,
      created_at: row.created_at,
      is_active: row.is_active,
    }));

    console.log("格式化後的資料:", JSON.stringify(formattedData, null, 2));

    return NextResponse.json({
      success: true,
      data: formattedData,
      count: formattedData.length,
      debug: {
        userId,
        queryExecuted: true,
        timestamp: new Date().toISOString(),
      },
    });
  } catch (error) {
    console.error("=== API 錯誤 ===");
    console.error("錯誤訊息:", error.message);
    console.error("錯誤堆疊:", error.stack);

    return NextResponse.json(
      {
        success: false,
        message: error.message || "Failed to fetch user discounts",
        error:
          process.env.NODE_ENV === "development"
            ? {
                message: error.message,
                stack: error.stack,
              }
            : undefined,
      },
      { status: error.message?.includes("未授權") ? 401 : 500 }
    );
  }
}
