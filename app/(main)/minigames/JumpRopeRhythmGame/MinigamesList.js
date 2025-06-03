// MinigamesList.js
'use client';
import { useState } from 'react';
import JumpRopeGame from './JumpRopeRhythmGame/JumpRopeGame';

export default function MinigamesList() {
  const [showGame, setShowGame] = useState(false);
  return (
    <div>
      <h1>小遊戲列表</h1>
      <button onClick={() => setShowGame(!showGame)}>
        {showGame ? '關閉跳繩遊戲' : '打開跳繩遊戲'}
      </button>
      {showGame && <JumpRopeGame onClose={() => setShowGame(false)} />}
    </div>
  );
}
