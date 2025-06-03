"use client";

import * as React from "react";
import { useState } from "react";
import { format } from "date-fns";
import { CalendarIcon } from "lucide-react";

import { cn } from "@/lib/utils";
import { Button } from "@/app/components/ui/button";
import Calendar from "@/app/components/ui/calendar";
import {
  Popover,
  PopoverContent,
  PopoverTrigger,
} from "@/app/components/ui/popover";

export function DatePickerDemo({ value, onChange, disabled = false }) {
  const [date, setDate] = useState(value || new Date());
  const [open, setOpen] = useState(false);

  const handleSelect = (selectedDate) => {
    setDate(selectedDate);
    setOpen(false);
    if (onChange) {
      onChange(selectedDate);
    }
  };

  return (
    <Popover
      open={open}
      onOpenChange={(isOpen) => {
        if (!disabled) {
          setOpen(isOpen);
          if (isOpen) {
            setDate(date);
          }
        }
      }}
    >
      {/* 解決方案：使用 asChild */}
      <PopoverTrigger asChild>
        <Button
          variant="outline"
          disabled={disabled}
          className={cn(
            "w-full justify-start text-left font-normal border-b border-t-0 border-x-0 rounded-none",
            !date && "text-muted-foreground",
            disabled && "opacity-50 cursor-not-allowed"
          )}
        >
          <CalendarIcon className="mr-2 h-4 w-4" />
          {date ? format(date, "yyyy/MM/dd") : "選擇日期"}
        </Button>
      </PopoverTrigger>
      <PopoverContent className="w-auto p-0" align="start">
        <Calendar
          selected={date}
          onSelect={handleSelect}
          setSelectedDate={setDate}
        />
      </PopoverContent>
    </Popover>
  );
}

// 替代方案：如果 asChild 還是有問題，可以用這個版本
export function DatePickerDemoAlternative({
  value,
  onChange,
  disabled = false,
}) {
  const [date, setDate] = useState(value || new Date());
  const [open, setOpen] = useState(false);

  const handleSelect = (selectedDate) => {
    setDate(selectedDate);
    setOpen(false);
    if (onChange) {
      onChange(selectedDate);
    }
  };

  return (
    <Popover
      open={open}
      onOpenChange={(isOpen) => {
        if (!disabled) {
          setOpen(isOpen);
          if (isOpen) {
            setDate(date);
          }
        }
      }}
    >
      {/* 替代方案：直接使用 PopoverTrigger，不包裝 Button */}
      <PopoverTrigger
        disabled={disabled}
        className={cn(
          "w-full justify-start text-left font-normal border-b border-t-0 border-x-0 rounded-none",
          "inline-flex items-center justify-start gap-2 px-3 py-2 text-sm",
          "bg-background hover:bg-accent hover:text-accent-foreground",
          "focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring",
          !date && "text-muted-foreground",
          disabled && "opacity-50 cursor-not-allowed pointer-events-none"
        )}
      >
        <CalendarIcon className="mr-2 h-4 w-4" />
        {date ? format(date, "yyyy/MM/dd") : "選擇日期"}
      </PopoverTrigger>
      <PopoverContent className="w-auto p-0" align="start">
        <Calendar
          selected={date}
          onSelect={handleSelect}
          setSelectedDate={setDate}
        />
      </PopoverContent>
    </Popover>
  );
}

// 第三種方案：如果你的 PopoverTrigger 不支援 asChild
export function DatePickerDemoDiv({ value, onChange, disabled = false }) {
  const [date, setDate] = useState(value || new Date());
  const [open, setOpen] = useState(false);

  const handleSelect = (selectedDate) => {
    setDate(selectedDate);
    setOpen(false);
    if (onChange) {
      onChange(selectedDate);
    }
  };

  const handleTriggerClick = () => {
    if (!disabled) {
      setOpen(!open);
    }
  };

  return (
    <Popover open={open} onOpenChange={setOpen}>
      {/* 使用 div 模擬按鈕樣式 */}
      <div
        onClick={handleTriggerClick}
        role="button"
        tabIndex={0}
        onKeyDown={(e) => {
          if ((e.key === "Enter" || e.key === " ") && !disabled) {
            e.preventDefault();
            handleTriggerClick();
          }
        }}
        className={cn(
          "w-full justify-start text-left font-normal border-b border-t-0 border-x-0 rounded-none",
          "inline-flex items-center gap-2 px-3 py-2 text-sm cursor-pointer",
          "bg-background hover:bg-accent hover:text-accent-foreground",
          "focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring",
          !date && "text-muted-foreground",
          disabled && "opacity-50 cursor-not-allowed pointer-events-none"
        )}
      >
        <CalendarIcon className="mr-2 h-4 w-4" />
        {date ? format(date, "yyyy/MM/dd") : "選擇日期"}
      </div>
      <PopoverContent className="w-auto p-0" align="start">
        <Calendar
          selected={date}
          onSelect={handleSelect}
          setSelectedDate={setDate}
        />
      </PopoverContent>
    </Popover>
  );
}
