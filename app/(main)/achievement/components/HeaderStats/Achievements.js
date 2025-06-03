'use client';

import './Achievements.css';
import Image from 'next/image';

export default function Achievements({ achievements }) {
  if (!achievements || !Array.isArray(achievements)) return null;

  const unlocked = achievements.filter((a) => a.unlocked);
  const badgeEmojis = {
    1: '🏃‍♂️', 2: '🏋️', 3: '🌅', 4: '✅',
    5: '🌙', 6: '💧', 7: '⏰', 8: '🎖️',
  };
  const gifPaths = {
    1: '/images/badge1.gif',
    4: '/images/badge4.gif',
    8: '/images/badge8.gif',
  };

  return (
    <div className="bg-yellow-50 p-4 rounded-xl shadow-inner">
      <h2 className="text-lg font-bold mb-2 text-gray-700">🎖️ 已解鎖徽章</h2>
      <div className="grid grid-cols-3 sm:grid-cols-4 gap-4 justify-items-center">
        {unlocked.length > 0 ? (
          unlocked.map((ach) => (
            <div
              key={ach.id}
              className="group w-32 h-32 rounded-full border-2 border-green-400 shadow-md bg-white flex items-center justify-center text-3xl hover:scale-110 transition-transform relative overflow-hidden"
            >
              {gifPaths[ach.id] ? (
                <Image
                  src={gifPaths[ach.id]}
                  alt={ach.title}
                  width={128}
                  height={128}
                  className="rounded-full object-cover"
                />
              ) : (
                <span className="relative z-10">{badgeEmojis[ach.id] || '🎖️'}</span>
              )}
              <div className="shine-effect absolute inset-0 rounded-full pointer-events-none" />
              <div className="absolute -top-8 left-1/2 -translate-x-1/2 bg-gray-800 text-white text-xs px-2 py-1 rounded opacity-0 group-hover:opacity-100 transition-opacity pointer-events-none z-20 whitespace-nowrap">
                {ach.title}
              </div>
            </div>
          ))
        ) : (
          <div className="text-sm text-gray-500 col-span-full w-full text-left pl-2">尚未解鎖任何成就</div>
        )}
      </div>
    </div>
  );
}
