"use client";
import { useState } from "react";
import { Button } from "@/app/components/ui/button";

export default function ForumAbout() {
  const [email, setEmail] = useState("");
  const [subscribe, setSubscribe] = useState(false);
  const [loading, setLoading] = useState(false);
  const [message, setMessage] = useState("");

  const handleSubmit = async (e) => {
    e.preventDefault();
    setLoading(true);
    setMessage("");

    try {
      const res = await fetch("/api/forum/subscriptions", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify({ email, subscribe }),
      });

      if (res.ok) {
        setMessage("Thank you for subscribing!");
        setEmail("");
        setSubscribe(false);
      } else {
        const errorData = await res.json();
        setMessage(errorData.error || "Failed to subscribe. Please try again.");
      }
    } catch (error) {
      console.error("Subscription error:", error);
      setMessage("An error occurred. Please try again.");
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="min-h-screen flex flex-col justify-center items-center bg-gradient-to-b from-[#f2fedc] to-[#a9ba5c] mb-16">
      {/* 置中卡片 */}
      <div className="bg-white rounded-md shadow-lg p-10 max-w-xl w-full mt-16 mb-8 text-center">
        <h1 className="text-4xl font-serif font-bold mb-2">NEXFIT</h1>
        <p className="text-gray-700 mb-6 mt-4">
          我們相信每一份努力都值得被看見，每一段旅程都不該孤單前行。這裡不只是論壇，更是一個彼此支持、交流經驗的空間。無論你正在追求更好的體態、更穩定的作息，還是單純想找個懂你的人，訂閱我們，和一群同樣在路上的朋友一起分享靈感、汲取力量，讓健康成為生活中最自然的選擇。
        </p>
      </div>

      {/* 訂閱表單 */}
      <div className="bg-[#abad9a] w-full py-8 flex flex-col items-center">
        <form
          className="bg-transparent text-white max-w-md w-full flex flex-col items-center"
          onSubmit={handleSubmit}
        >
          <h2 className="text-lg font-bold mb-4">Subscribe Here for News & Updates</h2>
          <div className="w-full mb-2">
            <label className="block mb-1" htmlFor="email">Email*</label>
            <input
              id="email"
              type="email"
              required
              className="w-full px-3 py-2 rounded border border-gray-300 text-black"
              value={email}
              onChange={(e) => setEmail(e.target.value)}
            />
          </div>
          <div className="w-full flex items-center mb-4">
            <input
              id="subscribe"
              type="checkbox"
              checked={subscribe}
              onChange={(e) => setSubscribe(e.target.checked)}
              className="mr-2"
            />
            <label htmlFor="subscribe" className="text-sm">
              Yes, subscribe me to your newsletter.
            </label>
          </div>
          <Button
            type="submit"
            variant="outline"
            size="default"
            className="bg-white text-[#abad9a] hover:bg-gray-200 transition"
            disabled={loading || !subscribe} // 禁用按鈕條件
          >
            {loading ? "Submitting..." : "Submit"}
          </Button>
        </form>
        {message && <p className="mt-4 text-white">{message}</p>}
      </div>
    </div>
  );
}