'use client';
import { useEffect, useRef } from 'react';

export default function FireCanvas() {
  const canvasRef = useRef(null);

  useEffect(() => {
    const canvas = canvasRef.current;
    if (!canvas) return;
    const ctx = canvas.getContext('2d');

    canvas.width = window.innerWidth;
    canvas.height = 150;

    const particles = [];

    function createParticle() {
      const x = Math.random() * canvas.width;
      const y = canvas.height;
      const size = Math.random() * 50 + 50;
      const speed = Math.random() * 1 + 0.5;
      const radius = Math.random() * 2 + 1;
      const color = `rgba(255, ${Math.floor(Math.random() * 155 )}, 0, ${Math.random()})`;
      return { x, y, speed, radius, color };
    }

    function drawParticle(p) {
      ctx.beginPath();
      ctx.arc(p.x, p.y, p.radius, 0, Math.PI * 2);
      ctx.fillStyle = p.color;
      ctx.fill();
    }

    function update() {
      ctx.clearRect(0, 0, canvas.width, canvas.height);
      while (particles.length < 80) {
        particles.push(createParticle());
      }

      for (let i = 0; i < particles.length; i++) {
        const p = particles[i];
        p.y -= p.speed;
        p.x += Math.random() * 1 - 0.5;
        if (p.y < 0) particles.splice(i, 1);
        else drawParticle(p);
      }

      requestAnimationFrame(update);
    }

    update();
  }, []);

  return (
    <canvas
      ref={canvasRef}
      className="pointer-events-none absolute bottom-0 left-0 w-full h-[200px] z-0"
    />
  );
}
