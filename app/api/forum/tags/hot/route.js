// app/api/forum/tags/hot/route.js
import forumDb from "@/lib/forum-db";

export async function GET() {
  try {
    const [rows] = await forumDb.query(`
      SELECT tag, COUNT(*) AS count
      FROM (
        SELECT JSON_UNQUOTE(JSON_EXTRACT(tags, CONCAT('$[', n.n, ']'))) AS tag
        FROM forum_posts
        JOIN (
          SELECT 0 AS n UNION ALL SELECT 1 UNION ALL SELECT 2 UNION ALL SELECT 3 UNION ALL SELECT 4
          UNION ALL SELECT 5 UNION ALL SELECT 6 UNION ALL SELECT 7 UNION ALL SELECT 8 UNION ALL SELECT 9
        ) n ON JSON_LENGTH(tags) > n.n
      ) AS extracted_tags
      GROUP BY tag
      ORDER BY count DESC
      LIMIT 10
    `);

    return Response.json(rows);
  } catch (err) {
    console.error("取得熱門標籤失敗", err);
    return new Response("Server Error", { status: 500 });
  }
}
