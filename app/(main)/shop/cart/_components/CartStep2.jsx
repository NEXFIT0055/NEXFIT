"use client";

import { useState, useEffect } from "react";
import { useRouter } from "next/navigation";

import { useAuth } from "@/app/contexts/AuthContext";
import CartItem from "./CartItem";
import UiButton from "./UiButton";
import { useCart } from "@/hooks/use-cart";
import CssLoader from "./css-loader";
import Link from "next/link";
import { useShip711StoreOpener } from "../../checkout/_hooks/use-ship-711-store";
import { toast } from "sonner";

export default function CartStep2() {
  const { user } = useAuth();
  const router = useRouter();

  // 同步會員資料
  const handleSyncMemberData = () => {
    if (!user) {
      toast.error("請先登入會員");
      return;
    }

    const formattedPhone = user.phone?.replace(/-/g, "") || "";

    setCartFormData((prev) => ({
      ...prev,
      recipient_name: user.name || "",
      recipient_phone: formattedPhone,
      shipping_address: user.address || "",
    }));

    toast.success("已同步會員資料");
  };

  const { selectedItems, totalAmount, loading, clearSelectedItems } = useCart();

  const [userDiscounts, setUserDiscounts] = useState([]);
  const [selectedDiscount, setSelectedDiscount] = useState(null);
  const [discountValue, setDiscountValue] = useState(0);
  const [deliveryMethod, setDeliveryMethod] = useState("home_delivery");

  //動態判斷 API URL
  const getApiUrl = () => {
    if (typeof window !== "undefined") {
      return `${window.location.origin}/shop/checkout/api`;
    }

    if (process.env.NODE_ENV === "production") {
      return "https://nexfit-2vpb-dmv6wg9gm-nexfit0055s-projects.vercel.app/shop/checkout/api";
    }

    return "http://localhost:3000/shop/checkout/api";
  };

  const { store711, openWindow, closeWindow } = useShip711StoreOpener(
    getApiUrl(),
    { autoCloseMins: 3 }
  );

  //新增：門市選擇狀態
  const [selectedStore, setSelectedStore] = useState(null);
  const [storeInfo, setStoreInfo] = useState({
    store_id: "",
    store_name: "",
    store_address: "",
  });

  //監聽門市選擇變化
  useEffect(() => {
    // 監聽 postMessage 事件
    const handleMessage = (event) => {
      if (event.data && event.data.type === "7-11-store-selected") {
        const storeData = event.data.data;
        console.log("接收到門市選擇:", storeData);

        setSelectedStore(storeData);
        setStoreInfo({
          store_id: storeData.storeid,
          store_name: storeData.storename,
          store_address: storeData.storeaddress,
        });

        toast.success("門市選擇成功！");
      }
    };

    // 監聽 localStorage 變化
    const handleStorageChange = () => {
      try {
        const storeData = localStorage.getItem("store711");
        if (storeData) {
          const parsed = JSON.parse(storeData);
          if (parsed.storeid && parsed.storename) {
            setSelectedStore(parsed);
            setStoreInfo({
              store_id: parsed.storeid,
              store_name: parsed.storename,
              store_address: parsed.storeaddress,
            });
          }
        }
      } catch (error) {
        console.error("讀取門市資料失敗:", error);
      }
    };

    // 初始檢查現有的門市資料
    handleStorageChange();

    // 加入事件監聽器
    window.addEventListener("message", handleMessage);
    window.addEventListener("storage", handleStorageChange);

    // 每秒檢查一次 localStorage（備用方案）
    const interval = setInterval(handleStorageChange, 1000);

    return () => {
      window.removeEventListener("message", handleMessage);
      window.removeEventListener("storage", handleStorageChange);
      clearInterval(interval);
    };
  }, []);

  //使用當前選擇的門市資料
  const currentStore = selectedStore || store711;

  const [isSubmitting, setIsSubmitting] = useState(false);

  // 計算運費和總金額
  const deliveryFee =
    totalAmount >= 2000 ? 0 : deliveryMethod === "home_delivery" ? 120 : 80;

  const [cartFormData, setCartFormData] = useState({
    recipient_name: "",
    recipient_phone: "",
    shipping_address: "",
    payment_method: "",
    total: totalAmount,
    shipping_fee: deliveryFee,
    discount: "",
    payment_status: "pending",
  });

  // 更新表單欄位
  const cartFiledChanged = (e) => {
    const { name, value } = e.target;
    setCartFormData({ ...cartFormData, [name]: value });
  };

  // 取得優惠券
  useEffect(() => {
    async function fetchUserDiscounts() {
      try {
        const token = localStorage.getItem("token");

        const response = await fetch(`/api/user-discounts`, {
          headers: {
            Authorization: `Bearer ${token}`,
          },
        });
        const data = await response.json();
        if (data.success) {
          setUserDiscounts(data.data);
        } else {
          console.error("載入優惠券失敗:", data.message);
        }
      } catch (error) {
        console.error("API 請求錯誤:", error);
      }
    }

    if (user) {
      fetchUserDiscounts();
    }
  }, [user]);

  // 優惠券選擇
  const handleSelectDiscount = (e) => {
    const discountId = Number(e.target.value);
    setSelectedDiscount(discountId);

    const selected = userDiscounts.find((d) => d.id === discountId);
    if (selected) {
      const discountAmount =
        selected.discount_type === "percentage"
          ? (totalAmount * selected.discount_value) / 100
          : selected.discount_value;

      setDiscountValue(discountAmount);
      console.log("選擇的優惠券金額：", discountAmount);
    } else {
      setDiscountValue(0);
    }
  };

  // 監聽運費變更
  useEffect(() => {
    setCartFormData((prev) => ({
      ...prev,
      shipping_fee: deliveryFee,
    }));
  }, [deliveryFee, totalAmount, deliveryMethod]);

  // 提交訂單
  const onSubmit = async (e) => {
    e.preventDefault();

    const token = localStorage.getItem("token");

    if (!token) {
      toast.error("請先登入後再進行結帳");
      router.push("/");
      return;
    }

    if (!cartFormData.recipient_name) {
      toast.error("請填寫收件人姓名");
      return;
    }

    if (!cartFormData.recipient_phone) {
      toast.error("請填寫收件人手機號碼");
      return;
    }

    if (!/^09\d{8}$/.test(cartFormData.recipient_phone)) {
      toast.error("請輸入正確的手機號碼（例如：0912345678）");
      return;
    }

    //地址驗證
    if (deliveryMethod === "home_delivery" && !cartFormData.shipping_address) {
      toast.error("請填寫收件地址");
      return;
    }

    //超商驗證
    if (deliveryMethod === "store_pickup" && !currentStore?.storeid) {
      toast.error("請選擇超商門市");
      return;
    }

    if (!cartFormData.payment_method) {
      toast.error("請選擇付款方式");
      return;
    }

    setIsSubmitting(true);
    try {
      const finalTotal = totalAmount - discountValue + deliveryFee;

      const orderData = {
        recipient_name: cartFormData.recipient_name ?? "未知",
        recipient_phone: String(cartFormData.recipient_phone ?? "0000"),
        shipping_address: cartFormData.shipping_address || null,
        shipping_method: deliveryMethod ?? "home_delivery",
        shipping_status: "待出貨",
        payment_method: cartFormData.payment_method ?? "cash",
        payment_status: "pending",
        total: totalAmount ?? 0,
        discount: discountValue ?? 0,
        discount_id: selectedDiscount ?? null,
        shipping_fee: deliveryFee ?? 0,
        final_total: finalTotal ?? 0,
        items: selectedItems.map((item) => ({
          product_id: item.product_id ?? null,
          quantity: item.quantity ?? 1,
          price: parseFloat(item.price) ?? 0,
        })),
        store_id: currentStore?.storeid ?? null,
        store_name: currentStore?.storename ?? null,
        store_address: currentStore?.storeaddress ?? null,
      };

      // 過濾 undefined
      for (let key in orderData) {
        if (orderData[key] === undefined) {
          orderData[key] = null;
        }
      }

      const response = await fetch("/api/orders", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
          Authorization: `Bearer ${token}`,
        },
        body: JSON.stringify(orderData),
      });

      const result = await response.json();

      if (response.ok) {
        clearSelectedItems();
        localStorage.removeItem("store711");
        window.location.href = `${result.paymentUrl}`;
      } else {
        toast.error(`訂單建立失敗：${result.message}`);
      }
    } catch (error) {
      console.error("訂單建立失敗：", error);
      toast.error(`訂單建立失敗，請稍後再試`);
    } finally {
      setIsSubmitting(false);
    }
  };

  // 運送方式變更
  const handleDeliveryMethodChange = (e) => {
    const newMethod = e.target.value;
    setDeliveryMethod(newMethod);

    if (newMethod === "store_pickup") {
      setCartFormData((prev) => ({
        ...prev,
        shipping_address: "",
      }));
    } else {
      setStoreInfo({
        store_id: "",
        store_name: "",
        store_address: "",
      });
      localStorage.removeItem("store711");
      setSelectedStore(null);
    }
  };

  if (loading) {
    return (
      <div className="flex justify-center">
        <CssLoader />
      </div>
    );
  }

  return (
    <>
      <div className="flex flex-col lg:flex-row gap-16">
        {/* 商品資訊 */}
        <table className="w-full lg:w-2/3 text-center md:text-left border-separate border-spacing-y-6 self-start">
          <thead>
            <tr className="text-center">
              <th className="w-1/4 md:w-2/6 border-b border-[#4F4B4B] text-fontColor pb-4">
                商品
              </th>
              <th className="w-1/4 border-b border-[#4F4B4B] text-fontColor pb-4">
                價格
              </th>
              <th className="w-1/4 border-b border-[#4F4B4B] text-fontColor pb-4">
                數量
              </th>
            </tr>
          </thead>
          <tbody>
            {selectedItems.map((item) => {
              const imageList = item.image_url?.split(",") || [];
              const mainImage = imageList[0]?.trim();

              return (
                <CartItem
                  key={item.cartItemId}
                  item={item}
                  changeNum={false}
                  img={`/images/products/${mainImage}`}
                />
              );
            })}
          </tbody>
        </table>

        {/* 送貨資訊 */}
        <div className="lg:w-1/3 lg:border lg:border-[#4F4B4B] lg:p-8 rounded-xl">
          <form className="text-lg" onSubmit={onSubmit}>
            {/* 收件資訊 */}
            <div className="flex justify-between items-center">
              <p className="mb-4 text-[#AFC16D] text-lg border-b-2 border-[#AFC16D] pb-2 font-medium">
                收件資訊
              </p>
              <button
                type="button"
                onClick={handleSyncMemberData}
                className="text-sm text-[#333] hover:text-[#96a552] transition cursor-pointer"
              >
                同步會員資料
              </button>
            </div>

            <div className="mb-6">
              <label className="block mb-3" htmlFor="recipient_name">
                收件人姓名
                <span className="text-red-500 text-xl font-bold">*</span>
              </label>
              <input
                className="w-full bg-[#F5F5F5] py-2 pl-3 text-[#333] rounded-lg"
                type="text"
                name="recipient_name"
                id="recipient_name"
                value={cartFormData.recipient_name}
                onChange={cartFiledChanged}
              />
            </div>

            <div className="mb-10">
              <label className="block mb-3" htmlFor="recipient_phone">
                收件人手機號碼
                <span className="text-red-500 text-xl font-bold">*</span>
              </label>
              <input
                className="w-full bg-[#F5F5F5] py-2 pl-3 text-[#333] rounded-lg"
                type="text"
                name="recipient_phone"
                id="recipient_phone"
                value={cartFormData.recipient_phone}
                onChange={cartFiledChanged}
              />
            </div>

            {/* 運送方式 */}
            <div>
              <p className="block text-[#AFC16D] my-4 text-lg border-b-2 pb-2 font-medium border-[#AFC16D]">
                運送方式
              </p>

              <div className="flex gap-4 mb-4 text-[#333]">
                <div className="flex items-center gap-2">
                  <input
                    className="mr-2 accent-[#AFC16D] scale-150 cursor-pointer"
                    type="radio"
                    name="deliveryMethod"
                    id="store_pickup"
                    value="store_pickup"
                    onChange={handleDeliveryMethodChange}
                  />
                  <label htmlFor="store_pickup" className="cursor-pointer">
                    超商(7-Eleven) NT$80
                  </label>
                </div>

                <div className="flex items-center gap-2">
                  <input
                    className="mr-2 accent-[#AFC16D] scale-150 cursor-pointer"
                    type="radio"
                    name="deliveryMethod"
                    id="home_delivery"
                    value="home_delivery"
                    defaultChecked
                    onChange={(e) => setDeliveryMethod(e.target.value)}
                  />
                  <label htmlFor="home_delivery" className="cursor-pointer">
                    宅配 NT$120
                  </label>
                </div>
              </div>
            </div>

            {/*超商取貨區塊 - 顯示當前選擇的門市 */}
            {deliveryMethod === "store_pickup" && (
              <div className="flex flex-col">
                <UiButton
                  variant="gray"
                  otherClass="w-1/2 py-2 xl:py-2 rounded-xl"
                  onClick={(e) => {
                    e.preventDefault();
                    openWindow();
                  }}
                >
                  {currentStore?.storename ? "重新選擇門市" : "選擇門市"}
                </UiButton>

                <div className="mt-2 text-[#555]">
                  <p>
                    門市名稱：
                    {currentStore?.storename ||
                      storeInfo.store_name ||
                      "尚未選擇"}
                  </p>
                  <p>
                    門市地址：
                    {currentStore?.storeaddress ||
                      storeInfo.store_address ||
                      "尚未選擇"}
                  </p>
                  {(currentStore?.storeid || storeInfo.store_id) && (
                    <p className="text-[#7F9161]text-sm mt-1">已選擇門市</p>
                  )}
                  {!currentStore?.storeid && !storeInfo.store_id && (
                    <p className="text-red-500 text-sm mt-1">請選擇門市</p>
                  )}
                </div>
              </div>
            )}

            {deliveryMethod === "home_delivery" && (
              <div className="mb-6">
                <label className="block mb-3" htmlFor="shipping_address">
                  收件地址
                  <span className="text-red-500 text-xl font-bold">*</span>
                </label>
                <input
                  className="w-full bg-[#F5F5F5] py-2 pl-3 text-[#333] rounded-lg"
                  type="text"
                  name="shipping_address"
                  id="shipping_address"
                  value={cartFormData.shipping_address}
                  onChange={cartFiledChanged}
                />
              </div>
            )}

            {/* 付款方式 */}
            <p className="mt-6 mb-4 text-[#AFC16D] text-lg border-b-2 border-[#AFC16D] pb-2 font-medium">
              付款方式
            </p>

            <div className="mb-6">
              <select
                name="payment_method"
                className="w-full bg-[#F5F5F5] py-2 pl-3 text-[#333] rounded-lg"
                value={cartFormData.payment_method}
                onChange={cartFiledChanged}
              >
                <option value="" disabled>
                  請選擇付款方式
                </option>
                <option value="cash">貨到付款</option>
                <option value="ecpay">綠界金流付款（信用卡、行動支付）</option>
              </select>
            </div>

            {/* 優惠券 */}
            <p className="mt-6 mb-4 text-[#AFC16D] text-lg border-b-2 border-[#AFC16D] pb-2 font-medium">
              優惠券
            </p>

            <select
              name="discount_id"
              className="w-full bg-[#F5F5F5] py-2 pl-3 text-[#333] rounded-lg"
              value={selectedDiscount ?? ""}
              onChange={handleSelectDiscount}
            >
              <option value="">尚未選擇優惠券</option>
              {userDiscounts.map((discount) => (
                <option key={discount.id} value={discount.id}>
                  {discount.name} - {discount.discount_value}
                  {discount.discount_type === "元" }
                </option>
              ))}
            </select>

            {/* 金額計算 */}
            <div className="flex justify-center">
              <div className="flex flex-col gap-12 text-lg w-full mt-16">
                <div className="flex justify-between">
                  <span>小計</span>
                  <span>NT${totalAmount.toLocaleString()}</span>
                </div>
                <div className="flex justify-between">
                  <span>運費</span>
                  <span>NT${deliveryFee}</span>
                </div>
                <div className="flex justify-between">
                  <span>優惠券折扣</span>
                  <span>-NT${discountValue}</span>
                </div>
                <div className="flex justify-between font-bold">
                  <span>總計</span>
                  <span>
                    NT$
                    {(
                      totalAmount +
                      deliveryFee -
                      discountValue
                    ).toLocaleString()}
                  </span>
                </div>
                <UiButton variant="primary" otherClass="py-3 rounded-lg">
                  {isSubmitting ? "請稍後..." : "下單購買"}
                </UiButton>
              </div>
            </div>
          </form>
        </div>
      </div>

      <div className="text-lg mt-6">
        <Link href="/shop/cart">&lt; 返回上一頁</Link>
      </div>
    </>
  );
}
