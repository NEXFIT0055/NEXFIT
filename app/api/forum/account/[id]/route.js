import db from "@/lib/forum-db";

export async function GET(req, { params }) {
  const id = Number(params.id); // 將參數轉為數字

  try {
    // 1. 獲取使用者基本資訊
    const [userRows] = await db.execute(
      `SELECT user_id, name, nickname, avatar_url FROM user_profiles WHERE user_id = ?`,
      [id]
    );
    if (userRows.length === 0) {
      return new Response(JSON.stringify({ error: "使用者不存在" }), { status: 404 });
    }
    const user = userRows[0];

    // 2. 獲取使用者的文章資料
    const [posts] = await db.execute(
      `SELECT id, title, avatar, content, images, tags, likes, shares, created_at, views, comments, category 
       FROM forum_posts 
       WHERE user_id = ?
       ORDER BY created_at DESC`,
      [id]
    );

    // 3. 解析 JSON 欄位（images 和 tags）
    const safeParse = (val) => {
      if (!val) return [];
      try {
        return Array.isArray(val) ? val : JSON.parse(val);
      } catch {
        return [];
      }
    };
    posts.forEach((post) => {
      post.images = safeParse(post.images);
      post.tags = safeParse(post.tags);
    });

    // 4. 獲取使用者的統計數據
    const [statsRows] = await db.execute(
      `SELECT 
        (SELECT COUNT(*) FROM forum_posts WHERE user_id = ?) AS post_count,
        (SELECT SUM(likes) FROM forum_posts WHERE user_id = ?) AS like_count,
        (SELECT SUM(views) FROM forum_posts WHERE user_id = ?) AS view_count
      `,
      [id, id, id]
    );

    const stats = statsRows[0] || {
      post_count: 0,
      like_count: 0,
      view_count: 0,
    };

    // 5. 查詢用戶收藏的所有文章
    const [favorites] = await db.execute(
      `SELECT p.* FROM forum_favorites f 
       JOIN forum_posts p ON f.post_id = p.id 
       WHERE f.user_id = ? 
       ORDER BY f.created_at DESC`,
      [id]
    );

    // 解析收藏文章的 JSON 欄位
    favorites.forEach((post) => {
      post.images = safeParse(post.images);
      post.tags = safeParse(post.tags);
    });

    // 6. 返回使用者資訊、文章資料、統計數據和收藏
    return new Response(
      JSON.stringify({
        user,
        posts,
        stats,
        favorites,
      }),
      { 
        status: 200,
        headers: { 'Content-Type': 'application/json' }
      }
    );
  } catch (error) {
    console.error("獲取使用者資料失敗:", error);
    return new Response(
      JSON.stringify({ error: "伺服器錯誤", detail: error.message }),
      { 
        status: 500,
        headers: { 'Content-Type': 'application/json' }
      }
    );
  }
}

export async function POST(req, { params }) {
  const id = Number(params.id);

  try {
    const body = await req.json();
    const { title } = body;

    if (!title || typeof title !== "string") {
      return new Response(JSON.stringify({ error: "稱謂無效" }), {
        status: 400,
        headers: { 'Content-Type': 'application/json' }
      });
    }

    // 更新使用者的稱謂
    const [result] = await db.execute(
      `UPDATE user_profiles SET title = ? WHERE user_id = ?`,
      [title, id]
    );

    if (result.affectedRows === 0) {
      return new Response(JSON.stringify({ error: "更新失敗，使用者不存在" }), {
        status: 404,
        headers: { 'Content-Type': 'application/json' }
      });
    }

    return new Response(JSON.stringify({ message: "稱謂更新成功" }), {
      status: 200,
      headers: { 'Content-Type': 'application/json' }
    });
  } catch (error) {
    console.error("更新稱謂失敗:", error);
    return new Response(JSON.stringify({ error: "伺服器錯誤" }), {
      status: 500,
      headers: { 'Content-Type': 'application/json' }
    });
  }
}
