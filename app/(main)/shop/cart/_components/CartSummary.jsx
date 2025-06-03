"use client";
import UiButton from "./UiButton";
import Link from "next/link";
import { useCart } from "@/hooks/use-cart";
import { useState } from "react";
import { toast } from "sonner";
import { useRouter } from "next/navigation";

export default function CartSummary({ totalAmount }) {
  const { items, selectedItems } = useCart();

  const router = useRouter();

  // 動態生成最新的選中商品清單
  const updatedSelectedItems = selectedItems.map((selectedItem) => {
    const matchedItem = items.find(
      (item) => item.cartItemId === selectedItem.cartItemId
    );
    return matchedItem
      ? { ...selectedItem, quantity: matchedItem.quantity }
      : selectedItem;
  });

  return (
    <div className="text-lg lg:border lg:border-[#4F4B4B] lg:p-8 rounded-xl">
      <p className="text-xl text-center mb-12">
        {totalAmount >= 2000
          ? `🎉 恭喜您已享免運優惠！`
          : `再加購 NT$${(
              2000 - totalAmount
            ).toLocaleString()}，即可享有免運優惠！`}
      </p>

      <div className="flex flex-col gap-10">
        <div className="border-b pb-6">
          <p className="mb-4 font-bold">商品明細</p>
          <ul className="flex flex-col gap-4">
            {updatedSelectedItems.length === 0 ? (
              <p className="text-center text-gray-600">尚未選擇商品</p>
            ) : (
              updatedSelectedItems.map((item) => (
                <li key={item.cartItemId} className="flex justify-between">
                  <span>
                    {item.name} x {item.quantity}
                  </span>
                  <span>
                    ${Math.trunc(item.price * item.quantity).toLocaleString()}
                  </span>
                </li>
              ))
            )}
          </ul>
        </div>

        <div className="flex justify-between font-bold">
          <span>總計</span>
          <span>${totalAmount.toLocaleString()}</span>
        </div>

        <div className="flex gap-4">
          <UiButton
            variant="dark"
            otherClass="w-1/2 py-3 rounded-lg"
            link="/shop/products"
          >
            繼續購物
          </UiButton>

          <UiButton
            onClick={() => {
              if (updatedSelectedItems.length === 0) {
                toast.error(`請先選擇商品再前往結帳！`);
              } else {
                router.push("/shop/checkout");
              }
            }}
            otherClass="flex items-center justify-center w-1/2 py-3 rounded-lg"
            // link="/shop/checkout"
          >
            前往結帳
          </UiButton>
        </div>
      </div>
    </div>
  );
}
