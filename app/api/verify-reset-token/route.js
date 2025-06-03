import { NextResponse } from "next/server";
import db from "@/lib/forum-db";

export async function POST(request) {
  try {
    console.log("🔍 收到驗證重置 token 請求...");

    const body = await request.json();
    const { token } = body;

    console.log(
      "🔑 要驗證的 token:",
      token ? token.substring(0, 8) + "..." : "undefined"
    );

    if (!token) {
      console.log("❌ 缺少 token 參數");
      return NextResponse.json({ message: "缺少重置代碼" }, { status: 400 });
    }

    // 查找擁有此 token 且未過期的用戶
    try {
      const [rows] = await db.execute(
        "SELECT id, email, resetTokenExpiry FROM users WHERE resetToken = ? AND resetTokenExpiry > NOW() LIMIT 1",
        [token]
      );

      console.log("📊 資料庫查詢結果 rows 數量:", rows.length);

      if (rows.length === 0) {
        console.log("❌ Token 無效或已過期");
        return NextResponse.json(
          { message: "重置連結無效或已過期，請重新申請" },
          { status: 400 }
        );
      }

      const user = rows[0];
      console.log(
        "✅ Token 有效，用戶:",
        user.email,
        "過期時間:",
        user.resetTokenExpiry
      );

      return NextResponse.json({
        message: "Token 驗證成功",
        valid: true,
        email: user.email, // 可以回傳 email 讓前端顯示
      });
    } catch (dbError) {
      console.error("❌ 資料庫查詢錯誤:", dbError);
      return NextResponse.json(
        { message: "資料庫查詢失敗，請稍後再試" },
        { status: 500 }
      );
    }
  } catch (error) {
    console.error("❌ 驗證 token API 發生錯誤:", error);
    return NextResponse.json(
      { message: "系統錯誤，請稍後再試" },
      { status: 500 }
    );
  }
}

export async function GET() {
  return NextResponse.json(
    { message: "此端點僅支援 POST 請求" },
    { status: 405 }
  );
}
