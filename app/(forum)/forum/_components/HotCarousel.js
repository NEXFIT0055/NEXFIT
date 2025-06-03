import { useRef, useEffect, useState } from "react";
import Link from "next/link";

export default function HotCarousel() {
  const cardWidth = 220;
  const gap = 16;
  const visibleCards = 3;
  const containerRef = useRef(null);
  const [hotPosts, setHotPosts] = useState([]);
  const [loading, setLoading] = useState(true); // 新增 loading 狀態
  const [current, setCurrent] = useState(0);

  // 取得熱門文章
  useEffect(() => {
    fetch("/api/forum/hot")
      .then((res) => res.json())
      .then((data) => {
        setHotPosts(data);
        setLoading(false); // 載入完成
      })
      .catch(() => {
        setHotPosts([]);
        setLoading(false); // 載入完成
      });
  }, []);

  // 自動輪播
  useEffect(() => {
    if (hotPosts.length === 0) return;
    let timer;
    function autoScroll() {
      let next = current + visibleCards;
      if (next * (cardWidth + gap) >= hotPosts.length * (cardWidth + gap)) {
        next = 0;
      }
      setCurrent(next);
      timer = setTimeout(autoScroll, 3000);
    }
    timer = setTimeout(autoScroll, 3000);
    return () => clearTimeout(timer);
  }, [current, hotPosts.length]);

  // 滾動效果
  useEffect(() => {
    if (!containerRef.current) return;
    containerRef.current.scrollTo({
      left: current * (cardWidth + gap),
      behavior: "smooth",
    });
  }, [current]);

  // 箭頭點擊
  const handlePrev = () => {
    setCurrent((prev) => Math.max(prev - visibleCards, 0));
  };
  const handleNext = () => {
    let next = current + visibleCards;
    if (next * (cardWidth + gap) >= hotPosts.length * (cardWidth + gap)) {
      next = 0;
    }
    setCurrent(next);
  };
  // 載入中骨架屏
  if (loading) {
    return (
      <div
        className="flex gap-4 justify-center"
        style={{
          width: `${cardWidth * visibleCards + gap * (visibleCards - 1)}px`,
          margin: "0 auto",
        }}
      >
        {Array.from({ length: visibleCards }).map((_, index) => (
          <div
            key={index}
            className="flex-shrink-0 w-[220px] h-[250px] bg-white rounded-lg shadow-md p-4 animate-pulse"
          >
            <div className="w-full h-32 bg-gray-200 rounded-md"></div>
            <div className="mt-2 h-4 bg-gray-200 rounded"></div>
            <div className="mt-2 h-4 bg-gray-200 rounded w-3/4"></div>
          </div>
        ))}
      </div>
    );
  }
  // 無熱門文章
  if (hotPosts.length === 0) {
    return (
      <div className="w-full flex items-center justify-center h-40 text-gray-400">
        暫無熱門文章
      </div>
    );
  }

  return (
    <div
      className="relative flex items-center justify-center"
      style={{
        width: `${cardWidth * visibleCards + gap * (visibleCards - 1)}px`,
        margin: "0 auto",
      }}
    >
      {/* 左箭頭 */}
      <button
        onClick={handlePrev}
        className="absolute left-0 z-10 bg-white rounded-full shadow p-2 hover:bg-gray-100"
        style={{ transform: "translateX(-50%)" }}
        aria-label="上一頁"
      >
        <svg width="24" height="24" fill="none" stroke="currentColor"><path d="M15 19l-7-7 7-7" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"/></svg>
      </button>
      {/* 輪播區 */}
      <div
        className="overflow-x-hidden"
        ref={containerRef}
        style={{
          width: `${cardWidth * visibleCards + gap * (visibleCards - 1)}px`,
        }}
      >
        <div
          className="flex gap-4 py-2 min-w-0"
          style={{
            scrollSnapType: "x mandatory",
          }}
        >
          {hotPosts.map((post) => (
            <Link
              key={post.id}
              href={`/forum/post/${post.id}`}
              className="flex-shrink-0 bg-white rounded-lg shadow-md p-4 hover:shadow-lg transition-shadow"
              style={{
                width: `${cardWidth}px`,
                scrollSnapAlign: "start",
                textDecoration: "none",
                color: "inherit",
              }}
            >
              <img
                src={post.image || "/images/default.jpg"}
                alt={post.title}
                className="w-full h-32 object-cover rounded-md"
              />
              <h4 className="mt-2 font-semibold line-clamp-2">{post.title}</h4>
              <div className="text-xs text-gray-500 mt-1">瀏覽數：{post.views}</div>
            </Link>
          ))}
        </div>
      </div>
      {/* 右箭頭 */}
      <button
        onClick={handleNext}
        className="absolute right-0 z-10 bg-white rounded-full shadow p-2 hover:bg-gray-100"
        style={{ transform: "translateX(50%)" }}
        aria-label="下一頁"
      >
        <svg width="24" height="24" fill="none" stroke="currentColor"><path d="M9 5l7 7-7 7" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"/></svg>
      </button>
    </div>
  );
}