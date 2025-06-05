"use client";

import React, { useState, useEffect } from "react";
import Image from "next/image";
import { useAuth } from "@/app/contexts/AuthContext"; // 使用 AuthContext
import {
  Carousel,
  CarouselContent,
  CarouselItem,
  CarouselNext,
  CarouselPrevious,
} from "@/app/components/ui/carousel";
import { Button } from "@/app/components/ui/button";
import { courseData } from "@/app/config/courseCard";
import { toast } from "sonner";
import Link from "next/link";

const SkeletonLoader = () => {
  return (
    <div className="p-10 w-4/5 h-full mt-10 mx-10 border border-borderColor rounded-lg">
      {/* 標題 */}
      <div className="h-8 bg-gray-200 rounded-md mb-6 w-48 animate-pulse"></div>

      <div className="flex flex-col lg:flex-row lg:gap-8">
        {/* 身體數據 */}
        <div className="w-full lg:w-3/5 mb-8 lg:mb-0">
          {/* 身高 */}
          <div className="flex items-center my-5 border-b border-gray-200 pb-2">
            <div className="flex items-baseline gap-2">
              <div className="h-4 bg-gray-200 rounded w-8 animate-pulse"></div>
              <div className="h-3 bg-gray-200 rounded w-1 animate-pulse"></div>
              <div className="h-4 bg-gray-200 rounded w-12 animate-pulse"></div>
              <div className="h-3 bg-gray-200 rounded w-4 animate-pulse"></div>
            </div>
          </div>

          {/* 體重 */}
          <div className="flex items-center my-5 border-b border-gray-200 pb-2">
            <div className="flex items-baseline gap-2">
              <div className="h-4 bg-gray-200 rounded w-8 animate-pulse"></div>
              <div className="h-3 bg-gray-200 rounded w-1 animate-pulse"></div>
              <div className="h-4 bg-gray-200 rounded w-12 animate-pulse"></div>
              <div className="h-3 bg-gray-200 rounded w-4 animate-pulse"></div>
            </div>
          </div>

          {/* BMI */}
          <div className="flex items-center my-5 border-b border-gray-200 pb-2">
            <div className="flex items-baseline gap-2">
              <div className="h-4 bg-gray-200 rounded w-6 animate-pulse"></div>
              <div className="h-3 bg-gray-200 rounded w-1 animate-pulse"></div>
              <div className="h-4 bg-gray-200 rounded w-10 animate-pulse"></div>
            </div>
          </div>

          {/* 腰圍 */}
          <div className="flex items-center my-5 border-b border-gray-200 pb-2">
            <div className="flex items-baseline gap-2">
              <div className="h-4 bg-gray-200 rounded w-8 animate-pulse"></div>
              <div className="h-3 bg-gray-200 rounded w-1 animate-pulse"></div>
              <div className="h-4 bg-gray-200 rounded w-12 animate-pulse"></div>
              <div className="h-3 bg-gray-200 rounded w-4 animate-pulse"></div>
            </div>
          </div>

          {/* 體脂率 */}
          <div className="flex items-center my-5 border-b border-gray-200 pb-2">
            <div className="flex items-baseline gap-2">
              <div className="h-4 bg-gray-200 rounded w-12 animate-pulse"></div>
              <div className="h-3 bg-gray-200 rounded w-1 animate-pulse"></div>
              <div className="h-4 bg-gray-200 rounded w-10 animate-pulse"></div>
              <div className="h-3 bg-gray-200 rounded w-2 animate-pulse"></div>
            </div>
          </div>

          {/* 肌肉量 */}
          <div className="flex items-center my-5 border-b border-gray-200 pb-2">
            <div className="flex items-baseline gap-2">
              <div className="h-4 bg-gray-200 rounded w-12 animate-pulse"></div>
              <div className="h-3 bg-gray-200 rounded w-1 animate-pulse"></div>
              <div className="h-4 bg-gray-200 rounded w-10 animate-pulse"></div>
              <div className="h-3 bg-gray-200 rounded w-4 animate-pulse"></div>
            </div>
          </div>

          {/* 骨骼肌量 */}
          <div className="flex items-center my-5 border-b border-gray-200 pb-2">
            <div className="flex items-baseline gap-2">
              <div className="h-4 bg-gray-200 rounded w-16 animate-pulse"></div>
              <div className="h-3 bg-gray-200 rounded w-1 animate-pulse"></div>
              <div className="h-4 bg-gray-200 rounded w-10 animate-pulse"></div>
              <div className="h-3 bg-gray-200 rounded w-4 animate-pulse"></div>
            </div>
          </div>
        </div>

        {/* 課程推薦區塊 */}
        <div className="flex flex-col w-full lg:ml-5">
          <div className="flex flex-col mb-6 lg:-mt-6">
            {/* 課程推薦標題 */}
            <div className="h-6 bg-gray-200 rounded mb-3 w-24 animate-pulse mx-auto lg:mx-0"></div>

            {/* 輪播 */}
            <div className="flex justify-center">
              <div className="w-[250px] relative">
                {/* 課程卡片 */}
                <div className="bg-gray-100 flex flex-col justify-between items-center w-[200px] h-[260px] p-4 rounded-lg mx-auto animate-pulse">
                  {/* 圖片 */}
                  <div className="w-[160px] h-[140px] bg-gray-200 rounded animate-pulse"></div>

                  {/* 內容 */}
                  <div className="flex flex-col items-center gap-2 w-full">
                    {/* 課程名稱 */}
                    <div className="h-4 bg-gray-200 rounded w-32 animate-pulse"></div>

                    {/* 教練名稱 */}
                    <div className="h-3 bg-gray-200 rounded w-24 animate-pulse"></div>

                    {/* 按鈕 */}
                    <div className="h-8 bg-gray-200 rounded w-16 animate-pulse"></div>
                  </div>
                </div>

                {/* 輪播按鈕 */}
                <div className="absolute left-0 top-1/2 transform -translate-y-1/2 w-8 h-8 bg-gray-200 rounded-full animate-pulse"></div>
                <div className="absolute right-0 top-1/2 transform -translate-y-1/2 w-8 h-8 bg-gray-200 rounded-full animate-pulse"></div>
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

// 身體數據骨架屏組件
const BodyDataSkeleton = () => {
  return (
    <div className="w-full lg:w-3/5 mb-8 lg:mb-0">
      {[...Array(7)].map((_, index) => (
        <div
          key={index}
          className="flex items-center my-5 border-b border-gray-200 pb-2"
        >
          <div className="flex items-baseline gap-2">
            <div
              className={`h-4 bg-gray-200 rounded animate-pulse ${
                index === 0
                  ? "w-8"
                  : index === 1
                  ? "w-8"
                  : index === 2
                  ? "w-6"
                  : index === 3
                  ? "w-8"
                  : index === 4
                  ? "w-12"
                  : index === 5
                  ? "w-12"
                  : "w-16"
              }`}
            ></div>
            <div className="h-3 bg-gray-200 rounded w-1 animate-pulse"></div>
            <div className="h-4 bg-gray-200 rounded w-10 animate-pulse"></div>
            {index !== 2 && (
              <div
                className={`h-3 bg-gray-200 rounded animate-pulse ${
                  index === 4 ? "w-2" : "w-4"
                }`}
              ></div>
            )}
          </div>
        </div>
      ))}
    </div>
  );
};

// 資料欄位元件
const FormInput = ({ label, value = "", unit = "" }) => (
  <div className="flex items-center my-5 border-b border-gray-200 pb-2 hover:border-gray-400 transition-colors">
    <div className="flex items-baseline">
      <span className="text-fontColor">{label}</span>
      <span className="text-fontColor">：</span>
      <span className="text-gray-700">{value || "-"}</span>
      {unit && <span className="text-gray-500 ml-1">{unit}</span>}
    </div>
  </div>
);

// 課程卡片元件

const CourseCard = ({ title, description, imgSrc, type, href }) => (
  <div className="bg-[#F0F0F0] shadow-lg flex flex-col justify-between items-center w-[380px] h-[380px] p-6 rounded-2xl lg:mb-4">
    <div className="relative w-full h-[180px] rounded-xl overflow-hidden">
      <Image
        src={imgSrc}
        fill
        className="object-cover"
        alt={`${title}${type === "course" ? "課程" : "飲食"}圖片`}
      />
    </div>
    <div className="flex flex-col items-center gap-3 flex-1 justify-center">
      <p className="text-[#101828] text-lg font-bold text-center">{title}</p>
      <p className="text-[#101828] text-base text-center">
        教練名稱：{description}
      </p>

      <Link href={href}>
        <Button
          size="lg"
          className="rounded-lg bg-[#101828] !text-[#F0F0F0] hover:!bg-[#101828]/80 px-8 py-3 text-base font-medium mt-2"
        >
          立即預約
        </Button>
      </Link>
    </div>
  </div>
);

// 輪播元件
const CarouselSection = ({ title, item }) => (
  <div className="flex flex-col mb-6 lg:-mt-6">
    <p className="mb-3 text-xl text-center lg:text-left">{title}</p>
    <div className="flex justify-center">
      <Carousel className="w-[250px]">
        <CarouselContent>
          {item.map((card, id) => (
            <CarouselItem key={id} className="flex justify-center">
              <CourseCard {...card} />
            </CarouselItem>
          ))}
        </CarouselContent>
        <CarouselPrevious />
        <CarouselNext />
      </Carousel>
    </div>
  </div>
);

// 主元件
export default function Page() {
  console.log("身體基本資料頁面渲染");

  // 使用 AuthContext 檢查登入狀態
  const { isAuthenticated, token, isLoading } = useAuth();

  const [bodyData, setBodyData] = useState({
    height: "",
    weight: "",
    bmi: "",
    waist: "",
    bodyFatPercentage: "",
    muscleMass: "",
    skeletalMuscleMass: "",
  });

  const [isLoadingBody, setIsLoadingBody] = useState(true);

  // 抓取身體數據
  const fetchBodyData = async () => {
    // 如果還在檢查認證狀態，等待完成
    if (isLoading) {
      return;
    }

    // 如果未登入，不執行 API 調用
    if (!isAuthenticated || !token) {
      console.log("用戶未登入，跳過身體數據獲取");
      setIsLoadingBody(false);
      return;
    }

    try {
      setIsLoadingBody(true);
      console.log("開始獲取身體測量數據...");

      const response = await fetch("/api/accountCenter/profile/body", {
        headers: {
          Authorization: `Bearer ${token}`,
        },
      });
      const result = await response.json();

      if (!response.ok) {
        throw new Error(result.message || "獲取數據失敗");
      }

      if (result.success && result.data?.measurement) {
        console.log("身體數據獲取成功");
        setBodyData(result.data.measurement);
      } else {
        throw new Error(result.message || "無法獲取身體測量數據");
      }
    } catch (error) {
      console.error("獲取身體測量數據失敗:", error);
      toast.error(error.message || "獲取身體測量數據失敗");
    } finally {
      setIsLoadingBody(false);
    }
  };

  // 當認證狀態確定後，獲取身體數據
  useEffect(() => {
    console.log(" 認證狀態變更，重新檢查是否需要獲取身體數據", {
      isLoading,
      isAuthenticated,
      hasToken: !!token,
    });

    if (!isLoading) {
      fetchBodyData();
    }
  }, [isLoading, isAuthenticated, token]);

  // 如果正在載入認證狀態，顯示完整骨架屏
  if (isLoading) {
    return <SkeletonLoader />;
  }

  // 如果未登入
  if (!isAuthenticated) {
    return (
      <div className="p-10 w-4/5 h-full mt-10 mx-10 border border-borderColor rounded-lg">
        <div className="flex items-center justify-center h-64">
          <div className="text-gray-500">請先登入以查看身體資料</div>
        </div>
      </div>
    );
  }

  return (
    <div className="p-10 w-4/5 h-full mt-10 mx-10 border border-borderColor rounded-lg">
      <p className="text-2xl md:text-3xl mb-6">身體基本資料</p>
      <div className="flex flex-col lg:flex-row lg:gap-8">
        {isLoadingBody ? (
          <BodyDataSkeleton />
        ) : (
          <div className="w-full lg:w-3/5 mb-8 lg:mb-0">
            <FormInput label="身高" value={bodyData.height} unit="cm" />
            <FormInput label="體重" value={bodyData.weight} unit="kg" />
            <FormInput label="BMI" value={bodyData.bmi} />
            <FormInput label="腰圍" value={bodyData.waist} unit="cm" />
            <FormInput
              label="體脂率"
              value={bodyData.bodyFatPercentage}
              unit="%"
            />
            <FormInput label="肌肉量" value={bodyData.muscleMass} unit="kg" />
            <FormInput
              label="骨骼肌量"
              value={bodyData.skeletalMuscleMass}
              unit="kg"
            />
          </div>
        )}

        {/* 課程推薦區塊 */}
        <div className="flex flex-col w-full lg:ml-5">
          <CarouselSection title="課程推薦" item={courseData} />
        </div>
      </div>
    </div>
  );
}
