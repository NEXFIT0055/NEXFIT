"use client";

import { useEffect, useState, useCallback } from "react";
import { useParams, useRouter } from "next/navigation";
import {
  FaUser,
  FaCalendarAlt,
  FaHeart,
  FaTrash,
  FaTag,
  FaRegBookmark,
  FaBookmark,
  FaArrowLeft,
  FaSmile,
} from "react-icons/fa";
import { Button } from "@/app/components/ui/button";
import CssLoader from "@/app/(main)/shop/cart/_components/css-loader";
import {
  AlertDialog,
  AlertDialogTrigger,
  AlertDialogContent,
  AlertDialogHeader,
  AlertDialogFooter,
  AlertDialogTitle,
  AlertDialogDescription,
  AlertDialogAction,
  AlertDialogCancel,
} from "@/app/components/ui/alert-dialog";
import LoginModal from "@/app/components/login"; // 引入登入模態組件
import dynamic from "next/dynamic";

// 動態載入 @emoji-mart/react 的 Picker（default export）
const Picker = dynamic(() => import("@emoji-mart/react"), { ssr: false });

export default function ForumPostDetailPage() {
  const { id } = useParams();
  const router = useRouter();
  const [post, setPost] = useState(null);
  const [comments, setComments] = useState([]);
  const [commentContent, setCommentContent] = useState("");
  const [loading, setLoading] = useState(false);
  const [user, setUser] = useState(null);
  const [deleteTarget, setDeleteTarget] = useState(null);
  const [isCollected, setIsCollected] = useState(false); // 是否已收藏
  const [isLoginModalOpen, setIsLoginModalOpen] = useState(false); // 登入模態窗口狀態
  const [pendingAction, setPendingAction] = useState(null); // 待執行操作
  const [showEmoji, setShowEmoji] = useState(false);

  // 檢查登入狀態
  const checkLoginStatus = useCallback(() => {
    const token = localStorage.getItem("token");
    if (token) {
      try {
        const payload = JSON.parse(atob(token.split(".")[1]));
        // 預設 user 只存 userId
        setUser({ userId: payload.userId });
        // 再 fetch 用戶 profile
        fetch("/api/forum/user/profile", {
          headers: { Authorization: `Bearer ${token}` },
        })
          .then((res) => res.json())
          .then((data) => {
            setUser((prev) => ({
              ...prev,
              name: data.name,
              nickname: data.nickname,
            }));
          })
          .catch((error) => {
            console.error("獲取用戶資料失敗:", error);
          });
      } catch (error) {
        console.error("無法解析 token:", error);
        localStorage.removeItem("token");
        setUser(null);
      }
    } else {
      setUser(null);
    }
  }, []);

  // 檢查登入狀態
  useEffect(() => {
    checkLoginStatus();
  }, [checkLoginStatus]);

  // 監聽登入模態關閉，重新檢查登入狀態
  useEffect(() => {
    if (!isLoginModalOpen) {
      // 登入模態關閉後，延遲一下再檢查登入狀態，確保 localStorage 已更新
      setTimeout(() => {
        checkLoginStatus();
      }, 500);
    }
  }, [isLoginModalOpen, checkLoginStatus]);

  // 取得文章
  useEffect(() => {
    if (!id) return;
    fetch(`/api/forum/post/${id}`)
      .then((res) => {
        if (!res.ok) throw new Error("無法取得文章");
        return res.json();
      })
      .then((data) => setPost(data))
      .catch((err) => console.error("讀取文章失敗", err));
  }, [id]);

  // 檢查收藏狀態
  useEffect(() => {
    const checkCollectionStatus = async () => {
      const token = localStorage.getItem("token");
      if (!token || !id) return;

      try {
        const response = await fetch("/api/forum/favorite", {
          headers: { Authorization: `Bearer ${token}` },
        });

        if (response.ok) {
          const data = await response.json();
          const favoriteIds = data.favorites.map((item) => item.id);
          setIsCollected(favoriteIds.includes(Number(id)));
        }
      } catch (error) {
        console.error("獲取收藏狀態失敗:", error);
      }
    };

    checkCollectionStatus();
  }, [id]);

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
        // 延遲執行，確保用戶狀態已更新
        setTimeout(() => {
          if (user) {
            pendingAction();
            setPendingAction(null);
          }
        }, 600);
      }
    }
  }, [isLoginModalOpen, pendingAction, user]);

  // 處理收藏按鈕點擊
  const handleCollection = async () => {
    const performCollectionAction = async () => {
      try {
        const token = localStorage.getItem("token");
        if (!token || !id) return;

        const method = isCollected ? "DELETE" : "POST";

        // 立即在 UI 上更新狀態，提供即時反饋
        setIsCollected(!isCollected);

        const response = await fetch("/api/forum/favorite", {
          method,
          headers: {
            "Content-Type": "application/json",
            Authorization: `Bearer ${token}`,
          },
          body: JSON.stringify({ post_id: Number(id) }),
        });

        if (!response.ok) {
          // 如果請求失敗，還原狀態
          setIsCollected(isCollected);
          throw new Error("收藏操作失敗");
        }
      } catch (error) {
        console.error("收藏操作失敗:", error);
        // 如果出錯，還原狀態
        setIsCollected(isCollected);
      }
    };

    // 使用登入檢查機制
    requireLogin(performCollectionAction);
  };

  // 取得留言
  const fetchComments = useCallback(() => {
    if (!id) return;
    fetch(`/api/forum/post/${id}/comments`)
      .then((res) => res.json())
      .then((data) => setComments(data))
      .catch((err) => console.error("留言讀取失敗", err));
  }, [id]);

  useEffect(() => {
    fetchComments();
  }, [fetchComments]);

  // 修改留言提交邏輯
  const handleSubmit = async (e) => {
    e.preventDefault();

    // 檢查是否已登入
    if (!user) {
      setIsLoginModalOpen(true); // 改用統一的登入模態
      return;
    }

    if (!commentContent.trim()) {
      alert("請輸入留言內容");
      return;
    }

    setLoading(true);
    try {
      const token = localStorage.getItem("token");
      const res = await fetch(`/api/forum/post/${id}/comments`, {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
          Authorization: `Bearer ${token}`,
        },
        body: JSON.stringify({
          content: commentContent,
        }),
      });

      if (!res.ok) throw new Error("留言失敗");

      setCommentContent("");
      fetchComments();
    } catch (err) {
      alert("留言失敗");
      console.error("留言錯誤:", err);
    }
    setLoading(false);
  };

  // 刪除留言
  const handleDelete = async (commentId) => {
    setLoading(true);
    try {
      const token = localStorage.getItem("token");
      const res = await fetch(`/api/forum/post/${id}/comments`, {
        method: "DELETE",
        headers: {
          "Content-Type": "application/json",
          Authorization: `Bearer ${token}`,
        },
        body: JSON.stringify({ commentId }),
      });
      if (!res.ok) throw new Error("刪除失敗");
      fetchComments();
    } catch (err) {
      alert("刪除留言失敗");
    }
    setLoading(false);
    setDeleteTarget(null);
  };

  if (!post) {
    return (
      <div className="flex justify-center items-center py-20">
        <CssLoader /> {/* 使用動畫載入元件 */}
      </div>
    );
  }

  return (
    <div className="max-w-4xl mx-auto px-4 py-10 space-y-6">
      {isLoginModalOpen && (
        <LoginModal
          isOpen={isLoginModalOpen}
          onClose={() => setIsLoginModalOpen(false)}
        />
      )}

      {/* 主圖 */}
      <div className="w-full aspect-video bg-gray-200 rounded-lg overflow-hidden">
        {post.images?.length > 0 ? (
          <img
            src={post.images[0]}
            alt="主圖"
            className="w-full h-full object-cover"
          />
        ) : (
          <div className="flex items-center justify-center h-full text-gray-400">
            無圖片
          </div>
        )}
      </div>

      {/* 標題 */}
      <h1 className="text-3xl font-bold text-gray-900">{post.title}</h1>

      {/* 作者與資訊 */}
      <div className="flex items-center justify-between text-sm text-gray-600 border-b pb-4">
        <div className="flex items-center gap-4">
          <div className="flex items-center gap-1">
            <FaUser /> {post.author_name}
          </div>
          <div className="flex items-center gap-1">
            <FaCalendarAlt /> {new Date(post.created_at).toLocaleDateString()}
          </div>
          <div className="flex items-center gap-1">
            <FaHeart /> {post.likes} 喜歡
          </div>
        </div>
        <button
          onClick={handleCollection}
          className={`flex items-center gap-1 p-2 rounded-full hover:bg-gray-100 transition-colors duration-200 cursor-pointer ${
            isCollected ? "text-yellow-500" : "text-gray-400"
          }`}
          title={isCollected ? "取消收藏" : "加入收藏"}
        >
          {isCollected ? (
            <FaBookmark className="text-lg" />
          ) : (
            <FaRegBookmark className="text-lg" />
          )}
        </button>
      </div>

      {/* 標籤 */}
      {post.tags?.length > 0 && (
        <div className="flex items-center gap-2 mt-4">
          <FaTag className="text-gray-500" />
          {post.tags.map((tag, index) => (
            <span
              key={index}
              className="px-3 py-1 bg-gray-200 text-sm rounded-full"
            >
              {tag}
            </span>
          ))}
        </div>
      )}

      {/* 內文 */}
      <article className="prose prose-sm sm:prose lg:prose-lg max-w-none text-gray-800">
        {post.content}
      </article>

      {/* 留言區 */}
      <section className="mt-10">
        <h2 className="text-xl font-bold mb-4">留言區</h2>

        {user ? (
          // 已登入狀態的留言表單
          <form onSubmit={handleSubmit} className="mb-6 flex flex-col gap-2">
            <div className="flex items-center gap-2 mb-2 text-sm text-gray-600">
              <span>
                以 <strong>{user?.name || user?.nickname || "用戶"}</strong>{" "}
                的身份留言
              </span>
            </div>
            <div style={{ position: "relative" }}>
              <textarea
                placeholder="輸入你的留言..."
                className="border rounded-lg px-3 py-2 resize-none min-h-[100px] focus:ring-2 focus:ring-[#101828] focus:border-transparent pr-10"
                value={commentContent}
                onChange={(e) => setCommentContent(e.target.value)}
                disabled={loading}
                style={{ width: "100%" }}
              />
              <button
                type="button"
                onClick={() => setShowEmoji((v) => !v)}
                className="absolute bottom-3 right-3 text-2xl bg-transparent border-none cursor-pointer p-0 m-0 text-[#AFC16D]"
                tabIndex={-1}
                style={{ lineHeight: 1 }}
              >
                <FaSmile />
              </button>
              {showEmoji && (
                <div
                  style={{
                    position: "absolute",
                    zIndex: 10,
                    right: 0,
                    bottom: "2.5rem",
                  }}
                >
                  <Picker
                    onEmojiSelect={(emoji) =>
                      setCommentContent(commentContent + emoji.native)
                    }
                    title="選擇表情"
                  />
                </div>
              )}
            </div>
            <Button
              type="submit"
              variant="default"
              size="default"
              className="self-end rounded-lg px-6 py-2 cursor-pointer"
              disabled={loading || !commentContent.trim()}
            >
              {loading ? "送出中..." : "送出留言"}
            </Button>
          </form>
        ) : (
          // 未登入狀態的提示
          <div className="mb-6 p-4 bg-gray-50 rounded-lg border">
            <p className="text-gray-600 text-center">
              <Button
                onClick={() => setIsLoginModalOpen(true)} // 改用統一的登入模態
                className="bg-[#101828] hover:bg-gray-700 text-white"
              >
                登入
              </Button>
              後即可留言
            </p>
          </div>
        )}

        <div className="space-y-4">
          {comments.length === 0 && (
            <div className="text-gray-400 text-center py-8">目前沒有留言</div>
          )}
          {comments.map((c) => (
            <div
              key={c.id}
              className="border-b pb-4 flex justify-between items-start"
            >
              <div className="flex-1">
                <div className="flex items-center gap-2 mb-1">
                  <span className="text-sm font-semibold text-gray-800">
                    {c.author_name || c.author}
                  </span>
                  <span className="text-xs text-gray-400">
                    {new Date(c.created_at).toLocaleString()}
                  </span>
                </div>
                <div className="text-gray-600 break-words">{c.content}</div>
              </div>
              <AlertDialog>
                <AlertDialogTrigger asChild>
                  <button
                    className={`ml-4 p-1 flex items-center bg-transparent border-none shadow-none focus:outline-none focus:ring-0 active:bg-transparent transition-colors duration-150 group ${
                      user && String(c.user_id) === String(user.userId)
                        ? "text-gray-500 cursor-pointer"
                        : "text-gray-300 cursor-not-allowed"
                    }`}
                    style={{
                      background: "none",
                      boxShadow: "none",
                      border: "none",
                    }}
                    onClick={() =>
                      user && String(c.user_id) === String(user.userId)
                        ? setDeleteTarget(c.id)
                        : null
                    }
                    disabled={
                      !(user && String(c.user_id) === String(user.userId)) ||
                      loading
                    }
                    title="刪除留言"
                    type="button"
                  >
                    <FaTrash className="transition-colors duration-150 group-hover:text-[#101828]" />
                  </button>
                </AlertDialogTrigger>
                <AlertDialogContent>
                  <AlertDialogHeader>
                    <AlertDialogTitle>確定要刪除這則留言嗎？</AlertDialogTitle>
                    <AlertDialogDescription>
                      此操作無法復原，刪除後留言將永久消失。
                    </AlertDialogDescription>
                  </AlertDialogHeader>
                  <AlertDialogFooter>
                    <AlertDialogCancel>取消</AlertDialogCancel>
                    <AlertDialogAction
                      onClick={() => handleDelete(deleteTarget)}
                      disabled={loading}
                    >
                      {loading ? "刪除中..." : "確定刪除"}
                    </AlertDialogAction>
                  </AlertDialogFooter>
                </AlertDialogContent>
              </AlertDialog>
            </div>
          ))}
        </div>
      </section>

      {/* 返回按鈕 */}
      <div className="mt-10 text-right">
        <Button
          type="button"
          variant="outline"
          size="md"
          className="px-6 py-2 text-black border-black hover:bg-gray-100 rounded-md flex items-center gap-2 cursor-pointer"
          onClick={() => router.push("/forum")}
        >
          <FaArrowLeft className="inline" />
          返回論壇主頁
        </Button>
      </div>
    </div>
  );
}
