"use client";

import { Th, Td } from "../_components/TableCell";
import Link from "next/link";
import { useEffect, useState } from "react";
import CssLoader from "@/app/(main)/shop/cart/_components/css-loader";
import OrderSkeleton from "./_components/OrderSkeleton";

export default function OrderPage() {
  const [orderList, setOrderList] = useState([]);
  const [isLoading, setIsLoading] = useState(false);

  // 讀取訂單資料
  useEffect(() => {
    async function fetchOrder() {
      const token = localStorage.getItem("token");
      if (!token) return;

      try {
        setIsLoading(true);

        const res = await fetch("http://localhost:3000/api/orders/user", {
          headers: {
            Authorization: `Bearer ${token}`,
          },
        });

        if (!res.ok) throw new Error("請先登入後再進行操作");

        const data = await res.json();

        setOrderList(data.orders);
      } catch (error) {
        console.error(error);
      } finally {
        setIsLoading(false);
      }
    }

    fetchOrder();
  }, []);

  return (
    <div className="p-10 w-4/5 h-full mt-10 mx-10 border border-borderColor rounded-lg">
      <h3 className="text-3xl text-fontColor mb-6">訂單資料</h3>

      {isLoading ? (
        <div className="flex">
          <OrderSkeleton rowCount={5} cardCount={2} />
        </div>
      ) : (
        <div className="overflow-x-auto">
          <table className="min-w-full border-collapse border-gray-400">
            <thead>
              <tr className="bg-[#F9F9F9]">
                <Th className="min-w-50">訂單編號</Th>
                <Th className="min-w-40">訂購日期</Th>
                <Th className="min-w-30">訂單狀態</Th>
                <Th className="min-w-30">金額</Th>
                <Th className="min-w-40"></Th>
              </tr>
            </thead>
            <tbody>
              {orderList.map((item) => {
                const date = new Date(item.created_at);

                return (
                  <tr key={item.id}>
                    <Td>#{item.order_number}</Td>
                    <Td>{date.toISOString().split("T")[0]}</Td>
                    <Td>{item.shipping_status}</Td>
                    <Td>${item.final_total.toLocaleString()}</Td>
                    <Td className="text-center text-white">
                      <Link
                        href={`order/${item.order_number}`}
                        className="bg-zinc-300 inline-block py-1 px-5 hover:bg-black transition rounded-lg"
                      >
                        查看
                      </Link>
                    </Td>
                  </tr>
                );
              })}
            </tbody>
          </table>
        </div>
      )}
    </div>
  );
}
