// app/api/forum/post/[id]/comments/route.js
import { NextResponse } from "next/server";
import jwt from "jsonwebtoken";
import db from "@/lib/forum-db";

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

// 取得留言
export async function GET(request, { params }) {
  try {
    const [rows] = await db.execute(
      `SELECT c.*, up.name as author_name, up.avatar_url 
       FROM forum_comments c 
       LEFT JOIN user_profiles up ON c.user_id = up.user_id 
       WHERE c.post_id = ? 
       ORDER BY c.created_at DESC`,
      [params.id]
    );
    
    return NextResponse.json(rows);
  } catch (error) {
    console.error("取得留言失敗:", error);
    return NextResponse.json({ error: "取得留言失敗" }, { status: 500 });
  }
}

// 新增留言
export async function POST(request, { params }) {
  try {
    // 檢查登入狀態
    const user = await getUserFromToken(request);
    if (!user) {
      return NextResponse.json({ error: "請先登入" }, { status: 401 });
    }

    const { content } = await request.json();
    
    if (!content?.trim()) {
      return NextResponse.json(
        { error: "留言內容不能為空" },
        { status: 400 }
      );
    }

    // 插入留言
    await db.execute(
      `INSERT INTO forum_comments (post_id, user_id, author_name, content, created_at) 
       VALUES (?, ?, ?, ?, NOW())`,
      [params.id, user.user_id, user.name || user.nickname || "匿名", content]
    );

    return NextResponse.json({ success: true });
  } catch (error) {
    console.error("新增留言失敗:", error);
    return NextResponse.json({ error: "新增留言失敗" }, { status: 500 });
  }
}

// 刪除留言
export async function DELETE(request, { params }) {
  try {
    // 檢查登入狀態
    const user = await getUserFromToken(request);
    if (!user) {
      return NextResponse.json({ error: "請先登入" }, { status: 401 });
    }

    const { commentId } = await request.json();
    
    if (!commentId) {
      return NextResponse.json(
        { error: "留言 ID 為必填" },
        { status: 400 }
      );
    }

    // 檢查留言是否存在且屬於該用戶（或用戶是管理員）
    const [commentRows] = await db.execute(
      "SELECT user_id FROM forum_comments WHERE id = ?",
      [commentId]
    );

    if (commentRows.length === 0) {
      return NextResponse.json({ error: "留言不存在" }, { status: 404 });
    }

    const comment = commentRows[0];
    if (comment.user_id !== user.user_id && user.role !== 'admin') {
      return NextResponse.json({ error: "無權限刪除此留言" }, { status: 403 });
    }

    // 刪除留言
    await db.execute("DELETE FROM forum_comments WHERE id = ?", [commentId]);

    return NextResponse.json({ success: true });
  } catch (error) {
    console.error("刪除留言失敗:", error);
    return NextResponse.json({ error: "刪除留言失敗" }, { status: 500 });
  }
}
