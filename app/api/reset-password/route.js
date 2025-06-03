// app/api/reset-password/route.js
import { NextResponse } from "next/server";
import bcrypt from "bcryptjs";
import db from "@/lib/forum-db";

// 密碼驗證函數
function validatePassword(password) {
  const validation = {
    length: password.length >= 6,
    uppercase: /[A-Z]/.test(password),
    lowercase: /[a-z]/.test(password),
    number: /\d/.test(password),
  };

  return {
    isValid: Object.values(validation).every(Boolean),
    details: validation,
  };
}

export async function POST(request) {
  try {
    console.log("🔐 收到重置密碼請求...");

    const body = await request.json();
    const { token, newPassword } = body;

    // 驗證參數
    if (!token || !newPassword) {
      console.log("❌ 缺少必要參數");
      return NextResponse.json({ message: "缺少必要參數" }, { status: 400 });
    }

    // 驗證密碼強度
    console.log("🔒 驗證密碼強度...");
    const passwordValidation = validatePassword(newPassword);

    if (!passwordValidation.isValid) {
      console.log("❌ 密碼強度不足:", passwordValidation.details);

      const missingRequirements = [];
      if (!passwordValidation.details.length)
        missingRequirements.push("至少 6 個字符");
      if (!passwordValidation.details.uppercase)
        missingRequirements.push("至少一個大寫字母");
      if (!passwordValidation.details.lowercase)
        missingRequirements.push("至少一個小寫字母");
      if (!passwordValidation.details.number)
        missingRequirements.push("至少一個數字");

      return NextResponse.json(
        {
          message: `密碼不符合安全要求，需要包含：${missingRequirements.join(
            "、"
          )}`,
          validationDetails: passwordValidation.details,
        },
        { status: 400 }
      );
    }

    console.log("✅ 密碼強度驗證通過");
    console.log("🔑 處理重置 token:", token.substring(0, 8) + "...");

    // 查找擁有此 token 且未過期的用戶
    let user = null;
    try {
      const [rows] = await db.execute(
        "SELECT id, email, resetTokenExpiry FROM users WHERE resetToken = ? AND resetTokenExpiry > NOW() LIMIT 1",
        [token]
      );

      if (rows.length === 0) {
        console.log("❌ Token 無效或已過期");
        return NextResponse.json(
          { message: "重置連結無效或已過期，請重新申請" },
          { status: 400 }
        );
      }

      user = rows[0];
      console.log(
        "✅ 找到用戶:",
        user.email,
        "Token 過期時間:",
        user.resetTokenExpiry
      );
    } catch (dbError) {
      console.error("❌ 資料庫查詢錯誤:", dbError);
      return NextResponse.json(
        { message: "資料庫查詢失敗，請稍後再試" },
        { status: 500 }
      );
    }

    // 加密新密碼
    console.log("🔒 加密新密碼...");
    let hashedPassword;
    try {
      hashedPassword = await bcrypt.hash(newPassword, 12);
      console.log("✅ 密碼加密成功");
    } catch (hashError) {
      console.error("❌ 密碼加密失敗:", hashError);
      return NextResponse.json(
        { message: "密碼處理失敗，請稍後再試" },
        { status: 500 }
      );
    }

    // 更新用戶密碼並清除重置 token
    try {
      const [updateResult] = await db.execute(
        "UPDATE users SET password_hash = ?, resetToken = NULL, resetTokenExpiry = NULL WHERE resetToken = ?",
        [hashedPassword, token]
      );

      if (updateResult.affectedRows === 0) {
        console.error("❌ 沒有找到要更新的用戶");
        return NextResponse.json(
          { message: "更新失敗，Token 可能已失效" },
          { status: 400 }
        );
      }

      console.log("✅ 密碼更新成功，影響行數:", updateResult.affectedRows);
    } catch (updateError) {
      console.error("❌ 更新密碼失敗:", updateError);

      // 檢查是否是欄位名稱問題
      if (updateError.message.includes("password_hash")) {
        return NextResponse.json(
          { message: "資料庫結構錯誤，請確認密碼欄位名稱" },
          { status: 500 }
        );
      }

      return NextResponse.json(
        { message: "密碼更新失敗，請稍後再試" },
        { status: 500 }
      );
    }

    console.log("🎉 密碼重置流程完成");

    return NextResponse.json({
      message: "密碼重置成功",
      success: true,
    });
  } catch (error) {
    console.error("❌ 重置密碼 API 發生錯誤:", error);
    console.error("錯誤堆疊:", error.stack);

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
