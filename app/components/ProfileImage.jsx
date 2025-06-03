import { useState, useCallback, useEffect, useRef } from "react";
import { useAuth } from "@/app/contexts/AuthContext";
import Cropper from "react-easy-crop";
import Slider from "@mui/material/Slider";
import { toast } from "sonner";
import { Button } from "./ui/button";

export default function ProfileImage({
  onAvatarChange,
  userName,
  currentAvatar,
}) {
  const {
    user,
    token,
    isAuthenticated,
    isLoading: authLoading,
    refreshUser,
  } = useAuth();

  const [profileImage, setProfileImage] = useState(null);
  const [originalImage, setOriginalImage] = useState(null);
  const [imageSrc, setImageSrc] = useState(null);
  const [isEditing, setIsEditing] = useState(false);
  const [crop, setCrop] = useState({ x: 0, y: 0 });
  const [zoom, setZoom] = useState(1);
  const [croppedAreaPixels, setCroppedAreaPixels] = useState(null);
  const [isUploading, setIsUploading] = useState(false);
  const [isLoadingAvatar, setIsLoadingAvatar] = useState(false);

  // 使用 ref 來追蹤載入狀態，避免重複調用
  const isLoadingRef = useRef(false);
  const lastLoadTimeRef = useRef(0);
  const hasInitializedRef = useRef(false);

  // 生成簡單的字符串哈希
  const simpleHash = (str) => {
    let hash = 0;
    for (let i = 0; i < str.length; i++) {
      const char = str.charCodeAt(i);
      hash = (hash << 5) - hash + char;
      hash = hash & hash;
    }
    return Math.abs(hash).toString(16).substring(0, 8);
  };

  // 生成預設頭像的函數 - 與 AuthContext 保持一致
  const getDefaultAvatar = (name, email) => {
    if (!name && !email) {
      return "https://www.gravatar.com/avatar/default?s=200&d=identicon&r=pg";
    }

    const displayName = name || (email ? email.split("@")[0] : "");
    if (!displayName) {
      return "https://www.gravatar.com/avatar/default?s=200&d=identicon&r=pg";
    }

    try {
      const firstChar = displayName.charAt(0).toUpperCase();
      const hash = simpleHash(displayName + firstChar);
      return `https://www.gravatar.com/avatar/${hash}?s=200&d=identicon&r=pg`;
    } catch (error) {
      console.warn("生成預設頭像失敗:", error);
      return `https://www.gravatar.com/avatar/default?s=200&d=identicon&r=pg`;
    }
  };

  // 🔥 檢測 token 類型的函數
  const detectTokenType = (token) => {
    if (!token) return null;

    try {
      // JWT token 有三個部分，用 . 分隔
      const parts = token.split(".");
      if (parts.length === 3) {
        // 嘗試解析 JWT payload
        const payload = JSON.parse(atob(parts[1]));
        if (payload.userId) {
          return "jwt";
        }
      }

      // 如果不是標準 JWT 格式，可能是 Firebase token
      // Firebase ID token 通常更長且有不同的結構
      if (token.length > 500) {
        return "firebase";
      }

      return "unknown";
    } catch (error) {
      console.log("🔍 Token 類型檢測失敗:", error);
      return "firebase"; // 默認假設是 Firebase token
    }
  };

  // 🔥 加強版 API 調用函數，支援 Firebase token
  const makeAPIRequest = async (url, options = {}, retries = 2) => {
    const tokenType = detectTokenType(token);
    console.log(`🔍 檢測到 token 類型: ${tokenType}`);

    for (let attempt = 1; attempt <= retries; attempt++) {
      try {
        console.log(`📡 [嘗試 ${attempt}/${retries}] 調用 API: ${url}`);

        const response = await fetch(url, {
          ...options,
          headers: {
            Authorization: `Bearer ${token}`,
            "Content-Type": "application/json",
            ...options.headers,
          },
        });

        console.log(`📡 API 回應狀態: ${response.status}`);

        if (response.ok) {
          return response;
        } else if (
          response.status === 401 &&
          tokenType === "firebase" &&
          attempt < retries
        ) {
          // 如果是 Firebase token 的 401 錯誤，等待並重試
          console.log(
            `⚠️ Firebase token 401 錯誤，等待 ${attempt * 2} 秒後重試...`
          );
          await new Promise((resolve) => setTimeout(resolve, attempt * 2000));
          continue;
        } else {
          console.error(`❌ API 請求失敗: ${response.status}`);
          const errorText = await response.text();
          console.error(`❌ 錯誤內容:`, errorText);
          return response;
        }
      } catch (error) {
        console.error(`❌ [嘗試 ${attempt}/${retries}] API 請求異常:`, error);
        if (attempt === retries) {
          throw error;
        }
        await new Promise((resolve) => setTimeout(resolve, 1000));
      }
    }

    throw new Error("所有重試嘗試都失敗了");
  };

  // 🔥 改進的 API 載入頭像函數
  const loadAvatarFromAPI = async (source = "unknown") => {
    const now = Date.now();

    // 防止短時間內重複調用
    if (isLoadingRef.current || now - lastLoadTimeRef.current < 1000) {
      console.log(`⚠️ [${source}] 跳過重複的 API 調用`);
      return false;
    }

    if (!token) {
      console.log(`❌ [${source}] 沒有 token`);
      return false;
    }

    try {
      isLoadingRef.current = true;
      lastLoadTimeRef.current = now;
      setIsLoadingAvatar(true);

      console.log(`🔍 [${source}] 開始從 API 載入頭像...`);

      const response = await makeAPIRequest(
        "/api/accountCenter/profile/account",
        {
          method: "GET",
        }
      );

      if (response.ok) {
        const data = await response.json();
        console.log(`📄 [${source}] API 回應資料:`, data);

        const apiAvatar = data.data?.avatar || data.data?.avatar_url;

        if (apiAvatar && !apiAvatar.includes("gravatar.com/avatar/default")) {
          console.log(`✅ [${source}] API 返回真實頭像:`, apiAvatar);
          setProfileImage(apiAvatar);
          setOriginalImage(apiAvatar);
          localStorage.setItem("userAvatar", apiAvatar);

          // 觸發頭像更新事件
          window.dispatchEvent(
            new CustomEvent("avatarUpdate", {
              detail: { newAvatar: apiAvatar },
            })
          );

          console.log(`📡 [${source}] 已觸發頭像更新事件`);
          return true;
        } else {
          console.log(`ℹ️ [${source}] API 返回無有效頭像資料`);
          return false;
        }
      } else {
        console.log(`⚠️ [${source}] API 請求失敗:`, response.status);
        return false;
      }
    } catch (error) {
      console.error(`❌ [${source}] 獲取 API 頭像失敗:`, error);
      return false;
    } finally {
      isLoadingRef.current = false;
      setIsLoadingAvatar(false);
    }
  };

  // 獲取當前應該顯示的頭像
  const getCurrentDisplayAvatar = () => {
    const currentName = userName || user?.name || user?.nickname;
    const currentEmail = user?.email;

    // 1. 如果有設定的 profileImage（通常是用戶上傳的）
    if (profileImage && !profileImage.includes("gravatar.com/avatar/default")) {
      return profileImage;
    }

    // 2. 優先使用 AuthContext 中的頭像（但不是預設的）
    const authAvatar = user?.avatar || user?.avatar_url;
    if (authAvatar && !authAvatar.includes("gravatar.com/avatar/default")) {
      return authAvatar;
    }

    // 3. 檢查傳入的 currentAvatar
    if (
      currentAvatar &&
      !currentAvatar.includes("gravatar.com/avatar/default")
    ) {
      return currentAvatar;
    }

    // 4. 檢查 localStorage（但不是預設的）
    const localAvatar = localStorage.getItem("userAvatar");
    if (localAvatar && !localAvatar.includes("gravatar.com/avatar/default")) {
      return localAvatar;
    }

    // 5. 生成預設頭像
    return getDefaultAvatar(currentName, currentEmail);
  };

  // 主要的頭像初始化邏輯
  useEffect(() => {
    const initializeAvatar = async () => {
      // 等待 AuthContext 完成載入
      if (authLoading) {
        console.log("⏳ ProfileImage 等待 AuthContext 載入完成...");
        return;
      }

      // 如果已經初始化過，跳過
      if (hasInitializedRef.current) {
        console.log("✅ ProfileImage 頭像已初始化，跳過");
        return;
      }

      console.log("🔍 ProfileImage 開始初始化頭像載入...", {
        isAuthenticated,
        hasUser: !!user,
        hasToken: !!token,
        tokenType: detectTokenType(token),
        currentAvatar,
        userAvatar: user?.avatar || user?.avatar_url,
      });

      if (!isAuthenticated || !user) {
        console.log("❌ 用戶未登入或無用戶資料");
        hasInitializedRef.current = true;
        return;
      }

      const displayAvatar = getCurrentDisplayAvatar();
      setProfileImage(displayAvatar);
      setOriginalImage(displayAvatar);

      // 如果是真實頭像（非預設），儲存到 localStorage
      if (displayAvatar && !displayAvatar.includes("gravatar.com")) {
        localStorage.setItem("userAvatar", displayAvatar);
      }

      console.log("✅ ProfileImage 初始化完成，頭像:", displayAvatar);
      hasInitializedRef.current = true;

      // 🔥 對於 Firebase 用戶，等待更久再嘗試 API
      const tokenType = detectTokenType(token);
      if (!displayAvatar || displayAvatar.includes("gravatar.com")) {
        const delay = tokenType === "firebase" ? 3000 : 1000;
        console.log(`🔄 ProfileImage 將在 ${delay}ms 後嘗試從 API 載入頭像`);

        setTimeout(async () => {
          await loadAvatarFromAPI("初始化-檢查API");
        }, delay);
      }
    };

    initializeAvatar();
  }, [authLoading, isAuthenticated, user, token, currentAvatar]);

  // 監聽 AuthContext 的用戶變化
  useEffect(() => {
    if (!authLoading && user && hasInitializedRef.current) {
      const authAvatar = user.avatar || user.avatar_url;

      // 只有當 AuthContext 有真實頭像且與當前不同時才更新
      if (
        authAvatar &&
        !authAvatar.includes("gravatar.com/avatar/default") &&
        authAvatar !== profileImage
      ) {
        console.log("🔄 ProfileImage AuthContext 用戶頭像變化:", authAvatar);
        setProfileImage(authAvatar);
        setOriginalImage(authAvatar);
        localStorage.setItem("userAvatar", authAvatar);
      }
    }
  }, [user, authLoading, profileImage]);

  // 監聽登入狀態變化
  useEffect(() => {
    const handleAuthStateChange = async () => {
      if (!isAuthenticated) {
        console.log("🚪 ProfileImage 用戶登出，清空頭像");
        setProfileImage(null);
        setOriginalImage(null);
        localStorage.removeItem("userAvatar");
        hasInitializedRef.current = false;
        isLoadingRef.current = false;
        lastLoadTimeRef.current = 0;
      } else if (token && !authLoading && !hasInitializedRef.current) {
        console.log("👤 ProfileImage 用戶登入，重新初始化頭像");

        // 🔥 根據 token 類型決定等待時間
        const tokenType = detectTokenType(token);
        const delay = tokenType === "firebase" ? 2000 : 500;

        setTimeout(async () => {
          const displayAvatar = getCurrentDisplayAvatar();
          setProfileImage(displayAvatar);
          setOriginalImage(displayAvatar);
          hasInitializedRef.current = true;

          // 如果是預設頭像，嘗試從 API 載入
          if (displayAvatar.includes("gravatar.com")) {
            await loadAvatarFromAPI("登入狀態變化");
          }
        }, delay);
      }
    };

    handleAuthStateChange();
  }, [isAuthenticated, token, authLoading]);

  // 監聽外部事件（簡化版）
  useEffect(() => {
    const handleStorageChange = () => {
      const savedAvatar = localStorage.getItem("userAvatar");
      if (
        savedAvatar &&
        savedAvatar !== profileImage &&
        !savedAvatar.includes("gravatar.com/avatar/default") &&
        isAuthenticated
      ) {
        console.log("📝 ProfileImage 從 storage 更新頭像:", savedAvatar);
        setProfileImage(savedAvatar);
        setOriginalImage(savedAvatar);
      }
    };

    const handleAvatarUpdate = (event) => {
      const newAvatar = event.detail?.newAvatar;
      if (
        newAvatar &&
        newAvatar !== profileImage &&
        !newAvatar.includes("gravatar.com/avatar/default")
      ) {
        console.log("📝 ProfileImage 從事件更新頭像:", newAvatar);
        setProfileImage(newAvatar);
        setOriginalImage(newAvatar);
      }
    };

    window.addEventListener("storage", handleStorageChange);
    window.addEventListener("avatarUpdate", handleAvatarUpdate);

    return () => {
      window.removeEventListener("storage", handleStorageChange);
      window.removeEventListener("avatarUpdate", handleAvatarUpdate);
    };
  }, [profileImage, isAuthenticated]);

  const handleImageUpload = (event) => {
    const file = event.target.files[0];
    if (!file) return;

    if (!file.type.startsWith("image/")) {
      toast.error("請上傳圖片檔案");
      return;
    }

    if (file.size > 5 * 1024 * 1024) {
      toast.error("圖片大小不能超過 5MB");
      return;
    }

    const reader = new FileReader();
    reader.onload = () => {
      const uploadedImage = reader.result;
      setOriginalImage(uploadedImage);
      setImageSrc(uploadedImage);
      setIsEditing(true);
      setZoom(1);
      setCrop({ x: 0, y: 0 });
    };
    reader.onerror = () => {
      toast.error("圖片讀取失敗");
    };
    reader.readAsDataURL(file);
  };

  const handleEditImage = () => {
    if (!profileImage) {
      toast.error("請先上傳圖片");
      return;
    }

    if (profileImage.startsWith("http")) {
      fetch(profileImage)
        .then((response) => response.blob())
        .then((blob) => {
          const reader = new FileReader();
          reader.onloadend = () => {
            const base64data = reader.result;
            setImageSrc(base64data);
            setOriginalImage(base64data);
            setIsEditing(true);
            setZoom(1);
            setCrop({ x: 0, y: 0 });
          };
          reader.readAsDataURL(blob);
        })
        .catch((error) => {
          console.error("Failed to load image:", error);
          toast.error("無法載入圖片進行編輯");
        });
    } else {
      setImageSrc(profileImage);
      setOriginalImage(profileImage);
      setIsEditing(true);
      setZoom(1);
      setCrop({ x: 0, y: 0 });
    }
  };

  const onCropComplete = useCallback((croppedArea, croppedAreaPixels) => {
    setCroppedAreaPixels(croppedAreaPixels);
  }, []);

  const getCroppedImage = async () => {
    try {
      if (!originalImage || !croppedAreaPixels) {
        toast.error("請先選擇並裁剪圖片");
        return null;
      }

      const image = new Image();
      if (originalImage.startsWith("http")) {
        image.crossOrigin = "anonymous";
      }
      image.src = originalImage;

      return new Promise((resolve, reject) => {
        image.onload = () => {
          const canvas = document.createElement("canvas");
          const ctx = canvas.getContext("2d");

          canvas.width = croppedAreaPixels.width;
          canvas.height = croppedAreaPixels.height;

          ctx.drawImage(
            image,
            croppedAreaPixels.x,
            croppedAreaPixels.y,
            croppedAreaPixels.width,
            croppedAreaPixels.height,
            0,
            0,
            croppedAreaPixels.width,
            croppedAreaPixels.height
          );

          canvas.toBlob(
            (blob) => {
              if (!blob) {
                toast.error("圖片處理失敗");
                resolve(null);
                return;
              }
              resolve(blob);
            },
            "image/jpeg",
            0.9
          );
        };

        image.onerror = () => {
          console.error("圖片載入失敗");
          toast.error("圖片載入失敗");
          resolve(null);
        };
      });
    } catch (error) {
      console.error("裁剪圖片失敗:", error);
      toast.error("圖片裁剪過程發生錯誤");
      return null;
    }
  };

  // 上傳到 Cloudinary
  const uploadToCloudinary = async (imageBlob) => {
    try {
      const cloudName = process.env.NEXT_PUBLIC_CLOUDINARY_CLOUD_NAME;
      const uploadPreset = process.env.NEXT_PUBLIC_CLOUDINARY_UPLOAD_PRESET;

      if (!cloudName || !uploadPreset) {
        throw new Error("Cloudinary 環境變數未設定");
      }

      const formData = new FormData();
      formData.append("file", imageBlob);
      formData.append("upload_preset", uploadPreset);

      const response = await fetch(
        `https://api.cloudinary.com/v1_1/${cloudName}/image/upload`,
        {
          method: "POST",
          body: formData,
        }
      );

      if (!response.ok) {
        const errorText = await response.text();
        console.error("Cloudinary 錯誤:", errorText);
        throw new Error("Cloudinary 上傳失敗");
      }

      const data = await response.json();
      return data.secure_url;
    } catch (error) {
      console.error("Cloudinary 上傳錯誤:", error);
      throw error;
    }
  };

  // 🔥 改進的後端同步函數，支援 Firebase token
  const syncToBackend = async (avatarUrl) => {
    console.log("🔄 === 開始後端同步 ===");

    if (!token) {
      console.log("❌ 沒有 token，跳過後端同步");
      return { success: false, reason: "no_token" };
    }

    const tokenType = detectTokenType(token);
    console.log(`🔍 同步使用的 token 類型: ${tokenType}`);

    try {
      console.log("📷 同步頭像到後端:", avatarUrl);

      const response = await makeAPIRequest(
        "/api/accountCenter/profile/account",
        {
          method: "PUT",
          headers: {
            "Content-Type": "application/json",
          },
          body: JSON.stringify({ avatar_url: avatarUrl }),
        },
        3
      ); // Firebase token 需要更多重試次數

      if (response.ok) {
        try {
          const responseText = await response.text();
          console.log(`📄 後端回應內容:`, responseText);

          let responseData;
          try {
            responseData = JSON.parse(responseText);
          } catch (parseError) {
            responseData = { message: responseText };
          }

          console.log("✅ 後端同步成功:", responseData);

          // 同步成功後，更新 AuthContext
          if (refreshUser) {
            setTimeout(() => {
              refreshUser();
            }, 500);
          }

          return { success: true, data: responseData };
        } catch (parseError) {
          console.log("✅ 後端同步成功 (解析錯誤但狀態 OK)");
          return { success: true, data: "同步成功" };
        }
      } else {
        const responseText = await response.text();
        console.error(`❌ 後端同步失敗: ${response.status} - ${responseText}`);
        return {
          success: false,
          reason: "api_error",
          status: response.status,
          message: responseText,
        };
      }
    } catch (error) {
      console.error("❌ 後端同步異常:", error);
      return {
        success: false,
        reason: "network_error",
        error: error.message,
      };
    }
  };

  const handleSaveImage = async () => {
    if (isUploading) return;

    setIsUploading(true);

    try {
      console.log("🎬 === 開始處理圖片上傳流程 ===");

      const tokenType = detectTokenType(token);
      console.log(`🔍 上傳使用的 token 類型: ${tokenType}`);

      const croppedBlob = await getCroppedImage();
      if (!croppedBlob) {
        toast.error("圖片處理失敗");
        return;
      }

      const cloudinaryUrl = await uploadToCloudinary(croppedBlob);
      if (!cloudinaryUrl) {
        throw new Error("Cloudinary 上傳失敗");
      }

      console.log("✅ Cloudinary 上傳成功:", cloudinaryUrl);

      // 立即更新本地狀態
      setProfileImage(cloudinaryUrl);
      setOriginalImage(cloudinaryUrl);
      localStorage.setItem("userAvatar", cloudinaryUrl);

      if (onAvatarChange) {
        onAvatarChange(cloudinaryUrl);
      }

      // 觸發事件通知其他組件
      window.dispatchEvent(
        new CustomEvent("avatarUpdate", {
          detail: { newAvatar: cloudinaryUrl },
        })
      );
      window.dispatchEvent(new Event("storage"));

      toast.success("頭像更新成功！");
      setIsEditing(false);

      // 🔥 根據 token 類型調整同步延遲
      const syncDelay = tokenType === "firebase" ? 2000 : 500;
      console.log(`⏰ 將在 ${syncDelay}ms 後同步到後端`);

      setTimeout(async () => {
        const syncResult = await syncToBackend(cloudinaryUrl);
        if (syncResult.success) {
          console.log("頭像已同步到伺服器！");
        } else {
          console.warn("同步失敗詳情:", syncResult);
          if (tokenType === "firebase") {
            toast.warning("頭像已更新，伺服器同步可能需要稍等片刻");
          } else {
            toast.warning("頭像已更新，但未能同步到伺服器");
          }
        }
      }, syncDelay);
    } catch (error) {
      console.error("❌ 上傳頭像失敗:", error);
      toast.error(`上傳失敗: ${error.message}`);
    } finally {
      setIsUploading(false);
    }
  };

  // 手動重新載入頭像
  const handleForceReload = async () => {
    console.log("🔄 ProfileImage 強制重新載入頭像...");
    hasInitializedRef.current = false;
    isLoadingRef.current = false;
    lastLoadTimeRef.current = 0;

    if (refreshUser) {
      await refreshUser();
    }

    // 重新初始化
    const displayAvatar = getCurrentDisplayAvatar();
    setProfileImage(displayAvatar);
    setOriginalImage(displayAvatar);

    const success = await loadAvatarFromAPI("手動重新載入");
    hasInitializedRef.current = true;

    if (success) {
      toast.success("頭像已重新載入");
    } else {
      toast.info("目前沒有設定頭像");
    }
  };

  const displayName = userName || user?.name || user?.nickname;
  const displayAvatar = getCurrentDisplayAvatar();

  return (
    <div className="flex flex-col items-center col-span-1">
      <div className="w-36 h-36 bg-gray-300 rounded-full overflow-hidden flex items-center justify-center relative">
        {isLoadingAvatar && (
          <div className="absolute inset-0 bg-black bg-opacity-20 flex items-center justify-center">
            <div className="w-8 h-8 border-2 border-white border-t-transparent rounded-full animate-spin"></div>
          </div>
        )}
        {displayAvatar ? (
          <img
            src={displayAvatar}
            alt="大頭照"
            className="w-full h-full object-cover"
            crossOrigin="anonymous"
            key={displayAvatar}
            onError={(e) => {
              console.error("ProfileImage 頭像載入失敗:", displayAvatar);
              // 如果載入失敗，顯示預設頭像
              const defaultAvatar = getDefaultAvatar(displayName, user?.email);
              if (e.target.src !== defaultAvatar) {
                e.target.src = defaultAvatar;
              }
            }}
          />
        ) : (
          <span className="text-gray-700">上傳大頭照</span>
        )}
      </div>

      <div className="flex flex-col justify-center gap-4 mt-2">
        <label
          htmlFor="imageUpload"
          className="text-[#101828] cursor-pointer hover:text-[#AFC16D]"
        >
          上傳照片
        </label>
        <input
          id="imageUpload"
          type="file"
          accept="image/*"
          className="hidden"
          onChange={handleImageUpload}
          disabled={isUploading}
        />
        {displayAvatar && (
          <button
            onClick={handleEditImage}
            className="text-[#101828] cursor-pointer hover:text-[#AFC16D]"
            disabled={isUploading}
          >
            編輯照片
          </button>
        )}
      </div>

      {isEditing && (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50">
          <div className="bg-white p-4 rounded-lg shadow-lg w-[90%] max-w-lg">
            <h2 className="text-lg font-bold mb-4 text-center">編輯圖片</h2>
            <div className="relative w-full h-64 bg-gray-200 rounded-lg overflow-hidden">
              <Cropper
                image={imageSrc}
                crop={crop}
                zoom={zoom}
                aspect={1}
                onCropChange={setCrop}
                onZoomChange={setZoom}
                onCropComplete={onCropComplete}
                cropShape="round"
                crossOrigin="anonymous"
              />
            </div>
            <div className="mt-4">
              <Slider
                value={zoom}
                min={1}
                max={3}
                step={0.1}
                onChange={(e, zoom) => setZoom(zoom)}
              />
            </div>
            <div className="flex justify-end mt-4 gap-2">
              <Button
                onClick={() => setIsEditing(false)}
                className="px-4 py-2 rounded"
                disabled={isUploading}
              >
                取消
              </Button>
              <Button
                onClick={handleSaveImage}
                className="px-4 py-2 text-white rounded disabled:bg-gray-400"
                disabled={isUploading}
              >
                {isUploading ? "上傳中..." : "保存"}
              </Button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
