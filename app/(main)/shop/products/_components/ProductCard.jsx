import React, { useState, useEffect } from "react";
import { FaHeart } from "react-icons/fa";
import { CiStar } from "react-icons/ci";
import { TiStarFullOutline } from "react-icons/ti";
import Link from "next/link";
import { useFavorites } from "@/app/contexts/FavoriteContext";
import { toast } from "sonner";

import { useCart } from "@/hooks/use-cart";
import { useRouter } from "next/navigation";

import {
  AlertDialog,
  AlertDialogAction,
  AlertDialogCancel,
  AlertDialogContent,
  AlertDialogDescription,
  AlertDialogFooter,
  AlertDialogHeader,
  AlertDialogTitle,
  AlertDialogTrigger,
} from "@/app/components/ui/cart-alert-dialog";

const ProductCard = ({ product }) => {
  const { average_rating, total_reviews, id: productId } = product;

  // 購物車
  const { addItem } = useCart();
  const [quantity, setQuantity] = useState(1);
  const router = useRouter();

  const renderRating = () => {
    if (total_reviews > 0) {
      const averageRating = Number(average_rating);

      return (
        <div className="flex items-center mt-2">
          <span className="text-yellow-400 flex">
            {[1, 2, 3, 4, 5].map((i) =>
              averageRating >= i ? (
                <TiStarFullOutline key={i} className="text-yellow-400" />
              ) : (
                <CiStar key={i} className="text-gray-400" />
              )
            )}
          </span>
          <span className="text-gray-500 ml-2">
            ({averageRating.toFixed(1)})
          </span>
          <p className="text-xs text-gray-500 ml-1">{total_reviews} 則評論</p>
        </div>
      );
    }

    return <p className="text-sm text-gray-400 mt-2">尚無評價</p>;
  };

  // 處理數量增減
  const handleDecrease = () => {
    setQuantity((prev) => Math.max(1, prev - 1)); // 最小為 1
  };

  const handleIncrease = () => {
    setQuantity((prev) => prev + 1);
  };

  // 新增立即購買函數
  const handleBuyNow = async () => {
    try {
      const token = localStorage.getItem("token");

      if (!token) {
        toast.error("請先登入會員後再進行操作！");
        return;
      }

      // 加入商品到購物車
      await addItem({
        product_id: productId,
      });

      // 直接導向結帳頁面
      router.push("/shop/cart");
    } catch (error) {
      console.error("立即購買失敗:", error);
      alert("購買過程發生錯誤，請稍後再試");
    }
  };

  const [imageError, setImageError] = useState(false);

  // 使用收藏 Context
  const { isFavorite, toggleFavorite, getFavoritesArray } = useFavorites();
  const [isToggling, setIsToggling] = useState(false);

  // 除錯：監控收藏狀態變化
  // useEffect(() => {
  //   console.log(`ProductCard ${productId} 收藏狀態更新:`, {
  //     productId,
  //     isFavorite: isFavorite(productId),
  //     allFavorites: getFavoritesArray(),
  //   });
  // }, [productId, isFavorite, getFavoritesArray]);

  // 處理資料庫圖片路徑 - 取第一張圖片
  const getProductImage = () => {
    if (!product?.image_url) {
      return null;
    }

    // 分割圖片字串，取第一張圖片
    const firstImage = product.image_url.split(",")[0].trim();

    return `/images/products/${firstImage}`;
  };

  const productImage = getProductImage();

  // 處理圖片載入錯誤
  const handleImageError = () => {
    console.error("圖片載入失敗:", productImage);
    setImageError(true);
  };

  // 將商品描述以換行符號分割成陣列
  const productDescription = product.description?.split("\n") || [];

  // 處理收藏按鈕點擊
  const handleFavoriteClick = async (e) => {
    e.preventDefault(); // 防止觸發 Link 導航
    e.stopPropagation(); // 防止事件冒泡

    const token = localStorage.getItem("token");

    if (!token) {
      toast.error("請先登入以使用收藏功能");
      return;
    }

    // console.log(`ProductCard ${productId} 收藏按鈕被點擊`);
    // console.log("點擊前的狀態:", {
    //   productId,
    //   isCurrentlyFavorite: isFavorite(productId),
    //   allFavorites: getFavoritesArray(),
    // });

    setIsToggling(true);
    try {
      const success = await toggleFavorite(productId);
      // console.log(`ProductCard ${productId} 收藏操作結果:`, success);
      // console.log("操作後的狀態:", {
      //   productId,
      //   isNowFavorite: isFavorite(productId),
      //   allFavorites: getFavoritesArray(),
      // });

      if (!success) {
        console.error(`ProductCard ${productId} 收藏操作失敗`);
      }
    } catch (error) {
      console.error(`ProductCard ${productId} 收藏操作錯誤:`, error);
    } finally {
      setIsToggling(false);
    }
  };

  // 從 Context 取得收藏狀態
  const isProductFavorite = isFavorite(productId);

  // console.log(`ProductCard ${productId} 渲染:`, {
  //   productId,
  //   isProductFavorite,
  //   isToggling,
  //   productName: product?.name,
  // });

  return (
    <div className="relative flex flex-col py-4 group cursor-pointer min-h-[400px]">
      {/* 產品狀態 */}
      <div className="relative ">
        {/* 標籤和愛心 */}
        <div className="absolute top-2 left-0 right-0 flex justify-between items-center px-4 z-10">
          <span className="bg-neutral-100 text-[#A9BA5C] px-2 py-1 rounded-sm text-md font-semibold">
            Hot
          </span>

          {/* 收藏按鈕  */}
          <button
            onClick={handleFavoriteClick}
            disabled={isToggling}
            className={`p-1 transition-all duration-200 ${
              isProductFavorite
                ? "text-[#AFC16D]"
                : "text-gray-600 hover:text-[#AFC16D]"
            } ${
              isToggling ? "opacity-50 cursor-not-allowed" : "cursor-pointer"
            }`}
            title={isProductFavorite ? "取消收藏" : "加入收藏"}
          >
            <FaHeart
              className={`h-5 w-5 transition-colors ${
                isProductFavorite ? "text-[#AFC16D]" : ""
              }`}
            />
          </button>
        </div>

        {/* 產品圖片 */}
        <Link href={`products/${productId}`} passHref>
          <div className="bg-gray-200 rounded-md relative cursor-pointer aspect-square overflow-hidden">
            {productImage && !imageError ? (
              <img
                src={productImage}
                alt={product.name || "商品圖片"}
                className="w-full h-full object-cover rounded-md transition-transform duration-300 ease-in-out group-hover:scale-110"
                onError={handleImageError}
                // onLoad={() => console.log("圖片載入成功:", productImage)}
              />
            ) : (
              // 當沒有圖片或圖片載入失敗時的佔位符
              <div className="w-full h-full flex items-center justify-center bg-gray-200 rounded-md">
                <div className="text-center">
                  <p className="text-gray-500 text-sm">暫無圖片</p>
                </div>
              </div>
            )}
          </div>
        </Link>

        {/* 桌面版加入購物車按鈕 */}
        <div className="hidden lg:block">
          <AlertDialog>
            <AlertDialogTrigger
              variant="addToCart"
              className="absolute rounded-b-md rounded-t-none bottom-0 left-0 w-full py-4 bg-[#A9BA5C] text-white opacity-0 hidden group-hover:opacity-100 transition-opacity duration-300 lg:block cursor-pointer h-15"
            >
              加入購物車
            </AlertDialogTrigger>

            <AlertDialogContent className="sm:w-xl md:w-3xl w-3/5 p-10 max-h-[80vh] overflow-y-auto text-left">
              <AlertDialogTitle></AlertDialogTitle>
              <AlertDialogHeader className="relative">
                <AlertDialogCancel className="absolute -right-8 -top-8 cursor-pointer border-none !shadow-none hover:bg-white">
                  X
                </AlertDialogCancel>

                <AlertDialogDescription asChild>
                  <div className="flex m-3 flex-col md:flex-row">
                    {/* 產品圖片 */}
                    <div className="w-full mb-4 lg:w-1/2 lg:mb-0 lg:mr-6">
                      {productImage && !imageError ? (
                        <img
                          src={productImage}
                          alt={product.name || "商品圖片"}
                          className="w-full h-full object-cover rounded-md"
                          onError={handleImageError}
                          // onLoad={() =>
                          //   console.log("Dialog 圖片載入成功:", productImage)
                          // }
                        />
                      ) : (
                        // 當沒有圖片或圖片載入失敗時的佔位符
                        <div className="w-full aspect-square flex items-center justify-center bg-gray-200 rounded-md">
                          <div className="text-center">
                            <div className="text-gray-400 text-6xl mb-4">
                              📷
                            </div>
                            <p className="text-gray-500 text-lg">暫無圖片</p>
                          </div>
                        </div>
                      )}
                    </div>

                    {/* 產品文字 */}
                    <div className="w-full lg:w-1/2 text-left">
                      {/* 產品名稱 */}
                      <h2 className="font-semibold text-xl text-gray-800">
                        {product.name || "商品名稱"}
                      </h2>

                      {/* 產品描述 */}
                      <ul className="text-base text-gray-600 mt-4 list-disc pl-4 space-y-1">
                        {productDescription.length > 0 ? (
                          productDescription.map((item, index) => (
                            <li key={index}>{item}</li>
                          ))
                        ) : (
                          <li>暫無商品描述</li>
                        )}
                      </ul>

                      {/* 產品價格 */}
                      <div className="flex items-center mt-4">
                        <span className="text-lg text-gray-500 mr-2">
                          ${product.price || "0"}
                        </span>
                        {/* 收藏狀態指示 */}
                        {isProductFavorite && (
                          <span className="text-xs text-[#A9BA5C] font-medium ml-2 px-2 py-1 rounded  border border-[#A9BA5C]">
                            已收藏
                          </span>
                        )}
                      </div>

                      <div className="mt-2">
                        {/* 數量選擇 */}
                        <div className="py-3 flex justify-center items-center">
                          <button
                            onClick={handleDecrease}
                            className="text-lg font-semibold px-6 py-2 border border-gray-300 rounded-l-md hover:bg-gray-100 cursor-pointer"
                          >
                            −
                          </button>
                          <span className="text-lg font-semibold px-6 py-2 border-t border-b border-gray-300">
                            {quantity}
                          </span>
                          <button
                            onClick={handleIncrease}
                            className="text-lg font-semibold px-6 py-2 border border-gray-300 rounded-r-md hover:bg-gray-100 cursor-pointer"
                          >
                            +
                          </button>
                        </div>

                        {/* 按鈕 */}
                        <div className="flex gap-4 py-4 mt-2">
                          <button
                            onClick={() => {
                              const token = localStorage.getItem("token");

                              if (!token) {
                                toast.error("請先登入會員後再進行操作！");
                                return;
                              }

                              addItem({
                                product_id: productId,
                                quantity: quantity,
                              });
                            }}
                            className="flex-1 py-3 bg-black text-white rounded-lg text-lg font-medium hover:opacity-80 transition cursor-pointer"
                          >
                            加入購物車
                          </button>
                          <button
                            className="flex-1 py-3 text-white rounded-lg bg-[#A9BA5C] text-lg font-medium hover:opacity-80 transitioncursor-pointer cursor-pointer"
                            onClick={handleBuyNow}
                          >
                            立即購買
                          </button>
                        </div>

                        {/* Dialog 中的收藏按鈕 */}
                        <div className="flex justify-center mt-4">
                          <button
                            onClick={handleFavoriteClick}
                            disabled={isToggling}
                            className={`flex items-center gap-2 px-4 py-2 rounded-lg transition-all duration-200 ${
                              isProductFavorite
                                ? " text-[#AFC16D]"
                                : " text-gray-600 hover:text-[#AFC16D] "
                            } ${
                              isToggling
                                ? "opacity-50 cursor-not-allowed"
                                : "cursor-pointer"
                            }`}
                          >
                            <FaHeart
                              className={`h-4 w-4 ${
                                isProductFavorite ? "text-[#AFC16D]" : ""
                              }`}
                            />
                            <span className="text-sm font-medium">
                              {isToggling
                                ? "處理中..."
                                : isProductFavorite
                                ? "已收藏"
                                : "加入收藏清單"}
                            </span>
                          </button>
                        </div>
                      </div>
                    </div>
                  </div>
                </AlertDialogDescription>
              </AlertDialogHeader>
            </AlertDialogContent>
          </AlertDialog>
        </div>
      </div>

      {/* 產品名稱 */}
      <h3 className="text-lg font-medium text-gray-800 mt-4 line-clamp-2">
        {product.name || "商品名稱"}
      </h3>

      {/* 產品品牌 */}
      <p className="text-sm text-gray-600">{product.brand || "品牌"}</p>

      {/* 評價 */}
      {/* <div className="flex items-center mt-2">
        <span className="text-yellow-400 flex">
          <TiStarFullOutline className="text-yellow-400" />
          <TiStarFullOutline className="text-yellow-400" />
          <TiStarFullOutline className="text-yellow-400" />
          <TiStarFullOutline className="text-yellow-400" />
          <CiStar className="text-gray-600" />
        </span>
        <span className="text-gray-500 ml-2">(4.2)</span>
      </div> */}
      {renderRating()}

      {/* 產品價格和收藏狀態 */}
      <div className="mt-2 flex items-center justify-between">
        <span className="text-lg text-gray-500 mr-1">
          ${product.price || "0"}
        </span>

        {/* 收藏狀態指示 */}
        {isProductFavorite && (
          <span className="text-xs text-[#A9BA5C] font-medium px-2 py-1 rounded border border-[#A9BA5C]">
            已收藏
          </span>
        )}
      </div>

      {/* 手機版加入購物車按鈕，始終顯示在價格下方 */}
      <div>
        <AlertDialog className="px-5">
          <AlertDialogTrigger
            variant="addToCart"
            className="w-full mt-2 py-6 bg-[#A9BA5C] text-white lg:hidden rounded-none"
          >
            加入購物車
          </AlertDialogTrigger>

          <AlertDialogContent className="sm:w-lg md:w-3xl w-3/5 p-10 max-h-[80vh] overflow-y-auto text-left">
            <AlertDialogTitle></AlertDialogTitle>

            <AlertDialogHeader className="relative">
              <AlertDialogDescription asChild>
                <div className="relative">
                  <div className="flex m-3 flex-col md:flex-row">
                    {/* 產品圖片 */}
                    <div className="w-full mb-4 lg:w-1/2 lg:mb-0 lg:mr-6">
                      {productImage && !imageError ? (
                        <img
                          src={productImage}
                          alt={product.name || "商品圖片"}
                          className="w-full h-full object-cover rounded-md"
                          onError={handleImageError}
                        />
                      ) : (
                        <div className="w-full aspect-square flex items-center justify-center bg-gray-200 rounded-md">
                          <div className="text-center">
                            <div className="text-gray-400 text-6xl mb-4">
                              📷
                            </div>
                            <p className="text-gray-500 text-lg">暫無圖片</p>
                          </div>
                        </div>
                      )}
                    </div>

                    {/* 產品資訊 */}
                    <div className="w-full lg:w-1/2 text-left">
                      <h2 className="font-semibold text-xl text-gray-800">
                        {product.name || "商品名稱"}
                      </h2>

                      <ul className="text-base text-gray-600 mt-4 list-disc pl-4 space-y-1">
                        {productDescription.length > 0 ? (
                          productDescription.map((item, index) => (
                            <li key={index}>{item}</li>
                          ))
                        ) : (
                          <li>暫無商品描述</li>
                        )}
                      </ul>

                      <div className="flex items-center mt-4">
                        <span className="text-lg text-gray-500 mr-2">
                          ${product.price || "0"}
                        </span>
                        {isProductFavorite && (
                          <span className="text-xs text-[#A9BA5C] font-medium ml-2 px-2 py-1 rounded border border-[#A9BA5C]">
                            已收藏
                          </span>
                        )}
                      </div>

                      {/* 數量與按鈕 */}
                      <div className="mt-2">
                        <div className="py-3 flex justify-center items-center">
                          <button
                            onClick={handleDecrease}
                            className="text-lg font-semibold px-6 py-2 border border-gray-300 rounded-l-md hover:bg-gray-100 cursor-pointer"
                          >
                            −
                          </button>
                          <span className="text-lg font-semibold px-6 py-2 border-t border-b border-gray-300">
                            {quantity}
                          </span>
                          <button
                            onClick={handleIncrease}
                            className="text-lg font-semibold px-6 py-2 border border-gray-300 rounded-r-md hover:bg-gray-100 cursor-pointer"
                          >
                            +
                          </button>
                        </div>

                        <div className="flex gap-4 py-4 mt-2">
                          <button
                            onClick={() => {
                              const token = localStorage.getItem("token");
                              if (!token) {
                                toast.error("請先登入會員後再進行操作！");
                                return;
                              }

                              addItem({
                                product_id: productId,
                                quantity: quantity,
                              });
                            }}
                            className="flex-1 py-3 bg-black text-white rounded-lg text-lg font-medium hover:opacity-80 transition cursor-pointer"
                          >
                            加入購物車
                          </button>

                          <button
                            className="flex-1 py-3 text-white rounded-lg bg-[#A9BA5C] text-lg font-medium hover:opacity-80 transition cursor-pointer"
                            onClick={handleBuyNow}
                          >
                            立即購買
                          </button>
                        </div>

                        {/* 收藏按鈕 */}
                        <div className="flex justify-center mt-4">
                          <button
                            onClick={handleFavoriteClick}
                            disabled={isToggling}
                            className={`flex items-center gap-2 px-4 py-2 rounded-lg transition-all duration-200 ${
                              isProductFavorite
                                ? "bg-white text-[#AFC16D] border border-gray-200"
                                : "bg-gray-50 text-gray-600 hover:bg-white hover:text-[#AFC16D] border border-gray-200"
                            } ${
                              isToggling
                                ? "opacity-50 cursor-not-allowed"
                                : "cursor-pointer"
                            }`}
                          >
                            <FaHeart
                              className={`h-4 w-4 ${
                                isProductFavorite ? "text-[#AFC16D]" : ""
                              }`}
                            />
                            <span className="text-sm font-medium">
                              {isToggling
                                ? "處理中..."
                                : isProductFavorite
                                ? "已收藏"
                                : "加入收藏"}
                            </span>
                          </button>
                        </div>
                      </div>
                    </div>
                  </div>

                  {/* ✅ 包在外層 div 中的 AlertDialogCancel */}
                  <AlertDialogCancel className="absolute -right-8 -top-8 cursor-pointer border-none !shadow-none hover:bg-white">
                    X
                  </AlertDialogCancel>
                </div>
              </AlertDialogDescription>
            </AlertDialogHeader>
          </AlertDialogContent>
        </AlertDialog>
      </div>
    </div>
  );
};

export default ProductCard;
