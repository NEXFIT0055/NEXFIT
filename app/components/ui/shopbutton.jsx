import React, { useState } from "react";

const AddToCartButton = ({ text = "加入購物車", className = "" }) => {
  const [isAnimating, setIsAnimating] = useState(false);

  const handleClick = () => {
    if (!isAnimating) {
      setIsAnimating(true);
      setTimeout(() => {
        setIsAnimating(false);
      }, 2200);
    }
  };

  return (
    <button
      onClick={handleClick}
      className={`relative bg-[#101828] hover:bg-[#F0F0F0] hover:text-black text-white font-medium py-3 px-6 rounded-lg transition-all duration-300 ease-in-out transform hover:scale-105 active:scale-95 shadow-lg hover:shadow-xl w-48 h-14 focus:outline-none ${className}`}
      disabled={isAnimating}
    >
      <span
        className={`transition-opacity duration-300 ${
          isAnimating ? "opacity-0" : "opacity-100"
        }`}
      >
        {text}
      </span>

      <div
        className={`absolute inset-0 flex items-center justify-center pointer-events-none transition-opacity duration-300 ${
          isAnimating ? "opacity-100" : "opacity-0"
        }`}
      >
        <svg
          width="130"
          height="50"
          viewBox="0 0 130 50"
          className="overflow-visible"
        >
          {/* 本體 */}
          <g
            className={`transform ${
              isAnimating
                ? "animate-person-movement"
                : "translate-x-0 opacity-0"
            }`}
          >
            {/* 頭 */}
            <circle cx="25" cy="15" r="7" fill="#374151" />
            {/* 身體 */}
            <rect x="22" y="22" width="6" height="13" fill="#AFC16D" />{" "}
            {/* 左手 */}
            <line
              x1="22"
              y1="26"
              x2="18"
              y2="32"
              stroke="#AFC16D"
              strokeWidth="2"
            />{" "}
            {/* 拿包裹的那隻手 */}
            <line
              x1="28"
              y1="26"
              x2="34"
              y2="30"
              stroke="#AFC16D"
              strokeWidth="2"
            />{" "}
            {/* 左腳 */}
            <line
              x1="22"
              y1="35"
              x2="20"
              y2="45"
              stroke="#374151"
              strokeWidth="2"
            />{" "}
            {/* 右腳 */}
            <line
              x1="28"
              y1="35"
              x2="30"
              y2="45"
              stroke="#374151"
              strokeWidth="2"
            />{" "}
          </g>

          {/* 包裹 */}
          <g
            className={`transform ${
              isAnimating
                ? "animate-package-movement"
                : "translate-y-0 opacity-0"
            }`}
          >
            <rect
              x="34"
              y="28"
              width="10"
              height="8"
              fill="#F59E0B"
              stroke="#B45309"
              strokeWidth="1"
            />
            <line
              x1="34"
              y1="31"
              x2="44"
              y2="31"
              stroke="#B45309"
              strokeWidth="1"
            />
            <path
              d="M34 28 L44 28 L42 26 L36 26 Z"
              fill="#F59E0B"
              stroke="#B45309"
              strokeWidth="1"
            />{" "}
            {/* Package top */}
            <path
              d="M40 26 L40 28 M39 31 L39 36"
              stroke="#B45309"
              strokeWidth="0.5"
            />{" "}
            {/* Package details */}
          </g>

          {/* Shopping Cart - More detailed */}
          <g
            className={`transform ${
              isAnimating ? "animate-cart-movement" : "translate-x-0 opacity-0"
            }`}
          >
            {/* 購物籃 */}
            <path
              d="M60 25 L85 25 L82 40 L63 40 Z"
              fill="#F3F4F6"
              stroke="#4B5563"
              strokeWidth="1.5"
            />

            {/* 把手斜線 */}
            <path
              d="M60 25 L56 15 L52 15"
              fill="none"
              stroke="#4B5563"
              strokeWidth="1.5"
              strokeLinecap="round"
            />

            {/* 把手 */}
            <line
              x1="52"
              y1="15"
              x2="47"
              y2="15"
              stroke="#4B5563"
              strokeWidth="1.5"
              strokeLinecap="round"
            />

            {/* 車輪 */}
            <circle cx="66" cy="43" r="3" fill="#4B5563" />
            <circle cx="79" cy="43" r="3" fill="#4B5563" />

            {/* 購物籃的直線 */}
            <line
              x1="65"
              y1="25"
              x2="65"
              y2="40"
              stroke="#D1D5DB"
              strokeWidth="0.5"
            />
            <line
              x1="70"
              y1="25"
              x2="70"
              y2="40"
              stroke="#D1D5DB"
              strokeWidth="0.5"
            />
            <line
              x1="75"
              y1="25"
              x2="75"
              y2="40"
              stroke="#D1D5DB"
              strokeWidth="0.5"
            />
            <line
              x1="80"
              y1="25"
              x2="80"
              y2="40"
              stroke="#D1D5DB"
              strokeWidth="0.5"
            />
            <line
              x1="60"
              y1="30"
              x2="85"
              y2="30"
              stroke="#D1D5DB"
              strokeWidth="0.5"
            />
            <line
              x1="60"
              y1="35"
              x2="85"
              y2="35"
              stroke="#D1D5DB"
              strokeWidth="0.5"
            />

            {/* 購物籃最上面的線 */}
            <path
              d="M60 25 L85 25"
              fill="none"
              stroke="#4B5563"
              strokeWidth="1.5"
              strokeLinecap="round"
            />
          </g>
        </svg>
      </div>
    </button>
  );
};

export default AddToCartButton;
