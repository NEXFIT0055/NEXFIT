import Link from "next/link";
import React from "react";

const UiButton = React.forwardRef(function UiButton(
  { children, onClick, variant = "primary", otherClass, link = "", ...props },
  ref
) {
  const baseStyle =
    "cursor-pointer text-white text-lg hover:opacity-90 duration-300";

  const variants = {
    primary: "bg-[#AFC16D] hover:bg-[#94ae4f]",
    dark: "bg-[#2B2A2A] hover:bg-[#444]",
    gray: "bg-[#D9D9D9] text-black",
  };

  if (link) {
    return (
      <Link
        href={link}
        onClick={onClick}
        className={`!text-white text-center ${baseStyle} ${variants[variant]} ${otherClass}`}
        ref={ref}
        {...props}
      >
        {children}
      </Link>
    );
  }

  return (
    <button
      onClick={onClick}
      className={`${baseStyle} ${variants[variant]} ${otherClass}`}
      ref={ref}
      {...props}
    >
      {children}
    </button>
  );
});

export default UiButton;
