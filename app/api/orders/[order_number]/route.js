// *** 查詢單筆訂單詳情 (GET)
import { NextResponse } from "next/server";
import db from "@/lib/forum-db";

export async function GET(request, { params }) {
  try {
    const { order_number } = params;

    const [order] = await db.execute(
      `SELECT o.*, 
              p.method AS payment_method, p.status AS payment_status, 
              s.method AS shipping_method, s.status AS shipping_status, 
              COALESCE(s.address, '') AS shipping_address, 
              COALESCE(s.store_name, '') AS store_name, 
              COALESCE(s.store_address, '') AS store_address 
       FROM orders o
       LEFT JOIN payments p ON o.payment_id = p.id
       LEFT JOIN shippings s ON o.shipping_id = s.id
       WHERE o.order_number = ?`,
      [order_number]
    );

    // SELECT id FROM `orders` WHERE order_number = 'NF-2505154C5C8D'; 查詢到的ID
    const [items] = await db.execute(
      `SELECT oi.*, p.name, p.price, p.image_url
       FROM order_items AS oi
       JOIN products AS p ON oi.product_id = p.id
       JOIN orders AS o ON oi.order_id = o.id
       WHERE o.order_number = ?;`,
      [order_number]
    );

    if (order.length === 0) {
      return NextResponse.json({ message: "訂單不存在" }, { status: 404 });
    }

    return NextResponse.json({ order: order[0], items });
  } catch (error) {
    console.error("查詢單筆訂單詳情失敗：", error.message);
    return NextResponse.json({ message: "查詢失敗" }, { status: 500 });
  }
}
