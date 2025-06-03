"use client";

import React, { useState, useEffect, useRef } from "react";
import Image from "next/image";
import Link from "next/link";
import { links } from "/app/config/navbarSection";
import { useAuth } from "@/app/contexts/AuthContext";
import LoginModal from "./login";
import { IoMenu, IoClose } from "react-icons/io5";
import { Button } from "@/app/components/ui/button";
import CartSheet from "./CartSheet";

const HoverLink = ({ en, zh }) => {
  return (
    <div className="relative inline-block  group-hover:opacity-100 min-w-[100px] text-center h-8">
      <div className="relative h-full w-full overflow-hidden">
        <span className="absolute inset-0 flex items-center justify-center transition-all duration-300 ease-in-out transform group-hover:-translate-y-full">
          {en}
        </span>
        <span className="absolute inset-0 flex items-center justify-center transition-all duration-300 ease-in-out transform translate-y-full group-hover:translate-y-0">
          {zh}
        </span>
      </div>
    </div>
  );
};

export default function Navbar() {
  const {
    isAuthenticated,
    user,
    userAvatar,
    userName,
    userEmail,
    isLoading,
    logout,
  } = useAuth();

  // UI 狀態
  const [isLoginModalOpen, setIsLoginModalOpen] = useState(false);
  const [isMenuOpen, setIsMenuOpen] = useState(false);
  const [isDropdownOpen, setIsDropdownOpen] = useState(false);

  // 頭像狀態管理
  const [displayAvatar, setDisplayAvatar] = useState("");
  const [avatarKey, setAvatarKey] = useState(0); // 用於強制重新渲染

  // 使用 ref 來追蹤狀態，避免重複更新
  const lastAvatarRef = useRef("");
  const isUpdatingRef = useRef(false);

  const simpleHash = (str) => {
    let hash = 0;
    for (let i = 0; i < str.length; i++) {
      const char = str.charCodeAt(i);
      hash = (hash << 5) - hash + char;
      hash = hash & hash;
    }
    return Math.abs(hash).toString(16).substring(0, 8);
  };

  // 生成預設頭像
  const getDefaultAvatar = (name) => {
    if (name) {
      try {
        const hash = simpleHash(name + name.charAt(0));
        return `https://www.gravatar.com/avatar/${hash}?s=200&d=identicon&r=pg`;
      } catch (error) {
        console.warn("生成預設頭像失敗:", error);
        return `https://www.gravatar.com/avatar/default?s=200&d=identicon&r=pg`;
      }
    }
    return "https://www.gravatar.com/avatar/default?s=200&d=identicon&r=pg";
  };

  // 🔥 修復：改進的頭像獲取邏輯
  const getCurrentAvatar = () => {
    if (!isAuthenticated) return "";

    const currentName = userName || user?.name || user?.nickname;

    const authAvatar = userAvatar || user?.avatar || user?.avatar_url;

    console.log("🔍 Navbar 獲取頭像:", {
      userAvatar,
      userAvatar2: user?.avatar,
      userAvatar3: user?.avatar_url,
      authAvatar,
      currentName,
    });

    // 1. 如果有真實上傳的頭像，直接使用
    if (authAvatar && !authAvatar.includes("gravatar.com/avatar/default")) {
      console.log("✅ 使用真實頭像:", authAvatar);
      return authAvatar;
    }

    // 2. 檢查 localStorage 中是否有更新的頭像
    const localAvatar = localStorage.getItem("userAvatar");
    if (localAvatar && !localAvatar.includes("gravatar.com/avatar/default")) {
      console.log("✅ 使用 localStorage 頭像:", localAvatar);
      return localAvatar;
    }

    // 3. 使用預設頭像
    const defaultAvatar = getDefaultAvatar(currentName);
    console.log("🎨 使用預設頭像:", defaultAvatar);
    return defaultAvatar;
  };

  // 🔥 修復：簡化的頭像更新函數
  const updateAvatar = (source = "unknown") => {
    if (isUpdatingRef.current) {
      console.log(`⚠️ [${source}] 正在更新中，跳過`);
      return;
    }

    if (!isAuthenticated) {
      if (displayAvatar) {
        console.log(`🚪 [${source}] 用戶未登入，清空頭像`);
        setDisplayAvatar("");
        lastAvatarRef.current = "";
        setAvatarKey((prev) => prev + 1);
      }
      return;
    }

    try {
      isUpdatingRef.current = true;
      const newAvatar = getCurrentAvatar();

      console.log(`🔄 [${source}] 檢查頭像更新:`, {
        newAvatar: newAvatar?.substring(0, 50) + "...",
        lastAvatar: lastAvatarRef.current?.substring(0, 50) + "...",
        isDifferent: newAvatar !== lastAvatarRef.current,
      });

      // 只在頭像真的改變時才更新
      if (newAvatar && newAvatar !== lastAvatarRef.current) {
        console.log(`✅ [${source}] Navbar 更新頭像:`, newAvatar);
        setDisplayAvatar(newAvatar);
        lastAvatarRef.current = newAvatar;
        setAvatarKey((prev) => prev + 1);
      }
    } finally {
      isUpdatingRef.current = false;
    }
  };

  // 🔥 修復：監聽 AuthContext 變化，特別關注頭像相關的變化
  useEffect(() => {
    console.log("🔄 Navbar AuthContext 變化:", {
      isAuthenticated,
      isLoading,
      hasUser: !!user,
      userAvatar: userAvatar?.substring(0, 50) + "...",
      userAvatarFromUser: user?.avatar?.substring(0, 50) + "...",
      userName,
      currentDisplayAvatar: displayAvatar?.substring(0, 50) + "...",
    });

    // 等待載入完成後再更新頭像
    if (!isLoading) {
      // 🔥 關鍵修復：每次 AuthContext 更新都檢查頭像
      setTimeout(() => {
        updateAvatar("AuthContext變化");
      }, 100);
    }
  }, [isAuthenticated, user, userAvatar, userName, userEmail, isLoading]);

  // 🔥 修復：增強的事件監聽
  useEffect(() => {
    const handleAvatarUpdate = (event) => {
      console.log(
        "📝 Navbar 偵測到頭像更新事件:",
        event.detail?.newAvatar?.substring(0, 50) + "..."
      );

      if (event.detail?.newAvatar) {
        const newAvatar = event.detail.newAvatar;
        if (newAvatar !== lastAvatarRef.current) {
          console.log("📝 Navbar 從事件更新頭像:", newAvatar);
          setDisplayAvatar(newAvatar);
          lastAvatarRef.current = newAvatar;
          setAvatarKey((prev) => prev + 1);

          // 確保同步到 localStorage
          try {
            localStorage.setItem("userAvatar", newAvatar);
          } catch (error) {
            console.error("localStorage 更新失敗:", error);
          }
        }
      } else {
        // 沒有具體頭像資訊，重新計算
        setTimeout(() => {
          updateAvatar("頭像更新事件");
        }, 100);
      }
    };

    const handleStorageChange = (e) => {
      // 處理 localStorage 變化
      if (e.key === "userAvatar" || e.key === null) {
        console.log("📝 Navbar 偵測到 localStorage 變化");
        setTimeout(() => {
          updateAvatar("localStorage變化");
        }, 100);
      }
    };

    const handleAuthStateChange = () => {
      console.log("🔄 Navbar 偵測到認證狀態變化");
      setTimeout(() => {
        updateAvatar("認證狀態變化");
      }, 200);
    };

    // 🔥 新增：專門處理用戶資料更新的事件
    const handleUserDataUpdate = () => {
      console.log("👤 Navbar 偵測到用戶資料更新");
      setTimeout(() => {
        updateAvatar("用戶資料更新");
      }, 100);
    };

    // 監聽所有相關事件
    window.addEventListener("avatarUpdate", handleAvatarUpdate);
    window.addEventListener("storage", handleStorageChange);
    window.addEventListener("loginStateChange", handleAuthStateChange);
    window.addEventListener("userLoggedIn", handleAuthStateChange);
    window.addEventListener("userLoggedOut", handleAuthStateChange);
    window.addEventListener("authStateChanged", handleAuthStateChange);
    window.addEventListener("authInitialized", handleAuthStateChange);
    window.addEventListener("tokenChanged", handleUserDataUpdate);

    // 🔥 新增：監聽自定義的用戶更新事件
    window.addEventListener("userProfileUpdated", handleUserDataUpdate);
    window.addEventListener("avatarUploaded", handleAvatarUpdate);

    return () => {
      window.removeEventListener("avatarUpdate", handleAvatarUpdate);
      window.removeEventListener("storage", handleStorageChange);
      window.removeEventListener("loginStateChange", handleAuthStateChange);
      window.removeEventListener("userLoggedIn", handleAuthStateChange);
      window.removeEventListener("userLoggedOut", handleAuthStateChange);
      window.removeEventListener("authStateChanged", handleAuthStateChange);
      window.removeEventListener("authInitialized", handleAuthStateChange);
      window.removeEventListener("tokenChanged", handleUserDataUpdate);
      window.removeEventListener("userProfileUpdated", handleUserDataUpdate);
      window.removeEventListener("avatarUploaded", handleAvatarUpdate);
    };
  }, [isAuthenticated]);

  // 🔥 修復：定期檢查頭像更新（針對可能錯過的事件）
  useEffect(() => {
    if (!isAuthenticated) return;

    const interval = setInterval(() => {
      // 檢查 AuthContext 中的頭像是否有變化
      const currentAuthAvatar = userAvatar || user?.avatar || user?.avatar_url;
      const localAvatar = localStorage.getItem("userAvatar");

      // 如果 AuthContext 或 localStorage 中的頭像與顯示的不同，更新它
      if (
        (currentAuthAvatar && currentAuthAvatar !== displayAvatar) ||
        (localAvatar &&
          localAvatar !== displayAvatar &&
          localAvatar !== lastAvatarRef.current)
      ) {
        console.log("⏰ 定期檢查發現頭像需要更新");
        updateAvatar("定期檢查");
      }
    });

    return () => clearInterval(interval);
  }, [isAuthenticated, userAvatar, user, displayAvatar]);

  // 處理圖片載入錯誤
  const handleImageError = (e) => {
    console.log("⚠️ Navbar 頭像載入失敗:", e.target.src);

    const currentName = userName || user?.name || user?.nickname;
    const defaultAvatar = getDefaultAvatar(currentName);

    // 如果載入失敗的不是預設頭像，則使用預設頭像
    if (e.target.src !== defaultAvatar) {
      console.log("🔄 Navbar 使用預設頭像:", defaultAvatar);
      setDisplayAvatar(defaultAvatar);
      lastAvatarRef.current = defaultAvatar;
      setAvatarKey((prev) => prev + 1);

      // 更新 localStorage
      if (isAuthenticated) {
        try {
          localStorage.setItem("userAvatar", defaultAvatar);
        } catch (error) {
          console.error("localStorage 更新失敗:", error);
        }
      }
    }
  };

  const openLoginModal = () => {
    setIsLoginModalOpen(true);
  };

  const closeLoginModal = () => {
    setIsLoginModalOpen(false);
  };

  const toggleMenu = () => {
    setIsMenuOpen(!isMenuOpen);
  };

  const handleLogout = () => {
    console.log("🚪 Navbar 執行登出");
    logout();
    setDisplayAvatar("");
    lastAvatarRef.current = "";
    setIsDropdownOpen(false);
    setAvatarKey((prev) => prev + 1);
    window.location.href = "/";
  };

  const toggleDropdown = () => {
    setIsDropdownOpen(!isDropdownOpen);
  };

  // 點擊外部關閉下拉選單
  useEffect(() => {
    const handleClickOutside = (event) => {
      if (isDropdownOpen && !event.target.closest(".user-dropdown")) {
        setIsDropdownOpen(false);
      }
    };

    document.addEventListener("mousedown", handleClickOutside);
    return () => {
      document.removeEventListener("mousedown", handleClickOutside);
    };
  }, [isDropdownOpen]);

  // 如果正在載入認證狀態，顯示載入中的導航列
  if (isLoading) {
    return (
      <nav className="flex items-center justify-between p-1 shadow-md mb-[1px]">
        <Link href="/" className="logo">
          <p className="text-3xl font-bold py-2.5 pl-4 sm:pl-8 lg:pl-16">
            NEXFIT
          </p>
        </Link>

        <div className="flex items-center gap-4 sm:gap-6 pr-4 sm:pr-8 lg:pr-16">
          <div className="w-8 h-8 bg-gray-200 rounded-full animate-pulse"></div>
        </div>
      </nav>
    );
  }

  return (
    <nav className="flex items-center justify-between p-3  bg-white absolute top-0 left-0 right-0 z-50">
      <Link href="/" className="logo">
        <p className="text-3xl font-bold py-2.5 pl-4 sm:pl-8 lg:pl-16">
          NEXFIT
        </p>
      </Link>

      <div
        className={`${
          isMenuOpen
            ? "fixed inset-0 bg-black/90 flex items-center justify-center z-50 h-screen animate-slideDown"
            : "hidden"
        } w-full flex-col lg:static lg:flex lg:flex-row lg:w-auto lg:justify-center lg:gap-1 lg:bg-transparent`}
      >
        <div
          className={`${
            isMenuOpen
              ? "bg-white p-8 w-full h-[90vh] my-auto transition-all duration-300 ease-in-out relative"
              : ""
          } flex flex-col items-center gap-6 lg:flex-row lg:bg-transparent lg:p-0 lg:w-auto lg:h-auto`}
        >
          <Button
            variant="outline"
            className="absolute top-3 right-3 lg:hidden p-0 h-auto min-h-0 w-auto min-w-0 rounded-sm"
            onClick={() => setIsMenuOpen(false)}
          >
            <IoClose className="text-fontColor" />
          </Button>

          {links.map((link) => (
            <Link
              key={link.id}
              href={link.href}
              className={`relative w-3/4 text-center py-2 text-[#101828] group lg:w-auto lg:ml-5 ${
                isMenuOpen ? "animate-slideDown-item" : ""
              }`}
              onClick={() => setIsMenuOpen(false)}
            >
              <div className={link.en ? "font-bold" : ""}>
                <HoverLink en={link.en} zh={link.zh} />
              </div>
              <span className="absolute bottom-1 left-1/2 w-0 h-[4.2px] bg-[#A9BA5C] transition-all duration-300 transform -translate-x-1/2 group-hover:w-[calc(100%-45px)]" />
            </Link>
          ))}

          {isAuthenticated && (
            <div className="w-3/4 lg:hidden mt-4 pt-4">
              <button
                onClick={() => {
                  handleLogout();
                  setIsMenuOpen(false);
                }}
                className="w-full text-center px-4 py-3 text-lg text-[#101828] hover:bg-[#F0F0F0] hover:rounded-lg"
              >
                登出
              </button>
            </div>
          )}
        </div>
      </div>

      <div className="flex items-center gap-4 sm:gap-6 pr-4 sm:pr-8 lg:pr-16">
        {isAuthenticated ? (
          <>
            {/* 手機版頭像 */}
            <Link
              href="/accountCenter/member/account"
              className="lg:hidden cursor-pointer flex items-center justify-center min-w-[30px] min-h-[30px] w-[30px] h-[30px] sm:min-w-[32px] sm:min-h-[32px] sm:w-[32px] sm:h-[32px]"
            >
              {displayAvatar ? (
                <Image
                  key={`mobile-avatar-${avatarKey}`}
                  src={displayAvatar}
                  alt="User Avatar"
                  width={32}
                  height={32}
                  className="rounded-full object-cover"
                  onError={handleImageError}
                  unoptimized={displayAvatar?.startsWith("http")}
                  priority
                />
              ) : (
                <div className="w-8 h-8 bg-gray-200 rounded-full animate-pulse"></div>
              )}
            </Link>

            {/* 桌面版下拉選單 */}
            <div className="hidden lg:block relative user-dropdown">
              <button
                onClick={toggleDropdown}
                className="flex items-center gap-2 cursor-pointer"
              >
                {displayAvatar ? (
                  <Image
                    key={`desktop-avatar-${avatarKey}`}
                    src={displayAvatar}
                    alt="User Avatar"
                    width={32}
                    height={32}
                    className="rounded-full object-cover"
                    onError={handleImageError}
                    unoptimized={displayAvatar?.startsWith("http")}
                    priority
                  />
                ) : (
                  <div className="w-8 h-8 bg-gray-200 rounded-full animate-pulse"></div>
                )}
              </button>

              <div
                className={`${
                  isDropdownOpen ? "block" : "hidden"
                } absolute right-0 top-full mt-2 w-48 bg-white rounded-lg shadow-lg py-2 z-50`}
              >
                <div className="px-4 py-3 text-sm text-gray-700 border-b border-gray-200">
                  <div className="font-bold">{userName || user?.name}</div>
                  <div className="text-gray-500">
                    {userEmail || user?.email}
                  </div>
                </div>
                <Link
                  href="/accountCenter/member/account"
                  className="block px-4 py-3 text-sm text-gray-700 hover:bg-gray-100"
                  onClick={() => setIsDropdownOpen(false)}
                >
                  會員中心
                </Link>
                <button
                  onClick={() => {
                    handleLogout();
                    setIsDropdownOpen(false);
                  }}
                  className="w-full text-left px-4 py-3 text-sm text-red-600 hover:bg-gray-100"
                >
                  登出
                </button>
              </div>
            </div>
          </>
        ) : (
          <button
            className="cursor-pointer flex items-center justify-center min-w-[30px] min-h-[30px] w-[30px] h-[30px] sm:min-w-[32px] sm:min-h-[32px] sm:w-[32px] sm:h-[32px]"
            onClick={openLoginModal}
          >
            <Image
              src="/account.svg"
              alt="Account Icon"
              width={30}
              height={30}
              className="w-full h-full"
              priority
            />
          </button>
        )}

        <CartSheet isLoggedIn={isAuthenticated} />

        <Button
          variant="outline"
          className="lg:hidden p-0 h-auto min-h-0 w-auto min-w-0 rounded-sm"
          onClick={toggleMenu}
        >
          <IoMenu className="text-fontColor" />
        </Button>
      </div>

      {isLoginModalOpen && (
        <LoginModal isOpen={true} onClose={closeLoginModal} />
      )}

      {/* 🔥 增強的開發環境除錯資訊
      {process.env.NODE_ENV === "development" && (
        <div className="fixed bottom-4 left-4 bg-black bg-opacity-75 text-white text-xs p-2 rounded max-w-xs z-50">
          <div>登入: {isAuthenticated ? "是" : "否"}</div>
          <div>載入中: {isLoading ? "是" : "否"}</div>
          <div>
            顯示頭像:{" "}
            {displayAvatar ? displayAvatar.substring(0, 30) + "..." : "無"}
          </div>
          <div>
            用戶頭像: {userAvatar ? userAvatar.substring(0, 30) + "..." : "無"}
          </div>
          <div>用戶: {user?.name || "無"}</div>
          <div>
            localStorage: {localStorage.getItem("userAvatar") ? "有" : "無"}
          </div>
          <button
            onClick={() => updateAvatar("手動更新")}
            className="mt-1 px-2 py-1 bg-blue-500 rounded text-xs"
          >
            強制更新頭像
          </button>
          <button
            onClick={() => {
              console.log("當前狀態:", {
                userAvatar,
                userFromContext: user,
                displayAvatar,
                localStorage: localStorage.getItem("userAvatar"),
              });
            }}
            className="mt-1 ml-1 px-2 py-1 bg-green-500 rounded text-xs"
          >
            顯示狀態
          </button>
        </div>
      )} */}
    </nav>
  );
}
