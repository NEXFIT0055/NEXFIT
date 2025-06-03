// app/api/accountCenter/profile/account/route.js

import { NextResponse } from "next/server";
import db from "@/lib/forum-db";
import { verifyToken } from "@/lib/auth";
import { writeFile, mkdir } from "fs/promises";
import path from "path";

// 初始化 Firebase Admin
import admin from "firebase-admin";

// 檢查並初始化 Firebase Admin
let firebaseInitialized = false;

if (!admin.apps.length) {
  try {
    const firebaseConfig = {
      project_id: process.env.FIREBASE_PROJECT_ID,
      client_email: process.env.FIREBASE_CLIENT_EMAIL,
      private_key: process.env.FIREBASE_PRIVATE_KEY?.replace(/\\n/g, "\n"),
    };

    if (
      firebaseConfig.project_id &&
      firebaseConfig.client_email &&
      firebaseConfig.private_key
    ) {
      admin.initializeApp({
        credential: admin.credential.cert(firebaseConfig),
      });
      firebaseInitialized = true;
      console.log("✅ Firebase Admin SDK 初始化成功");
    } else {
      console.warn("⚠️ Firebase 環境變數不完整，跳過初始化");
    }
  } catch (error) {
    console.error("❌ Firebase Admin SDK 初始化失敗:", error);
    firebaseInitialized = false;
  }
}

// Firebase Token 驗證函數
async function verifyFirebaseToken(token) {
  if (!firebaseInitialized) {
    return null;
  }

  try {
    const decodedToken = await admin.auth().verifyIdToken(token);
    return {
      uid: decodedToken.uid,
      email: decodedToken.email,
      email_verified: decodedToken.email_verified,
    };
  } catch (error) {
    console.log("❌ Firebase token 驗證失敗:", error.message);
    return null;
  }
}

// JWT token 驗證函數
function verifyJWTToken(token) {
  try {
    const parts = token.split(".");
    if (parts.length !== 3) {
      return null;
    }
    return verifyToken(token);
  } catch (error) {
    console.log("❌ JWT Token 驗證失敗:", error.message);
    return null;
  }
}

// 🔧 修復：改進的用戶查找和創建函數
async function findOrCreateUser(email) {
  try {
    // 1. 先查找現有用戶
    const [usersResult] = await db.execute(
      "SELECT id, email, oauth_provider FROM users WHERE email = ?",
      [email]
    );

    let userId;

    if (usersResult && usersResult.length > 0) {
      // 用戶存在
      userId = usersResult[0].id;
      console.log(`✅ 找到現有用戶，ID: ${userId}`);
    } else {
      // 🔧 修復：如果用戶不存在，創建新用戶
      console.log(`📝 為 Firebase 用戶創建新記錄: ${email}`);

      const [insertResult] = await db.execute(
        "INSERT INTO users (email, oauth_provider, created_at, updated_at) VALUES (?, 'firebase', NOW(), NOW())",
        [email]
      );

      userId = insertResult.insertId;
      console.log(`✅ 創建新用戶成功，ID: ${userId}`);
    }

    // 2. 查詢或創建 user_profiles
    let [profilesResult] = await db.execute(
      `SELECT user_id, name, nickname, phone, address,
       DATE_FORMAT(birthdate, '%Y/%m/%d') as birthdate,
       gender, newsletter, avatar_url
       FROM user_profiles WHERE user_id = ?`,
      [userId]
    );

    if (!profilesResult || profilesResult.length === 0) {
      // 創建新的 profile 記錄
      const defaultName = email.split("@")[0];
      await db.execute(
        "INSERT INTO user_profiles (user_id, name, created_at, updated_at) VALUES (?, ?, NOW(), NOW())",
        [userId, defaultName]
      );

      console.log(`✅ 創建新的 user_profiles 記錄，用戶 ID: ${userId}`);

      // 重新查詢
      [profilesResult] = await db.execute(
        `SELECT user_id, name, nickname, phone, address,
         DATE_FORMAT(birthdate, '%Y/%m/%d') as birthdate,
         gender, newsletter, avatar_url
         FROM user_profiles WHERE user_id = ?`,
        [userId]
      );
    }

    const profile = profilesResult[0];
    return {
      id: userId,
      email: email,
      oauth_provider: "firebase",
      name: profile?.name,
      nickname: profile?.nickname,
      phone: profile?.phone,
      address: profile?.address,
      birthdate: profile?.birthdate,
      gender: profile?.gender,
      newsletter: profile?.newsletter,
      avatar_url: profile?.avatar_url,
    };
  } catch (error) {
    console.error("查找或創建用戶失敗:", error);
    throw error;
  }
}

// 🔧 修復：統一的用戶驗證函數
async function verifyUser(request) {
  const authHeader = request.headers.get("Authorization");

  if (!authHeader) {
    return { success: false, message: "未授權訪問" };
  }

  const token = authHeader.split(" ")[1];
  if (!token) {
    return { success: false, message: "Token 不存在" };
  }

  console.log("🔍 開始用戶驗證...");

  // 1. 先嘗試 JWT token 驗證
  const traditionalAuth = verifyJWTToken(token);
  if (traditionalAuth) {
    console.log("✅ JWT 驗證成功，用戶 ID:", traditionalAuth.userId);
    return {
      success: true,
      userId: traditionalAuth.userId,
      authType: "jwt",
    };
  }

  // 2. 嘗試 Firebase token 驗證
  const firebaseAuth = await verifyFirebaseToken(token);
  if (firebaseAuth) {
    console.log("✅ Firebase 驗證成功，email:", firebaseAuth.email);

    try {
      // 🔧 修復：使用改進的查找或創建函數
      const userData = await findOrCreateUser(firebaseAuth.email);
      console.log("✅ Firebase 用戶資料處理成功，ID:", userData.id);

      return {
        success: true,
        userId: userData.id,
        email: firebaseAuth.email,
        authType: "firebase",
      };
    } catch (error) {
      console.error("❌ Firebase 用戶資料處理失敗:", error);
      return {
        success: false,
        message: "Firebase 用戶資料處理失敗: " + error.message,
      };
    }
  }

  console.log("❌ 所有驗證方式都失敗");
  return { success: false, message: "無效的認證" };
}

// 🔧 修復：確保 user_profiles 記錄存在
async function ensureUserProfile(userId) {
  try {
    const [existingProfile] = await db.execute(
      "SELECT user_id FROM user_profiles WHERE user_id = ?",
      [userId]
    );

    if (!existingProfile || existingProfile.length === 0) {
      const [userInfo] = await db.execute(
        "SELECT email FROM users WHERE id = ?",
        [userId]
      );

      const defaultName = userInfo[0]?.email?.split("@")[0] || "User";

      await db.execute(
        "INSERT INTO user_profiles (user_id, name, created_at, updated_at) VALUES (?, ?, NOW(), NOW())",
        [userId, defaultName]
      );

      console.log("✅ 已創建新的 user_profiles 記錄");
    }
  } catch (error) {
    console.error("❌ 確保用戶 profile 失敗:", error);
    throw error;
  }
}

// 🔧 修復：統一的用戶資料獲取函數
async function getUserData(userId) {
  console.log("🔍 開始獲取用戶資料，ID:", userId);

  try {
    const [usersResult] = await db.execute(
      "SELECT id, email, oauth_provider FROM users WHERE id = ?",
      [userId]
    );

    if (!usersResult || usersResult.length === 0) {
      console.log("❌ 在 users 表中找不到用戶");
      return null;
    }

    const [profileResult] = await db.execute(
      `SELECT user_id as id, name, nickname, phone, address,
       DATE_FORMAT(birthdate, '%Y/%m/%d') as birthdate,
       gender, newsletter, avatar_url
       FROM user_profiles WHERE user_id = ?`,
      [userId]
    );

    if (!profileResult || profileResult.length === 0) {
      console.log("❌ 在 user_profiles 表中找不到資料，嘗試創建...");
      await ensureUserProfile(userId);

      // 重新查詢
      const [newProfileResult] = await db.execute(
        `SELECT user_id as id, name, nickname, phone, address,
         DATE_FORMAT(birthdate, '%Y/%m/%d') as birthdate,
         gender, newsletter, avatar_url
         FROM user_profiles WHERE user_id = ?`,
        [userId]
      );

      if (!newProfileResult || newProfileResult.length === 0) {
        console.log("❌ 創建 profile 後仍無法獲取資料");
        return null;
      }

      const userData = {
        id: usersResult[0].id,
        email: usersResult[0].email,
        oauth_provider: usersResult[0].oauth_provider,
        ...newProfileResult[0],
        avatar_url: newProfileResult[0].avatar_url,
      };

      console.log("📊 獲取到的用戶資料 (新創建):", {
        id: userData.id,
        email: userData.email,
        avatar_url: userData.avatar_url,
      });

      return userData;
    }

    const userData = {
      id: usersResult[0].id,
      email: usersResult[0].email,
      oauth_provider: usersResult[0].oauth_provider,
      ...profileResult[0],
      avatar_url: profileResult[0].avatar_url,
    };

    console.log("📊 獲取到的用戶資料:", {
      id: userData.id,
      email: userData.email,
      avatar_url: userData.avatar_url,
    });

    return userData;
  } catch (error) {
    console.error("❌ 獲取用戶資料失敗:", error);
    throw error;
  }
}

// ===== GET 方法 =====
export async function GET(request) {
  try {
    console.log("=== GET API 開始 ===");

    // 測試資料庫連接
    if (typeof db.execute !== "function") {
      console.error("❌ 資料庫模組配置錯誤");
      return NextResponse.json(
        { message: "資料庫模組配置錯誤" },
        { status: 500 }
      );
    }

    try {
      await db.execute("SELECT 1 as test");
      console.log("✅ 資料庫連接正常");
    } catch (dbError) {
      console.error("❌ 資料庫連接失敗:", dbError);
      return NextResponse.json(
        { message: "資料庫連接失敗", error: dbError.message },
        { status: 500 }
      );
    }

    // 驗證用戶
    const authResult = await verifyUser(request);
    if (!authResult.success) {
      console.log("❌ 用戶驗證失敗:", authResult.message);
      return NextResponse.json(
        { message: authResult.message },
        { status: 401 }
      );
    }

    console.log(
      `✅ ${authResult.authType} 認證成功，用戶 ID:`,
      authResult.userId
    );

    // 獲取用戶資料
    const userData = await getUserData(authResult.userId);
    if (!userData) {
      console.log("❌ 找不到用戶資料");
      return NextResponse.json({ message: "找不到用戶資料" }, { status: 404 });
    }

    console.log("✅ 成功獲取用戶資料，準備返回");

    // 🔧 修復：統一頭像欄位處理
    const responseData = {
      status: "success",
      data: {
        ...userData,
        avatar: userData.avatar_url, // 統一使用 avatar_url
      },
      authType: authResult.authType,
    };

    console.log("📤 API 返回資料:", {
      status: responseData.status,
      userId: responseData.data.id,
      email: responseData.data.email,
      avatar: responseData.data.avatar,
      authType: responseData.authType,
    });

    return NextResponse.json(responseData);
  } catch (error) {
    console.error("❌ GET API 發生錯誤:", error);
    return NextResponse.json(
      { message: "獲取用戶資料失敗", error: error.message },
      { status: 500 }
    );
  }
}

// ===== PUT 方法 (簡化和優化) =====
export async function PUT(request) {
  try {
    console.log("🔄 === PUT API 開始 ===");

    // 驗證用戶
    const authResult = await verifyUser(request);
    if (!authResult.success) {
      console.log("❌ PUT 用戶驗證失敗:", authResult.message);
      return NextResponse.json(
        { message: authResult.message },
        { status: 401 }
      );
    }

    const userId = authResult.userId;
    console.log(`✅ ${authResult.authType} 認證成功，用戶 ID:`, userId);

    // 🔧 修復：確保 profile 存在，特別是對 Firebase 用戶
    await ensureUserProfile(userId);

    // 解析請求內容
    const contentType = request.headers.get("content-type");
    let updateData = {};

    if (contentType?.includes("application/json")) {
      // 處理 JSON 請求 (主要用於頭像更新)
      console.log("📷 處理 JSON 請求...");

      try {
        const body = await request.json();
        console.log("📤 收到的資料:", body);

        // 處理頭像 URL
        if (body.avatar_url) {
          console.log("🎯 更新頭像 URL:", body.avatar_url);
          updateData.avatar_url = body.avatar_url;
        }

        // 🔧 修復：也處理 avatar 欄位（向後相容）
        if (body.avatar && !body.avatar_url) {
          console.log("🎯 更新頭像 (avatar 欄位):", body.avatar);
          updateData.avatar_url = body.avatar;
        }

        // 處理其他欄位
        const allowedFields = [
          "name",
          "nickname",
          "phone",
          "address",
          "gender",
          "newsletter",
        ];
        allowedFields.forEach((field) => {
          if (body[field] !== undefined) {
            updateData[field] =
              field === "newsletter"
                ? body[field] === true || body[field] === "true"
                  ? 1
                  : 0
                : body[field];
          }
        });
      } catch (jsonError) {
        console.error("❌ JSON 解析失敗:", jsonError);
        return NextResponse.json(
          { success: false, message: "JSON 格式錯誤" },
          { status: 400 }
        );
      }
    } else {
      // 處理 FormData 請求
      console.log("📁 處理 FormData 請求...");
      const formData = await request.formData();

      // 檢查 Cloudinary URL
      if (formData.has("avatar_url")) {
        updateData.avatar_url = formData.get("avatar_url");
        console.log("🎯 FormData 頭像 URL:", updateData.avatar_url);
      }
      // 處理檔案上傳
      else if (formData.has("avatar")) {
        const avatar = formData.get("avatar");
        if (avatar && avatar.size > 0) {
          try {
            // 檔案驗證
            const allowedTypes = [
              "image/jpeg",
              "image/jpg",
              "image/png",
              "image/gif",
            ];
            if (!allowedTypes.includes(avatar.type)) {
              throw new Error("不支援的圖片格式");
            }

            const maxSize = 5 * 1024 * 1024;
            if (avatar.size > maxSize) {
              throw new Error("圖片大小不能超過 5MB");
            }

            // 生成檔名
            const timestamp = Date.now();
            const randomString = Math.random().toString(36).substring(2, 8);
            const fileExtension = avatar.name.split(".").pop();
            const fileName = `avatar_${userId}_${timestamp}_${randomString}.${fileExtension}`;

            // 確保目錄存在
            const uploadDir = path.join(
              process.cwd(),
              "public",
              "uploads",
              "avatars"
            );
            await mkdir(uploadDir, { recursive: true });

            // 寫入檔案
            const filePath = path.join(uploadDir, fileName);
            const bytes = await avatar.arrayBuffer();
            const buffer = Buffer.from(bytes);
            await writeFile(filePath, buffer);

            updateData.avatar_url = `/uploads/avatars/${fileName}`;
            console.log("📁 檔案上傳成功:", updateData.avatar_url);
          } catch (error) {
            return NextResponse.json(
              { success: false, message: "頭像上傳失敗: " + error.message },
              { status: 400 }
            );
          }
        }
      }

      // 處理其他 FormData 欄位
      const allowedFields = [
        "name",
        "nickname",
        "phone",
        "address",
        "gender",
        "newsletter",
      ];
      allowedFields.forEach((field) => {
        if (formData.has(field)) {
          updateData[field] =
            field === "newsletter"
              ? formData.get(field) === "true"
                ? 1
                : 0
              : formData.get(field);
        }
      });
    }

    console.log("📊 最終更新資料:", updateData);

    // 如果沒有要更新的資料
    if (Object.keys(updateData).length === 0) {
      console.log("ℹ️ 沒有資料需要更新");
      const userData = await getUserData(userId);
      return NextResponse.json({
        success: true,
        message: "沒有資料需要更新",
        data: {
          ...userData,
          avatar: userData.avatar_url, // 統一使用 avatar_url
        },
        authType: authResult.authType,
      });
    }

    // 🔧 修復：在更新前確保記錄存在
    try {
      const [checkResult] = await db.execute(
        "SELECT user_id FROM user_profiles WHERE user_id = ?",
        [userId]
      );

      if (!checkResult || checkResult.length === 0) {
        console.log("⚠️ user_profiles 記錄不存在，正在創建...");
        await ensureUserProfile(userId);
      }
    } catch (error) {
      console.error("❌ 檢查 user_profiles 記錄失敗:", error);
    }

    // 構建 SQL 更新語句
    const updateFields = Object.keys(updateData).map((field) => `${field} = ?`);
    const updateValues = Object.values(updateData);

    updateFields.push("updated_at = NOW()");
    updateValues.push(userId);

    const updateQuery = `UPDATE user_profiles SET ${updateFields.join(
      ", "
    )} WHERE user_id = ?`;

    console.log("🔄 執行 SQL:", updateQuery);
    console.log("📊 參數:", updateValues);

    // 執行更新
    const [updateResult] = await db.execute(updateQuery, updateValues);
    console.log("📈 更新結果:", updateResult);

    if (updateResult.affectedRows === 0) {
      console.log("⚠️ 沒有記錄被更新，可能是 user_profiles 記錄不存在");

      // 🔧 修復：嘗試重新創建並更新
      try {
        await ensureUserProfile(userId);
        const [retryResult] = await db.execute(updateQuery, updateValues);

        if (retryResult.affectedRows === 0) {
          return NextResponse.json(
            { success: false, message: "無法更新用戶資料" },
            { status: 500 }
          );
        }

        console.log("✅ 重試更新成功");
      } catch (retryError) {
        console.error("❌ 重試更新失敗:", retryError);
        return NextResponse.json(
          { success: false, message: "更新用戶資料失敗" },
          { status: 500 }
        );
      }
    }

    // 獲取更新後的資料
    const updatedUserData = await getUserData(userId);

    console.log("✅ 資料庫更新成功！");
    console.log("📊 更新後的資料:", {
      id: updatedUserData.id,
      avatar_url: updatedUserData.avatar_url,
    });

    // 🔧 修復：統一返回格式
    const responseData = {
      success: true,
      message: "用戶資料更新成功",
      data: {
        ...updatedUserData,
        avatar: updatedUserData.avatar_url, // 統一使用 avatar_url
      },
      authType: authResult.authType,
    };

    console.log("📤 PUT 返回資料:", {
      success: responseData.success,
      userId: responseData.data.id,
      avatar: responseData.data.avatar,
    });

    return NextResponse.json(responseData);
  } catch (error) {
    console.error("❌ PUT API 錯誤:", error);
    return NextResponse.json(
      {
        success: false,
        message: "更新用戶資料失敗",
        error: error.message,
      },
      { status: 500 }
    );
  }
}

// ===== PATCH 方法 (指向 PUT) =====
export async function PATCH(request) {
  console.log("🔄 PATCH 請求轉發到 PUT...");
  return PUT(request);
}
