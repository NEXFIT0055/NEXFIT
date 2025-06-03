'use client';
import { useState } from 'react';

const missions = [
  { id: 1, name: '今日完成任務打卡', points: 20 },
  { id: 2, name: '開啟平台滿 3 次', points: 30 },
  { id: 3, name: '與朋友分享平台', points: 40 },
  { id: 4, name: '點擊過「健康知識」文章', points: 25 },
  { id: 5, name: '連續三天完成任務', points: 50 },
  { id: 6, name: '試玩小遊戲一次', points: 20 },
];

const missionToAchievementMap = {
  1: 4,  // 任務1對應成就4
  6: 8,  // 任務6對應成就8
};

export default function DailyMissions({ setScore, unlockAchievement }) {
  const [tasks, setTasks] = useState(missions);

  const handleClaimReward = (id) => {
    const task = tasks.find((t) => t.id === id);
    if (!task || task.completed) return;

    const updatedTasks = tasks.map((t) =>
      t.id === id ? { ...t, completed: true } : t
    );
    setTasks(updatedTasks);
    setScore(task.points);

    const achievementId = missionToAchievementMap[id];
    if (achievementId) unlockAchievement(achievementId);

    const completedCount = updatedTasks.filter((t) => t.completed).length;
    if (completedCount >= 3) unlockAchievement(1);
  };

  const sortedTasks = [...tasks].sort((a, b) => (a.completed === b.completed ? 0 : a.completed ? 1 : -1));
  const remainingTasksCount = sortedTasks.filter((task) => !task.completed).length;

  return (
    <div className="bg-white rounded-xl shadow-md p-4 border border-gray-200">
      <h2 className="font-semibold mb-3">完成每日任務領好禮</h2>
      <div className="space-y-2 max-h-[250px] overflow-y-auto pr-2">
        {sortedTasks.map((task) => (
          <div key={task.id} className={`p-3 rounded-md border ${task.completed ? 'bg-green-100 border-green-300' : 'bg-white border-gray-300'} shadow-sm`}>
            <div className="flex justify-between items-center">
              <div>
                <div className={`font-medium ${task.completed ? 'line-through text-gray-500' : 'text-gray-800'}`}>{task.name}</div>
                <div className="text-sm text-gray-500">+{task.points} 分</div>
              </div>
              {!task.completed && (
                <button
                  onClick={() => handleClaimReward(task.id)}
                  className="bg-blue-400 text-white px-3 py-1 rounded-full hover:bg-blue-800 transition"
                >
                  領取
                </button>
              )}
            </div>
          </div>
        ))}
      </div>
      <div className="mt-4 text-sm text-gray-700">
        還有 {remainingTasksCount} 個任務未完成
      </div>
    </div>
  );
}
