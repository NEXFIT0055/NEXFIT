"use client";

import Link from "next/link";
import React from "react";
import { usePathname } from "next/navigation";
import { accountCenter, mall } from "/app/config/sidebarSection";

export default function Sidebar() {
  const pathname = usePathname();

  return (
    <>
      <div className=" md:flex md:w-6/7 lg:w-3/7 w-full">
        <div className="w-full md:ml-10 md:mt-10">
          <ul className="md:mb-10 lg:mb-10 p-5 md:p-0 lg:p-0">
            <li className="text-base text-white w-full bg-black text-center p-3 md:rounded-t-xl lg:rounded-t-xl">
              會員中心
            </li>
            {accountCenter.map((a) => (
              <Link key={a.id} href={a.href}>
                <li
                  className={`text-sm border-b md:border-x lg:border-x py-3.5 px-5 border-borderColor text-fontColor opacity-80 hover:bg-gray-50 active:bg-gray-100
                  ${a.isLast ? "md:rounded-b-lg lg:md:rounded-b-lg" : ""}
                  ${pathname === a.href ? "active" : ""}
                  `}
                >
                  {a.name}
                </li>
              </Link>
            ))}
          </ul>
          <ul className="p-5 md:p-0 lg:p-0">
            <li className="text-base text-white bg-black text-center p-3 md:rounded-t-xl lg:rounded-t-xl">
              商城
            </li>
            {mall.map((m, index) => (
              <Link key={m.id} href={m.href}>
                <li
                  className={`text-sm border-b md:border-x lg:border-x py-3.5 px-5 border-borderColor text-fontColor opacity-80 hover:bg-gray-50
                  ${m.isLast ? "md:rounded-b-lg lg:md:rounded-b-lg" : ""}
                  ${pathname === m.href ? "active" : ""}
                  `}
                >
                  {m.name}
                </li>
              </Link>
            ))}
          </ul>
        </div>
      </div>
    </>
  );
}
