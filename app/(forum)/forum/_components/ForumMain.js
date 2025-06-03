"use client";
import HotCarousel from "@/app/(forum)/forum/_components/HotCarousel";
import PostList from "@/app/(forum)/forum/_components/PostList";
import { Button } from "@/app/components/ui/button";
import { useRef, useState, useEffect } from "react";

export default function ForumMain({
  posts: initialPosts,
  hotPosts,
  currentPage,
  setCurrentPage,
  activeCategory,
  setActiveCategory,
  postsPerPage,
  viewCounts,
  updateViewCount,
  collections = [],
  favorites = [],
  onCollection,
  onFavorite,
}) {
  const categories = ["全部", "運動", "健康", "營養", "其他"];
  const [searchInput, setSearchInput] = useState(""); // 輸入框內容
  const [searchQuery, setSearchQuery] = useState(""); // 真正搜尋用的關鍵字
  const inputRef = useRef(null);

  const [loading, setLoading] = useState(true); // 新增 loading 狀態
  const [posts, setPosts] = useState([]); // 新增 posts 狀態

  useEffect(() => {
    // 模擬 API 請求
    setTimeout(() => {
      if (initialPosts && initialPosts.length > 0) {
        setPosts(initialPosts);
        setLoading(false); // 確保 posts 有內容後再關閉 loading
      }
    }, 2000);
  }, [initialPosts]);

  // 點擊放大鏡時觸發
  function handleSearchClick() {
    setSearchQuery(searchInput); // 觸發搜尋
    if (inputRef.current) inputRef.current.focus();
    setCurrentPage(1); // 搜尋時回到第1頁
  }

  // 文章過濾（分類）
  const filteredPosts =
    activeCategory === "全部"
      ? posts
      : posts.filter(
          (post) =>
            post.category === activeCategory || post.tags?.includes(activeCategory)
        );

  // 再根據搜尋關鍵字過濾
  const searchedPosts = filteredPosts.filter(
    (post) =>
      post.title.toLowerCase().includes(searchQuery.toLowerCase()) ||
      post.content?.toLowerCase().includes(searchQuery.toLowerCase())
  );

  // 分頁
  const indexOfLastPost = currentPage * postsPerPage;
  const indexOfFirstPost = indexOfLastPost - postsPerPage;
  const currentPosts = searchedPosts.slice(indexOfFirstPost, indexOfLastPost);

  return (
    <main className="flex-1 space-y-8">
      <HotCarousel hotPosts={hotPosts} />

      {/* 分類與搜尋欄 */}
      <div className="flex flex-wrap gap-4 my-6 items-center">
        {/* 分類 tabs */}
        <div className="flex flex-wrap gap-2">
          {categories.map((cat) => (
            <Button
              key={cat}
              onClick={() => {
                setActiveCategory(cat);
                setCurrentPage(1); // 切換分類時重置到第 1 頁
              }}
              variant={activeCategory === cat ? "default" : "outline"}
              size="sm"
              className={`rounded-full ${
                activeCategory === cat ? "bg-black text-white" : "bg-gray-200 text-black"
              }`}
            >
              {cat}
            </Button>
          ))}
        </div>

        {/* 搜尋欄 + 放大鏡 */}
        <div className="flex-1 relative max-w-xs ml-auto">
          <input
            ref={inputRef}
            type="text"
            placeholder="搜尋文章..."
            value={searchInput}
            onChange={(e) => setSearchInput(e.target.value)}
            onKeyDown={(e) => {
              if (e.key === "Enter") handleSearchClick();
            }}
            className="w-full px-4 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-black pr-10"
          />
          <button
            type="button"
            className="absolute right-2 top-1/2 -translate-y-1/2 text-gray-500 hover:text-black"
            aria-label="搜尋"
            onClick={handleSearchClick}
          >
            <svg
              className="w-5 h-5"
              fill="none"
              stroke="currentColor"
              strokeWidth={2}
              viewBox="0 0 24 24"
            >
              <circle cx="11" cy="11" r="8" stroke="currentColor" />
              <line
                x1="21"
                y1="21"
                x2="16.65"
                y2="16.65"
                stroke="currentColor"
                strokeLinecap="round"
              />
            </svg>
          </button>
        </div>
      </div>

      {/* 文章列表 */}
      <PostList
        key={`${JSON.stringify(collections)}-${JSON.stringify(favorites)}`}
        posts={currentPosts}
        collections={collections}
        favorites={favorites}
        onCollection={onCollection}
        onFavorite={onFavorite}
        viewCounts={viewCounts}
        updateViewCount={updateViewCount}
        loading={loading}
      />
    </main>
  );
}