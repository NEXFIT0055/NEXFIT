import { NextResponse } from "next/server";
import db from "@/lib/forum-db";

export async function GET(request, { params }) {
  const resolvedParams = await params;
  const productId = parseInt(resolvedParams.productId, 10);
  if (!productId) {
    return NextResponse.json({
      success: false,
      error: "查無該項商品編號",
      data: {},
    });
  }

  const sql = `SELECT * FROM products WHERE id=${productId}`;
  const [rows] = await db.query(sql);

  if (rows.length) {
    return NextResponse.json({
      success: true,
      data: rows[0],
    });
  } else {
    return NextResponse.json({
      success: false,
      error: "沒有該項商品資料",
      data: {},
    });
  }
}
