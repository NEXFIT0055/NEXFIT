"use client";
import { useState } from "react";

export default function PostComments() {
  const [comments, setComments] = useState([
    {
      id: 1,
      name: "阿巧",
      text: "這篇文章好實用，已經收藏起來了！",
      time: "1 小時前",
    },
    {
      id: 2,
      name: "阿傑",
      text: "我也有相同困擾，謝謝你的分享！",
      time: "3 小時前",
    },
  ]);
  const [newComment, setNewComment] = useState("");

  const handleSubmit = () => {
    if (!newComment.trim()) return;

    const newItem = {
      id: comments.length + 1,
      name: "我",
      text: newComment,
      time: "剛剛",
    };

    setComments([newItem, ...comments]);
    setNewComment("");
  };

  return (
    <section className="space-y-6">
      <h4 className="font-bold text-base">💬 留言區 ({comments.length})</h4>

      {/* 留言列表 */}
      <div className="space-y-4">
        {comments.map((c) => (
          <div
            key={c.id}
            className="bg-gray-50 border border-gray-200 rounded-lg px-4 py-3"
          >
            <div className="text-sm font-semibold">{c.name}</div>
            <div className="text-sm text-gray-700 mt-1">{c.text}</div>
            <div className="text-xs text-gray-400 mt-1">{c.time}</div>
          </div>
        ))}
      </div>

      {/* 新增留言 */}
      <div className="space-y-2 mt-6">
        <h5 className="text-sm font-medium">➕ 發表留言</h5>
        <textarea
          rows={3}
          value={newComment}
          onChange={(e) => setNewComment(e.target.value)}
          placeholder="在這裡輸入你的留言..."
          className="w-full border border-gray-300 rounded-md px-4 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-black"
        />
        <div className="text-right">
          <button
            onClick={handleSubmit}
            className="px-4 py-1.5 bg-black text-white text-sm rounded hover:bg-gray-800"
          >
            發送
          </button>
        </div>
      </div>
    </section>
  );
}
