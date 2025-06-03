'use client';

import { useState } from 'react';
import './AchievementsGrid.css';

export default function AchievementsGrid({ achievements }) {
  const [flippedId, setFlippedId] = useState(null); // 只允許一個卡片翻轉

  const toggleFlip = (id) => {
    setFlippedId((prev) => (prev === id ? null : id));
  };

  return (
    <div className="bg-white rounded-xl shadow-md p-4 border border-gray-200">
      <h1 className="font-semibold mb-3">成就展示牆</h1>
      <ul className="grid grid-cols-1 md:grid-cols-3 gap-4">
        {achievements.map((achievement) => (
          <li
            key={achievement.id}
            className={`card-container ${flippedId === achievement.id ? 'flipped' : ''}`}
            onClick={() => toggleFlip(achievement.id)}
          >
            <div className="card">
              <div
                className={`card-front p-4 rounded-md cursor-pointer transition ${
                  achievement.unlocked ? 'bg-green-100 twinkle-badge' : 'bg-white'
                } flex items-center justify-center text-center`}
              >
                <span className={achievement.unlocked ? 'text-black' : 'text-gray-400'}>
                  {achievement.title}
                </span>
              </div>

              <div className="card-back p-4 rounded-md bg-yellow-100 text-sm flex flex-col justify-center items-center text-center">
                <h2 className="font-bold">{achievement.title}</h2>
                <p>{achievement.description || '暫無描述'}</p>
                <p className={`mt-1 ${achievement.unlocked ? 'text-green-600' : 'text-red-600'}`}>
                  {achievement.unlocked ? '已解鎖 🎉' : '尚未解鎖 🚫'}
                </p>
              </div>
            </div>
          </li>
        ))}
      </ul>
    </div>
  );
}
