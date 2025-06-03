"use client";

import { useEffect, useRef, useState } from "react";
import confetti from "canvas-confetti";
import Modal from "./Modal";
import { useRouter } from "next/navigation";
import { useAuth } from "@/app/contexts/AuthContext";

export default function ScoreBar({ score, max }) {
  const [displayScore, setDisplayScore] = useState(0);
  const [lastRedeemedCount, setLastRedeemedCount] = useState(0);
  const [couponData, setCouponData] = useState(null);
  const [showRewardModal, setShowRewardModal] = useState(false);
  const [showNavigateModal, setShowNavigateModal] = useState(false);
  const [userId, setUserId] = useState(null);
  const [loading, setLoading] = useState(true);
  const bubbleContainerRef = useRef(null);
  const router = useRouter();

  const { token } = useAuth();

  // 🔄 使用 API 獲取 userId
  useEffect(() => {
    const fetchUserId = async () => {
      if (!token) {
        setLoading(false);
        console.warn("⚠️ 沒有 token，無法獲取用戶資訊");
        return;
      }

      try {
        const response = await fetch("/api/verify-user", {
          method: "POST",
          headers: {
            Authorization: `Bearer ${token}`,
            "Content-Type": "application/json",
          },
        });

        const result = await response.json();

        if (result.success) {
          setUserId(result.userId);
          console.log("✅ 成功獲取 userId:", result.userId);
        } else {
          console.error("❌ 獲取用戶資訊失敗:", result.message);
        }
      } catch (error) {
        console.error("❌ API 調用錯誤:", error);
      } finally {
        setLoading(false);
      }
    };

    fetchUserId();
  }, [token]);

  const redeemedCount = Math.floor(score / max);
  const remainingScore = score % max;
  const progressPercent = Math.round((remainingScore / max) * 100);

  // ✅ 積分數值平滑遞增動畫
  useEffect(() => {
    let start = null;
    const duration = 800;
    const initial = displayScore;
    const target = remainingScore;

    const animate = (timestamp) => {
      if (!start) start = timestamp;
      const progress = Math.min((timestamp - start) / duration, 1);
      setDisplayScore(Math.floor(initial + (target - initial) * progress));
      if (progress < 1) requestAnimationFrame(animate);
    };

    requestAnimationFrame(animate);
  }, [remainingScore]);

  // 🔄 使用你提供的 API 獲取最新優惠券
  const fetchLatestCoupon = async (targetUserId) => {
    try {
      const response = await fetch("/api/user-latest-coupon", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
          Authorization: `Bearer ${token}`,
        },
        body: JSON.stringify({ userId: targetUserId }),
      });

      if (response.ok) {
        const couponInfo = await response.json();
        setCouponData(couponInfo);
        if (typeof window !== "undefined") {
          localStorage.setItem("latestCouponCode", couponInfo.code);
        }
        setShowRewardModal(true);

        // 顯示「前往查看」提示彈窗
        setTimeout(() => {
          setShowNavigateModal(true);
        }, 1000);
      } else {
        const errorData = await response.json();
        console.error("獲取優惠券錯誤:", errorData.error);
      }
    } catch (error) {
      console.error("優惠券 API 調用失敗:", error);
    }
  };

  // ✅ 滿分觸發 confetti + 發送 POST + 顯示優惠券彈窗
  useEffect(() => {
    if (redeemedCount > lastRedeemedCount && userId && !loading) {
      setLastRedeemedCount(redeemedCount);

      // Confetti 動畫
      confetti({
        particleCount: 150,
        spread: 120,
        angle: 90,
        origin: { y: 0.6 },
      });
      const animationEnd = Date.now() + 400;
      const interval = setInterval(() => {
        confetti({
          particleCount: 300,
          spread: 450,
          startVelocity: 30,
          ticks: 300,
          origin: { x: Math.random(), y: Math.random() - 0.2 },
        });
        if (Date.now() > animationEnd) clearInterval(interval);
      }, 200);

      console.log("🎯 使用的 userId:", userId);

      // 發送 POST 要求領取優惠券
      fetch(`/api/user-discounts/${userId}/add`, {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
          Authorization: `Bearer ${token}`,
        },
        body: JSON.stringify({
          discount_id: 1,
          expires_at: "2025-12-31",
        }),
      })
        .then((res) => res.json())
        .then((data) => {
          if (data?.error) {
            console.error("優惠券錯誤:", data.error);
            return;
          }

          // 🔄 領取成功後，使用你的 API 獲取最新優惠券資訊
          fetchLatestCoupon(userId);
        })
        .catch((err) => console.error("優惠券獲取失敗:", err));
    }
  }, [redeemedCount, lastRedeemedCount, userId, token, loading]);

  // ✅ 泡泡動畫效果
  useEffect(() => {
    const container = bubbleContainerRef.current;
    if (!container) return;

    const interval = setInterval(() => {
      const bubble = document.createElement("div");
      const size = Math.random() * 10 + 4;
      bubble.className =
        "absolute bg-white rounded-full opacity-40 animate-bubble";
      bubble.style.width = `${size}px`;
      bubble.style.height = `${size}px`;
      bubble.style.left = `${Math.random() * 100}%`;
      container.appendChild(bubble);
      setTimeout(() => bubble.remove(), 3000);
    }, 300);

    return () => clearInterval(interval);
  }, []);

  // Debug 資訊
  useEffect(() => {
    if (process.env.NODE_ENV === "development") {
      console.log("🔍 ScoreBar Debug Info:");
      console.log("  - Token exists:", !!token);
      console.log("  - UserId:", userId);
      console.log("  - Loading:", loading);
    }
  }, [userId, token, loading]);

  // 如果還在加載中，顯示載入狀態
  if (loading) {
    return (
      <div className="relative overflow-hidden rounded-xl shimmer-box p-4 shadow-md">
        <div className="animate-pulse">
          <div className="h-4 bg-gray-300 rounded mb-2"></div>
          <div className="h-6 bg-gray-300 rounded mb-2"></div>
          <div className="h-4 bg-gray-300 rounded w-1/2"></div>
        </div>
      </div>
    );
  }

  return (
    <div className="relative overflow-hidden rounded-xl shimmer-box p-4 shadow-md">
      <h2 className="font-bold mb-2">我的積分進度</h2>

      {/* Debug 資訊（開發環境才顯示）
      {process.env.NODE_ENV === "development" && (
        <div className="text-xs text-gray-500 mb-2">
          User ID: {userId || "N/A"} | Token: {token ? "✅" : "❌"}
        </div>
      )} */}

      <div
        ref={bubbleContainerRef}
        className="absolute top-0 left-0 w-full h-full pointer-events-none z-0"
      />

      {/* ✅ 進度條 */}
      <div className="relative w-full h-6 bg-gray-200 rounded-full overflow-hidden z-10 shimmer-wrapper">
        <div
          className="h-full rounded-full shimmer-bar transition-all duration-1000 ease-in-out"
          style={{ width: `${progressPercent}%` }}
        />
        <div className="absolute inset-0 pointer-events-none z-20">
          <div className="w-full h-full relative overflow-hidden">
            {[...Array(20)].map((_, i) => (
              <div
                key={i}
                className="absolute w-1.5 h-1.5 bg-white rounded-full opacity-60 animate-sparkle"
                style={{
                  top: `${Math.random() * 100}%`,
                  left: `${Math.random() * 100}%`,
                  animationDelay: `${i * 0.2}s`,
                }}
              />
            ))}
          </div>
        </div>
      </div>

      <div className="mt-2 flex justify-end items-center text-sm text-gray-700 z-10 relative">
        <span>
          {remainingScore} / {max} 分
        </span>
      </div>

      {/* ✅ 優惠券詳細彈窗 */}
      {couponData && showRewardModal && (
        <Modal
          isOpen={showRewardModal}
          onClose={() => setShowRewardModal(false)}
        >
          <h2 className="text-xl font-bold mb-4">🎉 恭喜你獲得一張優惠券</h2>
          <div className="space-y-2 text-left text-sm">
            <p>
              <strong>代碼：</strong>#{couponData.code}
            </p>
            <p>
              <strong>面額：</strong>${couponData.value}
            </p>
            <p>
              <strong>使用期限：</strong>
              {couponData.expiredAt}
            </p>
            <p>
              <strong>使用狀況：</strong>
              {couponData.status}
            </p>
            <p>
              <strong>備註：</strong>
              {couponData.name}
            </p>
          </div>
        </Modal>
      )}

      {/* ✅ 導引前往查看彈窗 */}
      {showNavigateModal && (
        <Modal
          isOpen={showNavigateModal}
          onClose={() => setShowNavigateModal(false)}
        >
          <h2 className="text-xl font-bold mb-2">🎉 優惠券已成功入帳！</h2>
          <p className="mb-4">您獲得「積分優惠 - NT$100」</p>
          <button
            onClick={() => router.push("/accountCenter/mall/coupon")}
            className="px-4 py-2 bg-blue-500 text-white rounded hover:bg-blue-600"
          >
            前往查看
          </button>
        </Modal>
      )}

      {/* ✅ CSS 效果 */}
      <style jsx global>{`
        .shimmer-wrapper {
          position: relative;
          background-color: #e0e0e0;
          overflow: hidden;
        }

        .shimmer-bar {
          background: linear-gradient(
            to right,
            #b3e5fc 0%,
            #e1bee7 50%,
            #f8bbd0 100%
          );
          background-size: 200% auto;
          animation: shimmer 4s ease-in-out infinite;
        }

        .shimmer-box {
          background: linear-gradient(
            110deg,
            #ffffff 8%,
            #f0f0f0 18%,
            #ffffff 33%
          );
          background-size: 200% 100%;
          animation: shimmer-box 3s ease-in-out infinite;
        }

        @keyframes shimmer {
          0% {
            background-position: 200% 0;
          }
          100% {
            background-position: -200% 0;
          }
        }

        @keyframes shimmer-box {
          0% {
            background-position: 200% 0;
          }
          100% {
            background-position: -200% 0;
          }
        }
      `}</style>
    </div>
  );
}
