"use client";

import Link from "next/link";
import Navbar from "./components/Navbar_index";
import Footer from "@/app/components/Footer_index";
import LoginModal from "./components/login";
import Image from "next/image";
import { useState, useEffect, useRef } from "react";
import { motion } from "framer-motion";
import {
  FaTree,
  FaDumbbell,
  FaUsers,
  FaHome,
  FaHeart,
  FaBalanceScale,
  FaFire,
  FaRandom,
  FaUser,
  FaHandshake,
  FaChalkboardTeacher,
  FaDove,
  FaWeight,
  FaSpa,
  FaRunning,
  FaCalendarAlt,
  FaUtensils,
  FaBed,
  FaRecycle,
  FaSmile,
} from "react-icons/fa";
import { Swiper, SwiperSlide } from "swiper/react";
import "swiper/css";
import "swiper/css/pagination";
import { Pagination, Autoplay, Navigation } from "swiper/modules";
import React from "react";

const products = [
  {
    id: 1,
    title: "乳清蛋白(巧克力口味)",
    image: "/images/hotproducts/img01.png",
    price: 1200,
    originalPrice: 1500,
    rating: 4,
  },
  {
    id: 2,
    title: "分離豌豆蛋白-烏龍奶茶",
    image: "/images/hotproducts/img14.png",
    price: 880,
    originalPrice: 1100,
    rating: 5,
  },
  {
    id: 3,
    title: "蛋白隨搖飲(珍珠奶茶)",
    image: "/images/hotproducts/img21.png",
    price: 440,
    originalPrice: 550,
    rating: 4,
  },
  {
    id: 4,
    title: "涮嘴蛋白酥脆脆(日式海苔)",
    image: "/images/hotproducts/img32.png",
    price: 680,
    originalPrice: 850,
    rating: 5,
  },
  {
    id: 5,
    title: "乳清蛋白(芒果口味)",
    image: "/images/hotproducts/img04.png",
    price: 640,
    originalPrice: 800,
    rating: 5,
  },
  {
    id: 6,
    title: "不鏽鋼搖搖杯(木棉花)",
    image: "/images/hotproducts/img44.png",
    price: 750,
    rating: 5,
  },
  {
    id: 7,
    title: "健行帽TREK 900(深灰)",
    image: "/images/hotproducts/img59.png",
    price: 890,
    rating: 4,
  },
  {
    id: 8,
    title: "登山健行背包(NH Arpenaz 500)",
    image: "/images/hotproducts/img48.png",
    price: 480,
    rating: 5,
  },
  {
    id: 9,
    title: "桌球拍2入組",
    image: "/images/hotproducts/img69.png",
    price: 620,
    rating: 4,
  },
  {
    id: 10,
    title: "成人款滑板車Town",
    image: "/images/hotproducts/img73.png",
    price: 860,
    rating: 5,
  },
];

// 新增心理測驗相關常數
const QUIZ_QUESTIONS = [
  {
    id: 1,
    question: "從下方 4 張卡片中選擇你喜歡的運動環境，找到最適合你的運動類型！",
    options: [
      {
        text: "戶外大自然",
        value: "outdoor",
        icon: <FaTree className="w-12 h-12" />,
      },
      {
        text: "室內健身房",
        value: "indoor",
        icon: <FaDumbbell className="w-12 h-12" />,
      },
      {
        text: "獨自在家",
        value: "home",
        icon: <FaHome className="w-12 h-12" />,
      },
      {
        text: "團體教室",
        value: "group",
        icon: <FaUsers className="w-12 h-12" />,
      },
    ],
  },
  {
    id: 2,
    question: "你期望的運動強度是？",
    options: [
      {
        text: "輕鬆舒緩",
        value: "light",
        icon: <FaSpa className="w-12 h-12" />,
      },
      {
        text: "中等強度",
        value: "medium",
        icon: <FaBalanceScale className="w-12 h-12" />,
      },
      {
        text: "高強度挑戰",
        value: "high",
        icon: <FaFire className="w-12 h-12" />,
      },
      {
        text: "混合強度",
        value: "mixed",
        icon: <FaRandom className="w-12 h-12" />,
      },
    ],
  },
  {
    id: 3,
    question: "你喜歡的運動方式是？",
    options: [
      {
        text: "獨自專注",
        value: "solo",
        icon: <FaUser className="w-12 h-12" />,
      },
      {
        text: "團體互動",
        value: "group",
        icon: <FaHandshake className="w-12 h-12" />,
      },
      {
        text: "一對一指導",
        value: "personal",
        icon: <FaChalkboardTeacher className="w-12 h-12" />,
      },
      {
        text: "自由發揮",
        value: "free",
        icon: <FaDove className="w-12 h-12" />,
      },
    ],
  },
  {
    id: 4,
    question: "你的運動目標是？",
    options: [
      {
        text: "減重塑形",
        value: "weight",
        icon: <FaWeight className="w-12 h-12" />,
      },
      {
        text: "增肌強身",
        value: "muscle",
        icon: <FaDumbbell className="w-12 h-12" />,
      },
      {
        text: "放鬆身心",
        value: "relax",
        icon: <FaSpa className="w-12 h-12" />,
      },
      {
        text: "提升體能",
        value: "fitness",
        icon: <FaRunning className="w-12 h-12" />,
      },
    ],
  },
];

const SPORT_RECOMMENDATIONS = {
  // 戶外系列
  outdoor_light_solo_relax: {
    title: "自然療癒者",
    description:
      "你適合戶外瑜伽、太極拳、健行等舒緩型運動。這些運動能幫助你在大自然中放鬆身心，同時提升身體素質。",
    image: "/images/quiz/yoga-outdoor.jpg",
    tags: ["戶外", "舒緩", "獨處", "療癒"],
  },
  outdoor_medium_group_fitness: {
    title: "戶外探險家",
    description:
      "你適合越野跑、攀岩、戶外團體訓練等活動。這些運動能讓你享受大自然的同時，挑戰自我極限。",
    image: "/images/quiz/outdoor-adventure.jpg",
    tags: ["戶外", "團體", "挑戰", "探險"],
  },
  // 室內系列
  indoor_high_group_fitness: {
    title: "團體戰士",
    description:
      "你適合高強度間歇訓練(HIIT)、拳擊、CrossFit等團體課程。這些運動能激發你的競爭精神，同時建立社交連結。",
    image: "/images/quiz/group-fitness.jpg",
    tags: ["室內", "高強度", "團體", "挑戰"],
  },
  indoor_medium_personal_muscle: {
    title: "力量追求者",
    description:
      "你適合重量訓練、功能性訓練等個人指導課程。這些運動能幫助你建立肌肉，提升力量。",
    image: "/images/quiz/strength-training.jpg",
    tags: ["室內", "中強度", "個人", "力量"],
  },
  // 團體系列
  group_high_group_fitness: {
    title: "團隊領袖",
    description:
      "你適合團體運動如籃球、排球、足球等。這些運動能培養團隊精神，同時提升體能。",
    image: "/images/quiz/team-sports.jpg",
    tags: ["團體", "高強度", "社交", "競技"],
  },
  group_light_group_relax: {
    title: "社交運動者",
    description:
      "你適合團體舞蹈、太極、瑜伽等課程。這些運動能讓你享受社交樂趣，同時保持健康。",
    image: "/images/quiz/group-dance.jpg",
    tags: ["團體", "舒緩", "社交", "樂趣"],
  },
  // 居家系列
  home_light_solo_weight: {
    title: "居家健身達人",
    description:
      "你適合居家健身、徒手訓練、瑜伽等運動。這些運動能讓你在舒適的環境中達到健身目標。",
    image: "/images/quiz/home-fitness.jpg",
    tags: ["居家", "舒緩", "獨處", "便利"],
  },
  home_medium_free_fitness: {
    title: "自由健身者",
    description:
      "你適合居家HIIT、有氧運動、核心訓練等。這些運動能讓你在家也能達到良好的健身效果。",
    image: "/images/quiz/home-hiit.jpg",
    tags: ["居家", "中強度", "自由", "效率"],
  },
  // --- 16組前兩題組合 ---
  outdoor_light: {
    title: "戶外舒緩型",
    description: "你適合在戶外進行輕鬆舒緩的運動，如瑜伽、散步、太極等。",
    image: "/images/quiz/yoga-outdoor.jpg",
    tags: ["戶外", "舒緩"],
  },
  outdoor_medium: {
    title: "戶外中強度型",
    description: "你適合在戶外進行中等強度的運動，如慢跑、登山等。",
    image: "/images/quiz/outdoor-adventure.jpg",
    tags: ["戶外", "中強度"],
  },
  outdoor_high: {
    title: "戶外高強度型",
    description: "你適合在戶外進行高強度運動，如越野跑、登山健行等。",
    image: "/images/quiz/outdoor-adventure.jpg",
    tags: ["戶外", "高強度"],
  },
  outdoor_mixed: {
    title: "戶外混合型",
    description: "你適合在戶外嘗試多種強度的運動，享受多元運動樂趣。",
    image: "/images/quiz/outdoor-adventure.jpg",
    tags: ["戶外", "混合"],
  },
  indoor_light: {
    title: "室內舒緩型",
    description: "你適合在室內進行輕鬆舒緩的運動，如瑜伽、伸展等。",
    image: "/images/quiz/group-fitness.jpg",
    tags: ["室內", "舒緩"],
  },
  indoor_medium: {
    title: "室內中強度型",
    description: "你適合在室內進行中等強度的運動，如健身房重訓、有氧等。",
    image: "/images/quiz/strength-training.jpg",
    tags: ["室內", "中強度"],
  },
  indoor_high: {
    title: "室內高強度型",
    description: "你適合在室內進行高強度運動，如HIIT、拳擊等。",
    image: "/images/quiz/group-fitness.jpg",
    tags: ["室內", "高強度"],
  },
  indoor_mixed: {
    title: "室內混合型",
    description: "你適合在室內嘗試多種強度的運動，享受多元運動樂趣。",
    image: "/images/quiz/group-fitness.jpg",
    tags: ["室內", "混合"],
  },
  group_light: {
    title: "團體舒緩型",
    description: "你適合參加團體舒緩運動，如團體瑜伽、舞蹈等。",
    image: "/images/quiz/group-dance.jpg",
    tags: ["團體", "舒緩"],
  },
  group_medium: {
    title: "團體中強度型",
    description: "你適合參加團體中強度運動，如團體有氧、球類等。",
    image: "/images/quiz/team-sports.jpg",
    tags: ["團體", "中強度"],
  },
  group_high: {
    title: "團體高強度型",
    description: "你適合參加團體高強度運動，如團體HIIT、競技球類等。",
    image: "/images/quiz/team-sports.jpg",
    tags: ["團體", "高強度"],
  },
  group_mixed: {
    title: "團體混合型",
    description: "你適合參加團體混合強度運動，享受多元團體運動樂趣。",
    image: "/images/quiz/team-sports.jpg",
    tags: ["團體", "混合"],
  },
  home_light: {
    title: "居家舒緩型",
    description: "你適合在家進行舒緩運動，如居家瑜伽、伸展等。",
    image: "/images/quiz/home-fitness.jpg",
    tags: ["居家", "舒緩"],
  },
  home_medium: {
    title: "居家中強度型",
    description: "你適合在家進行中強度運動，如居家有氧、核心訓練等。",
    image: "/images/quiz/home-hiit.jpg",
    tags: ["居家", "中強度"],
  },
  home_high: {
    title: "居家高強度型",
    description: "你適合在家進行高強度運動，如居家HIIT、重訓等。",
    image: "/images/quiz/home-hiit.jpg",
    tags: ["居家", "高強度"],
  },
  home_mixed: {
    title: "居家混合型",
    description: "你適合在家嘗試多種強度的運動，享受多元運動樂趣。",
    image: "/images/quiz/home-hiit.jpg",
    tags: ["居家", "混合"],
  },
  // 大方向 fallback
  outdoor: {
    title: "戶外運動愛好者",
    description:
      "你熱愛大自然，適合各種戶外運動，建議多參與戶外活動，享受陽光與新鮮空氣。",
    image: "/images/quiz/yoga-outdoor.jpg",
    tags: ["戶外", "自然", "陽光"],
  },
  indoor: {
    title: "室內運動愛好者",
    description:
      "你偏好在舒適的環境中運動，建議參加健身房、室內團體課程或個人訓練。",
    image: "/images/quiz/group-fitness.jpg",
    tags: ["室內", "舒適", "健身房"],
  },
  group: {
    title: "團體運動愛好者",
    description:
      "你喜歡與人互動，適合參加團體運動如球類、舞蹈等，享受團隊合作的樂趣。",
    image: "/images/quiz/team-sports.jpg",
    tags: ["團體", "互動", "合作"],
  },
  home: {
    title: "居家運動愛好者",
    description:
      "你喜歡在家運動，建議多做徒手訓練、瑜伽或線上課程，方便又自在。",
    image: "/images/quiz/home-fitness.jpg",
    tags: ["居家", "便利", "自在"],
  },
};

const heroSlides = [
  {
    image: "/images/hero1.jpg",
    title: "純淨補給 × 健康進化",
    subtitle: "營養補給，可以很簡單",
    highlight: "簡單",
  },
  {
    image: "/images/hero2.jpg",
    title: "健康生活 × 活力滿分",
    subtitle: "每天一點點，改變很大",
    highlight: "改變很大",
  },
  {
    image: "/images/hero3.jpg",
    title: "均衡飲食 × 健康人生",
    subtitle: "從飲食開始，健康每一天",
    highlight: "健康",
  },
  {
    image: "/images/hero4.jpg",
    title: "運動習慣 × 美好生活",
    subtitle: "運動讓生活更精彩",
    highlight: "精彩",
  },
];

function ExploreCoursesSection() {
  const features = [
    {
      image: "/images/ExploreCourses01.jpg",
      title: "客製化訓練",
      desc: "依身體節奏打造專屬訓練方式，從呼吸、動作到步調，每一步都為你量身設計，讓運動真正貼近你的生活。",
      link: "/reservation/course",
      textGridArea: "1 / 1 / 3 / 5",
      imageGridArea: "2 / 5 / 4 / 8",
    },
    {
      image: "/images/ExploreCourses02.jpg",
      title: "營養補給",
      desc: "用適合自己的方式補營養，吃得開心才能走得更遠。不節食、不勉強，讓身體與心情都得到支持與滋養。",
      link: "/shop/products",
      textGridArea: "4 / 8 / 6 / 12",
      imageGridArea: "5 / 4 / 7 / 8",
    },
    {
      image: "/images/ExploreCourses03.jpg",
      title: "持續練習",
      desc: "一步一腳印地練習與成長，不求快速蛻變，而是專注在每一次的累積中建立長久習慣，打造可持續的健康生活。",
      link: "/reservation/course",
      textGridArea: "7 / 1 / 9 / 5",
      imageGridArea: "8 / 5 / 10 / 9",
    },
    {
      image: "/images/ExploreCourses04.jpg",
      title: "與內在連結",
      desc: "健身不只是流汗與燃燒，更是一場探索自我、與內在對話的旅程。相信自己，活出獨一無二的節奏與生活。",
      link: "/forum",
      textGridArea: "10 / 8 / 12 / 12",
      imageGridArea: "11 / 4 / 13 / 8",
    },
  ];
  return (
    <motion.section
      initial={{ opacity: 0, y: 50 }}
      whileInView={{ opacity: 1, y: 0 }}
      transition={{ duration: 1 }}
      viewport={{ once: false, amount: 0.2 }}
      className="relative bg-[#E7E7E5] overflow-hidden"
    >
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 mb-20">
        {/*  Grid  */}
        <div className="grid grid-cols-12 grid-rows-12 gap-4 ">
          {/* 文字區塊 */}
          {features.map((feature, index) => (
            <motion.div
              key={`text-${index}`}
              initial={{ opacity: 0, x: -30 }}
              whileInView={{ opacity: 1, x: 0 }}
              transition={{ duration: 0.6, delay: index * 0.1 }}
              viewport={{ once: false, amount: 0.3 }}
              className="z-10 flex flex-col justify-center"
              style={{ gridArea: feature.textGridArea }}
            >
              <div className="flex flex-col justify-center items-start text-left bg-transparent">
                <div className="flex items-baseline gap-4">
                  <span className="text-5xl md:text-6xl font-extrabold text-[#101828] tracking-tight leading-none select-none ">
                    {String(index + 1).padStart(2, "0")}
                  </span>
                  <span className="text-lg md:text-lg font-bold text-[#101828]">
                    {feature.title}
                  </span>
                </div>
                <p className="text-[#101828] text-base md:text-base font-medium max-w-xl leading-relaxed">
                  {feature.desc}
                </p>
              </div>
            </motion.div>
          ))}

          {/* 圖片區塊 */}
          {features.map((feature, index) => (
            <motion.div
              key={`image-${index}`}
              initial={{ opacity: 0, scale: 0.8 }}
              whileInView={{ opacity: 1, scale: 1 }}
              transition={{ duration: 0.6, delay: index * 0.1 }}
              viewport={{ once: false, amount: 0.3 }}
              className="z-10 flex justify-center items-center"
              style={{ gridArea: feature.imageGridArea }}
            >
              <a href={feature.link} className="group" tabIndex={-1}>
                <div className="w-56 h-56 md:w-72 md:h-72 lg:w-80 lg:h-80 rounded-full overflow-hidden shadow-xl transition-all duration-300 group-hover:scale-105 group-hover:shadow-2xl cursor-pointer bg-white">
                  <Image
                    src={feature.image}
                    alt={feature.title}
                    width={350}
                    height={350}
                    className="object-cover w-full h-full transition-transform duration-300 group-hover:scale-110"
                  />
                </div>
              </a>
            </motion.div>
          ))}
        </div>
      </div>
    </motion.section>
  );
}

// 行事曆課程資料與隨機排程
const weekDays = ["週一", "週二", "週三", "週四", "週五", "週六", "週日"];
const courseList = [
  { title: "高效有氧燃脂課程", teacher: "Lynn" },
  { title: "核心穩定強化訓練", teacher: "Kevin" },
  { title: "深層肌肉伸展課程", teacher: "Irene" },
  { title: "進階重量訓練班", teacher: "Jason" },
  { title: "流動瑜珈冥想課程", teacher: "Sophia" },
  { title: "功能性動作訓練", teacher: "Jack" },
  { title: "高強度心肺強化班", teacher: "Fangyu" },
  { title: "爆發力與肌力提升", teacher: "Sean" },
  { title: "全身循環運動課程", teacher: "Peggy" },
  { title: "肌肉放鬆與筋膜釋放", teacher: "Howard" },
];
function getDeterministicTime(idx) {
  const times = ["10:00", "14:00", "16:00", "18:00", "19:00", "20:00"];
  return times[idx % times.length];
}
const scheduledCourses = weekDays.map((day, idx) => {
  const course = courseList[idx % courseList.length];
  return {
    day,
    time: getDeterministicTime(idx),
    title: course.title,
    teacher: course.teacher,
  };
});
// 月曆資料生成
function getDaysInMonth(year, month) {
  return new Date(year, month + 1, 0).getDate();
}

function getFirstDayOfMonth(year, month) {
  return new Date(year, month, 1).getDay();
}

const today = new Date();
const daysInMonth = getDaysInMonth(today.getFullYear(), today.getMonth());
const monthDays = Array.from({ length: daysInMonth }, (_, i) => i + 1);
const scheduledMonthCourses = monthDays.map((day, idx) => {
  const course = courseList[idx % courseList.length];
  return {
    day,
    time: getDeterministicTime(idx),
    title: course.title,
    teacher: course.teacher,
  };
});

const courseIdMap = {
  高效有氧燃脂課程: 1,
  核心穩定強化訓練: 2,
  深層肌肉伸展課程: 3,
  進階重量訓練班: 4,
  流動瑜珈冥想課程: 5,
  功能性動作訓練: 6,
  高強度心肺強化班: 7,
  爆發力與肌力提升: 8,
  全身循環運動課程: 9,
  肌肉放鬆與筋膜釋放: 10,
};

export default function Home() {
  const [isLoginModalOpen, setIsLoginModalOpen] = useState(false);
  const [currentQuestion, setCurrentQuestion] = useState(0);
  const [answers, setAnswers] = useState([]);
  const [showResult, setShowResult] = useState(false);
  const [result, setResult] = useState(null);
  const scrollRef = useRef(null);
  const scrollByAmount = 300;
  const [selectedOption, setSelectedOption] = useState(null);
  const [isAnimating, setIsAnimating] = useState(false);
  const [showConfetti, setShowConfetti] = useState(false);
  const [flippedCards, setFlippedCards] = useState([]);
  const [isFlipping, setIsFlipping] = useState(false);
  const [selectedCards, setSelectedCards] = useState([]);
  const [windowSize, setWindowSize] = useState({ width: 0, height: 0 });
  const [confettiItems, setConfettiItems] = useState([]);
  const swiperRef = useRef(null);
  const [calendarMode, setCalendarMode] = useState("week"); // 'week' or 'month'
  const [calendarMonth, setCalendarMonth] = useState(today.getMonth());
  const [calendarYear, setCalendarYear] = useState(today.getFullYear());
  const [quizStarted, setQuizStarted] = useState(true);

  useEffect(() => {
    // Set initial window size
    setWindowSize({
      width: window.innerWidth,
      height: window.innerHeight,
    });

    // Add window resize listener
    const handleResize = () => {
      setWindowSize({
        width: window.innerWidth,
        height: window.innerHeight,
      });
    };

    window.addEventListener("resize", handleResize);
    return () => window.removeEventListener("resize", handleResize);
  }, []);

  // Generate confetti items only when showConfetti changes
  useEffect(() => {
    if (showConfetti) {
      const items = Array.from({ length: 50 }, (_, i) => ({
        id: i,
        x: Math.random() * (windowSize.width || 0),
        duration: Math.random() * 2 + 1,
        emoji: ["🎉", "🎊", "✨", "🌟"][Math.floor(Math.random() * 4)],
      }));
      setConfettiItems(items);
    } else {
      setConfettiItems([]);
    }
  }, [showConfetti, windowSize.width]);

  const scrollLeft = () => {
    if (scrollRef.current)
      scrollRef.current.scrollBy({ left: -scrollByAmount, behavior: "smooth" });
  };

  const scrollRight = () => {
    if (scrollRef.current)
      scrollRef.current.scrollBy({ left: scrollByAmount, behavior: "smooth" });
  };

  const openLoginModal = () => setIsLoginModalOpen(true);
  const closeLoginModal = () => setIsLoginModalOpen(false);

  const handleCardClick = (index) => {
    if (isFlipping || flippedCards.includes(index)) return;

    setIsFlipping(true);
    setFlippedCards([...flippedCards, index]);

    setTimeout(() => {
      const option = QUIZ_QUESTIONS[currentQuestion].options[index];
      handleAnswer(option.value);
      setIsFlipping(false);
    }, 1000);
  };

  const handleAnswer = (value) => {
    const newAnswers = [...answers];
    newAnswers[currentQuestion] = value;
    setAnswers(newAnswers);

    if (currentQuestion < QUIZ_QUESTIONS.length - 1) {
      setCurrentQuestion(currentQuestion + 1);
      setFlippedCards([]);
    } else {
      const tryKeys = [
        newAnswers.join("_"),
        newAnswers.slice(0, 3).join("_"),
        newAnswers.slice(0, 2).join("_"),
        newAnswers[0],
      ];
      let found = null;
      for (const key of tryKeys) {
        if (SPORT_RECOMMENDATIONS[key]) {
          found = SPORT_RECOMMENDATIONS[key];
          break;
        }
      }
      setResult(
        found || {
          title: "全能運動者",
          description:
            "你適合多種運動類型，建議嘗試不同的運動來找到最適合你的方式。",
          image: "/images/quiz/all-around.jpg",
          tags: ["全能", "探索", "多元", "適應"],
        }
      );
      setShowResult(true);
      setShowConfetti(true);
      setTimeout(() => setShowConfetti(false), 3000);
    }
  };

  const resetQuiz = () => {
    setCurrentQuestion(0);
    setAnswers([]);
    setShowResult(false);
    setResult(null);
    setFlippedCards([]);
  };

  // 切換月份
  function handlePrevMonth() {
    if (calendarMonth === 0) {
      setCalendarYear(calendarYear - 1);
      setCalendarMonth(11);
    } else {
      setCalendarMonth(calendarMonth - 1);
    }
  }
  function handleNextMonth() {
    if (calendarMonth === 11) {
      setCalendarYear(calendarYear + 1);
      setCalendarMonth(0);
    } else {
      setCalendarMonth(calendarMonth + 1);
    }
  }

  // 月曆資料生成（依目前狀態）
  const daysInMonthDynamic = getDaysInMonth(calendarYear, calendarMonth);
  const monthDaysDynamic = Array.from(
    { length: daysInMonthDynamic },
    (_, i) => i + 1
  );
  const scheduledMonthCoursesDynamic = monthDaysDynamic.map((day, idx) => {
    const course = courseList[idx % courseList.length];
    return {
      day,
      time: getDeterministicTime(idx),
      title: course.title,
      teacher: course.teacher,
    };
  });

  return (
    <div className="min-h-screen flex flex-col overflow-hidden scroll-smooth snap-y snap-mandatory bg-[#E7E7E5]">
      <Navbar />
      {isLoginModalOpen && <LoginModal onClose={closeLoginModal} />}
      <main className="flex-grow snap-y snap-mandatory scroll-smooth ">
        {/* Hero 區塊 - 輪播圖 */}
        <motion.section
          initial={{ opacity: 0, y: 50 }}
          whileInView={{ opacity: 1, y: 0 }}
          transition={{ duration: 1 }}
          viewport={{ once: false, amount: 0.2 }}
          className="relative w-full aspect-[16/9] snap-start"
        >
          <Image
            src="/index3.jpg"
            alt="首頁"
            fill
            className="object-cover w-full h-full"
          />
        </motion.section>

        <motion.section
          initial={{ opacity: 0, y: 50 }}
          whileInView={{ opacity: 1, y: 0 }}
          transition={{ duration: 1 }}
          viewport={{ once: false, amount: 0.2 }}
          className="relative w-full h-screen snap-start"
        >
          <Image
            src="/about_3.jpg"
            alt="首頁"
            fill
            className="object-cover w-full h-full"
          />
        </motion.section>

        {/* 過渡區塊 */}
        <motion.section
          initial={{ opacity: 0, y: 100 }}
          whileInView={{ opacity: 1, y: 0 }}
          transition={{ duration: 1.3, delay: 0.2 }}
          viewport={{ once: false, amount: 0.2 }}
          className="w-full h-[80vh] snap-start flex items-stretch justify-center relative bg-[#7F9161] overflow-hidden"
        >
          <div className="flex flex-row items-stretch w-full h-full">
            {/* 左側文字 */}
            <div className="flex-[1] flex flex-col justify-center z-10 px-10">
              <h2 className="text-4xl lg:text-5xl font-bold  text-[#FBF9FA] text-center mb-10">
                ABOUT NEXFIT
              </h2>
              <p className="font-medium md:text-lg text-[#FBF9FA] leading-relaxed mb-6 text-center">
                NEXFIT是一個致力於推動健康生活與持續運動的平台，我們相信
                <br />
                「每個人都能在自己的節奏中，找到屬於自己的健康方式。」
              </p>
              <p className="font-medium md:text-lg text-[#FBF9FA] leading-relaxed mb-6 text-center">
                我們整合了運動課程、營養補給、數據追蹤、社群互動與成就系統，
                <br />
                打造出一個全方位的健康生態圈。
              </p>
              <p className="font-medium md:text-lg text-[#FBF9FA] leading-relaxed mb-6 text-center">
                無論你是剛起步的新手還是正在突破瓶頸的進階者，
                <br />
                我們都希望成為你生活中最穩定的支持。
              </p>
            </div>
            {/* 右側圖 */}
            <div className="flex-[1.5] h-full">
              <img
                src="/images/about.jpg"
                alt="About Us"
                className="w-full h-full object-cover"
                style={{ objectPosition: "center center" }}
              />
            </div>
          </div>
        </motion.section>

        {/* 探索課程特色區塊 */}
        <ExploreCoursesSection />

        {/* 過渡區塊2 */}
        <motion.section
          initial={{ opacity: 0, y: 100 }}
          whileInView={{ opacity: 1, y: 0 }}
          transition={{ duration: 1.3, delay: 0.2 }}
          viewport={{ once: false, amount: 0.2 }}
          className="w-full h-[80vh] snap-start flex items-stretch justify-center relative bg-[#7F9161] overflow-hidden"
        >
          <div className="flex flex-row items-center w-full h-full">
            {/* 左側圖片 */}
            <div className="flex-[1.5] flex items-center justify-center w-full">
              <img
                src="/images/about2.jpg"
                alt="About Us"
                className=" w-full h-auto object-contain"
                style={{ objectPosition: "left center" }}
              />
            </div>
            <div className="flex-[1] flex flex-col justify-center z-10">
              <h2 className="text-5xl font-bold mb-10 text-[#FBF9FA] text-center">
                OUR PURPOSE
              </h2>
              <p className="font-medium md:text-lg text-[#FBF9FA] leading-relaxed mb-6 text-center">
                NEXFIT 打造一個「真實可持續的健康生活系統」
                <br />
                我們相信健康管理不是一個壓力沉重的任務，
                <br />
                而是一場充滿選擇與陪伴的旅程
              </p>
            </div>
          </div>
        </motion.section>

        {/* 熱門排行榜 */}
        <motion.section
          initial={{ opacity: 0, y: 100 }}
          whileInView={{ opacity: 1, y: 0 }}
          transition={{ duration: 1 }}
          viewport={{ once: false, amount: 0.2 }}
          className="min-h-[80vh] bg-[#E7E7E5] flex flex-col justify-center relative py-16"
        >
          {/* 標題與箭頭同一行 */}
          <div className="flex items-center justify-between px-16 mb-10">
            <div className="flex items-end gap-4">
              <span className="text-5xl font-bold">Ranking</span>
              <span className="text-lg font-bold text-[#101828]">
                {"熱銷排行｜補給專區"}
              </span>
            </div>
            <div className="flex gap-4">
              <button
                className="group w-12 h-12 bg-[#F0F0F0] rounded-full flex items-center justify-center shadow-lg transition hover:bg-[#7F9161]"
                onClick={() => swiperRef.current?.slidePrev()}
                type="button"
                aria-label="上一個"
              >
                <svg
                  className="w-6 h-6 text-gray-700 transition group-hover:text-white"
                  fill="none"
                  stroke="currentColor"
                  strokeWidth="3"
                  viewBox="0 0 24 24"
                >
                  <path
                    strokeLinecap="round"
                    strokeLinejoin="round"
                    d="M15 19l-7-7 7-7"
                  />
                </svg>
              </button>
              <button
                className="group w-12 h-12 bg-[#F0F0F0] rounded-full flex items-center justify-center shadow-lg transition hover:bg-[#7F9161]"
                onClick={() => swiperRef.current?.slideNext()}
                type="button"
                aria-label="下一個"
              >
                <svg
                  className="w-6 h-6 text-gray-700 transition group-hover:text-white"
                  fill="none"
                  stroke="currentColor"
                  strokeWidth="3"
                  viewBox="0 0 24 24"
                >
                  <path
                    strokeLinecap="round"
                    strokeLinejoin="round"
                    d="M9 5l7 7-7 7"
                  />
                </svg>
              </button>
            </div>
          </div>
          <motion.div
            initial={{ opacity: 0 }}
            whileInView={{ opacity: 1 }}
            transition={{ duration: 0.8 }}
            className="px-12 relative"
          >
            <Swiper
              modules={[Navigation]}
              spaceBetween={32}
              slidesPerView={"auto"}
              breakpoints={{
                640: { slidesPerView: "auto" },
                768: { slidesPerView: "auto" },
                1024: { slidesPerView: "auto" },
              }}
              className="w-full"
              onSwiper={(swiper) => (swiperRef.current = swiper)}
            >
              {products.map((product, idx) => (
                <SwiperSlide
                  key={product.id}
                  className="!w-72 flex flex-col items-center"
                >
                  <img
                    src={product.image}
                    alt={product.title}
                    className="w-72 h-72 object-cover mb-3 rounded-xl"
                  />
                  <div className="text-center">
                    <h3 className="text-sm font-medium mb-1">
                      {product.title}
                    </h3>
                    <div className="flex flex-col items-center">
                      {product.originalPrice && (
                        <span className=" line-through text-sm mb-1">
                          NT${product.originalPrice}
                        </span>
                      )}
                      <span
                        className="text-sm font-medium"
                        style={{
                          color: product.originalPrice ? "#7F9161" : "",
                          fontWeight: product.originalPrice ? "bold" : "",
                        }}
                      >
                        NT${product.price}
                      </span>
                      {/* 星星評等 */}
                      {/* <div className="flex justify-center mt-2 gap-0.5">
                        {[...Array(5)].map((_, i) => (
                          <svg key={i} className="w-5 h-5" viewBox="0 0 20 20">
                            <path
                              d="M9.049 2.927c.3-.921 1.603-.921 1.902 0l1.286 3.967a1 1 0 00.95.69h4.18c.969 0 1.371 1.24.588 1.81l-3.388 2.462a1 1 0 00-.364 1.118l1.286 3.966c.3.921-.755 1.688-1.54 1.118l-3.388-2.462a1 1 0 00-1.176 0l-3.388 2.462c-.784.57-1.838-.197-1.539-1.118l1.286-3.966a1 1 0 00-.364-1.118L2.045 9.394c-.783-.57-.38-1.81.588-1.81h4.18a1 1 0 00.95-.69l1.286-3.967z"
                              fill={i < product.rating ? "#FFE03C" : "#E0E0E0"}
                              // stroke="#D4D4D9"
                              // strokeWidth="1"
                            />
                          </svg>
                        ))}
                      </div> */}
                    </div>
                  </div>
                </SwiperSlide>
              ))}
            </Swiper>
          </motion.div>
        </motion.section>

        {/* 心理測驗卡牌遊戲區塊 */}
        <motion.section
          initial={{ opacity: 0, y: 50 }}
          whileInView={{ opacity: 1, y: 0 }}
          transition={{ duration: 1 }}
          viewport={{ once: false, amount: 0.2 }}
          className="w-full min-h-[60vh] bg-[#E7E7E5] items-center justify-center py relative overflow-hidden"
        >
          <h2 className="text-5xl font-bold mb-4 text-center text-[#7F9161]">
            找到專屬於你的健身之旅
          </h2>
          <div className="w-full p-12 mx-auto text-gray-800">
            {!quizStarted ? null : !showResult ? (
              <motion.div
                key={currentQuestion}
                initial={{ opacity: 0, x: 100 }}
                animate={{ opacity: 1, x: 0 }}
                exit={{ opacity: 0, x: -100 }}
                transition={{
                  duration: 0.6,
                  ease: [0.25, 0.46, 0.45, 0.94],
                }}
                className="space-y-8"
              >
                {/* 選擇歷史區域 */}
                {currentQuestion > 0 && (
                  <motion.div
                    initial={{ opacity: 0, y: -20 }}
                    animate={{ opacity: 1, y: 0 }}
                    transition={{ delay: 0.3, duration: 0.5 }}
                    className="mb-8 p-4"
                  >
                    <h4 className="text-sm font-semibold text-gray-600 mb-2">
                      你的選擇：
                    </h4>
                    <div className="flex flex-wrap gap-3">
                      {answers.map((answer, index) => {
                        const question = QUIZ_QUESTIONS[index];
                        const selectedOption = question.options.find(
                          (opt) => opt.value === answer
                        );
                        return (
                          <motion.div
                            key={index}
                            initial={{ opacity: 0, scale: 0.8 }}
                            animate={{ opacity: 1, scale: 1 }}
                            transition={{
                              delay: 0.4 + index * 0.1,
                              duration: 0.4,
                              type: "spring",
                              stiffness: 100,
                            }}
                            className="flex items-center gap-2 px-3 py-2"
                          >
                            <span>
                              {React.cloneElement(selectedOption.icon, {
                                className: "w-5 h-5 text-[#7F9161]",
                              })}
                            </span>
                            <span className="text-sm text-gray-700">
                              {selectedOption.text}
                            </span>
                          </motion.div>
                        );
                      })}
                    </div>
                  </motion.div>
                )}

                {/* 白色區塊包含標題、描述和卡牌 */}
                <div className="w-full flex justify-center items-center">
                  <motion.div
                    className={`w-4/5 h-170 flex flex-col justify-center items-center ${
                      currentQuestion > 0
                        ? "bg-[url(/images/s6.jpg)] bg-cover bg-center bg-no-repeat"
                        : "bg-[#FBF9FA]"
                    } rounded-[60px] py-12 px-8`}
                    initial={{ scale: 0.9, opacity: 0 }}
                    animate={{ scale: 1, opacity: 1 }}
                    transition={{
                      duration: 0.7,
                      ease: [0.25, 0.46, 0.45, 0.94],
                      delay: 0.2,
                    }}
                    style={{
                      background:
                        currentQuestion > 0
                          ? "linear-gradient(rgba(0,0,0,0.3), rgba(0,0,0,0.3)), url(/images/s6.jpg)"
                          : undefined,
                      backgroundSize: "cover",
                      backgroundPosition: "center",
                      backgroundRepeat: "no-repeat",
                    }}
                  >
                    {/* 問題描述 */}
                    <motion.p
                      className={`text-xl font-medium text-center mb-20 ${
                        currentQuestion > 0 ? "text-[#FBF9FA]" : "text-gray-800"
                      }`}
                      initial={{ opacity: 0, y: 30 }}
                      animate={{ opacity: 1, y: 0 }}
                      transition={{
                        delay: 0.5,
                        duration: 0.6,
                        ease: "easeOut",
                      }}
                    >
                      {QUIZ_QUESTIONS[currentQuestion].question}
                    </motion.p>

                    {/* 卡牌區域 */}
                    <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-4 gap-10">
                      {QUIZ_QUESTIONS[currentQuestion].options.map(
                        (option, index) => (
                          <motion.div
                            key={index}
                            className="w-60 h-80 cursor-pointer group"
                            initial={{
                              opacity: 0,
                              y: 50,
                              rotateY: -15,
                            }}
                            animate={{
                              opacity: 1,
                              y: 0,
                              rotateY: 0,
                            }}
                            transition={{
                              delay: 0.6 + index * 0.15,
                              duration: 0.8,
                              type: "spring",
                              stiffness: 80,
                              damping: 15,
                            }}
                            whileHover={{
                              scale: 1.07,
                              rotateY: 5,
                              transition: { duration: 0.3 },
                            }}
                            whileTap={{
                              scale: 0.95,
                              transition: { duration: 0.1 },
                            }}
                            onClick={() => {
                              // 點擊時的動畫效果
                              const card = document.getElementById(
                                `card-${index}`
                              );
                              if (card) {
                                card.style.transform =
                                  "scale(1.1) rotateY(10deg)";
                                card.style.transition = "all 0.2s ease";
                                setTimeout(() => {
                                  card.style.transform =
                                    "scale(1) rotateY(0deg)";
                                  setTimeout(() => {
                                    handleCardClick(index);
                                  }, 200);
                                }, 100);
                              } else {
                                handleCardClick(index);
                              }
                            }}
                          >
                            <div
                              id={`card-${index}`}
                              className="w-full h-full flex flex-col items-center justify-center bg-[#7F9161] rounded-2xl hover:shadow-lg transition-all duration-300 overflow-hidden relative"
                              style={{
                                transformStyle: "preserve-3d",
                              }}
                            >
                              {currentQuestion === 0 ? (
                                <>
                                  <img
                                    src={`/images/quz${index + 1}.jpg`}
                                    alt={option.text}
                                    className="w-full h-full object-cover rounded-2xl"
                                  />
                                  <div className="absolute inset-0 flex items-center justify-center bg-black/40 opacity-0 group-hover:opacity-100 transition-opacity duration-300">
                                    <span className="text-[#FBF9FA] text-2xl font-bold drop-shadow">
                                      {option.text}
                                    </span>
                                  </div>
                                </>
                              ) : (
                                <>
                                  <div className="text-6xl mb-6 text-[#FBF9FA]">
                                    {option.icon}
                                  </div>
                                  <div className="text-lg font-semibold text-[#FBF9FA]">
                                    {option.text}
                                  </div>
                                </>
                              )}
                            </div>
                          </motion.div>
                        )
                      )}
                    </div>
                  </motion.div>
                </div>

                {/* 進度指示器 */}
                <motion.div
                  className="flex justify-between items-center mt-6"
                  initial={{ opacity: 0, y: 20 }}
                  animate={{ opacity: 1, y: 0 }}
                  transition={{ delay: 1.2, duration: 0.5 }}
                >
                  <span className="text-sm text-[#7F9161]">
                    問題 {currentQuestion + 1} / {QUIZ_QUESTIONS.length}
                  </span>
                  <div className="flex gap-2">
                    {QUIZ_QUESTIONS.map((_, index) => (
                      <motion.div
                        key={index}
                        initial={{ scale: 0 }}
                        animate={{ scale: 1 }}
                        transition={{
                          delay: 1.3 + index * 0.1,
                          duration: 0.3,
                          type: "spring",
                          stiffness: 200,
                        }}
                        className={`w-2 h-2 rounded-full transition-colors duration-100 ${
                          index === currentQuestion
                            ? "bg-[#8e9568]"
                            : "bg-[#a9ba5c]"
                        }`}
                      />
                    ))}
                  </div>
                </motion.div>
              </motion.div>
            ) : (
              <motion.div
                initial={{ opacity: 0, scale: 0.8 }}
                animate={{ opacity: 1, scale: 1 }}
                transition={{
                  duration: 0.8,
                  ease: [0.25, 0.46, 0.45, 0.94],
                }}
                className="text-center space-y-6"
              >
                <h3 className="text-2xl font-bold bg-gradient-to-r from-[#b85e39] to-[#ffc99d] bg-clip-text text-transparent">
                  {result.title}
                </h3>
                <p className="text-gray-700">{result.description}</p>
                <div className="relative flex justify-center items-center aspect-square max-w-xs mx-auto">
                  {/* 歷史標籤可自訂 top 與左右位置 */}
                  {(() => {
                    // 自訂這個陣列
                    const labelPositions = [
                      { top: 10, side: "left", offset: -220 },
                      { top: 30, side: "right", offset: -220 },
                      { top: 50, side: "left", offset: -200 },
                      { top: 70, side: "right", offset: -200 },
                    ];
                    return answers.map((answer, index) => {
                      const pos = labelPositions[index] || {
                        top: 10 + index * 20,
                        side: index % 2 === 0 ? "left" : "right",
                        offset: -180,
                      };
                      const question = QUIZ_QUESTIONS[index];
                      const selectedOption = question.options.find(
                        (opt) => opt.value === answer
                      );
                      return (
                        <motion.div
                          key={index}
                          initial={{
                            opacity: 0,
                            x: pos.side === "left" ? -30 : 30,
                          }}
                          animate={{ opacity: 1, x: 0 }}
                          transition={{ delay: index * 0.2 }}
                          className="flex items-center gap-3 absolute z-10"
                          style={{
                            top: `${pos.top}%`,
                            [pos.side]: `${pos.offset}px`,
                          }}
                        >
                          <span>
                            {React.cloneElement(selectedOption.icon, {
                              className: "w-7 h-7 text-[#7F9161]",
                            })}
                          </span>
                          <span className="text-lg text-gray-700 font-semibold whitespace-nowrap">
                            {selectedOption.text}
                          </span>
                        </motion.div>
                      );
                    });
                  })()}
                  {/* 圖片本身 */}
                  <img
                    src={result.image}
                    alt={result.title}
                    className="w-full h-full object-contain bg-gray-100 z-0"
                  />
                </div>
                <div className="flex gap-4 justify-center">
                  <button
                    onClick={resetQuiz}
                    className="px-6 py-2 bg-[#7F9161] text-[#FBF9FA] rounded-full hover:bg-[#7F9161]/90 transition shadow-lg cursor-pointer"
                  >
                    重新測驗
                  </button>
                  <Link
                    href="/reservation/course"
                    className="px-6 py-2 bg-[#7F9161] text-[#FBF9FA] rounded-full hover:bg-[#7F9161]/90 transition shadow-lg cursor-pointer"
                  >
                    查看相關課程
                  </Link>
                </div>
              </motion.div>
            )}
          </div>
        </motion.section>

        {/* 行事曆區塊 */}
        <motion.section
          initial={{ opacity: 0, y: 50 }}
          whileInView={{ opacity: 1, y: 0 }}
          transition={{ duration: 1 }}
          viewport={{ once: false, amount: 0.2 }}
          className="w-full min-h-[60vh] bg-[#E7E7E5] flex items-center justify-center py-12"
        >
          <div className="w-full">
            <div className="flex items-end gap-4 px-16 mb-15">
              <h2 className="text-5xl font-bold  text-start">Booking</h2>
              <span className="text-lg font-bold text-[#101828]">
                預約課程行事曆
              </span>
            </div>

            {/* 週/月切換按鈕 */}
            <div className="flex justify-center gap-4 mb-6">
              <button
                className={`px-4 py-2 rounded ${
                  calendarMode === "week"
                    ? "bg-[#7F9161] text-[#FBF9FA]"
                    : "bg-[#FBF9FA] text-[#7F9161] border border-[#7F9161]"
                }`}
                onClick={() => setCalendarMode("week")}
              >
                週曆
              </button>
              <button
                className={`px-4 py-2 rounded ${
                  calendarMode === "month"
                    ? "bg-[#7F9161] text-[#FBF9FA]"
                    : "bg-[#FBF9FA] text-[#7F9161] border border-[#7F9161]"
                }`}
                onClick={() => setCalendarMode("month")}
              >
                月曆
              </button>
            </div>
            {/* 週曆/月曆 */}
            {calendarMode === "week" ? (
              <section className="w-full bg-[#E7E7E5] p-0 m-0">
                <div className="grid grid-cols-7 gap-8 w-full px-14">
                  {weekDays.map((day) => {
                    const course = scheduledCourses.find((c) => c.day === day);
                    return (
                      <div
                        key={day}
                        className="p-6 min-h-[180px] flex flex-col items-center"
                      >
                        <div className="font-bold mb-4 text-xl text-[#7F9161]">
                          {day}
                        </div>
                        {course && (
                          <Link
                            href={`/reservation/course/${
                              courseIdMap[course.title]
                            }`}
                            className="block hover:bg-[#7F9161]/10 rounded transition cursor-pointer w-full"
                          >
                            <div className="text-center mb-2">
                              <div className="text-lg font-semibold">
                                {course.time}
                              </div>
                              <div className="text-base mt-1">
                                {course.title}
                              </div>
                              <div className="text-base text-zinc-500 mt-1">
                                {course.teacher}
                              </div>
                            </div>
                          </Link>
                        )}
                      </div>
                    );
                  })}
                </div>
              </section>
            ) : (
              <div className="w-full max-w-5xl mx-auto mt-8">
                {/* 月份切換與顯示 */}
                <div className="flex items-center justify-center gap-4 mb-4">
                  <button
                    onClick={handlePrevMonth}
                    className="px-2 py-1 rounded bg-white border"
                  >
                    &#60;
                  </button>
                  <span className="font-bold text-lg">
                    {calendarYear}年 {calendarMonth + 1}月
                  </span>
                  <button
                    onClick={handleNextMonth}
                    className="px-2 py-1 rounded bg-white border"
                  >
                    &#62;
                  </button>
                </div>
                {/* 星期標題 */}
                <div className="grid grid-cols-7 gap-3 mb-2">
                  {weekDays.map((day) => (
                    <div
                      key={day}
                      className="text-center font-semibold text-[#7F9161]"
                    >
                      {day}
                    </div>
                  ))}
                </div>
                <div className="grid grid-cols-7 gap-3">
                  {/* 填充月初空白 */}
                  {Array.from(
                    { length: getFirstDayOfMonth(calendarYear, calendarMonth) },
                    (_, i) => (
                      <div
                        key={`empty-${i}`}
                        className="bg-gray-50 rounded-lg shadow p-2 min-h-[80px]"
                      />
                    )
                  )}
                  {/* 日期格子 */}
                  {monthDaysDynamic.map((day) => {
                    const course = scheduledMonthCoursesDynamic.find(
                      (c) => c.day === day
                    );
                    return (
                      <div
                        key={day}
                        className="bg-white rounded-lg shadow p-2 min-h-[80px] flex flex-col items-center"
                      >
                        <div className="font-bold mb-1 text-[#7F9161]">
                          {day}
                        </div>
                        {course && (
                          <Link
                            href={`/reservation/course/${
                              courseIdMap[course.title]
                            }`}
                            className="block hover:bg-[#7F9161]/10 rounded transition cursor-pointer"
                          >
                            <div className="text-center mb-1">
                              <div className="text-xs font-semibold">
                                {course.time}
                              </div>
                              <div className="text-xs">{course.title}</div>
                              <div className="text-xs text-zinc-600">
                                {course.teacher}
                              </div>
                            </div>
                          </Link>
                        )}
                      </div>
                    );
                  })}
                </div>
              </div>
            )}
          </div>
        </motion.section>
        {/* GOOGLE 地圖區塊 */}
        <motion.section
          initial={{ opacity: 0, y: 50 }}
          whileInView={{ opacity: 1, y: 0 }}
          transition={{ duration: 1 }}
          viewport={{ once: false, amount: 0.2 }}
          className="w-full min-h-[60vh] bg-[#E7E7E5] flex flex-col items-center justify-center py-12"
        >
          {/* 標題 */}
          <div className="flex items-end gap-4 px-16 mb-15">
            <h2 className="text-5xl font-bold  text-start tracking-wide	">
              Where to find us
            </h2>
            <span className="text-lg font-bold text-[#101828]">與我們相遇</span>
          </div>

          {/* 地圖與資訊橫向排列 */}
          <div className="flex flex-col md:flex-row gap-24 w-full max-w-5xl">
            {/* 地圖 */}
            <div className="flex-[1] min-w-[250px] h-[600px] md:h-[400px] rounded-lg overflow-hidden shadow-lg border border-gray-200 ">
              <iframe
                title="Google Map"
                src="https://www.google.com/maps/embed?pb=!1m18!1m12!1m3!1d3680.017367129919!2d120.2932479!3d22.6283906!2m3!1f0!2f0!3f0!3m2!1i1024!2i768!4f13.1!3m3!1m2!1s0x346e0463352ebb51:0x5f532bceeb1713ca!2zODAx6auY6ZuE5biC5YmN6YeR5Y2A5Lit5q2j5Zub6LevMjEx6Jmf!5e0!3m2!1szh-TW!2stw!4v1680000000000!5m2!1szh-TW!2stw"
                width="100%"
                height="100%"
                style={{ border: 0 }}
                allowFullScreen=""
                loading="lazy"
                referrerPolicy="no-referrer-when-downgrade"
              ></iframe>
            </div>

            {/* 地址資訊 */}
            <div className="flex-[1] flex flex-col justify-center items-start pl-6">
              <p className="text-lg font-medium mb-2">
                高雄市中正四路211號8樓之1
              </p>
              <p className="font-medium mb-2">電話：07-9699-885</p>
              <p className="font-medium mb-2">
                營業時間：週一至週日 08:00-22:00
              </p>
              <p className="font-medium">歡迎蒞臨或來電洽詢！</p>
            </div>
          </div>
        </motion.section>
      </main>
      <Footer />
    </div>
  );
}
