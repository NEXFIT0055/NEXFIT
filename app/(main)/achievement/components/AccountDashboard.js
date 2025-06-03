'use client';
import { useState } from 'react';
import DailyMissions from './DailyMissions';
import AchievementsGrid from './AchievementsGrid';
import ScoreBar from './ScoreBar';
import HeaderStats from './HeaderStats/HeaderStats';

const initialAchievements = [
  { id: 1, title: "好東西要跟好朋友分享(分享過平台)", unlocked: false },
  { id: 2, title: "那個雅鈴有60公斤(成功減重1%)", unlocked: false },
  { id: 3, title: "早起的鳥兒覺得好累(早上6.前簽到)", unlocked: false },
  { id: 4, title: "今天我有乖(完成每日任務打卡)", unlocked: false },
  { id: 5, title: "我不是夜貓子(晚上10點前睡)", unlocked: false },
  { id: 6, title: "我超愛喝水(一天喝水至少三次)", unlocked: false },
  { id: 7, title: "記得睡覺 !(清晨5點開啟平台)", unlocked: false },
  { id: 8, title: "讓我看看你的反應力(玩過小遊戲一次)", unlocked: false }, // ✅ 初始存在
];

export default function AccountDashboard() {
  const [score, setScore] = useState(0);
  const [achievements, setAchievements] = useState(initialAchievements);
  const [refreshKey, setRefreshKey] = useState(0); // 新增刷新Key

  const unlockAchievement = (id) => {
    setAchievements((prev) =>
      prev.map((a) => (a.id === id ? { ...a, unlocked: true } : a))
    );
    setRefreshKey((prev) => prev + 1); // 每次更新成就後刷新Key
  };

  return (
    <div className="space-y-6">
      <HeaderStats score={score} level={1} achievements={achievements.filter(a => a.unlocked)} />
      <ScoreBar score={score} />
      <DailyMissions
        setScore={(points) => setScore((prev) => prev + points)}
        unlockAchievement={unlockAchievement}
      />
      <AchievementsGrid achievements={achievements} refreshKey={refreshKey} />
    </div>
  );
}
