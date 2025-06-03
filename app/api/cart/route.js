import { NextResponse } from "next/server";
import db from "@/lib/forum-db";
import { verifyToken } from "@/lib/auth";

async function getUserIdFromRequest(request) {
  const authHeader = request.headers.get("Authorization");
  const token = authHeader?.split(" ")[1];
  if (!token) {
    const error = new Error("未授權：缺少 token");
    error.code = 401;
    throw error;
  }

  let decoded;
  try {
    decoded = verifyToken(token);
  } catch {
    const error = new Error("未授權：Token 無效");
    error.code = 401;
    throw error;
  }

  if (!decoded?.userId) {
    const error = new Error("未授權：Token 無使用者資訊");
    error.code = 401;
    throw error;
  }

  return decoded.userId;
}

export async function GET(request) {
  try {
    const userId = await getUserIdFromRequest(request);

    const [[cart]] = await db.execute(`SELECT * FROM carts WHERE user_id = ?`, [
      userId,
    ]);

    if (!cart) {
      return NextResponse.json({ items: [], totalAmount: 0 });
    }

    const [items] = await db.execute(
      `
      SELECT ci.id AS cartItemId, ci.product_id, ci.quantity,
             p.name, p.price, p.image_url
      FROM cart_items ci
      JOIN products p ON ci.product_id = p.id
      WHERE ci.cart_id = ?
    `,
      [cart.id]
    );

    const totalAmount = items.reduce(
      (acc, item) => acc + item.price * item.quantity,
      0
    );

    return NextResponse.json({ cart_id: cart.id, items, totalAmount });
  } catch (error) {
    console.error("查詢購物車失敗:", error);
    const statusCode = error.code || 500;
    return NextResponse.json(
      { message: error.message || "查詢購物車失敗" },
      { status: statusCode }
    );
  }
}

export async function POST(request) {
  try {
    const userId = await getUserIdFromRequest(request);

    const { product_id, quantity } = await request.json();

    if (!product_id || !quantity || quantity <= 0) {
      return NextResponse.json(
        { message: "商品 ID 或數量不正確" },
        { status: 400 }
      );
    }

    const [[cart]] = await db.execute(`SELECT * FROM carts WHERE user_id = ?`, [
      userId,
    ]);

    let cartId = cart?.id;

    if (!cartId) {
      const [result] = await db.execute(
        `INSERT INTO carts (user_id) VALUES (?)`,
        [userId]
      );
      cartId = result.insertId;
    }

    const [[exist]] = await db.execute(
      `SELECT * FROM cart_items WHERE cart_id = ? AND product_id = ?`,
      [cartId, product_id]
    );

    if (exist) {
      await db.execute(
        `UPDATE cart_items SET quantity = quantity + ? WHERE id = ?`,
        [quantity, exist.id]
      );
    } else {
      await db.execute(
        `INSERT INTO cart_items (cart_id, product_id, quantity) VALUES (?, ?, ?)`,
        [cartId, product_id, quantity]
      );
    }

    return NextResponse.json({ success: true });
  } catch (error) {
    console.error("新增商品到購物車失敗:", error);
    const statusCode = error.message.includes("未授權") ? 401 : 500;
    return NextResponse.json(
      { message: error.message || "新增商品失敗" },
      { status: statusCode }
    );
  }
}

export async function DELETE(request) {
  try {
    const userId = await getUserIdFromRequest(request);

    const [[cart]] = await db.execute(`SELECT * FROM carts WHERE user_id = ?`, [
      userId,
    ]);

    if (cart) {
      await db.execute(`DELETE FROM cart_items WHERE cart_id = ?`, [cart.id]);
    }

    return NextResponse.json({ success: true });
  } catch (error) {
    console.error("清空購物車失敗:", error);
    const statusCode = error.message.includes("未授權") ? 401 : 500;
    return NextResponse.json(
      { message: error.message || "清空失敗" },
      { status: statusCode }
    );
  }
}
