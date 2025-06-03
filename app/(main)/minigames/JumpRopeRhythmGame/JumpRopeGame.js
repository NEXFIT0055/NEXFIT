'use client';
import { useState, useEffect, useRef } from 'react';
import { Howl } from 'howler';
import Image from 'next/image';
import './JumpRopeGame.css';

export default function JumpRopeGame() {
  const [score, setScore] = useState(0);
  const [combo, setCombo] = useState(0);
  const [status, setStatus] = useState('準備開始');
  const [isPlaying, setIsPlaying] = useState(false);
  const [notes, setNotes] = useState([]);
  const [progress, setProgress] = useState(0);
  const [isJumping, setIsJumping] = useState(false);
  const [isGameOver, setIsGameOver] = useState(false);

  const audioRef = useRef(null);
  const rippleRef = useRef(null);

  useEffect(() => {
    audioRef.current = new Howl({
      src: ['/audio/music.mp3'],
      onend: () => {
        setIsPlaying(false);
        setStatus('🏁 遊戲結束');
      }
    });
  }, []);

  useEffect(() => {
    const interval = setInterval(() => {
      if (isPlaying && audioRef.current) {
        const current = audioRef.current.seek();
        const duration = audioRef.current.duration();
        setProgress((current / duration) * 100);
      }
    }, 100);
    return () => clearInterval(interval);
  }, [isPlaying]);

  useEffect(() => {
    const handleKeyDown = (e) => {
      if (!isPlaying || !audioRef.current) return;
      if (e.code !== 'Space') return;

      const currentTime = audioRef.current.seek();
      const nearest = notes.reduce((prev, curr) => {
        const prevDiff = Math.abs(prev.time - currentTime);
        const currDiff = Math.abs(curr.time - currentTime);
        return currDiff < prevDiff ? curr : prev;
      }, notes[0]);

      const delta = Math.abs(nearest?.time - currentTime);

      if (delta < 0.2) {
        setScore(prev => prev + 100);
        setCombo(prev => prev + 1);
        setStatus('🎯 Perfect!');
        setNotes(prev => prev.filter(n => n !== nearest));
      } else if (delta < 0.5) {
        setScore(prev => prev + 50);
        setCombo(0);
        setStatus('👍 Good');
        setNotes(prev => prev.filter(n => n !== nearest));
      } else {
        setCombo(0);
        setStatus('❌ Miss');
        setIsGameOver(true);
        setIsPlaying(false);
        audioRef.current.stop();
      }

      setIsJumping(true);
      setTimeout(() => setIsJumping(false), 300);
    };

    window.addEventListener('keydown', handleKeyDown);
    return () => window.removeEventListener('keydown', handleKeyDown);
  }, [isPlaying, notes]);

  const startGame = () => {
    if (isPlaying) return;
    setIsGameOver(false);
    setScore(0);
    setCombo(0);
    setStatus('遊戲中...');
    const duration = audioRef.current.duration();
    const interval = 0.25;
    const generatedNotes = generateBeats(duration, interval);
    setNotes(generatedNotes);
    audioRef.current.play();
    setIsPlaying(true);
  };

  const handleRipple = (e) => {
    const container = rippleRef.current;
    const ripple = document.createElement('span');
    ripple.className = 'ripple';
    ripple.style.left = `${e.clientX - container.getBoundingClientRect().left}px`;
    ripple.style.top = `${e.clientY - container.getBoundingClientRect().top}px`;
    container.appendChild(ripple);
    setTimeout(() => ripple.remove(), 600);
  };

  return (
    <div className="ripple-container" ref={rippleRef} onClick={handleRipple}>
      <div className="jump-rope-container">
        <div className="stars-layer">
          {Array.from({ length: 60 }).map((_, i) => (
            <div
              key={i}
              className={`twinkling-star ${!isPlaying ? 'paused' : ''}`}
              style={{
                top: `${Math.random() * 100}%`,
                left: `${Math.random() * 100}%`,
                animationDelay: `${Math.random() * 2}s`
              }}
            />
          ))}
        </div>

        <div className="top-bar">
          <div>分數: {score}</div>
          <div>Combo: {combo}</div>
          <div>{status}</div>
        </div>

        <button onClick={startGame} className="start-button">
          {isPlaying ? '遊戲中' : '開始遊戲'}
        </button>

        <svg
          className={`svg-rope ${isJumping ? 'animate' : ''}`}
          viewBox="0 0 200 50"
          xmlns="http://www.w3.org/2000/svg"
        >
          <path
            d="M0,50 Q100,0 200,50"
            fill="transparent"
            stroke="white"
            strokeWidth="4"
          />
        </svg>

        <div className={`character ${isJumping ? 'jump' : ''}`}>
          <Image
            src={isGameOver ? "/images/fall-down.gif" : "/images/funny-man-basket.gif"}
            alt="runner"
            width={200}
            height={200}
          />
        </div>

        <div className="progress-bar">
          <div className="progress" style={{ width: `${progress}%` }} />
        </div>
      </div>
    </div>
  );
}

function generateBeats(duration, interval = 0.2) {
  const beats = [];
  for (let t = 0; t <= duration; t += interval) {
    beats.push({ time: parseFloat(t.toFixed(2)) });
  }
  return beats;
}
