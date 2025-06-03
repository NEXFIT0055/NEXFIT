'use client';

import { useEffect, useState } from "react";
import { X } from "lucide-react";
import clsx from "clsx";
import { Button } from "./button";

const CATEGORY_MAP = {
  "功能性訓練": "課程種類",
  "有氧訓練": "課程種類",
  "核心訓練": "課程種類",
  "肌肉伸展": "課程種類",
  "筋膜放鬆": "課程種類",
  "重量訓練": "課程種類",
  "瑜珈": "課程種類",
  "心肺耐力": "課程種類",
  "爆發力": "課程種類",
  "全身運動": "課程種類",
  "新手友善": "難易程度",
  "中級課程": "難易程度",
  "高級課程": "難易程度",
  "小班制": "班級大小",
  "大班制": "班級大小",
  "熱門": "其他",
  "熱鬧": "其他",
};

function groupTagsByCategory(tags) {
  return tags.reduce((groups, tag) => {
    const category = CATEGORY_MAP[tag.name] || "其他";
    if (!groups[category]) groups[category] = [];
    groups[category].push(tag);
    return groups;
  }, {});
}

export default function FilterModal({
  visible,
  onClose,
  selectedTags = [],
  selectedDays = [],
  selectedTimes = [],
  selectedAreas = [],
  allAreas = [],
  onApply,
}) {
  const [tags, setTags] = useState([]);
  const [tempSelectedTags, setTempSelectedTags] = useState([]);
  const [tempSelectedDays, setTempSelectedDays] = useState([]);
  const [tempSelectedTimes, setTempSelectedTimes] = useState([]);
  const [tempSelectedAreas, setTempSelectedAreas] = useState([]);

  const dayOptions = ["週一", "週二", "週三", "週四", "週五", "週六", "週日"];
  const timeOptions = ["早上", "下午", "晚上"];

  useEffect(() => {
    async function fetchTags() {
      try {
        const res = await fetch("/api/reservation/tag");
        const data = await res.json();
        setTags(data);
        setTempSelectedTags(selectedTags);
        setTempSelectedDays(selectedDays);
        setTempSelectedTimes(selectedTimes);
        setTempSelectedAreas(selectedAreas);
      } catch (err) {
        console.error("Failed to fetch tags:", err);
      }
    }
    if (visible) fetchTags();
  }, [visible, selectedTags, selectedDays, selectedTimes, selectedAreas]);

  const toggleTag = (tag) => {
    setTempSelectedTags((prev) =>
      prev.includes(tag) ? prev.filter((t) => t !== tag) : [...prev, tag]
    );
  };

  const groupedTags = groupTagsByCategory(tags);

  return (
    <div className={clsx(
      "fixed inset-0 z-50 flex items-center justify-center bg-[#00000066] bg-opacity-40 transition-opacity",
      visible ? "visible opacity-100" : "invisible opacity-0"
    )}>
      <div className="bg-white w-[90%] max-w-md rounded-2xl p-6 max-h-[90vh] overflow-y-auto">
        <div className="flex items-center justify-between mb-4">
          <h2 className="text-xl font-bold">篩選條件</h2>
          <X className="cursor-pointer" onClick={onClose} />
        </div>

        {/* 課程標籤 */}
        {Object.entries(groupedTags).map(([category, tags]) => (
          <div key={category} className="mb-6 flex">
            <h3 className="text-sm font-semibold mb-2 w-1/4">{category}</h3>
            <div className="flex flex-wrap gap-2 w-3/4">
              {tags.map(tag => (
                <button
                  key={tag.id}
                  onClick={() => toggleTag(tag.name)}
                  className={clsx(
                    "px-3 py-1 rounded-full border text-sm cursor-pointer",
                    tempSelectedTags.includes(tag.name)
                      ? "bg-black text-white"
                      : "bg-white text-black border-gray-300"
                  )}
                >
                  {tag.name}
                </button>
              ))}
            </div>
          </div>
        ))}

        <div className="relative my-8">
          <div className="border-t border-gray-300 w-full"></div>
          <span className="absolute -top-3 left-1/2 -translate-x-1/2 bg-white px-3 text-sm font-semibold text-gray-500">
            上課日期
          </span>
        </div>

        {/* 上課日 */}
        <div className="mb-6">
          <h3 className="text-sm font-semibold mb-2">上課日</h3>
          <div className="flex flex-wrap gap-2">
            {dayOptions.map(day => (
              <button
                key={day}
                onClick={() =>
                  setTempSelectedDays(prev =>
                    prev.includes(day)
                      ? prev.filter(d => d !== day)
                      : [...prev, day]
                  )
                }
                className={clsx(
                  "px-3 py-1 rounded-full border text-sm cursor-pointer",
                  tempSelectedDays.includes(day)
                    ? "bg-black text-white"
                    : "bg-white text-black border-gray-300"
                )}
              >
                {day}
              </button>
            ))}
          </div>
        </div>

        {/* 上課時段 */}
        <div className="mb-6">
          <h3 className="text-sm font-semibold mb-2">上課時段</h3>
          <div className="flex flex-wrap gap-2">
            {timeOptions.map(time => (
              <button
                key={time}
                onClick={() =>
                  setTempSelectedTimes(prev =>
                    prev.includes(time)
                      ? prev.filter(t => t !== time)
                      : [...prev, time]
                  )
                }
                className={clsx(
                  "px-3 py-1 rounded-full border text-sm cursor-pointer",
                  tempSelectedTimes.includes(time)
                    ? "bg-black text-white"
                    : "bg-white text-black border-gray-300"
                )}
              >
                {time}
              </button>
            ))}
          </div>
        </div>

        <div className="relative my-8">
          <div className="border-t border-gray-300 w-full"></div>
          <span className="absolute -top-3 left-1/2 -translate-x-1/2 bg-white px-3 text-sm font-semibold text-gray-500">
            上課地點
          </span>
        </div>


        {/* 地區選擇 */}
        <div className="mb-6">
          <h3 className="text-sm font-semibold mb-2">縣市</h3>
          <div className="flex flex-wrap gap-2">
            {allAreas.map(area => (
              <button
                key={area}
                onClick={() =>
                  setTempSelectedAreas(prev =>
                    prev.includes(area)
                      ? prev.filter(a => a !== area)
                      : [...prev, area]
                  )
                }
                className={clsx(
                  "px-3 py-1 rounded-full border text-sm cursor-pointer",
                  tempSelectedAreas.includes(area)
                    ? "bg-black text-white"
                    : "bg-white text-black border-gray-300"
                )}
              >
                {area}
              </button>
            ))}
          </div>
        </div>

        {/* 套用篩選 */}
        <Button
          className="w-full mt-4"
          onClick={() => {
            onApply({
              tags: tempSelectedTags,
              days: tempSelectedDays,
              times: tempSelectedTimes,
              areas: tempSelectedAreas,
            });
            onClose();
          }}
        >
          套用篩選
        </Button>
      </div>
    </div>
  );
}
