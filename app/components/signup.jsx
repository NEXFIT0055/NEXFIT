import React, { useState } from "react";
import { Button } from "./ui/button";
import { DatePickerDemo } from "@/app/components/ui/datepicker";
import { toast } from "sonner";
import { PiEyesFill } from "react-icons/pi";
import Image from "next/image";
import { useAuth } from "@/app/contexts/AuthContext";

function SignupModal({ isOpen, onClose, setShowLogin }) {
  const { login } = useAuth();

  const [isFlipping, setIsFlipping] = useState(false);
  const [isClosing, setIsClosing] = useState(false);
  const [email, setEmail] = useState("");
  const [Name, setName] = useState("");
  const [phone, setPhone] = useState("");
  const [password, setPassword] = useState("");
  const [confirmPassword, setConfirmPassword] = useState("");
  const [birthdate, setBirthdate] = useState(null);
  const [showPassword, setShowPassword] = useState(false);
  const [showConfirmPassword, setShowConfirmPassword] = useState(false);
  const [isRegistering, setIsRegistering] = useState(false);

  const formatPhoneNumber = (value) => {
    let numbers = value.replace(/\D/g, "");
    if (!numbers) return "";
    if (!numbers.startsWith("09")) {
      if (numbers.startsWith("9")) {
        numbers = "0" + numbers;
      } else if (!numbers.startsWith("0")) {
        numbers = "09" + numbers;
      }
    }
    const trimmed = numbers.slice(0, 10);
    if (trimmed.length >= 4) {
      let formatted = trimmed.slice(0, 4);
      if (trimmed.length >= 7) {
        formatted += "-" + trimmed.slice(4, 7);
        if (trimmed.length >= 8) {
          formatted += "-" + trimmed.slice(7);
        }
      } else if (trimmed.length > 4) {
        formatted += "-" + trimmed.slice(4);
      }
      return formatted;
    }
    return trimmed;
  };

  const handlePhoneChange = (e) => {
    const inputValue = e.target.value;
    if (inputValue.length < phone.length && phone.length > 2) {
      setPhone(inputValue);
      return;
    }
    const formattedPhone = formatPhoneNumber(inputValue);
    setPhone(formattedPhone);
  };

  const handleSignup = async () => {
    if (isRegistering) return;

    if (
      !email ||
      !Name ||
      !phone ||
      !password ||
      !confirmPassword ||
      !birthdate
    ) {
      toast.error("請填寫所有必填欄位");
      return;
    }

    if (!email.includes("@")) {
      toast.error("請輸入有效的電子信箱");
      return;
    }

    const passwordRegex = /^(?=.*[a-z])(?=.*[A-Z])(?=.*\d).{6,}$/;
    if (!passwordRegex.test(password)) {
      toast.error(
        "密碼必須包含至少一個大寫字母、一個小寫字母和一個數字，且長度至少為6位"
      );
      return;
    }

    if (password !== confirmPassword) {
      toast.error("兩次輸入的密碼不一致");
      return;
    }

    setIsRegistering(true);

    try {
      console.log("🔄 開始註冊流程...");
      const response = await fetch("/api/signup", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          email,
          password,
          name: Name,
          phone: phone.replace(/-/g, ""),
          birthdate,
        }),
      });

      const data = await response.json();
      console.log("註冊 API 回應:", data);

      if (response.ok) {
        console.log("註冊成功，開始自動登入...");
        if (data.token && data.user) {
          localStorage.setItem("token", data.token);
          try {
            const loginResult = await login({
              email: email,
              password: password,
            });
            if (loginResult.success) {
              console.log("自動登入成功");
              toast.success("註冊成功！歡迎加入 NEXFIT！");
              onClose();
            } else {
              console.warn("自動登入失敗，但註冊成功:", loginResult.error);
              toast.success("註冊成功！請重新登入");
              onClose();
            }
          } catch (loginError) {
            console.error("❌ 自動登入過程發生錯誤:", loginError);
            toast.success("註冊成功！請重新登入");
            onClose();
          }
        } else {
          console.log("註冊回應缺少資料，使用手動登入");
          try {
            const loginResult = await login({
              email: email,
              password: password,
            });
            if (loginResult.success) {
              console.log("手動登入成功");
              toast.success("註冊成功！歡迎加入 NEXFIT！");
              onClose();
            } else {
              console.warn("手動登入失敗:", loginResult.error);
              toast.success("註冊成功！請重新登入");
              onClose();
            }
          } catch (loginError) {
            console.error("❌ 手動登入過程發生錯誤:", loginError);
            toast.success("註冊成功！請重新登入");
            onClose();
          }
        }
      } else {
        console.error("❌ 註冊失敗:", data);
        toast.error(data.message || "註冊失敗");
      }
    } catch (error) {
      console.error("❌ 註冊錯誤:", error);
      toast.error("註冊過程中發生錯誤");
    } finally {
      setIsRegistering(false);
    }
  };

  const handleLoginClick = () => {
    setIsFlipping(true);
    setTimeout(() => {
      setShowLogin(true);
      setIsFlipping(false);
    }, 300);
  };

  const handleClose = () => {
    setIsClosing(true);
    setTimeout(() => {
      onClose();
      setIsClosing(false);
    }, 300);
  };

  if (!isOpen) return null;

  return (
    <div className="fixed inset-0 z-50 bg-black/60 flex items-center justify-center p-4">
      <div
        className={`bg-white rounded-lg shadow-xl p-4 sm:p-8 w-full max-w-md relative overflow-y-auto max-h-[90vh]
          ${isFlipping ? "animate-flip-out" : "animate-flip-in"}
          ${isClosing ? "animate-fade-out" : ""}`}
        style={{ perspective: "1000px", transformOrigin: "center center" }}
      >
        {/* 修正：關閉按鈕 */}
        <div
          onClick={handleClose}
          className="absolute top-2 right-3 sm:top-3 sm:right-5 text-gray-500 text-2xl bg-transparent border-none cursor-pointer hover:text-gray-700 select-none"
          role="button"
          tabIndex={0}
          onKeyDown={(e) => {
            if (e.key === "Enter" || e.key === " ") {
              e.preventDefault();
              handleClose();
            }
          }}
          style={{
            pointerEvents: isRegistering ? "none" : "auto",
            opacity: isRegistering ? 0.5 : 1,
          }}
        >
          ×
        </div>

        <h2 className="text-3xl sm:text-4xl font-bold my-3 sm:my-5 text-center text-gray-800">
          加入 NEXFIT
        </h2>

        {/* 修正：導航連結 - 移除 Link，改用 div */}
        <div className="flex justify-center">
          <div
            onClick={handleLoginClick}
            className="relative mr-4 sm:mr-6 mb-6 sm:mb-10 text-xl sm:text-2xl opacity-60 hover:opacity-100 text-black cursor-pointer after:content-[''] after:absolute after:left-1/2 after:bottom-0 after:h-[2px] after:w-0 after:bg-[#a9ba5c] after:transition-all after:duration-300 hover:after:left-0 hover:after:w-full"
            role="button"
            tabIndex={0}
            onKeyDown={(e) => {
              if (e.key === "Enter" || e.key === " ") {
                e.preventDefault();
                handleLoginClick();
              }
            }}
          >
            登入
          </div>
          <div className="relative mr-4 sm:mr-6 mb-4 sm:mb-5 text-xl sm:text-2xl opacity-100 text-black after:content-[''] after:absolute after:left-0 after:bottom-5 after:h-[2px] after:w-full after:bg-[#a9ba5c]">
            註冊
          </div>
        </div>

        {/* 表單欄位 */}
        <div className="mb-4">
          <label
            htmlFor="email"
            className="block text-gray-700 text-lg font-medium mb-2"
          >
            電子信箱
          </label>
          <input
            type="email"
            id="email"
            placeholder="請輸入您的電子信箱"
            className="border-b w-full py-2 px-3 text-gray-800 leading-tight focus:outline-none"
            value={email}
            onChange={(e) => setEmail(e.target.value)}
            disabled={isRegistering}
          />
        </div>

        <div className="mb-6">
          <label
            htmlFor="Name"
            className="block text-gray-700 text-lg font-medium mb-2"
          >
            您的姓名
          </label>
          <input
            type="text"
            id="Name"
            placeholder="請輸入您的姓名"
            className="border-b w-full py-2 px-3 text-gray-800 leading-tight focus:outline-none"
            value={Name}
            onChange={(e) => setName(e.target.value)}
            disabled={isRegistering}
          />
        </div>

        <div className="mb-6">
          <label
            htmlFor="phone"
            className="block text-gray-700 text-lg font-medium mb-2"
          >
            您的電話
          </label>
          <input
            type="tel"
            id="phone"
            placeholder="請輸入手機號碼 (09XX-XXX-XXX)"
            className="border-b w-full py-2 px-3 text-gray-800 leading-tight focus:outline-none"
            value={phone}
            onChange={handlePhoneChange}
            pattern="[0-9]*"
            inputMode="numeric"
            maxLength={12}
            disabled={isRegistering}
          />
        </div>

        {/* 密碼欄位 */}
        <div className="mb-6">
          <div className="mb-6">
            <label
              htmlFor="password"
              className="block text-gray-700 text-lg font-medium mb-2"
            >
              密碼
            </label>
            <div className="relative">
              <input
                type={showPassword ? "text" : "password"}
                id="password"
                placeholder="請輸入您的密碼"
                className="border-b w-full py-2 px-3 text-gray-800 leading-tight focus:outline-none"
                value={password}
                onChange={(e) => setPassword(e.target.value)}
                disabled={isRegistering}
              />
              {/* 修正：眼睛圖示按鈕 */}
              <div
                onClick={() => !isRegistering && setShowPassword(!showPassword)}
                className="absolute right-2 top-1/2 transform -translate-y-1/2 text-gray-500 hover:text-gray-700 cursor-pointer select-none p-1"
                role="button"
                tabIndex={0}
                onKeyDown={(e) => {
                  if ((e.key === "Enter" || e.key === " ") && !isRegistering) {
                    e.preventDefault();
                    setShowPassword(!showPassword);
                  }
                }}
                style={{
                  pointerEvents: isRegistering ? "none" : "auto",
                  opacity: isRegistering ? 0.5 : 1,
                }}
              >
                {showPassword ? (
                  <Image
                    src="/eyes.png"
                    alt="隱藏密碼"
                    width={12}
                    height={12}
                  />
                ) : (
                  <PiEyesFill />
                )}
              </div>
            </div>
            <p className="text-[10px] text-gray-500 mt-1">
              密碼必須包含至少一個大寫字母、一個小寫字母和一個數字，且長度至少為6位
            </p>
          </div>
        </div>

        <div className="mb-6">
          <label
            htmlFor="confirmPassword"
            className="block text-gray-700 text-lg font-medium mb-2"
          >
            再次填寫密碼
          </label>
          <div className="relative">
            <input
              type={showConfirmPassword ? "text" : "password"}
              id="confirmPassword"
              placeholder="請再次輸入密碼"
              className="border-b w-full py-2 px-3 text-gray-800 leading-tight focus:outline-none"
              value={confirmPassword}
              onChange={(e) => setConfirmPassword(e.target.value)}
              disabled={isRegistering}
            />
            {/* 修正：眼睛圖示按鈕 */}
            <div
              onClick={() =>
                !isRegistering && setShowConfirmPassword(!showConfirmPassword)
              }
              className="absolute right-2 top-1/2 transform -translate-y-1/2 text-gray-500 hover:text-gray-700 cursor-pointer select-none p-1"
              role="button"
              tabIndex={0}
              onKeyDown={(e) => {
                if ((e.key === "Enter" || e.key === " ") && !isRegistering) {
                  e.preventDefault();
                  setShowConfirmPassword(!showConfirmPassword);
                }
              }}
              style={{
                pointerEvents: isRegistering ? "none" : "auto",
                opacity: isRegistering ? 0.5 : 1,
              }}
            >
              {showConfirmPassword ? (
                <Image src="/eyes.png" alt="隱藏密碼" width={12} height={12} />
              ) : (
                <PiEyesFill />
              )}
            </div>
          </div>
        </div>

        {/* 生日選擇 */}
        <div className="flex flex-col justify-center mb-6">
          <label
            htmlFor="birthdate"
            className="block text-gray-700 text-lg font-medium mb-2"
          >
            請選擇您的生日
          </label>
          <DatePickerDemo
            value={birthdate}
            onChange={setBirthdate}
            disabled={isRegistering}
          />
        </div>

        {/* 註冊按鈕 */}
        <div className="w-full flex justify-center mt-3">
          <Button
            className="w-64 h-12 mt-4 font-bold py-2 px-4 rounded-md"
            variant="default"
            type="button"
            onClick={handleSignup}
            disabled={isRegistering}
          >
            {isRegistering ? (
              <div className="flex items-center justify-center">
                <div className="w-4 h-4 border-2 border-white border-t-transparent rounded-full animate-spin mr-2"></div>
                註冊中...
              </div>
            ) : (
              "註冊會員"
            )}
          </Button>
        </div>
      </div>
    </div>
  );
}

export default SignupModal;
