"use client";
import { useEffect, useState, useCallback } from "react";
import Link from "next/link";
import { Button } from "@/app/components/ui/button";
import {
  FaUserGraduate,
  FaTools,
  FaFemale,
  FaBalanceScale,
  FaDumbbell,
  FaAppleAlt,
  FaStethoscope,
  FaWheelchair,
  FaChartBar,
} from "react-icons/fa";
import LoginModal from "@/app/components/login";
import { useRouter } from "next/navigation";

const topics = [
  {
    icon: <FaUserGraduate className="text-2xl" />,
    title: "新手入門",
    desc: "適合新註冊用戶的教學與入門",
    href: "/forum/guide",
  },
  {
    icon: <FaTools className="text-2xl" />,
    title: "系統協助解說",
    desc: "如何使用論壇功能",
    href: "/forum/system-help",
  },
  {
    icon: <FaFemale className="text-2xl" />,
    title: "女性專區",
    desc: "健康、運動、飲食等主題",
  },
  {
    icon: <FaBalanceScale className="text-2xl" />,
    title: "減重專區",
    desc: "減脂、控制體重與健康體態",
  },
  {
    icon: <FaDumbbell className="text-2xl" />,
    title: "健身專區",
    desc: "重訓、體能與運動技巧分享",
  },
  {
    icon: <FaAppleAlt className="text-2xl" />,
    title: "營養專區",
    desc: "飲食建議與營養補充討論",
  },
  {
    icon: <FaStethoscope className="text-2xl" />,
    title: "醫學專區",
    desc: "健康檢查、慢性病與醫療問題",
  },
  {
    icon: <FaWheelchair className="text-2xl" />,
    title: "特殊族群",
    desc: "長輩與照護者交流區",
  },
  {
    icon: <FaChartBar className="text-2xl" />,
    title: "成果展示專區",
    desc: "分享你的健身與健康成果",
    href: "/forum/showcase",
  },
];

export default function SidebarLeft({ onTagClick }) {
  const [user, setUser] = useState({
    name: "訪客",
    avatar: "/images/forum/avatars/guest.png",
    points: 0,
  });
  const [tags, setTags] = useState([]);
  const [isLoginModalOpen, setIsLoginModalOpen] = useState(false);
  const [pendingAction, setPendingAction] = useState(null);
  const router = useRouter();

  // 判斷登入狀態並取得用戶資料
  useEffect(() => {
    const fetchUser = () => {
      const token = localStorage.getItem("token");
      if (!token) {
        setUser({
          name: "訪客",
          avatar: "/images/forum/avatars/guest.png",
          points: 0,
        });
        return;
      }
      fetch("/api/forum/user/profile", {
        headers: { Authorization: `Bearer ${token}` }
      })
        .then((res) => {
          if (!res.ok) throw new Error("無法取得用戶資料");
          return res.json();
        })
        .then((data) => {
          setUser({
            id: data.user_id,
            name: data.name || "用戶",
            avatar: data.avatar_url || "/images/forum/avatars/guest.png",
            points: data.points || 0,
          });
        })
        .catch(() => {
          setUser({
            name: "訪客",
            avatar: "/images/forum/avatars/guest.png",
            points: 0,
          });
        });
    };
    fetchUser();
    window.addEventListener("storage", fetchUser);
    return () => window.removeEventListener("storage", fetchUser);
  }, []);

  // 熱門標籤不變
  useEffect(() => {
    fetch("/api/forum/tags/hot")
      .then((res) => res.json())
      .then((data) => (Array.isArray(data) ? setTags(data) : setTags([])))
      .catch(() => setTags([]));
  }, []);

  // 登入檢查與自動執行功能
  const requireLogin = useCallback((action) => {
    const token = localStorage.getItem("token");
    if (!token) {
      setPendingAction(() => async () => {
        // 重新獲取用戶資料
        const response = await fetch("/api/forum/user/profile", {
          headers: { Authorization: `Bearer ${localStorage.getItem("token")}` }
        });
        if (response.ok) {
          const data = await response.json();
          setUser({
            id: data.user_id,
            name: data.name || "用戶",
            avatar: data.avatar_url || "/images/forum/avatars/guest.png",
            points: data.points || 0,
          });
          // 執行原始動作
          action();
        }
      });
      setIsLoginModalOpen(true);
      return false;
    }
    action();
    return true;
  }, []);

  useEffect(() => {
    if (!isLoginModalOpen && pendingAction) {
      const token = localStorage.getItem("token");
      if (token) {
        pendingAction();
        setPendingAction(null);
      }
    }
  }, [isLoginModalOpen, pendingAction]);

  return (
    <>
      {isLoginModalOpen && (
        <LoginModal isOpen={isLoginModalOpen} onClose={() => setIsLoginModalOpen(false)} />
      )}
      <aside className="w-72 hidden space-y-6 hidden md:block">
        {/* 用戶資訊區塊 */}
        <div className="bg-white rounded-xl p-5 text-center shadow-md hover:shadow-lg transition-shadow duration-200">
          <img
            src={user.avatar}
            alt={user.name}
            className="w-20 h-20 mx-auto rounded-full"
          />
          <h4 className="mt-3 text-lg font-semibold">{user.name}</h4>
          <p className="text-sm text-gray-500">積分: {user.points}</p>

          <div className="mt-5 flex flex-col gap-2">
            <Button variant="default" size="default" className="w-full cursor-pointer" onClick={() => requireLogin(() => router.push("/forum/create"))}>
              發表文章
            </Button>
            {/* <Button variant="default" size="default" className="w-full cursor-pointer" onClick={() => requireLogin(() => alert("收藏功能"))}>
              收藏文章
            </Button> */}
            <Button variant="default" size="default" className="w-full cursor-pointer" onClick={() => requireLogin(async () => {
              const response = await fetch("/api/forum/user/profile", {
                headers: { Authorization: `Bearer ${localStorage.getItem("token")}` }
              });
              if (response.ok) {
                const data = await response.json();
                router.push(`/forum/account/${data.user_id}`);
              }
            })}>
              個人專區
            </Button>
            <Button
              variant="default"
              size="default"
              className="w-full cursor-pointer"
              onClick={() => requireLogin(() => router.push("/achievement"))}
            >
              成就專區
            </Button>
          </div>
        </div>

        {/* 精選社群主題 */}
        <div className="bg-white shadow-md rounded-xl p-5 hover:shadow-lg">
          <h4 className="font-bold text-base mb-4 border-b pb-2">精選社群主題</h4>
          <div className="flex flex-col gap-3">
            {topics.map((item) =>
              item.href ? (
                <Link
                  key={item.title}
                  href={item.href}
                  className="text-left bg-gray-100 hover:bg-gray-200 p-4 rounded-lg shadow-sm transition-all block"
                >
                  <div className="flex items-start gap-3">
                    {item.icon}
                    <div>
                      <h5 className="font-semibold text-sm">{item.title}</h5>
                      <p className="text-xs text-gray-600">{item.desc}</p>
                    </div>
                  </div>
                </Link>
              ) : (
                <button
                  key={item.title}
                  className="text-left bg-gray-100 hover:bg-gray-200 p-4 rounded-lg shadow-sm transition-all"
                >
                  <div className="flex items-start gap-3">
                    {item.icon}
                    <div>
                      <h5 className="font-semibold text-sm">{item.title}</h5>
                      <p className="text-xs text-gray-600">{item.desc}</p>
                    </div>
                  </div>
                </button>
              )
            )}
          </div>
        </div>

        {/* 熱門標籤 */}
        <div className="bg-white shadow-md rounded-xl p-5">
          <h4 className="font-bold text-base mb-4 border-b pb-2">熱門標籤</h4>
          <div className="flex flex-wrap gap-2">
            {Array.isArray(tags) && tags.length > 0 ? (
              tags.map(({ tag, count }) => (
                <button
                  key={tag}
                  onClick={() => onTagClick && onTagClick(tag)}
                  className="inline-flex items-center min-w-[4.5rem] max-w-[8rem] px-3 py-1 bg-gray-100 text-gray-700 rounded-full font-medium truncate hover:bg-gray-200 hover:text-gray-900 transition text-sm mb-2 shadow-sm"
                  title={`#${tag} - ${count} 篇`}
                >
                  <span className="truncate">#{tag}</span>
                  <span className="ml-2 text-xs text-gray-500">{count} 篇</span>
                </button>
              ))
            ) : (
              <div className="text-gray-500">載入中...</div>
            )}
          </div>
        </div>
      </aside>
    </>
  );
}