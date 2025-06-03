import { NextResponse } from "next/server";
import db from "@/lib/forum-db"; // 資料庫連線
import jwt from "jsonwebtoken"; // 導入 JWT 處理庫

// 從請求頭獲取授權token並提取用戶 ID
async function getUserIdFromToken(request) {
  const authHeader = request.headers.get('Authorization');
  if (!authHeader || !authHeader.startsWith('Bearer ')) {
    return null;
  }

  try {
    const token = authHeader.split(' ')[1];
    const decoded = jwt.verify(token, process.env.JWT_SECRET);
    return decoded.user_id || decoded.userId; // 兼容不同的 token 格式
  } catch (error) {
    return null;
  }
}

// 獲取用戶點讚過的文章
export async function GET(request) {
  try {
    const user_id = await getUserIdFromToken(request);
    
    if (!user_id) {
      return NextResponse.json(
        { error: "未授權，請先登入" },
        { status: 401 }
      );
    }

    // 查詢用戶點讚過的所有文章 ID
    const [likes] = await db.execute(
      `SELECT post_id FROM forum_user_likes WHERE user_id = ?`,
      [user_id]
    );

    // 提取文章 ID 列表
    const likedPostIds = likes.map(like => like.post_id);

    return NextResponse.json({ liked_posts: likedPostIds });
  } catch (error) {
    console.error("獲取用戶點讚記錄失敗:", error);
    return NextResponse.json({ error: "獲取用戶點讚記錄失敗" }, { status: 500 });
  }
}

export async function POST(request) {
  try {
    // 從請求頭獲取授權token
    const authHeader = request.headers.get('Authorization');
    if (!authHeader || !authHeader.startsWith('Bearer ')) {
      return NextResponse.json(
        { error: "未授權，請先登入" },
        { status: 401 }
      );
    }

    // 提取並驗證 JWT token
    const token = authHeader.split(' ')[1];
    let decoded;
    try {
      decoded = jwt.verify(token, process.env.JWT_SECRET);
    } catch (error) {
      return NextResponse.json(
        { error: "無效或過期的token，請重新登入" },
        { status: 401 }
      );
    }

    // 從token獲取用戶 ID
    const user_id = decoded.user_id || decoded.userId; // 兼容不同的 token 格式
    
    // 從請求體獲取其他參數
    const { post_id, action } = await request.json();

    // 驗證必要參數
    if (!user_id || !post_id || !action) {
      return NextResponse.json(
        { error: "用戶 ID、文章 ID 和操作類型為必填" },
        { status: 400 }
      );
    }

    // 確保 action 是 "like" 或 "unlike"
    if (action !== "like" && action !== "unlike") {
      return NextResponse.json({ error: "無效的操作類型" }, { status: 400 });
    }

    // 檢查文章是否存在
    const [post] = await db.execute(`SELECT id FROM forum_posts WHERE id = ?`, [
      post_id,
    ]);

    if (post.length === 0) {
      return NextResponse.json({ error: "文章不存在" }, { status: 404 });
    }

    // 使用交易處理點讚/取消點讚操作，以確保數據一致性
    const connection = await db.getConnection();
    try {
      await connection.beginTransaction();

      // 檢查用戶是否已點讚此文章
      const [existingLike] = await connection.execute(
        `SELECT * FROM forum_user_likes WHERE user_id = ? AND post_id = ?`,
        [user_id, post_id]
      );

      // 處理點讚或取消點讚
      if (action === "like" && existingLike.length === 0) {
        // 用戶沒有點讚過，新增點讚記錄
        await connection.execute(
          `INSERT INTO forum_user_likes (user_id, post_id) VALUES (?, ?)`,
          [user_id, post_id]
        );
        
        // 增加文章的點讚數量
        await connection.execute(
          `UPDATE forum_posts SET likes = likes + 1 WHERE id = ?`,
          [post_id]
        );
      } else if (action === "unlike" && existingLike.length > 0) {
        // 用戶已點讚，刪除點讚記錄
        await connection.execute(
          `DELETE FROM forum_user_likes WHERE user_id = ? AND post_id = ?`,
          [user_id, post_id]
        );
        
        // 減少文章的點讚數量，但確保不會變成負數
        await connection.execute(
          `UPDATE forum_posts SET likes = GREATEST(likes - 1, 0) WHERE id = ?`,
          [post_id]
        );
      }

      await connection.commit();
      
      return NextResponse.json({ 
        success: true, 
        favorite: (action === "like") 
      });
    } catch (error) {
      await connection.rollback();
      throw error;
    } finally {
      connection.release();
    }
  } catch (error) {
    console.error("處理最愛失敗:", error);
    return NextResponse.json({ error: "處理最愛失敗" }, { status: 500 });
  }
}
