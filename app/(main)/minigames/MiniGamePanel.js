'use client';
import { Dialog, DialogTrigger, DialogContent, DialogHeader } from '../ui/dialog';
import { games } from './index';
import { useState } from 'react';

export default function MiniGamePanel({ onScoreGain }) {
  const [open, setOpen] = useState(false);
  const [selectedGame, setSelectedGame] = useState(null);

  const handleOpen = (game) => {
    setSelectedGame(game);
    setOpen(true);
  };

  return (
    <div>
      <h2 className="font-bold text-lg mb-4">小遊戲清單</h2>
      <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
        {games.map(game => (
          <DialogTrigger key={game.id} onClick={() => handleOpen(game)}>
            {game.name}
          </DialogTrigger>
        ))}
      </div>

      {open && selectedGame && (
        <Dialog>
          <DialogContent>
            <DialogHeader title={selectedGame.name} />
            <selectedGame.component
              onComplete={(score) => {
                onScoreGain(score);
                setOpen(false);
              }}
            />
          </DialogContent>
        </Dialog>
      )}
    </div>
  );
}
