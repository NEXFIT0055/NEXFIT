import { toast } from "sonner";

// * 購物車 增加商品數量
export const addToCart = async (productId, quantity = 1) => {
  try {
    const token = localStorage.getItem("token"); // 從 localStorage 取得 JWT

    if (!token) {
      toast.error("請先登入會員後再進行操作！");
      return;
    }

    const response = await fetch("http://localhost:3000/api/cart", {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
        Authorization: `Bearer ${token}`, // 將 JWT 附加到 Authorization 標頭
      },
      body: JSON.stringify({
        product_id: productId,
        quantity: quantity,
      }),
    });

    const result = await response.json();

    if (result.success) {
      toast.success("加入購物車成功");
    } else {
      toast.error("加入購物車失敗");
    }
  } catch (error) {
    console.error("錯誤:", error);
  }
};

// * 購物車 修改購物車商品
// url: PUT /api/cart/:cartItemId

export const updateCartItem = async (cartItemId, quantity = 1) => {
  try {
    const response = await fetch(
      `http://localhost:3000/api/cart/${cartItemId}`,
      {
        method: "PUT",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify({
          quantity: quantity,
        }),
      }
    );

    const result = await response.json();

    if (result.success) {
      console.log("✅ 修改商品數量成功");
    } else {
      console.log("❌ 修改商品數量失敗");
    }
  } catch (error) {
    console.error("錯誤:", error);
  }
};

// * 購物車 刪除"單一項"商品
// url: DELETE /api/cart/:cartItemId

export const removeCartItem = async (cartItemId) => {
  try {
    const response = await fetch(
      `http://localhost:3000/api/cart/${cartItemId}`,
      {
        method: "DELETE",
      }
    );

    const result = await response.json();

    if (result.success) {
      console.log("✅ 刪除商品成功");
    } else {
      console.log("❌ 刪除商品失敗");
    }
  } catch (error) {
    console.error("錯誤:", error);
  }
};
