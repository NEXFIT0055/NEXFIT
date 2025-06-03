import { NextResponse } from "next/server";
import db from "@/lib/forum-db";

// 取得單篇文章
export async function GET(req, { params }) {
  const postId = Number(params.id);

  try {
    const [rows] = await db.query("SELECT * FROM forum_posts WHERE id = ?", [
      postId,
    ]);

    if (rows.length === 0) {
      return NextResponse.json({ error: "找不到此篇文章" }, { status: 404 });
    }

    // 若有 images 是 JSON 字串，要先轉為陣列
    const post = rows[0];
    if (post.images) {
      try {
        if (typeof post.images === "string") {
          post.images = JSON.parse(post.images);
        }
      } catch {
        post.images = [];
      }
    } else {
      post.images = [];
    }

    return NextResponse.json(post);
  } catch (error) {
    console.error("查詢文章錯誤:", error);
    return NextResponse.json(
      { error: "伺服器錯誤", detail: error.message },
      { status: 500 }
    );
  }
}

export async function DELETE(req, { params }) {
  const postId = Number(params.id);

  try {
    // 刪除文章
    const [result] = await db.execute("DELETE FROM forum_posts WHERE id = ?", [
      postId,
    ]);

    if (result.affectedRows === 0) {
      return NextResponse.json({ error: "找不到此篇文章" }, { status: 404 });
    }

    return NextResponse.json({ success: true });
  } catch (error) {
    console.error("刪除文章失敗:", error);
    return NextResponse.json({ error: "伺服器錯誤" }, { status: 500 });
  }
}
