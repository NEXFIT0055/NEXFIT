'use client'

import { SearchIcon } from "lucide-react";
import React, { useEffect, useState } from "react";
import Link from "next/link";
import { Badge } from "../_components/ui/badge";
import { Button } from "../_components/ui/button";
import { Card, CardContent } from "../_components/ui/card";
import { Input } from "../_components/ui/input";
import Pagination from "../_components/ui/pagination.js";
import { Funnel } from "lucide-react";

export default function Coach() {
  const [coaches, setCoaches] = useState([]);
  const [loading, setLoading] = useState(true);

  // 預設每頁、當前頁數 (可改成state控制分頁)
  const perPage = 9;
  const [page, setPage] = useState(1);
  const [totalPages, setTotalPages] = useState(1);

  useEffect(() => {
    async function fetchCoaches() {
      setLoading(true);
      try {
        const res = await fetch(`/api/reservation/coach?page=${page}&perPage=${perPage}`);
        const data = await res.json();
        if (data.success !== false && data.rows) {
          // 假設API回傳格式中：rows陣列有教練資料
          setCoaches(data.rows);
          setTotalPages(data.totalPages || 1);
        } else {
          setCoaches([]);
        }
      } catch (error) {
        console.error("Fetch coaches failed:", error);
        setCoaches([]);
      }
      setLoading(false);
    }
    fetchCoaches();
  }, [page]);

  // 這邊可以根據你API欄位調整欄位名稱和結構
  // 例如 coach.name, coach.specialty(或categories)、coach.image（如果有）

  return (
    <section className="w-full flex justify-center py-12">
      <div className="container max-w-6xl flex flex-col gap-8">
        {/* Header section */}
        <div className="flex flex-col gap-10 lg:gap-16 px-3">
          {/* Title and search bar */}
          <div className="flex flex-col lg:flex-row items-center justify-between w-full gap-8">
            <div className="flex items-center justify-center lg:justify-start w-full lg:w-1/2">
              <h1 className="font-semibold text-[45px] [font-family:'Lato',Helvetica] text-black">
                Coach
              </h1>
              <span className="ml-3 [font-family:'Noto_Sans_JP',Helvetica] font-medium text-2xl text-black">
                教練列表
              </span>
            </div>

            <div className="flex items-center gap-3 lg:gap-7">
              {/* SearchIcon input */}
              <div className="relative w-[150px] lg:w-[293px]">
                <Input
                  className="h-12 bg-[#dedede] rounded-[10px] pl-[10px] lg:pl-[25px] text-lg md:text-xl text-[#b0b0b0]"
                  placeholder="輸入關鍵字"
                />
                <Funnel className="absolute right-[10px] lg:right-[25px] top-1/2 transform -translate-y-1/2 w-[22px] h-[22px] text-[#b0b0b0]" />
              </div>

              {/* Filter buttons */}
              <Button variant="primary"
                className="w-[76px] h-12 text-xl">
                全部
              </Button>
              <Button
                variant="outline"
                className="w-[76px] h-12 text-xl"
              >
                最愛
              </Button>
            </div>
          </div>
        </div>

        {/* Coach grid and pagination */}
        <div className="flex flex-col items-center gap-[75px]">
          {loading ? (
            <p>載入中...</p>
          ) : (
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-x-[95px] gap-y-[76px] w-full">
              {coaches.map((coach) => (
                <Card key={coach.id} className="max-w-[320px] mx-auto bg-transparent border-0 pt-8 shadow-none px-0">
                  <CardContent className="!p-0 flex flex-col gap-3">
                    <Link href={`coach/detail`}>
                      <img
                        className="w-full h-[380px] object-cover rounded-xl"
                        alt="Coach pic"
                        src={coach.image || "https://c.animaapp.com/mAgGsfrF/img/coach-pic-11.svg"}
                      /></Link>
                    <div className="flex flex-col h-[124px] items-center gap-1.5">
                      <h3 className="font-bold [font-family:'Noto_Sans_JP',Helvetica] text-[#393332] text-lg text-center leading-8">
                        {coach.name}
                      </h3>
                      <p className="font-bold [font-family:'Noto_Sans_JP',Helvetica] text-[#393332] text-lg text-center leading-8">
                        {/* 用 categories 名稱組合當 specialty 範例 */}
                        {coach.categories?.map(cat => cat.name).join("、") || "無專長"}
                      </p>
                      {coach.hasQuickAppointment && (
                        <div className="mt-1">
                          <Link href={`coach/detail/${coach.id}`}>
                            <span className="[font-family:'Open_Sans',Helvetica] font-semibold text-black text-sm text-center">
                              快速預約 →
                            </span>
                          </Link>
                        </div>
                      )}
                    </div>
                  </CardContent>
                </Card>
              ))}
            </div>
          )}

          {/* Pagination */}
          <Pagination
            totalPages={totalPages} // 總頁數
            currentPage={page} // 當前頁數
            onPageChange={(p) => setPage(p)} // 分頁變更的回調函式
          />
        </div>
      </div>
    </section>
  );
}
