"use client";

import UiButton from "./UiButton";

export default function DeliveryOptions(props) {
  return (
    <div className="flex justify-between border-y border-[#333] py-10">
      <span>運送方式</span>
      <form action="">
        <div className="flex justify-between">
          <input
            className="mr-2"
            type="radio"
            name="deliveryMethod"
            id="cod"
            value="cod"
          />
          <label htmlFor="cod">超商取貨付款 NT$80</label>
        </div>

        <br />

        <div className="flex justify-between">
          <input
            className="mr-2"
            type="radio"
            name="deliveryMethod"
            id="store"
            value="store"
          />
          <label htmlFor="store">超商純取貨 NT$80</label>
        </div>

        <br />

        <div className="flex justify-between">
          <input
            className="mr-2"
            type="radio"
            name="deliveryMethod"
            id="cat"
            value="cat"
          />
          <label htmlFor="cat">黑貓宅配 NT$120</label>
        </div>
      </form>
    </div>
  );
}
