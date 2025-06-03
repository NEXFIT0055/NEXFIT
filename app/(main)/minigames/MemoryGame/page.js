'use client';
import { useState, useEffect } from 'react';
import styles from './MemoryGame.module.css'; // 放上面的 flip-card CSS

const icons = ['🏃', '🏋️', '🏀', '🚴', '⛹️', '🤾', '🏊', '🤸'];

function shuffle(array) {
  return [...array, ...array]
    .sort(() => Math.random() - 0.5)
    .map((val, index) => ({
      id: index,
      value: val,
      isFlipped: false,
      isMatched: false
    }));
}

export default function MemoryGame({ onComplete }) {
  const [cards, setCards] = useState([]);
  const [flipped, setFlipped] = useState([]);
  const [matchedCount, setMatchedCount] = useState(0);

  useEffect(() => {
    setCards(shuffle(icons));
  }, []);

  const handleClick = (index) => {
    if (flipped.length === 2 || cards[index].isFlipped || cards[index].isMatched) return;

    const newCards = [...cards];
    newCards[index].isFlipped = true;
    const newFlipped = [...flipped, index];

    setCards(newCards);
    setFlipped(newFlipped);

    if (newFlipped.length === 2) {
      const [a, b] = newFlipped;
      if (newCards[a].value === newCards[b].value) {
        newCards[a].isMatched = true;
        newCards[b].isMatched = true;
        setMatchedCount((prev) => prev + 1);
        setFlipped([]);
        if (matchedCount + 1 === icons.length) {
          onComplete?.(100);
          alert('🏅 成功完成記憶遊戲！');
        }
      } else {
        setTimeout(() => {
          newCards[a].isFlipped = false;
          newCards[b].isFlipped = false;
          setCards([...newCards]);
          setFlipped([]);
        }, 800);
      }
    }
  };

  return (
    <div className="grid grid-cols-4 gap-4 p-6 max-w-md mx-auto">
    <img src="/icons/basketball.png" alt="運動圖示" className="w-10 h-10 mx-auto" />
      {cards.map((card, index) => (
        <div
          key={card.id}
          className={`${styles['card-container']} ${card.isFlipped || card.isMatched ? styles.flipped : ''}`}
          onClick={() => handleClick(index)}
        >
          <div className={styles['card-inner']}>
            <div className={styles['card-front']}>❓</div>
            <div className={styles['card-back']}>{card.value}</div>
          </div>
        </div>
      ))}
    </div>
  );
}
