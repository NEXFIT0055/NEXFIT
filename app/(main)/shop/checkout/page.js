"use client";

import { useState, useEffect } from "react";

import Stepper from "../cart/_components/Stepper";
import CartStep2 from "../cart/_components/CartStep2";

export default function CheckoutPage() {
  return (
    <div className="container mx-auto">
      <Stepper className="my-10" curStep={2} />

      <main className="px-6">
        <CartStep2 />
      </main>
    </div>
  );
}
