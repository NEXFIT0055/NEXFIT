import React, { useState } from "react";
import { Button } from "./ui/button";

function ForgotPasswordModal({ isOpen, onClose }) {
  const [email, setEmail] = useState("");
  const [step, setStep] = useState(1);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState("");

  const handleSubmit = async (e) => {
    e.preventDefault();

    setError("");
    setLoading(true);

    try {
      // 調用你的 API 發送重置郵件
      const response = await fetch("/api/forgot-password", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify({ email }),
      });

      const data = await response.json();

      if (response.ok) {
        // 成功後跳到第二步
        setStep(2);
      } else {
        // 處理錯誤
        setError(data.message || "發送失敗，請稍後再試");
      }
    } catch (error) {
      setError("網路錯誤，請檢查網路連線");
      console.error("Forgot password error:", error);
    }

    setLoading(false);
  };

  const resetModal = () => {
    setStep(1);
    setEmail("");
    setError("");
    setLoading(false);
    onClose();
  };

  if (!isOpen) return null;

  return (
    <div className="fixed inset-0 z-50 bg-black/60 flex items-center justify-center">
      <div className="bg-white rounded-lg shadow-xl p-8 w-full max-w-md relative">
        <button
          onClick={resetModal}
          className="absolute top-3 right-5 text-gray-500 text-2xl bg-transparent border-none cursor-pointer hover:text-gray-700"
        >
          ×
        </button>

        {step === 1 ? (
          // 第一步：輸入 email
          <>
            <h2 className="text-3xl font-bold mb-6 text-center">重置密碼</h2>

            <form onSubmit={handleSubmit}>
              <div className="mb-6">
                <label
                  htmlFor="email"
                  className="block text-gray-700 text-lg font-medium mb-2"
                >
                  請輸入您的電子信箱
                </label>
                <input
                  type="email"
                  id="email"
                  placeholder="example@email.com"
                  className="border-b w-full py-2 px-3 text-gray-800 leading-tight focus:outline-none focus:border-[#a9ba5c]"
                  value={email}
                  onChange={(e) => setEmail(e.target.value)}
                  required
                  disabled={loading}
                />
              </div>

              {/* 錯誤訊息顯示 */}
              {error && (
                <div className="mb-4 text-red-500 text-sm text-center">
                  {error}
                </div>
              )}

              <div className="w-full flex justify-center">
                <Button
                  type="submit"
                  className="w-64 h-12 bg-[#a9ba5c] hover:bg-[#98a752] text-white font-bold py-2 px-4 rounded-md disabled:opacity-50 disabled:cursor-not-allowed"
                  disabled={loading}
                >
                  {loading ? "發送中..." : "發送重置密碼連結"}
                </Button>
              </div>
            </form>
          </>
        ) : (
          // 第二步：成功訊息
          <>
            <div className="text-center">
              <div className="text-6xl mb-4">✔️</div>
              <h2 className="text-2xl font-bold mb-4 text-gray-800">
                郵件已發送！
              </h2>
              <p className="text-gray-600 mb-6 leading-relaxed">
                我們已將重置密碼連結發送至
                <br />
                <span className="font-semibold text-gray-800">{email}</span>
                <br />
                請檢查您的信箱並點擊連結來重置密碼。
              </p>
              <p className="text-sm text-gray-500 mb-6">
                如果您沒有收到郵件，請檢查垃圾郵件資料夾
              </p>

              <div className="space-y-3">
                <Button
                  onClick={resetModal}
                  className="w-full bg-[#a9ba5c] hover:bg-[#98a752] text-white font-bold py-2 px-4 rounded-md"
                >
                  完成
                </Button>
                <button
                  onClick={() => {
                    setStep(1);
                    setError("");
                  }}
                  className="w-full text-[#a9ba5c] hover:text-[#98a752] font-medium py-2 underline"
                >
                  重新發送郵件
                </button>
              </div>
            </div>
          </>
        )}
      </div>
    </div>
  );
}

export default ForgotPasswordModal;
