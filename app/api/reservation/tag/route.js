import { NextResponse } from "next/server";
import db from "@/lib/forum-db";

export async function GET() {
  try {
    const [tags] = await db.query(`SELECT id, name FROM course_tags ORDER BY name ASC`);
    return NextResponse.json(tags);
  } catch (error) {
    return NextResponse.json({ error: "資料庫錯誤" }, { status: 500 });
  }
}
