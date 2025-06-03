"use client";
import { useRef } from "react";
import { FaRegUser, FaRegClock, FaArrowLeft } from "react-icons/fa";
import { Button } from "@/app/components/ui/button";
import { Card, CardContent, CardTitle, CardDescription } from "@/app/components/ui/card";
import { motion, useInView } from "framer-motion";
import { useRouter } from "next/navigation";
// import AnimatedBackground from "@/app/(forum)/forum/_components/AnimatedBackground";

const showcaseItems = [
  {
    id: 1,
    title: "三個月減重 10 公斤",
    author: "王小明",
    date: "2024-03-15 ~ 2024-06-15",
    beforeImage: "/images/forum/showcase/man01-1.jpg",
    afterImage: "/images/forum/showcase/man01-2.jpg",
    description: "透過規律運動和健康飲食，成功在三個月內減重 10 公斤。",
    highlight: "減重 10kg / 12週",
  },
  {
    id: 2,
    title: "增肌計畫：從瘦弱到強壯",
    author: "李大壯",
    date: "2024-03-10 ~ 2024-09-10",
    beforeImage: "/images/forum/showcase/man02-1.jpg",
    afterImage: "/images/forum/showcase/man02-2.jpg",
    description: "六個月的重量訓練，體重增加 8 公斤，體脂率維持在 15%。",
    highlight: "增肌 8kg / 24週",
  },
  {
    id: 3,
    title: "改善體態：從駝背到挺拔",
    author: "張美玲",
    date: "2024-03-05 ~ 2024-05-30",
    beforeImage: "/images/forum/showcase/woman03-1.jpg",
    afterImage: "/images/forum/showcase/woman03-2.jpg",
    description: "透過瑜珈和核心訓練，改善姿勢問題，提升整體氣質。",
    highlight: "體態改善 / 8週",
  },
  {
    id: 4,
    title: "健康飲食改善計畫",
    author: "陳健康",
    date: "2024-03-01 ~ 2024-04-15",
    beforeImage: "/images/forum/showcase/man03-1.jpg",
    afterImage: "/images/forum/showcase/man03-2.jpg",
    description: "調整飲食習慣，改善腸胃問題，提升整體健康狀態。",
    highlight: "腸胃改善 / 6週",
  },
  {
    id: 5,
    title: "減重 15 公斤的旅程",
    author: "林小芳",
    date: "2024-02-28 ~ 2024-08-28",
    beforeImage: "/images/forum/showcase/woman01-1.jpg",
    afterImage: "/images/forum/showcase/woman01-2.jpg",
    description: "透過有氧運動和飲食控制，半年內成功減重 15 公斤。",
    highlight: "減重 15kg / 24週",
  },
  {
    id: 6,
    title: "增肌減脂同步進行",
    author: "黃建國",
    date: "2024-02-25 ~ 2024-08-25",
    beforeImage: "/images/forum/showcase/man04-1.jpg",
    afterImage: "/images/forum/showcase/man04-2.jpg",
    description: "專業的訓練計畫，同時達到增肌和減脂的目標。",
    highlight: "增肌減脂 / 20週",
  },
  {
    id: 7,
    title: "體脂率下降 8%",
    author: "吳小安",
    date: "2024-02-20 ~ 2024-06-20",
    beforeImage: "/images/forum/showcase/woman02-1.jpg",
    afterImage: "/images/forum/showcase/woman02-2.jpg",
    description: "有系統的飲食與運動，體脂率從 28% 降到 20%。",
    highlight: "體脂-8% / 16週",
  },
  {
    id: 8,
    title: "運動習慣養成",
    author: "周怡君",
    date: "2024-02-15 ~ 2024-05-15",
    beforeImage: "/images/forum/showcase/woman04-1.jpg",
    afterImage: "/images/forum/showcase/woman04-2.jpg",
    description: "從零運動到每週運動 4 次，精神與體力明顯提升。",
    highlight: "運動習慣 / 12週",
  }
];

// 子元件，避免在 map 內宣告 hook
function ShowcaseCard({ item, index }) {
  const ref = useRef(null);
  const isInView = useInView(ref, { once: true });

  return (
    <motion.div
      ref={ref}
      initial={{ opacity: 0, y: 20 }}
      animate={isInView ? { opacity: 1, y: 0 } : {}}
      transition={{ duration: 0.5, delay: index * 0.05 }}
    >
      <Card
        className={`bg-[#FBF9FA] rounded-2xl shadow flex flex-col md:flex-row ${
          index % 2 === 0 ? "md:flex-row" : "md:flex-row-reverse"
        } overflow-hidden`}
      >
        {/* 左側 Before/After 圖片 */}
        <div className="flex md:w-1/2 w-full h-80 md:h-auto">
          <div className="w-1/2 h-full relative">
            <img
              src={item.beforeImage}
              alt="Before"
              className="w-full h-full object-cover"
              onError={(e) => {
                e.target.onerror = null;
                e.target.src = "/showcase/placeholder.jpg";
              }}
            />
            <div className="absolute top-2 left-2 bg-[#AFC16D] text-[#FBF9FA] text-xxl px-2 py-0.5 rounded">
              Before
            </div>
          </div>
          <div className="w-1/2 h-full relative">
            <img
              src={item.afterImage}
              alt="After"
              className="w-full h-full object-cover"
              onError={(e) => {
                e.target.onerror = null;
                e.target.src = "/showcase/placeholder.jpg";
              }}
            />
            <div className="absolute top-2 left-2 bg-[#AFC16D] text-[#FBF9FA] text-xxl px-2 py-0.5 rounded">
              After
            </div>
          </div>
        </div>
        {/* 右側資訊 */}
        <CardContent className="flex-1 flex flex-col justify-center p-6">
          <div className="flex items-center gap-2 mb-2">
            <span className="bg-[#AFC16D] text-[#FBF9FA] text-xl px-3 py-1 mt-3 rounded-full">
              {item.highlight}
            </span>
          </div>
          <CardTitle className="text-2xl font-semibold text-[#101828] mb-4">
            {item.title}
          </CardTitle>
          <CardDescription className="text-[#101828]/70 text-base mb-4">
            {item.description}
          </CardDescription>
          <div className="flex items-center gap-6 text-base text-[#101828]/50 mb-2">
            <div className="flex items-center gap-1.5">
              <FaRegUser className="text-[#AFC16D]" />
              {item.author}
            </div>
            <div className="flex items-center gap-1.5">
              <FaRegClock className="text-[#AFC16D]" />
              {item.date}
            </div>
          </div>
        </CardContent>
      </Card>
    </motion.div>
  );
}

export default function ShowcasePage() {
  const router = useRouter();
  return (
    <div className="min-h-screen py-10">
      {/* <AnimatedBackground /> */}
      <motion.div
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.5 }}
        className="relative z-10 max-w-7xl mx-auto px-2 md:px-8 py-10 space-y-6 bg-white/80 backdrop-blur-sm rounded-lg"
      ></motion.div>
      <div className="max-w-7xl mx-auto px-2">
        <h1 className="flex items-center gap-3 text-3xl font-light text-[#101828] mb-8">
          <span className="inline-block w-2 h-8 bg-[#AFC16D] rounded-sm" />
          成果展示
        </h1>
        <div className="space-y-12">
          {showcaseItems.map((item, index) => (
            <ShowcaseCard key={item.id} item={item} index={index} />
          ))}
        </div>
        {/* 按鈕 */}
        <div className="mt-10 text-center">
          <Button
            type="button"
            variant="outline"
            size="md"
            className="px-6 py-2 text-black border-black hover:bg-gray-100 rounded-md flex items-center gap-2 cursor-pointer"
            onClick={() => router.push("/forum")}
          >
            <FaArrowLeft className="inline" />
            返回論壇主頁
          </Button>
        </div>
      </div>
    </div>
  );
}