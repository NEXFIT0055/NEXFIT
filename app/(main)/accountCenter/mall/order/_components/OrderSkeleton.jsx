import { Th, Td } from "../../_components/TableCell";

// 骨架屏表格行組件
const SkeletonRow = () => (
  <tr className="animate-pulse">
    <Td>
      <div className="h-4 bg-gray-200 rounded w-24"></div>
    </Td>
    <Td>
      <div className="h-4 bg-gray-200 rounded w-28"></div>
    </Td>
    <Td>
      <div className="h-4 bg-gray-200 rounded w-16"></div>
    </Td>
    <Td>
      <div className="h-4 bg-gray-200 rounded w-20"></div>
    </Td>
    <Td className="text-center">
      <div className="h-8 bg-gray-200 rounded w-16 mx-auto"></div>
    </Td>
  </tr>
);

// 手機版骨架屏卡片組件
const SkeletonCard = () => (
  <div className="min-w-full border border-gray-200 rounded-lg p-4 bg-white animate-pulse">
    <div className="space-y-3">
      <div className="flex justify-between items-center">
        <div className="h-4 bg-gray-200 rounded w-24"></div>
        <div className="h-4 bg-gray-200 rounded w-28"></div>
      </div>
      <div className="flex justify-between items-center">
        <div className="h-4 bg-gray-200 rounded w-16"></div>
        <div className="h-4 bg-gray-200 rounded w-20"></div>
      </div>
      <div className="flex justify-between items-center">
        <div className="h-4 bg-gray-200 rounded w-20"></div>
        <div className="h-8 bg-gray-200 rounded w-16"></div>
      </div>
    </div>
  </div>
);

// 主要骨架屏組件
const OrderSkeleton = ({ rowCount = 5, cardCount = 3 }) => (
  <>
    {/* 桌機版表格骨架 */}
    <div className="min-w-full hidden lg:block overflow-x-auto">
      <table className="min-w-full border-collapse border-gray-400">
        <thead>
          <tr className="bg-[#F9F9F9]">
            <Th className="min-w-50">訂單編號</Th>
            <Th className="min-w-40">訂購日期</Th>
            <Th className="min-w-30">訂單狀態</Th>
            <Th className="min-w-30">金額</Th>
            <Th className="min-w-40"></Th>
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
    <div className="grid grid-cols-1 gap-4 lg:hidden">
      {[...Array(cardCount)].map((_, index) => (
        <SkeletonCard key={index} />
      ))}
    </div>
  </>
);

export default OrderSkeleton;
