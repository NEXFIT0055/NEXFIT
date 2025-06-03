"use client";

import React from "react";
import Image from "next/image";
import Link from "next/link";
import { socialLinks, sections } from "/app/config/footerSection";

export default function Footer() {
  return (
    <footer className="w-full flex bg-white py-8 flex-col justify-end h-full mt-8">
      <div className=" h-full">
        <div className=" p-5 h-full">
          <div className="flex-row px-20">
            <div className="my-6 flex justify-between ">
              <p className="text-5xl text-[#101828] font-bold">NEXFIT</p>
              <div className="flex ">
                {socialLinks.map((sL) => (
                  <Link href={sL.href} key={sL.id} className="ml-7">
                    <Image
                      src={sL.icon}
                      alt="Account Icon"
                      width={30}
                      height={30}
                      className={sL.isLast ? "mr-7" : ""}
                    />
                  </Link>
                ))}
              </div>
            </div>
            <div className="flex justify-between">
              {sections.map((section) => (
                <div key={section.id} className="flex flex-col pr-10">
                  <div className="mb-3">
                    <p className="text-4xl text-[#101828] font-semibold">{section.title}</p>
                    <p
                      href={section.links[0].href}
                      className="text-sm font-bold"
                      id={section.links[0].id}
                    >
                    </p>
                  </div>
                  {section.links.slice(0).map((link) => (
                    <Link
                      key={link.id}
                      href={link.href}
                      className="text-sm my-2 font-bold text-[#101828]"
                      id={link.id}
                    >
                      {link.text}
                    </Link>
                  ))}
                </div>
              ))}
            </div>
          </div>
        </div>
      </div>
    </footer>
  );
}
