'use client'

import React, { useEffect, useState } from 'react'
import { useParams } from 'next/navigation'
import { Table, TableHeader, TableBody, TableRow, TableHead, TableCell } from '../../_components/ui/table'
import { Mail } from 'lucide-react'
import Image from 'next/image'
import Link from 'next/link'
import CssLoader from '@/app/(main)/shop/cart/_components/css-loader'


const weekdayMap = ['週日', '週一', '週二', '週三', '週四', '週五', '週六']

const categoryColorMap = {
  1: 'bg-[#FFDEDE]', // 有氧燃脂
  2: 'bg-[#E6F7FF]', // 核心訓練
  3: 'bg-[#FDF3D8]', // 柔軟伸展
  4: 'bg-[#DFF8E7]', // 重量訓練
  5: 'bg-[#F4E1FF]', // 瑜珈冥想
  6: 'bg-[#ffe0b9]', // 功能性訓練
  7: 'bg-[#c6d6e6]', // 心肺強化
  8: 'bg-[#b9d9ca]', // 肌力增強
  9: 'bg-[#e1b3b9]', // 全身循環
  10: 'bg-[#b8b3c6]', // 恢復與放鬆
}


export default function CoachDetail() {
  const { coachId } = useParams()
  const [data, setData] = useState(null)
  const [selectedCategory, setSelectedCategory] = useState(null)

  useEffect(() => {
    async function fetchCoachData() {
      const res = await fetch(`/api/reservation/coach/${coachId}`)
      const result = await res.json()
      if (result.success) {
        setData(result.data)
      }
    }
    if (coachId) fetchCoachData()
  }, [coachId])

  if (!data) return <div className="flex justify-center items-center h-[300px]">
    <CssLoader />
  </div>

  const { name, location, classroom_name, categories, courses, image, email } = data

  const filteredCourses = selectedCategory
    ? courses.filter(course => course.category_id === selectedCategory)
    : courses

  // 建立每週時間表 Map: weekday -> 課程陣列
  const weekSchedule = Array.from({ length: 7 }, (_, i) => ({
    weekday: i,
    classes: [],
  }))

  filteredCourses.forEach(course => {
    course.recurrences.forEach(rec => {
      weekSchedule[rec.weekday].classes.push({
        name: course.name,
        start: rec.start_time.slice(0, 5),
        end: rec.end_time.slice(0, 5),
        category_id: course.category_id,
        course_id: course.id,
      })
    })
  })

  return (
    <section className="px-6 py-12 max-w-7xl mx-auto flex gap-8">

      {/* 教練與課程表 */}
      <div className="flex-1">
        <div className='flex gap-20 items-center justify-center mb-15'>
          <Image
            src={image}
            alt="coach"
            width={320}
            height={440}
          />
          <div className="mb-10">
            {/* 課程名稱 */}
            <p className="text-base text-gray-500 mb-1">名字</p>
            <h1 className="text-3xl font-bold mb-6">{name}</h1>

            {/* 地點與教室 */}
            <p className="text-base text-gray-500 mb-1">上課地點與教室</p>
            <p className="text-gray-600 text-lg mb-6">{location} - {classroom_name}</p>

            {/* 聯絡方式 */}
            <p className="text-base text-gray-500 mb-1">聯絡方式</p>
            <div className='flex items-center justify-start mb-6'>
              <Mail className="mr-3 text-gray-500" />
              <a href={`mailto:${email || ''}`} className="cursor-pointer hover:underline" title="聯絡教練">
                <p className="text-gray-600 text-lg">{email}</p></a>
            </div>

            {/* 課程分類 */}
            <p className="text-base text-gray-500 mb-1 mt-4">教授項目</p>
            <p className="text-lg">{categories.map(c => c.name).join(', ')}</p>
          </div>
        </div>

        <div>
          <h2 className="text-2xl font-semibold mb-4">每週固定課程時段</h2>

          {/* 側選單 */}
          <div className='flex gap-6'>
            <aside className="w-40 shrink-0 space-y-3">
              <button
                onClick={() => setSelectedCategory(null)}
                className={`w-full px-3 py-2 rounded-lg text-sm font-semibold border ${selectedCategory === null ? 'bg-black text-white ring-2 ring-gray-500' : 'bg-white text-gray-700'}`}
              >
                全部課程
              </button>
              {categories.map(cat => (
                <button
                  key={cat.id}
                  onClick={() => setSelectedCategory(cat.id)}
                  className={`w-full px-3 py-2 rounded-lg text-sm text-center font-medium ${categoryColorMap[cat.id] || 'bg-gray-100'} ${selectedCategory === cat.id ? 'ring-2 ring-gray-500' : ''}`}
                >
                  {cat.name}
                </button>
              ))}
            </aside>
            <div className="flex-1 overflow-x-auto" id="schedule-table">
              <Table className="w-full text-center">
                <TableHeader className="text-center w-1/7">
                  <TableRow>
                    {weekdayMap.map(day => (
                      <TableHead key={day} className="text-center bg-[#F0F0F0]">{day}</TableHead>
                    ))}
                  </TableRow>
                </TableHeader>
                <TableBody>
                  <TableRow>
                    {weekSchedule.map((day, idx) => (
                      <TableCell key={idx} className="align-top w-1/7">
                        {day.classes.length === 0 ? (
                          <span className="text-gray-400 text-sm">無課程</span>
                        ) : (
                          // ✅ 按時間排序後渲染
                          [...day.classes]
                            .sort((a, b) => a.start.localeCompare(b.start))
                            .map((cls, i) => (
                              <Link key={i} href={`/reservation/course/${cls.course_id}`}>
                                <div className={`p-2 mb-2 rounded-md text-sm cursor-pointer hover:opacity-90 ${categoryColorMap[cls.category_id] || 'bg-white'}`}>
                                  <div className="font-semibold">{cls.name}</div>
                                  <div className="text-xs">{cls.start} - {cls.end}</div>
                                </div>
                              </Link>
                            ))
                        )}
                      </TableCell>
                    ))}
                  </TableRow>
                </TableBody>
              </Table>
            </div>
          </div>
        </div>
      </div>
    </section>
  )
}
