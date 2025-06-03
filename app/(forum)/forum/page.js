"use client";
import { useState, useEffect, useCallback } from "react";
import SidebarLeft from "@/app/(forum)/forum/_components/SidebarLeft";
import SidebarRight from "@/app/(forum)/forum/_components/SidebarRight";
import ForumMain from "@/app/(forum)/forum/_components/ForumMain";
import Pagination from "@/app/(forum)/forum/_components/Pagination";
import { FaRunning, FaChartLine, FaDumbbell, FaFire } from "react-icons/fa";

export default function ForumPage() {
  const [posts, setPosts] = useState([]);
  const [activeCategory, setActiveCategory] = useState("全部");
  const [currentPage, setCurrentPage] = useState(1);
  const [viewCounts, setViewCounts] = useState({});
  const [collections, setCollections] = useState([]);
  const [favorites, setFavorites] = useState([]);
  const postsPerPage = 3;

  const hotPosts = [
    { id: 1, title: "熱門文章1", image: "/images/forum/hot1.jpg" },
    { id: 2, title: "熱門文章2", image: "/images/forum/hot2.jpg" },
    { id: 3, title: "熱門文章3", image: "/images/forum/hot3.jpg" },
  ];

  const announcements = [
    { id: 1, title: "系統維護通知" },
    { id: 2, title: "新功能上線啦！" },
    { id: 3, title: "會員活動開跑" },
  ];

  const stats = [
    { icon: <FaRunning />, label: "運動時長", value: "4 小時" },
    { icon: <FaChartLine />, label: "進步程度", value: "+15%" },
    { icon: <FaDumbbell />, label: "訓練次數", value: "12 次" },
    { icon: <FaFire />, label: "消耗熱量", value: "1200 卡路里" },
  ];

  const upcomingEvents = [
    {
      date: "FEB 7",
      title: "路跑訓練",
      organizer: "John",
      tags: ["running", "fitness"],
    },
    {
      date: "FEB 3",
      title: "營養講座",
      organizer: "Tom",
      tags: ["nutrition", "forum"],
    },
    {
      date: "FEB 5",
      title: "皮拉提斯體驗課",
      organizer: "Alice",
      tags: ["yoga", "health"],
    },
  ];

  const achievements = [
    { label: "健康達成率", percent: 80 },
    { label: "健走小幫手", percent: 60 },
    { label: "進食紀錄王", percent: 90 },
    { label: "健身之王", percent: 10 },
  ];

  // 在 fetchUserCollections 外面使用 useCallback
  const fetchUserCollections = useCallback(async () => {
    const token = localStorage.getItem('token');
    if (!token) return [];
    
    try {
      const response = await fetch('/api/forum/favorite', {
        headers: { Authorization: `Bearer ${token}` }
      });
      if (response.ok) {
        const data = await response.json();
        return data.favorites.map(post => post.id);
      }
    } catch (error) {
      console.error('獲取收藏狀態失敗:', error);
    }
    return [];
  }, []);

  // 獲取用戶點讚過的文章
  const fetchUserLikes = useCallback(async () => {
    const token = localStorage.getItem('token');
    if (!token) return [];
    
    try {
      const response = await fetch('/api/forum/likes', {
        headers: { Authorization: `Bearer ${token}` }
      });
      if (response.ok) {
        const data = await response.json();
        return data.liked_posts || [];
      }
    } catch (error) {
      console.error('獲取點讚狀態失敗:', error);
    }
    return [];
  }, []);

  useEffect(() => {
    const fetchData = async () => {
      try {
        // 並行獲取文章、收藏狀態和點讚狀態
        const [postsResponse, collectionsData, likesData] = await Promise.all([
          fetch("/api/forum/post").then(res => res.json()),
          fetchUserCollections(),
          fetchUserLikes()
        ]);
        
        setPosts(postsResponse);
        setCollections(collectionsData);
        setFavorites(likesData); // 設置點讚狀態
      } catch (error) {
        console.error("獲取資料失敗:", error);
      }
    };

    fetchData();
  }, [fetchUserCollections, fetchUserLikes]);

  // 更新瀏覽次數
  const updateViewCount = async (postId) => {
    try {
      const response = await fetch(`/api/forum/post/${postId}/view`, {
        method: "POST",
      });
      if (!response.ok) throw new Error("Failed to update view count");
      const data = await response.json();
      setViewCounts((prev) => ({
        ...prev,
        [postId]: data.views,
      }));
    } catch (error) {
      console.error("Error updating view count:", error);
    }
  };

  // 熱門標籤點擊事件
  function handleTagClick(tag) {
    setActiveCategory(tag);
    setCurrentPage(1);
  }

  // 最後，添加渲染 forum 佈局的 return 語句
  return (
    <div className="flex flex-col min-h-screen">
      {/* 主要內容區塊 */}
      <div className="flex max-w-[1440px] mx-auto px-4 py-8 gap-8 flex-1 w-full">
        {/* 左側邊欄 */}
        <SidebarLeft onTagClick={handleTagClick} />

        {/* 中間主要內容區域 */}
        <div className="flex-1">
          <ForumMain
            hotPosts={hotPosts}
            posts={posts}
            currentPage={currentPage}
            setCurrentPage={setCurrentPage}
            activeCategory={activeCategory}
            setActiveCategory={setActiveCategory}
            postsPerPage={postsPerPage}
            viewCounts={viewCounts}
            updateViewCount={updateViewCount}
            collections={collections}
            favorites={favorites}
            onCollection={(postId) => {
              setCollections(prev => 
                prev.includes(postId) 
                  ? prev.filter(id => id !== postId) 
                  : [...prev, postId]
              );
            }}
            onFavorite={(postId, isFavorite) => {
              // 更新本地點讚狀態
              setFavorites(prev => 
                isFavorite
                  ? [...prev, postId]
                  : prev.filter(id => id !== postId)
              );
            }}
          />
          
          {/* 分頁器 */}
          <Pagination
            currentPage={currentPage}
            totalPages={Math.ceil(
              posts.filter(post => 
                activeCategory === "全部" || 
                post.category === activeCategory || 
                post.tags?.includes(activeCategory)
              ).length / postsPerPage
            )}
            onPageChange={setCurrentPage}
          />
        </div>

        {/* 右側邊欄 */}
        <SidebarRight
          announcements={announcements}
          stats={stats}
          upcomingEvents={upcomingEvents}
          achievements={achievements}
        />
      </div>
    </div>
  );
}