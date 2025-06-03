// DropdownMenu.js
"use client";
import React, { useState } from "react";
import { FaAngleDown } from "react-icons/fa";

export default function ComponentsDropdownMenu({
  title,
  options,
  onSelect,
  selected,
}) {
  const [isOpen, setIsOpen] = useState(false);

  const handleOptionClick = (option) => {
    if (onSelect) {
      onSelect(option);
    }
    setIsOpen(false); // 關閉下拉選單
  };

  const toggleDropdown = () => {
    setIsOpen(!isOpen);
  };

  // 顯示當前選中的選項，如果沒有選中則顯示 title
  const displayText = selected && selected !== title ? selected : title;

  return (
    <div className="relative">
      <span
        className="cursor-pointer text-lg font-semibold flex items-center"
        onClick={toggleDropdown}
      >
        {displayText}
        <FaAngleDown
          className={`ml-2 transition-transform duration-200 ${
            isOpen ? "rotate-180" : ""
          }`}
        />
      </span>

      {/* 下拉選單 */}
      {isOpen && (
        <>
          {/* 背景遮罩，點擊時關閉下拉選單 */}
          <div
            className="fixed inset-0 z-10"
            onClick={() => setIsOpen(false)}
          />

          <ul
            className="absolute text-center bg-white rounded-md shadow-lg z-20 
            left-1/2 transform -translate-x-1/2 mt-2 w-60 max-w-xs lg:left-auto lg:right-2 
            lg:transform-none lg:translate-x-0 border border-gray-200"
          >
            {options.map((option, index) => (
              <li
                key={index}
                className={`px-4 py-2 text-sm font-bold cursor-pointer transition-colors duration-200 
                  ${
                    selected === option
                      ? "text-[#A9BA5C] bg-gray-100"
                      : "hover:text-[#A9BA5C] hover:bg-gray-50"
                  }
                  ${index === 0 ? "rounded-t-md" : ""}
                  ${index === options.length - 1 ? "rounded-b-md" : ""}
                `}
                onClick={() => handleOptionClick(option)}
              >
                {option}
              </li>
            ))}
          </ul>
        </>
      )}
    </div>
  );
}
