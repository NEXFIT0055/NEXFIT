import { NextResponse } from 'next/server';
import db from '@/lib/forum-db';
import jwt from 'jsonwebtoken';

export async function POST(req) {
  const authHeader = req.headers.get('authorization');
  let userId = null;

  if (authHeader && authHeader.startsWith('Bearer ')) {
    try {
      const token = authHeader.split(' ')[1];
      const decoded = jwt.verify(token, process.env.JWT_SECRET);
      userId = decoded.userId;
    } catch (err) {
      return NextResponse.json({ success: false, error: 'JWT 驗證失敗' }, { status: 401 });
    }
  }

  const body = await req.json();
  const { occurrence_id, note } = body;

  if (!userId || !occurrence_id) {
    return NextResponse.json({ success: false, error: '資料不足' }, { status: 400 });
  }

  try {
    const [existing] = await db.query(
      `SELECT id FROM course_reservations WHERE user_id = ? AND occurrence_id = ?`,
      [userId, occurrence_id]
    );
    if (existing.length > 0) {
      return NextResponse.json({
        success: false,
        error: '你已經預約過這堂課了',
      });
    }

    const [occRows] = await db.query(
      `SELECT course_id, reserved_count FROM course_occurrences WHERE id = ?`,
      [occurrence_id]
    );

    if (!occRows.length) {
      return NextResponse.json({ success: false, error: '找不到該課程時段' }, { status: 404 });
    }

    const { course_id, reserved_count } = occRows[0];

    const [courseRows] = await db.query(
      `SELECT max_participants FROM courses WHERE id = ?`,
      [course_id]
    );

    if (!courseRows.length) {
      return NextResponse.json({ success: false, error: '找不到課程資料' }, { status: 404 });
    }

    const { max_participants } = courseRows[0];

    if (reserved_count >= max_participants) {
      return NextResponse.json({
        success: false,
        error: '課程人數已額滿',
      });
    }

    // ✅ 寫入預約，取得插入 ID
    const [insertResult] = await db.query(
      `INSERT INTO course_reservations (user_id, occurrence_id, note) VALUES (?, ?, ?)`,
      [userId, occurrence_id, note]
    );

    const reservationId = insertResult.insertId;

    // ✅ 更新 reserved_count
    await db.query(
      `UPDATE course_occurrences SET reserved_count = reserved_count + 1 WHERE id = ?`,
      [occurrence_id]
    );

    return NextResponse.json({
      success: true,
      reservationId: reservationId,
    });
  } catch (err) {
    console.error('預約寫入失敗:', err);
    return NextResponse.json({ success: false, error: '伺服器錯誤，請稍後再試' }, { status: 500 });
  }
}
