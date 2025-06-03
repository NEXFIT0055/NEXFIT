'use client'

import { useRouter } from 'next/navigation'
import { Dialog, DialogContent } from './dialog'
import { CalendarDays } from 'lucide-react'
import { Button } from './button'
import { cn } from '@/lib/utils'
import { toast } from 'sonner'
import CssLoader from '@/app/(main)/shop/cart/_components/css-loader'

export default function ReservationModal({
  visible,
  onClose,
  occurrences,
  reservedIds = [],
  reservedTimeList = [],
  loading = false,
}) {
  const router = useRouter()

  const toMinutes = (timeStr) => {
    const [hh, mm] = timeStr.split(':').map(Number)
    return hh * 60 + mm
  }

  const normalizeDate = (dateStr) => dateStr

  const checkTimeConflict = (target) => {
    const targetDate = normalizeDate(target.date)
    const targetStart = toMinutes(target.start_time)
    const targetEnd = toMinutes(target.end_time)

    return reservedTimeList.some(r => {
      const reservedDate = normalizeDate(r.date)
      if (reservedDate !== targetDate) return false

      const reservedStart = toMinutes(r.start_time)
      const reservedEnd = toMinutes(r.end_time)

      return Math.max(reservedStart, targetStart) < Math.min(reservedEnd, targetEnd)
    })
  }

  const handleReserveRedirect = (occurrenceId) => {
    router.push(`/reservation/info/${occurrenceId}`)
  }

  const formatDateWithWeekday = (dateStr) => {
    const date = new Date(dateStr);
    const weekdays = ['日', '一', '二', '三', '四', '五', '六'];
    const weekday = weekdays[date.getDay()];
    return `${dateStr}（${weekday}）`;
  }

  // ✅ 判斷是否已過去（以 end_time 判斷）
  const isPast = (item) => {
    const endDateTimeStr = `${item.date}T${item.end_time}`;
    return new Date(endDateTimeStr) < new Date();
  }

  return (
    <Dialog open={visible} onOpenChange={onClose}>
      <DialogContent className="p-6 space-y-4 max-h-[80vh] overflow-y-auto">
        <h2 className="text-xl font-semibold flex items-center gap-2">
          <CalendarDays className="w-5 h-5" />
          選擇預約日期
        </h2>
        {loading ? (
          <div className="w-full flex justify-center items-center py-10">
            <CssLoader />
          </div>
        ) : occurrences.length > 0 ? (
          <div className="space-y-2">
            {occurrences
              .filter(item => !isPast(item)) // ✅ 過濾已過期的時段
              .map((item) => {
                const reserved = reservedIds.includes(item.id)
                const conflict = checkTimeConflict(item)
                const isFull = item.reserved_count >= item.max_participants

                return (
                  <div
                    key={item.id}
                    className="flex justify-between items-center border p-3 rounded-md"
                  >
                    <div>
                      <p className="font-medium">{formatDateWithWeekday(item.date)}</p>
                      <p className="text-base text-gray-500">
                        {item.start_time} - {item.end_time}
                      </p>
                    </div>
                    <div className="flex justify-center w-[76px]">
                      {isFull ? (
                        <span className="text-gray-500 font-semibold">已額滿</span>
                      ) : (
                        <Button
                          variant={conflict ? 'outline' : 'primary'}
                          className={cn(
                            reserved && 'bg-gray-400 text-white !cursor-pointer',
                            conflict && 'text-gray-500 border-gray-400 !cursor-pointer'
                          )}
                          onClick={() => {
                            if (reserved) {
                              toast.error("你已經預約過這個時段囉！")
                            } else if (conflict) {
                              toast.warning("你在這個時段已預約了其他課程！")
                            } else {
                              handleReserveRedirect(item.id)
                            }
                          }}
                        >
                          {reserved ? "已預約" : "預約"}
                        </Button>
                      )}
                    </div>
                  </div>
                )
              })}
          </div>
        ) : (
          <p className="text-gray-500">目前無可預約的課程時段</p>
        )}
      </DialogContent>
    </Dialog>
  )
}
