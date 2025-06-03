import db from "@/lib/forum-db";
import { NextResponse } from "next/server";

export async function POST(request) {
  console.log("=== API 端點被呼叫 ===");

  let connection;

  try {
    // 解析請求資料
    const requestData = await request.json();
    console.log("收到的請求資料:", requestData);

    const { uid, email, name, image, emailVerified } = requestData;

    if (!uid || !email) {
      console.error("缺少必要資料:", { uid, email });
      return NextResponse.json(
        { success: false, error: "缺少必要的用戶資料" },
        { status: 400 }
      );
    }

    console.log("準備連接資料庫...");

    // 檢查用戶是否已存在
    console.log("檢查用戶是否存在:", email);
    const [existingUsers] = await db.execute(
      "SELECT * FROM users WHERE email = ?",
      [email]
    );

    console.log(
      "現有用戶查詢結果:",
      existingUsers.length > 0 ? "找到用戶" : "新用戶"
    );

    let userIdInDb;

    if (existingUsers.length === 0) {
      // 創建新用戶
      console.log("開始創建新用戶...");

      try {
        const [result] = await db.execute(
          `INSERT INTO users (email, image, emailVerified, oauth_provider, created_at, updated_at) 
           VALUES (?, ?, ?, ?, NOW(), NOW())`,
          [
            email,
            image || null,
            emailVerified ? new Date() : null,
            "firebase_google",
          ]
        );

        userIdInDb = result.insertId;
        console.log("新用戶創建成功，ID:", userIdInDb);

        // 創建 user_profiles 記錄
        if (name || image) {
          try {
            await db.execute(
              `INSERT INTO user_profiles (user_id, name, avatar_url, created_at, updated_at) 
               VALUES (?, ?, ?, NOW(), NOW())`,
              [userIdInDb, name || null, image || null]
            );
            console.log("用戶個人資料創建成功");
          } catch (profileError) {
            console.error("創建個人資料失敗:", profileError);
          }
        }

        // 創建 accounts 記錄
        try {
          await db.execute(
            `INSERT INTO accounts (userId, type, provider, providerAccountId, created_at, updated_at) 
             VALUES (?, ?, ?, ?, NOW(), NOW())`,
            [userIdInDb, "oauth", "firebase", uid]
          );
          console.log("Firebase 帳戶記錄創建成功");
        } catch (accountError) {
          console.error("創建帳戶記錄失敗:", accountError);
        }
      } catch (insertError) {
        console.error("插入用戶資料失敗:", insertError);
        throw insertError;
      }
    } else {
      // 更新現有用戶
      userIdInDb = existingUsers[0].id;
      console.log("更新現有用戶，ID:", userIdInDb);

      try {
        await db.execute(
          "UPDATE users SET image = ?, emailVerified = ?, oauth_provider = ?, updated_at = NOW() WHERE email = ?",
          [
            image || null,
            emailVerified ? new Date() : null,
            "firebase_google",
            email,
          ]
        );
        console.log("用戶資料更新成功");

        // 更新 user_profiles
        if (name || image) {
          const [profileExists] = await db.execute(
            "SELECT * FROM user_profiles WHERE user_id = ?",
            [userIdInDb]
          );

          if (profileExists.length === 0) {
            // 創建新的 profile
            await db.execute(
              `INSERT INTO user_profiles (user_id, name, avatar_url, created_at, updated_at) 
               VALUES (?, ?, ?, NOW(), NOW())`,
              [userIdInDb, name || null, image || null]
            );
            console.log("用戶個人資料創建成功");
          } else {
            // 更新現有 profile
            await db.execute(
              "UPDATE user_profiles SET name = ?, avatar_url = ?, updated_at = NOW() WHERE user_id = ?",
              [name || null, image || null, userIdInDb]
            );
            console.log("用戶個人資料更新成功");
          }
        }

        // 檢查並更新 accounts 記錄
        const [accountExists] = await db.execute(
          "SELECT * FROM accounts WHERE userId = ? AND provider = ?",
          [userIdInDb, "firebase"]
        );

        if (accountExists.length === 0) {
          await db.execute(
            `INSERT INTO accounts (userId, type, provider, providerAccountId, created_at, updated_at) 
             VALUES (?, ?, ?, ?, NOW(), NOW())`,
            [userIdInDb, "oauth", "firebase", uid]
          );
          console.log("Firebase 帳戶記錄創建成功");
        } else {
          await db.execute(
            "UPDATE accounts SET providerAccountId = ?, updated_at = NOW() WHERE userId = ? AND provider = ?",
            [uid, userIdInDb, "firebase"]
          );
          console.log("Firebase 帳戶記錄更新成功");
        }
      } catch (updateError) {
        console.error("更新用戶資料失敗:", updateError);
        throw updateError;
      }
    }

    console.log("所有資料庫操作完成");

    return NextResponse.json({
      success: true,
      userId: userIdInDb,
      message: "用戶資料保存成功",
      isNewUser: existingUsers.length === 0,
    });
  } catch (error) {
    console.error("=== API 錯誤詳情 ===");
    console.error("錯誤訊息:", error.message);
    console.error("錯誤堆疊:", error.stack);
    console.error("錯誤代碼:", error.code);

    return NextResponse.json(
      {
        success: false,
        error: error.message,
        code: error.code,
        details: "請檢查 console 查看詳細錯誤訊息",
      },
      { status: 500 }
    );
  }
}
