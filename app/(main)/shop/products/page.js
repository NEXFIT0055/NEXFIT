// ProductsPage.js
"use client";

import { useEffect, useState, useTransition, useMemo, Suspense } from "react";
import { useRouter, useSearchParams } from "next/navigation";
import ProductCard from "./_components/ProductCard";
import ComponentsDropdownMenu from "./_components/DropdownMenu";
import ProductSkeleton from "./_components/ProductSkeleton";
import Pagination from "@/app/(forum)/forum/_components/Pagination";

// 分離 useSearchParams 邏輯
function SearchParamsHandler({ onParamsChange }) {
  const searchParams = useSearchParams();

  useEffect(() => {
    const page = searchParams.get("page");
    const category = searchParams.get("category");
    const search = searchParams.get("search");
    const sort = searchParams.get("sortBy");

    onParamsChange({
      page: page ? parseInt(page) : 1,
      category: category || "全部商品",
      search: search || "",
      sortBy: sort || "商品排序",
    });
  }, [searchParams, onParamsChange]);

  return null;
}

function ProductsContent() {
  const router = useRouter();
  const [isPending, startTransition] = useTransition();

  // 狀態管理
  const [selected, setSelected] = useState("全部商品");
  const [sortBy, setSortBy] = useState("商品排序");
  const [productsData, setProductsData] = useState([]);
  const [totalPages, setTotalPages] = useState(1);
  const [isLoading, setIsLoading] = useState(true);
  const [hasInitialLoad, setHasInitialLoad] = useState(false);
  const [searchTerm, setSearchTerm] = useState("");
  const [searchInput, setSearchInput] = useState(""); // 新增：輸入框的值
  const [isTransitioning, setIsTransitioning] = useState(false);
  const [currentPage, setCurrentPage] = useState(1);

  // 商品分類和排序選項
  const productList = [
    "全部商品",
    "活力酥脆脆點心",
    "水壺/搖搖杯",
    "高蛋白補給",
    "登山旅行裝備",
    "女性機能服飾",
    "男性機能服飾",
    "防曬專區",
    "球拍運動",
    "成人 / 兒童滑板車",
  ];

  const productSortOptions = [
    "商品排序",
    "上架時間：由新到舊",
    "上架時間：由舊到新",
    "價格：由高至低",
    "價格：由低至高",
  ];

  // 使用 useMemo 優化 key 生成，避免不必要的重新渲染
  const productGridKey = useMemo(() => {
    return `${selected}-${sortBy}-${searchTerm}`;
  }, [selected, sortBy, searchTerm]);

  // 統一的 URL 更新函數
  const updateUrlParams = (newParams) => {
    const params = new URLSearchParams();

    if (newParams.category && newParams.category !== "全部商品") {
      params.set("category", newParams.category);
    }
    if (newParams.search) {
      params.set("search", newParams.search);
    }
    if (newParams.sortBy && newParams.sortBy !== "商品排序") {
      params.set("sortBy", newParams.sortBy);
    }
    if (newParams.page && newParams.page > 1) {
      params.set("page", newParams.page.toString());
    }

    const newUrl = params.toString()
      ? `/shop/products?${params.toString()}`
      : "/shop/products";

    // 使用 startTransition 包裝 URL 更新，提供更順滑的過渡
    startTransition(() => {
      router.push(newUrl);
    });
  };

  // 處理 URL 參數變化
  const handleParamsChange = (params) => {
    let hasChanges = false;
    const updates = {};

    if (params.page !== currentPage) {
      updates.currentPage = params.page;
      hasChanges = true;
    }
    if (params.category !== selected) {
      updates.selected = params.category;
      hasChanges = true;
    }
    if (params.search !== searchTerm) {
      updates.searchTerm = params.search;
      updates.searchInput = params.search; // 同步更新輸入框
      hasChanges = true;
    }
    if (params.sortBy !== sortBy) {
      updates.sortBy = params.sortBy;
      hasChanges = true;
    }

    if (hasChanges) {
      // 同時更新所有變更的狀態
      if (updates.currentPage !== undefined)
        setCurrentPage(updates.currentPage);
      if (updates.selected !== undefined) setSelected(updates.selected);
      if (updates.searchTerm !== undefined) setSearchTerm(updates.searchTerm);
      if (updates.searchInput !== undefined)
        setSearchInput(updates.searchInput);
      if (updates.sortBy !== undefined) setSortBy(updates.sortBy);
    }
  };

  // 優化的分類選擇處理 - 修改：切換分類時清空搜尋
  const handleCategorySelect = (category) => {
    if (category === selected) return; // 避免重複選擇

    // 同時更新多個狀態，減少重新渲染次數
    setIsTransitioning(true);

    // 批量更新狀態 - 切換分類時清空搜尋
    Promise.resolve().then(() => {
      setSelected(category);
      setCurrentPage(1);
      setSearchInput(""); // 清空搜尋輸入框
      setSearchTerm(""); // 清空搜尋條件

      updateUrlParams({
        category,
        search: null, // 不傳遞搜尋條件
        sortBy: sortBy !== "商品排序" ? sortBy : null,
        page: 1,
      });
    });
  };

  // 處理搜尋輸入變化 - 新增：監聽輸入框變化
  const handleSearchInputChange = (e) => {
    const value = e.target.value;
    setSearchInput(value);

    // 如果輸入框被清空，自動清除搜尋條件
    if (value.trim() === "" && searchTerm !== "") {
      setIsTransitioning(true);
      setSearchTerm("");
      setCurrentPage(1);

      updateUrlParams({
        category: selected !== "全部商品" ? selected : null,
        search: null, // 清除搜尋條件
        sortBy: sortBy !== "商品排序" ? sortBy : null,
        page: 1,
      });
    }
  };

  // 優化的搜尋處理 - 改為手動觸發（Enter鍵）
  const handleSearch = () => {
    const trimmedTerm = searchInput.trim();
    if (trimmedTerm === searchTerm) return; // 避免重複搜尋

    setIsTransitioning(true);
    setSearchTerm(trimmedTerm);
    setCurrentPage(1);

    updateUrlParams({
      category: selected !== "全部商品" ? selected : null,
      search: trimmedTerm,
      sortBy: sortBy !== "商品排序" ? sortBy : null,
      page: 1,
    });
  };

  // 處理 Enter 鍵搜尋
  const handleSearchKeyPress = (e) => {
    if (e.key === "Enter") {
      handleSearch();
    }
  };

  // 清除搜尋 - 修改：清除時立即更新URL
  const handleClearSearch = () => {
    setSearchInput("");
    if (searchTerm) {
      setIsTransitioning(true);
      setSearchTerm("");
      setCurrentPage(1);

      updateUrlParams({
        category: selected !== "全部商品" ? selected : null,
        search: null,
        sortBy: sortBy !== "商品排序" ? sortBy : null,
        page: 1,
      });
    }
  };

  // 優化的排序選擇處理
  const handleSortSelect = (sortOption) => {
    if (sortOption === sortBy) return;

    setIsTransitioning(true);
    setSortBy(sortOption);
    setCurrentPage(1);

    updateUrlParams({
      category: selected !== "全部商品" ? selected : null,
      search: searchTerm,
      sortBy: sortOption !== "商品排序" ? sortOption : null,
      page: 1,
    });
  };

  // 頁面切換處理
  const handlePageChange = (newPage) => {
    if (newPage === currentPage) return;

    setCurrentPage(newPage);
    updateUrlParams({
      category: selected !== "全部商品" ? selected : null,
      search: searchTerm,
      sortBy: sortBy !== "商品排序" ? sortBy : null,
      page: newPage,
    });
  };

  // 商品數據獲取
  useEffect(() => {
    async function fetchProducts() {
      // 如果不是初次載入，使用較短的loading時間來改善體驗
      if (hasInitialLoad) {
        setIsTransitioning(true);
      } else {
        setIsLoading(true);
      }

      try {
        const params = new URLSearchParams();
        params.set("page", currentPage.toString());

        if (selected && selected !== "全部商品") {
          params.set("category", selected);
        }
        if (searchTerm) {
          params.set("search", searchTerm);
        }
        if (sortBy && sortBy !== "商品排序") {
          params.set("sortBy", sortBy);
        }

        const res = await fetch(`/api/products?${params.toString()}`);
        const data = await res.json();

        // 為了更順滑的過渡效果，稍微延遲數據更新
        if (hasInitialLoad && isTransitioning) {
          await new Promise((resolve) => setTimeout(resolve, 150));
        }

        setProductsData(data.rows || []);
        setTotalPages(data.totalPages || 1);
        setHasInitialLoad(true);
      } catch (error) {
        console.error("Failed to fetch products:", error);
        setHasInitialLoad(true);
      } finally {
        setIsLoading(false);
        setIsTransitioning(false);
      }
    }

    fetchProducts();
  }, [currentPage, selected, searchTerm, sortBy]);

  // 清理定時器
  useEffect(() => {
    // 組件卸載時的清理工作
    return () => {
      // 清理工作已移除，因為不再使用防抖
    };
  }, []);

  const shouldShowNoData =
    hasInitialLoad &&
    !isLoading &&
    !isTransitioning &&
    productsData.length === 0;

  return (
    <>
      <Suspense fallback={null}>
        <SearchParamsHandler onParamsChange={handleParamsChange} />
      </Suspense>

      {/*桌機版 */}
      <div className="mx-auto w-full hidden lg:block">
        <div className="flex flex-wrap md:flex-nowrap p-10">
          {/*左邊分類 */}
          <div className="flex-1 p-6">
            <div className="relative mb-4">
              <input
                type="text"
                placeholder="搜尋商品..."
                value={searchInput}
                onChange={handleSearchInputChange} // 修改：使用新的處理函數
                onKeyPress={handleSearchKeyPress}
                className="w-4/5 py-2 px-0 pr-8 border-b-2 border-gray-500 focus:outline-none focus:border-black transition-all duration-300"
              />
              {searchInput && (
                <button
                  onClick={handleClearSearch}
                  className="absolute right-0 top-1/2 transform -translate-y-1/2 text-gray-400 hover:text-gray-600 transition-colors duration-200 p-1"
                  title="清除搜尋"
                >
                  ✕
                </button>
              )}
            </div>
            <ul className="space-y-4">
              {productList.map((item, index) => (
                <li
                  key={index}
                  onClick={() => handleCategorySelect(item)}
                  className={`cursor-pointer text-lg font-semibold py-2 px-0 w-full transition-all duration-200 ease-out transform will-change-transform ${
                    selected === item
                      ? "text-[#A9BA5C] border-l-4 border-[#A9BA5C] pl-4 translate-x-1 bg-gradient-to-r from-[#A9BA5C]/8 to-transparent"
                      : "hover:text-[#A9BA5C] hover:translate-x-1 hover:pl-1"
                  }`}
                >
                  {item}
                </li>
              ))}
            </ul>
          </div>

          {/*右邊商品 */}
          <div className="flex-3 p-4">
            <div className="flex justify-between p-4">
              <div className="text-lg font-semibold">
                {selected === "全部商品" || !selected ? "全部商品" : selected}
                {searchTerm && (
                  <span className="text-sm text-gray-600 ml-2">
                    搜尋: "{searchTerm}"
                  </span>
                )}
              </div>
              <ComponentsDropdownMenu
                title="商品排序"
                options={productSortOptions}
                onSelect={handleSortSelect}
                selected={sortBy}
              />
            </div>

            {/* 商品卡片區塊 - 移除過渡動畫 */}
            <div key={productGridKey}>
              {isLoading ? (
                <ProductSkeleton count={6} variant="desktop" />
              ) : shouldShowNoData ? (
                <div className="text-center py-8">
                  <div className="text-gray-500 text-lg">
                    {searchTerm || (selected && selected !== "全部商品")
                      ? "找不到符合條件的商品"
                      : "暫無商品資料"}
                  </div>
                </div>
              ) : (
                <div className="grid grid-cols-2 sm:grid-cols-2 md:grid-cols-2 lg:grid-cols-3 gap-4">
                  {productsData.map((product) => (
                    <ProductCard
                      key={product.id}
                      product={product}
                      productId={product.id}
                    />
                  ))}
                </div>
              )}
            </div>

            {/* 分頁 */}
            {totalPages > 1 && (
              <div className="flex justify-center mt-4">
                <Pagination
                  totalPages={totalPages}
                  currentPage={currentPage}
                  onPageChange={handlePageChange}
                />
              </div>
            )}
          </div>
        </div>
      </div>

      {/* 手機版 */}
      <div className="flex justify-center w-full lg:hidden">
        <div className="p-8 w-full">
          {/* 手機版搜尋區塊 */}
          {/* <div className="mb-4">
            <div className="relative">
              <input
                type="text"
                placeholder="搜尋商品..."
                value={searchInput}
                onChange={handleSearchInputChange} // 修改：使用新的處理函數
                onKeyPress={handleSearchKeyPress}
                className="w-full py-2 px-3 pr-10 border border-gray-300 rounded-lg focus:outline-none focus:border-[#A9BA5C] transition-all duration-300"
              />
              {searchInput && (
                <button
                  onClick={handleClearSearch}
                  className="absolute right-3 top-1/2 transform -translate-y-1/2 text-gray-400 hover:text-gray-600 transition-colors duration-200"
                  title="清除"
                >
                  ✕
                </button>
              )}
            </div>
            {searchTerm && (
              <div className="mt-2 text-sm text-gray-600">
                搜尋結果: "{searchTerm}"
              </div>
            )}
          </div> */}

          <div className="pt-3 flex justify-center">
            <ComponentsDropdownMenu
              title="商品分類"
              options={productList}
              onSelect={handleCategorySelect}
              selected={selected}
            />
          </div>
          <div className="pt-3 flex justify-center">
            <ComponentsDropdownMenu
              title="商品排序"
              options={productSortOptions}
              onSelect={handleSortSelect}
              selected={sortBy}
            />
          </div>

          {/* 手機版商品卡片區塊 - 移除過渡動畫 */}
          <div key={productGridKey} className="mt-4">
            {isLoading ? (
              <ProductSkeleton count={4} variant="mobile" />
            ) : shouldShowNoData ? (
              <div className="text-center py-8">
                <div className="text-gray-500">
                  {searchTerm || (selected && selected !== "全部商品")
                    ? "找不到符合條件的商品"
                    : "暫無商品資料"}
                </div>
              </div>
            ) : (
              <div className="grid grid-cols-2 sm:grid-cols-2 md:grid-cols-3 gap-4">
                {productsData.map((product) => (
                  <ProductCard key={product.id} product={product} />
                ))}
              </div>
            )}
          </div>

          {/* 分頁 */}
          {totalPages > 1 && (
            <div className="flex justify-center mt-4">
              <Pagination
                totalPages={totalPages}
                currentPage={currentPage}
                onPageChange={handlePageChange}
              />
            </div>
          )}
        </div>
      </div>

      {/* 自定義 CSS 動畫 */}
      <style jsx>{`
        @keyframes slideInFromLeft {
          0% {
            transform: translateX(-5px);
            opacity: 0.9;
          }
          100% {
            transform: translateX(4px);
            opacity: 1;
          }
        }

        /* 優化硬體加速 */
        .category-item {
          backface-visibility: hidden;
          perspective: 1000px;
        }
      `}</style>
    </>
  );
}

export default function ProductsPage() {
  return (
    <Suspense fallback={<ProductSkeleton count={6} variant="desktop" />}>
      <ProductsContent />
    </Suspense>
  );
}
