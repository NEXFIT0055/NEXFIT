import db from "@/lib/forum-db";

export async function POST(req) {
  try {
    const { email, subscribe } = await req.json();

    // 驗證 email 是否有效
    if (!email || typeof email !== "string") {
      return new Response(JSON.stringify({ error: "Invalid email" }), {
        status: 400,
      });
    }

    // 將訂閱資料存入 forum_subscriptions 資料表
    const query = `
      INSERT INTO forum_subscriptions (email, subscribed_at, is_subscribed)
      VALUES (?, NOW(), ?)
      ON DUPLICATE KEY UPDATE
      is_subscribed = VALUES(is_subscribed), subscribed_at = NOW()
    `;
    const values = [email, subscribe];

    await db.query(query, values);

    return new Response(
      JSON.stringify({ message: "Subscription successful" }),
      { status: 200 }
    );
  } catch (error) {
    console.error("Subscription error:", error);
    return new Response(JSON.stringify({ error: "Failed to subscribe" }), {
      status: 500,
    });
  }
}
