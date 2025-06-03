// app/api/forum/post/route.js
import { NextResponse } from "next/server";
import jwt from "jsonwebtoken";
import db from "@/lib/forum-db"; // 這裡引用連線池

// 從 token 取得用戶資訊
async function getUserFromToken(req) {
  const authHeader = req.headers.get("authorization");
  if (!authHeader || !authHeader.startsWith("Bearer ")) {
    return null;
  }
  
  const token = authHeader.split(" ")[1];
  try {
    const decoded = jwt.verify(token, process.env.JWT_SECRET);
    const userId = decoded.userId;
    
    // 從 user_profiles 表取得用戶資訊
    const [userRows] = await db.execute(
      "SELECT user_id, name, nickname, avatar_url FROM user_profiles WHERE user_id = ?",
      [userId]
    );
    
    return userRows[0] || null;
  } catch {
    return null;
  }
}

// 取得所有文章（帶真實留言數 comment_count）
export async function GET() {
  try {
    const [rows] = await db.query(`
      SELECT 
        p.*, 
        up.avatar_url, -- 取得 user_profiles 的頭像
        (
          SELECT COUNT(*) 
          FROM forum_comments c 
          WHERE c.post_id = p.id
        ) AS comment_count
      FROM forum_posts p
      LEFT JOIN user_profiles up ON p.user_id = up.user_id
      ORDER BY p.created_at DESC
    `);

    const safeParse = (val) => {
      if (!val) return [];
      try {
        return Array.isArray(val) ? val : JSON.parse(val);
      } catch {
        return [];
      }
    };

    const posts = rows.map((post) => ({
      ...post,
      images: safeParse(post.images),
      tags: safeParse(post.tags),
      comment_count: Number(post.comment_count) || 0,
    }));

    return NextResponse.json(posts);
  } catch (error) {
    console.error("取得文章列表失敗:", error);
    return NextResponse.json({ error: "資料庫錯誤" }, { status: 500 });
  }
}

// 新增一篇文章
export async function POST(request) {
  try {
    // 檢查登入狀態並取得用戶資訊
    const user = await getUserFromToken(request);
    if (!user) {
      return NextResponse.json({ error: "請先登入" }, { status: 401 });
    }

    const { title, content, images, tags, category } = await request.json();

    // 驗證必填欄位
    if (!title || !content || !category) {
      return NextResponse.json(
        { error: "標題、內容和分類為必填" },
        { status: 400 }
      );
    }

    // 處理標籤，移除 # 符號
    const cleanTags = tags ? tags.map(tag => tag.replace(/^#/, '')) : [];

    // 插入資料到資料表，使用 token 中的用戶資訊
    const [result] = await db.execute(
      `INSERT INTO forum_posts 
        (user_id, author_name, title, avatar, content, images, tags, category, created_at) 
        VALUES (?, ?, ?, ?, ?, ?, ?, ?, NOW())`,
      [
        user.user_id, // 自動填入 user_id
        user.name || user.nickname || "匿名", // 自動填入作者名稱
        title,
        user.avatar_url || "", // 自動填入頭像
        content,
        images ? JSON.stringify(images) : JSON.stringify([]),
        cleanTags ? JSON.stringify(cleanTags) : JSON.stringify([]),
        category,
      ]
    );

    return NextResponse.json({
      success: true,
      postId: result.insertId,
    });
  } catch (error) {
    console.error("新增文章失敗:", error);
    return NextResponse.json({ error: "新增文章失敗" }, { status: 500 });
  }
}

// 新增留言（不再更新 forum_posts.comment_count 欄位）
export async function POST_COMMENT(request) {
  try {
    const { post_id, author_name, content } = await request.json();

    if (!post_id || !content) {
      return NextResponse.json(
        { error: "文章 ID 和內容為必填" },
        { status: 400 }
      );
    }

    // 新增留言
    await db.execute(
      `INSERT INTO forum_comments (post_id, author_name, content, created_at) 
      VALUES (?, ?, ?, NOW())`,
      [post_id, author_name || "匿名", content]
    );

    return NextResponse.json({ success: true });
  } catch (error) {
    console.error("新增留言失敗:", error);
    return NextResponse.json({ error: "新增留言失敗" }, { status: 500 });
  }
}

// 刪除留言（不再更新 forum_posts.comment_count 欄位）
export async function DELETE_COMMENT(request) {
  try {
    const { comment_id, post_id } = await request.json();

    if (!comment_id || !post_id) {
      return NextResponse.json(
        { error: "留言 ID 和文章 ID 為必填" },
        { status: 400 }
      );
    }

    // 刪除留言
    await db.execute(
      `DELETE FROM forum_comments 
      WHERE id = ?`,
      [comment_id]
    );

    return NextResponse.json({ success: true });
  } catch (error) {
    console.error("刪除留言失敗:", error);
    return NextResponse.json({ error: "刪除留言失敗" }, { status: 500 });
  }
}
