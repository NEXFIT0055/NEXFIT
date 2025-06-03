'use client';

import { useEffect, useState } from "react";
import { usePathname } from "next/navigation"; // 用於取得當前路徑
import Navbar from "../../components/Navbar";
import Footer from "../../components/Footer_course";
import { Toaster } from "@/app/components/ui/sonner";

export default function MainLayout({ children }) {
  const pathname = usePathname(); // 取得當前路徑
  const [isLgScreen, setIsLgScreen] = useState(false); // 判斷螢幕大小

  useEffect(() => {
    // 動態修改 body 樣式
    document.body.style.overflowX = "visible";

    // 清理樣式，避免影響其他頁面
    return () => {
      document.body.style.overflowX = "";
    };
  }, []);

  useEffect(() => {
    // 檢查螢幕寬度是否大於 lg (1024px)
    const handleResize = () => {
      setIsLgScreen(window.innerWidth >= 1024);
    };

    // 初始檢查
    handleResize();

    // 監聽螢幕大小變化
    window.addEventListener("resize", handleResize);

    // 清理事件監聽器
    return () => {
      window.removeEventListener("resize", handleResize);
    };
  }, []);

  // 判斷是否需要隱藏 Footer
  const hideFooterPaths = [
    "/reservation/course/",
    "/reservation/info/"
  ];

  const shouldHideFooter =
    hideFooterPaths.some(path => pathname.startsWith(path)) &&
    !(pathname.startsWith("/reservation/course/") && isLgScreen);


  return (
    <>
      <Navbar />
      <main>
        {children}
      </main>
      <Toaster richColors position="top-center" />
      {!shouldHideFooter && <Footer />}
    </>
  );
}