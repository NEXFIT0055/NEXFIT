import GameCard from './GameCard';
import ReactionGame from './ReactionGame';
import MemoryGame from './MemoryGame';
import FruitCatchGame from './FruitCatchGame/Game';
import React from 'react'

export const games = [
  { id: 'reaction', name: '反應遊戲', component: ReactionGame },
  { id: 'memory', name: '記憶遊戲', component: MemoryGame },
  { id: 'fruit', name: '接水果遊戲', component: FruitCatchGame },
];

export default function GameMenu() {
  return (
    <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
      {games.map((game) => (
        <GameCard key={game.id} id={game.id} title={game.name} />
      ))}
    </div>
  );
}
