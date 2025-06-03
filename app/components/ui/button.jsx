import * as React from "react";
import { Slot } from "@radix-ui/react-slot";
import { cva } from "class-variance-authority";
import { motion } from "framer-motion";
import { cn } from "@/lib/utils";

const buttonVariants = cva(
  "inline-flex items-center justify-center gap-2 whitespace-nowrap rounded-lg text-sm font-medium transition-all disabled:pointer-events-none disabled:opacity-50 [&_svg]:pointer-events-none [&_svg:not([class*='size-'])]:size-4 shrink-0 [&_svg]:shrink-0 outline-none focus-visible:border-ring focus-visible:ring-ring/50 focus-visible:ring-[3px] aria-invalid:ring-destructive/20 dark:aria-invalid:ring-destructive/40 aria-invalid:border-destructive cursor-pointer",
  {
    variants: {
      variant: {
        default:
          "bg-[#101828] text-[#FBF9FA] shadow-xs hover:bg-[#F0F0F0] hover:text-[#101828]",
        destructive:
          "bg-destructive text-white shadow-xs hover:bg-destructive/90 focus-visible:ring-destructive/20 dark:focus-visible:ring-destructive/40 dark:bg-destructive/60",
        outline:
          "border bg-background shadow-xs hover:bg-accent hover:text-accent-foreground dark:bg-input/30 dark:border-input dark:hover:bg-input/50",
        secondary:
          "bg-secondary text-secondary-foreground shadow-xs hover:bg-secondary/80",
        ghost:
          "hover:bg-accent hover:text-accent-foreground dark:hover:bg-accent/50",
        link: "text-primary underline-offset-4 hover:underline",
        custom: "",
        addToCart:
          "bg-[#A9BA5C] text-white text-[18px] shadow-xs cursor-pointer font-normal",
        // 新增 iconButton 變體，用於眼睛圖示等簡單按鈕
        iconButton:
          "bg-transparent hover:bg-gray-100 text-gray-500 hover:text-gray-700 p-1 rounded-md",
      },
      size: {
        default: "h-9 px-4 py-2 has-[>svg]:px-3",
        sm: "h-8 rounded-md gap-1.5 px-3 has-[>svg]:px-2.5",
        lg: "h-10 rounded-md px-6 has-[>svg]:px-4",
        icon: "size-9",
        //新增小圖示按鈕尺寸
        iconSm: "size-6 p-1",
      },
      rounded: {
        login: "rounded-[60px]",
      },
    },
    defaultVariants: {
      variant: "default",
      size: "default",
    },
  }
);

const Button = React.forwardRef(function Button(
  {
    className,
    variant,
    size,
    rounded,
    asChild = false,
    // 新增 as 屬性，允許指定渲染的元素類型
    as = "button",
    // 新增 clickable 屬性，控制是否為可點擊元素
    clickable = true,
    ...props
  },
  ref
) {
  // 根據 asChild 和 as 屬性決定使用什麼元素
  let Comp;

  if (asChild) {
    Comp = Slot;
  } else if (as === "div" || as === "span") {
    // 如果指定為 div 或 span，使用對應元素
    Comp = as;
  } else {
    // 默認使用 button
    Comp = "button";
  }

  // 為非 button 元素添加可存取性屬性
  const accessibilityProps = {};
  if (Comp !== "button" && clickable) {
    accessibilityProps.role = "button";
    accessibilityProps.tabIndex = 0;

    // 如果有 onClick 且沒有 onKeyDown，自動添加鍵盤事件處理
    if (props.onClick && !props.onKeyDown) {
      accessibilityProps.onKeyDown = (e) => {
        if (e.key === "Enter" || e.key === " ") {
          e.preventDefault();
          props.onClick(e);
        }
      };
    }
  }

  return (
    <Comp
      ref={ref}
      data-slot="button"
      className={cn(buttonVariants({ variant, size, rounded, className }))}
      {...accessibilityProps}
      {...props}
    />
  );
});

const IconButton = React.forwardRef(function IconButton(
  {
    className,
    children,
    as = "div", 
    ...props
  },
  ref
) {
  return (
    <Button
      ref={ref}
      as={as}
      variant="iconButton"
      size="iconSm"
      className={className}
      {...props}
    >
      {children}
    </Button>
  );
});

export { Button, IconButton, buttonVariants };
