"use client";

import {
  AlertDialog,
  AlertDialogAction,
  AlertDialogCancel,
  AlertDialogContent,
  AlertDialogDescription,
  AlertDialogFooter,
  AlertDialogHeader,
  AlertDialogTitle,
  AlertDialogTrigger,
} from "@/app/components/ui/alert-dialog";

import { toast } from "sonner";

import { useState, useEffect } from "react";
import StarRating from "./StarRating";
import { useAuth } from "@/app/contexts/AuthContext";

export default function Comment({ productId, name, orderId }) {
  const [hasCommented, setHasCommented] = useState(false);
  const [comment, setComment] = useState(null); // 拿到已留言內容
  // 使用 AuthContext 獲取用戶資料
  const { user } = useAuth();

  const [rating, setRating] = useState(0);
  const [text, setText] = useState("");

  // const userName =
  //   typeof window !== "undefined" ? localStorage.getItem("userName") : "";

  const userName = user?.name || ""; // 使用 AuthContext 獲取用戶名稱

  // 查詢是否已留言
  // useEffect(() => {
  //   const checkComment = async () => {
  //     const token = localStorage.getItem("token");
  //     if (!token) {
  //       console.log("未登入狀態");
  //       return;
  //     }

  //     const res = await fetch(
  //       `/api/comments?product_id=${productId}&order_id=${orderId}`
  //     );

  //     if (!res.ok) {
  //       throw new Error("載入評論失敗");
  //     }

  //     const data = await res.json();
  //     const found = Array.isArray(data.comments)
  //       ? data.comments.find((c) => c.user_name === userName)
  //       : null;

  //     if (found) {
  //       setHasCommented(true);
  //       setComment(found);
  //     }
  //   };
  //   checkComment();
  // }, [productId, userName]);

  // 查詢是否已留言
  useEffect(() => {
    const checkComment = async () => {
      try {
        const token = localStorage.getItem("token");
        if (!token) {
          console.log("未登入狀態");
          return;
        }

        const res = await fetch(
          `/api/comments?product_id=${productId}&order_id=${orderId}`,
          {
            headers: {
              Authorization: `Bearer ${token}`,
            },
          }
        );

        if (!res.ok) {
          throw new Error("載入評論失敗");
        }

        const data = await res.json();
        const found = Array.isArray(data.comments)
          ? data.comments.find((c) => c.user_name === userName)
          : null;

        if (found) {
          setHasCommented(true);
          setComment(found);
        }
      } catch (err) {
        console.error("載入評論發生錯誤:", err);
        toast.error("載入評論失敗");
      }
    };

    if (userName) {
      checkComment();
    }
  }, [productId, userName, orderId]);

  // 提交評論
  // const handleSubmit = async () => {
  //   try {
  //     const res = await fetch("/api/comments", {
  //       method: "POST",
  //       headers: { "Content-Type": "application/json" },
  //       body: JSON.stringify({
  //         order_id: orderId,
  //         product_id: productId,
  //         user_name: userName,
  //         comment_text: text,
  //         rating,
  //       }),
  //     });

  //     const result = await res.json();

  //     if (result.success) {
  //       toast.success("評論成功！");
  //     }

  //     if (!res.ok) {
  //       console.error("送出失敗：", result);
  //       alert(`送出失敗：${result.error}`);
  //       return;
  //     }

  //     setHasCommented(true);
  //     setComment({
  //       user_name: userName,
  //       comment_text: text,
  //       rating,
  //       created_at: new Date().toISOString(),
  //     });
  //   } catch (err) {
  //     console.error("送出錯誤：", err);
  //     alert("評論送出過程錯誤！");
  //   }
  // };

  // 提交評論
  const handleSubmit = async () => {
    try {
      const token = localStorage.getItem("token");
      if (!token) {
        toast.error("請先登入");
        return;
      }

      if (!rating) {
        toast.error("請選擇評分星等");
        return;
      }

      if (!text.trim()) {
        toast.error("請輸入評論內容");
        return;
      }

      const res = await fetch("/api/comments", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
          Authorization: `Bearer ${token}`,
        },
        body: JSON.stringify({
          order_id: orderId,
          product_id: productId,
          user_name: userName,
          comment_text: text,
          rating,
        }),
      });

      const result = await res.json();

      if (!res.ok) {
        throw new Error(result.error || "評論送出失敗");
      }

      toast.success("評論成功！");
      setHasCommented(true);
      setComment({
        user_name: userName,
        comment_text: text,
        rating,
        created_at: new Date().toISOString(),
      });
    } catch (err) {
      console.error("評論送出錯誤：", err);
      toast.error(err.message || "評論送出失敗");
    }
  };

  return (
    <AlertDialog className="self-center">
      <AlertDialogTrigger
        className={`border border-[#9B9999] cursor-pointer self-start px-5 py-3 text-[16px] ${
          hasCommented
            ? "!text-[#333] bg-[#F9F9F9]"
            : "!text-white bg-[#AFC16D] hover:!bg-[#AFC16D] hover:opacity-85"
        }`}
      >
        {hasCommented ? "查看評論" : "評價商品"}
      </AlertDialogTrigger>
      <AlertDialogContent>
        <AlertDialogHeader>
          <AlertDialogTitle className="text-center text-[24px]">
            {hasCommented ? "你的評論" : "評價商品"}
          </AlertDialogTitle>
          <AlertDialogDescription>
            <div className="flex flex-col items-center">
              <p className="mb-8">
                {hasCommented
                  ? "你已經評價過該商品"
                  : "來為這個商品留下評論吧！"}
              </p>
              <p className="mb-4 text-[#333] text-2xl text-[#333]">{name}</p>
              <StarRating
                className="mb-4"
                onChange={setRating}
                rating={hasCommented ? comment?.rating : undefined}
                readOnly={hasCommented}
              />
              {hasCommented ? (
                <p className="text-gray-600">{comment?.comment_text}</p>
              ) : (
                <textarea
                  className="w-full max-w-sm h-24 p-3 border border-gray-300 rounded-md resize-none focus:outline-none focus:ring-2"
                  placeholder="寫下你的評論"
                  value={text}
                  onChange={(e) => setText(e.target.value)}
                />
              )}
            </div>
          </AlertDialogDescription>
        </AlertDialogHeader>

        <AlertDialogFooter>
          <AlertDialogCancel className="cursor-pointer">關閉</AlertDialogCancel>
          {!hasCommented && (
            <AlertDialogAction
              className="cursor-pointer bg-[#AFC16D] hover:!bg-[#AFC16D] hover:text-white hover:opacity-85"
              onClick={handleSubmit}
            >
              送出評論
            </AlertDialogAction>
          )}
        </AlertDialogFooter>
      </AlertDialogContent>
    </AlertDialog>
  );
}
