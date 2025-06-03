import { NextResponse } from 'next/server'
import db from '@/lib/forum-db'
import jwt from 'jsonwebtoken'

export const dynamic = 'force-dynamic'

export async function GET(request) {
  const authHeader = request.headers.get('authorization')
  let userId = null

  if (authHeader?.startsWith('Bearer ')) {
    try {
      const token = authHeader.split(' ')[1]
      const decoded = jwt.verify(token, process.env.JWT_SECRET)
      userId = decoded.userId
    } catch (e) {
      return NextResponse.json({ success: false, error: '無效的 JWT' }, { status: 401 })
    }
  } else {
    return NextResponse.json({ success: false, error: '未授權' }, { status: 401 })
  }

  try {
    const [rows] = await db.execute(`
      SELECT 
        r.id AS reservationId,                                    -- ✅ 回傳 reservation id
        c.name AS courseName,
        coach.name AS teacherName,
        CONCAT(o.occurrence_date, ' ', o.start_time, ' - ', o.end_time) AS time
      FROM course_reservations r
      JOIN course_occurrences o ON r.occurrence_id = o.id
      JOIN courses c ON o.course_id = c.id
      JOIN coach ON c.coach_id = coach.id
      WHERE r.user_id = ?
      ORDER BY o.occurrence_date, o.start_time
    `, [userId])

    return NextResponse.json({ success: true, data: rows })
  } catch (err) {
    console.error('查詢失敗', err)
    return NextResponse.json({ success: false, error: '伺服器錯誤' }, { status: 500 })
  }
}
