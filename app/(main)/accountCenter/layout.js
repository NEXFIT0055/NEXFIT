"use client";
import React, { useState, useEffect, Suspense } from "react";
import { useSearchParams, usePathname, useRouter } from "next/navigation";
import LoginModal from "@/app/components/login";
import Navbar from "@/app/components/Navbar";
import Sidebar from "@/app/components/Sidebar";
import Footer from "@/app/components/Footer";
import { FavoritesProvider } from "@/app/contexts/FavoriteContext";

// 將使用 useSearchParams 的邏輯分離到單獨組件
function SearchParamsHandler({ onShowLogin }) {
  const searchParams = useSearchParams();

  useEffect(() => {
    // 檢查 URL 中是否有 showLogin 參數
    if (searchParams.get("showLogin") === "true") {
      onShowLogin(true);
    }
  }, [searchParams, onShowLogin]);

  return null; // 這個組件不需要渲染任何內容
}

function MainLayoutContent({ children }) {
  const [showLogin, setShowLogin] = useState(false);
  const [isAuthenticated, setIsAuthenticated] = useState(false);
  const MIN_LOADING_TIME = 1000; // 設定最小載入時間為1秒

  const pathname = usePathname();
  const router = useRouter();

  // 檢查是否為需要認證的路徑
  const isProtectedRoute = pathname.includes("/accountCenter");

  useEffect(() => {
    const startTime = Date.now();

    // 檢查認證狀態
    const checkAuthentication = () => {
      // 只有在受保護的路由才需要檢查認證
      if (isProtectedRoute) {
        try {
          const token = localStorage.getItem("token");
          setIsAuthenticated(!!token); // 直接根據 token 存在與否設置認證狀態

          // 如果沒有 token 且在受保護的路由，顯示登入視窗
          if (!token) {
            setShowLogin(true);
          }
        } catch (error) {
          console.error("無法存取 localStorage:", error);
          setIsAuthenticated(false);
          setShowLogin(true);
        }
      } else {
        // 非受保護路由，不需要認證
        setIsAuthenticated(true);
      }
    };

    // 處理載入狀態
    const handleLoading = () => {
      checkAuthentication();

      // 確保至少顯示載入動畫的最短時間
      const elapsedTime = Date.now() - startTime;
      const remainingTime = Math.max(0, MIN_LOADING_TIME - elapsedTime);
    };

    handleLoading();
  }, [pathname, isProtectedRoute]);

  // 處理登入成功
  const handleAuthSuccess = () => {
    setIsAuthenticated(true);
    setShowLogin(false);
    // 如果有原始訪問路徑，則返回該路徑，否則跳轉到會員中心
    const originalPath = pathname || "/accountCenter/member/account";
    router.push(originalPath);
  };

  // 未認證且是受保護的路由，只顯示登入模式
  if (!isAuthenticated && isProtectedRoute) {
    return (
      <>
        <Suspense fallback={null}>
          <SearchParamsHandler onShowLogin={setShowLogin} />
        </Suspense>
        {showLogin && (
          <div className="fixed inset-0 z-50 bg-black/60 flex items-center justify-center">
            <LoginModal
              isOpen={showLogin}
              onClose={() => {
                setShowLogin(false);
                // 只有在用戶主動關閉登入框時才重定向到首頁
                if (!isAuthenticated) {
                  router.push("/");
                }
              }}
              onLoginSuccess={handleAuthSuccess}
            />
          </div>
        )}
      </>
    );
  }

  // 標準佈局
  return (
    <>
      <Suspense fallback={null}>
        <SearchParamsHandler onShowLogin={setShowLogin} />
      </Suspense>
      <Navbar />
      <main className="flex flex-wrap lg:flex-nowrap ">
        <Sidebar />
        <FavoritesProvider>{children}</FavoritesProvider>
      </main>
      <Footer />
    </>
  );
}

export default function MainLayout({ children }) {
  return (
    <Suspense fallback={<div>Loading...</div>}>
      <MainLayoutContent children={children} />
    </Suspense>
  );
}
