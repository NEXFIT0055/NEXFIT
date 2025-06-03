import { IoIosArrowRoundBack, IoIosArrowRoundForward } from "react-icons/io";

export default function Pagination({ currentPage, totalPages, onPageChange }) {
  const maxVisiblePages = 5; // 最大可見頁數
  const pages = [];

  // 計算頁碼範圍
  if (totalPages <= maxVisiblePages) {
    for (let i = 1; i <= totalPages; i++) {
      pages.push(i);
    }
  } else {
    let startPage = Math.max(1, currentPage - 2);
    let endPage = Math.min(totalPages, startPage + 4);
    if (endPage - startPage < 4) {
      startPage = Math.max(1, endPage - 4);
    }
    for (let i = startPage; i <= endPage; i++) {
      pages.push(i);
    }
  }

  // 捲動至頂部的函式
  const scrollToTop = () => {
    window.scrollTo({
      top: 0,
      behavior: "smooth", // 平滑捲動
    });
  };

  // 包裝 onPageChange，加入捲動邏輯
  const handlePageChange = (page) => {
    if (page < 1 || page > totalPages) return;
    onPageChange(page); // 呼叫父層的分頁變更函式
    scrollToTop(); // 捲動至頂部
  };

  return (
    <div className="w-full flex justify-center items-center py-6 bg-transparent">
      {/* 上一頁 */}
      <button
        onClick={() => handlePageChange(currentPage - 1)}
        disabled={currentPage === 1}
        className="mx-4 w-12 h-12 rounded-full flex items-center justify-center border-none disabled:opacity-50 bg-[#F0F0F0] text-[#101828] cursor-pointer"
      >
        <IoIosArrowRoundBack className="text-xl" style={{ color: "#101828" }} />
      </button>

      {/* 頁碼 */}
      <div className="flex gap-3">
        {pages.map((page) => (
          <button
            key={page}
            onClick={() => handlePageChange(page)}
            className={`text-base px-2 transition border-none bg-transparent font-medium flex flex-col items-center justify-end cursor-pointer`}
            style={{
              color: "#101828",
              background: "none",
              boxShadow: "none",
              outline: "none",
              borderRadius: 0,
              borderBottom:
                currentPage === page
                  ? "3px solid #AFC16D"
                  : "3px solid transparent",
              fontWeight: currentPage === page ? "bold" : "normal",
              paddingBottom: "2px",
              minWidth: "24px",
            }}
          >
            {page}
          </button>
        ))}
      </div>

      {/* 下一頁 */}
      <button
        onClick={() => handlePageChange(currentPage + 1)}
        disabled={currentPage === totalPages}
        className="mx-4 w-12 h-12 rounded-full flex items-center justify-center border-none disabled:opacity-50 bg-[#F0F0F0] text-[#101828] cursor-pointer"
      >
        <IoIosArrowRoundForward
          className="text-xl"
          style={{ color: "#101828" }}
        />
      </button>
    </div>
  );
}
