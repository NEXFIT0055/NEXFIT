import { comparePassword, hashPassword, verifyToken } from "@/lib/auth";
import { NextResponse } from "next/server";
import db from "@/lib/forum-db";

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
      console.log("Firebase Admin SDK 初始化成功");
    }
  } catch (error) {
    console.error("Firebase Admin SDK 初始化失敗:", error);
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
    console.log("Firebase token 驗證失敗:", error.message);
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

    const result = verifyToken(token);
    return result;
  } catch (error) {
    console.log("JWT Token 驗證失敗:", error.message);
    return null;
  }
}

// 通過 email 獲取用戶 ID
async function getUserByEmail(email) {
  try {
    const [result] = await db.execute(
      `SELECT u.id, u.oauth_provider FROM users u WHERE u.email = ?`,
      [email]
    );

    if (result && result.length > 0) {
      return result[0];
    }
    return null;
  } catch (error) {
    console.error("通過 email 查詢用戶失敗:", error);
    throw error;
  }
}

// 統一的用戶驗證函數
async function verifyUser(request) {
  const authHeader = request.headers.get("Authorization");

  if (!authHeader) {
    return { success: false, message: "未授權訪問" };
  }

  const token = authHeader.split(" ")[1];

  if (!token) {
    return { success: false, message: "Token 不存在" };
  }

  console.log("開始用戶驗證...");

  // 1. 先嘗試 JWT token 驗證
  const traditionalAuth = verifyJWTToken(token);
  if (traditionalAuth) {
    return {
      success: true,
      userId: traditionalAuth.userId,
      authType: "jwt",
    };
  }

  // 2. 嘗試 Firebase token 驗證
  const firebaseAuth = await verifyFirebaseToken(token);
  if (firebaseAuth) {
    // 通過 email 查詢用戶 ID
    const userData = await getUserByEmail(firebaseAuth.email);
    if (userData) {
      return {
        success: true,
        userId: userData.id,
        email: firebaseAuth.email,
        authType: "firebase",
        oauthProvider: userData.oauth_provider,
      };
    } else {
      return {
        success: false,
        message: "Firebase 用戶不存在於資料庫中",
        email: firebaseAuth.email,
      };
    }
  }

  return { success: false, message: "無效的認證" };
}

export async function POST(request) {
  let connection;

  try {
    console.log("=== 變更密碼 API 開始 ===");

    // 解析請求的 body
    const body = await request.json();
    const { oldPassword, newPassword } = body;

    if (!oldPassword || !newPassword) {
      return NextResponse.json(
        { success: false, message: "缺少必要欄位" },
        { status: 400 }
      );
    }

    // 驗證新密碼長度
    if (newPassword.length < 6) {
      return NextResponse.json(
        { success: false, message: "新密碼長度必須至少6個字元" },
        { status: 400 }
      );
    }

    // 使用統一驗證函數
    const authResult = await verifyUser(request);

    if (!authResult.success) {
      console.log("用戶驗證失敗:", authResult.message);
      return NextResponse.json(
        { success: false, message: authResult.message },
        { status: 401 }
      );
    }

    const userId = authResult.userId;
    console.log(`${authResult.authType} 認證成功，用戶 ID:`, userId);

    // 檢查是否為 OAuth 用戶（不能變更密碼）
    if (authResult.authType === "firebase" || authResult.oauthProvider) {
      return NextResponse.json(
        {
          success: false,
          message: "OAuth 登入用戶無法變更密碼，請使用對應的登入服務管理密碼",
        },
        { status: 400 }
      );
    }

    // 從資料庫中取得使用者目前的加密密碼
    connection = await db.getConnection();

    const [users] = await connection.query(
      "SELECT password_hash, oauth_provider FROM users WHERE id = ?",
      [userId]
    );

    console.log("查詢結果:", users);

    if (users.length === 0) {
      return NextResponse.json(
        { success: false, message: "用戶不存在" },
        { status: 404 }
      );
    }

    const user = users[0];

    // 再次檢查是否為 OAuth 用戶
    if (user.oauth_provider) {
      return NextResponse.json(
        {
          success: false,
          message: "OAuth 登入用戶無法變更密碼，請使用對應的登入服務管理密碼",
        },
        { status: 400 }
      );
    }

    // 檢查是否有設定密碼
    if (!user.password_hash) {
      return NextResponse.json(
        {
          success: false,
          message: "此帳號未設定密碼，無法變更",
        },
        { status: 400 }
      );
    }

    console.log("用戶密碼雜湊值存在");

    // 檢查舊密碼是否正確
    const isMatch = await comparePassword(oldPassword, user.password_hash);
    console.log("密碼比對結果:", isMatch);

    if (!isMatch) {
      return NextResponse.json(
        { success: false, message: "舊密碼錯誤" },
        { status: 401 }
      );
    }

    // 加密新密碼並更新資料庫
    const newHashedPassword = await hashPassword(newPassword);
    await connection.query("UPDATE users SET password_hash = ? WHERE id = ?", [
      newHashedPassword,
      userId,
    ]);

    console.log("密碼變更成功");
    return NextResponse.json(
      {
        success: true,
        message: "密碼變更成功",
        authType: authResult.authType,
      },
      { status: 200 }
    );
  } catch (error) {
    console.error("變更密碼錯誤:", error);
    return NextResponse.json(
      {
        success: false,
        message: "伺服器錯誤，請稍後再試",
      },
      { status: 500 }
    );
  } finally {
    if (connection) {
      try {
        await connection.release();
      } catch (releaseError) {
        console.error("釋放連接錯誤:", releaseError);
      }
    }
  }
}
