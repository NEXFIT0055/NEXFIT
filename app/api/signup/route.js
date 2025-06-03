import { NextResponse } from "next/server";
import bcrypt from "bcryptjs";
import db from "@/lib/forum-db";
import jwt from "jsonwebtoken";

export async function POST(request) {
  try {
    const body = await request.json();
    const { email, password, name, phone, birthdate } = body;

    // 基本驗證
    if (!email || !password || !name || !phone || !birthdate) {
      return NextResponse.json({
        message: "請填寫所有必填欄位",
        status: 400,
      });
    }

    if (!email.includes("@")) {
      return NextResponse.json({
        message: "請輸入有效的電子信箱",
        status: 400,
      });
    }

    // 🔥 新增：處理電話號碼格式
    // 移除所有非數字字符，只保留純數字
    const cleanPhone = phone.replace(/\D/g, "");

    // 驗證電話號碼格式（台灣手機號碼應該是10位數，以09開頭）
    if (
      !cleanPhone ||
      cleanPhone.length !== 10 ||
      !cleanPhone.startsWith("09")
    ) {
      return NextResponse.json({
        message: "請輸入有效的手機號碼（09XXXXXXXX）",
        status: 400,
      });
    }

    // 處理日期格式，只保留 YYYY-MM-DD 部分
    const formattedBirthdate = birthdate.split("T")[0];

    const connection = await db.getConnection();

    try {
      // 開始事務
      await connection.beginTransaction();

      // 檢查用戶是否已存在（包括電話號碼重複檢查）
      const [existingUser] = await connection.execute(
        "SELECT * FROM users WHERE email = ?",
        [email]
      );

      if (existingUser.length > 0) {
        await connection.rollback();
        connection.release();
        return NextResponse.json(
          {
            message: "此電子信箱已被註冊",
          },
          { status: 409 }
        );
      }

      // 🔥 新增：檢查電話號碼是否已被使用
      const [existingPhone] = await connection.execute(
        "SELECT * FROM user_profiles WHERE phone = ?",
        [cleanPhone]
      );

      if (existingPhone.length > 0) {
        await connection.rollback();
        connection.release();
        return NextResponse.json(
          {
            message: "此電話號碼已被註冊",
          },
          { status: 409 }
        );
      }

      // 密碼加密
      const hashedPassword = await bcrypt.hash(password, 10);

      // 創建新用戶
      const [userResult] = await connection.execute(
        "INSERT INTO users (email, password_hash) VALUES (?, ?)",
        [email, hashedPassword]
      );

      const userId = userResult.insertId;

      // 🔥 修改：使用清理後的電話號碼（純數字）
      await connection.execute(
        `INSERT INTO user_profiles (user_id, name, phone, birthdate) 
                VALUES (?, ?, ?, ?)`,
        [userId, name, cleanPhone, formattedBirthdate]
      );

      console.log("📝 註冊成功資料:", {
        userId,
        email,
        name,
        phone: cleanPhone,
        originalPhone: phone,
        birthdate: formattedBirthdate,
      });

      // 提交事務
      await connection.commit();

      // 生成 JWT token
      const token = jwt.sign(
        {
          userId: userId.toString(),
          email: email,
          iat: Math.floor(Date.now() / 1000),
          type: "access",
        },
        process.env.JWT_SECRET,
        {
          expiresIn: "24h",
          algorithm: "HS256",
        }
      );

      // 🔥 修改：返回更完整的用戶資料
      return NextResponse.json(
        {
          message: "註冊成功",
          token,
          user: {
            id: userId,
            email,
            name,
            phone: cleanPhone, // 返回清理後的電話號碼
          },
        },
        { status: 201 }
      );
    } catch (error) {
      // 如果出錯，回滾事務
      await connection.rollback();
      console.error("具體錯誤:", error);

      // 🔥 新增：更詳細的錯誤處理
      if (error.code === "ER_DUP_ENTRY") {
        if (error.message.includes("phone")) {
          return NextResponse.json(
            { message: "此電話號碼已被註冊" },
            { status: 409 }
          );
        } else if (error.message.includes("email")) {
          return NextResponse.json(
            { message: "此電子信箱已被註冊" },
            { status: 409 }
          );
        }
      }

      throw error;
    } finally {
      connection.release();
    }
  } catch (error) {
    console.error("註冊失敗:", error);
    return NextResponse.json(
      {
        message: "註冊失敗",
        error:
          process.env.NODE_ENV === "development" ? error.message : "系統錯誤",
      },
      { status: 500 }
    );
  }
}
