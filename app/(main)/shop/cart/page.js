"use client";

import Stepper from "./_components/Stepper";
import CartStep1 from "./_components/CartStep1";
import LoginModal from "@/app/components/login";

export default function CartPage() {
  return (
    <div className="container mx-auto">
      <main className="px-6 lg:px-0">
        <Stepper className="my-10" curStep={1} />
        <CartStep1 />
      </main>
    </div>
  );
}
