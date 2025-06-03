"use client";

import { useEffect, useState } from "react";
import { FaHeart } from "react-icons/fa";
import { useParams } from "next/navigation";
import ProductDetailSkeleton from "../_components/ProductDetailSkeleton";
import { useFavorites } from "@/app/contexts/FavoriteContext";
import { toast } from "sonner";

import { useCart } from "@/hooks/use-cart";
import { useRouter } from "next/navigation";

import ProductComment from "../_components/ProductComment";
import { TiStarFullOutline } from "react-icons/ti";
import { CiStar } from "react-icons/ci";

export default function ProductDetailPage() {
  const tabs = ["商品描述", "送貨及付款方式", "顧客評價"];
  const [activeTab, setActiveTab] = useState("商品描述");
  const [productDetail, setProductDetail] = useState(null);
  const [currentImage, setCurrentImage] = useState(null);
  const [isLoading, setIsLoading] = useState(true);

  const router = useRouter();

  // 取得評分
  const [commentData, setCommentData] = useState({
    comments: [],
    stats: { average_rating: 0, total_reviews: 0 },
  });

  async function fetchCommentStats() {
    try {
      const res = await fetch(`/api/comments?product_id=${productId}`);
      const result = await res.json();
      setCommentData(result);
    } catch (error) {
      console.error("評論統計抓取失敗:", error);
    }
  }

  // 購物車
  const { addItem } = useCart();
  const [quantity, setQuantity] = useState(1);

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

  const params = useParams();
  const productId = params.productId;

  const { isFavorite, toggleFavorite } = useFavorites();
  const [favoriteLoading, setFavoriteLoading] = useState(false);

  console.log("Product ID:", productId);

  const productImages = productDetail?.image_url
    ? productDetail.image_url
        .split(",")
        .map((img) => img.trim())
        .filter((img) => img)
        .map((img) => `/images/products/${img}`)
    : [];

  const productDescription = productDetail?.description?.split("\n");

  useEffect(() => {
    fetchProductDetail();
    fetchCommentStats();
  }, [productId]);

  async function fetchProductDetail() {
    try {
      setIsLoading(true);

      const res = await fetch(`/api/products/${productId}`);
      const result = await res.json();
      console.log("Product Detail:", result);

      setProductDetail(result.data);

      if (result.data?.image_url) {
        const firstImage = `/images/products/${result.data.image_url
          .split(",")[0]
          .trim()}`;
        setCurrentImage(firstImage);
      }
    } catch (error) {
      console.error("Error fetching product detail:", error);
    } finally {
      setIsLoading(false);
    }
  }

  const handleToggleFavorite = async () => {
    const token = localStorage.getItem("token");

    if (!token) {
      toast.error("請先登入以使用收藏功能");
      return;
    }

    setFavoriteLoading(true);
    try {
      const success = await toggleFavorite(productId);
      if (!success) {
        console.error("收藏操作失敗");
      }
    } catch (error) {
      console.error("收藏操作錯誤:", error);
    } finally {
      setFavoriteLoading(false);
    }
  };

  const handleThumbnailClick = (imageSrc) => {
    setCurrentImage(imageSrc);
  };

  if (isLoading) {
    return <ProductDetailSkeleton />;
  }

  // 從 Context 取得收藏狀態
  const isProductFavorite = isFavorite(productId);

  return (
    <>
      <div className="mx-auto w-full">
        {/* 上方 */}
        <div className="mx-4 py-8">
          <div className="max-w-5xl mx-auto flex flex-col md:flex-row">
            {/* 圖片區 */}
            <div className="p-5 md:w-1/2">
              {/* 大圖 */}
              <div className="w-full aspect-square rounded-2xl overflow-hidden bg-gray-100">
                {currentImage ? (
                  <img
                    src={currentImage}
                    alt={productDetail?.name}
                    className="w-full h-full object-cover"
                  />
                ) : (
                  <div className="w-full h-full flex items-center justify-center">
                    <p className="text-gray-500"></p>
                  </div>
                )}
              </div>

              {/* 小縮圖列 */}
              <div className="flex pt-4 gap-2 flex-wrap">
                {productImages.length > 0 ? (
                  productImages.map((image, index) => (
                    <div
                      key={index}
                      className={`w-28 h-28 rounded-2xl overflow-hidden cursor-pointer ${
                        currentImage === image ? "ring-2 ring-[#A9BA5C]" : ""
                      }`}
                      onClick={() => handleThumbnailClick(image)}
                    >
                      <img
                        src={image}
                        alt={`${productDetail?.name} 小圖${index + 1}`}
                        className="w-full h-full object-cover"
                      />
                    </div>
                  ))
                ) : (
                  <p className="text-sm text-gray-500"></p>
                )}
              </div>
            </div>

            {/* 商品資訊區 */}
            <div className="p-6 mt-1 md:w-1/2">
              <h2 className="text-xl font-bold">{productDetail?.name || ""}</h2>
              <ul className="text-sm leading-relaxed list-disc pl-5 pt-2 space-y-1 text-gray-700">
                {productDescription?.map((item, index) => (
                  <li key={index}>{item}</li>
                ))}
              </ul>
              <div className="h-px bg-gray-600 my-4 w-full " />
              <p className="text-base font-semibold pt-1 text-[#A9BA5C]">
                滿2000：享台灣地區免運優惠
              </p>
              {/* 產品價格 */}
              <div className="mt-2">
                <span className="text-lg text-gray-500 mr-1">
                  ${productDetail?.price}
                </span>
              </div>
              {/* 評論區 */}
              {/* <div className="flex items-center space-x-2 text-sm pt-2">
                <div className="text-yellow-500 font-medium">★★★★★</div>
                <div className="text-gray-600 font-medium">
                  5.0 分 ｜ 255 評論
                </div>
              </div> */}
              {commentData.stats.total_reviews > 0 ? (
                <div className="flex items-center space-x-2 text-sm pt-2">
                  <div className="text-yellow-500 font-medium flex">
                    {[1, 2, 3, 4, 5].map((i) =>
                      commentData.stats.average_rating >= i ? (
                        <TiStarFullOutline key={i} className="w-5 h-5" />
                      ) : (
                        <CiStar key={i} className="w-5 h-5 text-gray-400" />
                      )
                    )}
                  </div>
                  <div className="text-gray-600 font-medium">
                    {commentData.stats.average_rating} 分 ｜{" "}
                    {commentData.stats.total_reviews} 評論
                  </div>
                </div>
              ) : (
                <div className="text-gray-500 text-sm pt-2">
                  尚無評論，歡迎成為第一位評論者！
                </div>
              )}

              <div className="text-center">
                <div className="my-5">
                  <button
                    className="text-lg font-semibold px-4 py-2 cursor-pointer hover:bg-zinc-100 transition rounded-full"
                    onClick={handleDecrease}
                  >
                    −
                  </button>
                  <span className="font-semibold mx-6">{quantity}</span>
                  <button
                    className="text-lg font-semibold px-4 py-2 cursor-pointer hover:bg-zinc-100 transition rounded-full"
                    onClick={handleIncrease}
                  >
                    +
                  </button>
                </div>

                {/* 按鈕 */}
                <div className="flex gap-4 py-2">
                  <button
                    className="flex-1 py-2 bg-black text-white rounded-lg cursor-pointer hover:opacity-80 transition"
                    onClick={() => {
                      addItem({
                        product_id: productId,
                        quantity: quantity,
                      });
                    }}
                  >
                    加入購物車
                  </button>
                  <button
                    className="flex-1 py-2 text-white rounded-lg bg-[#A9BA5C] cursor-pointer hover:opacity-80 transition"
                    onClick={handleBuyNow}
                  >
                    立即購買
                  </button>
                </div>

                {/* 加入收藏清單 */}
                <button
                  className={`flex items-center justify-center text-sm font-bold py-4 w-full cursor-pointer transition-colors ${
                    isProductFavorite
                      ? "text-[#A9BA5C]"
                      : "text-gray-600 hover:text-[#A9BA5C]"
                  } ${favoriteLoading ? "opacity-50 cursor-not-allowed" : ""}`}
                  onClick={handleToggleFavorite}
                  disabled={favoriteLoading}
                >
                  <FaHeart
                    className={`h-4 w-4 mr-1 transition-colors ${
                      isProductFavorite
                        ? "text-[#A9BA5C]"
                        : "text-gray-600 hover:text-[#A9BA5C]"
                    }`}
                  />
                  {favoriteLoading
                    ? "處理中..."
                    : isProductFavorite
                    ? "已收藏"
                    : "加入收藏清單"}
                </button>
              </div>
            </div>
          </div>
        </div>

        {/* 下方 */}
        <div className="pt-8 px-4  md:mx-24">
          {/* Tabs */}
          <div className="flex justify-between text-center mx-8">
            {tabs.map((tab) => (
              <button
                key={tab}
                className={`px-4 py-2 font-medium ${
                  activeTab === tab ? "border-b-3 text-black" : "text-gray-500"
                } cursor-pointer`}
                style={{
                  borderBottomColor:
                    activeTab === tab ? "#A9BA5C" : "transparent",
                }}
                onClick={() => setActiveTab(tab)}
              >
                {tab}
              </button>
            ))}
          </div>

          {/* Tab Contents */}
          <div className="mt-8 text-center">
            {activeTab === "商品描述" && (
              <div className="text-left max-w-4xl mx-auto">
                {/* 商品描述文字 */}
                {productDescription && productDescription.length > 0 && (
                  <div className="mb-5">
                    <h3 className="text-lg font-semibold mb-4 text-center">
                      商品特色
                    </h3>
                    <div className="text-center font-normal text-sm mt-3">
                      {productDescription.map((item, index) => (
                        <p key={index} className=" leading-relaxed">
                          {item}
                        </p>
                      ))}
                    </div>
                  </div>
                )}

                {/* 商品圖片展示 */}
                {productImages && productImages.length > 0 && (
                  <div>
                    <div className="grid grid-cols-1 max-w-2xl mx-auto">
                      {productImages.map((image, index) => (
                        <div
                          key={index}
                          className="w-full aspect-square rounded-lg overflow-hidden bg-gray-100 mb-4"
                        >
                          <img
                            src={image}
                            alt={`${productDetail?.name} 詳細圖片 ${index + 1}`}
                            className="w-full h-full object-cover"
                          />
                        </div>
                      ))}
                    </div>
                  </div>
                )}

                {/* 如果沒有資料的提示 */}
                {(!productDescription || productDescription.length === 0) &&
                  (!productImages || productImages.length === 0) && (
                    <div className="text-center text-gray-500 py-8">
                      <p>暫無商品詳細資訊</p>
                    </div>
                  )}
              </div>
            )}
            {activeTab === "送貨及付款方式" && (
              <div className="text-center font-normal text-sm mt-3">
                {/* <p className=" font-medium"></p> */}
                <h3 className="text-lg font-semibold mb-4 text-center">
                  送貨方式
                </h3>
                <p>送貨地區： 台灣地區</p>
                <p>送貨時間： 3-5個工作天</p>
                <p>7-11 │ 超商取貨</p>
                <p>黑貓 │ 宅配到府</p>
                <p>滿2000即享免運</p>

                <h3 className="text-lg font-semibold m-4 text-center">
                  付款方式
                </h3>
                <p>信用卡</p>
                <p>7-11 │ 取貨付款</p>
                <p>宅配 │ 貨到付款</p>
              </div>
            )}
            {activeTab === "顧客評價" && (
              <ProductComment productId={productId} />
            )}
          </div>
        </div>
      </div>
    </>
  );
}
