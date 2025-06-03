const OrderDetailSkeleton = () => {
  return (
    <div className="p-10 w-full lg:w-4/5 h-full m-6 lg:mt-10 lg:ml-10 lg:mr-15 border border-borderColor rounded-lg animate-pulse">
      {/* 訂單訊息 */}
      <div className="flex justify-between">
        <div className="w-full sm:w-100">
          <div className="h-8 bg-gray-200 rounded w-64 mb-6"></div>

          <ul className="space-y-4">
            {[...Array(5)].map((_, index) => (
              <li key={index} className="flex items-center">
                <div className="w-35 h-6 bg-gray-200 rounded mr-4"></div>
                <div className="h-6 bg-gray-200 rounded w-48"></div>
              </li>
            ))}
          </ul>
        </div>

        <div className="hidden sm:block w-32 h-12 bg-gray-200 rounded"></div>
      </div>

      {/* 訂購商品 */}
      <div className="py-10 sm:px-4 border-y-2 my-5">
        <ul className="flex flex-col gap-8">
          {[...Array(2)].map((_, index) => (
            <li key={index} className="flex justify-between">
              <div className="sm:flex">
                {/* 商品圖片骨架 */}
                <div className="w-20 h-20 bg-gray-200 rounded mr-10"></div>

                <div className="flex sm:gap-30 mt-2">
                  <div className="sm:flex flex-col gap-6">
                    <div className="w-48 h-6 bg-gray-200 rounded mb-4"></div>
                    <div className="w-32 h-6 bg-gray-200 rounded"></div>
                  </div>
                  <div className="hidden sm:block w-24 h-6 bg-gray-200 rounded ml-8"></div>
                </div>
              </div>
            </li>
          ))}
        </ul>
      </div>

      {/* 運送資訊 */}
      <ul className="flex flex-col gap-4">
        {[...Array(4)].map((_, index) => (
          <li key={index} className="flex items-center">
            <div className="flex items-center w-30 mr-6">
              <div className="w-6 h-6 bg-gray-200 rounded-full mr-2"></div>
              <div className="w-24 h-6 bg-gray-200 rounded"></div>
            </div>
            <div className="flex-1 h-6 bg-gray-200 rounded"></div>
          </li>
        ))}
      </ul>
    </div>
  );
};

export default OrderDetailSkeleton;
