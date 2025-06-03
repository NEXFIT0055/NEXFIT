"use client";

import {
  createContext,
  useContext,
  useState,
  useEffect,
  useRef,
  useCallback,
} from "react";

const AuthContext = createContext();

export function AuthProvider({ children }) {
  const [isAuthenticated, setIsAuthenticated] = useState(false);
  const [user, setUser] = useState(null);
  const [token, setToken] = useState(null);
  const [isLoading, setIsLoading] = useState(true);

  // 使用 ref 來防止重複調用
  const isCheckingAuth = useRef(false);
  const hasInitialized = useRef(false);
  const lastUpdateTime = useRef(0);

  // 生成預設頭像 URL（修復 Unicode 問題）
  const simpleHash = (str) => {
    let hash = 0;
    for (let i = 0; i < str.length; i++) {
      const char = str.charCodeAt(i);
      hash = (hash << 5) - hash + char;
      hash = hash & hash;
    }
    return Math.abs(hash).toString(16).substring(0, 8);
  };

  const generateDefaultAvatar = useCallback((name, email) => {
    if (!name && !email) return null;

    const displayName = name || email.split("@")[0];
    const firstChar = displayName.charAt(0).toUpperCase();

    try {
      // 使用安全的哈希方法
      const hash = simpleHash(displayName + firstChar);
      return `https://www.gravatar.com/avatar/${hash}?s=200&d=identicon&r=pg`;
    } catch (error) {
      console.warn("生成預設頭像失敗:", error);
      return `https://www.gravatar.com/avatar/default?s=200&d=identicon&r=pg`;
    }
  }, []);

  // 從 API 獲取完整用戶資料的函數
  const fetchUserProfile = async (authToken, retryOnFail = true) => {
    try {
      if (process.env.NODE_ENV === "development") {
        console.log("🔍 獲取用戶完整資料...");
      }

      const response = await fetch("/api/accountCenter/profile/account", {
        headers: {
          Authorization: `Bearer ${authToken}`,
          "Content-Type": "application/json",
        },
      });

      console.log("📡 API 回應狀態:", response.status);

      if (response.ok) {
        const userData = await response.json();

        if (process.env.NODE_ENV === "development") {
          console.log("✅ 獲取用戶資料成功:", userData.data);
        }

        return userData.data;
      } else if (response.status === 401 && retryOnFail) {
        // 如果是 Firebase token 的 401 錯誤，可能需要等待後端創建用戶
        console.log("⚠️ 首次 API 調用失敗，稍後重試...");

        // 等待 2 秒後重試一次
        await new Promise((resolve) => setTimeout(resolve, 2000));

        const retryResponse = await fetch(
          "/api/accountCenter/profile/account",
          {
            headers: {
              Authorization: `Bearer ${authToken}`,
              "Content-Type": "application/json",
            },
          }
        );

        if (retryResponse.ok) {
          const retryData = await retryResponse.json();
          console.log("✅ 重試後獲取用戶資料成功:", retryData.data);
          return retryData.data;
        } else {
          console.error("❌ 重試後仍然失敗:", retryResponse.status);
          return null;
        }
      } else {
        console.error("❌ 獲取用戶資料失敗:", response.status);
        return null;
      }
    } catch (error) {
      console.error("❌ 獲取用戶資料異常:", error);
      return null;
    }
  };

  // 處理用戶頭像邏輯
  const processUserAvatar = (userData) => {
    let userWithAvatar = { ...userData };

    // 檢查 API 是否返回頭像
    const apiAvatar = userWithAvatar.avatar || userWithAvatar.avatar_url;

    if (apiAvatar && !apiAvatar.includes("gravatar.com/avatar/default")) {
      // 用戶有真實上傳的頭像
      if (process.env.NODE_ENV === "development") {
        console.log("🖼️ 用戶已有真實頭像:", apiAvatar);
      }
      userWithAvatar.avatar = apiAvatar;
    } else {
      // 用戶沒有頭像，檢查 localStorage 或生成預設頭像
      const savedAvatar = localStorage.getItem("userAvatar");

      if (savedAvatar && !savedAvatar.includes("gravatar.com/avatar/default")) {
        // 使用 localStorage 中的頭像（但不是預設的）
        userWithAvatar.avatar = savedAvatar;

        if (process.env.NODE_ENV === "development") {
          console.log("🖼️ 使用 localStorage 中的頭像:", savedAvatar);
        }
      } else {
        // 生成新的預設頭像
        const defaultAvatar = generateDefaultAvatar(
          userWithAvatar.name,
          userWithAvatar.email
        );

        if (defaultAvatar) {
          userWithAvatar.avatar = defaultAvatar;

          if (process.env.NODE_ENV === "development") {
            console.log("🎨 生成新的預設頭像:", defaultAvatar);
          }
        }
      }
    }

    return userWithAvatar;
  };

  // 初始化時檢查登入狀態
  useEffect(() => {
    if (hasInitialized.current || isCheckingAuth.current) {
      return;
    }

    if (process.env.NODE_ENV === "development") {
      console.log("🔄 AuthProvider 初始化...");
    }
    checkAuthStatus();
    hasInitialized.current = true;
  }, []);

  // 檢查登入狀態
  const checkAuthStatus = async () => {
    if (isCheckingAuth.current) {
      if (process.env.NODE_ENV === "development") {
        console.log("⚠️ 已在檢查認證狀態，跳過重複調用");
      }
      return;
    }

    try {
      isCheckingAuth.current = true;
      setIsLoading(true);

      if (process.env.NODE_ENV === "development") {
        console.log("🔍 檢查登入狀態...");
      }

      const storedToken = localStorage.getItem("token");

      if (!storedToken) {
        if (process.env.NODE_ENV === "development") {
          console.log("❌ 沒有找到 token");
        }
        setIsAuthenticated(false);
        setUser(null);
        setToken(null);

        // 觸發初始化完成事件
        setTimeout(() => {
          window.dispatchEvent(new CustomEvent("authInitialized"));
          if (process.env.NODE_ENV === "development") {
            console.log("📡 已觸發 authInitialized 事件（無 token）");
          }
        }, 100);
        return;
      }

      if (process.env.NODE_ENV === "development") {
        console.log("✅ 找到 token，驗證中...");
      }
      setToken(storedToken);

      // 獲取完整用戶資料
      const userData = await fetchUserProfile(storedToken);

      if (userData) {
        // 處理用戶頭像
        const userWithAvatar = processUserAvatar(userData);

        setIsAuthenticated(true);
        setUser(userWithAvatar);
        setToken(storedToken);

        // 同步頭像到 localStorage（只有當有有效頭像時）
        const finalAvatar = userWithAvatar.avatar || userWithAvatar.avatar_url;
        if (finalAvatar) {
          updateAvatarStorage(finalAvatar);
        }

        // 觸發認證完成事件
        setTimeout(() => {
          window.dispatchEvent(new Event("userLoggedIn"));
          window.dispatchEvent(new Event("loginStateChange"));
          window.dispatchEvent(new CustomEvent("authInitialized"));
          window.dispatchEvent(new CustomEvent("authStateChanged"));
          window.dispatchEvent(new CustomEvent("tokenChanged"));

          if (process.env.NODE_ENV === "development") {
            console.log("📡 已觸發所有認證完成事件");
          }
        }, 100);

        // 第二輪事件觸發，確保覆蓋
        setTimeout(() => {
          window.dispatchEvent(new CustomEvent("authStateChanged"));
          window.dispatchEvent(new Event("userLoggedIn"));

          if (process.env.NODE_ENV === "development") {
            console.log("📡 已觸發第二輪認證事件");
          }
        }, 500);
      } else {
        // 無法獲取用戶資料，但 token 存在，保持登入狀態
        if (process.env.NODE_ENV === "development") {
          console.log("⚠️ 無法獲取用戶資料，保持登入狀態");
        }
        setIsAuthenticated(true);
        setToken(storedToken);

        // 觸發初始化完成事件
        setTimeout(() => {
          window.dispatchEvent(new CustomEvent("authInitialized"));
        }, 100);
      }
    } catch (error) {
      console.error("檢查登入狀態失敗:", error);
      // 保持現有狀態，不強制登出
      const storedToken = localStorage.getItem("token");
      if (storedToken) {
        setIsAuthenticated(true);
        setToken(storedToken);
      } else {
        setIsAuthenticated(false);
        setUser(null);
        setToken(null);
      }

      // 觸發初始化完成事件
      setTimeout(() => {
        window.dispatchEvent(new CustomEvent("authInitialized"));
      }, 100);
    } finally {
      setIsLoading(false);
      isCheckingAuth.current = false;
    }
  };

  // 🔧 新增：檢測可用的 API 端點函數
  const detectLoginAPI = async () => {
    const possibleEndpoints = ["/api/login"];

    if (process.env.NODE_ENV === "development") {
      console.log("🔍 開始檢測可用的登入 API 端點...");
    }

    for (const endpoint of possibleEndpoints) {
      try {
        const testResponse = await fetch(endpoint, {
          method: "OPTIONS", // 使用 OPTIONS 來測試端點是否存在
          headers: {
            "Content-Type": "application/json",
          },
        });

        // 如果不是 404 或 405，這個端點可能存在
        if (testResponse.status !== 404 && testResponse.status !== 405) {
          if (process.env.NODE_ENV === "development") {
            console.log(
              `✅ 找到可用的 API 端點: ${endpoint} (狀態: ${testResponse.status})`
            );
          }
          return endpoint;
        }
      } catch (error) {
        // 繼續檢查下一個端點
        continue;
      }
    }

    if (process.env.NODE_ENV === "development") {
      console.log("❌ 沒有找到可用的登入 API 端點");
    }
    return null;
  };
  const updateAvatarStorage = useCallback((avatarUrl) => {
    if (!avatarUrl) return;

    const currentAvatar = localStorage.getItem("userAvatar");
    if (currentAvatar === avatarUrl) return;

    try {
      localStorage.setItem("userAvatar", avatarUrl);

      if (process.env.NODE_ENV === "development") {
        console.log("💾 頭像已存儲到 localStorage:", avatarUrl);
      }

      setTimeout(() => {
        window.dispatchEvent(new Event("storage"));
        window.dispatchEvent(
          new CustomEvent("avatarUpdate", {
            detail: { newAvatar: avatarUrl },
          })
        );

        if (process.env.NODE_ENV === "development") {
          console.log("📡 已觸發頭像更新事件");
        }
      }, 100);
    } catch (error) {
      console.error("更新頭像 localStorage 失敗:", error);
    }
  }, []);

  // 🔧 修復：一般用戶登入函數 - 使用正確的 API 路徑
  const login = async (credentials) => {
    try {
      if (process.env.NODE_ENV === "development") {
        console.log("🔐 開始一般用戶登入...");
        console.log("📧 登入憑證:", { email: credentials.email });
      }

      // 🔧 修復：使用正確的登入 API 路徑
      const loginEndpoints = [
        "/api/login", // 嘗試標準路徑
      ];

      let response = null;
      let lastError = null;

      // 依序嘗試不同的 API 端點
      for (const endpoint of loginEndpoints) {
        try {
          if (process.env.NODE_ENV === "development") {
            console.log(`🔗 嘗試 API 路徑: ${endpoint}`);
          }

          response = await fetch(endpoint, {
            method: "POST",
            headers: {
              "Content-Type": "application/json",
              Accept: "application/json",
            },
            body: JSON.stringify(credentials),
          });

          console.log(`📡 ${endpoint} 響應狀態:`, response.status);

          // 如果不是 404 或 405，就使用這個回應
          if (response.status !== 404 && response.status !== 405) {
            if (process.env.NODE_ENV === "development") {
              console.log(`✅ 使用 API 端點: ${endpoint}`);
            }
            break;
          }
        } catch (fetchError) {
          if (process.env.NODE_ENV === "development") {
            console.log(`❌ ${endpoint} 請求失敗:`, fetchError.message);
          }
          lastError = fetchError;
          continue;
        }
      }

      // 如果所有端點都失敗
      if (!response || response.status === 404 || response.status === 405) {
        console.error("❌ 所有登入 API 端點都不可用");
        throw new Error("登入 API 不存在，請確認後端 API 路徑配置");
      }

      // 檢查響應是否為 JSON
      const contentType = response.headers.get("content-type");
      if (!contentType || !contentType.includes("application/json")) {
        console.error("收到非預期的響應類型:", contentType);
        const responseText = await response.text();
        console.error("響應內容前200字元:", responseText.substring(0, 200));

        if (responseText.includes("<!DOCTYPE")) {
          throw new Error("登入 API 返回 HTML 頁面，請檢查 API 路徑配置");
        } else {
          throw new Error("服務器返回了非預期的響應格式");
        }
      }

      const data = await response.json();
      console.log("服務器響應:", data);

      if (!response.ok) {
        if (response.status === 404) {
          throw new Error("用戶帳號已被刪除，請重新註冊");
        } else if (response.status === 401) {
          throw new Error("帳號或密碼錯誤");
        } else if (response.status >= 500) {
          throw new Error("伺服器內部錯誤，請稍後再試");
        }
        throw new Error(data.message || `登入失敗 (${response.status})`);
      }

      // 檢查 API 響應結構
      const token = data.token || data.access_token || data.jwt;
      if (!token) {
        console.error("API 響應缺少 token:", data);
        throw new Error("API 響應格式不正確，缺少認證 token");
      }

      localStorage.setItem("token", token);

      // 🔥 關鍵修復：登入成功後立即獲取完整用戶資料
      if (process.env.NODE_ENV === "development") {
        console.log("✅ 一般用戶登入成功，立即獲取完整用戶資料...");
      }

      const fullUserData = await fetchUserProfile(token);

      let userWithAvatar;

      if (fullUserData) {
        // 使用從 API 獲取的完整資料
        userWithAvatar = processUserAvatar(fullUserData);

        if (process.env.NODE_ENV === "development") {
          console.log("✅ 使用 API 完整用戶資料:", userWithAvatar);
        }
      } else {
        // 降級使用登入 API 返回的基本資料
        const userData = data.user ||
          data.data || {
            name: data.name,
            email: data.email || credentials.email,
            nickname: data.nickname,
          };

        userWithAvatar = processUserAvatar(userData);

        if (process.env.NODE_ENV === "development") {
          console.log("⚠️ 使用登入 API 基本資料:", userWithAvatar);
        }
      }

      setIsAuthenticated(true);
      setUser(userWithAvatar);
      setToken(token);

      const avatarUrl = userWithAvatar.avatar || userWithAvatar.avatar_url;
      if (avatarUrl) {
        updateAvatarStorage(avatarUrl);
      }

      // 觸發多個登入成功事件 - 確保其他組件能接收到
      setTimeout(() => {
        window.dispatchEvent(new Event("userLoggedIn"));
        window.dispatchEvent(new Event("loginStateChange"));
        window.dispatchEvent(new CustomEvent("authStateChanged"));
        window.dispatchEvent(new CustomEvent("tokenChanged"));

        if (process.env.NODE_ENV === "development") {
          console.log("📡 已觸發所有一般用戶登入成功事件");
        }
      }, 100);

      // 再次觸發，確保覆蓋
      setTimeout(() => {
        window.dispatchEvent(new Event("userLoggedIn"));
        window.dispatchEvent(new CustomEvent("authStateChanged"));

        if (process.env.NODE_ENV === "development") {
          console.log("📡 已觸發第二輪一般用戶登入事件");
        }
      }, 500);

      if (process.env.NODE_ENV === "development") {
        console.log("✅ 一般用戶登入流程完成:", userWithAvatar?.email);
      }
      return { success: true, user: userWithAvatar };
    } catch (error) {
      console.error("一般用戶登入過程發生錯誤:", error);

      // 根據錯誤類型返回適當的錯誤訊息
      if (
        error.message.includes("API 不存在") ||
        error.message.includes("API 路徑配置")
      ) {
        return {
          success: false,
          error: "登入功能暫時無法使用，請確認系統配置或聯繫管理員",
        };
      } else if (error.message.includes("非預期的響應格式")) {
        return { success: false, error: "伺服器響應格式錯誤" };
      } else if (error.message.includes("Failed to fetch")) {
        return { success: false, error: "網路連線錯誤，請檢查網路狀態" };
      } else {
        return { success: false, error: error.message || "登入過程發生錯誤" };
      }
    }
  };

  // 🔥 Firebase 登入 - 保持原有邏輯不變
  const loginWithFirebase = async (firebaseUser, firebaseToken) => {
    try {
      if (process.env.NODE_ENV === "development") {
        console.log("🔐 Firebase 登入開始...");
        console.log("📧 Firebase 用戶資料:", {
          email: firebaseUser.email,
          name: firebaseUser.displayName,
          uid: firebaseUser.uid,
        });
      }

      localStorage.setItem("token", firebaseToken);

      // 🔥 關鍵修復：先設置基本用戶資料，再嘗試 API
      const basicUserData = {
        email: firebaseUser.email,
        name: firebaseUser.displayName || firebaseUser.email?.split("@")[0],
        nickname: firebaseUser.displayName,
        avatar: firebaseUser.photoURL,
      };

      // 先設置基本資料，確保 Navbar 能立即顯示用戶名
      const basicUserWithAvatar = processUserAvatar(basicUserData);

      setUser(basicUserWithAvatar);
      setIsAuthenticated(true);
      setToken(firebaseToken);

      if (process.env.NODE_ENV === "development") {
        console.log("✅ Firebase 基本用戶資料已設置:", basicUserWithAvatar);
      }

      // 立即觸發事件，讓 UI 更新
      setTimeout(() => {
        window.dispatchEvent(new Event("userLoggedIn"));
        window.dispatchEvent(new Event("loginStateChange"));
        window.dispatchEvent(new CustomEvent("authStateChanged"));
        window.dispatchEvent(new CustomEvent("tokenChanged"));

        if (process.env.NODE_ENV === "development") {
          console.log("📡 Firebase 基本登入事件已觸發");
        }
      }, 100);

      // 然後嘗試獲取完整資料（可能失敗但不影響基本功能）
      try {
        const fullUserData = await fetchUserProfile(firebaseToken, true);

        if (fullUserData) {
          // 如果成功獲取到完整資料，更新用戶狀態
          const fullUserWithAvatar = processUserAvatar(fullUserData);
          setUser(fullUserWithAvatar);

          if (process.env.NODE_ENV === "development") {
            console.log("✅ Firebase 完整用戶資料已更新:", fullUserWithAvatar);
          }

          // 再次觸發事件
          setTimeout(() => {
            window.dispatchEvent(new CustomEvent("authStateChanged"));
          }, 200);
        } else {
          if (process.env.NODE_ENV === "development") {
            console.log("⚠️ 無法獲取 Firebase 完整資料，使用基本資料");
          }
        }
      } catch (apiError) {
        console.warn("⚠️ Firebase API 調用失敗，但基本登入成功:", apiError);
      }

      // 處理頭像
      const finalAvatar =
        basicUserWithAvatar.avatar || basicUserWithAvatar.avatar_url;
      if (finalAvatar) {
        updateAvatarStorage(finalAvatar);
      }

      // 第二輪事件觸發
      setTimeout(() => {
        window.dispatchEvent(new CustomEvent("authStateChanged"));

        if (process.env.NODE_ENV === "development") {
          console.log("📡 Firebase 第二輪事件已觸發");
        }
      }, 500);

      if (process.env.NODE_ENV === "development") {
        console.log("✅ Firebase 登入流程完成");
      }

      return { success: true };
    } catch (error) {
      console.error("❌ Firebase 登入失敗:", error);
      return { success: false, error: error.message };
    }
  };

  // 登出函數
  const logout = () => {
    if (process.env.NODE_ENV === "development") {
      console.log("🚪 用戶登出");
    }
    handleLogout();
  };

  // 內部登出處理
  const handleLogout = () => {
    localStorage.removeItem("token");
    localStorage.removeItem("userAvatar");

    setIsAuthenticated(false);
    setUser(null);
    setToken(null);

    hasInitialized.current = false;
    isCheckingAuth.current = false;

    // 觸發登出事件
    setTimeout(() => {
      window.dispatchEvent(new Event("userLoggedOut"));
      window.dispatchEvent(new Event("loginStateChange"));
      window.dispatchEvent(new CustomEvent("authStateChanged"));

      if (process.env.NODE_ENV === "development") {
        console.log("📡 已觸發登出事件");
      }
    }, 100);

    if (process.env.NODE_ENV === "development") {
      console.log("✅ 登出完成");
    }
  };

  // 更新用戶資料
  const updateUser = useCallback(
    (newUserData) => {
      const now = Date.now();
      if (now - lastUpdateTime.current < 1000) {
        return;
      }
      lastUpdateTime.current = now;

      if (process.env.NODE_ENV === "development") {
        console.log("📝 更新用戶資料:", newUserData?.email || "無 email");
      }

      setUser((prevUser) => {
        const updatedUser = {
          ...prevUser,
          ...newUserData,
        };

        const newAvatar = newUserData?.avatar || newUserData?.avatar_url;
        if (
          newAvatar &&
          newAvatar !== prevUser?.avatar &&
          newAvatar !== prevUser?.avatar_url
        ) {
          updateAvatarStorage(newAvatar);
        }

        return updatedUser;
      });
    },
    [updateAvatarStorage]
  );

  // 刷新用戶資料
  const refreshUser = async () => {
    if (!token || isCheckingAuth.current) {
      if (process.env.NODE_ENV === "development") {
        console.log("⚠️ 無 token 或正在檢查認證，跳過刷新");
      }
      return;
    }

    try {
      if (process.env.NODE_ENV === "development") {
        console.log("🔄 刷新用戶資料...");
      }

      const userData = await fetchUserProfile(token);

      if (userData) {
        const userWithAvatar = processUserAvatar(userData);
        setUser(userWithAvatar);

        const avatarUrl = userWithAvatar.avatar || userWithAvatar.avatar_url;
        if (avatarUrl) {
          updateAvatarStorage(avatarUrl);
        }

        // 觸發更新事件
        setTimeout(() => {
          window.dispatchEvent(new CustomEvent("authStateChanged"));
        }, 100);

        if (process.env.NODE_ENV === "development") {
          console.log("✅ 用戶資料刷新成功");
        }
      } else {
        console.error("❌ 刷新用戶資料失敗");
      }
    } catch (error) {
      console.error("刷新用戶資料錯誤:", error);
    }
  };

  // 手動觸發頭像重新載入
  const reloadAvatar = async () => {
    if (!token) {
      if (process.env.NODE_ENV === "development") {
        console.log("⚠️ 無 token，無法重新載入頭像");
      }
      return false;
    }

    try {
      if (process.env.NODE_ENV === "development") {
        console.log("🔄 手動重新載入頭像...");
      }

      const userData = await fetchUserProfile(token);

      if (userData) {
        const userWithAvatar = processUserAvatar(userData);

        // 更新 AuthContext 中的用戶資料
        setUser((prevUser) => ({
          ...prevUser,
          ...userWithAvatar,
        }));

        // 同步到 localStorage
        const finalAvatar = userWithAvatar.avatar || userWithAvatar.avatar_url;
        if (finalAvatar) {
          updateAvatarStorage(finalAvatar);
        }

        if (process.env.NODE_ENV === "development") {
          console.log("✅ 頭像重新載入成功:", finalAvatar);
        }
        return true;
      } else {
        if (process.env.NODE_ENV === "development") {
          console.log("ℹ️ 無法獲取用戶資料");
        }
        return false;
      }
    } catch (error) {
      console.error("❌ 重新載入頭像異常:", error);
      return false;
    }
  };

  const hasPermission = (permission) => {
    return isAuthenticated;
  };

  const value = {
    isAuthenticated,
    user,
    token,
    isLoading,
    login,
    loginWithFirebase,
    logout,
    updateUser,
    refreshUser,
    reloadAvatar,
    checkAuthStatus,
    hasPermission,
    isLoggedIn: isAuthenticated,
    userEmail: user?.email,
    userName: user?.name,
    userAvatar: user?.avatar || user?.avatar_url,
  };

  return <AuthContext.Provider value={value}>{children}</AuthContext.Provider>;
}

export function useAuth() {
  const context = useContext(AuthContext);
  if (!context) {
    throw new Error("useAuth must be used within an AuthProvider");
  }
  return context;
}
