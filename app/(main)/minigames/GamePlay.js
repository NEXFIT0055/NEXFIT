import { games } from './index';

export default function GamePlay({ id, onComplete }) {
  const game = games.find(g => g.id === id);

  if (!game) return <p className="text-red-500">找不到遊戲</p>;

  const GameComponent = game.component;
  return <GameComponent onComplete={onComplete} />;
}
