import { NextResponse } from "next/server";
import db from "@/lib/forum-db";
import { verifyToken } from "@/lib/auth";

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
      `SELECT u.id FROM users u WHERE u.email = ?`,
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

// 獲取用戶身體測量資訊
export async function GET(request) {
  let connection;
  try {
    console.log("=== 獲取身體測量資訊 API 開始 ===");

    // 使用統一驗證函數
    const authResult = await verifyUser(request);

    if (!authResult.success) {
      console.log("用戶驗證失敗:", authResult.message);
      return NextResponse.json({
        success: false,
        message: authResult.message,
        status: 401,
      });
    }

    const userId = authResult.userId;
    console.log(`${authResult.authType} 認證成功，用戶 ID:`, userId);

    connection = await db.getConnection();
    if (!connection) {
      throw new Error("無法建立數據庫連接");
    }

    // 查詢最新的身體測量數據
    const [rows] = await connection.query(
      `SELECT * FROM body_measurements 
       WHERE user_id = ? 
       ORDER BY COALESCE(measurement_date, updated_at) DESC LIMIT 1`,
      [userId]
    );

    // 檢查是否有找到數據
    if (!rows || rows.length === 0) {
      return NextResponse.json({
        success: false,
        message: "找不到身體測量數據",
        status: 404,
      });
    }

    // 將資料包成一個更結構化、前端好理解的格式再傳回去
    const record = rows[0];
    const wrappedData = {
      userId: record.user_id,
      measuredAt: record.measurement_date || record.updated_at,
      measurement: {
        height: record.height,
        weight: record.weight,
        bmi: record.bmi,
        waist: record.waist,
        bodyFatPercentage: record.body_fat_percentage,
        muscleMass: record.muscle_mass,
        skeletalMuscleMass: record.skeletal_muscle_mass,
      },
    };

    console.log("成功獲取身體測量數據");
    return NextResponse.json({
      success: true,
      data: wrappedData,
      authType: authResult.authType,
      status: 200,
    });
  } catch (error) {
    console.error("獲取身體測量資訊失敗:", error);
    return NextResponse.json({
      success: false,
      message: `獲取身體資訊失敗: ${error.message}`,
      status: 500,
    });
  } finally {
    if (connection) {
      try {
        await connection.release();
      } catch (releaseError) {
        console.error("釋放數據庫連接失敗:", releaseError);
      }
    }
  }
}
