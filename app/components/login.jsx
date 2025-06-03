"use client";

import React, { useState } from "react";
import { Button } from "./ui/button";
import Link from "next/link";
import Image from "next/image";
import SignupModal from "./signup";
import ForgotPasswordModal from "./ForgotPassword";
import { toast } from "sonner";
import { PiEyesFill } from "react-icons/pi";
import { signInWithPopup, GoogleAuthProvider } from "firebase/auth";
import { auth } from "@/lib/firebase";
import { useAuth } from "@/app/contexts/AuthContext"; // 使用 AuthContext

function LoginModal({ isOpen, onClose }) {
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [showPassword, setShowPassword] = useState(false);
  const [showSignup, setShowSignup] = useState(false);
  const [showForgotPassword, setShowForgotPassword] = useState(false);
  const [isLoading, setIsLoading] = useState(false);
  const [isFlipping, setIsFlipping] = useState(false);
  const [isClosing, setIsClosing] = useState(false);
  const [isGoogleLoading, setIsGoogleLoading] = useState(false);

  // 使用 AuthContext
  const { login, loginWithFirebase } = useAuth();

  // Google 登入處理函數（使用 Firebase + AuthContext）
  const handleGoogleLogin = async () => {
    try {
      setIsGoogleLoading(true);
      console.log("=== 開始 Firebase Google 登入 ===");

      const provider = new GoogleAuthProvider();
      provider.setCustomParameters({
        prompt: "select_account",
      });

      const result = await signInWithPopup(auth, provider);
      const user = result.user;

      console.log("Firebase 登入成功:", {
        uid: user.uid,
        email: user.email,
        displayName: user.displayName,
        photoURL: user.photoURL,
        emailVerified: user.emailVerified,
      });

      // 獲取 Firebase Token
      const token = await user.getIdToken();

      // 將用戶資訊保存到資料庫
      console.log("開始保存用戶資料到資料庫...");
      const saveResult = await saveUserToDatabase(user);

      if (saveResult.success) {
        console.log("資料庫保存成功，使用 AuthContext 登入");

        // 使用 AuthContext 的 loginWithFirebase 方法
        const authResult = await loginWithFirebase(user, token);

        if (authResult.success) {
          toast.success(`Google 登入成功，歡迎 ${user.displayName}！`);
          onClose();
        } else {
          throw new Error(authResult.error || "AuthContext 登入失敗");
        }
      } else {
        console.error("資料庫保存失敗:", saveResult);
        // 即使資料庫保存失敗，仍然嘗試登入
        const authResult = await loginWithFirebase(user, token);
        if (authResult.success) {
          toast.success(`Google 登入成功，歡迎 ${user.displayName}！`);
          onClose();
        } else {
          throw new Error("登入過程發生錯誤");
        }
      }
    } catch (error) {
      console.error("Firebase Google 登入錯誤:", error);

      if (error.code === "auth/popup-closed-by-user") {
        toast.error("登入視窗被關閉");
      } else if (error.code === "auth/popup-blocked") {
        toast.error("彈出視窗被阻擋，請允許彈出視窗");
      } else if (error.code === "auth/cancelled-popup-request") {
        toast.error("登入請求被取消");
      } else {
        toast.error(`Google 登入失敗: ${error.message}`);
      }
    } finally {
      setIsGoogleLoading(false);
    }
  };

  // 將 Firebase 用戶保存到資料庫
  const saveUserToDatabase = async (firebaseUser) => {
    try {
      console.log("呼叫 API 保存用戶資料...");

      const requestBody = {
        uid: firebaseUser.uid,
        email: firebaseUser.email,
        name: firebaseUser.displayName,
        image: firebaseUser.photoURL,
        emailVerified: firebaseUser.emailVerified,
      };

      console.log("API 請求資料:", requestBody);

      const response = await fetch("/api/save-firebase-user", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify(requestBody),
      });

      console.log("API 回應狀態:", response.status);

      if (!response.ok) {
        const errorText = await response.text();
        console.error("API 錯誤回應:", errorText);
        return {
          success: false,
          error: `API 請求失敗: ${response.status} - ${errorText}`,
        };
      }

      const result = await response.json();
      console.log("API 回應資料:", result);

      return { success: true, data: result };
    } catch (error) {
      console.error("保存用戶資料錯誤:", error);
      return {
        success: false,
        error: error.message,
      };
    }
  };

  // 🔥 一般登入處理函數（使用 AuthContext）- 包含完整調試
  const handleLogin = async () => {
    if (!email || !password) {
      toast.error("請填寫完整的登入資訊");
      return;
    }

    if (!email.includes("@")) {
      toast.error("請輸入有效的電子信箱");
      return;
    }

    try {
      setIsLoading(true);

      console.log("🔄 === LoginModal 開始登入流程 ===");
      console.log("📧 登入資料:", { email, password: "***" });
      console.log("🕐 開始時間:", new Date().toISOString());

      // 使用 AuthContext 的 login 方法
      console.log("📞 呼叫 AuthContext.login()...");
      const result = await login({ email, password });

      console.log("🔍 === LoginModal 收到的完整結果 ===");
      console.log("完整結果物件:", JSON.stringify(result, null, 2));
      console.log("- result.success:", result.success);
      console.log("- result.user:", result.user);
      console.log("- result.error:", result.error);
      console.log("- typeof result:", typeof result);
      console.log("- Object.keys(result):", Object.keys(result || {}));

      // 檢查 localStorage 中的 token
      const storedToken = localStorage.getItem("token");
      console.log(
        "💾 localStorage 中的 token:",
        storedToken ? `存在(${storedToken.substring(0, 20)}...)` : "不存在"
      );

      if (result && result.success === true) {
        console.log("✅ LoginModal: 登入成功處理開始");
        console.log("👤 登入用戶資料:", result.user);

        // 關閉模態框
        console.log("🚪 關閉登入模態框");
        onClose();

        // 顯示成功訊息
        const displayName =
          result.user?.nickname || result.user?.name || email.split("@")[0];
        console.log("🎉 顯示成功訊息，用戶:", displayName);
        toast.success(`登入成功，歡迎 ${displayName} 回來！`);
      } else {
        console.error("❌ LoginModal: 登入失敗處理開始");
        console.error("失敗原因:", result?.error || "未知錯誤");

        // 處理不同類型的錯誤
        let errorMessage = "登入失敗，請檢查帳號密碼";

        if (result?.error) {
          if (result.error.includes("用戶帳號已被刪除")) {
            errorMessage = "用戶帳號已被刪除，請重新註冊";
          } else if (result.error.includes("帳號或密碼錯誤")) {
            errorMessage = "帳號或密碼錯誤，請重新輸入";
          } else if (
            result.error.includes("登入服務暫時不可用") ||
            result.error.includes("登入功能暫時無法使用")
          ) {
            errorMessage = "登入服務暫時不可用，請稍後再試";
          } else if (
            result.error.includes("響應格式錯誤") ||
            result.error.includes("伺服器響應格式錯誤")
          ) {
            errorMessage = "伺服器響應格式錯誤，請聯繫技術支援";
          } else if (result.error.includes("網路連線錯誤")) {
            errorMessage = "網路連線錯誤，請檢查網路狀態";
          } else if (
            result.error.includes("API 響應格式不正確") ||
            result.error.includes("缺少認證 token")
          ) {
            errorMessage = "API 響應格式錯誤，請檢查後端配置";
          } else if (
            result.error.includes("API 不存在") ||
            result.error.includes("登入功能配置錯誤")
          ) {
            errorMessage = "登入功能配置錯誤，請聯繫系統管理員";
          } else {
            errorMessage = result.error;
          }
        }

        console.log("📢 顯示錯誤訊息:", errorMessage);
        toast.error(errorMessage);
      }
    } catch (error) {
      console.error("❌ === LoginModal 登入過程發生異常 ===");
      console.error("異常詳情:", error);
      console.error("異常堆疊:", error.stack);
      toast.error("登入過程發生未預期的錯誤");
    } finally {
      console.log("🏁 LoginModal 登入流程結束");
      setIsLoading(false);
    }
  };

  // 處理 Enter 鍵登入
  const handleKeyPress = (e) => {
    if (e.key === "Enter") {
      handleLogin();
    }
  };

  const handleSignupClick = () => {
    setIsFlipping(true);
    setTimeout(() => {
      setShowSignup(true);
      setIsFlipping(false);
    }, 300);
  };

  const handleClose = () => {
    setIsClosing(true);
    setTimeout(() => {
      onClose();
      setIsClosing(false);
      // 重置表單
      setEmail("");
      setPassword("");
      setShowPassword(false);
    }, 300);
  };

  if (!isOpen) {
    return null;
  }

  if (showSignup) {
    return (
      <SignupModal
        isOpen={isOpen}
        onClose={onClose}
        setShowLogin={() => setShowSignup(false)}
      />
    );
  }

  if (showForgotPassword) {
    return (
      <ForgotPasswordModal
        isOpen={isOpen}
        onClose={() => {
          setShowForgotPassword(false);
          onClose();
        }}
      />
    );
  }

  return (
    <div className="fixed inset-0 z-50 bg-black/60 flex items-center justify-center p-4">
      <div
        className={`bg-white rounded-lg shadow-xl p-4 sm:p-8 w-full max-w-md relative
          ${isFlipping ? "animate-flip-out" : "animate-flip-in"}
          ${isClosing ? "animate-fade-out" : ""}`}
        style={{ perspective: "1000px", transformOrigin: "center center" }}
      >
        <button
          onClick={handleClose}
          className="absolute top-2 right-3 sm:top-3 sm:right-5 text-gray-500 text-2xl bg-transparent border-none cursor-pointer hover:text-gray-700"
        >
          ×
        </button>
        <h2 className="text-3xl sm:text-[40px] font-bold my-3 sm:my-5 text-center text-[#333333]">
          登入到 NEXFIT
        </h2>

        <div className="flex justify-center">
          <Link href="#">
            <p className="relative mr-4 sm:mr-6 mb-6 sm:mb-10 text-xl sm:text-2xl opacity-100 text-black after:content-[''] after:absolute after:left-0 after:bottom-0 after:h-[2px] after:w-full after:bg-[#a9ba5c]">
              登入
            </p>
          </Link>
          <Link href="#" onClick={handleSignupClick}>
            <p className="relative mr-4 sm:mr-6 mb-4 sm:mb-5 text-xl sm:text-2xl opacity-60 hover:opacity-100 text-black after:content-[''] after:absolute after:left-1/2 after:bottom-0 after:h-[2px] after:w-0 after:bg-[#a9ba5c] after:transition-all after:duration-300 hover:after:left-0 hover:after:w-full">
              註冊
            </p>
          </Link>
        </div>

        <div className="mb-4">
          <label
            htmlFor="email"
            className="block text-[#444444] text-base sm:text-lg font-medium mb-2"
          >
            電子信箱
          </label>
          <input
            type="text"
            id="email"
            className="border-b w-full py-2 px-3 text-[#333333] leading-tight focus:outline-none focus:border-[#a9ba5c] transition-colors"
            value={email}
            onChange={(e) => setEmail(e.target.value)}
            onKeyPress={handleKeyPress}
            disabled={isLoading}
            placeholder="請輸入您的電子信箱"
          />
        </div>

        <div className="mb-4 sm:mb-6 relative">
          <label
            htmlFor="password"
            className="block text-[#444444] text-base sm:text-lg font-medium mb-2"
          >
            密碼
          </label>
          <div className="relative">
            <input
              type={showPassword ? "text" : "password"}
              id="password"
              className="border-b w-full py-2 px-3 pr-10 text-[#333333] leading-tight focus:outline-none focus:border-[#a9ba5c] transition-colors"
              value={password}
              onChange={(e) => setPassword(e.target.value)}
              onKeyPress={handleKeyPress}
              disabled={isLoading}
              placeholder="請輸入您的密碼"
            />
            <button
              type="button"
              onClick={() => setShowPassword(!showPassword)}
              className="absolute right-2 top-1/2 transform -translate-y-1/2 text-gray-500 hover:text-gray-700 transition-colors"
              disabled={isLoading}
            >
              {showPassword ? (
                <Image src="/eyes.png" alt="隱藏密碼" width={12} height={12} />
              ) : (
                <PiEyesFill />
              )}
            </button>
          </div>
        </div>

        <div className="flex items-center justify-end mb-4">
          <button
            onClick={() => setShowForgotPassword(true)}
            className="inline-block align-baseline font-medium text-base sm:text-lg text-[#555555] hover:text-[#a9ba5c] transition-colors"
            disabled={isLoading}
          >
            忘記密碼？
          </button>
        </div>

        <div className="flex justify-center gap-4 w-full">
          <Button
            variant="outline"
            className="w-full sm:w-70 h-10 mt-5 rounded-[60px]"
            onClick={handleGoogleLogin}
            disabled={isGoogleLoading || isLoading}
          >
            {isGoogleLoading ? (
              <div className="w-5 h-5 border-2 border-gray-300 border-t-blue-600 rounded-full animate-spin"></div>
            ) : (
              <Image
                src="/Google.svg"
                alt="Google Icon"
                width={20}
                height={20}
              />
            )}
          </Button>
        </div>

        <div className="w-full flex justify-center mt-3">
          <Button
            className="w-full sm:w-70 h-12 mt-4 transition-all duration-200 hover:opacity-90 disabled:opacity-50"
            type="button"
            onClick={handleLogin}
            rounded="login"
            disabled={isLoading || isGoogleLoading}
          >
            {isLoading ? (
              <div className="flex items-center justify-center">
                <div className="w-5 h-5 border-2 border-white border-t-transparent rounded-full animate-spin mr-2"></div>
                登入中...
              </div>
            ) : (
              "會員登入"
            )}
          </Button>
        </div>
      </div>
    </div>
  );
}

export default LoginModal;
