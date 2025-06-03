'use client';

import { useState, useEffect } from "react";
import Image from "next/image";
import Link from "next/link";
import { Funnel, FunnelPlus, UserRound, X, Heart } from "lucide-react";
import { Button } from "../_components/ui/button";
import { Card, CardContent } from "../_components/ui/card";
import { Input } from "../_components/ui/input";
import Pagination from "../_components/ui/pagination";
import FilterModal from "../_components/ui/filterModal";
import { toast } from "sonner";
import CssLoader from "../_components/ui/css-loader";

export default function Course() {
  const [courses, setCourses] = useState([]);
  const [totalPages, setTotalPages] = useState(1);
  const [currentPage, setCurrentPage] = useState(1);
  const [keyword, setKeyword] = useState("");
  const [searchInput, setSearchInput] = useState("");
  const [showFilter, setShowFilter] = useState(false);
  const [selectedTags, setSelectedTags] = useState([]);
  const [pendingTags, setPendingTags] = useState([]);
  const [isLoggedIn, setIsLoggedIn] = useState(false);
  const [showFavorites, setShowFavorites] = useState(false);
  const [token, setToken] = useState("");
  const [loading, setLoading] = useState(false);
  const [selectedDays, setSelectedDays] = useState([]);
  const [selectedTimes, setSelectedTimes] = useState([]);
  const [allAreas, setAllAreas] = useState([]);
  const [selectedAreas, setSelectedAreas] = useState([]);

  const activeFilters = [
    ...selectedTags.map(tag => ({ label: tag, type: 'tag' })),
    ...selectedDays.map(day => ({ label: day, type: 'day' })),
    ...selectedTimes.map(time => ({ label: time, type: 'time' })),
    ...selectedAreas.map(area => ({ label: area, type: 'area' })),
  ];



  // ✅ 1. Fetch 課程
  const fetchCourses = async () => {
    try {
      setLoading(true); // ⬅️ 開始載入
      const query = new URLSearchParams();
      query.append("page", currentPage.toString());
      if (keyword.trim()) query.append("keyword", keyword.trim());
      selectedTags.forEach(tag => query.append("tags", tag));
      selectedDays.forEach(day => query.append("days", day));
      selectedTimes.forEach(time => query.append("times", time));
      selectedAreas.forEach(area => query.append("areas", area));

      const url = showFavorites
        ? "/api/reservation/user/favorites"
        : `/api/reservation/course?${query}`;
      const headers = token ? { Authorization: `Bearer ${token}` } : {};

      const res = await fetch(url, { headers });
      if (!res.ok) throw new Error("Fetch failed");

      const data = await res.json();
      const courseList = (showFavorites ? data.favorites : data.rows || []).map(course => ({
        ...course,
        is_favorite:
          course.is_favorite === true ||
            course.is_favorite === "true" ||
            course.is_favorite === 1
            ? true
            : false,
      }));

      setCourses(courseList);
      setAllAreas(data.allAreas || []);
      setTotalPages(showFavorites ? 1 : data.totalPages || 1);
    } catch (err) {
      console.error("Fetch error:", err);
      setCourses([]);
      setTotalPages(1);
    }
    finally {
      setLoading(false); // ⬅️ 結束載入
    }
  };

  // ✅ 2. 取得登入狀態與 token
  useEffect(() => {
    async function checkLoginStatus() {
      try {
        const storedToken = localStorage.getItem("token");
        if (!storedToken || storedToken.trim() === "") {
          setIsLoggedIn(false);
          return;
        }

        const res = await fetch("/api/reservation/user/profile", {
          headers: { Authorization: `Bearer ${storedToken}` },
        });

        if (res.ok) {
          setToken(storedToken);
          setIsLoggedIn(true);
        } else {
          setIsLoggedIn(false);
        }
      } catch (err) {
        setIsLoggedIn(false);
        console.error("驗證出錯：", err);
      }
    }

    checkLoginStatus();
  }, []);

  // ✅ 3. 監聽依賴並 fetch 課程（等 token ready 才執行）
  useEffect(() => {
    if ((showFavorites && token) || !showFavorites) {
      if (token !== "" || !showFavorites) {
        fetchCourses();
      }
    }
  }, [currentPage, keyword, selectedTags, selectedDays, selectedTimes, selectedAreas, showFavorites, token]);



  // ✅ 4. 愛心點擊處理
  const handleToggleFavorite = async (courseId, isFav) => {
    try {
      const method = isFav ? "DELETE" : "POST";
      const res = await fetch(`/api/reservation/user/favorites/${courseId}`, {
        method,
        headers: { Authorization: `Bearer ${token}` },
      });

      if (!res.ok) {
        const result = await res.json();
        throw new Error(result?.error || "操作失敗");
      }

      toast.success(isFav ? "已從最愛移除" : "已加入最愛");
      await fetchCourses(); // 確保畫面更新
    } catch (err) {
      toast.error("最愛更新失敗");
      console.error(err);
    }
  };


  const handleSearch = () => {
    setCurrentPage(1);
    setKeyword(searchInput);
  };

  const handleKeyDown = (e) => {
    if (e.key === "Enter") handleSearch();
  };

  const handleClearSearch = () => {
    setSearchInput("");
    setKeyword("");
    setCurrentPage(1);
  };

  const openFilter = () => {
    setPendingTags(selectedTags);
    setShowFilter(true);
  };

  const applyFilters = ({ tags, days, times, areas }) => {
    setSelectedTags(tags);
    setSelectedDays(days);
    setSelectedTimes(times);
    setSelectedAreas(areas);
    setCurrentPage(1);
    setShowFilter(false);
  };


  const handleFavoritesToggle = () => {
    setShowFavorites(prev => !prev);
    setCurrentPage(1);
  };

  const hasAnyFilters = activeFilters.length > 0;


  return (
    <section className="flex items-center justify-center w-full px-6 md:px-8 lg:px-20">
      <div className="flex flex-col w-full items-start gap-[40px] lg:gap-[86px] py-12">
        {/* Header + Search */}
        <div className="flex flex-col w-full gap-[20px]">
          <div className="flex flex-col md:flex-row items-center justify-between w-full">
            <header className="flex items-center">
              <h1 className="font-semibold text-black text-[35px] md:text-[45px]">Course</h1>
              <span className="ml-3 text-xl md:text-2xl text-black">課程列表</span>
            </header>
            <div className="flex flex-col md:flex-row items-center gap-[27px]">
              <div className="relative w-[220px] lg:w-[293px]">
                <Input
                  className="h-12 bg-[#dedede] rounded-[10px] pl-[10px] lg:pl-[25px] text-base lg:text-lg text-[#7c7c7c]"
                  placeholder="輸入欲搜尋的課程名稱"
                  value={searchInput}
                  onChange={(e) => setSearchInput(e.target.value)}
                  onKeyDown={handleKeyDown}
                />
                {hasAnyFilters ? (
                  <FunnelPlus
                    onClick={openFilter}
                    className="cursor-pointer absolute right-[10px] lg:right-[25px] top-1/2 transform -translate-y-1/2 w-[22px] h-[22px] text-[#AFC16D] hover:text-black"
                  />
                ) : (
                  <Funnel
                    onClick={openFilter}
                    className="cursor-pointer absolute right-[10px] lg:right-[25px] top-1/2 transform -translate-y-1/2 w-[22px] h-[22px] text-[#b0b0b0] hover:text-black"
                  />
                )}

              </div>
              <div className="flex gap-4">
                <Button
                  className="h-11 w-[86px] text-xl"
                  variant={!showFavorites ? "primary" : "outline"}
                  onClick={() => setShowFavorites(false)}
                >
                  全部
                </Button>
                {isLoggedIn && (
                  <Button
                    variant={showFavorites ? "primary" : "outline"}
                    className="h-11 w-[86px] text-xl"
                    onClick={handleFavoritesToggle}
                  >
                    最愛
                  </Button>
                )}
              </div>
            </div>
          </div>

          {/* 標籤列 */}
          {/* 標籤列 */}
          {hasAnyFilters && (
            <div className="flex flex-wrap gap-3 mt-0 mt-0 px-10">
              {activeFilters.map(({ label, type }) => (
                <div
                  key={`${type}-${label}`}
                  className="flex items-center bg-[#f0f0f0] text-black px-4 py-1 rounded-full text-sm font-medium"
                >
                  <span>{label}</span>
                  <X
                    className="ml-2 w-4 h-4 cursor-pointer text-gray-500 hover:text-black"
                    onClick={() => {
                      if (type === "tag") {
                        setSelectedTags(prev => prev.filter(t => t !== label));
                      } else if (type === "day") {
                        setSelectedDays(prev => prev.filter(d => d !== label));
                      } else if (type === "time") {
                        setSelectedTimes(prev => prev.filter(t => t !== label));
                      } else if (type === "area") {
                        setSelectedAreas(prev => prev.filter(a => a !== label));
                      }
                    }}
                  />
                </div>
              ))}
            </div>
          )}
        </div>

        <FilterModal
          visible={showFilter}
          onClose={() => setShowFilter(false)}
          selectedTags={pendingTags}
          setSelectedTags={setPendingTags}
          selectedDays={selectedDays}
          selectedTimes={selectedTimes}
          selectedAreas={selectedAreas}
          allAreas={allAreas}
          onApply={applyFilters}
          loading={loading}
        />


        {/* 課程卡片 */}
        {loading ? (
          <div className="w-full flex justify-center py-12">
            <CssLoader />
          </div>
        ) : (
          <div className="flex flex-col items-center gap-[75px] w-full md:w-5/6 mx-auto">
            <div className="grid grid-cols-1 lg:grid-cols-2 gap-x-[76px] gap-y-[76px] w-full">
              {courses.map(course => (
                <Card key={course.id} className="w-full max-w-[507px] mx-auto shadow-none bg-transparent border-none">
                  <CardContent className="flex flex-col items-center gap-[26px] p-0">
                    <div className="relative w-full h-[300px] md:h-[335px] bg-[#d9d9d9] rounded-[45px]">
                      <Link href={`course/${course.id}`}>
                        <Image
                          src={course.image?.trim() || "/images/course/course.jpg"}
                          alt="Course Image"
                          className="w-full h-full object-cover rounded-[45px]"
                          width={507}
                          height={335}
                        />
                      </Link>
                    </div>
                    <div className="flex items-start justify-between w-10/11">
                      <div className="flex flex-col w-[300px] items-start gap-[13px]">
                        <Link href={`course/${course.id}`}>
                          <h3 className="text-2xl font-bold text-black">{course.name}</h3>
                        </Link>
                        <div className="flex flex-wrap items-end gap-[13px_8px]">
                          {course.tags?.map((tag, idx) => (
                            <span key={idx} className="text-[13px] font-medium text-black">#{tag}</span>
                          ))}
                        </div>
                      </div>
                      <div className="flex flex-col items-end gap-2">
                        <div className="flex items-center gap-2">
                          <UserRound className="h-7 w-7" />
                          {course.coach?.id ? (
                            <Link
                              href={`/reservation/coach/${course.coach.id}`}
                              className="text-base font-bold text-black hover:text-[#7A8E7F] hover:underline"
                            >
                              {course.coach.name}
                            </Link>
                          ) : (
                            <span className="text-base font-bold text-gray-400">無教練資料</span>
                          )}
                        </div>

                        {isLoggedIn && (
                          <button
                            onClick={() => handleToggleFavorite(course.id, course.is_favorite)}
                            className="mr-2 cursor-pointer"
                            aria-label={course.is_favorite ? "移除最愛" : "加入最愛"}
                          >
                            <Heart
                              className={`h-7 w-7 transition-all duration-200 ${course.is_favorite ? "fill-[#AFC16D] text-[#AFC16D]" : "text-[#475569] cursor-pointer"
                                }`}
                            />
                          </button>
                        )}
                      </div>
                    </div>
                  </CardContent>
                </Card>
              ))}
            </div>

            <Pagination
              totalPages={totalPages}
              currentPage={currentPage}
              onPageChange={setCurrentPage}
            />
          </div>
        )}
      </div>
    </section>
  );
}
