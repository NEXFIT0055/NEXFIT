'use client'

import React, { useEffect, useState } from 'react'
import { useParams, useRouter } from 'next/navigation'
import Link from 'next/link';
import Image from "next/image";
import { Calendar, Facebook, Instagram, Mail, MapPin, MessageCircle, Phone, User, Info } from "lucide-react";
import { Button } from '../../_components/ui/button'
import { Card, CardContent } from '../../_components/ui/card'
import { toast } from 'sonner';
import CssLoader from '@/app/(main)/shop/cart/_components/css-loader';

function getAuthHeader() {
  if (typeof window === 'undefined') return null;
  const token = localStorage.getItem('token');
  return token ? `Bearer ${token}` : null;
}

function formatDate(dateStr) {
  const date = new Date(dateStr); // 自動轉為本地時間
  const weekdays = ['日', '一', '二', '三', '四', '五', '六'];
  const yyyy = date.getFullYear();
  const mm = String(date.getMonth() + 1).padStart(2, '0');
  const dd = String(date.getDate()).padStart(2, '0');
  const weekday = weekdays[date.getDay()];
  return `${yyyy}-${mm}-${dd}（${weekday}）`;
}

function formatTime(start, end) {
  return `${start} - ${end}`;
}

export default function ReservationInfo() {
  const { id } = useParams();
  const router = useRouter();
  const [data, setData] = useState(null);
  const [loading, setLoading] = useState(true);
  const [userInfo, setUserInfo] = useState({ name: '', email: '', phone: '' });
  const [note, setNote] = useState('');

  useEffect(() => {
    async function fetchData() {
      try {
        const res = await fetch(`/api/reservation/occurrence/${id}`, {
          headers: {
            Authorization: getAuthHeader(),
          },
        });

        const json = await res.json();
        if (json.success) {
          setData(json.data);
        } else {
          toast.error('取得資料失敗：' + json.error);
        }
      } catch (error) {
        toast.error('API 請求錯誤');
        console.error('API 請求錯誤：', error);
      } finally {
        setLoading(false);
      }
    }

    if (id) fetchData();
  }, [id]);


  useEffect(() => {
    async function fetchUserInfo() {
      try {
        const res = await fetch('/api/reservation/user/profile', {
          headers: {
            Authorization: getAuthHeader(),
          },
        });
        const json = await res.json();
        if (json.success) {
          setUserInfo(json.data);
        }
      } catch (error) {
        console.error('取得會員資料失敗', error);
      }
    }
    fetchUserInfo();
  }, []);

  const handleReservation = async () => {
    try {
      const res = await fetch('/api/reservation/reserve', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          Authorization: getAuthHeader(),
        },
        body: JSON.stringify({
          occurrence_id: data.occurrence.id,
          note,
        }),
      });

      const result = await res.json();
      if (result.success) {
        const reservationId = result.reservationId; // 確保你的 API 有回傳這個欄位
        router.push(`/reservation/success/${reservationId}`);
      } else {
        toast.error('預約失敗：' + result.error);
      }
    } catch (err) {
      console.error(err);
      alert('發生錯誤');
    }
  };


  if (loading) return <div className="flex justify-center items-center h-[300px]">
    <CssLoader />
  </div>
  if (!data) return <p className="p-8 text-red-500">找不到預約資料。</p>;

  const { courseName, instructor, occurrence, location, description, image } = data;

  const precautionsText = [
    "1.諮詢醫生：如果您有任何健康問題或存在慢性疾病，建議在開始肌力訓練或運動計劃之前先諮詢醫生的意見。",
    "2.熱身運動：在進行肌力訓練或任何運動之前，進行適當的熱身運動是非常重要的。",
    "3.正確的姿勢和技巧：學習正確的姿勢和技巧非常重要，以確保在進行肌力訓練時保持安全性和有效性。",
    "4.適當的訓練強度和進度：開始時，選擇適當的訓練強度，不要過度用力。",
    "5.正確的呼吸：在肌力訓練和運動時，保持正確的呼吸技巧非常重要。",
    "6.適當的休息和恢復：給予身體足夠的休息和恢復時間是非常重要的。",
    "7.穿著合適的運動裝備：穿著合適的運動鞋和舒適的運動服裝可以提供適當的支撐和保護。",
    "8.適應個人能力：每個人的身體狀況和能力不同，請根據自己的能力和目標進行訓練。"
  ];

  return (
    <div className="w-full px-8 md:px-15 pt-10 pb-44">
      <div className="flex flex-col lg:flex-row gap-6">
        <div className="flex flex-col gap-6 w-full lg:w-1/2">
          <div className="w-5/6 mx-auto h-[285px] bg-[#d9d9d9]">
            <Image
              src={image}
              alt="course"
              className="w-full h-full object-cover object-[center_top]"
              width={1080}
              height={540}
            />
          </div>

          <h1 className="w-4/5 mx-auto text-2xl font-bold">
            {courseName}
          </h1>

          <div className="w-4/5 mx-auto flex items-center gap-3 ">
            <User className="w-[25px] h-[25px]" />
            <span className="text-xl font-medium">
              {instructor}
            </span>
          </div>

          <div className='w-4/5 mx-auto'>
            <Button variant="ghost" className="h-auto rounded-lg bg-[#cccccc] text-black text-lg font-medium mb-3 pointer-events-none">
              {/* <p className='text-md font-medium mb-3'> */}
              課程介紹
              {/* </p> */}
            </Button>
            <p className="text-md font-medium text-[#494848]">
              {description}
            </p>
          </div>

          {/* <div className="w-4/5 mx-auto">
            <h3 className="text-xl font-medium mb-4">聯絡方式</h3>
            <div className="flex gap-4">
              <Facebook className="w-6 h-6 text-[#3D435C]" />
              <Instagram className="w-6 h-6 text-[#3D435C]" />
              <MessageCircle className="w-6 h-6 text-[#3D435C]" />
              <Phone className="w-6 h-6 text-[#3D435C]" />
              <Mail className="w-6 h-6 text-[#3D435C]" />
            </div>
          </div> */}
        </div>

        <div className="flex flex-col gap-5 w-full lg:w-1/2 overflow-scroll">
          <Card className="rounded-lg overflow-hidden w-5/6 mx-auto">
            <CardContent className="!p-0">
              <div className="flex items-center p-6">
                <Calendar className="w-[26px] h-[26px] mr-[46px]" />
                <div className="text-lg font-medium flex gap-3">
                  <span>{formatDate(occurrence.date)}</span>
                  <span>{formatTime(occurrence.start_time, occurrence.end_time)}</span>
                </div>
              </div>
            </CardContent>
          </Card>

          <Card className="rounded-lg overflow-hidden w-5/6 mx-auto">
            <CardContent className="!p-0">
              <div className="flex items-center p-6">
                <MapPin className="w-[27px] h-[35px] mr-[46px]" />
                <div className="flex flex-col gap-2">
                  <div className="text-lg font-medium">
                    {location.address}
                  </div>
                  <div className="text-lg text-[#838383] font-medium">
                    {location.name}
                  </div>
                </div>
              </div>
            </CardContent>
          </Card>

          <textarea
            className="w-5/6 mx-auto min-h-[150px] py-6 px-8 rounded-lg bg-[#B7BAAA] text-black text-lg font-medium mb-4"
            placeholder='有問題、需求或悄悄話？都可以在這裡告訴教練:)'
            value={note}
            onChange={(e) => setNote(e.target.value)}
          />

          {/* <div>
            <Button variant="ghost" className="h-auto rounded-lg bg-[#cccccc] text-black text-lg font-medium mb-3 pointer-events-none">
              課程介紹
            </Button>
            <p className="text-md font-medium text-[#494848]">
              {description}
            </p>
          </div> */}

          <div>
            <Button variant="ghost" className="h-auto rounded-lg bg-[#cccccc] text-black text-lg font-medium mb-3 pointer-events-none">
              注意事項
            </Button>
            <div className="text-md font-medium text-[#4a4949]">
              {precautionsText.map((text, index) => (
                <p key={index} className="mb-1">
                  {text}
                </p>
              ))}
            </div>
          </div>
        </div>
      </div>

      <div className="fixed bottom-0 left-0 w-full bg-[#ebe8de] flex items-end justify-between px-50 py-4">
        <div className="text-sm leading-6 text-left">
          <h3 className="text-[20px] font-semibold mb-2">預約者資訊</h3>
          <p className='text-base pl-2'>姓名：{userInfo.name}</p>
          <p className='text-base pl-2'>電話：{userInfo.phone}</p>
          <p className='text-base pl-2'>Email：{userInfo.email}</p>
          <div className='flex gap-2 mt-1 justify-center'>
            <Info className="w-[16px] h-[16px] mt-1 text-[#5E6256]" />
            <p className="text-[14px] font-medium text-[#033721]">
              預約者資訊來自您的會員資料，如需更改請前往「會員中心」修改。教練將會以此聯繫您，請確認資料正確。
            </p>
          </div>
        </div>

        <div className="flex items-center gap-4">
          <Link href={`/reservation/course/${data.courseId}`}>
            <Button variant="outline" className="text-[15px] h-[45px]">
              返回上頁
            </Button>
          </Link>
          <Button variant="primary" onClick={handleReservation} className="text-[15px] h-[45px] shadow-md/30 font-semibold">
            確認預約
          </Button>
        </div>
      </div>
    </div>
  );
}
