"use client";

import { useState, useEffect } from "react";
import { useCart } from "@/hooks/use-cart";
import { useRouter } from "next/navigation";

import CssLoader from "../(main)/shop/cart/_components/css-loader";

import {
  Sheet,
  SheetContent,
  SheetDescription,
  SheetHeader,
  SheetTitle,
  SheetTrigger,
  SheetFooter,
  SheetClose,
} from "@/app/components/ui/sheet";

import Image from "next/image";
import UiButton from "../(main)/shop/cart/_components/UiButton";

import CartSheetItem from "../(main)/shop/cart/_components/CartSheetItem";

import { toast } from "sonner";

export default function CartSheet({ isLoggedIn }) {
  const router = useRouter();

  const handleClick = () => {
    if (!isLoggedIn) {
      toast.error("請先登入後再進行操作");

      return;
    }
    router.push("/shop/cart");
  };

  const { items, loading } = useCart();

  if (loading) {
    return (
      <Sheet>
        <SheetTrigger className="cursor-pointer">
          <Image src="/cart.svg" alt="Cart Icon" width={30} height={30} />
        </SheetTrigger>

        <SheetContent>
          <div className="flex justify-center">
            <CssLoader />
          </div>
        </SheetContent>
      </Sheet>
    );
  }

  return (
    <>
      <Sheet>
        <SheetTrigger className="cursor-pointer relative">
          <Image src="/cart.svg" alt="Cart Icon" width={30} height={30} />
          {items.length > 0 && (
            <span className="absolute -top-2 -right-3 bg-red-500 text-white w-5 h-5 rounded-full text-xs font-bold flex justify-center items-center">
              {items.length}
            </span>
          )}
        </SheetTrigger>

        <SheetContent>
          <SheetHeader>
            <SheetTitle>
              <p className="mb-6 text-xl font-normal">你的購物車</p>
              <div className="mb-6 pb-4 flex justify-between font-normal text-zinc-500 border-b">
                <span>商品</span>
                <span>總計</span>
              </div>
            </SheetTitle>

            <div className="mb-10">
              <ul className="flex flex-col gap-8">
                {items.length === 0 ? (
                  <li className="text-lg text-center">
                    還沒加入任何商品，快去選購吧！
                  </li>
                ) : (
                  items.map((item) => (
                    <CartSheetItem key={item.cartItemId} item={item} />
                  ))
                )}
              </ul>

              <SheetDescription></SheetDescription>
            </div>
          </SheetHeader>
          <SheetFooter>
            <SheetClose asChild>
              <UiButton
                otherClass="py-2 !text-base disabled"
                onClick={handleClick}
              >
                前往購物車頁面
              </UiButton>
            </SheetClose>
          </SheetFooter>
        </SheetContent>
      </Sheet>
    </>
  );
}
