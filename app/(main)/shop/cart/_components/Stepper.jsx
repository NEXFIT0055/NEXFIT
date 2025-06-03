"use client";

import { FaCheck } from "react-icons/fa"; // ✅ 引入打勾圖示

export default function Stepper({ className, curStep, onCurStep }) {
  return (
    <div
      // className={`flex flex-col gap-4 md:gap-6 md:flex-row md:justify-center ${className}`}
      className={`flex flex-col gap-4 md:flex-row md:justify-center ${className}`}
    >
      {/* <StepItem num={1} label="購物車" curStep={curStep} />
      <StepItem num={2} label="填寫資料" curStep={curStep} />
      <StepItem num={3} label="訂購完成" curStep={curStep} /> */}

      <StepItem num={1} label="確認商品" curStep={curStep} isLast={false} />
      <StepItem num={2} label="填寫資料" curStep={curStep} isLast={false} />
      <StepItem num={3} label="訂購完成" curStep={curStep} isLast={true} />
    </div>
  );
}

// function StepItem({ num, label, curStep }) {
//   const bgColor = num <= curStep ? "bg-zinc-500" : "bg-zinc-300";

//   return (
//     <div className="flex md:flex-col md:text-center items-center justify-center gap-4">
//       <div
//         className={`w-10 h-10 ${bgColor} flex justify-center items-center text-white text-xl rounded-full`}
//       >
//         {num}
//       </div>
//       <span className="text-[#333] text-xl block w-24">{label}</span>
//     </div>
//   );
// }

function StepItem({ num, label, curStep, isLast }) {
  const isDone = num < curStep;
  const isActive = num === curStep;

  const bgColor = isDone || isActive ? "bg-zinc-500" : "bg-zinc-300";
  const textColor = "text-white";

  return (
    <div className="relative flex md:flex-col md:items-center md:text-center items-center justify-center gap-4">
      {/* 圓圈 + 線條包裝區 */}
      <div className="relative flex flex-col items-center">
        <div
          className={`w-10 h-10 ${bgColor} ${textColor} flex justify-center items-center text-xl rounded-full z-10 transition-all duration-300`}
        >
          {isDone ? <FaCheck className="text-white" /> : num}
        </div>

        {/* 垂直線（手機） */}
        {!isLast && (
          <div className="block md:hidden absolute top-10 w-0.5 h-[48px] bg-zinc-300 z-0" />
        )}
      </div>

      {/* 標籤 */}
      <span className="text-[#333] text-xl block w-24">{label}</span>

      {/* 橫向線（桌機） */}
      {!isLast && (
        <div className="hidden md:block absolute top-5 left-10 right-[-50%] h-0.5 bg-zinc-300 z-0" />
      )}
    </div>
  );
}
