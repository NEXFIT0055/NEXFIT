"use client";
import { useRouter } from "next/navigation"; // 修正 useRouter 的導入
import Image from "next/image";
import {
  FaRegLightbulb,
  FaRegSmile,
  FaRegEdit,
  FaRegStar,
  FaRegQuestionCircle,
  FaCheckCircle,
  FaHandsHelping,
  FaArrowLeft,
} from "react-icons/fa";
import { Button } from "@/app/components/ui/button";

export default function ForumGuidePage() {
  const router = useRouter(); // 初始化 router

  return (
    <div className="min-h-screen py-10 px-4 space-y-10">
      {/* 歡迎區塊 */}
      <section className="bg-[#FBF9FA] rounded-2xl shadow p-8 flex items-center gap-6">
        <FaRegSmile className="text-5xl text-[#AFC16D] flex-shrink-0" />
        <div>
          <h1 className="text-3xl font-bold text-[#101828] mb-2 flex items-center gap-2">
            <FaRegLightbulb className="text-[#AFC16D]" /> 新手入門教學
          </h1>
          <p className="text-[#101828]/80 text-lg">
            歡迎加入健康運動論壇！這裡是運動、健康、營養愛好者的交流天地。無論你是剛註冊的新手，還是資深健身達人或是營養小博士，都能在這裡找到屬於自己的話題與夥伴。
          </p>
        </div>
      </section>

      {/* 圖文導覽 */}
      <section className="bg-[#FBF9FA] rounded-2xl shadow p-8 space-y-6">
        <h2 className="text-2xl font-bold text-[#101828] flex items-center gap-2">
          <FaRegEdit className="text-[#AFC16D]" /> 基本操作步驟
        </h2>
        <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
          <div className="flex flex-col items-center text-center">
            <div style={{ width: 120, height: 120, position: "relative" }}>
              <Image
                src="/images/forum/guide/register.png"
                alt="註冊"
                fill
                style={{ objectFit: "contain" }}
                className="mb-2"
                sizes="120px"
              />
            </div>
            <p className="font-semibold text-[#101828]">1. 註冊與登入</p>
            <p className="text-[#101828]/70 text-sm">點擊右上角「註冊」或「登入」按鈕，填寫基本資料即可加入論壇。</p>
          </div>
          <div className="flex flex-col items-center text-center">
            <div style={{ width: 120, height: 120, position: "relative" }}>
              <Image
                src="/images/forum/guide/browse.png"
                alt="瀏覽文章"
                fill
                style={{ objectFit: "contain" }}
                className="mb-2"
                sizes="120px"
              />
            </div>
            <p className="font-semibold text-[#101828]">2. 瀏覽文章</p>
            <p className="text-[#101828]/70 text-sm">在首頁、分類頁或熱門標籤中瀏覽你感興趣的主題。</p>
          </div>
          <div className="flex flex-col items-center text-center">
            <div style={{ width: 120, height: 120, position: "relative" }}>
              <Image
                src="/images/forum/guide/write.png"
                alt="發表文章"
                fill
                style={{ objectFit: "contain" }}
                className="mb-2"
                sizes="120px"
              />
            </div>
            <p className="font-semibold text-[#101828]">3. 發表文章</p>
            <p className="text-[#101828]/70 text-sm">點擊「發表文章」按鈕，填寫標題、內容與分類，分享你的經驗。</p>
          </div>
          <div className="flex flex-col items-center text-center">
            <div style={{ width: 120, height: 120, position: "relative" }}>
              <Image
                src="/images/forum/guide/comment.png"
                alt="留言互動"
                fill
                style={{ objectFit: "contain" }}
                className="mb-2"
                sizes="120px"
              />
            </div>
            <p className="font-semibold text-[#101828]">4. 留言互動</p>
            <p className="text-[#101828]/70 text-sm">在文章下方留言，與其他用戶交流想法與經驗。</p>
          </div>
        </div>
      </section>

      {/* 社群提醒 */}
      <section className="bg-[#FBF9FA] rounded-2xl shadow p-8">
        <h2 className="text-xl font-bold mb-4 text-[#101828] flex items-center gap-2">
          <FaRegStar className="text-[#AFC16D]" /> 新手小提醒
        </h2>
        <ul className="list-disc pl-6 space-y-2 text-[#101828]/80">
          <li>請遵守社群規範，尊重每一位用戶。</li>
          <li>遇到問題可在「系統協助解說」主題發問，管理員或熱心夥伴會協助你。</li>
          <li>善用「熱門標籤」快速找到你關心的主題。</li>
          <li>多多互動、按讚、留言，能提升你的積分與成就！</li>
        </ul>
      </section>

      {/* FAQ */}
      <section className="bg-[#FBF9FA] rounded-2xl shadow p-8">
        <h2 className="text-xl font-bold mb-4 text-[#101828] flex items-center gap-2">
          <FaRegQuestionCircle className="text-[#AFC16D]" /> 常見新手Q&A
        </h2>
        <div className="space-y-4">
          <div>
            <p className="font-semibold text-[#101828]">Q：如何修改我的個人資料？</p>
            <p className="text-[#101828]/70">A：點擊左側「用戶名稱」或「個人專區」即可進入個人資料頁面進行修改。</p>
          </div>
          <div>
            <p className="font-semibold text-[#101828]">Q：我可以刪除自己的文章或留言嗎？</p>
            <p className="text-[#101828]/70">A：可以，在文章或留言旁會有刪除按鈕，點擊即可刪除。</p>
          </div>
          <div>
            <p className="font-semibold text-[#101828]">Q：如何提升我的積分？</p>
            <p className="text-[#101828]/70">A：發表文章、留言、按讚、被收藏都能提升積分。</p>
          </div>
          <div>
            <p className="font-semibold text-[#101828]">Q：遇到不當內容怎麼辦？</p>
            <p className="text-[#101828]/70">A：請點擊該內容旁的「檢舉」按鈕，管理員會盡快處理。</p>
          </div>
        </div>
      </section>

      {/* 結語 */}
      <section className="bg-[#AFC16D]/10 border-l-4 border-[#AFC16D] rounded-2xl p-6 flex items-center gap-3">
        <FaHandsHelping className="text-2xl text-[#AFC16D]" />
        <p className="text-[#101828] text-base">
          歡迎你成為健康運動論壇的一員！<br />
          有任何建議或問題，歡迎隨時聯絡我們或在「系統協助解說」主題發問。
        </p>
      </section>

      {/* 返回按鈕 */}
      <div className="mt-10 text-center">
        <Button
          type="button"
          variant="outline"
          size="md"
          className="px-6 py-2 text-black border-black hover:bg-gray-100 rounded-md flex items-center gap-2"
          onClick={() => router.push("/forum")}
        >
          <FaArrowLeft className="inline" />
          返回論壇主頁
        </Button>
      </div>
    </div>
  );
}