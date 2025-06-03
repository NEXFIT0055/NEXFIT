import { NextResponse } from "next/server";
import db from "@/lib/forum-db";

// 更新購物車商品數量 (PUT)
export async function PUT(request, { params }) {
  try {
    const { cartItemId } = params;
    const { quantity } = await request.json();

    if (!quantity || quantity <= 0) {
      return NextResponse.json({ message: "數量必須大於 0" }, { status: 400 });
    }

    await db.execute(`UPDATE cart_items SET quantity = ? WHERE id = ?`, [
      quantity,
      cartItemId,
    ]);

    return NextResponse.json({ success: true, quantity });
  } catch (error) {
    console.error("更新購物車商品數量失敗:", error);
    return NextResponse.json({ message: "更新失敗" }, { status: 500 });
  }
}

// 刪除購物車單一商品 (DELETE)
export async function DELETE(request, { params }) {
  try {
    const { cartItemId } = params;

    await db.execute(`DELETE FROM cart_items WHERE id = ?`, [cartItemId]);

    return NextResponse.json({ success: true });
  } catch (error) {
    console.error("刪除購物車商品失敗:", error);
    return NextResponse.json({ message: "刪除失敗" }, { status: 500 });
  }
}
