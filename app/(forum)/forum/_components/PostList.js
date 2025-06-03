import Link from 'next/link';
import { useState, useEffect, useCallback } from 'react';
import LoginModal from '@/app/components/login';

function formatDate(dateString) {
  const options = { year: "numeric", month: "long", day: "numeric", hour: "2-digit", minute: "2-digit" };
  return new Date(dateString).toLocaleDateString("zh-TW", options);
}

export default function PostList({
  posts,
  onCollection,
  onFavorite,
  favorites = [],
  collections = [],
  viewCounts = {},
  updateViewCount,
  loading = false, // 新增 loading prop
}) {
  const [favoritesState, setFavoritesState] = useState(favorites);
  const [collectionsState, setCollectionsState] = useState(collections);
  const [isLoginModalOpen, setIsLoginModalOpen] = useState(false);
  const [pendingAction, setPendingAction] = useState(null);

  // 監聽 collections 變化，但用深度比較避免無限循環
  useEffect(() => {
    // 檢查內容是否真的不同
    const collectionsSet = new Set(collections);
    const stateSet = new Set(collectionsState);
    
    if (collectionsSet.size !== stateSet.size || 
        ![...collectionsSet].every(x => stateSet.has(x))) {
      setCollectionsState(collections);
    }
  }, [collections, collectionsState]);

  // 監聽 favorites 變化
  useEffect(() => {
    const favoritesSet = new Set(favorites);
    const stateSet = new Set(favoritesState);
    
    if (favoritesSet.size !== stateSet.size || 
        ![...favoritesSet].every(x => stateSet.has(x))) {
      setFavoritesState(favorites);
    }
  }, [favorites, favoritesState]);

  // 登入檢查與自動執行功能
  const requireLogin = useCallback((action) => {
    const token = localStorage.getItem("token");
    if (!token) {
      setPendingAction(() => action);
      setIsLoginModalOpen(true);
      return false;
    }
    action(); // 這行是關鍵
    return true;
  }, []);

  // 監聽登入狀態變化，登入後自動執行上次的操作
  useEffect(() => {
    if (!isLoginModalOpen && pendingAction) {
      const token = localStorage.getItem("token");
      if (token) {
        pendingAction();
        setPendingAction(null);
      }
    }
  }, [isLoginModalOpen, pendingAction]);

  // 處理最愛按鈕點擊
  async function handleFavorite(postId) {
    // 具體的點讚行為
    const performLikeAction = async () => {
      try {
        const isFavorite = favoritesState.includes(postId);
        const action = isFavorite ? "unlike" : "like";
        
        // 立即在 UI 上更新狀態，提供即時反饋
        if (action === "like") {
          setFavoritesState((prev) => [...prev, postId]);
          onFavorite?.(postId, true); // 通知父組件更新
        } else {
          setFavoritesState((prev) => prev.filter((id) => id !== postId));
          onFavorite?.(postId, false); // 通知父組件更新
        }
        
        const token = localStorage.getItem("token");
        if (!token) return; // 沒有 token 就不繼續執行
    
        const response = await fetch('/api/forum/likes', {
          method: 'POST',
          headers: { 
            'Content-Type': 'application/json',
            'Authorization': `Bearer ${token}`
          },
          body: JSON.stringify({
            post_id: postId,
            action: action,
          }),
        });
    
        const result = await response.json();
        if (!result.success) {
          // 如果 API 請求失敗，還原狀態
          if (action === "like") {
            setFavoritesState((prev) => prev.filter((id) => id !== postId));
            onFavorite?.(postId, false); // 通知父組件還原狀態
          } else {
            setFavoritesState((prev) => [...prev, postId]);
            onFavorite?.(postId, true); // 通知父組件還原狀態
          }
        }
      } catch (error) {
        console.error('更新最愛失敗:', error);
        // 請求出錯，還原狀態
        const isFavorite = favoritesState.includes(postId);
        if (isFavorite) {
          setFavoritesState((prev) => prev.filter((id) => id !== postId));
          onFavorite?.(postId, false); // 通知父組件還原狀態
        } else {
          setFavoritesState((prev) => [...prev, postId]);
          onFavorite?.(postId, true); // 通知父組件還原狀態
        }
      }
    };

    // 使用登入檢查機制
    requireLogin(performLikeAction);
  }

  // 處理收藏按鈕點擊
  async function handleCollection(postId) {
    const performCollectionAction = async () => {
      try {
        const isCollected = collectionsState.includes(postId);
        const method = isCollected ? 'DELETE' : 'POST';
        const response = await fetch('/api/forum/favorite', {
          method,
          headers: {
            'Content-Type': 'application/json',
            'Authorization': `Bearer ${localStorage.getItem('token') || ''}`
          },
          body: JSON.stringify({ post_id: postId }),
        });
        const result = await response.json();
        if (response.ok) {
          if (method === 'POST') {
            setCollectionsState((prev) => [...prev, postId]);
          } else {
            setCollectionsState((prev) => prev.filter((id) => id !== postId));
          }
          onCollection?.(postId);
        } else {
          alert(result.error || '收藏操作失敗');
        }
      } catch (error) {
        console.error('更新收藏失敗:', error);
      }
    };

    // 加上登入檢查
    requireLogin(performCollectionAction);
  }
  // 骨架屏
  if (loading) {
    return (
      <div className="flex flex-col gap-6">
        {Array.from({ length: 3 }).map((_, index) => (
          <div
            key={index}
            className="bg-white p-6 rounded-lg shadow animate-pulse"
          >
            <div className="w-full h-52 bg-gray-200 rounded-lg mb-4"></div>
            <div className="flex items-center gap-3 mb-3">
              <div className="w-10 h-10 bg-gray-200 rounded-full"></div>
              <div className="flex-1">
                <div className="h-4 bg-gray-200 rounded w-1/2 mb-2"></div>
                <div className="h-3 bg-gray-200 rounded w-1/3"></div>
              </div>
            </div>
            <div className="h-6 bg-gray-200 rounded mb-3"></div>
            <div className="flex gap-2">
              <div className="h-4 bg-gray-200 rounded w-10"></div>
              <div className="h-4 bg-gray-200 rounded w-16"></div>
            </div>
          </div>
        ))}
      </div>
    );
  }
  return (
    <>
      {isLoginModalOpen && (
        <LoginModal isOpen={isLoginModalOpen} onClose={() => setIsLoginModalOpen(false)} />
      )}
      <div className="flex flex-col gap-6">
        {posts.map((post) => {
          // 安全解析圖片
          const parsedImages = Array.isArray(post.images) 
            ? post.images 
            : JSON.parse(post.images || '[]');
          const imageUrl = parsedImages.length > 0 ? parsedImages[0] : '';
          const avatarUrl = post.avatar_url || '/uploads/forum/avatars/default.jpg';

          // 解析 tags 欄位（如果 API 沒有先解析）
          let tags = [];
          if (Array.isArray(post.tags)) {
            tags = post.tags;
          } else if (typeof post.tags === 'string' && post.tags.trim() !== '') {
            try {
              tags = JSON.parse(post.tags);
            } catch {
              tags = [];
            }
          }

          return (
            <div key={post.id} className="bg-white p-6 rounded-lg shadow hover:shadow-md transition-shadow duration-200">
              {/* 文章連結區域 */}
              <Link
                href={`/forum/post/${post.id}`}
                className="block"
                onClick={() => updateViewCount && updateViewCount(post.id)}
              >
                {/* 文章封面圖片 */}
                {imageUrl && (
                  <img
                    src={imageUrl}
                    alt={post.title}
                    className="w-full h-52 object-cover rounded-lg mb-4"
                  />
                )}

                {/* 作者資訊與發文時間 */}
                <div className="flex items-center justify-between mb-3">
                  <div className="flex items-center gap-3">
                    <img
                      src={avatarUrl}
                      alt={post.author_name}
                      className="w-10 h-10 rounded-full object-cover border"
                    />
                    <div>
                      <span className="text-sm font-medium text-gray-800">{post.author_name}</span>
                      <div className="text-xs text-gray-500">{formatDate(post.created_at)}</div>
                    </div>
                  </div>
                </div>

                {/* 文章標題與內文 */}
                <h3 className="text-xl font-bold mb-1">{post.title}</h3>
                <p className="text-gray-600 text-sm">{post.content?.slice(0, 100)}...</p>

                {/* 標籤區塊（內文下方、統計資訊上方） */}
                {Array.isArray(tags) && tags.length > 0 && (
                  <div className="flex flex-wrap gap-2 my-2">
                    {tags.map((tag, idx) => (
                      <span
                        key={idx}
                        className="inline-block bg-gray-200 text-gray-700 text-xs px-2 py-1 rounded-full"
                      >
                        #{tag}
                      </span>
                    ))}
                  </div>
                )}
              </Link>

              {/* 最愛和收藏按鈕 - 放在連結區域外，避免點擊按鈕時觸發文章跳轉 */}
              <div className="flex items-center justify-between mt-4">
                {/* 文章統計資訊 */}
                <div className="flex items-center gap-4 text-sm text-gray-500">
                  <span className="flex items-center gap-1">
                    <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                      <path
                        strokeLinecap="round"
                        strokeLinejoin="round"
                        strokeWidth="2"
                        d="M15 12a3 3 0 11-6 0 3 3 0 016 0z"
                      />
                      <path
                        strokeLinecap="round"
                        strokeLinejoin="round"
                        strokeWidth="2"
                        d="M2.458 12C3.732 7.943 7.523 5 12 5c4.478 0 8.268 2.943 9.542 7-1.274 4.057-5.064 7-9.542 7-4.477 0-8.268-2.943-9.542-7z"
                      />
                    </svg>
                    {viewCounts[post.id] ?? post.views ?? 0}
                  </span>
                  <span className="flex items-center gap-1">
                    <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                      <path
                        strokeLinecap="round"
                        strokeLinejoin="round"
                        strokeWidth="2"
                        d="M8 12h.01M12 12h.01M16 12h.01M21 12c0 4.418-4.03 8-9 8a9.863 9.863 0 01-4.255-.949L3 20l1.395-3.72C3.512 15.042 3 13.574 3 12c0-4.418 4.03-8 9-8s9 3.582 9 8z"
                      />
                    </svg>
                    {/* 留言數顯示 */}
                    {post.comment_count ?? 0}
                  </span>
                </div>

                {/* 最愛和收藏按鈕 */}
                <div className="flex items-center gap-2">
                  {/* 最愛按鈕 */}
                  <button
                    onClick={(e) => {
                      e.preventDefault();
                      handleFavorite(post.id);
                    }}
                    className="p-2 rounded-full hover:bg-gray-100 transition-colors duration-200 cursor-pointer"
                    style={{
                      color: favoritesState.includes(post.id) ? '#AFC16D' : '#A9A9A9', // 自訂顏色
                    }}
                    aria-label={favoritesState.includes(post.id) ? '取消最愛' : '加入最愛'}
                  >
                    <svg
                      className="w-5 h-5"
                      fill={favoritesState.includes(post.id) ? 'currentColor' : 'none'}
                      stroke="currentColor"
                      viewBox="0 0 24 24"
                    >
                      <path
                        strokeLinecap="round"
                        strokeLinejoin="round"
                        strokeWidth="2"
                        d="M4.318 6.318a4.5 4.5 0 000 6.364L12 20.364l7.682-7.682a4.5 4.5 0 00-6.364-6.364L12 7.636l-1.318-1.318a4.5 4.5 0 00-6.364 0z"
                      />
                    </svg>
                  </button>

                  {/* 收藏按鈕 */}
                  <button
                    onClick={(e) => {
                      e.preventDefault();
                      handleCollection(post.id);
                    }}
                    className={`p-2 rounded-full hover:bg-gray-100 transition-colors duration-200 cursor-pointer ${
                      collectionsState.includes(post.id) ? 'text-yellow-500' : 'text-gray-400'
                    }`}
                    aria-label={collectionsState.includes(post.id) ? '取消收藏' : '加入收藏'}
                  >
                    <svg
                      className="w-5 h-5"
                      fill={collectionsState.includes(post.id) ? 'currentColor' : 'none'}
                      stroke="currentColor"
                      viewBox="0 0 24 24"
                    >
                      <path
                        strokeLinecap="round"
                        strokeLinejoin="round"
                        strokeWidth="2"
                        d="M5 5a2 2 0 012-2h10a2 2 0 012 2v16l-7-3.5L5 21V5z"
                      />
                    </svg>
                  </button>
                </div>
              </div>
            </div>
          );
        })}
      </div>
    </>
  );
}