import bcrypt from "bcryptjs";
import jwt from "jsonwebtoken";
import db from "@/lib/forum-db";

const JWT_SECRET = process.env.JWT_SECRET;

// 檢查 JWT_SECRET 是否存在
if (!JWT_SECRET) {
  console.error("警告: JWT_SECRET 環境變量未設置!");
}

// 產生 JWT Token
export const generateToken = (user) => {
  try {
    if (!JWT_SECRET) {
      throw new Error("JWT_SECRET 未設置");
    }

    const payload = {
      userId: user.id,
      email: user.email,
      issuedAt: Math.floor(Date.now() / 1000),
      type: "access",
    };

    const options = {
      expiresIn: "24h",
      algorithm: "HS256", // 明確指定算法
    };

    const token = jwt.sign(payload, JWT_SECRET, options);
    console.log("Token 生成成功，用戶 ID:", user.id);

    return token;
  } catch (error) {
    console.error("生成 Token 失敗:", error);
    return null;
  }
};

// 驗證 JWT Token
export const verifyToken = (token) => {
  try {
    if (!token) {
      console.log("Token 不存在");
      return null;
    }

    if (!JWT_SECRET) {
      console.error("JWT_SECRET 未設置");
      return null;
    }

    // 檢查 token 基本格式
    const parts = token.split(".");
    if (parts.length !== 3) {
      console.log("Token 格式不正確，不是標準的 JWT 格式");
      console.log("Token 內容:", token.substring(0, 50) + "...");
      return null;
    }

    // 嘗試解碼 header 來檢查算法
    try {
      const headerBase64 = parts[0];
      // 處理 base64url 編碼
      const headerDecoded = Buffer.from(
        headerBase64.replace(/-/g, "+").replace(/_/g, "/"),
        "base64"
      ).toString();
      const header = JSON.parse(headerDecoded);
      console.log("JWT Header:", header);

      // 檢查算法
      if (header.alg && header.alg !== "HS256") {
        console.log(`Token 使用的算法: ${header.alg}，期望: HS256`);
      }
    } catch (headerError) {
      console.log("無法解碼 JWT header:", headerError.message);
    }

    // 使用明確的選項進行驗證
    const options = {
      algorithms: ["HS256"], // 明確指定算法
      ignoreExpiration: false,
      ignoreNotBefore: false,
    };

    const decoded = jwt.verify(token, JWT_SECRET, options);
    console.log("JWT 驗證成功:", {
      userId: decoded.userId,
      email: decoded.email,
      type: decoded.type,
      exp: new Date(decoded.exp * 1000).toISOString(),
    });

    return decoded;
  } catch (error) {
    console.error("Token驗證失敗:", {
      name: error.name,
      message: error.message,
      tokenLength: token ? token.length : 0,
      tokenStart: token ? token.substring(0, 20) : "N/A",
    });

    // 根據不同的錯誤類型提供更詳細的日誌
    switch (error.name) {
      case "JsonWebTokenError":
        console.error("JWT 格式錯誤或簽名無效");
        if (error.message.includes("invalid algorithm")) {
          console.error("算法不匹配錯誤 - 檢查 token 生成時使用的算法");
        }
        break;
      case "TokenExpiredError":
        console.error(
          "Token 已過期，過期時間:",
          new Date(error.expiredAt).toISOString()
        );
        break;
      case "NotBeforeError":
        console.error("Token 尚未生效");
        break;
      default:
        console.error("未知的 JWT 錯誤");
    }

    return null;
  }
};

// 密碼加密
export const hashPassword = async (password) => {
  try {
    const salt = await bcrypt.genSalt(10);
    return await bcrypt.hash(password, salt);
  } catch (error) {
    console.error("密碼加密失敗:", error);
    throw error;
  }
};

// 密碼比對
export const comparePassword = async (password, hashedPassword) => {
  try {
    return await bcrypt.compare(password, hashedPassword);
  } catch (error) {
    console.error("密碼比對失敗:", error);
    return false;
  }
};

// 認證中介函式
export const authMiddleware = async (req) => {
  try {
    const authHeader = req.headers.get("authorization");
    console.log("Authorization header:", authHeader ? "存在" : "不存在");

    if (!authHeader) {
      throw new Error("未提供認證header");
    }

    const parts = authHeader.split(" ");
    if (parts.length !== 2 || parts[0] !== "Bearer") {
      throw new Error("認證header格式錯誤");
    }

    const token = parts[1];
    console.log("提取的 token 長度:", token.length);

    if (!token) {
      throw new Error("未提供認證token");
    }

    const decoded = verifyToken(token);
    if (!decoded) {
      throw new Error("無效的認證token");
    }

    return decoded;
  } catch (error) {
    console.error("認證中介函式錯誤:", error.message);
    throw new Error("認證失敗: " + error.message);
  }
};

// 生成重置密碼 token
export const generateResetToken = (userId) => {
  try {
    if (!JWT_SECRET) {
      throw new Error("JWT_SECRET 未設置");
    }

    const payload = {
      userId,
      type: "reset",
      issuedAt: Math.floor(Date.now() / 1000),
    };

    const options = {
      expiresIn: "1h",
      algorithm: "HS256",
    };

    return jwt.sign(payload, JWT_SECRET, options);
  } catch (error) {
    console.error("生成重置密碼 token 失敗:", error);
    return null;
  }
};

export const validateUserToken = async (token) => {
  try {
    console.log("開始驗證用戶 token...");

    const decoded = verifyToken(token);
    if (!decoded) {
      return {
        success: false,
        message: "無效或過期的token",
        status: 401,
      };
    }

    console.log("Token 驗證成功，查詢用戶資料...");

    // 注意：這裡使用 execute 而不是 query
    const [users] = await db.execute(
      "SELECT u.id FROM users u WHERE u.id = ?",
      [decoded.userId]
    );

    if (users.length === 0) {
      console.log("用戶不存在，ID:", decoded.userId);
      return {
        success: false,
        message: "用戶不存在",
        status: 404,
      };
    }

    console.log("用戶驗證成功，ID:", decoded.userId);
    return {
      success: true,
      userId: decoded.userId,
      status: 200,
    };
  } catch (error) {
    console.error("驗證用戶 token 失敗:", error);
    return {
      success: false,
      message: "驗證失敗: " + error.message,
      status: 500,
    };
  }
};

// 添加一個測試函數來檢查 JWT 設置
export const testJWTSetup = () => {
  console.log("=== JWT 設置檢查 ===");
  console.log("JWT_SECRET 存在:", !!JWT_SECRET);
  console.log("JWT_SECRET 長度:", JWT_SECRET ? JWT_SECRET.length : 0);

  if (JWT_SECRET) {
    // 測試生成和驗證
    try {
      const testUser = { id: 1, email: "test@example.com" };
      const testToken = generateToken(testUser);
      console.log("測試 token 生成:", !!testToken);

      if (testToken) {
        const decoded = verifyToken(testToken);
        console.log("測trial token 驗證:", !!decoded);
        console.log("解碼結果:", decoded);
      }
    } catch (error) {
      console.error("JWT 測試失敗:", error);
    }
  }
  console.log("=== JWT 設置檢查結束 ===");
};
