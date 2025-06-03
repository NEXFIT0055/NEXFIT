"use client";
import { useState } from "react";

export default function CategorySidebar() {
  const [activeCategory, setActiveCategory] = useState("運動");
  const [rules, setRules] = useState({
    rule1: true,
    rule2: true,
    rule3: true,
  });

  const categories = ["運動", "營養", "健康", "特殊活動"];

  const handleCheckboxChange = (key) => {
    setRules((prev) => ({ ...prev, [key]: !prev[key] }));
  };

  return (
    <aside className="space-y-6">
      {/* 精選分類 */}
      <div className="bg-white p-5 rounded-xl shadow-md">
        <h4 className="font-bold mb-3 border-b pb-1">📌 精選分類</h4>
        <div className="flex flex-col gap-2">
          {categories.map((cat) => (
            <button
              key={cat}
              onClick={() => setActiveCategory(cat)}
              className={`px-3 py-2 text-left rounded-md border text-sm transition ${
                activeCategory === cat
                  ? "bg-black text-white"
                  : "bg-gray-100 text-gray-700 hover:bg-gray-200"
              }`}
            >
              #{cat}
            </button>
          ))}
        </div>
      </div>

      {/* 發文須知 */}
      <div className="bg-white p-5 rounded-xl shadow-md">
        <h4 className="font-bold mb-3 border-b pb-1">📜 發文須知</h4>
        <ul className="space-y-2 text-sm text-gray-700">
          <li>🔹 禁止張貼廣告內容</li>
          <li>🔹 不得包含違法、醫療不實資訊</li>
          <li>🔹 保持禮貌，尊重每位發文者</li>
        </ul>

        <div className="mt-4 space-y-2 text-sm">
          <label className="flex items-center gap-2">
            <input
              type="checkbox"
              checked={rules.rule1}
              onChange={() => handleCheckboxChange("rule1")}
              className="accent-black"
            />
            清楚標題
          </label>
          <label className="flex items-center gap-2">
            <input
              type="checkbox"
              checked={rules.rule2}
              onChange={() => handleCheckboxChange("rule2")}
              className="accent-black"
            />
            分類正確
          </label>
          <label className="flex items-center gap-2">
            <input
              type="checkbox"
              checked={rules.rule3}
              onChange={() => handleCheckboxChange("rule3")}
              className="accent-black"
            />
            圖片清晰
          </label>
        </div>
      </div>
    </aside>
  );
}
