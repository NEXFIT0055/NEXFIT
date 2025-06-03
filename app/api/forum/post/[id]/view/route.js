import { NextResponse } from "next/server";
import db from "@/lib/forum-db";

export async function POST(request, { params }) {
  try {
    const postId = parseInt(params.id, 10);

    // 更新瀏覽次數
    await db.execute("UPDATE forum_posts SET views = views + 1 WHERE id = ?", [
      postId,
    ]);

    // 取得最新的瀏覽次數
    const [rows] = await db.execute(
      "SELECT views FROM forum_posts WHERE id = ?",
      [postId]
    );

    // 回傳最新的瀏覽次數
    return NextResponse.json({ views: rows[0]?.views ?? 0 });
  } catch (error) {
    console.error("Error updating view count:", error);
    return NextResponse.json(
      { error: "Failed to update view count" },
      { status: 500 }
    );
  }
}
