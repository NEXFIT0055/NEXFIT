"use client";

import {
  createContext,
  useState,
  useContext,
  useEffect,
  Suspense,
} from "react";
import {
  addToCart as apiAddToCart,
  updateCartItem as apiUpdateCartItem,
  removeCartItem as apiRemoveCartItem,
} from "@/lib/cart";

import { useAuth } from "@/app/contexts/AuthContext";
import { usePathname, useRouter } from "next/navigation";

const CartContext = createContext(null);
CartContext.displayName = "CartContext";

function CartProviderCore({ children }) {
  const [isAuthInitialized, setIsAuthInitialized] = useState(false);
  const { isAuthenticated } = useAuth();
  const [cartId, setCartId] = useState(null);
  const [items, setItems] = useState([]);
  const [selectedItems, setSelectedItems] = useState([]);
  const [error, setError] = useState(null);
  const [loading, setLoading] = useState(true);
  const [isFirstLoad, setIsFirstLoad] = useState(true);
  const router = useRouter();
  const pathname = usePathname();

  // 添加詳細的調試日志
  const debugLog = (message, data = {}) => {
    console.log(`[CartContext] ${message}`, data);
  };

  // 監聽 authInitialized 事件
  useEffect(() => {
    const handleAuthInit = () => {
      debugLog("認證初始化完成");
      setIsAuthInitialized(true);
    };

    window.addEventListener("authInitialized", handleAuthInit);

    // 檢查是否已經初始化（防止錯過事件）
    if (window.authInitialized) {
      handleAuthInit();
    }

    return () => {
      window.removeEventListener("authInitialized", handleAuthInit);
    };
  }, []);

  useEffect(() => {
    const handleStateChange = async () => {
      debugLog("狀態變化檢查", {
        isAuthInitialized,
        isAuthenticated,
        pathname,
      });

      // 確保認證已初始化
      if (!isAuthInitialized) {
        debugLog("等待認證初始化...");
        return;
      }

      if (isAuthenticated) {
        debugLog("用戶已登入，載入購物車");
        await fetchCart();
      } else {
        debugLog("用戶未登入，清空購物車");
        setItems([]);
        setSelectedItems([]);
        setLoading(false);
      }
    };

    handleStateChange();

    // 監聽認證相關事件
    const events = ["userLoggedIn", "loginStateChange", "authStateChanged"];
    events.forEach((event) => {
      window.addEventListener(event, handleStateChange);
    });

    return () => {
      events.forEach((event) => {
        window.removeEventListener(event, handleStateChange);
      });
    };
  }, [isAuthInitialized, isAuthenticated, pathname]);

  const fetchCart = async () => {
    try {
      setError(null);
      debugLog("開始獲取購物車資料");

      // 檢查登入狀態
      if (!isAuthenticated) {
        debugLog("未登入狀態，清空購物車");
        setItems([]);
        setSelectedItems([]);
        if (isFirstLoad) setLoading(false);
        return;
      }

      const token = localStorage.getItem("token");
      debugLog("Token 狀態", {
        hasToken: !!token,
        token: token?.substring(0, 10) + "...",
      });

      if (!token) {
        debugLog("找不到 token，清空購物車");
        setItems([]);
        setSelectedItems([]);
        if (isFirstLoad) setLoading(false);
        return;
      }

      // 設置載入狀態
      if (isFirstLoad) setLoading(true);

      debugLog("發送 API 請求到購物車端點");

      const res = await fetch("http://localhost:3000/api/cart", {
        method: "GET",
        headers: {
          Authorization: `Bearer ${token}`,
          "Content-Type": "application/json",
        },
        cache: "no-store",
      });

      debugLog("API 響應狀態", {
        status: res.status,
        statusText: res.statusText,
        ok: res.ok,
      });

      if (!res.ok) {
        const errorText = await res.text();
        debugLog("API 錯誤響應", { errorText });
        throw new Error(`載入購物車失敗: ${res.status} - ${errorText}`);
      }

      const data = await res.json();
      debugLog("購物車資料獲取成功", {
        cartId: data.cart_id,
        itemsCount: data.items?.length || 0,
        items: data.items,
      });

      // 更新狀態
      setCartId(data.cart_id);
      setItems(data.items || []);

      // 同步已選項目
      setSelectedItems((prev) =>
        prev.filter((selected) =>
          (data.items || []).some(
            (item) => item.cartItemId === selected.cartItemId
          )
        )
      );

      debugLog("購物車狀態更新完成");
    } catch (err) {
      debugLog("購物車載入錯誤", { error: err.message, stack: err.stack });
      setError(err.message);
      setItems([]);
      setSelectedItems([]);
    } finally {
      if (isFirstLoad) {
        setLoading(false);
        setIsFirstLoad(false);
        debugLog("首次載入完成");
      }
    }
  };

  // 添加手動重新載入功能
  const reloadCart = async () => {
    debugLog("手動重新載入購物車");
    setIsFirstLoad(true);
    await fetchCart();
  };

  const selectAllItems = () => {
    setSelectedItems(items);
  };

  const deselectAllItems = () => {
    setSelectedItems([]);
  };

  const addItem = async (product) => {
    try {
      setError(null);
      debugLog("添加商品到購物車", product);
      await apiAddToCart(product.product_id, product.quantity);
      await fetchCart();
    } catch (err) {
      debugLog("添加商品失敗", { error: err.message });
      setError(err.message);
    }
  };

  const updateItem = async (cartItemId, quantity) => {
    try {
      setError(null);
      debugLog("更新購物車商品", { cartItemId, quantity });
      await apiUpdateCartItem(cartItemId, quantity);
      await fetchCart();
    } catch (err) {
      debugLog("更新商品失敗", { error: err.message });
      setError(err.message);
    }
  };

  const removeItem = async (cartItemId) => {
    try {
      setError(null);
      debugLog("刪除購物車商品", { cartItemId });
      await apiRemoveCartItem(cartItemId);
      await fetchCart();
    } catch (err) {
      debugLog("刪除商品失敗", { error: err.message });
      setError(err.message);
    }
  };

  const clearSelectedItems = () => {
    setItems((prevItems) =>
      prevItems.filter(
        (item) =>
          !selectedItems.some(
            (selected) => selected.product_id === item.product_id
          )
      )
    );
    setSelectedItems([]);
  };

  const toggleSelectItem = (cartItem) => {
    debugLog("切換選取商品", cartItem);

    setSelectedItems((prev) => {
      const exists = prev.find(
        (item) => item.cartItemId === cartItem.cartItemId
      );

      if (exists) {
        return prev.filter((item) => item.cartItemId !== cartItem.cartItemId);
      } else {
        const updatedCartItem =
          items.find((item) => item.cartItemId === cartItem.cartItemId) ||
          cartItem;
        return [...prev, { ...updatedCartItem }];
      }
    });
  };

  const totalAmount = items
    .filter((item) =>
      selectedItems.some((selected) => selected.cartItemId === item.cartItemId)
    )
    .reduce((acc, item) => {
      const quantity = Number(item.quantity);
      const price = Number(item.price);
      return acc + price * quantity;
    }, 0);

  // 添加調試信息到 context value
  const contextValue = {
    cartId,
    items,
    toggleSelectItem,
    selectedItems,
    addItem,
    updateItem,
    removeItem,
    loading,
    error,
    totalAmount,
    clearSelectedItems,
    selectAllItems,
    deselectAllItems,
    setSelectedItems,
    reloadCart, // 添加手動重載功能
    debugInfo: {
      // 添加調試信息
      isAuthInitialized,
      isAuthenticated,
      itemsCount: items.length,
      selectedItemsCount: selectedItems.length,
    },
  };

  return (
    <CartContext.Provider value={contextValue}>{children}</CartContext.Provider>
  );
}

export function CartProvider({ children }) {
  return (
    <Suspense fallback={<div>Loading cart...</div>}>
      <CartProviderCore>{children}</CartProviderCore>
    </Suspense>
  );
}

export const useCart = () => useContext(CartContext);
