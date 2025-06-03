'use client'

import { useParams, useRouter } from 'next/navigation'
import React, { useEffect, useState } from 'react'
import styles from '../../_components/ui/success.module.css'
import { Button } from '../../_components/ui/button'
import { Card, CardContent } from '../../_components/ui/card'
import { CalendarCheck, MapPin } from 'lucide-react'
import Link from 'next/link'
import { toast } from 'sonner'
import BgLeft from '@/public/images/reserve_success/bg-left.svg'
import BgRight from '@/public/images/reserve_success/bg-right.svg'
import BgDown from '@/public/images/reserve_success/bg-down.svg'
import Gear from '@/public/images/reserve_success/gear.svg'
import CssLoader from '@/app/(main)/shop/cart/_components/css-loader'

function formatDate(dateStr) {
  const date = new Date(dateStr); // 自動轉為本地時間
  const weekdays = ['日', '一', '二', '三', '四', '五', '六'];
  const yyyy = date.getFullYear();
  const mm = String(date.getMonth() + 1).padStart(2, '0');
  const dd = String(date.getDate()).padStart(2, '0');
  const weekday = weekdays[date.getDay()];
  return `${yyyy}-${mm}-${dd}（${weekday}）`;
}


export default function Success() {
  const { reservationId } = useParams()
  const router = useRouter()
  const [data, setData] = useState(null)

  useEffect(() => {
    async function fetchReservation() {
      try {
        const res = await fetch(`/api/reservation/success/${reservationId}`)
        const json = await res.json()
        if (json.success) {
          setData(json.data)
        } else {
          toast.error('資料取得失敗：' + json.error)
        }
      } catch (err) {
        toast.error('API 請求失敗')
        console.error(err)
      }
    }

    if (reservationId) fetchReservation()
  }, [reservationId])

  if (!data) {
    return <div className="flex justify-center items-center h-[300px]">
      <CssLoader />
    </div>
  }

  const {
    course_name,
    note,
    date,
    start_time,
    end_time,
    coach,
  } = data

  return (
    <div className="relative flex justify-center items-center min-h-screen bg-[#f2f2f2] p-6 overflow-hidden">
      {/* 背景動畫圖層 */}
      <Gear className={`w-[200px] h-auto absolute top-[20px] left-[230px] z-2 ${styles.slowRotate}`} />
      <BgLeft className={`w-[450px] h-auto absolute top-[70px] left-[130px] ${styles.bounceSlow}`} />
      <BgRight className={`w-[400px] h-auto  absolute top-[50px] right-[60px] ${styles.bounceSlow}`} />
      <BgDown className={`absolute bottom-[100px] right-[120px] w-[450px]  z-11 ${styles.slideInUp}`} />

      {/* 主卡片 */}
      <Card className="w-5/6 max-w-4xl rounded-xl shadow-xl p-8 bg-white relative z-10">
        <h2 className="text-2xl font-bold mb-6 text-center text-[#475569]">預約成功</h2>

        <div className="grid grid-cols-1 md:grid-cols-2 gap-8 items-start pl-5">
          {/* 左側：課程資訊 */}
          <div className="space-y-6">
            <div>
              <p className="text-gray-600 font-medium mb-1">課程名稱：</p>
              <p className="text-lg font-semibold pl-15">{course_name}</p>
            </div>
            <div>
              <p className="text-gray-600 font-medium mb-1">指導教練：</p>
              <p className="text-lg font-semibold pl-18">{coach?.name || '（無資料）'}</p>
            </div>
            <div>
              <p className="text-gray-600 font-medium mb-1">您的備註：</p>
              <p className="text-gray-800 pl-15">{note || '（無備註）'}</p>
            </div>
          </div>

          {/* 右側：時間與地點 */}
          <div className="space-y-12">
            <div className="flex items-end gap-3 mt-2">
              <CalendarCheck className="text-gray-600 mt-1" />
              <p className="text-gray-700">
                {formatDate(date)}（{start_time} - {end_time}）
              </p>
            </div>
            <div className="flex items-start gap-3">
              <MapPin className="text-gray-600 mt-1" />
              <div>
                <p className="text-gray-700">{coach?.location || ''}</p>
                <p className="text-sm text-gray-500">{coach?.studio || ''}</p>
              </div>
            </div>
          </div>
        </div>

        {/* 下方按鈕 */}
        <div className="flex justify-center gap-4 mt-10">
          <Link href={`/reservation/course`}>
            <Button variant="outline" className="h-[45px] w-[110px] text-base">
              返回課程列表
            </Button>
          </Link>
          <Link href="/accountCenter/member/course">
            <Button variant="primary" className="h-[45px] w-[110px] text-base font-semibold">
              查看所有預約
            </Button>
          </Link>
        </div>
      </Card>
    </div>
  )
}
