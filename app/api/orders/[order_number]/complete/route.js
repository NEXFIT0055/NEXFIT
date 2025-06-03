// app/api/orders/[order_number]/complete/route.js

import { NextResponse } from "next/server";
import db from "@/lib/forum-db";

export async function POST(req, { params }) {
  const orderNumber = params.order_number;

  try {
    // 查詢訂單的 shipping_id
    const [orderRows] = await db.query(
      "SELECT shipping_id FROM orders WHERE order_number = ?",
      [orderNumber]
    );

    if (orderRows.length === 0) {
      return NextResponse.json({ error: "查無訂單" }, { status: 404 });
    }

    const shippingId = orderRows[0].shipping_id;
    if (!shippingId) {
      return NextResponse.json(
        { error: "尚未建立 shipping 記錄" },
        { status: 400 }
      );
    }

    // 更新 shippings 表的狀態為已完成
    await db.query("UPDATE shippings SET status = ? WHERE id = ?", [
      "已完成",
      shippingId,
    ]);

    return NextResponse.json({
      success: true,
      message: `訂單 ${orderNumber} 狀態已標記為已完成`,
    });
  } catch (err) {
    console.error("❌ 更新錯誤：", err);
    return NextResponse.json({ error: "伺服器錯誤" }, { status: 500 });
  }
}
