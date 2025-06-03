import { Th, Td } from "./TableCell";

// 骨架屏表格行組件
const SkeletonRow = () => (
  <tr className="animate-pulse">
    <Td>
      <div className="h-4 bg-gray-200 rounded w-16"></div>
    </Td>
    <Td>
      <div className="h-4 bg-gray-200 rounded w-20"></div>
    </Td>
    <Td>
      <div className="h-6 bg-gray-200 rounded w-16"></div>
    </Td>
    <Td>
      <div className="h-4 bg-gray-200 rounded w-24"></div>
    </Td>
  </tr>
);

// 手機版骨架屏卡片組件
const SkeletonCard = () => (
  <div className="border border-borderColor rounded-lg p-4 bg-[#F9F9F9] animate-pulse">
    <div className="flex justify-between mb-2">
      <div className="h-4 bg-gray-200 rounded w-12"></div>
      <div className="h-4 bg-gray-200 rounded w-20"></div>
    </div>
    <div className="flex justify-between mb-2">
      <div className="h-4 bg-gray-200 rounded w-12"></div>
      <div className="h-4 bg-gray-200 rounded w-16"></div>
    </div>
    <div className="flex justify-between mb-2">
      <div className="h-4 bg-gray-200 rounded w-16"></div>
      <div className="h-4 bg-gray-200 rounded w-20"></div>
    </div>
    <div className="flex justify-between mb-2">
      <div className="h-4 bg-gray-200 rounded w-16"></div>
      <div className="h-6 bg-gray-200 rounded w-16"></div>
    </div>
    <div className="flex justify-between">
      <div className="h-4 bg-gray-200 rounded w-12"></div>
      <div className="h-4 bg-gray-200 rounded w-24"></div>
    </div>
  </div>
);

// 主要骨架屏組件
const CouponSkeleton = ({ rowCount = 5, cardCount = 3 }) => (
  <div className="p-10 w-4/5 h-full mt-10 mx-10 border border-borderColor rounded-lg">
    {/* 標題骨架 */}
    <div className="mb-6">
      <div className="h-8 bg-gray-200 rounded w-24 animate-pulse"></div>
    </div>

    {/* 桌機版表格骨架 */}
    <div className="hidden md:block">
      <table className="w-full text-base border-collapse border-gray-400">
        <thead>
          <tr className="bg-[#F9F9F9]">
            <Th>面額</Th>
            <Th>使用期限</Th>
            <Th>使用狀況</Th>
            <Th>備註</Th>
          </tr>
        </thead>
        <tbody>
          {[...Array(rowCount)].map((_, index) => (
            <SkeletonRow key={index} />
          ))}
        </tbody>
      </table>
    </div>

    {/* 手機版卡片骨架 */}
    <div className="flex flex-col gap-4 md:hidden">
      {[...Array(cardCount)].map((_, index) => (
        <SkeletonCard key={index} />
      ))}
    </div>
  </div>
);

export default CouponSkeleton;
