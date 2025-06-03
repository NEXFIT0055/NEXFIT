import { NextResponse } from "next/server";
import jwt from "jsonwebtoken";
import db from "@/lib/forum-db";

// 從 token 取得用戶 ID
function getUserIdFromToken(req) {
  const authHeader = req.headers.get("authorization");
  if (!authHeader || !authHeader.startsWith("Bearer ")) return null;

  const token = authHeader.split(" ")[1];
  try {
    const decoded = jwt.verify(token, process.env.JWT_SECRET);
    return decoded.userId ? Number(decoded.userId) : null;
  } catch {
    return null;
  }
}

// 取得單篇文章（需要權限檢查）
export async function GET(req, { params }) {
  const { id } = params;
  const userId = getUserIdFromToken(req);

  if (!userId) {
    return NextResponse.json({ error: "未登入" }, { status: 401 });
  }

  try {
    // 查詢文章是否存在且屬於該用戶
    const [rows] = await db.execute(
      "SELECT * FROM forum_posts WHERE id = ? AND user_id = ?",
      [id, userId]
    );

    if (rows.length === 0) {
      // 檢查文章是否存在（不考慮作者）
      const [checkRows] = await db.execute(
        "SELECT user_id FROM forum_posts WHERE id = ?",
        [id]
      );

      if (checkRows.length === 0) {
        return NextResponse.json({ error: "文章不存在" }, { status: 404 });
      } else {
        return NextResponse.json({ error: "無權限編輯此文章" }, { status: 403 });
      }
    }

    // 直接返回資料庫中的 `images` 和 `tags` 欄位
    const post = rows[0];
    post.images = Array.isArray(post.images) ? post.images : JSON.parse(post.images || "[]");
    post.tags = Array.isArray(post.tags) ? post.tags : JSON.parse(post.tags || "[]");

    return NextResponse.json(post);
  } catch (error) {
    console.error("取得文章失敗:", error);
    return NextResponse.json(
      { error: "伺服器錯誤", detail: error.message },
      { status: 500 }
    );
  }
}

// 更新單篇文章（需要權限檢查）
export async function PUT(req, { params }) {
  const { id } = params;
  const userId = getUserIdFromToken(req);

  if (!userId) {
    return NextResponse.json({ error: "未登入" }, { status: 401 });
  }

  const data = await req.json();
  const { title, content, category, images, tags } = data;

  if (!title || !category) {
    return NextResponse.json({ error: "標題和分類為必填" }, { status: 400 });
  }

  try {
    // 檢查文章是否存在且屬於該用戶
    const [checkRows] = await db.execute(
      "SELECT id FROM forum_posts WHERE id = ? AND user_id = ?",
      [id, userId]
    );

    if (checkRows.length === 0) {
      return NextResponse.json({ error: "找不到文章或無權限" }, { status: 403 });
    }

    // 確保 images 是有效的陣列
    const imagesArray = Array.isArray(images) ? images : [];
    
    // 執行更新
    await db.execute(
      "UPDATE forum_posts SET title = ?, content = ?, category = ?, images = ?, tags = ? WHERE id = ? AND user_id = ?",
      [
        title,
        content,
        category,
        JSON.stringify(imagesArray),
        JSON.stringify(tags || []),
        id,
        userId,
      ]
    );

    return NextResponse.json({ success: true });
  } catch (error) {
    console.error("更新文章失敗:", error);
    return NextResponse.json(
      { error: "更新失敗", detail: error.message },
      { status: 500 }
    );
  }
}