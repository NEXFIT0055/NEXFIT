"use client";
import { useState, useEffect, Suspense } from "react";
import { useSearchParams, useRouter } from "next/navigation";
import { PiEyesFill } from "react-icons/pi";
import Image from "next/image";

// 分離 useSearchParams 邏輯的組件
function ResetPasswordWithParams() {
  const [newPassword, setNewPassword] = useState("");
  const [confirmPassword, setConfirmPassword] = useState("");
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState("");
  const [success, setSuccess] = useState(false);
  const [tokenValid, setTokenValid] = useState(null);

  // 密碼顯示/隱藏狀態
  const [showNewPassword, setShowNewPassword] = useState(false);
  const [showConfirmPassword, setShowConfirmPassword] = useState(false);

  // 新增：密碼驗證狀態
  const [passwordValidation, setPasswordValidation] = useState({
    length: false,
    uppercase: false,
    lowercase: false,
    number: false,
  });

  const router = useRouter();
  const searchParams = useSearchParams();
  const token = searchParams.get("token");

  // 密碼驗證函數
  const validatePassword = (password) => {
    const validation = {
      length: password.length >= 6,
      uppercase: /[A-Z]/.test(password),
      lowercase: /[a-z]/.test(password),
      number: /\d/.test(password),
    };

    setPasswordValidation(validation);
    return Object.values(validation).every(Boolean);
  };

  // 監聽密碼變化，即時驗證
  useEffect(() => {
    if (newPassword) {
      validatePassword(newPassword);
    } else {
      setPasswordValidation({
        length: false,
        uppercase: false,
        lowercase: false,
        number: false,
      });
    }
  }, [newPassword]);

  // 頁面載入時驗證 token
  useEffect(() => {
    if (!token) {
      setError("缺少重置代碼");
      setTokenValid(false);
      return;
    }

    const verifyToken = async () => {
      try {
        const response = await fetch("/api/verify-reset-token", {
          method: "POST",
          headers: {
            "Content-Type": "application/json",
          },
          body: JSON.stringify({ token }),
        });

        const data = await response.json();

        if (response.ok) {
          setTokenValid(true);
        } else {
          setError(data.message || "重置連結無效或已過期");
          setTokenValid(false);
        }
      } catch (error) {
        setError("驗證失敗，請稍後再試");
        setTokenValid(false);
      }
    };

    verifyToken();
  }, [token]);

  const handleResetPassword = async (e) => {
    e.preventDefault();

    if (!token) {
      setError("無效的重置連結");
      return;
    }

    // 驗證密碼強度
    if (!validatePassword(newPassword)) {
      setError("密碼不符合安全要求，請檢查下方的密碼規則");
      return;
    }

    if (newPassword !== confirmPassword) {
      setError("密碼確認不一致");
      return;
    }

    setLoading(true);
    setError("");

    try {
      const response = await fetch("/api/reset-password", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify({
          token,
          newPassword,
        }),
      });

      const data = await response.json();

      if (response.ok) {
        setSuccess(true);
        setTimeout(() => {
          router.push("/");
        }, 3000);
      } else {
        setError(data.message || "密碼重置失敗");
      }
    } catch (error) {
      setError("網路錯誤，請稍後再試");
      console.error("Reset password error:", error);
    }

    setLoading(false);
  };

  // 載入中狀態
  if (tokenValid === null) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-gray-50">
        <div className="max-w-md w-full bg-white p-8 rounded-lg shadow-md text-center">
          <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-blue-500 mx-auto mb-4"></div>
          <p className="text-gray-600">驗證重置連結中...</p>
        </div>
      </div>
    );
  }

  // Token 無效
  if (tokenValid === false) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-gray-50">
        <div className="max-w-md w-full bg-white p-8 rounded-lg shadow-md text-center">
          <div className="text-red-500 text-6xl mb-4">❌</div>
          <h2 className="text-2xl font-bold mb-4 text-red-600">連結無效</h2>
          <p className="text-gray-600 mb-6">{error}</p>
          <div className="space-y-3">
            <button
              onClick={() => router.push("/forgot-password")}
              className="w-full bg-blue-500 hover:bg-blue-600 text-white font-bold py-2 px-4 rounded-md"
            >
              重新申請重置密碼
            </button>
            <button
              onClick={() => router.push("/")}
              className="w-full text-blue-500 hover:text-blue-600 font-medium py-2"
            >
              返回登入頁面
            </button>
          </div>
        </div>
      </div>
    );
  }

  // 成功頁面
  if (success) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-gray-50">
        <div className="max-w-md w-full bg-white p-8 rounded-lg shadow-md text-center">
          <div className="text-green-500 text-6xl mb-4">✔️</div>
          <h2 className="text-2xl font-bold mb-4 text-green-600">
            密碼重置成功！
          </h2>
          <p className="text-gray-600 mb-6">
            您的密碼已成功更新，3 秒後將自動跳轉至登入頁面。
          </p>
          <button
            onClick={() => router.push("/")}
            className="w-full bg-green-500 hover:bg-green-600 text-white font-bold py-2 px-4 rounded-md"
          >
            立即前往登入
          </button>
        </div>
      </div>
    );
  }

  // 重置密碼表單
  return (
    <div className="min-h-screen flex items-center justify-center bg-gray-50">
      <div className="max-w-md w-full bg-white p-8 rounded-lg shadow-md">
        <div className="text-center mb-6">
          <h2 className="text-3xl font-bold text-gray-900">🔐 設定新密碼</h2>
          <p className="mt-2 text-gray-600">請輸入您的新密碼</p>
        </div>

        <form onSubmit={handleResetPassword} className="space-y-6">
          {/* 新密碼輸入框 */}
          <div>
            <label className="block text-gray-700 text-sm font-bold mb-2">
              新密碼
            </label>
            <div className="relative">
              <input
                type={showNewPassword ? "text" : "password"}
                value={newPassword}
                onChange={(e) => setNewPassword(e.target.value)}
                className={`w-full px-3 py-2 pr-10 border rounded-lg focus:outline-none focus:ring-1 ${
                  newPassword &&
                  !Object.values(passwordValidation).every(Boolean)
                    ? "border-red-300 focus:border-red-500 focus:ring-red-500"
                    : "border-gray-300 focus:border-blue-500 focus:ring-blue-500"
                }`}
                placeholder="請填寫新的密碼"
                required
                disabled={loading}
              />
              <button
                type="button"
                className="absolute inset-y-0 right-0 pr-3 flex items-center text-gray-400 hover:text-gray-600"
                onClick={() => setShowNewPassword(!showNewPassword)}
              >
                {showNewPassword ? (
                  <Image
                    src="/eyes.png"
                    alt="隱藏密碼"
                    width={12}
                    height={12}
                  />
                ) : (
                  <PiEyesFill />
                )}
              </button>
            </div>

            {/* 密碼強度指示器 */}
            <div className="mt-2 space-y-1">
              <div className="text-sm font-medium text-gray-700">
                密碼必須包含：
              </div>
              <div className="space-y-1">
                <div
                  className={`flex items-center text-sm ${
                    passwordValidation.length
                      ? "text-green-600"
                      : "text-gray-400"
                  }`}
                >
                  <span className="mr-2">
                    {passwordValidation.length ? "✔️" : "◯"}
                  </span>
                  至少 6 個字符
                </div>
                <div
                  className={`flex items-center text-sm ${
                    passwordValidation.uppercase
                      ? "text-green-600"
                      : "text-gray-400"
                  }`}
                >
                  <span className="mr-2">
                    {passwordValidation.uppercase ? "✔️" : "◯"}
                  </span>
                  至少一個大寫字母 (A-Z)
                </div>
                <div
                  className={`flex items-center text-sm ${
                    passwordValidation.lowercase
                      ? "text-green-600"
                      : "text-gray-400"
                  }`}
                >
                  <span className="mr-2">
                    {passwordValidation.lowercase ? "✔️" : "◯"}
                  </span>
                  至少一個小寫字母 (a-z)
                </div>
                <div
                  className={`flex items-center text-sm ${
                    passwordValidation.number
                      ? "text-green-600"
                      : "text-gray-400"
                  }`}
                >
                  <span className="mr-2">
                    {passwordValidation.number ? "✔️" : "◯"}
                  </span>
                  至少一個數字 (0-9)
                </div>
              </div>
            </div>
          </div>

          {/* 確認密碼輸入框 */}
          <div>
            <label className="block text-gray-700 text-sm font-bold mb-2">
              確認新密碼
            </label>
            <div className="relative">
              <input
                type={showConfirmPassword ? "text" : "password"}
                value={confirmPassword}
                onChange={(e) => setConfirmPassword(e.target.value)}
                className={`w-full px-3 py-2 pr-10 border rounded-lg focus:outline-none focus:ring-1 ${
                  confirmPassword && newPassword !== confirmPassword
                    ? "border-red-300 focus:border-red-500 focus:ring-red-500"
                    : "border-gray-300 focus:border-blue-500 focus:ring-blue-500"
                }`}
                placeholder="再次輸入新密碼"
                required
                disabled={loading}
              />
              <button
                type="button"
                className="absolute inset-y-0 right-0 pr-3 flex items-center text-gray-400 hover:text-gray-600"
                onClick={() => setShowConfirmPassword(!showConfirmPassword)}
              >
                {showConfirmPassword ? (
                  <Image
                    src="/eyes.png"
                    alt="隱藏密碼"
                    width={12}
                    height={12}
                  />
                ) : (
                  <PiEyesFill />
                )}
              </button>
            </div>
            {/* 密碼確認指示器 */}
            {confirmPassword && (
              <div
                className={`mt-1 text-sm ${
                  newPassword === confirmPassword
                    ? "text-green-600"
                    : "text-red-600"
                }`}
              >
                {newPassword === confirmPassword
                  ? "✔️ 密碼確認一致"
                  : "✖️ 密碼確認不一致"}
              </div>
            )}
          </div>

          {error && (
            <div className="bg-red-50 border border-red-200 text-red-700 px-4 py-3 rounded-md text-sm">
              {error}
            </div>
          )}

          <button
            type="submit"
            disabled={
              loading ||
              !Object.values(passwordValidation).every(Boolean) ||
              newPassword !== confirmPassword
            }
            className="w-full bg-blue-500 hover:bg-blue-600 text-white font-bold py-2 px-4 rounded-lg disabled:opacity-50 disabled:cursor-not-allowed flex items-center justify-center"
          >
            {loading ? (
              <>
                <div className="animate-spin rounded-full h-4 w-4 border-b-2 border-white mr-2"></div>
                更新中...
              </>
            ) : (
              "更新密碼"
            )}
          </button>
        </form>

        <div className="mt-6 text-center">
          <button
            onClick={() => router.push("/")}
            className="text-gray-500 hover:text-gray-700 text-sm"
          >
            返回登入頁面
          </button>
        </div>
      </div>
    </div>
  );
}

export default function ResetPasswordPage() {
  return (
    <Suspense
      fallback={
        <div className="min-h-screen flex items-center justify-center bg-gray-50">
          <div className="max-w-md w-full bg-white p-8 rounded-lg shadow-md text-center">
            <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-blue-500 mx-auto mb-4"></div>
            <p className="text-gray-600">載入中...</p>
          </div>
        </div>
      }
    >
      <ResetPasswordWithParams />
    </Suspense>
  );
}
