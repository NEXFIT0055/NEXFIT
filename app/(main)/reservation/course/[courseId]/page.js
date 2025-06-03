'use client'

import React, { useEffect, useState } from 'react'
import { useParams } from 'next/navigation'
import Link from 'next/link'
import Image from "next/image"
import { Avatar, AvatarFallback, AvatarImage } from '../../_components/ui/avatar'
import ReservationModal from '../../_components/ui/reservationModal'
import { Button } from '../../_components/ui/button'
import { Badge } from '../../_components/ui/badge'
import { Card, CardContent } from '../../_components/ui/card'
import { toast } from 'sonner'
import CssLoader from "@/app/(main)/shop/cart/_components/css-loader";
import {
  Calendar,
  Clock,
  Heart,
  MapPin,
  Tag,
  MessageSquareMore,
} from 'lucide-react'

export default function CourseDetail() {
  const { courseId } = useParams()
  const [data, setData] = useState(null)
  const [loading, setLoading] = useState(true)
  const [showModal, setShowModal] = useState(false)
  const [isLoggedIn, setIsLoggedIn] = useState(false)
  const [token, setToken] = useState(null)
  const [userReservations, setUserReservations] = useState([])
  const [isLiked, setIsLiked] = useState(false)

  useEffect(() => {
    const storedToken = localStorage.getItem("token")
    setIsLoggedIn(!!storedToken && storedToken.trim() !== "")
    setToken(storedToken)
  }, [])

  useEffect(() => {
    async function fetchUserReservations() {
      if (!token) return
      const res = await fetch("/api/reservation/user/profile", {
        headers: { Authorization: `Bearer ${token}` },
      })
      if (res.ok) {
        const result = await res.json()
        setUserReservations(result.data?.reservations || [])
      }
    }
    fetchUserReservations()
  }, [token])

  useEffect(() => {
    async function fetchData() {
      try {
        const headers = token ? { Authorization: `Bearer ${token}` } : {}
        const res = await fetch(`/api/reservation/course/${courseId}`, { headers })
        const result = await res.json()
        if (result.success) {
          setData(result.data)
          setIsLiked(result.data.isLiked || false)
        }
      } catch (error) {
        console.error("Fetch course detail failed:", error)
      } finally {
        setLoading(false)
      }
    }
    if (courseId) fetchData()
  }, [courseId, token])

  const handleReserveClick = () => {
    if (!isLoggedIn) {
      toast.warning("請先登入會員才能使用預約功能")
    } else {
      setShowModal(true)
    }
  }

  const handleLikeToggle = async () => {
    if (!isLoggedIn) {
      toast.warning("請先登入會員才能加入最愛")
      return
    }

    const method = isLiked ? "DELETE" : "POST"
    try {
      const res = await fetch(`/api/reservation/like/${courseId}`, {
        method,
        headers: {
          "Content-Type": "application/json",
          Authorization: `Bearer ${token}`,
        },
      })

      if (res.ok) {
        setIsLiked(prev => !prev)
        toast.success(isLiked ? "已移除最愛" : "已加入最愛")
      } else {
        toast.error("操作失敗")
      }
    } catch (err) {
      toast.error("發生錯誤，請稍後再試")
    }
  }

  if (loading) return (
    <div className="flex justify-center items-center h-[300px]">
      <CssLoader />
    </div>
  );
  if (!data) return <p className="p-10 text-center">查無課程資料</p>

  const reservedIds = (data?.reservedIds || []).map(Number)
  const reservedTimeList = userReservations.map(r => ({
    date: r.date,
    start_time: r.start_time,
    end_time: r.end_time,
  }))

  const {
    name: title,
    description,
    coach,
    tags,
    schedules,
    image,
    actualDate = [],
  } = data

  const weekdayMap = ["週日", "週一", "週二", "週三", "週四", "週五", "週六"]
  const formatWeekdayTime = (weekday, start, end) => {
    const startTime = new Date(`2000-01-01T${start}`).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })
    const endTime = new Date(`2000-01-01T${end}`).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })
    return `${weekdayMap[weekday]} ${startTime} - ${endTime}`
  }
  const startTimeList = schedules.length > 0
    ? schedules.map(sch => formatWeekdayTime(sch.weekday, sch.start_time, sch.end_time))
    : ["尚未排課"]

  return (
    <>
      <div className="relative w-full h-[300px] sm:h-[400px] md:h-[500px] lg:hidden">
        <div className='w-full h-full absolute inset-0 overflow-hidden'>
          <Image
            src={image}
            alt="background"
            fill
            className="w-full h-full object-cover brightness-50 blur-[2px]"
            priority
          />
        </div>
        <div className='absolute inset-x-0 bottom-[-40px] max-h-[300px] sm:max-h-[400px] md:bottom-[-30px] md:max-h-[500px] flex justify-center z-10 mt-8 px-4'>
          <Image
            src={image}
            alt="course"
            className="w-full h-auto rounded-lg object-cover object-center"
            width={1080}
            height={540}
          />
        </div>
      </div>

      <section className="relative w-4/5 mx-auto py-10 px-4 md:px-8 lg:px-0">
        <div className="relative w-full h-[500px] overflow-hidden hidden lg:block">
          <Image
            src={image}
            alt="course"
            fill
            className="rounded-t-[80px] object-cover object-[50%_60%]"
          />
        </div>

        <div className="w-full max-w-7xl mt-8 flex flex-col lg:flex-row gap-10">
          <div className="w-full lg:w-2/3 flex flex-col">
            <div className='flex items-end gap-6 mb-3'>
              <h1 className="text-2xl lg:text-3xl font-bold">{title}</h1>
            </div>

            <Card className="w-full rounded-[30px] shadow-md">
              <CardContent className="p-6 space-y-6">
                <div className="flex items-center gap-4 lg:hidden">
                  <Avatar className="w-15 h-15 border-4 border-white shadow-sm">
                    <AvatarImage src={coach?.image || ""} alt={coach?.name || "教練"} />
                    <AvatarFallback className="bg-[#4791ac] text-white text-lg">
                      {coach?.name?.charAt(0)}
                    </AvatarFallback>
                  </Avatar>
                  <div className="space-y-1">
                    <p className="text-base lg:text-lg font-medium">{coach?.name}</p>
                  </div>
                </div>
                <div className="flex items-center gap-4">
                  <Calendar className="w-8 h-8 text-gray-700" />
                  <div>
                    {startTimeList.map((text, index) => (
                      <p key={index} className="text-base lg:text-lg lg:text-lg/7 font-medium">{text}</p>
                    ))}
                  </div>
                </div>

                <div className="flex items-start gap-4">
                  <MapPin className="w-8 h-8 text-gray-700" />
                  <div className="space-y-1">
                    <p className="text-base lg:text-lg font-medium">{coach?.location}</p>
                    <p className="text-xs lg:text-sm font-medium text-[#b9b9b9]">{coach?.classroom_name}</p>
                  </div>
                </div>

                <div className="flex items-start gap-4">
                  <Tag className="w-8 h-8 text-gray-700" />
                  <div className="flex flex-wrap gap-2">
                    {tags.map((tag, index) => (
                      <Badge key={index} variant="outline" className="!text-base !lg:text-lg font-medium bg-transparent border-none px-0">
                        #{tag}
                      </Badge>
                    ))}
                  </div>
                </div>
              </CardContent>
            </Card>

            <div className="mt-16 mb-10">
              <h2 className="text-xl lg:text-2xl font-bold text-black mb-6">課程簡介</h2>
              <div className="space-y-8 text-center">
                <h3 className="text-lg lg:text-xl font-medium text-black">{title}</h3>
                <p className="text-base font-normal whitespace-pre-line">{description}</p>
              </div>
            </div>

            <div className="mb-10">
              <h2 className="text-lg lg:text-xl font-bold text-black mb-4">教室地圖</h2>
              <div className="w-full h-[400px] rounded-lg overflow-hidden shadow-md">
                <iframe
                  width="100%"
                  height="100%"
                  style={{ border: 0 }}
                  loading="lazy"
                  allowFullScreen
                  referrerPolicy="no-referrer-when-downgrade"
                  src={`https://www.google.com/maps?q=${encodeURIComponent(coach?.location || '')}&output=embed`}
                ></iframe>
              </div>
              <p className="text-center text-sm mt-2 text-gray-500">
                {coach?.location} {coach?.classroom_name}
              </p>
            </div>

          </div>



          <div className="w-full lg:w-1/3 self-start sticky top-20 pt-11 pb-20">
            {/* flex flex-col justify-start pt-11 */}
            <div className="hidden lg:block">
              <Card className="rounded-[30px] shadow-md">
                <CardContent className="p-5 flex flex-col items-center gap-3">
                  <div className="flex items-center gap-5 mb-4 pr-6">
                    <Link href={`/reservation/coach/${coach?.id || ''}`}>
                      <Avatar className="w-18 h-18 border-4 border-white shadow-sm">
                        <AvatarImage src={coach?.image || ""} alt={coach?.name || "教練"} className='object-cover object-[center_top]' />
                        <AvatarFallback className="bg-[#4791ac] text-white text-2xl">
                          {coach?.name?.charAt(0)}
                        </AvatarFallback>
                      </Avatar>
                    </Link>
                    <Link href={`/reservation/coach/${coach?.id || ''}`}>
                      <h2 className="text-[26px] font-medium">{coach?.name}</h2>
                    </Link>
                  </div>

                  <Button
                    variant="primary"
                    className={`w-2/3 mx-auto h-[50px] !text-xl ${!isLoggedIn ? 'opacity-50 cursor-not-allowed' : ''}`}
                    onClick={handleReserveClick}
                  >
                    立即預約
                  </Button>

                  <div className="flex items-center justify-center gap-8 w-full cursor-pointer">
                    <div title={isLiked ? "移除最愛" : "加入最愛"}>
                      <Button
                        variant="ghost"
                        className="w-12 h-12 p-0 rounded-full"
                        onClick={handleLikeToggle}
                      >
                        <Heart
                          className="!w-5 !h-5 cursor-pointer"
                          fill={isLiked ? "#AFC16D" : "none"}
                          stroke={isLiked ? "#AFC16D" : "currentColor"}
                        />
                      </Button>
                    </div>


                    <div className='w-[1px] h-5 bg-black' />
                    <a href={`mailto:${coach?.email || ''}`} className="w-12 h-12 cursor-pointer" title="聯絡教練">
                      <Button variant="ghost" className="w-12 h-12 p-0 rounded-full">
                        <MessageSquareMore className="!w-5 !h-5 text-gray-600" />
                      </Button>
                    </a>
                  </div>
                </CardContent>
              </Card>
            </div>
          </div>
        </div>
      </section >

      <div className="flex h-[80px] fixed bottom-0 w-full lg:hidden">
        <a href={`mailto:${coach?.email || ''}`} className="block w-1/4 h-full">
          <Button variant="outline" className="group w-full h-full !text-xl rounded-none">
            <div className="flex flex-col items-center justify-center gap-1 w-full h-full">
              <MessageSquareMore className="!w-7 !h-7 stroke-gray-600 group-hover:stroke-white" />
              <span className="text-xs group-hover:text-white">聯絡教練</span>
            </div>
          </Button>
        </a>

        <Button
          variant="outline"
          className="group w-1/4 h-full !text-xl rounded-none"
          onClick={handleLikeToggle}
        >
          <div className="flex flex-col items-center justify-center gap-1 w-full h-full">
            <Heart
              className="!w-7 !h-7 group-hover:stroke-white cursor-pointer"
              fill={isLiked ? "#AFC16D" : "none"}
              stroke={isLiked ? "#AFC16D" : "currentColor"}
            />
            <span className="text-xs group-hover:text-white">
              {isLiked ? "已加入最愛" : "加入最愛"}
            </span>
          </div>
        </Button>


        <Button
          variant="primary"
          className={`w-5/6 mx-auto h-full !text-xl rounded-none ${!isLoggedIn ? 'opacity-50 cursor-not-allowed' : ''}`}
          onClick={handleReserveClick}
        >
          立即預約
        </Button>
      </div>

      <ReservationModal
        visible={showModal}
        onClose={() => setShowModal(false)}
        occurrences={actualDate.map(item => ({
          id: item.id,
          date: item.date,
          start_time: item.start_time,
          end_time: item.end_time,
          reserved_count: item.reserved_count,
          max_participants: item.max_participants, // ✅ 傳遞 max_participants 給 Modal
        }))}
        reservedIds={reservedIds}
        reservedTimeList={reservedTimeList}
      />
    </>
  )
}
