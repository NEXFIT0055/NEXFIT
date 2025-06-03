"use client";

import { useState } from "react";
import { TfiPlus, TfiMinus } from "react-icons/tfi";
import { motion, AnimatePresence } from "framer-motion";

const faqs = [
  {
    q: "這個平台主要提供什麼功能？",
    a: "本平台整合運動紀錄、健康數據、飲食管理、成就系統與社群互動，協助使用者全方位管理個人健康與運動目標。",
  },
  {
    q: "如何追蹤我的運動與健康數據？",
    a: "您可以在個人頁面記錄每日運動、飲食與身體數據，系統會自動生成圖表，幫助您追蹤進展。",
  },
  {
    q: "什麼是運動成就系統？",
    a: "運動成就系統會根據您的運動紀錄自動頒發徽章與獎勵，提升運動動機。例如連續運動30天、達成特定目標等。",
  },
  {
    q: "我可以和其他用戶互動嗎？",
    a: "可以！您可以在論壇發表文章、留言、按讚，與其他用戶交流經驗、互相鼓勵。",
  },
  {
    q: "平台適合哪些人使用？",
    a: "無論是一般健康管理、減重、慢性病追蹤、運動傷害復健者，都能透過本平台獲得個人化管理與專業建議。",
  },
  {
    q: "我的資料安全嗎？",
    a: "我們重視您的隱私，所有個人資料皆加密儲存，僅用於健康管理與平台功能，不會對外公開。",
  },
    {
    q: "如何聯繫平台客服？",
    a: "您可以透過平台的聯繫我們頁面提交問題，或直接發送電子郵件至 support@example.com，我們將在 24 小時內回覆。",
  },
];

const FAQ = () => {
  const [openIdxs, setOpenIdxs] = useState([]);

  const handleToggle = (idx) => {
    setOpenIdxs((prev) =>
      prev.includes(idx) ? prev.filter((i) => i !== idx) : [...prev, idx]
    );
  };

  return (
    <div className="min-h-screen py-20 px-2 md:px-0 flex flex-col items-center">
      <motion.h1
        className="text-[24px] md:text-4xl font-extrabold text-[#101828] text-center tracking-tight pt-4 pb-4 drop-shadow-lg relative z-20"
        initial={{ opacity: 0, y: -40 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.5 }}
      >
        常見問答
      </motion.h1>
      {/* 底線動畫 */}
      <motion.div
        className="mx-auto bg-[#AFC16D] h-1 w-0"
        initial={{ width: 0 }}
        animate={{ width: "120px" }}
        transition={{ duration: 0.8, delay: 0.5 }}
      />
      <div className="w-full max-w-2xl mt-8 border-t border-[#F0F0F0] bg-white/90">
        {faqs.map((item, idx) => (
          <div key={item.q}>
            <button
              className="w-full flex items-center justify-between px-0 md:px-4 py-6 text-left focus:outline-none group select-none"
              onClick={() => handleToggle(idx)}
              aria-expanded={openIdxs.includes(idx)}
              style={{ fontWeight: 600, color: '#101828', background: 'transparent' }}
            >
              <span className="text-base md:text-lg">{item.q}</span>
              <span className="ml-4 text-[#AFC16D] text-2xl font-bold transition-transform duration-200">
                {openIdxs.includes(idx) ? <TfiMinus /> : <TfiPlus />}
              </span>
            </button>
              <AnimatePresence initial={false}>
                {openIdxs.includes(idx) && (
                  <motion.div
                    key="content"
                    layout // 使用 layout 屬性讓高度變化更流暢
                    initial={{ opacity: 0, height: 0 }}
                    animate={{ opacity: 1, height: "auto" }}
                    exit={{ opacity: 0, height: 0 }}
                    transition={{
                      duration: 0.4, // 調整動畫持續時間
                      ease: [0.25, 0.1, 0.25, 1], // 使用更平滑的貝茲曲線
                    }}
                    className="px-0 md:px-4 text-[#101828] text-base md:text-lg bg-[#F0F0F0] overflow-hidden"
                    style={{ lineHeight: 1.7 }}
                  >
                    {item.a}
                  </motion.div>
                )}
              </AnimatePresence>
            {/* 分隔線，最後一個不顯示 */}
            {idx !== faqs.length - 1 && <div className="border-b border-[#F0F0F0]" />}
          </div>
        ))}
      </div>
    </div>
  );
};

export default FAQ; 