import Image from "next/image";

export default function SystemHelpPage() {
  return (
    <div className="min-h-screen py-10 px-4">
      <div className="max-w-4xl mx-auto bg-[#FBF9FA] rounded-2xl shadow-md p-10">
        <h1 className="text-3xl font-bold text-[#101828] mb-6 tracking-tight flex items-center gap-3">
          <span className="inline-block w-2 h-8 bg-[#AFC16D] rounded-sm" />
          系統協助解說
        </h1>
        <p className="mb-8 text-[#101828]/80 text-lg">
          歡迎來到健康論壇！本頁將帶你快速了解論壇的主要功能、常見問題與社群規範，讓你能安心、有效地參與討論。
        </p>

        {/* 主要功能導覽 */}
        <section className="mb-12">
          <h2 className="text-2xl font-semibold mb-4 text-[#101828] flex items-center gap-2">
            <span className="bg-[#AFC16D] w-2 h-6 rounded-sm inline-block" /> 主要功能導覽
          </h2>
          <div className="space-y-10">
            <div>
              <h3 className="font-bold mb-2 text-[#101828]">1. 發表與瀏覽文章</h3>
              <ul className="list-disc pl-6 text-[#101828]/80 space-y-1">
                <li>點擊「發表文章」可新增討論主題，分享你的經驗或提問。</li>
                <li>首頁可瀏覽熱門文章、最新文章，並用分頁器快速切換。</li>
                <li>點擊文章標題可進入詳情頁，查看完整內容與留言。</li>
              </ul>
              <div className="my-4">
                <Image
                  src="/images/forum/system-help/post-demo.jpg"
                  alt="發表與瀏覽文章示意圖"
                  width={600}
                  height={280}
                  style={{ width: '100%', height: 'auto' }}
                  className="rounded-xl shadow"
                />
              </div>
            </div>
            <div>
              <h3 className="font-bold mb-2 text-[#101828]">2. 收藏與最愛</h3>
              <ul className="list-disc pl-6 text-[#101828]/80 space-y-1">
                <li>在文章卡片可點擊「收藏」或「最愛」按鈕，方便日後快速查找。</li>
                <li>收藏與最愛會儲存在你的瀏覽器 localStorage，僅自己可見。</li>
              </ul>
              <div className="my-4">
                <Image
                  src="/images/forum/system-help/favorite-demo.jpg"
                  alt="收藏與最愛示意圖"
                  width={600}
                  height={280}
                  style={{ width: '100%', height: 'auto' }}
                  className="rounded-xl shadow"
                />
              </div>
            </div>
            <div>
              <h3 className="font-bold mb-2 text-[#101828]">3. 留言與互動</h3>
              <ul className="list-disc pl-6 text-[#101828]/80 space-y-1">
                <li>在文章詳情頁下方可留言、回覆、刪除自己的留言。</li>
                <li>留言即時刷新，促進社群互動。</li>
              </ul>
              <div className="my-4">
                <Image
                  src="/images/forum/system-help/comment-demo.jpg"
                  alt="留言互動示意圖"
                  width={600}
                  height={280}
                  style={{ width: '100%', height: 'auto' }}
                  className="rounded-xl shadow"
                />
              </div>
            </div>
            <div>
              <h3 className="font-bold mb-2 text-[#101828]">4. 熱門文章輪播</h3>
              <ul className="list-disc pl-6 text-[#101828]/80 space-y-1">
                <li>首頁頂部有熱門文章輪播，快速掌握社群焦點。</li>
                <li>點擊輪播卡片可直接進入該熱門文章。</li>
              </ul>
              <div className="my-4">
                <Image
                  src="/images/forum/system-help/hot-carousel-demo.jpg"
                  alt="熱門文章輪播示意圖"
                  width={600}
                  height={180}
                  style={{ width: '100%', height: 'auto' }}
                  className="rounded-xl shadow"
                />
              </div>
            </div>
          </div>
        </section>

        {/* 常見問題 FAQ */}
        <section className="mb-12">
          <h2 className="text-2xl font-semibold mb-4 text-[#101828] flex items-center gap-2">
            <span className="bg-[#AFC16D] w-2 h-6 rounded-sm inline-block" /> 常見問題 FAQ
          </h2>
          <ul className="list-disc pl-6 text-[#101828]/80 space-y-3">
            <li>
              <b className="text-[#101828]">Q：忘記密碼怎麼辦？</b>
              <br />
              A：請至登入頁點選「忘記密碼」，依指示重設。
            </li>
            <li>
              <b className="text-[#101828]">Q：如何檢舉不當內容？</b>
              <br />
              A：請於文章或留言下方點選「檢舉」按鈕，管理員會盡快處理。
            </li>
            <li>
              <b className="text-[#101828]">Q：可以匿名發文嗎？</b>
              <br />
              A：目前僅支援註冊會員發文，未來將視需求開放匿名功能。
            </li>
            <li>
              <b className="text-[#101828]">Q：如何修改個人資料？</b>
              <br />
              A：請至「會員中心」編輯個人資訊與頭像。
            </li>
          </ul>
        </section>

        {/* 使用小提醒 */}
        <section className="mb-12">
          <h2 className="text-2xl font-semibold mb-4 text-[#101828] flex items-center gap-2">
            <span className="bg-[#AFC16D] w-2 h-6 rounded-sm inline-block" /> 使用小提醒
          </h2>
          <ul className="list-disc pl-6 text-[#101828]/80 space-y-2">
            <li>請勿張貼廣告、惡意言論或違法內容。</li>
            <li>尊重他人，理性討論，營造友善社群。</li>
            <li>如遇技術問題，請先參考本頁 FAQ 或聯絡客服。</li>
          </ul>
        </section>

        {/* 社群規範 */}
        <section className="mb-12">
          <h2 className="text-2xl font-semibold mb-4 text-[#101828] flex items-center gap-2">
            <span className="bg-[#AFC16D] w-2 h-6 rounded-sm inline-block" /> 社群規範
          </h2>
          <ul className="list-disc pl-6 text-[#101828]/80 space-y-2">
            <li>禁止散布謠言、仇恨言論、個資外洩。</li>
            <li>嚴禁發表違反法律之內容。</li>
            <li>違規者將依情節輕重停權或刪除帳號。</li>
          </ul>
        </section>

        {/* 聯絡客服 */}
        <section>
          <h2 className="text-2xl font-semibold mb-4 text-[#101828] flex items-center gap-2">
            <span className="bg-[#AFC16D] w-2 h-6 rounded-sm inline-block" /> 聯絡客服
          </h2>
          <p className="text-[#101828]/80 mb-2">
            若有任何疑問或建議，歡迎來信 <a href="mailto:support@healthforum.com" className="text-[#AFC16D] underline font-semibold">support@healthforum.com</a>，我們將盡快協助您！
          </p>
        </section>
      </div>
    </div>
  );
}