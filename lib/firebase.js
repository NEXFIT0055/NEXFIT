// lib/firebase.js - 整合 Storage 版本
import { initializeApp } from "firebase/app";
import { getAuth } from "firebase/auth";
import { getStorage } from "firebase/storage";

// 從 Firebase Console 複製的配置
const firebaseConfig = {
  apiKey: process.env.NEXT_PUBLIC_FIREBASE_API_KEY,
  authDomain: process.env.NEXT_PUBLIC_FIREBASE_AUTH_DOMAIN,
  projectId: process.env.NEXT_PUBLIC_FIREBASE_PROJECT_ID,
  storageBucket: process.env.NEXT_PUBLIC_FIREBASE_STORAGE_BUCKET,
  messagingSenderId: process.env.NEXT_PUBLIC_FIREBASE_MESSAGING_SENDER_ID,
  appId: process.env.NEXT_PUBLIC_FIREBASE_APP_ID,
  measurementId: process.env.NEXT_PUBLIC_FIREBASE_MEASUREMENT_ID,
};

// 在開發環境中驗證配置
if (process.env.NODE_ENV === "development") {
  console.log("Firebase 配置檢查:");
  console.log(
    "API Key:",
    process.env.NEXT_PUBLIC_FIREBASE_API_KEY ? "✅ 已設定" : "❌ 未設定"
  );
  console.log(
    "Auth Domain:",
    process.env.NEXT_PUBLIC_FIREBASE_AUTH_DOMAIN ? "✅ 已設定" : "❌ 未設定"
  );
  console.log(
    "Project ID:",
    process.env.NEXT_PUBLIC_FIREBASE_PROJECT_ID ? "✅ 已設定" : "❌ 未設定"
  );
  console.log(
    "Storage Bucket:",
    process.env.NEXT_PUBLIC_FIREBASE_STORAGE_BUCKET ? "✅ 已設定" : "❌ 未設定"
  );
  console.log(
    "App ID:",
    process.env.NEXT_PUBLIC_FIREBASE_APP_ID ? "✅ 已設定" : "❌ 未設定"
  );
}

// 初始化 Firebase
const app = initializeApp(firebaseConfig);

// 初始化 Firebase Authentication 並獲取 Auth 服務的引用
export const auth = getAuth(app);

// 初始化 Firebase Storage 並獲取 Storage 服務的引用
export const storage = getStorage(app);

export default app;
