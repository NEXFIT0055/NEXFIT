"use client";
import { Ship711CallbackPage } from "../_hooks/use-ship-711-store";

export default function ShipCallbackPage() {
  return (
    <>
      {/* 使用新的 Ship711CallbackPage 組件，它內建了 Suspense 和參數處理 */}
      <Ship711CallbackPage />

      {/* 以下並非必要，可寫可不寫。只是為了自動關閉功能出意外時手動使用 */}
      <div style={{ position: "absolute", top: "10px", right: "10px" }}>
        <button
          onClick={() => {
            window.close();
          }}
          style={{
            padding: "8px 16px",
            backgroundColor: "#dc3545",
            color: "white",
            border: "none",
            borderRadius: "4px",
            cursor: "pointer",
          }}
        >
          關閉視窗
        </button>
      </div>
    </>
  );
}
