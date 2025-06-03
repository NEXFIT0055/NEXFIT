"use client";

import { useEffect, useRef, useState } from "react";

export default function EditPostForm({ postId, initialPost, onPostChange }) {
  const [title, setTitle] = useState("");
  const [content, setContent] = useState("");
  const [category, setCategory] = useState("");

  const hasInitialized = useRef(false);

  useEffect(() => {
    if (initialPost && !hasInitialized.current) {
      setTitle(initialPost.title || "");
      setContent(initialPost.content || "");
      setCategory(initialPost.category || "");
      hasInitialized.current = true; // ✅ 防止重複觸發
    }
  }, [initialPost]);

  useEffect(() => {
    if (!hasInitialized.current) return; // 初始階段不觸發
    onPostChange?.({ title, content, category });
  }, [title, content, category]);

  return (
    <div className="bg-white rounded-xl shadow p-6 space-y-6">
      <h2 className="text-lg font-bold">✏️ 編輯文章 #{postId}</h2>

      <div>
        <label className="block text-sm font-medium mb-1">標題</label>
        <input
          type="text"
          value={title}
          onChange={(e) => setTitle(e.target.value)}
          className="w-full border border-gray-300 px-4 py-2 rounded-md focus:ring-2 focus:ring-black"
          placeholder="請輸入文章標題..."
        />
      </div>

      <div>
        <label className="block text-sm font-medium mb-1">分類</label>
        <select
          value={category}
          onChange={(e) => setCategory(e.target.value)}
          className="w-full border border-gray-300 px-4 py-2 rounded-md focus:ring-2 focus:ring-black"
        >
          <option value="">請選擇分類</option>
          <option value="運動">運動</option>
          <option value="營養">營養</option>
          <option value="健康">健康</option>
          <option value="特殊活動">特殊活動</option>
        </select>
      </div>

      <div>
        <label className="block text-sm font-medium mb-1">內容</label>
        <textarea
          value={content}
          onChange={(e) => setContent(e.target.value)}
          rows={6}
          className="w-full border border-gray-300 px-4 py-2 rounded-md focus:ring-2 focus:ring-black"
          placeholder="請輸入文章內容..."
        />
      </div>
    </div>
  );
}
