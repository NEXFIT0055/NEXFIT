"use client";

import { useState } from "react";
import { useCart } from "@/hooks/use-cart";

import { FaRegTrashAlt } from "react-icons/fa";
import { toast } from "sonner";

import {
  AlertDialog,
  AlertDialogTrigger,
  AlertDialogContent,
  AlertDialogHeader,
  AlertDialogTitle,
  AlertDialogDescription,
  AlertDialogFooter,
  AlertDialogCancel,
  AlertDialogAction,
} from "@/app/components/ui/alert-dialog";

export default function CartItem({
  item = {},
  img = "",
  changeNum = false,
  deleteItem = false,
  checkbox = false,
}) {
  const { cartItemId, image_url, name, price, product_id, quantity } = item; // 解構

  const { updateItem, removeItem, selectedItems, toggleSelectItem } = useCart();
  // 正確檢查選中狀態 (比對整個物件是否存在於選取清單)
  const isSelected = selectedItems.some(
    (selectedItem) => selectedItem.cartItemId === cartItemId
  );

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
    <tr className="text-center">
      {checkbox ? (
        <td className="pb-4 border-b border-[#dadada]">
          <input
            type="checkbox"
            className="w-5 h-5 cursor-pointer"
            checked={isSelected}
            onChange={() => toggleSelectItem(item)}
          />
        </td>
      ) : (
        ""
      )}

      <td className="pb-4 border-b border-[#dadada]">
        <div className="flex flex-col md:flex-row md:justify-around items-center gap-2 lg:gap-5">
          <img src={img} alt={name} className="h-20 w-20" />
          <span className="md:w-40 md:text-left">{name}</span>
        </div>
      </td>

      <td className="pb-4 border-b border-[#dadada]">
        ${Math.trunc(price).toLocaleString()}
      </td>

      <td className="pb-4 border-b border-[#dadada]">
        <div className="flex items-center justify-center">
          {changeNum ? (
            <div className="flex items-center">
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
          ) : (
            <span className="w-8 h-8 text-center">{curQuantity}</span>
          )}
        </div>
      </td>

      {deleteItem ? (
        <td className="pb-4 border-b border-[#dadada]">
          <AlertDialog>
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
          </AlertDialog>
        </td>
      ) : null}
    </tr>
  );
}
