import { NextResponse } from "next/server";
import db from "@/lib/forum-db";

export async function GET() {
  // 根據實際需求調整排序條件
  const [rows] = await db.query(
    "SELECT id, title, images, views FROM forum_posts ORDER BY views DESC LIMIT 10"
  );
  // 處理 images 欄位
  const posts = rows.map((post) => ({
    ...post,
    image: Array.isArray(post.images)
      ? post.images[0]
      : typeof post.images === "string"
      ? JSON.parse(post.images || "[]")[0] || ""
      : "",
  }));
  return NextResponse.json(posts);
}
