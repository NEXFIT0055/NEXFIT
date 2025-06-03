"use client";

import { useState, useEffect, use } from "react";

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

  // 同步會員資料
  const handleSyncMemberData = () => {
    if (!user) {
      toast.error("請先登入會員");
      return;
    }

    // 移除手機號碼中的破折號
    const formattedPhone = user.phone?.replace(/-/g, "") || "";

    setCartFormData((prev) => ({
      ...prev,
      recipient_name: user.name || "",
      recipient_phone: formattedPhone,
      shipping_address: user.address || "",
    }));

    toast.success("已同步會員資料");
  };

  // const [memberData, setMemberData] = useState(null);

  // useEffect(() => {
  //   if (user) {
  //     setMemberData(user);
  //   }
  // }, [user]);

  const { selectedItems, totalAmount, loading, clearSelectedItems } = useCart();

  const [userDiscounts, setUserDiscounts] = useState([]);
  const [selectedDiscount, setSelectedDiscount] = useState(null); // 會設為折扣卷 ID
  const [discountValue, setDiscountValue] = useState(0);

  const [deliveryMethod, setDeliveryMethod] = useState("home_delivery"); // 預設宅配

  // useShip711StoreOpener的第一個傳入參數是"伺服器7-11運送商店用Callback路由網址"
  // 指的是node(express)的對應api路由。詳情請見說明文件:
  const { store711, openWindow, closeWindow } = useShip711StoreOpener(
    `http://localhost:3000/shop/checkout/api`, // 直接用Next提供的api路由
    //`${apiUrl}/shipment/711`, // 也可以用express伺服器的api路由
    { autoCloseMins: 3 } // x分鐘沒完成選擇會自動關閉，預設5分鐘。
  );

  const [storeInfo, setStoreInfo] = useState({
    store_id: "",
    store_name: "",
    store_address: "",
  });

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

  // 取得該位用戶目前有的優惠卷
  useEffect(() => {
    async function fetchUserDiscounts() {
      try {
        const token = localStorage.getItem("token"); // 從 localStorage 取得 JWT

        const response = await fetch(`/api/user-discounts`, {
          headers: {
            Authorization: `Bearer ${token}`, // 附加 JWT
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

    fetchUserDiscounts();
  }, [cartFormData.user_id]);

  // 當選擇優惠券時更新金額
  const handleSelectDiscount = (e) => {
    const discountId = Number(e.target.value);
    setSelectedDiscount(discountId);

    // 根據選中的優惠券 ID 找出對應的金額
    const selected = userDiscounts.find((d) => d.id === discountId);
    if (selected) {
      // 判斷是否為百分比折扣
      const discountAmount =
        selected.discount_type === "percent"
          ? (totalAmount * selected.discount_value) / 100
          : selected.discount_value;

      setDiscountValue(discountAmount); // 更新金額
      console.log("選擇的優惠券金額：", discountAmount);
    } else {
      setDiscountValue(0); // 沒有選擇則設為 0
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

    // 檢查 token
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

    if (!cartFormData.payment_method) {
      toast.error("請選擇付款方式");
      return;
    }

    setIsSubmitting(true);
    try {
      const finalTotal = totalAmount - discountValue + deliveryFee;

      // 組合訂單資料
      const orderData = {
        // user_id: cartFormData.user_id ?? 1,
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
        // store_id: storeInfo.store_id ?? null,
        // store_name: storeInfo.store_name ?? null,
        // store_address: storeInfo.store_address ?? null,
        store_id: store711.storeid ?? null,
        store_name: store711.storename ?? null,
        store_address: store711.storeaddress ?? null,
      };

      // 過濾 undefined 或 null 欄位
      for (let key in orderData) {
        if (orderData[key] === undefined) {
          orderData[key] = null;
        }
      }

      const response = await fetch("http://localhost:3000/api/orders", {
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

        // ✅ 清掉 localStorage 中的 store711，避免下次自動帶入
        localStorage.removeItem("store711");

        window.location.href = `${result.paymentUrl}`;
      } else {
        alert(`訂單建立失敗：${result.message}`);
      }
    } catch (error) {
      console.error("訂單建立失敗：", error);
      alert(`訂單建立失敗，請稍後再試 ${error.message}`);
    } finally {
      setIsSubmitting(false);
    }
  };

  // 修改運送方式的處理函數
  const handleDeliveryMethodChange = (e) => {
    const newMethod = e.target.value;
    setDeliveryMethod(newMethod);

    // 清空相關資料
    if (newMethod === "store_pickup") {
      // 切換到超商取貨時，清空宅配地址
      setCartFormData((prev) => ({
        ...prev,
        shipping_address: "",
      }));
    } else {
      // 切換到宅配時，清空超商資訊
      setStoreInfo({
        store_id: "",
        store_name: "",
        store_address: "",
      });
      // 如果有使用 711 選擇器，也清空相關資料
      localStorage.removeItem("store711");
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
        {/* 確認商品資訊 */}
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
              // 拆出圖片陣列
              const imageList = item.image_url?.split(",") || [];
              const mainImage = imageList[0]?.trim(); // 取第一張，並去除空格

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
            {/* <p className="mb-4 text-[#AFC16D] text-lg border-b-2 border-[#AFC16D] pb-2 font-medium">
              收件資訊
            </p> */}

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

            {/* 運送方式選擇 */}
            <div>
              <p className="block text-[#AFC16D] my-4 text-lg border-b-2 pb-2 font-medium border-[#AFC16D]">
                運送方式
              </p>

              {/* 改過樣式 */}
              <div className="flex gap-4 mb-4 text-[#333]">
                {/* 超商 */}
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

                {/* 宅配 */}
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

            {deliveryMethod === "store_pickup" && (
              <div className="flex flex-col">
                <UiButton
                  variant="gray"
                  otherClass="w-1/2 py-2 xl:py-2 rounded-xl"
                  // onClick={handleStoreSelection}
                  onClick={(e) => {
                    e.preventDefault();
                    openWindow();

                    setStoreInfo({
                      store_id: store711.storeid,
                      store_name: store711.storename,
                      store_address: store711.storeaddress,
                    });
                  }}
                >
                  選擇門市
                </UiButton>
                <div className="mt-2 text-[#555]">
                  <p>門市名稱：{store711.storename}</p>
                  <p>門市地址：{store711.storeaddress}</p>
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
                value={cartFormData.payment_method} // 綁定 state
                onChange={cartFiledChanged} // 使用通用處理函式
              >
                <option value="" disabled>
                  請選擇付款方式
                </option>
                <option value="cash">貨到付款</option>
                <option value="ecpay">綠界金流付款（信用卡、行動支付）</option>
                {/* <option value="line_pay">Line Pay</option> */}
              </select>
            </div>

            {/* 使用優惠卷 */}
            <p className="mt-6 mb-4 text-[#AFC16D] text-lg border-b-2 border-[#AFC16D] pb-2 font-medium">
              優惠卷
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
                  {discount.name} - {discount.discount_value}{" "}
                  {discount.discount_type === "amount" ? "元" : "%"}
                </option>
              ))}
            </select>

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
                  <span>優惠卷折扣</span>
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
