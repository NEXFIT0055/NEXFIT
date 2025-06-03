"use client";

import React, { useState } from "react";
import { ChevronLeft, ChevronRight } from "lucide-react";
import { DayPicker } from "react-day-picker";
import { cn } from "@/lib/utils";
import { buttonVariants } from "@/app/components/ui/button";

const currentYear = new Date().getFullYear();


const months = Array.from({ length: 12 }, (_, i) => `${i + 1}月`);

const getYearGrid = (start, end) =>
  Array.from({ length: Math.min(12, end - start + 1) }, (_, i) => start + i);

export default function Calendar({ selected, onSelect, setSelectedDate }) {
  const [displayDate, setDisplayDate] = useState(selected || new Date());
  const [viewMode, setViewMode] = useState("day");

  const year = displayDate.getFullYear();
  const month = displayDate.getMonth();

  const today = new Date();

  const handleYearSelect = (y) => {
    const newDate = new Date(y, month);
    setDisplayDate(newDate);
    setSelectedDate(newDate);
    setViewMode("month");
  };

  const handleMonthSelect = (m) => {
    const newDate = new Date(year, m);
    setDisplayDate(newDate);
    setSelectedDate(newDate);
    setViewMode("day");
  };

  const renderHeader = () => (
    <div className="flex justify-between items-center mb-2 px-2">
      <button
        onClick={() => {
          if (viewMode === "year") {
            setDisplayDate(new Date(year - 12, 0));
          } else if (viewMode === "month") {
            setDisplayDate(new Date(year - 1, 0));
          } else {
            setDisplayDate(new Date(year, month - 1));
          }
        }}
        className={cn(buttonVariants({ variant: "ghost" }), "px-2")}
      >
        <ChevronLeft className="w-4 h-4" />
      </button>

      <div className="flex space-x-3">
        <button
          onClick={() => setViewMode("year")}
          className={cn(
            buttonVariants({ variant: "outline" }),
            "text-lg font-medium cursor-pointer rounded-sm"
          )}
        >
          {year}年
        </button>
        <button
          onClick={() => setViewMode("month")}
          className={cn(
            buttonVariants({ variant: "outline" }),
            "text-lg font-medium cursor-pointer rounded-sm"
          )}
        >
          {months[month]}
        </button>
      </div>

      <button
        onClick={() => {
          if (viewMode === "year") {
            setDisplayDate(new Date(year + 12, 0));
          } else if (viewMode === "month") {
            setDisplayDate(new Date(year + 1, 0));
          } else {
            setDisplayDate(new Date(year, month + 1));
          }
        }}
        className={cn(buttonVariants({ variant: "ghost" }), "px-2")}
      >
        <ChevronRight className="w-4 h-4" />
      </button>
    </div>
  );

  const renderMonthGrid = () => (
    <div className="grid grid-cols-3 gap-2 p-2">
      {months.map((m, idx) => (
        <button
          key={idx}
          onClick={() => handleMonthSelect(idx)}
          className="border rounded p-2 text-center hover:bg-accent"
        >
          {m}
        </button>
      ))}
    </div>
  );

  const renderYearGrid = () => {
    const start = Math.floor(year / 12) * 12;
    const end = Math.min(currentYear, start + 11);
    const years = getYearGrid(start, end);

    return (
      <div className="grid grid-cols-3 gap-2 p-2">
        {years.map((y) => (
          <button
            key={y}
            onClick={() => handleYearSelect(y)}
            className={cn("border rounded p-2 text-center hover:bg-accent")}
          >
            {y}
          </button>
        ))}
      </div>
    );
  };

  return (
    <div className="p-4 w-[320px] bg-white shadow rounded">
      {renderHeader()}
      {viewMode === "year" && renderYearGrid()}
      {viewMode === "month" && renderMonthGrid()}
      {viewMode === "day" && (
        <DayPicker
          mode="single"
          month={displayDate}
          onMonthChange={setDisplayDate}
          selected={selected}
          onSelect={onSelect}
          disabled={(date) => date > today} 
          classNames={{
            months: "px-3",
            table: "w-full",
            day_selected: "bg-fontColor text-white rounded-full",
            caption: "hidden",
            head_row: "flex justify-center",
            head_cell:
              "text-muted-foreground rounded-md w-9 font-normal text-[0.8rem] text-center",
            row: "flex justify-center mt-2",
            cell: "text-center w-9",
            day: "h-9 w-9 p-0 font-normal aria-selected:opacity-100 hover:bg-borderColor hover:text-accent-foreground rounded-full cursor-pointer",
            day_outside: "text-muted-foreground opacity-50",
            day_disabled: "text-muted-foreground opacity-50 cursor-not-allowed",
          }}
          weekStartsOn={0}
          formatters={{
            formatWeekdayName: (weekday) => {
              const weekdays = ["日", "一", "二", "三", "四", "五", "六"];
              return weekdays[weekday.getDay()];
            },
          }}
        />
      )}
    </div>
  );
}
