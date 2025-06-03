"use client";

import React from "react";
import Link from "next/link";
import { useEffect, useState, Suspense } from "react";
import { useParams, useSearchParams } from "next/navigation";
import Comment from "../_components/Comment";
import OrderDetailSkeleton from "../_components/OrderDetailSkeleton";

import {
  FaShippingFast,
  FaHome,
  FaCreditCard,
  FaBarcode,
} from "react-icons/fa";

// 將完整的邏輯合併到一個組件中
function OrderDetailWithParams() {
  const params = useParams();
  const searchParams = useSearchParams();
  const orderId = searchParams.get("orderId") || params.orderId;

  const [orderDetail, setOrderDetail] = useState(null);
  const [orderItem, setOrderItem] = useState([]);
  const [isLoading, setIsLoading] = useState(true);

  // 載入該筆訂單資料
  useEffect(() => {
    if (!orderId) {
      console.log("沒有找到 orderId");
      setIsLoading(false);
      return;
    }

    console.log("開始載入訂單，orderId:", orderId);

    async function fetchOrderDetail() {
      try {
        setIsLoading(true);
        const res = await fetch(`http://localhost:3000/api/orders/${orderId}`);

        if (!res.ok) {
          throw new Error(`HTTP error! status: ${res.status}`);
        }

        const data = await res.json();
        console.log("訂單資料載入成功:", data);

        setOrderDetail(data.order);
        setOrderItem(data.items);
      } catch (error) {
        console.error("載入訂單失敗:", error);
      } finally {
        setIsLoading(false);
      }
    }

    fetchOrderDetail();
  }, [orderId]);

  if (isLoading) {
    return <OrderDetailSkeleton />;
  }

  if (!orderId) {
    return (
      <div className="p-10 w-full lg:w-4/5 h-full m-6 lg:mt-10 lg:ml-10 lg:mr-15 border border-borderColor rounded-lg">
        <div className="text-center py-20">
          <h3 className="text-xl text-gray-600">找不到訂單資訊</h3>
          <Link
            href="/accountCenter/mall/order"
            className="mt-4 inline-block bg-[#F9F9F9] py-3 px-6 cursor-pointer text-lg rounded-xl border border-[#9B9999] hover:bg-[#9B9999] hover:!text-white transition"
          >
            返回訂單列表
          </Link>
        </div>
      </div>
    );
  }

  if (!orderDetail) {
    return (
      <div className="p-10 w-full lg:w-4/5 h-full m-6 lg:mt-10 lg:ml-10 lg:mr-15 border border-borderColor rounded-lg">
        <div className="text-center py-20">
          <h3 className="text-xl text-gray-600">訂單資料載入失敗</h3>
          <Link
            href="/accountCenter/mall/order"
            className="mt-4 inline-block bg-[#F9F9F9] py-3 px-6 cursor-pointer text-lg rounded-xl border border-[#9B9999] hover:bg-[#9B9999] hover:!text-white transition"
          >
            返回訂單列表
          </Link>
        </div>
      </div>
    );
  }

  return (
    <div className="p-10 w-full lg:w-4/5 h-full m-6 lg:mt-10 lg:ml-10 lg:mr-15 border border-borderColor rounded-lg">
      {/* 訂單訊息 */}
      <div className="flex justify-between">
        <div className="w-full sm:w-100">
          <h4 className="text-3xl text-[#333] font-semibold mb-6 w-75">
            {orderDetail?.order_number || "訂單資料載入中"}
          </h4>

          <ul className="text-lg text-fontColor">
            <li className="mb-4">
              <span className="inline-block w-35">訂購日期</span>
              <span>
                {orderDetail?.created_at
                  ? new Date(orderDetail.created_at).toLocaleString("zh-TW")
                  : ""}
              </span>
            </li>

            <li className="mb-4">
              <span className="inline-block w-35">訂單狀態</span>
              <span>{orderDetail?.shipping_status || ""}</span>
            </li>

            <li className="mb-4">
              <span className="inline-block w-35">金額</span>
              <span>
                {orderDetail?.final_total !== undefined
                  ? `$${orderDetail.final_total.toLocaleString()}`
                  : ""}
              </span>
            </li>

            <li className="mb-4">
              <span className="inline-block w-35">收件人姓名</span>
              <span>{orderDetail?.recipient_name || ""}</span>
            </li>

            <li className="mb-4">
              <span className="inline-block w-35">收件人電話</span>
              <span>{orderDetail?.recipient_phone || ""}</span>
            </li>
          </ul>
        </div>

        <Link
          href="/accountCenter/mall/order"
          className="hidden sm:block bg-[#F9F9F9] py-3 px-6 cursor-pointer text-lg rounded-xl border border-[#9B9999] hover:bg-[#9B9999] hover:!text-white transition self-start"
        >
          返回訂單
        </Link>
      </div>

      {/* 訂購商品 */}
      <div className="py-10 sm:px-4 border-y-2 mb-5">
        <ul className="flex flex-col gap-8">
          {orderItem.map((item) => {
            // 拆出圖片陣列
            const imageList = item.image_url?.split(",") || [];
            const mainImage = imageList[0]?.trim(); // 取第一張，並去除空格

            return (
              <li key={item.id} className="flex justify-between">
                <div className="sm:flex">
                  <Link href={`/shop/products/${item.product_id}`}>
                    <img
                      src={`/images/products/${mainImage}`}
                      alt=""
                      className="block mr-10 h-20"
                    />
                  </Link>
                  <div className="flex sm:gap-30 mt-2 text-lg text-fontColor">
                    <div className="sm:flex flex-col gap-6">
                      <h4 className="w-50">{item.name}</h4>
                      <span>
                        NT ${Number(item.price).toLocaleString()} x
                        {item.quantity}
                      </span>
                    </div>

                    <span className="hidden sm:block mr-1">
                      NT ${item.subtotal.toLocaleString()}
                    </span>
                  </div>
                </div>

                <Comment
                  productId={item.product_id}
                  name={item.name}
                  orderId={item.order_id}
                />
              </li>
            );
          })}
        </ul>
      </div>

      {/* 運送資訊 */}
      <ul className="flex flex-col gap-4 text-lg text-fontColor">
        <li>
          <span className="mr-6 inline-block w-30">
            <FaShippingFast className="inline-block text-xl mr-2" />
            配送方式
          </span>
          {/* TODO: 新增資料表欄位 */}
          <span>
            {orderDetail?.shipping_method === "home_delivery"
              ? "宅配到府"
              : "超商取貨" || ""}
          </span>
        </li>
        <li>
          <span className="mr-6 inline-block w-30">
            <FaHome className="inline-block text-xl mr-2" />
            地址
          </span>
          <span>
            {orderDetail?.shipping_address ||
              `${orderDetail?.store_address}（${orderDetail?.store_name}）` ||
              ""}
          </span>
        </li>
        <li>
          <span className="mr-6 inline-block w-30">
            <FaCreditCard className="inline-block text-xl mr-2" />
            付款方式
          </span>
          {orderDetail
            ? orderDetail.payment_method === "ecpay"
              ? "綠界"
              : "其他"
            : ""}
        </li>
        <li>
          <span className="mr-6 inline-block w-30">
            <FaBarcode className="inline-block text-xl mr-2" />
            付款狀態
          </span>
          <span>全額繳清</span>
        </li>
      </ul>
    </div>
  );
}

export default function OrderDetailPage() {
  return (
    <Suspense fallback={<OrderDetailSkeleton />}>
      <OrderDetailWithParams />
    </Suspense>
  );
}
