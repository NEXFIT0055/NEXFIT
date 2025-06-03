"use client";

import React, { useState, useEffect } from "react";
import { toast } from "sonner";
import { useAuth } from "@/app/contexts/AuthContext";
import {
  AlertDialog,
  AlertDialogAction,
  AlertDialogCancel,
  AlertDialogContent,
  AlertDialogDescription,
  AlertDialogFooter,
  AlertDialogHeader,
  AlertDialogTitle,
  AlertDialogTrigger,
} from "@/app/components/ui/alert-dialog";
import { FaPen } from "react-icons/fa";
import { FaCheck } from "react-icons/fa";
import ProfileImage from "@/app/components/ProfileImage";

const SkeletonLoader = () => {
  return (
    <div className="p-10 w-4/5 h-full mt-10 ml-10 mr-15 border border-borderColor rounded-lg">
      {/* 標題 */}
      <div className="h-8 bg-gray-200 rounded-md mb-6 w-48 animate-pulse"></div>
      <div className="flex flex-col lg:flex-row lg:gap-8">
        {/* 表單 */}
        <div className="mb-6 w-full lg:w-3/5 order-2 lg:order-1">
          {/* 姓名 */}
          <div className="flex items-center my-5 border-b border-gray-200 pb-2">
            <div className="flex items-center w-full">
              <div className="h-4 bg-gray-200 rounded w-12 animate-pulse mr-2"></div>
              <div className="h-4 bg-gray-200 rounded flex-1 animate-pulse"></div>
            </div>
          </div>

          {/* 暱稱 */}
          <div className="flex items-center my-5 border-b border-gray-200 pb-2">
            <div className="flex items-center w-full">
              <div className="h-4 bg-gray-200 rounded w-12 animate-pulse mr-2"></div>
              <div className="h-4 bg-gray-200 rounded flex-1 animate-pulse mr-2"></div>
              <div className="h-4 w-4 bg-gray-200 rounded animate-pulse"></div>
            </div>
          </div>

          {/* 電子信箱 */}
          <div className="flex items-center my-5 border-b border-gray-200 pb-2">
            <div className="flex items-center w-full">
              <div className="h-4 bg-gray-200 rounded w-16 animate-pulse mr-2"></div>
              <div className="h-4 bg-gray-200 rounded flex-1 animate-pulse"></div>
            </div>
          </div>

          {/* 手機號碼 */}
          <div className="flex items-center my-5 border-b border-gray-200 pb-2">
            <div className="flex items-center w-full">
              <div className="h-4 bg-gray-200 rounded w-16 animate-pulse mr-2"></div>
              <div className="h-4 bg-gray-200 rounded flex-1 animate-pulse mr-2"></div>
              <div className="h-4 w-4 bg-gray-200 rounded animate-pulse"></div>
            </div>
          </div>

          {/* 地址 */}
          <div className="flex items-center my-5 border-b border-gray-200 pb-2">
            <div className="flex items-center w-full">
              <div className="h-4 bg-gray-200 rounded w-12 animate-pulse mr-2"></div>
              <div className="h-4 bg-gray-200 rounded flex-1 animate-pulse mr-2"></div>
              <div className="h-4 w-4 bg-gray-200 rounded animate-pulse"></div>
            </div>
          </div>

          {/* 生日 */}
          <div className="flex items-center my-5 border-b border-gray-200 pb-2">
            <div className="flex items-center w-full">
              <div className="h-4 bg-gray-200 rounded w-12 animate-pulse mr-2"></div>
              <div className="h-4 bg-gray-200 rounded flex-1 animate-pulse"></div>
            </div>
          </div>

          {/* 性別*/}
          <div className="flex gap-4 my-3">
            <div className="flex items-center gap-1">
              <div className="h-4 w-4 bg-gray-200 rounded-full animate-pulse"></div>
              <div className="h-4 bg-gray-200 rounded w-12 animate-pulse"></div>
            </div>
            <div className="flex items-center gap-1">
              <div className="h-4 w-4 bg-gray-200 rounded-full animate-pulse"></div>
              <div className="h-4 bg-gray-200 rounded w-12 animate-pulse"></div>
            </div>
          </div>

          {/* 訂閱 */}
          <div className="my-3 flex items-center gap-2">
            <div className="h-4 w-4 bg-gray-200 rounded animate-pulse"></div>
            <div className="h-4 bg-gray-200 rounded w-64 animate-pulse"></div>
          </div>
        </div>

        {/* 大頭貼 */}
        <div className="mb-6 w-full lg:w-auto lg:ml-36 flex justify-center order-1 lg:order-2">
          <div className="flex flex-col items-center gap-4">
            <div className="w-32 h-32 bg-gray-200 rounded-full animate-pulse"></div>
            <div className="h-8 bg-gray-200 rounded w-20 animate-pulse"></div>
          </div>
        </div>
      </div>

      {/* 確認按鈕 */}
      <div className="flex justify-center w-full my-6">
        <div className="w-28 sm:w-32 h-10 sm:h-12 bg-gray-200 rounded-lg animate-pulse"></div>
      </div>
    </div>
  );
};

const FormInput = ({
  label,
  type = "text",
  disabled = false,
  value = "",
  onChange,
  name,
  isEditing,
  onEditClick,
}) => (
  <div className="flex items-center my-5 border-b border-gray-200 pb-2 hover:border-gray-400 transition-colors">
    <label className="flex items-baseline w-full">
      <span className="text-fontColor whitespace-nowrap">{label}：</span>
      <input
        type={type}
        value={value}
        onChange={onChange}
        name={name}
        disabled={!isEditing}
        className={`bg-transparent border-none focus:outline-none w-full p-0 ml-0 ${
          isEditing ? "text-[#AFC16D]" : "text-[#101828]"
        }`}
        readOnly={!isEditing}
      />
      {!disabled && (
        <button
          onClick={onEditClick}
          className="ml-2 p-1 text-[#101828] hover:text-[#AFC16D] flex-shrink-0"
        >
          {isEditing ? <FaCheck /> : <FaPen />}
        </button>
      )}
    </label>
  </div>
);

export default function Page() {
  console.log("帳號基本資料頁面渲染");

  // 使用 AuthContext 獲取用戶資料
  const { user, isLoading, updateUser} = useAuth();

  const [userData, setUserData] = useState({
    name: "",
    nickname: "",
    email: "",
    phone: "",
    address: "",
    birthdate: "",
    gender: "",
    newsletter: false,
    avatar_url: "",
  });

  const [editingFields, setEditingFields] = useState({
    nickname: false,
    phone: false,
    address: false,
    gender: false,
    newsletter: false,
  });

  const [tempUserData, setTempUserData] = useState({});

  // 當 AuthContext 的 user 資料改變時，更新本地狀態
  useEffect(() => {
    if (user) {
      console.log("從 AuthContext 更新用戶資料:", user.email);
      const newUserData = {
        name: user.name || "",
        nickname: user.nickname || "",
        email: user.email || "",
        phone: user.phone || "",
        address: user.address || "",
        birthdate: user.birthdate || "",
        gender: user.gender || "",
        newsletter: user.newsletter || false,
        avatar_url: user.avatar || user.avatar_url || "",
      };
      setUserData(newUserData);

      // 同步更新 localStorage 中的頭像
      if (newUserData.avatar_url) {
        localStorage.setItem("userAvatar", newUserData.avatar_url);
        window.dispatchEvent(new Event("storage"));
      }
    }
  }, [user]);

  // 處理頭像更新事件
  useEffect(() => {
    const handleAvatarUpdate = (event) => {
      console.log("收到頭像更新事件", event.detail);

      if (event.detail?.newAvatar) {
        setUserData((prev) => ({
          ...prev,
          avatar_url: event.detail.newAvatar,
        }));

        // 更新 AuthContext 中的用戶資料
        updateUser({ avatar: event.detail.newAvatar });
      }
    };

    window.addEventListener("avatarUpdate", handleAvatarUpdate);
    return () => {
      window.removeEventListener("avatarUpdate", handleAvatarUpdate);
    };
  }, [updateUser]);

  const handleEditClick = (fieldName) => {
    setEditingFields((prev) => ({
      ...prev,
      [fieldName]: !prev[fieldName],
    }));
  };

  // 整合電子報功能
  const handleConfirmUpdate = async () => {
    try {
      console.log("開始更新用戶資料...");
      console.log("要更新的資料:", tempUserData);

      if (Object.keys(tempUserData).length === 0) {
        toast.info("沒有資料需要更新");
        return;
      }

      const errors = validateForm();
      if (Object.keys(errors).length > 0) {
        console.log("表單驗證錯誤:", errors);
        toast.error("請檢查輸入資料格式是否正確");
        return;
      }

      const token = localStorage.getItem("token");

      // 檢查是否有電子報訂閱變更
      const hasNewsletterChange = "newsletter" in tempUserData;
      const originalNewsletterStatus = userData.newsletter;
      const newNewsletterStatus = tempUserData.newsletter;

      // 1. 先更新基本資料（排除電子報）
      const basicData = { ...tempUserData };
      delete basicData.newsletter;

      if (Object.keys(basicData).length > 0) {
        const formData = new FormData();
        Object.keys(basicData).forEach((key) => {
          formData.append(key, basicData[key]);
        });

        const response = await fetch("/api/accountCenter/profile/account", {
          method: "PUT",
          headers: {
            Authorization: `Bearer ${token}`,
          },
          body: formData,
        });

        if (!response.ok) {
          const errorData = await response.json();
          throw new Error(errorData.message || "更新失敗");
        }

        const data = await response.json();
        console.log("✅ 基本資料更新成功:", data);

        // 更新本地狀態
        const updatedData = {
          ...userData,
          ...basicData,
        };

        if (data.data) {
          updatedData.avatar_url =
            data.data.avatar || data.data.avatar_url || userData.avatar_url;
        }

        setUserData(updatedData);
        updateUser(data.data || basicData);
      }

      // 2. 處理電子報訂閱變更
      if (hasNewsletterChange) {
        try {
          const newsletterResponse = await fetch("/api/newLetter/subscribe", {
            method: "POST",
            headers: {
              "Content-Type": "application/json",
              Authorization: `Bearer ${token}`,
            },
            body: JSON.stringify({
              newsletter: newNewsletterStatus,
            }),
          });

          const newsletterResult = await newsletterResponse.json();

          if (newsletterResult.success) {
            console.log("✅ 電子報設定更新成功");

            // 更新本地電子報狀態
            setUserData((prev) => ({
              ...prev,
              newsletter: newNewsletterStatus,
            }));

            updateUser({ newsletter: newNewsletterStatus });

            // 顯示相應的成功訊息
            if (newNewsletterStatus && !originalNewsletterStatus) {
              toast.success("電子報訂閱成功！歡迎信已發送到您的信箱 📧", {
                duration: 5000,
              });
            } else if (!newNewsletterStatus && originalNewsletterStatus) {
              toast.success("已取消電子報訂閱");
            }
          } else {
            console.error("電子報設定失敗:", newsletterResult.message);
            toast.error("電子報設定失敗: " + newsletterResult.message);
          }
        } catch (newsletterError) {
          console.error("電子報 API 調用失敗:", newsletterError);
          toast.error("電子報設定失敗，但其他資料已更新成功");
        }
      }

      // 清理狀態
      setTempUserData({});
      setEditingFields({
        nickname: false,
        phone: false,
        address: false,
        gender: false,
        newsletter: false,
      });

      // 如果沒有電子報變更，顯示一般成功訊息
      if (!hasNewsletterChange) {
        toast.success("資料更新成功");
      }
    } catch (error) {
      console.error("更新失敗:", error);
      toast.error(error.message || "更新失敗，請稍後再試");
    }
  };

  const handleCancelEdit = (fieldName) => {
    setEditingFields((prev) => ({
      ...prev,
      [fieldName]: false,
    }));
    setTempUserData((prev) => {
      const newTemp = { ...prev };
      delete newTemp[fieldName];
      return newTemp;
    });
  };

  const handleInputChange = (e) => {
    const { name, value, type, checked } = e.target;

    let formattedValue = value;

    if (name === "phone") {
      const cleaned = value.replace(/\D/g, "");
      if (cleaned.length > 10) return;
      formattedValue = cleaned;
    }

    setTempUserData((prev) => ({
      ...prev,
      [name]: type === "checkbox" ? checked : formattedValue,
    }));
  };

  //處理電子報
  const handleNewsletterChange = (e) => {
    const { checked } = e.target;

    setTempUserData((prev) => ({
      ...prev,
      newsletter: checked,
    }));

    // 顯示即時提示
    if (checked && !userData.newsletter) {
      toast.info("訂閱後將會收到歡迎信 📧", { duration: 3000 });
    }
  };

  const validateForm = () => {
    const errors = {};

    if (tempUserData.phone) {
      const phoneRegex = /^09\d{8}$/;
      if (!phoneRegex.test(tempUserData.phone)) {
        errors.phone = "手機號碼必須為09開頭的10位數字";
      }
    }

    if (tempUserData.address !== undefined && !tempUserData.address.trim()) {
      errors.address = "地址不能為空";
    }

    if (tempUserData.nickname !== undefined && !tempUserData.nickname.trim()) {
      errors.nickname = "暱稱不能為空";
    }

    return errors;
  };

  const getFieldValue = (fieldName) => {
    return fieldName in tempUserData
      ? tempUserData[fieldName]
      : userData[fieldName];
  };

  const handleAvatarChange = (newAvatarUrl) => {
    console.log("頭像更新回調:", newAvatarUrl);

    setUserData((prev) => ({
      ...prev,
      avatar_url: newAvatarUrl,
      avatar: newAvatarUrl,
    }));

    // 更新 AuthContext
    updateUser({ avatar: newAvatarUrl });

    localStorage.setItem("userAvatar", newAvatarUrl);
    window.dispatchEvent(new Event("storage"));
    window.dispatchEvent(
      new CustomEvent("avatarUpdate", {
        detail: { newAvatar: newAvatarUrl },
      })
    );
  };

  if (isLoading) {
    return <SkeletonLoader />;
  }

  return (
    <div className="p-10 w-4/5 h-full mt-10 mx-10 border border-borderColor rounded-lg">
      <p className="text-2xl md:text-3xl mb-6">帳號基本資料</p>
      <div className="flex flex-col lg:flex-row lg:gap-8">
        {/* 表單內容 */}
        <div className="mb-6 w-full lg:w-3/5 order-2 lg:order-1">
          <FormInput label="姓名" value={userData.name || ""} disabled={true} />

          <FormInput
            label="暱稱"
            value={getFieldValue("nickname")}
            onChange={handleInputChange}
            name="nickname"
            isEditing={editingFields.nickname}
            onEditClick={() => handleEditClick("nickname")}
          />
          <FormInput
            label="電子信箱"
            value={userData.email || ""}
            disabled={true}
          />
          <FormInput
            label="手機號碼"
            type="tel"
            paddingLeft="pl-24"
            value={getFieldValue("phone")}
            onChange={handleInputChange}
            name="phone"
            isEditing={editingFields.phone}
            onEditClick={() => handleEditClick("phone")}
          />
          <FormInput
            label="地址"
            paddingLeft="pl-24"
            value={getFieldValue("address")}
            onChange={handleInputChange}
            name="address"
            isEditing={editingFields.address}
            onEditClick={() => handleEditClick("address")}
          />
          <FormInput
            label="生日"
            value={userData.birthdate}
            onChange={handleInputChange}
            name="birthday"
            disabled
          />

          {/* 性別選擇 */}
          <div className="flex gap-4 my-3">
            {["生理男", "生理女"].map((gender) => (
              <label key={gender} className="flex items-center gap-1">
                <input
                  type="radio"
                  name="gender"
                  value={gender === "生理男" ? "male" : "female"}
                  checked={
                    getFieldValue("gender") ===
                    (gender === "生理男" ? "male" : "female")
                  }
                  onChange={handleInputChange}
                />
                {gender}
              </label>
            ))}
          </div>

          {/* 電子報訂閱選項 */}

          <div className="flex items-start gap-3">
            <input
              type="checkbox"
              id="newsletter"
              name="newsletter"
              checked={getFieldValue("newsletter")}
              onChange={handleNewsletterChange}
              className="mt-1"
            />
            <div className="flex-1">
              <label
                htmlFor="newsletter"
                className="text-sm sm:text-base font-medium cursor-pointer"
              >
                訂閱電子報
              </label>
              <p className="text-xs text-gray-600 mt-1">
                接收最新資訊、優惠活動
              </p>
              {getFieldValue("newsletter") && !userData.newsletter && (
                <div className="mt-2 p-2 bg-[#F0F0F0] border border-[#F0F0F0] rounded text-xs text-[#AFC16D]">
                  訂閱成功後將收到歡迎信
                </div>
              )}
              {!getFieldValue("newsletter") && userData.newsletter && (
                <div className="mt-2 p-2 bg-[#F0F0F0] border border-[#F0F0F0] rounded text-xs text-[#AFC16D]">
                  取消訂閱後將不再收到我們的最新資訊
                </div>
              )}
            </div>
          </div>
        </div>

        {/* 大頭貼上傳 */}
        <div className="mb-6 w-full lg:w-auto lg:ml-36 flex justify-center order-1 lg:order-2">
          <div className="flex flex-col items-center gap-4">
            <ProfileImage
              onAvatarChange={handleAvatarChange}
              userName={userData.name}
              currentAvatar={userData.avatar_url}
            />
          </div>
        </div>
      </div>
      <div className="flex justify-center w-full my-6">
        <AlertDialog>
          <AlertDialogTrigger
            className="w-28 sm:w-32 h-10 sm:h-12 rounded-lg bg-[#101828] text-[#FBF9FA] hover:bg-[#F0F0F0] hover:text-[#101828] disabled:opacity-50"
            disabled={Object.keys(tempUserData).length === 0}
          >
            確認變更
          </AlertDialogTrigger>
          <AlertDialogContent>
            <AlertDialogHeader>
              <AlertDialogTitle>確認修改個人資料？</AlertDialogTitle>
              <AlertDialogDescription className="space-y-2">
                <span className="block">您即將更新以下資料：</span>
                <ul className="list-disc pl-4">
                  {Object.keys(tempUserData).map((field) => (
                    <li key={field} className="py-1">
                      {field === "nickname" && "📝 暱稱"}
                      {field === "phone" && "📱 手機號碼"}
                      {field === "address" && "🏠 地址"}
                      {field === "gender" && "👤 性別"}
                      {field === "newsletter" && (
                        <span className="flex items-center gap-1">
                          📧 電子報訂閱
                          {tempUserData.newsletter ? (
                            <span className="text-green-600 text-sm">
                              (將發送歡迎信)
                            </span>
                          ) : (
                            <span className="text-orange-600 text-sm">
                              (取消訂閱)
                            </span>
                          )}
                        </span>
                      )}
                    </li>
                  ))}
                </ul>
                <span className="block text-gray-500">
                  請確認資料正確無誤，確認後將立即更新您的個人資料。
                </span>
              </AlertDialogDescription>
            </AlertDialogHeader>
            <AlertDialogFooter>
              <AlertDialogCancel>取消</AlertDialogCancel>
              <AlertDialogAction onClick={handleConfirmUpdate}>
                確認更新
              </AlertDialogAction>
            </AlertDialogFooter>
          </AlertDialogContent>
        </AlertDialog>
      </div>
    </div>
  );
}
