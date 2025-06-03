"use client";
import Link from "next/link";
import { use, useEffect, useState, useRef } from "react";
import {
  FaRegEdit,
  FaHeart,
  FaBoxOpen,
  FaTrophy,
  FaThumbsUp,
  FaPen,
  FaTrashAlt,
  FaMedal,
  FaCheck,
  FaEye,
  FaArrowLeft,
  FaTag,
} from "react-icons/fa";
import { Button } from "@/app/components/ui/button";
import {
  AlertDialog,
  AlertDialogTrigger,
  AlertDialogContent,
  AlertDialogHeader,
  AlertDialogTitle,
  AlertDialogDescription,
  AlertDialogFooter,
  AlertDialogCancel,
  AlertDialogAction,
} from "@/app/components/ui/alert-dialog";
import CssLoader from "@/app/(main)/shop/cart/_components/css-loader"; // 引入 CssLoader

export default function ForumAccount({ params }) {
  const { id } = use(params); // 這裡用 use(params) 解構 id

  const [activeTab, setActiveTab] = useState("我的文章");
  const [userData, setUserData] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [selectedPostId, setSelectedPostId] = useState(null); // 用於存儲要刪除的文章 ID
  const [deleteError, setDeleteError] = useState(null); // 用於存儲刪除失敗的錯誤訊息
  const [deleteSuccess, setDeleteSuccess] = useState(false); // 用於存儲刪除成功的狀態
  const inputRef = useRef(null); // 用於控制輸入框的焦點

  useEffect(() => {
    const fetchUserData = async () => {
      try {
        const res = await fetch(`/api/forum/account/${id}`);
        if (!res.ok) {
          throw new Error("無法獲取使用者資料");
        }
        const data = await res.json();
        if (data.error) {
          throw new Error(data.error);
        }
        setUserData(data);
      } catch (err) {
        setError(err.message);
      } finally {
        setLoading(false);
      }
    };

    fetchUserData();
  }, [id]);

  const handleDeletePost = async () => {
    try {
      const res = await fetch(`/api/forum/post/${selectedPostId}`, {
        method: "DELETE",
      });

      if (!res.ok) {
        const errorData = await res.json();
        throw new Error(errorData.error || "刪除文章失敗");
      }

      setDeleteSuccess(true); // 設置刪除成功的狀態
      setUserData((prevData) => ({
        ...prevData,
        posts: prevData.posts.filter((post) => post.id !== selectedPostId),
      }));
      setSelectedPostId(null); // 清除選中的文章 ID
    } catch (err) {
      setDeleteError(err.message); // 設置刪除失敗的錯誤訊息
    }
  };

  if (loading) {
    return (
      <div className="flex justify-center items-center h-screen">
        <CssLoader /> {/* 使用動畫載入樣式 */}
      </div>
    );
  }
  if (error) return <div>錯誤：{error}</div>;

  const { user, posts, stats } = userData;

  const menuItems = [
    {
      label: "我的文章",
      icon: <FaRegEdit className="text-2xl text-[#AFC16D]" />,
    },
    { label: "收藏文章", icon: <FaTag className="text-2xl text-[#AFC16D]" /> },
    {
      label: "草稿箱",
      icon: <FaBoxOpen className="text-2xl text-[#AFC16D]" />,
    },
    {
      label: "發文成就",
      icon: <FaTrophy className="text-2xl text-[#AFC16D]" />,
    },
  ];

  // 新增一個安全取得頭像的函式
  function getAvatarUrl(avatarUrl) {
    // 判斷為空字串、null、undefined 或不是 http(s) 開頭且檔案不存在時 fallback
    if (
      !avatarUrl ||
      typeof avatarUrl !== "string" ||
      avatarUrl.trim() === "" ||
      avatarUrl === "null" ||
      avatarUrl === "undefined"
    ) {
      return "/images/avatars/default-avatar.jpg";
    }
    // 強制將 http 換成 https
    if (avatarUrl.startsWith("http://")) {
      return avatarUrl.replace("http://", "https://");
    }
    return avatarUrl;
  }

  return (
    <div className="w-full mx-auto px-10 py-6 space-y-10">
      {/* 返回論壇主頁按鈕 */}
      <div className="text-left">
        <Link href="/forum">
          <Button
            variant="outline"
            size="sm"
            className="flex items-center gap-2"
          >
            <FaArrowLeft className="text-sm" />
            返回論壇主頁
          </Button>
        </Link>
      </div>
      {/* 頭像資訊卡片 */}
      <div className="bg-[#101828] text-[#FBF9FA] rounded-xl shadow-md p-8 text-center">
        {/* 外層 flex 讓頭像完全置中 */}
        <div className="flex justify-center">
          <div className="w-[100px] h-[100px] rounded-full overflow-hidden border-4 border-white shadow flex items-center justify-center">
            <img
              src={getAvatarUrl(user.avatar_url)}
              alt={user.nickname || "頭像"}
              width={100}
              height={100}
              className="object-cover w-full h-full"
              onError={(e) => {
                // 只要不是預設圖才 fallback，避免無限觸發
                if (!e.target.src.includes("/images/avatars/default-avatar.jpg")) {
                  e.target.src = "/images/avatars/default-avatar.jpg";
                }
              }}
            />
          </div>
        </div>
        <h2 className="mt-4 text-2xl font-bold">{user.name || "使用者"}</h2>
        <div className="mt-2 relative flex justify-center items-center">
          <span className="text-sm text-gray-300 block text-center">
            {user.nickname}
          </span>
        </div>

        <div className="grid grid-cols-3 gap-4 text-center text-sm text-white/90 mt-4">
          <div className="flex flex-col items-center">
            <FaRegEdit className="text-xl mb-1 text-[#AFC16D]" />
            <span>發文數</span>
            <span className="font-semibold">{stats.post_count}</span>
          </div>
          <div className="flex flex-col items-center">
            <FaHeart className="text-xl mb-1 text-[#AFC16D]" />
            <span>按讚數</span>
            <span className="font-semibold">{stats.like_count || 0}</span>
          </div>
          <div className="flex flex-col items-center">
            <FaEye className="text-xl mb-1 text-[#AFC16D]" />
            <span>瀏覽數</span>
            <span className="font-semibold">{stats.view_count || 0}</span>
          </div>
        </div>
      </div>

      {/* 四個橫向按鈕選單 */}
      <div className="grid grid-cols-2 sm:grid-cols-4 gap-4">
        {menuItems.map((item) => (
          <Button
            key={item.label}
            onClick={() => setActiveTab(item.label)}
            variant={activeTab === item.label ? "default" : "outline"}
            className="flex flex-col items-center justify-center h-20 py-4 gap-2 text-sm rounded-lg cursor-pointer"
          >
            {item.icon}
            {item.label}
          </Button>
        ))}
      </div>

      {/* 主內容區 */}
      <div className="space-y-6">
        <h3 className="text-xl font-bold">{activeTab}</h3>

        {activeTab === "我的文章" && (
          <div className="space-y-6">
            {posts.map((post) => (
              <div
                key={post.id}
                className="bg-white rounded-xl shadow p-4 flex gap-4 items-center justify-between"
              >
                <div className="flex gap-4 items-center">
                  <img
                    src={post.images?.[0] || "/images/default-post.jpg"}
                    alt={post.title}
                    className="w-32 h-24 object-cover rounded-lg"
                  />
                  <div>
                    <h4 className="font-semibold">{post.title}</h4>
                    <p className="text-sm text-gray-600">
                      {post.content.slice(0, 100)}...
                    </p>
                  </div>
                </div>
                <div className="flex flex-col gap-2 text-sm">
                  <Link href={`/forum/edit/${post.id}`}>
                    <Button
                      variant="outline"
                      size="sm"
                      className="w-24 h-9 py-4 cursor-pointer"
                    >
                      <FaPen /> 編輯
                    </Button>
                  </Link>
                  <AlertDialog>
                    <AlertDialogTrigger asChild>
                      <Button
                        onClick={() => setSelectedPostId(post.id)}
                        variant="default"
                        size="sm"
                        className="cursor-pointer"
                      >
                        <FaTrashAlt /> 刪除
                      </Button>
                    </AlertDialogTrigger>
                    <AlertDialogContent>
                      <AlertDialogHeader>
                        <AlertDialogTitle>確認刪除文章？</AlertDialogTitle>
                        <AlertDialogDescription>
                          您即將刪除文章「{post.title}
                          」。此操作無法復原，請確認是否繼續。
                        </AlertDialogDescription>
                      </AlertDialogHeader>
                      <AlertDialogFooter>
                        <AlertDialogCancel>取消</AlertDialogCancel>
                        <AlertDialogAction onClick={handleDeletePost}>
                          確認刪除
                        </AlertDialogAction>
                      </AlertDialogFooter>
                    </AlertDialogContent>
                  </AlertDialog>
                </div>
              </div>
            ))}
          </div>
        )}

        {activeTab === "收藏文章" && (
          <div className="space-y-6">
            {userData.favorites && userData.favorites.length > 0 ? (
              userData.favorites.map((post) => (
                <div
                  key={post.id}
                  className="bg-white rounded-xl shadow p-4 flex gap-4 items-center justify-between"
                >
                  <div className="flex gap-4 items-center">
                    <img
                      src={post.images?.[0] || "/images/default-post.jpg"}
                      alt={post.title}
                      className="w-32 h-24 object-cover rounded-lg"
                    />
                    <div>
                      <h4 className="font-semibold">{post.title}</h4>
                      <p className="text-sm text-gray-600">
                        {post.content.slice(0, 100)}...
                      </p>
                    </div>
                  </div>
                  <div className="flex flex-col gap-2 text-sm">
                    <Link href={`/forum/post/${post.id}`}>
                      <Button
                        variant="outline"
                        size="sm"
                        className="w-24 h-9 py-4"
                      >
                        <FaEye /> 查看
                      </Button>
                    </Link>
                  </div>
                </div>
              ))
            ) : (
              <div className="text-gray-500 text-sm italic">
                （尚未加入收藏文章）
              </div>
            )}
          </div>
        )}
        {activeTab === "草稿箱" && (
          <div className="text-gray-500 text-sm italic">（尚未有草稿內容）</div>
        )}
        {activeTab === "發文成就" && (
          <div className="bg-white p-4 rounded-xl shadow text-center flex items-center justify-center gap-2 text-gray-700">
            <FaMedal className="text-[#AFC16D] text-lg" />
            你已獲得 <strong>健筆如飛</strong>、<strong>日更小達人</strong> 等 3
            枚徽章！
          </div>
        )}
      </div>

      {/* 刪除成功的 AlertDialog */}
      {deleteSuccess && (
        <AlertDialog>
          <AlertDialogContent>
            <AlertDialogHeader>
              <AlertDialogTitle>刪除成功</AlertDialogTitle>
              <AlertDialogDescription>文章已成功刪除！</AlertDialogDescription>
            </AlertDialogHeader>
            <AlertDialogFooter>
              <AlertDialogAction onClick={() => setDeleteSuccess(false)}>
                確定
              </AlertDialogAction>
            </AlertDialogFooter>
          </AlertDialogContent>
        </AlertDialog>
      )}

      {/* 刪除失敗的 AlertDialog */}
      {deleteError && (
        <AlertDialog>
          <AlertDialogContent>
            <AlertDialogHeader>
              <AlertDialogTitle>刪除失敗</AlertDialogTitle>
              <AlertDialogDescription>{deleteError}</AlertDialogDescription>
            </AlertDialogHeader>
            <AlertDialogFooter>
              <AlertDialogAction onClick={() => setDeleteError(null)}>
                確定
              </AlertDialogAction>
            </AlertDialogFooter>
          </AlertDialogContent>
        </AlertDialog>
      )}
    </div>
  );
}