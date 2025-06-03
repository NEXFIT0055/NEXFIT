// 改寫成交易寫法

import { NextResponse } from "next/server";
import { v4 as uuidv4 } from "uuid";
import db from "@/lib/forum-db";
import { verifyToken } from "@/lib/auth"; // 你自己的驗證函式

function generateOrderNumber() {
  const now = new Date();
  const timestamp = `${now.getFullYear().toString().slice(-2)}${String(
    now.getMonth() + 1
  ).padStart(2, "0")}${String(now.getDate()).padStart(2, "0")}`;
  const randomPart = uuidv4().slice(0, 6);
  return `NF-${timestamp}${randomPart.toUpperCase()}`;
}

async function getUserIdFromRequest(request) {
  const authHeader = request.headers.get("Authorization");
  if (!authHeader) throw new Error("未授權訪問");

  const token = authHeader.split(" ")[1];
  if (!token) throw new Error("Token 不存在");

  const decoded = verifyToken(token);
  if (!decoded || !decoded.userId) throw new Error("無效的 Token");

  return decoded.userId;
}

export async function POST(request) {
  let connection;

  const user_id = await getUserIdFromRequest(request);

  try {
    const {
      // user_id,
      recipient_name,
      recipient_phone,
      shipping_method,
      shipping_status,
      shipping_address,
      store_id,
      store_name,
      store_address,
      payment_method,
      payment_status,
      discount,
      discount_id,
      total,
      shipping_fee,
      final_total,
      items,
    } = await request.json();

    if (!user_id) {
      return NextResponse.json({ message: "缺少 user_id" }, { status: 400 });
    }

    if (!recipient_name || !recipient_phone || !items) {
      return NextResponse.json(
        { message: "缺少必要的訂單資訊" },
        { status: 400 }
      );
    }

    if (isNaN(total)) {
      return NextResponse.json({ message: "價格格式錯誤" }, { status: 400 });
    }

    const order_number = generateOrderNumber();

    // 取得連線 (確保是 promise 版本)
    connection = await db.getConnection();

    // 開啟交易
    await connection.beginTransaction();

    // 建立訂單
    const [orderResult] = await connection.execute(
      `INSERT INTO orders (user_id, order_number, recipient_name, recipient_phone, total, discount, shipping_fee, final_total, payment_id, shipping_id) 
       VALUES (?, ?, ?, ?, ?, ?, ?, ?, NULL, NULL)`,
      [
        user_id,
        order_number,
        recipient_name,
        recipient_phone,
        total,
        discount,
        shipping_fee,
        final_total,
      ]
    );
    const orderId = orderResult.insertId;

    // 建立訂單商品
    const orderItems = items.map((item) => [
      orderId,
      item.product_id,
      parseInt(item.price),
      item.quantity,
      parseInt(item.price) * item.quantity,
    ]);

    await connection.query(
      `INSERT INTO order_items (order_id, product_id, unit_price, quantity, subtotal) VALUES ?`,
      [orderItems]
    );

    // 插入付款資料
    const [paymentResult] = await connection.execute(
      `INSERT INTO payments (order_id, method, status, amount) 
       VALUES (?, ?, ?, ?)`,
      [orderId, payment_method, payment_status, final_total]
    );
    const paymentId = paymentResult.insertId;

    // 插入物流資料
    const [shippingResult] = await connection.execute(
      `INSERT INTO shippings (order_id, method, status, address, store_id, store_name, store_address) 
       VALUES (?, ?, ?, ?, ?, ?, ?)`,
      [
        orderId,
        shipping_method,
        shipping_status,
        shipping_address,
        store_id,
        store_name,
        store_address,
      ]
    );
    const shippingId = shippingResult.insertId;

    // 更新訂單中的付款和物流ID
    await connection.execute(
      `UPDATE orders SET payment_id = ?, shipping_id = ? WHERE id = ?`,
      [paymentId, shippingId, orderId]
    );

    // 如果有優惠券，更新優惠券狀態
    if (discount_id) {
      await connection.execute(
        `UPDATE user_discounts SET is_used = 1 WHERE user_id = ? AND discount_id = ?`,
        [user_id, discount_id]
      );
    }

    // 刪除購物車中已結帳商品
    try {
      // 1. 先取得使用者的購物車 ID
      const [[cart]] = await connection.execute(
        `SELECT id FROM carts WHERE user_id = ?`,
        [user_id]
      );

      if (cart) {
        const cartId = cart.id;
        const productIds = items.map((item) => item.product_id);

        // 2. 使用購物車 ID 刪除商品 (修改 IN 子句的使用方式)
        const placeholders = productIds.map(() => "?").join(",");
        const [deleteResult] = await connection.execute(
          `DELETE FROM cart_items WHERE cart_id = ? AND product_id IN (${placeholders})`,
          [cartId, ...productIds]
        );

        console.log("購物車ID:", cartId);
        console.log("要刪除的商品IDs:", productIds);
        console.log("刪除購物車商品結果:", deleteResult);

        if (deleteResult.affectedRows === 0) {
          console.log("沒有符合條件的商品被刪除");
        } else {
          console.log(`成功刪除 ${deleteResult.affectedRows} 個購物車商品`);
        }
      } else {
        console.log("找不到使用者購物車:", user_id);
      }
    } catch (error) {
      console.error("刪除購物車商品時發生錯誤:", error);
      throw error;
    }

    // 提交交易
    await connection.commit();

    const paymentUrl =
      payment_method === "ecpay"
        ? `http://localhost:3000/api/ecpay?amount=${final_total}`
        : "http://localhost:3000/shop/checkout/success";

    return NextResponse.json({
      success: true,
      message: "訂單建立成功",
      order_number,
      paymentUrl,
    });
  } catch (error) {
    if (connection) {
      await connection.rollback(); // 發生錯誤，回滾
    }
    console.error("建立訂單失敗：", error.message);
    return NextResponse.json(
      { message: `訂單建立失敗: ${error.message}` },
      { status: 500 }
    );
  } finally {
    if (connection) {
      connection.release(); // 釋放連線回池
    }
  }
}
