'use client';

import Link from 'next/link';
import { useState, useEffect } from 'react';
import { motion } from 'framer-motion';

export default function NotFound() {
  const [text, setText] = useState('');
  const message = "OMG - 跑到奇怪的地方啦！！！";

  useEffect(() => {
    let index = 0;
    const interval = setInterval(() => {
      index++;
      if (index <= message.length) {
        setText(message.substring(0, index));
      } else {
        clearInterval(interval);
      }
    }, 100);
    return () => clearInterval(interval);
  }, []);

  return (
    <div className="min-h-screen flex flex-col items-center justify-center bg-gradient-to-br from-[#ffe4c4] to-[#fff5e1] text-black text-center p-8 relative w-full overflow-hidden">
      <div className="relative z-10 max-w-4xl w-full flex flex-col items-center space-y-6">
        
        {/* GIF 跑動動畫 */}
        <motion.img
          src="/images/runner.gif"
          alt="Runner Animation"
          className="w-32 h-32"
          animate={{ x: ['100%', '-150%'] }}
          transition={{ repeat: Infinity, duration: 0.3, ease: 'linear' }}
        />

        {/* 顯示文字 */}
        <h1 className="text-4xl font-extrabold tracking-widest py-4 w-full">
          {text}
        </h1>

        {/* 段落與按鈕間距加大 */}
        <p className="text-2xl max-w-2xl mb-8">
          別緊張，讓我們帶你回首頁！
        </p>

        {/* 返回首頁按鈕 + 金色發光描邊效果 */}
        <div className="relative flex items-center justify-center">
          {/* 緊貼按鈕的金色高亮光圈 */}
          <motion.div
            className="absolute -inset-y-1 -inset-x-1 rounded-full"
            style={{
              background: 'linear-gradient(to right, #ffd700, #ffb800, #ff9900)',
              filter: 'blur(8px)',
              opacity: 0.9
            }}
            animate={{
              scale: [1, 1.1, 1],
              opacity: [0.7, 1, 0.7],
              boxShadow: [
                '0 0 20px #ffd700',
                '0 0 40px #ffb800',
                '0 0 60px #ff9900'
              ]
            }}

          />

          {/* 按鈕本體，白色背景+黑色字 */}
          <motion.div whileHover={{ scale: 1.1 }} whileTap={{ scale: 0.95 }} className="relative z-10">
            <Link href="/">
              <span className="bg-white text-black font-bold text-2xl py-5 px-12 rounded-full shadow-[0_0_10px_#ffd700,0_0_20px_#ffb800] transition-transform">
                🚀 返回首頁
              </span>
            </Link>
          </motion.div>
        </div>
      </div>
    </div>
  );
}
