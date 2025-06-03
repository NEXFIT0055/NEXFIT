"use client";

import { useState, useEffect } from "react";
import { FaRegCheckCircle } from "react-icons/fa";
import Stepper from "../../cart/_components/Stepper";
import UiButton from "../../cart/_components/UiButton";

export default function SuccessPage(props) {
  return (
    <>
      <div className="container mx-auto">
        <Stepper className="mt-10 my-20" curStep={3} />

        <div className="flex flex-col justify-center items-center pt-10 pb-6 gap-20">
          <div className="flex flex-col justify-center items-center gap-8">
            <FaRegCheckCircle className="w-25 h-25 text-[#A9BA5C]" />
            <div className="text-4xl font-bold">訂購完成</div>
          </div>

          <div className="flex gap-10 -mb-40">
            <UiButton
              otherClass="py-2 px-6 rounded-lg"
              link="/shop/products"
              variant="dark"
            >
              繼續購物
            </UiButton>

            <UiButton
              otherClass="py-2 px-6 rounded-lg"
              link="/accountCenter/mall/order"
            >
              回訂單頁面
            </UiButton>
          </div>
        </div>
      </div>
    </>
  );
}
