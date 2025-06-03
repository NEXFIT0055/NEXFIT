"use client";

import { useState } from "react";
import { useCart } from "@/hooks/use-cart";

import { FaRegTrashAlt } from "react-icons/fa";
import { toast } from "sonner";

// import {
//   AlertDialog,
//   AlertDialogTrigger,
//   AlertDialogContent,
//   AlertDialogHeader,
//   AlertDialogTitle,
//   AlertDialogDescription,
//   AlertDialogFooter,
//   AlertDialogCancel,
//   AlertDialogAction,
// } from "@/app/components/ui/alert-dialog";

export default function CartSheetItem({ item = {} }) {
  const { cartItemId, image_url, name, price, product_id, quantity } = item; // 解構

  // 拆出圖片陣列
  const imageList = image_url?.split(",") || [];
  const mainImage = imageList[0]?.trim(); // 取第一張，並去除空格

  const { updateItem, removeItem, selectedItems, toggleSelectItem } = useCart();

  const [curQuantity, setCurQuantity] = useState(quantity);

  const handleQuantityChange = (change) => {
    const newQuantity = Math.max(1, curQuantity + change);
    if (newQuantity === curQuantity) return;

    setCurQuantity(newQuantity);
    updateItem(cartItemId, newQuantity);
    toast.success("商品數量已更新");
  };

  const handleInputChange = (e) => {
    const value = e.target.value.replace(/\D/g, "");
    const number = Number(value) || 1;
    setCurQuantity(number);
    updateItem(cartItemId, number);
  };

  const handleRemove = () => {
    removeItem(cartItemId);
    toast.success("商品已從購物車移除");
  };

  return (
    <>
      <li className="flex items-between gap-2 md:gap-6">
        <img src={`/images/products/${mainImage}`} width={80} height={80} />

        <div className="w-full flex flex-col justify-between">
          <div className="flex justify-between">
            <span>{name}</span>
            <span>${(curQuantity * price).toLocaleString()}</span>
          </div>

          <div className="flex justify-between">
            <span>${Math.trunc(price.toLocaleString())}</span>
            <div className="flex gap-6 items-center">
              <div>
                <button
                  onClick={() => handleQuantityChange(-1)}
                  className="bg-[#D9D9D9] h-8 cursor-pointer hover:bg-stone-300 transition w-7"
                >
                  -
                </button>

                <input
                  className="bg-[#F4F4F4] w-10 h-8 text-center"
                  type="text"
                  value={curQuantity}
                  onChange={handleInputChange}
                  onBlur={() => {
                    toast.success("商品數量已更新");
                  }}
                />
                <button
                  onClick={() => {
                    handleQuantityChange(+1);
                  }}
                  className="bg-[#D9D9D9] h-8 cursor-pointer hover:bg-stone-300 transition w-7"
                >
                  +
                </button>
              </div>

              {/* <AlertDialog>
                <AlertDialogTrigger asChild>
                  <FaRegTrashAlt className="w-7 h-7 bg-white hover:bg-white text-black cursor-pointer hover:text-red-500 duration-300" />
                </AlertDialogTrigger>
                <AlertDialogContent>
                  <AlertDialogHeader>
                    <AlertDialogTitle>確定要刪除此商品？</AlertDialogTitle>
                    <AlertDialogDescription>
                      此商品將從購物車中移除，確定要繼續嗎？
                    </AlertDialogDescription>
                  </AlertDialogHeader>
                  <AlertDialogFooter>
                    <AlertDialogCancel className="cursor-pointer">
                      取消
                    </AlertDialogCancel>
                    <AlertDialogAction
                      className="cursor-pointer"
                      onClick={handleRemove}
                    >
                      確定刪除
                    </AlertDialogAction>
                  </AlertDialogFooter>
                </AlertDialogContent>
              </AlertDialog> */}
            </div>
          </div>
        </div>
      </li>
    </>
  );
}
