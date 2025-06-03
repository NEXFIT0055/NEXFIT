// app/api/forgot-password/route.js
import { NextResponse } from "next/server";
import crypto from "crypto";
import {
  sendEmail,
  generatePasswordResetEmail,
  isValidEmail,
} from "@/lib/email";
import db from "@/lib/forum-db";

export async function POST(request) {
  try {
    console.log("🔐 收到忘記密碼請求...");

    // 解析請求 body
    const body = await request.json();
    const { email } = body;

    console.log("📧 請求重置密碼的 email:", email);

    // 驗證 email 是否存在
    if (!email) {
      console.log("❌ 缺少 email 參數");
      return NextResponse.json(
        { message: "請提供電子郵件地址" },
        { status: 400 }
      );
    }

    // 驗證 email 格式
    if (!isValidEmail(email)) {
      console.log("❌ email 格式無效:", email);
      return NextResponse.json(
        { message: "無效的電子郵件格式" },
        { status: 400 }
      );
    }

    // 檢查用戶是否存在 - 使用原生 MySQL 查詢
    console.log("🔍 查詢用戶是否存在...");
    let user = null;

    try {
      const [rows] = await db.execute(
        "SELECT id, email FROM users WHERE email = ? LIMIT 1",
        [email.toLowerCase().trim()]
      );

      if (rows.length > 0) {
        user = rows[0];
        console.log("✅ 找到用戶:", user.email, "ID:", user.id);
      } else {
        console.log("❌ 用戶不存在:", email);
      }
    } catch (dbError) {
      console.error("❌ 資料庫查詢錯誤:", dbError);
      return NextResponse.json(
        { message: "資料庫查詢失敗，請稍後再試" },
        { status: 500 }
      );
    }

    // 如果用戶不存在，為了安全性不透露具體信息
    if (!user) {
      return NextResponse.json(
        {
          message:
            "如果該電子郵件地址存在於我們的系統中，您將收到重置密碼的郵件",
        },
        { status: 200 }
      );
    }

    // 生成重置 token
    const resetToken = crypto.randomBytes(32).toString("hex");
    const resetTokenExpiry = new Date(Date.now() + 3600000); // 1小時後過期

    console.log("🔑 生成重置 token:", resetToken.substring(0, 8) + "...");

    // 更新用戶的重置 token - 使用原生 MySQL 更新
    try {
      const [updateResult] = await db.execute(
        "UPDATE users SET resetToken = ?, resetTokenExpiry = ? WHERE email = ?",
        [resetToken, resetTokenExpiry, email.toLowerCase().trim()]
      );

      if (updateResult.affectedRows === 0) {
        console.error("❌ 沒有找到要更新的用戶");
        return NextResponse.json(
          { message: "更新失敗，請稍後再試" },
          { status: 500 }
        );
      }

      console.log(
        "✅ 重置 token 已保存到資料庫，影響行數:",
        updateResult.affectedRows
      );
    } catch (updateError) {
      console.error("❌ 更新重置 token 失敗:", updateError);

      // 檢查是否是欄位不存在的錯誤
      if (
        updateError.message.includes("resetToken") ||
        updateError.message.includes("resetTokenExpiry")
      ) {
        return NextResponse.json(
          {
            message:
              "資料庫結構需要更新，請先新增 resetToken 和 resetTokenExpiry 欄位",
          },
          { status: 500 }
        );
      }

      return NextResponse.json(
        { message: "無法保存重置信息，請稍後再試" },
        { status: 500 }
      );
    }

    // 檢查環境變數
    if (!process.env.EMAIL_USER || !process.env.EMAIL_APP_PASSWORD) {
      console.error("❌ 郵件服務環境變數未設定");
      return NextResponse.json(
        { message: "郵件服務配置錯誤，請聯繫管理員" },
        { status: 500 }
      );
    }

    // 生成重置 URL
    const resetUrl = `${process.env.NEXT_PUBLIC_BASE_URL}/reset-password?token=${resetToken}`;
    console.log("🔗 重置 URL:", resetUrl.substring(0, 50) + "...");

    // 使用改進的郵件模板
    const emailHtml = generatePasswordResetEmail(resetUrl, email);

    // 發送重置郵件
    console.log("📧 準備發送重置密碼郵件...");
    try {
      const emailResult = await sendEmail({
        to: email,
        subject: "🔐 重置您的密碼",
        html: emailHtml,
      });

      console.log("✅ 郵件發送成功:", emailResult.messageId);
    } catch (emailError) {
      console.error("❌ 郵件發送失敗:", emailError);

      // 郵件發送失敗，但不要暴露具體錯誤給用戶
      return NextResponse.json(
        { message: "郵件發送失敗，請稍後再試或聯繫管理員" },
        { status: 500 }
      );
    }

    console.log("🎉 忘記密碼流程完成");

    return NextResponse.json({
      message: "重置密碼郵件已發送，請檢查您的信箱",
    });
  } catch (error) {
    console.error("❌ 忘記密碼 API 發生未預期錯誤:", error);
    console.error("錯誤堆疊:", error.stack);

    return NextResponse.json(
      { message: "系統暫時無法處理您的請求，請稍後再試" },
      { status: 500 }
    );
  }
}

// 處理不支援的 HTTP 方法
export async function GET() {
  return NextResponse.json(
    { message: "此端點僅支援 POST 請求" },
    { status: 405 }
  );
}
