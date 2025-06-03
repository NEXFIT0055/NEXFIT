// app/api/login/route.js

import { NextResponse } from "next/server";
import bcrypt from "bcryptjs";
import jwt from "jsonwebtoken";
import db from "@/lib/forum-db";

// JWT 密鑰，建議放在環境變數中
const JWT_SECRET = process.env.JWT_SECRET || "your-secret-key-here";

export async function POST(request) {
  try {
    console.log("=== 登入 API 開始 ===");

    // 檢查請求內容類型
    const contentType = request.headers.get("content-type");
    if (!contentType || !contentType.includes("application/json")) {
      console.error("❌ 請求內容類型錯誤:", contentType);
      return NextResponse.json(
        { success: false, message: "請求格式錯誤" },
        { status: 400 }
      );
    }

    // 解析請求數據
    let body;
    try {
      body = await request.json();
      console.log("📧 收到登入請求:", { email: body.email });
    } catch (parseError) {
      console.error("❌ JSON 解析失敗:", parseError);
      return NextResponse.json(
        { success: false, message: "請求數據格式錯誤" },
        { status: 400 }
      );
    }

    const { email, password } = body;

    // 驗證必填欄位
    if (!email || !password) {
      console.log("❌ 缺少必填欄位");
      return NextResponse.json(
        { success: false, message: "請提供 email 和 password" },
        { status: 400 }
      );
    }

    // 測試資料庫連接
    if (typeof db.execute !== "function") {
      console.error("❌ 資料庫模組配置錯誤");
      return NextResponse.json(
        { success: false, message: "資料庫配置錯誤" },
        { status: 500 }
      );
    }

    try {
      await db.execute("SELECT 1 as test");
      console.log("✅ 資料庫連接正常");
    } catch (dbError) {
      console.error("❌ 資料庫連接失敗:", dbError);
      return NextResponse.json(
        { success: false, message: "資料庫連接失敗" },
        { status: 500 }
      );
    }

    // 查詢用戶
    console.log("🔍 查詢用戶:", email);
    const [userResults] = await db.execute(
      "SELECT id, email, password_hash, oauth_provider FROM users WHERE email = ?",
      [email]
    );

    if (!userResults || userResults.length === 0) {
      console.log("❌ 用戶不存在:", email);
      return NextResponse.json(
        { success: false, message: "用戶不存在或密碼錯誤" },
        { status: 401 }
      );
    }

    const user = userResults[0];
    console.log("✅ 找到用戶:", { id: user.id, email: user.email, oauth_provider: user.oauth_provider });

    // 檢查是否為 OAuth 用戶
    if (user.oauth_provider && user.oauth_provider !== 'local') {
      console.log("❌ OAuth 用戶嘗試密碼登入:", user.oauth_provider);
      return NextResponse.json(
        { success: false, message: `此帳號需要使用 ${user.oauth_provider} 登入` },
        { status: 401 }
      );
    }

    // 驗證密碼
    if (!user.password_hash) {
      console.log("❌ 用戶沒有設置密碼");
      return NextResponse.json(
        { success: false, message: "請使用 Google 登入或重置密碼" },
        { status: 401 }
      );
    }

    let passwordValid = false;
    try {
      passwordValid = await bcrypt.compare(password, user.password_hash);
      console.log("🔐 密碼驗證結果:", passwordValid);
    } catch (bcryptError) {
      console.error("❌ 密碼驗證錯誤:", bcryptError);
      return NextResponse.json(
        { success: false, message: "密碼驗證失敗" },
        { status: 500 }
      );
    }

    if (!passwordValid) {
      console.log("❌ 密碼不正確");
      return NextResponse.json(
        { success: false, message: "用戶不存在或密碼錯誤" },
        { status: 401 }
      );
    }

    // 獲取用戶詳細資料
    console.log("📊 獲取用戶詳細資料...");
    const [profileResults] = await db.execute(
      `SELECT user_id, name, nickname, phone, address,
       DATE_FORMAT(birthdate, '%Y/%m/%d') as birthdate,
       gender, newsletter, avatar_url
       FROM user_profiles WHERE user_id = ?`,
      [user.id]
    );

    let userProfile = null;
    if (profileResults && profileResults.length > 0) {
      userProfile = profileResults[0];
      console.log("✅ 找到用戶 profile");
    } else {
      console.log("⚠️ 用戶沒有 profile，創建基本資料");
      // 創建基本 profile
      const defaultName = email.split("@")[0];
      await db.execute(
        "INSERT INTO user_profiles (user_id, name, created_at, updated_at) VALUES (?, ?, NOW(), NOW())",
        [user.id, defaultName]
      );

      // 重新查詢
      const [newProfileResults] = await db.execute(
        `SELECT user_id, name, nickname, phone, address,
         DATE_FORMAT(birthdate, '%Y/%m/%d') as birthdate,
         gender, newsletter, avatar_url
         FROM user_profiles WHERE user_id = ?`,
        [user.id]
      );

      userProfile = newProfileResults[0];
    }

    // 生成 JWT token
    const tokenPayload = {
      userId: user.id,
      email: user.email,
      iat: Math.floor(Date.now() / 1000),
      exp: Math.floor(Date.now() / 1000) + (24 * 60 * 60), // 24 小時
    };

    let token;
    try {
      token = jwt.sign(tokenPayload, JWT_SECRET);
      console.log("✅ JWT token 生成成功");
    } catch (jwtError) {
      console.error("❌ JWT token 生成失敗:", jwtError);
      return NextResponse.json(
        { success: false, message: "Token 生成失敗" },
        { status: 500 }
      );
    }

    // 組合用戶資料
    const userData = {
      id: user.id,
      email: user.email,
      name: userProfile?.name,
      nickname: userProfile?.nickname,
      phone: userProfile?.phone,
      address: userProfile?.address,
      birthdate: userProfile?.birthdate,
      gender: userProfile?.gender,
      newsletter: userProfile?.newsletter,
      avatar: userProfile?.avatar_url,
      avatar_url: userProfile?.avatar_url,
      oauth_provider: user.oauth_provider,
    };

    console.log("✅ 登入成功:", { 
      userId: userData.id, 
      email: userData.email,
      hasToken: !!token 
    });

    // 返回成功響應
    const response = {
      success: true,
      message: "登入成功",
      token: token,        // 確保有 token
      access_token: token, // 提供備選欄位名
      user: userData,
      data: userData,      // 提供備選資料欄位
    };

    console.log("📤 返回響應:", {
      success: response.success,
      hasToken: !!response.token,
      hasUser: !!response.user,
      userEmail: response.user?.email
    });

    return NextResponse.json(response);

  } catch (error) {
    console.error("❌ 登入 API 發生錯誤:", error);
    
    // 根據錯誤類型返回適當的響應
    if (error.code === 'ER_NO_SUCH_TABLE') {
      return NextResponse.json(
        { success: false, message: "資料庫表不存在，請檢查資料庫配置" },
        { status: 500 }
      );
    } else if (error.code && error.code.startsWith('ER_')) {
      return NextResponse.json(
        { success: false, message: "資料庫查詢錯誤" },
        { status: 500 }
      );
    } else {
      return NextResponse.json(
        { 
          success: false, 
          message: "登入過程發生錯誤",
          error: process.env.NODE_ENV === "development" ? error.message : undefined
        },
        { status: 500 }
      );
    }
  }
}

// 支援 OPTIONS 請求（CORS 預檢）
export async function OPTIONS(request) {
  return new NextResponse(null, {
    status: 200,
    headers: {
      'Access-Control-Allow-Origin': '*',
      'Access-Control-Allow-Methods': 'POST, OPTIONS',
      'Access-Control-Allow-Headers': 'Content-Type, Authorization',
    },
  });
}