import { NextResponse } from "next/server";
import { sendWelcomeNewsletter } from "@/lib/email";
import { verifyToken } from "@/lib/auth";
import db from "@/lib/forum-db";

export async function POST(req) {
  try {
    const token = req.headers.get("authorization")?.split(" ")[1];

    if (!token) {
      return NextResponse.json(
        {
          success: false,
          message: "未提供認證token",
        },
        { status: 401 }
      );
    }

    const decoded = verifyToken(token);
    if (!decoded) {
      return NextResponse.json(
        {
          success: false,
          message: "無效或過期的token",
        },
        { status: 401 }
      );
    }

    const { newsletter } = await req.json();

    const [users] = await db.query(
      `
      SELECT 
        up.name, 
        u.email, 
        up.newsletter as currentStatus 
      FROM user_profiles up
      LEFT JOIN users u ON up.user_id = u.id 
      WHERE up.user_id = ?
    `,
      [decoded.userId]
    );

    // 🔧 備選方案：如果你的表結構不同，可以用這個
    /*
    const [users] = await db.query(`
      SELECT 
        up.name, 
        u.email, 
        up.newsletter as currentStatus 
      FROM user_profiles up
      INNER JOIN users u ON up.id = u.profile_id 
      WHERE u.id = ?
    `, [decoded.userId]);
    */

    if (users.length === 0) {
      return NextResponse.json(
        {
          success: false,
          message: "用戶不存在或用戶資料不完整",
        },
        { status: 404 }
      );
    }

    const user = users[0];
    const wasSubscribed = user.currentStatus;

    await db.query(
      "UPDATE user_profiles SET newsletter = ? WHERE user_id = ?",
      [newsletter, decoded.userId]
    );

    // 如果從未訂閱變為訂閱，發送歡迎信
    if (newsletter && !wasSubscribed) {
      try {
        await sendWelcomeNewsletter(user.email, user.name);
        console.log(`歡迎電子報已發送給: ${user.email}`);

        return NextResponse.json({
          success: true,
          message: "電子報訂閱成功！歡迎信已發送到您的信箱",
        });
      } catch (emailError) {
        console.error("歡迎信發送失敗:", emailError);

        return NextResponse.json({
          success: true,
          message: "電子報訂閱成功！但歡迎信發送失敗，請稍後重試",
        });
      }
    }

    // 取消訂閱
    if (!newsletter && wasSubscribed) {
      return NextResponse.json({
        success: true,
        message: "已取消電子報訂閱",
      });
    }

    // 狀態無變化
    return NextResponse.json({
      success: true,
      message: newsletter ? "您已經是訂閱者" : "您已經取消訂閱",
    });
  } catch (error) {
    console.error("訂閱處理失敗:", error);
    return NextResponse.json(
      {
        success: false,
        message: "訂閱處理失敗: " + error.message,
      },
      { status: 500 }
    );
  }
}
