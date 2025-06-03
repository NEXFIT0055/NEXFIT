'use client';

import { useState, useLayoutEffect } from 'react';
import FruitCatchGame from './FruitCatchGame/Game';
import styles from './Minigames.module.css';

export default function MinigamesPage() {
  const [gameStarted, setGameStarted] = useState(false);

  const handleGameOver = () => {
    // 回到主選單
    setGameStarted(false);
  };

  useLayoutEffect(() => {
    if (gameStarted) {
      // 初始化動畫或其他需要在畫面準備好後執行的邏輯
      // 例如：設定 canvas 大小、載入資源等
    }
  }, [gameStarted]);

  return (
    <div className={styles.container}>
      {/* 星空背景 */}
      <div className={styles.starBackground}>
        {Array.from({ length: 100 }).map((_, i) => (
          <div
            key={i}
            className={styles.star}
            style={{
              top: `${Math.random() * 100}%`,
              left: `${Math.random() * 100}%`,
              animationDelay: `${Math.random() * 5}s`,
              animationDuration: `${3 + Math.random() * 3}s`, // 隨機速度
            }}
          />
        ))}
      </div>

      {!gameStarted ? (
        <div className="absolute inset-0 flex flex-col items-center justify-center z-10">
          <h1 className="text-4xl font-bold text-white mb-4 drop-shadow-lg">🌟 星空接水果遊戲 🌟</h1>
          <button
            onClick={() => setGameStarted(true)}
            className="px-8 py-4 bg-gradient-to-r from-pink-500 to-yellow-400 text-white rounded-full text-2xl font-bold shadow-lg hover:scale-110 transition"
          >
            開始遊戲
          </button>
        </div>
      ) : (
        <div className="relative w-full h-full">
          <FruitCatchGame onGameOver={handleGameOver} />
        </div>
      )}
    </div>
  );
}
