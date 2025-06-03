'use client';
import { useEffect, useState, useRef } from 'react';
import FruitItem from './FruitItem';
import { useRouter } from 'next/navigation';

export const fruitTypes = ['🍎', '🍌', '🍇', '🍓', '🍊', '🍍', '💣'];

export default function FruitCatchGame({ onComplete, setScore, unlockAchievement }) {
  const [fruits, setFruits] = useState([]);
  const [basketLeft, setBasketLeft] = useState(0);
  const [score, setScoreState] = useState(0);
  const [isRunning, setIsRunning] = useState(false);
  const [countdown, setCountdown] = useState(3); // 直接初始化倒數為3
  const [timeLeft, setTimeLeft] = useState(20);
  const [isQuit, setIsQuit] = useState(false);
  const [isGameOver, setIsGameOver] = useState(false);
  const [containerWidth, setContainerWidth] = useState(0);
  const [scorePopup, setScorePopup] = useState([]);
  const [showCompletionPopup, setShowCompletionPopup] = useState(false);
  const [addedScore, setAddedScore] = useState(0);

  const router = useRouter();
  const bgmRef = useRef(null);
  const basketRef = useRef(null);
  const basketImgRef = useRef(null);
  const animationFrameRef = useRef();

  const BASKET_WIDTH = 282;
  const BASKET_HEIGHT = 282;
  const FRUIT_SIZE = 60;
  const DROP_SPEED = 200;

  useEffect(() => {
    const updateSize = () => {
      const width = window.innerWidth;
      setContainerWidth(width);
      setBasketLeft((width - BASKET_WIDTH) / 2);
    };
    updateSize();
    window.addEventListener('resize', updateSize);
    return () => window.removeEventListener('resize', updateSize);
  }, []);

  // 自動啟動倒數
  useEffect(() => {
    const countdownTimer = setInterval(() => {
      setCountdown((prev) => {
        if (prev === 1) {
          clearInterval(countdownTimer);
          setIsRunning(true);
          bgmRef.current?.play();
        }
        return prev - 1;
      });
    }, 1000);
    return () => clearInterval(countdownTimer);
  }, []);

  useEffect(() => {
    if (!isRunning) return;

    let lastTime = performance.now();
    let lastDrop = lastTime - 1000;

    const loop = (now) => {
      const deltaTime = (now - lastTime) / 1000;
      const deltaDrop = now - lastDrop;

      const containerRect = basketRef.current?.parentNode?.getBoundingClientRect();
      const basketRect = basketRef.current?.getBoundingClientRect();

      setFruits((prev) =>
        prev
          .map((fruit) => {
            const newTop = fruit.top + DROP_SPEED * deltaTime * 1.8;
            const fruitAbsLeft = containerRect ? containerRect.left + fruit.left : fruit.left;
            const fruitAbsTop = containerRect ? containerRect.top + newTop : newTop;

            const fruitCenterX = fruitAbsLeft + FRUIT_SIZE / 2;
            const fruitBottomY = fruitAbsTop + FRUIT_SIZE;

            if (basketRect) {
              const basketLeft = basketRect.left;
              const basketRight = basketRect.right;
              const basketTop = basketRect.top;
              const basketBottom = basketRect.bottom;

              if (
                fruitCenterX >= basketLeft &&
                fruitCenterX <= basketRight &&
                fruitBottomY >= basketTop + basketRect.height * 0.3 &&
                fruitBottomY <= basketBottom
              ) {
                const fruitScore = fruit.type === '💣' ? -20 : 10;
                setScoreState((s) => s + fruitScore);
                setScorePopup((prev) => [
                  ...prev,
                  { id: Date.now(), value: fruitScore, x: fruitAbsLeft, y: fruitAbsTop },
                ]);
                return null;
              }
            }

            if (newTop > window.innerHeight) return null;
            return { ...fruit, top: newTop };
          })
          .filter(Boolean)
      );

      const MAX_FRUITS_ON_SCREEN = 15;
      const BASE_DROP_INTERVAL = 1000;
      const SPEED_FACTOR = 1 + (30 - timeLeft) / 20;
      const adjustedDropInterval = BASE_DROP_INTERVAL / SPEED_FACTOR;

      if (deltaDrop >= adjustedDropInterval) {
        lastDrop = now;
        setFruits((prev) => {
          if (prev.length >= MAX_FRUITS_ON_SCREEN) return prev;
          const dropCount = Math.min(8, Math.floor(SPEED_FACTOR) + 4);
          const newFruits = [];
          for (let i = 0; i < dropCount; i++) {
            const left = Math.random() * (containerWidth - FRUIT_SIZE);
            const type = fruitTypes[Math.floor(Math.random() * fruitTypes.length)];
            const randomTopOffset = Math.random() * 100;
            newFruits.push({ id: Date.now() + Math.random(), top: -randomTopOffset, left, type });
          }
          return [...prev, ...newFruits];
        });
      }

      if (timeLeft <= 0 || score >= 400) {
        setIsRunning(false);
        setIsGameOver(true);
        if (!isQuit) {
          const added = Math.max(0, score);
          setScore?.((prev) => prev + added);
          setAddedScore(added);
          setTimeout(() => setShowCompletionPopup(true), 500);
          if (onComplete) onComplete(score);
          if (unlockAchievement) unlockAchievement(6);
        }
        bgmRef.current?.pause();
        bgmRef.current.currentTime = 0;
        return;
      }

      lastTime = now;
      animationFrameRef.current = requestAnimationFrame(loop);
    };

    animationFrameRef.current = requestAnimationFrame(loop);
    return () => cancelAnimationFrame(animationFrameRef.current);
  }, [isRunning, basketLeft, containerWidth, timeLeft, score, isQuit]);

  useEffect(() => {
    if (!isRunning) return;
    const interval = setInterval(() => setTimeLeft((t) => t - 1), 1000);
    return () => clearInterval(interval);
  }, [isRunning]);

  useEffect(() => {
    let held = {};
    const step = 15;
    const interval = setInterval(() => {
      if (held['ArrowLeft']) setBasketLeft((l) => Math.max(0, l - step));
      if (held['ArrowRight']) setBasketLeft((l) => Math.min(containerWidth - BASKET_WIDTH, l + step));
    }, 20);
    const down = (e) => (held[e.key] = true);
    const up = (e) => (held[e.key] = false);
    document.addEventListener('keydown', down);
    document.addEventListener('keyup', up);
    return () => {
      clearInterval(interval);
      document.removeEventListener('keydown', down);
      document.removeEventListener('keyup', up);
    };
  }, [containerWidth]);

  useEffect(() => {
    if (scorePopup.length === 0) return;
    const timer = setTimeout(() => {
      setScorePopup((prev) => prev.slice(1));
    }, 800);
    return () => clearTimeout(timer);
  }, [scorePopup]);

  useEffect(() => {
    if (showCompletionPopup) {
      const timer = setTimeout(() => setShowCompletionPopup(false), 3000);
      return () => clearTimeout(timer);
    }
  }, [showCompletionPopup]);

  const handleRetry = () => {
    setScoreState(0);
    setTimeLeft(30);
    setFruits([]);
    setIsGameOver(false);
    setCountdown(3); // 重新設定倒數
    setIsRunning(false);
    setBasketLeft((containerWidth - BASKET_WIDTH) / 2);
  };

  return (
    <div className="relative w-full h-screen overflow-hidden bg-[url('/images/stars.gif')] bg-cover">
      <audio ref={bgmRef} src="/audio/bgm.mp3" loop />
      {countdown > 0 && (
        <div className="absolute inset-0 flex items-center justify-center text-6xl font-bold bg-white/80 z-10">
          {countdown}
        </div>
      )}
      {isGameOver && (
        <div className="absolute inset-0 bg-black/60 flex flex-col items-center justify-center text-white z-20">
          <h2 className="text-3xl font-bold mb-4">🎉 遊戲結束</h2>
          <p className="text-xl mb-4">你的得分是：{score}</p>
          <button onClick={handleRetry} className="bg-white text-black px-4 py-2 rounded hover:bg-gray-200">
            再玩一次
          </button>
        </div>
      )}
      {isRunning && (
        <div className="absolute top-2 left-2 bg-white text-black text-sm px-2 py-1 rounded shadow z-10">
          時間：{timeLeft} 秒
        </div>
      )}
      <div className="absolute top-2 right-2 bg-white text-black text-sm px-2 py-1 rounded shadow z-10">
        得分：{score}
      </div>
      <div
        ref={basketRef}
        style={{
          position: 'absolute',
          left: `${basketLeft}px`,
          bottom: '120px',
          width: `${BASKET_WIDTH}px`,
          height: `${BASKET_HEIGHT}px`,
        }}
      >
        <img
          ref={basketImgRef}
          src="/images/funny-man-basket.gif"
          alt="角色"
          className="w-full h-full object-contain"
        />
      </div>
      {fruits.map((fruit) => (
        <FruitItem key={fruit.id} top={fruit.top} left={fruit.left} type={fruit.type} size={FRUIT_SIZE} />
      ))}

      {showCompletionPopup && (
        <div className="fixed top-4 left-1/2 transform -translate-x-1/2 bg-green-500 text-white text-lg px-4 py-2 rounded shadow z-50 animate-slideDown">
          🎉 任務完成！獲得 20 積分！
        </div>
      )}

      <style jsx global>{`
        @keyframes popupMove {
          0% { opacity: 1; transform: translateY(0); }
          100% { opacity: 0; transform: translateY(-50px); }
        }
        @keyframes slideDown {
          0% { opacity: 0; transform: translateY(-20px) translateX(-50%); }
          100% { opacity: 1; transform: translateY(0) translateX(-50%); }
        }
        .animate-slideDown {
          animation: slideDown 0.3s ease-out;
        }
      `}</style>
    </div>
  );
}
