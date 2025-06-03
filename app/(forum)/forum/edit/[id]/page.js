"use client";

import { useState, useEffect, useRef } from "react";
import { useParams, useRouter } from "next/navigation";
import {
  FaPen,
  FaThumbtack,
  FaScroll,
  FaCheckCircle,
  FaSave,
  FaSpinner,
  FaCheck,
  FaTimes,
  FaExclamationTriangle,
  FaRegSmile,
  FaRegImage,
  FaRegListAlt,
  FaChevronDown,
  FaArrowLeft,
} from "react-icons/fa";
import {
  Popover,
  PopoverContent,
  PopoverTrigger,
} from "@/app/components/ui/popover";
import { Button } from "@/app/components/ui/button";
import CssLoader from "@/app/(main)/shop/cart/_components/css-loader"; // 引入 CssLoader
import { cn } from "@/lib/utils";
import Link from "next/link";

const CATEGORY_OPTIONS = [
  { value: "運動", label: "運動" },
  { value: "營養", label: "營養" },
  { value: "健康", label: "健康" },
  { value: "其他", label: "其他" },
];

export default function EditPostPage() {
  const { id } = useParams();
  const router = useRouter();
  const [post, setPost] = useState(null);
  const [image, setImage] = useState(null);
  const [tagInput, setTagInput] = useState("");
  const [saveStatus, setSaveStatus] = useState(
    <>
      <FaCheck className="text-[#AFC16D]" /> 已儲存
    </>
  );
  const [isDirty, setIsDirty] = useState(false);
  const [toast, setToast] = useState("");
  const [popoverOpen, setPopoverOpen] = useState(false);
  const [menuWidth, setMenuWidth] = useState(null);
  const triggerRef = useRef(null);
  const [isLoggedIn, setIsLoggedIn] = useState(false);
  const [checkingAuth, setCheckingAuth] = useState(true);
  const [isOwner, setIsOwner] = useState(false);
  const [isLoading, setIsLoading] = useState(true); // 新增載入狀態

  // 檢查登入狀態
  useEffect(() => {
    const token = localStorage.getItem('token');
    if (!token) {
      router.push('/forum');
      return;
    }
    setIsLoggedIn(true);
    setCheckingAuth(false);
  }, [router]);

  // 獲取文章時也要檢查權限
  useEffect(() => {
    if (!isLoggedIn) return;
    
    const token = localStorage.getItem('token');
    setIsLoading(true); // 開始載入時設置狀態
    
    fetch(`/api/forum/edit/${id}`, {
      headers: { Authorization: `Bearer ${token}` }
    })
      .then((res) => {
        if (!res.ok) {
          throw new Error("找不到貼文或無權限編輯");
        }
        return res.json();
      })
      .then((data) => {
        console.log("原始資料:", data);
        setPost(data);
        
        let initialImage = null;
        if (data.image) {
          initialImage = data.image;
        } else if (data.images && Array.isArray(data.images) && data.images.length > 0) {
          initialImage = data.images[0];
        }
        
        setImage(initialImage);
        setIsOwner(true);
      })
      .catch((error) => {
        console.error("載入文章失敗:", error);
        setPost(null);
        setIsOwner(false);
      })
      .finally(() => {
        setIsLoading(false); // 無論成功失敗都結束載入狀態
      });
  }, [id, isLoggedIn]);

  useEffect(() => {
    if (!post) return;
    if (isDirty) {
      setSaveStatus(
        <>
          <FaSpinner className="animate-spin" /> 儲存中...
        </>
      );
      const timeout = setTimeout(() => {
        setSaveStatus(
          <>
            <FaCheck className="text-green-500" /> 已儲存
          </>
        );
      }, 1000);
      return () => clearTimeout(timeout);
    }
  }, [post?.title, post?.content, post?.category]);

  useEffect(() => {
    const handleBeforeUnload = (e) => {
      if (isDirty) {
        e.preventDefault();
        e.returnValue = "尚有未儲存的變更，確定離開？";
      }
    };
    window.addEventListener("beforeunload", handleBeforeUnload);
    return () => window.removeEventListener("beforeunload", handleBeforeUnload);
  }, [isDirty]);

  // 圖片上傳
  const handleImageUpload = async (e) => {
    const file = e.target.files?.[0];
    if (file) {
      const formData = new FormData();
      formData.append("file", file);
      formData.append("postId", id);

      setSaveStatus(
        <>
          <FaSpinner className="animate-spin" /> 圖片上傳中...
        </>
      );
      
      try {
        const res = await fetch("/api/forum/upload", {
          method: "POST",
          body: formData,
        });
        
        const data = await res.json();
        console.log("上傳回應:", data); // 除錯用
        
        if (res.ok && data.url) {
          setImage(data.url);
          setIsDirty(true);
          setSaveStatus(
            <>
              <FaCheck className="text-green-500" /> 圖片已上傳
            </>
          );
        } else {
          console.error("上傳失敗:", data); // 除錯用
          setSaveStatus(
            <>
              <FaTimes className="text-red-500" /> 圖片上傳失敗: {data.error || '未知錯誤'}
            </>
          );
        }
      } catch (error) {
        console.error("上傳錯誤:", error); // 除錯用
        setSaveStatus(
          <>
            <FaTimes className="text-red-500" /> 圖片上傳失敗
          </>
        );
      }
    }
  };

  const handleSave = async () => {
    if (!post.title || !post.category) {
      setToast(
        <>
          <FaExclamationTriangle className="inline text-yellow-500 mr-1" />
          請填寫標題並選擇分類
        </>
      );
      return;
    }

    const token = localStorage.getItem('token');
    // 將單個圖片轉換為圖片陣列
    const images = image ? [image] : (post.images || []);
    const updatedPost = { ...post, images };
    const res = await fetch(`/api/forum/edit/${id}`, {
      method: "PUT",
      headers: { 
        "Content-Type": "application/json",
        "Authorization": `Bearer ${token}` // 帶上 token
      },
      body: JSON.stringify(updatedPost),
    });
    if (res.ok) {
      setIsDirty(false);
      setSaveStatus(
        <>
          <FaCheck className="text-green-500" /> 已儲存
        </>
      );
      setToast(
        <>
          <FaRegSmile className="inline text-green-500 mr-1" />
          儲存成功，3 秒後返回列表
        </>
      );
      setTimeout(() => {
        setToast("");
        router.push("/forum");
      }, 3000);
    } else {
      setSaveStatus(
        <>
          <FaTimes className="text-red-500" /> 儲存失敗
        </>
      );
      setToast(
        <>
          <FaExclamationTriangle className="inline text-red-500 mr-1" />
          儲存失敗，請稍後再試
        </>
      );
      setTimeout(() => setToast(""), 3000);
    }
  };

  const handlePopoverOpenChange = (open) => {
    setPopoverOpen(open);
    if (open && triggerRef.current) {
      setMenuWidth(triggerRef.current.offsetWidth);
    }
  };

  // 檢查登入狀態
  if (checkingAuth || isLoading) {
    return (
      <div className="flex justify-center items-center py-20">
        <CssLoader />
      </div>
    );
  }

  if (!isLoggedIn) {
    return (
      <div className="max-w-7xl mx-auto px-6 py-10 text-center">
        <p>請先登入才能編輯文章</p>
        <Link href="/forum">
          <Button variant="outline" className="mt-4">
            返回論壇主頁
          </Button>
        </Link>
      </div>
    );
  }

  if (!post || !isOwner) {
    return (
      <div className="max-w-7xl mx-auto px-6 py-10 text-center">
        <p className="text-red-500 mb-4">找不到文章或無權限編輯</p>
        <Link href="/forum">
          <Button variant="outline" className="mt-4">
            返回論壇主頁
          </Button>
        </Link>
      </div>
    );
  }

  return (
    <div className="max-w-7xl mx-auto grid grid-cols-1 lg:grid-cols-3 gap-8 px-4 py-10 relative">
      {toast && (
        <div className="absolute top-4 right-4 bg-black text-white px-4 py-2 rounded-md shadow flex items-center gap-2">
          {toast}
        </div>
      )}

      {/* 主內容區 */}
      <div className="lg:col-span-2 space-y-6">
        <div className="bg-white rounded-xl shadow p-6">
          <h2 className="text-xl font-bold mb-4 flex items-center gap-2">
            <FaPen /> 編輯文章 #{id}
          </h2>
          <input
            type="text"
            value={post.title}
            onChange={(e) => {
              setPost({ ...post, title: e.target.value });
              setIsDirty(true);
            }}
            className="w-full border border-gray-300 px-4 py-2 rounded-md focus:ring-2 focus:ring-black"
            placeholder="請輸入文章標題..."
          />
        </div>

        <div className="bg-white rounded-xl shadow p-6">
          <label className="block text-sm font-medium mb-2 flex items-center gap-2">
            <FaRegImage /> 封面圖片
          </label>
          
          {(() => {
            // 多重檢查圖片來源
            let imageUrl = null;
            
            // 1. 檢查 image state (新上傳的圖片)
            if (image) {
              imageUrl = image;
            }
            // 2. 檢查 post.images 陣列
            else if (post?.images && Array.isArray(post.images) && post.images.length > 0) {
              imageUrl = post.images[0];
            }
            // 3. 檢查是否有單個 image 欄位
            else if (post?.image) {
              imageUrl = post.image;
            }
            
            console.log("顯示的圖片 URL:", imageUrl); // 除錯用
            
            if (imageUrl) {
              return (
                <img
                  src={imageUrl}
                  alt="預覽圖片"
                  className="w-full h-64 object-cover rounded-md mb-3"
                  onError={(e) => {
                    console.error("圖片載入失敗:", imageUrl); // 除錯用
                    e.target.style.display = 'none';
                  }}
                />
              );
            } else {
              return (
                <div className="w-full h-64 bg-gray-100 rounded-md flex items-center justify-center text-gray-400">
                  <FaRegImage className="text-3xl mr-2" />
                  尚未上傳圖片
                </div>
              );
            }
          })()}

          <div className="relative inline-block mt-2">
            <Button
              variant="outline"
              size="sm"
              className="px-4 py-2 bg-gray-200 hover:bg-gray-300 rounded-md text-sm font-medium"
              onClick={() => document.getElementById("imageUpload").click()}
            >
              <FaRegImage className="inline mr-2" />
              選擇圖片
            </Button>
            <input
              id="imageUpload"
              type="file"
              accept="image/*"
              onChange={handleImageUpload}
              className="hidden"
            />
          </div>
        </div>

        <div className="bg-white rounded-xl shadow p-6">
          <label className="block text-sm font-medium mb-1 flex items-center gap-2">
            <FaRegListAlt /> 分類
          </label>
          <Popover open={popoverOpen} onOpenChange={handlePopoverOpenChange}>
            <PopoverTrigger
              ref={triggerRef}
              className="w-full border border-gray-300 px-4 py-2 rounded-md text-left flex items-center justify-between focus:ring-2 focus:ring-black"
            >
              <span>
                {post.category === "其他" && post.customCategory
                  ? `其他: ${post.customCategory}`
                  : CATEGORY_OPTIONS.find((opt) => opt.value === post.category)?.label || "選擇分類"}
              </span>
              <FaChevronDown className="text-gray-500 w-3 h-3" />
            </PopoverTrigger>
            <PopoverContent
              align="start"
              style={{
                width: menuWidth ? `${menuWidth}px` : undefined,
                minWidth: menuWidth ? `${menuWidth}px` : undefined,
                maxWidth: menuWidth ? `${menuWidth}px` : undefined,
                boxSizing: "border-box",
                padding: 0,
              }}
              className="!p-0 !box-border"
            >
              {CATEGORY_OPTIONS.map((opt) => (
                <div
                  key={opt.value}
                  onClick={() => {
                    setPost({ ...post, category: opt.value });
                    setPopoverOpen(false);
                    setIsDirty(true);
                  }}
                  className={`px-4 py-2 cursor-pointer transition-colors ${
                    post.category === opt.value
                      ? "bg-[#AFC16D] text-[#F0F0F0]"
                      : "hover:bg-gray-100"
                  }`}
                >
                  {opt.label}
                </div>
              ))}
            </PopoverContent>
          </Popover>
          {post.category === "其他" && (
            <input
              type="text"
              placeholder="請輸入自訂分類，如無自訂請輸入「其他」"
              value={post.customCategory || ""}
              onChange={(e) => {
                setPost({ ...post, customCategory: e.target.value });
                setIsDirty(true);
              }}
              className="w-full border border-gray-300 px-4 py-2 rounded-md mt-2 focus:ring-2 focus:ring-black"
            />
          )}

          {/* 新增標籤功能 */}
          <label className="block text-sm font-medium mb-1 flex items-center gap-2 mt-4">
            <FaRegListAlt /> 標籤
          </label>
            <div className="flex items-center gap-2">
              <input
                type="text"
                placeholder="新增標籤..."
                value={tagInput}
                onChange={(e) => setTagInput(e.target.value)}
                className="flex-1 border border-gray-300 px-4 py-2 rounded-md focus:ring-2 focus:ring-black"
              />
              <Button
                type="button"
                variant="default"
                size="sm"
                className="px-4 py-2 rounded-md h-10 cursor-pointer"
                onClick={() => {
                  if (tagInput.trim() && !post.tags.includes(tagInput.trim())) {
                    setPost({ ...post, tags: [...post.tags, tagInput.trim()] });
                    setTagInput("");
                    setIsDirty(true);
                  }
                }}
              >
                新增
              </Button>
            </div>
          <p className="text-sm text-gray-500 mt-2">
            請輸入標籤，系統會自動添加「#」，例如：輸入「運動」後會顯示為「#運動」。一次只能新增一個標籤。
          </p>
          <div className="flex flex-wrap gap-2 mt-2">
            {post.tags.map((tag, index) => (
              <span
                key={index}
                className="px-3 py-1 bg-gray-200 text-sm rounded-full flex items-center gap-2"
              >
                {tag}
                <button
                  type="button"
                  onClick={() => {
                    const updatedTags = post.tags.filter((t) => t !== tag);
                    setPost({ ...post, tags: updatedTags });
                    setIsDirty(true);
                  }}
                  className="text-[#AFC16D] hover:text-[#b85e39]"
                >
                  &times;
                </button>
              </span>
            ))}
          </div>

          <label className="block text-sm font-medium mb-1 mt-6 flex items-center gap-2">
            <FaScroll /> 內容
          </label>
          <textarea
            value={post.content}
            onChange={(e) => {
              setPost({ ...post, content: e.target.value });
              setIsDirty(true);
            }}
            rows={6}
            className="w-full border border-gray-300 px-4 py-2 rounded-md focus:ring-2 focus:ring-black"
            placeholder="請輸入文章內容..."
          />
        </div>

        <div className="text-right flex justify-end gap-4">
          {/* 返回按鈕 */}
          <Button
            type="button"
            variant="outline"
            size="md"
            className="px-6 py-2 text-black border-black hover:bg-gray-100 rounded-md flex items-center gap-2 cursor-pointer"
            onClick={() => router.push("/forum")}
          >
            <FaArrowLeft className="inline" />
            取消
          </Button>
          {/* 儲存變更按鈕 */}
          <Button
            type="button"
            variant="default"
            size="md"
            className="px-6 py-2 bg-black text-white rounded-md flex items-center gap-2 cursor-pointer"
            onClick={handleSave}
          >
            <FaSave className="inline" />
            儲存變更
          </Button>
        </div>
      </div>

      {/* 右側側欄區塊 */}
      <aside className="space-y-4 w-full lg:max-w-sm lg:sticky top-24 h-fit">
        <div className="bg-white rounded-xl shadow p-4">
          <h4 className="text-md font-bold mb-2 flex items-center gap-2">
            <FaThumbtack /> 精選分類
          </h4>
          <ul className="space-y-2 text-sm">
            {["運動", "營養", "健康", "其他"].map((cat) => (
              <li key={cat} className="text-gray-700">
                <FaCheckCircle className="inline text-[#AFC16D] mr-1" />
                {cat}
              </li>
            ))}
          </ul>
        </div>

        <div className="bg-white rounded-xl shadow p-4 text-sm space-y-1">
          <h4 className="font-bold mb-2 flex items-center gap-2">
            <FaScroll /> 發文須知
          </h4>
          <div className="space-y-1 text-gray-700">
            <div>
              <FaTimes className="inline text-[#AFC16D] mr-1" />
              禁止張貼廣告內容
            </div>
            <div>
              <FaTimes className="inline text-[#AFC16D] mr-1" />
              不得包含違法、醫療不實資訊
            </div>
            <div>
              <FaCheckCircle className="inline text-[#AFC16D] mr-1" />
              保持禮貌，尊重每位發文者
            </div>
            <div>
              <FaCheckCircle className="inline text-[#AFC16D] mr-1" />
              清楚標題、分類正確、圖片清晰
            </div>
          </div>
        </div>

        <div className="bg-white rounded-xl shadow p-4 text-sm flex items-center gap-2">
          <FaSave className="text-gray-500" />
          {saveStatus}
        </div>
      </aside>
    </div>
  );
}