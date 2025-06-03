"use client";

import React, { useEffect, useState } from "react";
import { Input } from "@/app/components/ui/input";
import { Button } from "@/app/components/ui/button";
import { toast } from "sonner";
import {
  AlertDialog,
  AlertDialogContent,
  AlertDialogHeader,
  AlertDialogFooter,
  AlertDialogTitle,
  AlertDialogAction,
  AlertDialogCancel,
} from "@/app/components/ui/alert-dialog";
import { ArrowDownWideNarrow, ArrowDownNarrowWide } from "lucide-react";
import CssLoader from "@/app/(main)/shop/cart/_components/css-loader";

const tableClass = "py-3 px-4 text-center text-textColor";

export default function CoursePage() {
  const [courses, setCourses] = useState([]);
  const [searchInput, setSearchInput] = useState("");
  const [searchTerm, setSearchTerm] = useState("");
  const [loading, setLoading] = useState(true);
  const [pendingReservationId, setPendingReservationId] = useState(null);
  const [activeTab, setActiveTab] = useState("upcoming"); // upcoming | past

  const [sortField, setSortField] = useState("time");
  const [sortOrder, setSortOrder] = useState("asc");

  const fetchCourses = async () => {
    try {
      setLoading(true);
      const token = localStorage.getItem("token");
      const res = await fetch("/api/reservation/user-reservation", {
        headers: {
          Authorization: `Bearer ${token}`,
        },
      });
      const result = await res.json();
      if (result.success) {
        setCourses(result.data);
      } else {
        toast.error("載入失敗：" + result.error);
      }
    } catch (err) {
      console.error("API 錯誤:", err);
      toast.error("載入失敗，請稍後再試");
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchCourses();
  }, []);

  // ✅ 資料整理
  const now = new Date();

  const filteredCourses = [...courses]
    .filter((course) =>
      course.courseName.toLowerCase().includes(searchTerm.toLowerCase())
    )
    .filter((course) => {
      const courseDate = new Date(
        course.time.split(" ")[0] + "T" + course.time.split(" ")[1]
      );
      return activeTab === "upcoming" ? courseDate >= now : courseDate < now;
    })
    .sort((a, b) => {
      const fieldA = a[sortField]?.toLowerCase?.() || a[sortField];
      const fieldB = b[sortField]?.toLowerCase?.() || b[sortField];
      if (fieldA < fieldB) return sortOrder === "asc" ? -1 : 1;
      if (fieldA > fieldB) return sortOrder === "asc" ? 1 : -1;
      return 0;
    });

  const confirmCancel = async () => {
    try {
      const token = localStorage.getItem("token");
      const res = await fetch(
        `/api/reservation/delete/${pendingReservationId}`,
        {
          method: "DELETE",
          headers: {
            Authorization: `Bearer ${token}`,
          },
        }
      );

      const result = await res.json();
      if (result.success) {
        toast.success("預約已取消");
        fetchCourses();
      } else {
        toast.error("取消失敗：" + result.error);
      }
    } catch (err) {
      console.error("刪除失敗:", err);
      toast.error("取消失敗，請稍後再試");
    } finally {
      setPendingReservationId(null);
    }
  };

  const handleSort = (field) => {
    if (field === sortField) {
      setSortOrder((prev) => (prev === "asc" ? "desc" : "asc"));
    } else {
      setSortField(field);
      setSortOrder("asc");
    }
  };

  const SortIcon = ({ field }) => {
    if (sortField !== field) return null;
    return sortOrder === "asc" ? (
      <ArrowDownNarrowWide className="inline w-4 h-4 ml-1 text-gray-500" />
    ) : (
      <ArrowDownWideNarrow className="inline w-4 h-4 ml-1 text-gray-500" />
    );
  };


  return (
    <div className="p-10 w-4/5 h-full mt-10 mx-10 border border-borderColor rounded-lg">
      <p className="text-2xl md:text-3xl">課程預約記錄</p>

      {/* ✅ Tab 切換 */}
      {/* <div className="flex gap-4 mt-4 mb-2">
        <Button variant={activeTab === "upcoming" ? "default" : "outline"} className="hover:bg-zinc-500 hover:text-white" onClick={() => setActiveTab("upcoming")}>
          未完成
        </Button>
        <Button variant={activeTab === "past" ? "default" : "outline"}
          className="hover:bg-zinc-500 hover:text-white" onClick={() => setActiveTab("past")}>
          已完成
        </Button>
      </div> */}

      {/* 搜尋區 */}
      <div className="my-3 sm:my-5 flex flex-col sm:flex-row gap-3 sm:gap-0">
        <Input
          placeholder="請輸入課程名稱"
          className="border border-borderColor w-full"
          value={searchInput}
          onChange={(e) => setSearchInput(e.target.value)}
        />
        <div className="flex gap-2 sm:ml-5 w-full sm:w-auto">
          <Button
            className="w-full sm:w-20 h-8 rounded-lg hover:bg-zinc-500 hover:text-white"
            variant="outline"
            onClick={() => setSearchTerm(searchInput)}
          >
            搜尋
          </Button>
          <Button
            className="w-full sm:w-20 h-8 rounded-lg hover:bg-zinc-500 hover:text-white"
            variant="secondary"
            onClick={() => {
              setSearchInput("");
              setSearchTerm("");
            }}
          >
            清除
          </Button>
        </div>
      </div>

      {/* ✅ Tab 切換 */}
      <div className="flex mt-4 mb-2">
        <Button
          variant={activeTab === "upcoming" ? "default" : "outline"}
          className="hover:bg-zinc-500 hover:text-white rounded-none"
          onClick={() => setActiveTab("upcoming")}
        >
          即將到來
        </Button>
        <Button
          variant={activeTab === "past" ? "default" : "outline"}
          className="hover:bg-zinc-500 hover:text-white rounded-none px-5"
          onClick={() => setActiveTab("past")}
        >
          已完成
        </Button>
      </div>

      <AlertDialog
        open={!!pendingReservationId}
        onOpenChange={() => setPendingReservationId(null)}
      >
        <AlertDialogContent>
          <AlertDialogHeader>
            <AlertDialogTitle>確定要取消這筆預約嗎？</AlertDialogTitle>
          </AlertDialogHeader>
          <AlertDialogFooter>
            <AlertDialogCancel>取消</AlertDialogCancel>
            <AlertDialogAction onClick={confirmCancel}>
              確定取消
            </AlertDialogAction>
          </AlertDialogFooter>
        </AlertDialogContent>
      </AlertDialog>

      {/* 表格區域 */}
      {loading ? (
        <div className="flex justify-center items-center h-[300px]">
          <CssLoader />
        </div>
      ) : (
        <div className="hidden sm:block overflow-x-auto">
          <table className="w-full">
            <thead className="bg-[#F9F9F9] border-y border-borderColor">
              <tr>
                <th className={tableClass}>
                  <button
                    onClick={() => handleSort("courseName")}
                    className="inline-flex items-center"
                  >
                    課程名稱 <SortIcon field="courseName" />
                  </button>
                </th>
                <th className={tableClass}>
                  <button
                    onClick={() => handleSort("teacherName")}
                    className="inline-flex items-center"
                  >
                    教練名稱 <SortIcon field="teacherName" />
                  </button>
                </th>
                <th className={tableClass}>
                  <button
                    onClick={() => handleSort("time")}
                    className="inline-flex items-center"
                  >
                    上課時間 <SortIcon field="time" />
                  </button>
                </th>
                <th className={tableClass}></th>
              </tr>
            </thead>
            <tbody className="border-b border-borderColor">
              {filteredCourses.map((course, index) => (
                <tr
                  key={course.reservationId}
                  className={
                    index !== filteredCourses.length - 1 ? "border-b" : ""
                  }
                >
                  <td className={tableClass}>{course.courseName}</td>
                  <td className={tableClass}>{course.teacherName}</td>
                  <td className={tableClass}>{course.time}</td>
                  <td className={tableClass}>
                    {activeTab === "upcoming" && (
                      <Button
                        variant="outline"
                        className="hover:bg-zinc-500 hover:text-white"
                        onClick={() =>
                          setPendingReservationId(course.reservationId)
                        }
                      >
                        取消預約
                      </Button>
                    )}
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      )}
    </div>
  );
}
