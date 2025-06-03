'use client';
import { useState } from 'react';

export default function ReactionGame({ onComplete }) {
  const [showTarget, setShowTarget] = useState(false);
  const [message, setMessage] = useState('按下「開始遊戲」');
  const [startTime, setStartTime] = useState(null);
  const [reactionTime, setReactionTime] = useState(null);
  const [scoreGiven, setScoreGiven] = useState(false);
  const [gameActive, setGameActive] = useState(false);

  const startGame = () => {
    setMessage('準備中...');
    setGameActive(true);
    setReactionTime(null);
    setScoreGiven(false);

    const delay = Math.random() * 3000 + 1000;
    setTimeout(() => {
      setShowTarget(true);
      setStartTime(Date.now());
      setMessage('點擊現在！');
    }, delay);
  };

  const handleClick = () => {
    if (!gameActive) return;

    if (!showTarget) {
      setMessage('太早了！請重新開始');
      setGameActive(false);
      return;
    }

    const time = Date.now() - startTime;
    setReactionTime(time);
    setShowTarget(false);
    setGameActive(false);

    if (!scoreGiven && onComplete) {
      let score = 0;
      if (time <= 150) score = 100;
      else if (time <= 200) score = 80;
      else if (time <= 250) score = 50;
      else if (time <= 300) score = 30;
      else score = 10;

      onComplete(score);
      setScoreGiven(true);
    }

    setMessage(`反應時間：${time} 毫秒`);
  };

  return (
    <div className="p-8 max-w-lg mx-auto bg-white rounded-2xl shadow-xl space-y-6 border border-gray-200">
      <h2 className="text-2xl font-bold text-center text-blue-700">🎯 反應速度挑戰</h2>
      <button
        onClick={startGame}
        className="w-full bg-blue-600 hover:bg-blue-700 text-white py-3 px-6 rounded-lg text-lg"
      >
        開始遊戲
      </button>
      <div
        onClick={handleClick}
        className={`w-full h-48 flex items-center justify-center text-2xl font-bold rounded-xl cursor-pointer transition ${
          showTarget ? 'bg-green-500 text-white' : 'bg-gray-300 text-gray-700'
        }`}
      >
        {message}
      </div>
      {reactionTime && (
        <div className="text-center text-gray-600 text-lg">
          本次成績：{reactionTime} 毫秒
        </div>
      )}
    </div>
  );
}