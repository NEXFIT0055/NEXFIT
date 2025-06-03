"use client";

const ProductSkeleton = ({
  count = 6,
  variant = "desktop", // "desktop" 或 "mobile"
}) => {
  const skeletonItems = [...Array(count)].map((_, index) => (
    <div
      key={index}
      className="relative flex flex-col py-4 group cursor-pointer min-h-[400px] animate-pulse"
    >
      {/* 產品圖片區塊骨架 */}
      <div className="relative">
        {/* 標籤和愛心骨架 */}
        <div className="absolute top-2 left-0 right-0 flex justify-between items-center px-4 z-10">
          <div className="bg-gray-200 rounded-sm w-8 h-6"></div>
          <div className="bg-gray-200 rounded-full w-4 h-4"></div>
        </div>

        {/* 產品圖片骨架 - 與 ProductCard 相同的 aspect-square */}
        <div className="bg-gray-200 rounded-md aspect-square"></div>
      </div>

      {/* 產品名稱骨架 - 對應 text-lg font-medium mt-4 line-clamp-2 */}
      <div className="bg-gray-200 rounded-md h-5 w-full mt-4"></div>
      <div className="bg-gray-200 rounded-md h-5 w-3/4 mt-1"></div>

      {/* 產品品牌骨架 - 對應 text-sm */}
      <div className="bg-gray-200 rounded-md h-4 w-1/2 mt-1"></div>

      {/* 評價骨架 - 對應星星評價區塊 */}
      <div className="flex items-center mt-2">
        <div className="bg-gray-200 rounded-md h-4 w-32"></div>
      </div>

      {/* 產品價格骨架 - 對應 text-lg mt-2 */}
      <div className="mt-2">
        <div className="bg-gray-200 rounded-md h-6 w-20"></div>
      </div>

      {/* 手機版加入購物車按鈕骨架 - 對應 w-full mt-2 py-6 lg:hidden */}
      <div className="lg:hidden">
        <div className="bg-gray-200 rounded-none w-full h-12 mt-2"></div>
      </div>
    </div>
  ));

  // 根據 ProductsPage 中的實際 grid 設定來決定樣式
  const gridClasses =
    variant === "desktop"
      ? "grid grid-cols-2 sm:grid-cols-2 md:grid-cols-2 lg:grid-cols-3 gap-4"
      : "grid grid-cols-2 sm:grid-cols-2 md:grid-cols-3 gap-4";

  return <div className={gridClasses}>{skeletonItems}</div>;
};

export default ProductSkeleton;
