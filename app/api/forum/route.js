// app/api/forum/route.js
import forumDb from "@/lib/forum-db";

export async function GET(request) {
  try {
    const [rows] = await forumDb.query("SELECT * FROM forum_posts");
    return Response.json(rows);
  } catch (error) {
    return new Response("資料庫錯誤", { status: 500 });
  }
}
