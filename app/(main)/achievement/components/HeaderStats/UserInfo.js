import { useState } from "react";
import { useAuth } from "@/app/contexts/AuthContext";

export default function UserInfo({
  registeredNames = [],
  level,
  onUsernameChange,
}) {
  console.log(`UserInfo - Level: ${level}`);
  const [username, setUsername] = useState("");
  const [isNameValid, setIsNameValid] = useState(true);

  // 驗證用戶名稱是否重複
  const handleUsernameChange = (e) => {
    const newName = e.target.value;
    setUsername(newName);
    setIsNameValid(!registeredNames.includes(newName)); // 如果名稱已存在，設置為無效
    onUsernameChange(newName); 
  };

  const { user } = useAuth();

  const userNickname = user?.nickname;

  return (
    <div className="flex flex-col gap-2">
      {/* 用戶名稱輸入框 */}
      <div>
        <input
          type="text"
          value={userNickname}
          onChange={handleUsernameChange}
          placeholder="輸入用戶名稱"
          className={`w-full max-w-md px-4 py-2 text-2xl`}
          disabled
        />
        {!isNameValid && (
          <p className="text-red-500 text-sm mt-1">此名稱已被使用</p>
        )}
      </div>

      {/* 冒險者等級 */}
      <div className="bg-gray-200 px-4 py-2 rounded-md font-semibold text-gray-800">
        冒險者等級：{level}
      </div>

      {/* 個人簡介 */}
      <textarea
        className="h-20 resize-y p-2 rounded-md border border-gray-300"
        placeholder="個人簡介（用戶可編輯）"
      />
    </div>
  );
}
