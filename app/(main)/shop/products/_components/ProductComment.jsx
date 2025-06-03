"use client";

import { useState, useEffect } from "react";
import CssLoader from "../../cart/_components/css-loader";
import { FaUser } from "react-icons/fa";
import { CiStar } from "react-icons/ci";
import { TiStarFullOutline } from "react-icons/ti";

export default function ProductComment({ productId }) {
  const [comment, setComment] = useState([]);
  const [isLoading, setIsLoading] = useState(false);

  useEffect(() => {
    async function getProductComment() {
      try {
        setIsLoading(true);
        const res = await fetch(`/api/comments?product_id=${productId}`);
        const allComments = await res.json();

        if (!res.ok) {
          const text = await res.text();
          console.error("API 錯誤：", res.status, text);
          setComment([]); // 回傳錯誤就當作沒有評論
          return;
        }

        setComment(
          Array.isArray(allComments.comments) ? allComments.comments : []
        );
      } catch (err) {
        console.error("解析錯誤：", err.message);
        setComment([]); // 發生例外也設空
      } finally {
        setIsLoading(false);
      }
    }

    getProductComment();
  }, [productId]);

  if (isLoading) {
    return (
      <div className="flex justify-center">
        <CssLoader />
      </div>
    );
  }

  if (comment.length === 0) {
    return (
      <div className="text-center text-zinc-500 text-lg py-10">
        目前尚無任何評論，成為第一位留言者吧！
      </div>
    );
  }

  return (
    <>
      <ul className="flex flex-col gap-8">
        {comment?.map((comment) => {
          return (
            <li
              className="flex text-lg text-left gap-6 border-b pb-4"
              key={comment.id}
            >
              <div className="w-18 h-18 bg-[#F5F5F5] flex justify-center items-center rounded-full">
                <FaUser className="w-8 h-8 color-[#C6C6C6]" />
              </div>

              <div className="flex flex-col w-2/3">
                <p className="font-bold">{comment.user_name}</p>
                <p className="flex items-center">
                  <span className="text-zinc-500">評分: </span>
                  <span className="flex">
                    {[...Array(5)].map((_, index) =>
                      index < comment.rating ? (
                        <TiStarFullOutline
                          key={index}
                          className="text-yellow-400"
                        />
                      ) : (
                        <CiStar key={index} className="text-gray-400" />
                      )
                    )}
                  </span>
                </p>
                <p>
                  <span className="text-zinc-500">評論時間: </span>
                  {new Date(comment.created_at).toLocaleDateString("zh-TW", {
                    year: "numeric",
                    month: "long",
                    day: "numeric",
                  })}
                </p>
                <p>{comment.comment_text}</p>
              </div>
            </li>
          );
        })}
      </ul>
    </>
  );
}
