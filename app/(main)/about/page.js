"use client";

import { motion } from "framer-motion";

const sections = [
  {
    title: "整合個人運動與健康管理",
    description:
      "本網站旨在協助一般使用者記錄個人運動行為與健康數據，透過系統化方式管理其運動計畫、飲食習慣、體態變化，並視覺化呈現成果，提升自我健康意識。",
    image: "/images/about/about01.jpg",
  },
  {
    title: "提升運動持續力與目標達成率",
    description:
      "透過「運動成就系統」與「運動紀錄追蹤」，鼓勵使用者維持運動習慣。使用者可獲得徽章與獎勵，增加動機與參與感，達成像是「連續運動滿 30 天」等具體目標。",
    image: "/images/about/about02.jpg",
  },
  {
    title: "提供專業追蹤與個案管理功能",
    description:
      "針對需長期追蹤的使用者（如減重者、慢性病患者、運動傷害者），平台可作為「個案管理工具」，讓管理者（如運動指導員、健康管理師）能遠端查看個案紀錄並提供建議或修正計畫。",
    image: "/images/about/about03.jpg",
  },
  {
    title: "建立知識分享與社群支持空間",
    description:
      "藉由內建論壇系統，鼓勵使用者分享經驗、提問討論，建立支持型社群。使用者不僅能記錄自己的進展，也能透過閱讀他人文章與留言互動獲得鼓勵。",
    image: "/images/about/about04.jpg",
  },
];

const About = () => {
  return (
    <div className="min-h-screen relative overflow-x-hidden">
      {/* 頁面標題 */}
      <motion.h1
        className="text-[24px] md:text-4xl font-extrabold text-[#101828] text-center tracking-tight pt-20 pb-4 drop-shadow-lg relative z-20"
        initial={{ opacity: 0, y: -40 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 1 }}
      >
        關於我們
      </motion.h1>
      {/* 底線動畫 */}
      <motion.div
        className="mx-auto bg-[#AFC16D] h-1 w-0 mb-4"
        initial={{ width: 0 }}
        animate={{ width: "120px" }}
        transition={{ duration: 0.8, delay: 0.5 }}
      />
      <div className="relative z-10">
        {sections.map((section, idx) => {
          const isOdd = idx % 2 === 0;
          return (
            <section
              key={section.title}
              className="w-full min-h-screen flex items-center justify-center relative overflow-hidden"
              style={{ minHeight: "100vh" }}
            >
              <div
                className={`flex w-full h-full items-center justify-center relative flex-col md:flex-row ${
                  isOdd ? "md:flex-row" : "md:flex-row-reverse"
                }`}
              >
                {/* 圖片區塊 */}
                <motion.div
                  className={`w-full md:${isOdd ? "w-3/4" : "w-full"} h-full relative`}
                  style={{ minHeight: "100vh", maxHeight: "120vh" }}
                  initial={{ opacity: 0, x: isOdd ? -80 : 80 }}
                  animate={{ opacity: 1, x: 0 }}
                  transition={{ duration: 1, delay: 0.2 + idx * 0.1 }}
                  exit={{ opacity: 0, x: isOdd ? 80 : -80 }}
                >
                <div className="relative">
                  <div
                    className="absolute inset-0"
                    style={{
                      backgroundImage: `url(${section.image})`,
                      backgroundSize: "cover",
                      backgroundPosition: "center",
                      filter: "blur(60px)", // 背景模糊
                      zIndex: -1,
                    }}
                  ></div>
                  <img
                    src={section.image}
                    alt={section.title}
                    className="relative w-full h-auto md:h-full object-contain md:object-cover md:min-h-screen md:max-h-[120vh]"
                  />
                </div>
                </motion.div>
                {/* 文字區塊 */}
                <motion.div
                  className={`relative z-10 max-w-xl p-8 md:p-12 rounded-2xl shadow-xl backdrop-blur-md bg-white/70 md:bg-white/60 border border-[#F0F0F0] flex flex-col items-center mt-4 md:mt-0 ${
                    isOdd ? "md:-ml-24" : "md:-mr-24"
                  }`}
                  initial={{ opacity: 0, y: 40 }}
                  whileInView={{ opacity: 1, y: 0 }}
                  transition={{ duration: 0.8, delay: 0.4 + idx * 0.1 }}
                  viewport={{ once: true }}
                  style={{
                    marginTop: "10vh",
                    marginBottom: "10vh",
                    boxShadow: "0 8px 32px 0 rgba(31, 38, 135, 0.10)",
                  }}
                >
                  <h2 className="text-2xl md:text-3xl font-bold text-[#101828] mb-4 text-center drop-shadow-lg">
                    {section.title}
                  </h2>
                  <p className="text-[#101828]/90 text-lg md:text-xl leading-relaxed text-center">
                    {section.description}
                  </p>
                </motion.div>
              </div>
            </section>
          );
        })}
      </div>
    </div>
  );
};

export default About;