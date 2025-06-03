// components/ProductDetailSkeleton.jsx

// 基礎骨架屏組件
const SkeletonBox = ({ className }) => (
  <div className={`bg-gray-200 animate-pulse rounded ${className}`}></div>
);

const ProductDetailSkeleton = () => {
  return (
    <div className="mx-auto w-full">
      {/* 上方骨架屏 */}
      <div className="mx-4 py-8">
        <div className="max-w-5xl mx-auto flex flex-col md:flex-row">
          {/* 圖片區骨架屏 */}
          <div className="p-5 md:w-1/2">
            {/* 大圖骨架屏 */}
            <SkeletonBox className="w-full aspect-square rounded-2xl" />

            {/* 小縮圖列骨架屏 */}
            <div className="flex pt-4 gap-2">
              {[...Array(4)].map((_, index) => (
                <SkeletonBox key={index} className="w-28 h-28 rounded-2xl" />
              ))}
            </div>
          </div>

          {/* 商品資訊區骨架屏 */}
          <div className="p-6 mt-1 md:w-1/2">
            {/* 商品名稱 */}
            <SkeletonBox className="h-6 w-3/4 mb-4" />

            {/* 商品描述 */}
            <div className="space-y-2 mb-4">
              <SkeletonBox className="h-4 w-full" />
              <SkeletonBox className="h-4 w-5/6" />
              <SkeletonBox className="h-4 w-4/5" />
              <SkeletonBox className="h-4 w-3/4" />
            </div>

            {/* 分隔線 */}
            <div className="h-px bg-gray-300 my-4 w-full" />

            {/* 免運優惠 */}
            <SkeletonBox className="h-4 w-2/3 mb-2" />

            {/* 價格 */}
            <SkeletonBox className="h-6 w-1/3 mb-2" />

            {/* 評分 */}
            <SkeletonBox className="h-4 w-1/2 mb-4" />

            {/* 數量選擇 */}
            <div className="text-center py-2">
              <SkeletonBox className="h-8 w-32 mx-auto mb-4" />
            </div>

            {/* 按鈕 */}
            <div className="flex gap-4 py-2">
              <SkeletonBox className="flex-1 h-10 rounded-lg" />
              <SkeletonBox className="flex-1 h-10 rounded-lg" />
            </div>

            {/* 收藏按鈕 */}
            <SkeletonBox className="h-8 w-32 mx-auto mt-4" />
          </div>
        </div>
      </div>

      {/* 下方骨架屏 */}
      <div className="pt-8 px-4 md:mx-24">
        {/* Tabs骨架屏 */}
        <div className="flex justify-between text-center mx-8">
          {[...Array(3)].map((_, index) => (
            <SkeletonBox key={index} className="h-8 w-24" />
          ))}
        </div>

        {/* Tab內容骨架屏 */}
        <div className="mt-8 text-center">
          <div className="space-y-2">
            <SkeletonBox className="h-4 w-3/4 mx-auto" />
            <SkeletonBox className="h-4 w-2/3 mx-auto" />
            <SkeletonBox className="h-4 w-1/2 mx-auto" />
          </div>
        </div>
      </div>
    </div>
  );
};

export default ProductDetailSkeleton;
