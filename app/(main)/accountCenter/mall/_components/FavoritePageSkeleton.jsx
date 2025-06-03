import React from "react";

export default function FavoritePageSkeleton() {
  return (
    <div className="p-10 w-4/5 h-full mt-10 ml-10 mr-15 border border-borderColor rounded-lg">
      {/* 標題區域骨架 */}
      <div className="flex items-center justify-between mb-6">
        <div className="h-9 w-28 bg-gray-200 rounded animate-pulse"></div>
        <div className="h-4 w-24 bg-gray-200 rounded animate-pulse"></div>
      </div>

      {/* 手機版卡片骨架 */}
      <div className="grid grid-cols-1 sm:grid-cols-2 gap-4 lg:hidden">
        {[...Array(4)].map((_, index) => (
          <div
            key={index}
            className="flex flex-col items-center justify-center border p-4 rounded-lg shadow-md"
          >
            {/* 刪除按鈕骨架 */}
            <div className="absolute top-2 right-2">
              <div className="w-8 h-8 bg-gray-200 rounded animate-pulse"></div>
            </div>

            {/* 圖片骨架 */}
            <div className="w-full h-48 mb-4 bg-gray-200 rounded-md animate-pulse"></div>

            {/* 商品名稱骨架 */}
            <div className="h-5 w-3/4 bg-gray-200 rounded animate-pulse mb-2"></div>

            {/* 價格骨架 */}
            <div className="h-5 w-20 bg-gray-200 rounded animate-pulse mb-3"></div>

            {/* 按鈕骨架 */}
            <div className="w-full mt-2 h-10 bg-gray-200 rounded-md animate-pulse"></div>
          </div>
        ))}
      </div>

      {/* 桌面版表格骨架 */}
      <div className="hidden lg:block">
        <table className="min-w-full table-auto border-collapse">
          <thead>
            <tr className="border-b">
              <th className="p-4 text-center w-16">
                <div className="h-4 w-8 bg-gray-200 rounded animate-pulse mx-auto"></div>
              </th>
              <th className="p-4 text-center w-32">
                <div className="h-4 w-10 bg-gray-200 rounded animate-pulse mx-auto"></div>
              </th>
              <th className="p-4 text-left">
                <div className="h-4 w-20 bg-gray-200 rounded animate-pulse"></div>
              </th>
              <th className="p-4 text-center w-32">
                <div className="h-4 w-12 bg-gray-200 rounded animate-pulse mx-auto"></div>
              </th>
            </tr>
          </thead>
          <tbody>
            {[...Array(5)].map((_, index) => (
              <tr key={index} className="border-t">
                <td className="p-4 text-center">
                  <div className="w-8 h-8 bg-gray-200 rounded-md animate-pulse mx-auto"></div>
                </td>
                <td className="p-4 flex justify-center">
                  <div className="w-24 h-24 bg-gray-200 rounded-md animate-pulse"></div>
                </td>
                <td className="p-4">
                  <div className="h-5 w-48 bg-gray-200 rounded animate-pulse"></div>
                </td>
                <td className="p-4 text-center">
                  <div className="h-5 w-20 bg-gray-200 rounded animate-pulse mx-auto"></div>
                </td>
                <td className="p-4 text-center">
                  <div className="w-28 h-10 bg-gray-200 rounded-md animate-pulse mx-auto"></div>
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>

      {/* 底部操作按鈕骨架 */}
      <div className="mt-8 flex justify-between items-center w-full">
        <div className="flex w-full justify-between lg:justify-end">
          <div className="w-24 h-12 bg-gray-200 rounded-lg animate-pulse mr-4 lg:mr-0"></div>
          <div className="w-36 h-12 bg-gray-200 rounded-lg animate-pulse lg:ml-4"></div>
        </div>
      </div>
    </div>
  );
}
