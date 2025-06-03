"use client";

import { useState, useEffect } from "react";
import CartItem from "./CartItem";
import CartSummary from "./CartSummary";
import CssLoader from "./css-loader";

import { useCart } from "@/hooks/use-cart";

export default function CartStep1() {
  const {
    items,
    totalAmount,
    loading,
    error,
    addItem,
    selectAllItems,
    setSelectedItems,
    deselectAllItems,
    selectedItems,
  } = useCart();

  const [curQuantity, setCurQuantity] = useState(0);
  const [isAllSelected, setIsAllSelected] = useState(false);

  useEffect(() => {
    setIsAllSelected(items.length > 0 && selectedItems.length === items.length);
  }, [selectedItems, items]);

  // 在商品渲染前先進行數量檢查
  useEffect(() => {
    // 確保 selectedItems 中的數量與 items 中的相符
    setSelectedItems((prev) =>
      prev.map((selected) => {
        const current = items.find(
          (item) => item.cartItemId === selected.cartItemId
        );
        return current ? { ...selected, quantity: current.quantity } : selected;
      })
    );
  }, [items]);

  const handleQuantityChange = (change) => {
    const newQuantity = Math.max(1, curQuantity + change);
    if (newQuantity === curQuantity) return;

    setCurQuantity(newQuantity);
    updateItem(cartItemId, newQuantity);
    toast.success("商品數量已更新");
  };

  const handleSelectAllChange = (e) => {
    const checked = e.target.checked;
    setIsAllSelected(checked);

    if (checked) {
      selectAllItems();
    } else {
      deselectAllItems();
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
        {/* 購物車商品 */}

        <table className="w-full lg:w-2/3 text-center md:text-left border-separate border-spacing-y-6 self-start">
          <thead className="text-center">
            <tr>
              <th className="w-1/8 md:w-1/8 border-b border-[#4F4B4B] text-fontColor pb-4">
                {/* <input type="checkbox" className="w-5 h-5 cursor-pointer" /> */}
                <input
                  type="checkbox"
                  className="w-5 h-5 cursor-pointer"
                  checked={isAllSelected}
                  onChange={handleSelectAllChange}
                />
              </th>
              <th className="w-1/4 md:w-1/3 xl:w-1/5 border-b border-[#4F4B4B] text-fontColor pb-4">
                商品
              </th>
              <th className="w-1/9 border-b border-[#4F4B4B] text-fontColor pb-4">
                價格
              </th>
              <th className="w-1/4 border-b border-[#4F4B4B] text-fontColor pb-4">
                數量
              </th>

              <th className="w-1/10 border-b border-[#4F4B4B] text-fontColor pb-4"></th>
            </tr>
          </thead>

          <tbody>
            {!error && items.length === 0 ? (
              <tr>
                <td colSpan="5" className="text-center py-4">
                  <p className="text-xl">購物車內還沒有商品，快去選購吧！</p>
                </td>
              </tr>
            ) : (
              items.map((item) => {
                // 拆出圖片陣列
                const imageList = item.image_url?.split(",") || [];
                const mainImage = imageList[0]?.trim(); // 取第一張，並去除空格

                return (
                  <CartItem
                    key={item.cartItemId}
                    item={item}
                    changeNum={true}
                    img={`/images/products/${mainImage}`}
                    deleteItem={true}
                    checkbox={true}
                  />
                );
              })
            )}

            {error && (
              <tr>
                <td colSpan="5" className="text-center text-3xl font-bold py-4">
                  <p>⚠️{error}</p>
                </td>
              </tr>
            )}
          </tbody>
        </table>

        <div className="lg:w-1/3">
          {/* 填寫資料 */}
          <CartSummary totalAmount={totalAmount}></CartSummary>
        </div>
      </div>
    </>
  );
}
