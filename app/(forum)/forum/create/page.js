"use client";

import { useState, useRef, useEffect } from "react";
import Link from "next/link";
import { useRouter } from "next/navigation";
import { FaFileAlt, FaThumbtack, FaScroll, FaCheck, FaMedal, FaChevronDown,FaArrowLeft } from "react-icons/fa";
import { Button } from "@/app/components/ui/button";
import { Popover, PopoverTrigger, PopoverContent } from "@/app/components/ui/popover";
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

const CATEGORY_OPTIONS = [
  { value: "營養", label: "營養" },
  { value: "運動", label: "運動" },
  { value: "健康", label: "健康" },
  { value: "其他", label: "其他" },
];

export default function CreatePostPage() {
  const [title, setTitle] = useState("");
  const [category, setCategory] = useState(CATEGORY_OPTIONS[0].value);
  const [customCategory, setCustomCategory] = useState("");
  const [tags, setTags] = useState([]);
  const [tagInput, setTagInput] = useState("");
  const [content, setContent] = useState("");
  const [image, setImage] = useState(null);
  const [imageFile, setImageFile] = useState(null);
  const [hasAgreed, setHasAgreed] = useState(false);
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [showAgreementDialog, setShowAgreementDialog] = useState(false);
  const [showSuccessDialog, setShowSuccessDialog] = useState(false);
  const [errorDialog, setErrorDialog] = useState({ open: false, message: "" });
  const [isLoggedIn, setIsLoggedIn] = useState(false);
  const [checkingAuth, setCheckingAuth] = useState(true);
  const router = useRouter();

  const triggerRef = useRef(null);
  const [menuWidth, setMenuWidth] = useState(undefined);
  const [popoverOpen, setPopoverOpen] = useState(false);
  const [showMissingFieldsDialog, setShowMissingFieldsDialog] = useState(false);
  const [showMissingCategoryDialog, setShowMissingCategoryDialog] = useState(false);

  useEffect(() => {
    const token = localStorage.getItem('token');
    if (!token) {
      router.push('/forum');
      return;
    }
    setIsLoggedIn(true);
    setCheckingAuth(false);
  }, [router]);

  if (checkingAuth) {
    return (
      <div className="max-w-7xl mx-auto px-6 py-10 text-center">
        <p>檢查登入狀態中...</p>
      </div>
    );
  }

  if (!isLoggedIn) {
    return (
      <div className="max-w-7xl mx-auto px-6 py-10 text-center">
        <p>請先登入才能發表文章</p>
        <Link href="/forum">
          <Button variant="outline" className="mt-4">
            返回論壇主頁
          </Button>
        </Link>
      </div>
    );
  }

  const handlePopoverOpenChange = (open) => {
    setPopoverOpen(open);
    if (open && triggerRef.current) {
      setMenuWidth(triggerRef.current.getBoundingClientRect().width);
    }
  };

  const handleImageChange = (e) => {
    const file = e.target.files[0];
    if (file) {
      setImageFile(file);
      setImage(URL.createObjectURL(file));
    }
  };

  const handleAddTag = () => {
    const formattedTag = tagInput.trim().startsWith("#")
      ? tagInput.trim()
      : `#${tagInput.trim()}`;
    if (formattedTag && !tags.includes(formattedTag)) {
      setTags([...tags, formattedTag]);
      setTagInput("");
    }
  };

  const handleRemoveTag = (tagToRemove) => {
    setTags(tags.filter((tag) => tag !== tagToRemove));
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    if (!hasAgreed) {
      setShowAgreementDialog(true);
      return;
    }
    if (!title || !content) {
      setShowMissingFieldsDialog(true);
      return;
    }
    
    let finalCategory = category;
    if (category === "其他") {
      if (!customCategory.trim()) {
        setShowMissingCategoryDialog(true);
        return;
      }
      finalCategory = customCategory.trim();
    }
    
    setIsSubmitting(true);
    
    try {
      const token = localStorage.getItem('token');
      if (!token) {
        throw new Error("請重新登入");
      }

      const cleanTags = tags.map(tag => tag.replace(/^#/, ''));

      const postRes = await fetch("/api/forum/post", {
        method: "POST",
        headers: { 
          "Content-Type": "application/json",
          "Authorization": `Bearer ${token}`
        },
        body: JSON.stringify({
          title,
          content,
          images: [],
          tags: cleanTags,
          category: finalCategory,
        }),
      });

      if (!postRes.ok) {
        const errorData = await postRes.json();
        throw new Error(errorData.error || "發表文章失敗");
      }
      const postData = await postRes.json();

      if (imageFile) {
        const formData = new FormData();
        formData.append("file", imageFile);
        formData.append("postId", postData.postId);

        const uploadRes = await fetch("/api/forum/upload", {
          method: "POST",
          body: formData,
        });

        if (!uploadRes.ok) {
          const errorData = await uploadRes.json();
          throw new Error(errorData.error || "圖片上傳失敗");
        }
      }

      setShowSuccessDialog(true);
      setTitle("");
      setCategory(CATEGORY_OPTIONS[0].value);
      setCustomCategory("");
      setTags([]);
      setContent("");
      setImage(null);
      setImageFile(null);
      setHasAgreed(false);
    } catch (err) {
      console.error("Error details:", err);
      setErrorDialog({ open: true, message: "發表失敗：" + err.message });
    } finally {
      setIsSubmitting(false);
    }
  };

  return (
    <div className="max-w-7xl mx-auto px-6 py-10 grid grid-cols-1 lg:grid-cols-3 gap-8">
      <div className="lg:col-span-2 bg-white p-8 rounded-xl shadow-md">
        <h2 className="text-2xl font-bold mb-6 flex items-center gap-2">
          <FaFileAlt /> 發表新文章
        </h2>
        <form onSubmit={handleSubmit} className="space-y-6">
          <div>
            <label className="block mb-1 text-sm font-semibold">標題</label>
            <input
              type="text"
              placeholder="請輸入文章標題..."
              value={title}
              onChange={(e) => setTitle(e.target.value)}
              className="w-full border border-gray-300 px-4 py-2 rounded-md focus:ring-2 focus:ring-black"
              required
              disabled={isSubmitting}
            />
          </div>
          <div>
            <label className="block mb-1 text-sm font-semibold">分類</label>
            <Popover open={popoverOpen} onOpenChange={handlePopoverOpenChange}>
              <PopoverTrigger
                ref={triggerRef}
                className="w-full border border-gray-300 px-4 py-2 rounded-md text-left flex items-center justify-between focus:ring-2 focus:ring-black"
                disabled={isSubmitting}
              >
                <span>
                  {category === "其他" && customCategory
                    ? `其他: ${customCategory}`
                    : CATEGORY_OPTIONS.find((opt) => opt.value === category)?.label || "選擇分類"}
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
                      setCategory(opt.value);
                      setPopoverOpen(false);
                    }}
                    className={`px-4 py-2 cursor-pointer transition-colors ${
                      category === opt.value
                        ? "bg-[#AFC16D] text-[#F0F0F0]"
                        : "hover:bg-gray-100"
                    }`}
                  >
                    {opt.label}
                  </div>
                ))}
              </PopoverContent>
            </Popover>
            {category === "其他" && (
              <input
                type="text"
                placeholder="請輸入自訂分類，如無自訂請輸入「其他」"
                value={customCategory}
                onChange={(e) => setCustomCategory(e.target.value)}
                className="w-full border border-gray-300 px-4 py-2 rounded-md mt-2 focus:ring-2 focus:ring-black"
                disabled={isSubmitting}
              />
            )}
          </div>
          <div>
            <label className="block mb-1 text-sm font-semibold">標籤</label>
            <div className="flex items-center gap-2">
              <input
                type="text"
                placeholder="新增標籤..."
                value={tagInput}
                onChange={(e) => setTagInput(e.target.value)}
                className="flex-1 border border-gray-300 px-4 py-2 rounded-md focus:ring-2 focus:ring-black"
                disabled={isSubmitting}
              />
              <Button
                type="button"
                onClick={handleAddTag}
                variant="default"
                disabled={isSubmitting}
                className="rounded-lg cursor-pointer"
              >
                新增
              </Button>
            </div>
            <p className="text-sm text-gray-500 mt-2">
              請輸入標籤，系統會自動添加「#」，例如：輸入「我超棒」後會顯示為「#我超棒」。
            </p>
            <p className="text-sm text-gray-500 mt-2">
              一次只能新增一個標籤，可新增多個標籤。
            </p>
            <div className="flex flex-wrap gap-2 mt-2">
              {tags.map((tag) => (
                <span
                  key={tag}
                  className="px-3 py-1 bg-[#F0F0F0] text-sm rounded-full flex items-center gap-2"
                >
                  {tag}
                  <button
                    type="button"
                    onClick={() => handleRemoveTag(tag)}
                    className="text-[#AFC16D] hover:text-[#b85e39]"
                  >
                    &times;
                  </button>
                </span>
              ))}
            </div>
          </div>
          <div>
            <label className="block mb-1 text-sm font-semibold">內容</label>
            <textarea
              rows={6}
              placeholder="在這裡輸入你的文章內容..."
              value={content}
              onChange={(e) => setContent(e.target.value)}
              className="w-full border border-gray-300 px-4 py-2 rounded-md focus:ring-2 focus:ring-black"
              required
              disabled={isSubmitting}
            />
          </div>
          <div>
            <label className="block mb-1 text-sm font-semibold">圖片上傳</label>
            <div className="border border-dashed border-gray-400 p-6 rounded-md text-center">
              <input
                type="file"
                accept="image/*"
                onChange={handleImageChange}
                className="hidden"
                id="upload-image"
                disabled={isSubmitting}
              />
              <label
                htmlFor="upload-image"
                className={`cursor-pointer text-sm text-gray-600 hover:underline ${isSubmitting ? "opacity-50 cursor-not-allowed" : ""}`}
              >
                點我上傳圖片
              </label>
              {image && (
                <div className="mt-4 flex justify-center">
                  <img src={image} alt="預覽圖" className="max-w-full rounded-md border" />
                </div>
              )}
            </div>
            <p className="text-sm text-gray-500 mt-2">
              發表文章前請先同意右側的發文須知，並確保文章內容符合規範。
            </p>
          </div>
          <div className="flex justify-end gap-3">
            <Button
              type="submit"
              variant="default"
              disabled={isSubmitting}
              className="rounded-lg cursor-pointer"
            >
              {isSubmitting ? "發表中..." : "立即發表"}
            </Button>
          </div>
        </form>
      </div>
      <AlertDialog open={showSuccessDialog} onOpenChange={setShowSuccessDialog}>
        <AlertDialogContent>
          <AlertDialogHeader>
            <AlertDialogTitle>文章發表成功</AlertDialogTitle>
            <AlertDialogDescription>
              您的文章已成功發表！現在可以返回論壇主頁查看。
            </AlertDialogDescription>
          </AlertDialogHeader>
          <AlertDialogFooter>
            <AlertDialogAction onClick={() => setShowSuccessDialog(false)}>
              確定
            </AlertDialogAction>
          </AlertDialogFooter>
        </AlertDialogContent>
      </AlertDialog>
      <AlertDialog open={errorDialog.open} onOpenChange={(open) => setErrorDialog({ ...errorDialog, open })}>
        <AlertDialogContent>
          <AlertDialogHeader>
            <AlertDialogTitle>發表失敗</AlertDialogTitle>
            <AlertDialogDescription>{errorDialog.message}</AlertDialogDescription>
          </AlertDialogHeader>
          <AlertDialogFooter>
            <AlertDialogAction onClick={() => setErrorDialog({ open: false, message: "" })}>
              確定
            </AlertDialogAction>
          </AlertDialogFooter>
        </AlertDialogContent>
      </AlertDialog>
      <AlertDialog open={showAgreementDialog} onOpenChange={setShowAgreementDialog}>
        <AlertDialogContent>
          <AlertDialogHeader>
            <AlertDialogTitle>未勾選發文規則</AlertDialogTitle>
            <AlertDialogDescription>
              您必須勾選「我已閱讀並同意發文規則」才能提交文章。
            </AlertDialogDescription>
          </AlertDialogHeader>
          <AlertDialogFooter>
            <AlertDialogAction onClick={() => setShowAgreementDialog(false)}>
              確定
            </AlertDialogAction>
          </AlertDialogFooter>
        </AlertDialogContent>
      </AlertDialog>
      <AlertDialog open={showMissingFieldsDialog} onOpenChange={setShowMissingFieldsDialog}>
        <AlertDialogContent>
          <AlertDialogHeader>
            <AlertDialogTitle>缺少必填欄位</AlertDialogTitle>
            <AlertDialogDescription>
              請填寫標題與內容，這些欄位是必填的。
            </AlertDialogDescription>
          </AlertDialogHeader>
          <AlertDialogFooter>
            <AlertDialogAction onClick={() => setShowMissingFieldsDialog(false)}>
              確定
            </AlertDialogAction>
          </AlertDialogFooter>
        </AlertDialogContent>
      </AlertDialog>
      <AlertDialog open={showMissingCategoryDialog} onOpenChange={setShowMissingCategoryDialog}>
        <AlertDialogContent>
          <AlertDialogHeader>
            <AlertDialogTitle>請輸入自訂分類</AlertDialogTitle>
            <AlertDialogDescription>
              您選擇了「其他」分類，請在下方輸入您的自訂分類內容。
            </AlertDialogDescription>
          </AlertDialogHeader>
          <AlertDialogFooter>
            <AlertDialogAction onClick={() => setShowMissingCategoryDialog(false)}>
              確定
            </AlertDialogAction>
          </AlertDialogFooter>
        </AlertDialogContent>
      </AlertDialog>
      <aside className="space-y-6">
        <div className="bg-white p-5 rounded-xl shadow-md">
          <h4 className="font-bold mb-3 border-b pb-1 flex items-center gap-2">
            <FaThumbtack /> 精選分類
          </h4>
          <div className="flex flex-wrap gap-2">
            {CATEGORY_OPTIONS.map((opt) => (
              <button
                key={opt.value}
                onClick={() => setCategory(opt.value)}
                className="text-sm px-3 py-1 border border-gray-300 rounded-full hover:bg-gray-100 transition"
                disabled={isSubmitting}
              >
                #{opt.label}
              </button>
            ))}
          </div>
        </div>

        <div className="bg-white p-5 rounded-xl shadow-md">
          <h4 className="font-bold mb-3 border-b pb-1 flex items-center gap-2">
            <FaScroll /> 發文須知
          </h4>
          <ul className="space-y-2 text-sm text-gray-700">
            <li><FaCheck className="inline mr-1 text-gray-500" /> 禁止張貼廣告內容</li>
            <li><FaCheck className="inline mr-1 text-gray-500" /> 不得包含違法、醫療不實資訊</li>
            <li><FaCheck className="inline mr-1 text-gray-500" /> 保持禮貌，尊重每位發文者</li>
          </ul>
          <div className="mt-4 text-sm">
            <label className="inline-flex items-center gap-2">
              <input
                type="checkbox"
                className="accent-black w-4 h-4"
                checked={hasAgreed}
                onChange={(e) => setHasAgreed(e.target.checked)}
                disabled={isSubmitting}
              />
              我已閱讀並同意發文規則
            </label>
          </div>
        </div>

        <div className="bg-white p-5 rounded-xl shadow-md">
          <h4 className="font-bold mb-3 border-b pb-1 flex items-center gap-2">
            <FaMedal /> 發文任務進度
          </h4>
          <div className="mb-2 text-sm font-medium text-gray-700">
            今日目標：發表 1 篇
          </div>
          <div className="w-full bg-gray-200 rounded-full h-3 mb-3">
            <div className="bg-[#AFC16D] h-3 rounded-full" style={{ width: "80%" }}></div>
          </div>
          <p className="text-xs text-gray-500 mb-1">目前已完成：80%</p>
          <div className="mt-3 text-sm text-[#F0F0F0] bg-[#AFC16D] px-3 py-2 rounded-lg">
            <FaMedal className="inline mr-2" /> 再發一篇文章即可獲得徽章：<strong>健筆如飛</strong>
          </div>
        </div>
      </aside>
      <div className="text-center mt-10 lg:col-span-3">
        <Link href="/forum">
          <Button variant="outline" size="lg" className="flex items-center gap-2 cursor-pointer">
            <FaArrowLeft className="text-lg" />
            返回論壇主頁
          </Button>
        </Link>
      </div>
    </div>
  );
}