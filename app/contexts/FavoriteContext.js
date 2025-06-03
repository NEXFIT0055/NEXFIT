"use client";

import {
  createContext,
  useContext,
  useState,
  useEffect,
  useCallback,
  useRef,
} from "react";
import { useAuth } from "./AuthContext";

const FavoritesContext = createContext();

export function FavoritesProvider({ children }) {
  const [favorites, setFavorites] = useState(new Set());
  const [isLoading, setIsLoading] = useState(false);

  // 使用 AuthContext
  const { isAuthenticated, token, isLoading: authLoading } = useAuth();

  // 使用 ref 來追蹤狀態，避免無限循環
  const lastAuthState = useRef({ isAuthenticated: null, token: null });
  const isLoadingFavorites = useRef(false);

  // 載入用戶收藏清單（使用 useCallback 避免重新創建）
  const loadUserFavorites = useCallback(async () => {
    // 防止重複調用
    if (isLoadingFavorites.current || !token) {
      return;
    }

    try {
      isLoadingFavorites.current = true;
      setIsLoading(true);

      if (process.env.NODE_ENV === "development") {
        console.log("🔍 載入用戶收藏清單...");
      }

      const response = await fetch("/api/favorites/products", {
        method: "GET",
        headers: {
          Authorization: `Bearer ${token}`,
          "Content-Type": "application/json",
        },
      });

      if (response.ok) {
        const data = await response.json();

        if (process.env.NODE_ENV === "development") {
          console.log("收藏清單載入成功，數量:", data.favorites?.length || 0);
        }

        const favoriteIds = new Set(
          (data.favorites || []).map((id) => id.toString())
        );
        setFavorites(favoriteIds);
      } else {
        if (process.env.NODE_ENV === "development") {
          console.error("載入收藏清單失敗:", response.status);
        }
        if (response.status === 401) {
          setFavorites(new Set());
        }
      }
    } catch (error) {
      if (process.env.NODE_ENV === "development") {
        console.error("載入收藏清單錯誤:", error);
      }
      setFavorites(new Set());
    } finally {
      setIsLoading(false);
      isLoadingFavorites.current = false;
    }
  }, [token]); // 只依賴 token

  // 當登入狀態改變時載入收藏
  useEffect(() => {
    // 如果 auth 還在載入中，等待
    if (authLoading) {
      return;
    }

    // 檢查認證狀態是否真的改變了
    const currentAuthState = { isAuthenticated, token };
    const lastState = lastAuthState.current;

    if (
      lastState.isAuthenticated === currentAuthState.isAuthenticated &&
      lastState.token === currentAuthState.token
    ) {
      // 狀態沒有改變，不執行任何操作
      return;
    }

    // 更新 ref
    lastAuthState.current = currentAuthState;

    if (process.env.NODE_ENV === "development") {
      console.log("🔄 認證狀態改變:", {
        isAuthenticated,
        hasToken: !!token,
        changed: true,
      });
    }

    if (isAuthenticated && token) {
      loadUserFavorites();
    } else {
      // 未登入時清空收藏
      setFavorites(new Set());
      if (process.env.NODE_ENV === "development") {
        console.log("🗑️ 未登入，清空收藏");
      }
    }
  }, [isAuthenticated, token, authLoading, loadUserFavorites]);

  // 監聽登出事件
  useEffect(() => {
    const handleLogout = () => {
      if (process.env.NODE_ENV === "development") {
        console.log("收到登出事件，清空收藏");
      }
      setFavorites(new Set());
      lastAuthState.current = { isAuthenticated: false, token: null };
    };

    window.addEventListener("userLogout", handleLogout);
    return () => window.removeEventListener("userLogout", handleLogout);
  }, []);

  // 檢查商品是否已收藏（使用 useCallback）
  const isFavorite = useCallback(
    (productId) => {
      if (!isAuthenticated) return false;
      return favorites.has(productId.toString());
    },
    [favorites, isAuthenticated]
  );

  // 切換收藏狀態（使用 useCallback）
  const toggleFavorite = useCallback(
    async (productId) => {
      // 檢查登入狀態
      if (!isAuthenticated || !token) {
        alert("請先登入以使用收藏功能");
        return false;
      }

      const currentlyFavorited = favorites.has(productId.toString());
      const originalFavorites = new Set(favorites);

      if (process.env.NODE_ENV === "development") {
        console.log(
          `🔄 ${currentlyFavorited ? "移除" : "新增"}收藏:`,
          productId
        );
      }

      try {
        // 先樂觀更新 UI
        const newFavorites = new Set(favorites);
        if (currentlyFavorited) {
          newFavorites.delete(productId.toString());
        } else {
          newFavorites.add(productId.toString());
        }
        setFavorites(newFavorites);

        // 發送 API 請求
        const response = await fetch("/api/favorites/products", {
          method: currentlyFavorited ? "DELETE" : "POST",
          headers: {
            "Content-Type": "application/json",
            Authorization: `Bearer ${token}`,
          },
          body: JSON.stringify({ productId: productId }),
        });

        if (response.ok) {
          if (process.env.NODE_ENV === "development") {
            console.log(`✅ 收藏${currentlyFavorited ? "移除" : "新增"}成功`);
          }
          return true;
        } else {
          // 恢復原始狀態
          setFavorites(originalFavorites);

          if (response.status === 401) {
            alert("登入已過期，請重新登入");
            return false;
          }

          if (response.status === 409) {
            // 處理衝突（商品已存在）
            const conflictFavorites = new Set(originalFavorites);
            conflictFavorites.add(productId.toString());
            setFavorites(conflictFavorites);
            return true;
          }

          return false;
        }
      } catch (error) {
        if (process.env.NODE_ENV === "development") {
          console.error("收藏操作錯誤:", error);
        }
        setFavorites(originalFavorites);
        return false;
      }
    },
    [favorites, isAuthenticated, token]
  );

  // 重新載入收藏清單（使用 useCallback）
  const refreshFavorites = useCallback(async () => {
    if (!isAuthenticated) {
      setFavorites(new Set());
      return;
    }

    if (process.env.NODE_ENV === "development") {
      console.log("🔄 手動重新載入收藏清單");
    }
    await loadUserFavorites();
  }, [isAuthenticated, loadUserFavorites]);

  // 清空收藏（使用 useCallback）
  const clearFavorites = useCallback(() => {
    if (process.env.NODE_ENV === "development") {
      console.log("🗑️ 手動清空收藏清單");
    }
    setFavorites(new Set());
  }, []);

  // 手動新增收藏（使用 useCallback）
  const addFavoriteLocally = useCallback(
    (productId) => {
      if (!isAuthenticated) return;

      setFavorites((prev) => {
        const newFavorites = new Set(prev);
        newFavorites.add(productId.toString());
        return newFavorites;
      });

      if (process.env.NODE_ENV === "development") {
        console.log("本地新增收藏:", productId);
      }
    },
    [isAuthenticated]
  );

  // 手動移除收藏（使用 useCallback）
  const removeFavoriteLocally = useCallback((productId) => {
    setFavorites((prev) => {
      const newFavorites = new Set(prev);
      newFavorites.delete(productId.toString());
      return newFavorites;
    });

    if (process.env.NODE_ENV === "development") {
      console.log("本地移除收藏:", productId);
    }
  }, []);

  // 使用 useMemo 來優化 value 物件，避免每次都創建新物件
  const value = {
    favorites,
    isLoading: isLoading || authLoading,
    isFavorite,
    toggleFavorite,
    refreshFavorites,
    clearFavorites,
    addFavoriteLocally,
    removeFavoriteLocally,
    favoriteCount: favorites.size,

    // 增加認證相關的便利屬性
    isAuthenticated,
    canUseFavorites: isAuthenticated,

    // 除錯用
    getFavoritesArray: () => Array.from(favorites),
  };

  // 只在開發環境下顯示狀態（並且減少頻率）
  if (process.env.NODE_ENV === "development") {
    // 使用 throttle 概念，減少 console 輸出
    const now = Date.now();
    if (!value._lastLog || now - value._lastLog > 2000) {
      // 每2秒最多輸出一次
      console.log("FavoritesProvider 當前狀態:", {
        favoritesCount: favorites.size,
        isLoading: isLoading || authLoading,
        isAuthenticated,
        hasToken: !!token,
      });
      value._lastLog = now;
    }
  }

  return (
    <FavoritesContext.Provider value={value}>
      {children}
    </FavoritesContext.Provider>
  );
}

// 自定義 Hook
export function useFavorites() {
  const context = useContext(FavoritesContext);
  if (!context) {
    throw new Error("useFavorites must be used within a FavoritesProvider");
  }
  return context;
}
