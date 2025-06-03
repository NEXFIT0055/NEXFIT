"use client";

import React, { useState } from "react";
import Image from "next/image";
import { Button } from "@/app/components/ui/button";
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
import { PiEyesFill } from "react-icons/pi";
import { toast } from "sonner";

// 添加密碼驗證函數
const validatePassword = (password) => {
  const hasUpperCase = /[A-Z]/.test(password);
  const hasLowerCase = /[a-z]/.test(password);

  if (!hasUpperCase || !hasLowerCase) {
    return {
      isValid: false,
      message: "密碼必須包含至少一個大寫和一個小寫字母",
    };
  }

  return { isValid: true };
};

// 定義 FormInput 組件
const FormInput = ({ label, type = "text", name, value, onChange }) => (
  <div className="flex items-center my-5 border-b border-gray-200 pb-2 hover:border-gray-400 transition-colors">
    <label className="flex items-baseline w-full">
      <span className="text-fontColor whitespace-nowrap">{label}：</span>
      <input
        type={type}
        name={name}
        value={value}
        onChange={onChange}
        className={`bg-transparent border-none focus:outline-none w-full p-0 ml-0 text-[#101828]`}
      />
    </label>
  </div>
);

// 定義 PasswordInput 組件
const PasswordInput = ({
  label,
  value,
  onChange,
  showPassword,
  onTogglePassword,
  isNewPassword,
}) => (
  <div className="relative">
    <FormInput
      label={label}
      type={showPassword ? "text" : "password"}
      value={value}
      onChange={onChange}
    />
    <button
      type="button"
      onClick={onTogglePassword}
      className="absolute right-2 top-1/2 transform -translate-y-1/2 text-gray-500 hover:text-gray-700"
    >
      {showPassword ? (
        <Image src="/eyes.png" alt="隱藏密碼" width={12} height={12} />
      ) : (
        <PiEyesFill />
      )}
    </button>
    {isNewPassword && (
      <p className="text-xs text-gray-500 mt-1">
        密碼必須包含至少一個大寫和一個小寫字母
      </p>
    )}
  </div>
);

export default function Page() {
  const [passwords, setPasswords] = useState({
    oldPassword: "",
    newPassword: "",
    confirmPassword: "",
  });
  const [showPasswords, setShowPasswords] = useState({
    oldPassword: false,
    newPassword: false,
    confirmPassword: false,
  });

  const handlePasswordChange = (field) => (e) => {
    setPasswords((prev) => ({ ...prev, [field]: e.target.value }));
  };

  const togglePasswordVisibility = (field) => {
    setShowPasswords((prev) => ({ ...prev, [field]: !prev[field] }));
  };

  const handleUpdatePassword = async () => {
    // 檢查是否有填寫原密碼
    if (!passwords.oldPassword) {
      toast.error("請輸入原密碼");
      return;
    }

    // 檢查是否有填寫新密碼
    if (!passwords.newPassword) {
      toast.error("請輸入新密碼");
      return;
    }

    // 檢查是否有填寫確認密碼
    if (!passwords.confirmPassword) {
      toast.error("請輸入確認密碼");
      return;
    }

    // 檢查新密碼長度
    if (passwords.newPassword.length < 6) {
      toast.error("新密碼長度需要至少6個字元");
      return;
    }

    // 驗證新密碼和確認密碼是否匹配
    if (passwords.newPassword !== passwords.confirmPassword) {
      toast.error("新密碼與確認密碼不符");
      return;
    }

    // 驗證新密碼格式
    const validation = validatePassword(passwords.newPassword);
    if (!validation.isValid) {
      toast.error(validation.message);
      return;
    }

    try {
      const token = localStorage.getItem("token");
      const response = await fetch("/api/accountCenter/profile/password", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
          Authorization: `Bearer ${token}`,
        },
        body: JSON.stringify({
          oldPassword: passwords.oldPassword,
          newPassword: passwords.newPassword,
        }),
      });

      const data = await response.json();

      if (response.ok) {
        toast.success("密碼修改成功，請重新登入");
        setPasswords({
          oldPassword: "",
          newPassword: "",
          confirmPassword: "",
        });
        localStorage.removeItem("token");
        window.location.href = "/";
      } else {
        // 根據後端返回的錯誤訊息顯示不同的提示
        if (data.message === "舊密碼錯誤") {
          toast.error("原密碼輸入錯誤");
        } else {
          toast.error(data.message || "密碼修改失敗");
        }
      }
    } catch (error) {
      console.error("密碼修改錯誤:", error);
      toast.error("系統錯誤，請稍後再試");
    }
  };

  // 在 AlertDialogAction 中使用 handleUpdatePassword
  return (
    <div className="p-10 w-4/5 h-full mt-10 mx-10 border border-borderColor rounded-lg">
      <p className="text-2xl md:text-3xl mb-6">變更密碼</p>
      <div className="flex gap-4 lg:gap-6 md:gap-8 flex-col w-full">
        {/* 更改密碼 */}
        <div className="mb-3 w-full md:w-2/3">
          <PasswordInput
            label="原密碼"
            value={passwords.oldPassword}
            onChange={handlePasswordChange("oldPassword")}
            showPassword={showPasswords.oldPassword}
            onTogglePassword={() => togglePasswordVisibility("oldPassword")}
          />
          <PasswordInput
            label="新密碼"
            value={passwords.newPassword}
            onChange={handlePasswordChange("newPassword")}
            showPassword={showPasswords.newPassword}
            onTogglePassword={() => togglePasswordVisibility("newPassword")}
          />
          <PasswordInput
            label="再次確認密碼"
            value={passwords.confirmPassword}
            onChange={handlePasswordChange("confirmPassword")}
            showPassword={showPasswords.confirmPassword}
            onTogglePassword={() => togglePasswordVisibility("confirmPassword")}
          />
        </div>

        {/* 確認儲存按鈕 */}
        <div className="flex justify-center my-3 ">
          <AlertDialog className="">
            <AlertDialogTrigger className=" w-32 h-12  rounded-lg ">
              確認變更
            </AlertDialogTrigger>
            <AlertDialogContent>
              <AlertDialogHeader>
                <AlertDialogTitle>確認修改密碼？</AlertDialogTitle>
                <AlertDialogDescription className="space-y-2">
                  <p>請注意以下事項：</p>
                  <ul className="list-disc pl-4">
                    <li>變更密碼後，您需要使用新密碼重新登入</li>
                  </ul>
                  <p className="text-gray-500 mt-2">
                    確認變更後，系統將立即更新您的密碼並自動登出。
                  </p>
                </AlertDialogDescription>
              </AlertDialogHeader>
              <AlertDialogFooter>
                <AlertDialogCancel>取消</AlertDialogCancel>
                <AlertDialogAction onClick={handleUpdatePassword}>
                  確認變更
                </AlertDialogAction>
              </AlertDialogFooter>
            </AlertDialogContent>
          </AlertDialog>
        </div>
      </div>
    </div>
  );
}
