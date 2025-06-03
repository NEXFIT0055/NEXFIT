"use client";

import { useState, useEffect } from "react";
import dynamic from "next/dynamic";
import { toast } from "sonner";

// 🔥 動態載入所有組件，禁用 SSR 避免 localStorage 錯誤
const HeaderStats = dynamic(() => import("./components/HeaderStats"), {
  ssr: false,
});
const ScoreBar = dynamic(() => import("./components/ScoreBar"), { ssr: false });
const DailyMissions = dynamic(() => import("./components/DailyMissions"), {
  ssr: false,
});
const AchievementsGrid = dynamic(
  () => import("./components/AchievementsGrid"),
  { ssr: false }
);
const HealthTimeline = dynamic(() => import("./components/HealthTimeline"), {
  ssr: false,
});
const FireCanvas = dynamic(() => import("./components/FireCanvas"), {
  ssr: false,
});

export default function AchievementsPage() {
  const [mounted, setMounted] = useState(false);
  const [score, setScore] = useState(400);
  const [coupons, setCoupons] = useState([]);
  const [showFire, setShowFire] = useState(true);
  const [achievements, setAchievements] = useState([
    {
      id: 1,
      title: "好東西要跟好朋友分享",
      unlocked: false,
      description: "分享過平台",
    },
    {
      id: 2,
      title: "那個雅鈴有60公斤",
      unlocked: false,
      description: "成功減重1%",
    },
    {
      id: 3,
      title: "早起的鳥兒覺得好累",
      unlocked: false,
      description: "早上6點前簽到",
    },
    {
      id: 4,
      title: "今天我有乖",
      unlocked: false,
      description: "完成每日任務打卡",
    },
    {
      id: 5,
      title: "我不是夜貓子",
      unlocked: false,
      description: "晚上10點前睡",
    },
    {
      id: 6,
      title: "我超愛喝水",
      unlocked: false,
      description: "一天喝水至少三次",
    },
    {
      id: 7,
      title: "記得睡覺 !",
      unlocked: false,
      description: "清晨5點開啟平台",
    },
    {
      id: 8,
      title: "讓我看看你的反應力",
      unlocked: false,
      description: "玩過小遊戲一次",
    },
  ]);

  // 🔥 確保組件只在客戶端渲染
  useEffect(() => {
    setMounted(true);
  }, []);

  const maxPointsPerLevel = 500;
  const level = Math.floor(score / maxPointsPerLevel);

  const unlockAchievement = (id) => {
    setAchievements((prev) =>
      prev.map((a) => (a.id === id ? { ...a, unlocked: true } : a))
    );
    toast.success(`🎉 成就已解鎖！`);
  };

  const handleScoreUpdate = (points) => {
    if (points <= 0) return;
    const updatedScore = score + points;
    const oldLevel = Math.floor(score / maxPointsPerLevel);
    const newLevel = Math.floor(updatedScore / maxPointsPerLevel);
    const levelsGained = newLevel - oldLevel;

    const newCoupons = [];
    for (let i = 0; i < levelsGained; i++) {
      let coupon;
      do {
        coupon = `COUPON-${Math.random()
          .toString(36)
          .substr(2, 8)
          .toUpperCase()}`;
      } while (coupons.includes(coupon) || newCoupons.includes(coupon));
      newCoupons.push(coupon);
    }

    if (levelsGained > 0) {
      toast.success(`🎉 恭喜升級！獲得優惠券：${newCoupons.join(", ")}`);
    }

    toast.success(`✅ 任務完成，獲得 ${points} 積分！`);
    setScore(updatedScore);
    setCoupons((prev) => [...prev, ...newCoupons]);
  };

  // 🔥 在客戶端載入完成前顯示載入畫面
  if (!mounted) {
    return (
      <div className="flex items-center justify-center min-h-screen">
        <div className="animate-spin rounded-full h-32 w-32 border-b-2 border-blue-500"></div>
        <span className="ml-4 text-gray-600">載入中...</span>
      </div>
    );
  }

  return (
    <div className="relative min-h-screen">
      <div className="w-full max-w-6xl mx-auto p-4 sm:p-6 lg:p-10 space-y-8">
        {/* 🌟 頁面標題 */}
        <div className="bg-gradient-to-r from-pink-400 to-yellow-300 text-white text-center p-4 rounded-lg shadow-lg">
          <h1 className="text-2xl md:text-4xl font-bold">🌟 成就系統 🌟</h1>
          <p className="text-sm mt-1">
            完成任務、累積積分，解鎖專屬徽章與驚喜優惠券！
          </p>
        </div>

        {/* 📊 頭部統計 */}
        <div className="bg-white rounded-xl shadow-md p-4 border border-gray-200">
          <HeaderStats
            score={score}
            level={level}
            max={maxPointsPerLevel}
            achievements={achievements}
          />
        </div>

        {/* 📈 積分進度條 */}
        <ScoreBar score={score} max={maxPointsPerLevel} />

        {/* 🎯 任務與成就區域 */}
        <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
          <div className="bg-white rounded-lg shadow p-4 flex flex-col justify-between">
            <DailyMissions
              setScore={handleScoreUpdate}
              unlockAchievement={unlockAchievement}
            />
          </div>
          <div className="bg-white rounded-lg shadow p-4">
            <AchievementsGrid achievements={achievements} />
          </div>
        </div>

        {/* 📅 健康時間軸 */}
        <div className="bg-white rounded-lg shadow p-4">
          <HealthTimeline />
        </div>
      </div>

      {/* 🔥 火焰開關按鈕 */}
      <div className="fixed bottom-10 right-6 z-10">
        <button
          onClick={() => setShowFire(!showFire)}
          className="bg-white/90 border border-gray-300 rounded px-3 py-1 shadow hover:bg-white hover:shadow-md transition-all duration-200"
        >
          {showFire ? "🔥 關閉火焰" : "🔥 開啟火焰"}
        </button>
      </div>

      {/* 🔥 火焰動畫 */}
      {showFire && (
        <div className="fixed bottom-0 left-0 w-full h-32 z-0 pointer-events-none">
          <FireCanvas />
        </div>
      )}
    </div>
  );
}
