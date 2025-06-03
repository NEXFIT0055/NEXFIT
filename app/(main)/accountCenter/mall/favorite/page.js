"use client";

import { useState, useEffect } from "react";
import { useFavorites } from "@/app/contexts/FavoriteContext";
import { FaHeart } from "react-icons/fa";
import Link from "next/link";
import { toast } from "sonner";
import { useCart } from "@/hooks/use-cart";
import FavoritePageSkeleton from "../_components/FavoritePageSkeleton";

export default function FavoritePage() {
  const { addItem } = useCart();
  const { favorites, toggleFavorite, isLoading, getFavoritesArray } =
    useFavorites();
  const [favoriteProducts, setFavoriteProducts] = useState([]);
  const [productsLoading, setProductsLoading] = useState(false);
  const [isToggling, setIsToggling] = useState({});
  const [hasInitialLoad, setHasInitialLoad] = useState(false); // 新增狀態來追蹤是否已完成初始加載

  // 載入收藏商品的詳細資料
  useEffect(() => {
    loadFavoriteProducts();
  }, [favorites]);

  const loadFavoriteProducts = async () => {
    const favoriteIds = getFavoritesArray();

    if (favoriteIds.length === 0) {
      setFavoriteProducts([]);
      setHasInitialLoad(true); // 標記已完成初始加載
      return;
    }

    setProductsLoading(true);
    try {
      console.log("載入收藏商品詳細資料:", favoriteIds);

      // 為每個收藏的商品 ID 獲取詳細資料
      const productPromises = favoriteIds.map(async (productId) => {
        try {
          const response = await fetch(`/api/products/${productId}`);
          if (response.ok) {
            const result = await response.json();
            return result.data;
          } else {
            console.error(`獲取商品 ${productId} 失敗:`, response.status);
            return null;
          }
        } catch (error) {
          console.error(`獲取商品 ${productId} 錯誤:`, error);
          return null;
        }
      });

      const products = await Promise.all(productPromises);
      const validProducts = products.filter((product) => product !== null);

      console.log("載入的收藏商品:", validProducts);
      setFavoriteProducts(validProducts);
    } catch (error) {
      console.error("載入收藏商品失敗:", error);
    } finally {
      setProductsLoading(false);
      setHasInitialLoad(true); // 標記已完成初始加載
    }
  };

  // 處理加入購物車的邏輯
  const handleAddToCart = (item) => {
    addItem({
      product_id: item.id,
      quantity: 1,
    });
  };

  // 新增批量加入購物車函數
  const handleAddAllToCart = async () => {
    try {
      if (favoriteProducts.length === 0) {
        toast.error("沒有可加入購物車的商品");
        return;
      }

      await Promise.all(
        favoriteProducts.map((product) =>
          addItem({
            product_id: product.id,
            quantity: 1,
          })
        )
      );

      toast.success("已將所有收藏商品加入購物車！");
    } catch (error) {
      console.error("批量加入購物車失敗:", error);
      toast.error("加入購物車失敗，請稍後再試");
    }
  };

  // 移除收藏商品
  const handleRemoveFavorite = async (product) => {
    setIsToggling((prev) => ({ ...prev, [product.id]: true }));

    try {
      console.log("移除收藏商品:", product.id);
      const success = await toggleFavorite(product.id);

      if (success) {
        console.log("收藏移除成功");
      } else {
        console.error("移除收藏失敗");
        toast.error("移除收藏失敗，請稍後再試");
      }
    } catch (error) {
      console.error("移除收藏錯誤:", error);
      toast.error("移除收藏失敗，請稍後再試");
    } finally {
      setIsToggling((prev) => ({ ...prev, [product.id]: false }));
    }
  };

  // 取得商品圖片
  const getProductImage = (product) => {
    if (!product?.image_url) {
      return null;
    }
    const firstImage = product.image_url.split(",")[0].trim();
    return `/images/products/${firstImage}`;
  };

  // 檢查用戶是否已登入
  const token =
    typeof window !== "undefined" ? localStorage.getItem("token") : null;

  if (!token) {
    return (
      <div className="p-10 w-4/5 h-full mt-10 ml-10 mr-15 border border-borderColor rounded-lg">
        <h3 className="text-2xl md:text-3xl text-fontColor mb-6">收藏清單</h3>
        <div className="text-center py-20">
          <p className="text-gray-500 text-lg mb-4">請先登入以查看收藏清單</p>
          <Link
            href="/login"
            className="px-6 py-3 bg-[#A9BA5C] text-white rounded-lg hover:bg-[#96a552] transition-colors"
          >
            前往登入
          </Link>
        </div>
      </div>
    );
  }

  // 使用骨架屏組件 - 修改條件，只有在初始加載未完成或正在加載時才顯示骨架屏
  if (isLoading || productsLoading || !hasInitialLoad) {
    return <FavoritePageSkeleton />;
  }

  // 只有在完成初始加載且確實沒有收藏商品時才顯示空狀態
  if (hasInitialLoad && favoriteProducts.length === 0) {
    return (
      <div className="p-10 w-4/5 h-full mt-10 ml-10 mr-15 border border-borderColor rounded-lg">
        <h3 className="text-2xl md:text-3xl text-fontColor mb-6">收藏清單</h3>
        <div className="text-center py-20">
          <FaHeart className="h-16 w-16 text-gray-300 mx-auto mb-4" />
          <p className="text-gray-500 text-lg mb-4">您還沒有收藏任何商品</p>
          <Link
            href="/shop/products"
            className="px-6 py-3 bg-zinc-300 text-[#101828] rounded-lg hover:bg-[#A9BA5C] hover:text-white !hover:text-white transition-colors"
          >
            挑選商品去
          </Link>
        </div>
      </div>
    );
  }

  return (
    <div className="p-10 w-4/5 h-full mt-10 mx-10 border border-borderColor rounded-lg">
      <div className="flex items-center justify-between mb-6">
        <h3 className="text-2xl md:text-3xl text-fontColor">收藏清單</h3>
        <span className="text-sm text-gray-500">
          共 {favoriteProducts.length} 個商品
        </span>
      </div>

      {/* 手機版卡片 */}
      <div className="grid grid-cols-1 sm:grid-cols-2 gap-4 lg:hidden">
        {favoriteProducts.map((product) => {
          const productImage = getProductImage(product);
          const isRemoving = isToggling[product.id];

          return (
            <div
              key={product.id}
              className="flex flex-col items-center justify-center border p-4 rounded-lg shadow-md hover:shadow-lg transition-shadow duration-300 relative"
            >
              {/* 刪除收藏按鈕 */}
              <button
                onClick={() => handleRemoveFavorite(product)}
                disabled={isRemoving}
                className={`absolute top-0 text-xl p-2  font-medium rounded-md transition-all duration-300 ${
                  isRemoving
                    ? "text-gray-400 cursor-not-allowed"
                    : "text-gray-400 hover:text-[#101828] cursor-pointer"
                }`}
                title="移除收藏"
              >
                {isRemoving ? "..." : "×"}
              </button>

              {/* 商品圖片 */}
              <Link href={`/shop/products/${product.id}`}>
                <div className="w-full h-48 mb-4 cursor-pointer">
                  {productImage ? (
                    <img
                      src={productImage}
                      alt={product.name}
                      className="w-full h-full object-cover rounded-md"
                    />
                  ) : (
                    <div className="w-full h-full bg-gray-200 rounded-md flex items-center justify-center">
                      <span className="text-gray-400">無圖片</span>
                    </div>
                  )}
                </div>
              </Link>

              <h4 className="text-base font-semibold text-fontColor text-center mb-2">
                {product.name}
              </h4>
              <p className="text-base text-fontColor mb-3">
                NT$ {product.price}
              </p>

              <button
                onClick={() => handleAddToCart(product)}
                className="w-full mt-2 p-2 bg-[#F0F0F0] text-fontColor rounded-md hover:bg-[#A9BA5C] hover:text-white transition-all duration-300"
              >
                加入購物車
              </button>
            </div>
          );
        })}
      </div>

      {/* 桌面版表格 */}
      <div className="hidden lg:block">
        <table className="min-w-full table-auto border-collapse">
          <thead>
            <tr className="border-b">
              <th className="p-4 text-center w-16"></th>
              <th className="p-4 text-center w-32">圖片</th>
              <th className="p-4 text-left">商品名稱</th>
              <th className="p-4 text-center w-32">價格</th>
            </tr>
          </thead>
          <tbody>
            {favoriteProducts.map((product) => {
              const productImage = getProductImage(product);
              const isRemoving = isToggling[product.id];

              return (
                <tr
                  key={product.id}
                  className="border-t hover:bg-gray-50 transition-colors"
                >
                  <td className="p-4 text-center">
                    <button
                      onClick={() => handleRemoveFavorite(product)}
                      disabled={isRemoving}
                      className={`p-2 text-xl font-medium rounded-md transition-all duration-300 ${
                        isRemoving
                          ? "text-gray-400 cursor-not-allowed"
                          : "text-gray-400 hover:text-[#101828] cursor-pointer"
                      }`}
                      title="移除收藏"
                    >
                      {isRemoving ? "..." : "×"}
                    </button>
                  </td>

                  <td className="p-4 flex justify-center">
                    <Link href={`/shop/products/${product.id}`}>
                      <div className="w-24 h-24 cursor-pointer">
                        {productImage ? (
                          <img
                            src={productImage}
                            alt={product.name}
                            className="w-full h-full object-cover rounded-md hover:scale-105 transition-transform duration-300"
                          />
                        ) : (
                          <div className="w-full h-full bg-gray-200 rounded-md flex items-center justify-center">
                            <span className="text-gray-400 text-xs">
                              無圖片
                            </span>
                          </div>
                        )}
                      </div>
                    </Link>
                  </td>

                  <td className="p-4">
                    <Link
                      href={`/shop/products/${product.id}`}
                      className="hover:text-[#A9BA5C] transition-colors"
                    >
                      {product.name}
                    </Link>
                  </td>

                  <td className="p-4 text-center font-semibold">
                    NT$ {product.price}
                  </td>

                  <td className="p-4 text-center">
                    <button
                      onClick={() => handleAddToCart(product)}
                      className="px-4 py-2 bg-[#F0F0F0] text-fontColor rounded-md hover:bg-[#A9BA5C] hover:text-white transition-all duration-300 cursor-pointer"
                    >
                      加入購物車
                    </button>
                  </td>
                </tr>
              );
            })}
          </tbody>
        </table>
      </div>

      {/* 底部操作按鈕 */}
      <div className="mt-8 flex justify-between items-center w-full">
        <div className="flex w-full justify-between lg:justify-end">
          <Link
            href="/shop/products"
            className="px-6 py-3 border bg-[#101828] text-[#FBF9FA] rounded-lg hover:opacity-90 transition-colors mr-4 lg:mr-0"
          >
            繼續購物
          </Link>
          <button
            onClick={handleAddAllToCart}
            className="px-6 py-3 bg-[#F0F0F0] text-fontColor rounded-lg hover:bg-[#A9BA5C] hover:text-white transition-colors lg:ml-4 cursor-pointer"
          >
            全部加入購物車
          </button>
        </div>
      </div>
    </div>
  );
}
