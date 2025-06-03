import { NextResponse } from "next/server";
import * as crypto from "crypto";

export async function GET(req) {
  try {
    const { searchParams } = new URL(req.url);
    const amount = Number(searchParams.get("amount")) || 0;
    const items = searchParams.get("items") || "";

    // 驗證必要參數
    if (!amount || amount <= 0) {
      return NextResponse.json(
        { error: "Invalid amount parameter" },
        { status: 400 }
      );
    }

    const itemName =
      items.split(",").length > 1
        ? items.split(",").join("#")
        : "NEXFIT 線上商城購買一批";

    // 綠界參數
    const MerchantID = process.env.ECPAY_MERCHANT_ID || "3002607";
    const HashKey = process.env.ECPAY_HASH_KEY || "pwFHCqoQZGmho4w6";
    const HashIV = process.env.ECPAY_HASH_IV || "EkRm7iFT261dpevs";

    // 根據環境決定是否使用測試環境
    let isStage =
      process.env.NODE_ENV !== "production" ||
      process.env.ECPAY_STAGE === "true";

    // ✅ 修正 URL - 使用環境變數或動態判斷
    const getBaseUrl = () => {
      if (process.env.NEXT_PUBLIC_BASE_URL) {
        return process.env.NEXT_PUBLIC_BASE_URL;
      }

      if (process.env.VERCEL_URL) {
        return `https://${process.env.VERCEL_URL}`;
      }

      // 從 request headers 中取得
      const host = req.headers.get("host");
      const protocol = req.headers.get("x-forwarded-proto") || "https";
      return `${protocol}://${host}`;
    };

    const ClientBackURL = `${getBaseUrl()}/shop/checkout/success`;

    const TotalAmount = amount;
    const TradeDesc = "商店線上付款";
    const ItemName = itemName;
    const ReturnURL = `${getBaseUrl()}/api/ecpay/callback`; // ✅ 改為你的回調 API
    const ChoosePayment = "ALL";

    const stage = isStage ? "-stage" : "";
    const algorithm = "sha256";
    const digest = "hex";
    const APIURL = `https://payment${stage}.ecpay.com.tw/Cashier/AioCheckOut/V5`; // ✅ 修正 URL

    // ✅ 改善訂單編號生成
    const now = new Date();
    const timestamp = now.getTime().toString();
    const MerchantTradeNo = `od${timestamp.slice(-16)}`; // 取最後16位數，確保唯一性

    // ✅ 修正日期格式
    const MerchantTradeDate = now
      .toLocaleString("zh-TW", {
        year: "numeric",
        month: "2-digit",
        day: "2-digit",
        hour: "2-digit",
        minute: "2-digit",
        second: "2-digit",
        hour12: false,
      })
      .replace(/\//g, "/");

    let ParamsBeforeCMV = {
      MerchantID,
      MerchantTradeNo,
      MerchantTradeDate: MerchantTradeDate.toString(),
      PaymentType: "aio",
      EncryptType: 1,
      TotalAmount,
      TradeDesc,
      ItemName,
      ReturnURL,
      ChoosePayment,
      ClientBackURL,
    };

    // ✅ 優化 CheckMacValue 生成函數
    function CheckMacValueGen(parameters, algorithm, digest) {
      // 排序參數
      const sortedParams = Object.keys(parameters)
        .sort()
        .map((key) => `${key}=${parameters[key]}`)
        .join("&");

      // URL 編碼處理
      function DotNETURLEncode(string) {
        const list = {
          "%2D": "-",
          "%5F": "_",
          "%2E": ".",
          "%21": "!",
          "%2A": "*",
          "%28": "(",
          "%29": ")",
          "%20": "+",
        };

        Object.entries(list).forEach(([encoded, decoded]) => {
          const regex = new RegExp(encoded, "g");
          string = string.replace(regex, decoded);
        });
        return string;
      }

      const Step2 = `HashKey=${HashKey}&${sortedParams}&HashIV=${HashIV}`;
      const Step3 = DotNETURLEncode(encodeURIComponent(Step2));
      const Step4 = Step3.toLowerCase();
      const Step5 = crypto.createHash(algorithm).update(Step4).digest(digest);
      const Step6 = Step5.toUpperCase();
      return Step6;
    }

    const CheckMacValue = CheckMacValueGen(ParamsBeforeCMV, algorithm, digest);
    const AllParams = { ...ParamsBeforeCMV, CheckMacValue };

    // ✅ 記錄請求（開發環境）
    if (process.env.NODE_ENV === "development") {
      console.log("綠界支付參數:", {
        MerchantTradeNo,
        TotalAmount,
        ClientBackURL,
        ReturnURL,
        isStage,
      });
    }

    // 產生自動送出表單的 HTML
    const inputs = Object.entries(AllParams)
      .map(
        ([key, value]) =>
          `<input name="${key}" value="${value.toString()}" style="display:none">`
      )
      .join("");

    const htmlContent = `
      <!DOCTYPE html>
      <html>
      <head>
          <meta charset="utf-8">
          <title>正在導向付款頁面...</title>
          <style>
            body { 
              font-family: Arial, sans-serif; 
              text-align: center; 
              padding: 50px;
              background-color: #f5f5f5;
            }
            .loading {
              font-size: 18px;
              color: #333;
            }
            .spinner {
              border: 4px solid #f3f3f3;
              border-top: 4px solid #3498db;
              border-radius: 50%;
              width: 40px;
              height: 40px;
              animation: spin 2s linear infinite;
              margin: 20px auto;
            }
            @keyframes spin {
              0% { transform: rotate(0deg); }
              100% { transform: rotate(360deg); }
            }
          </style>
      </head>
      <body>
          <div class="loading">
            <div class="spinner"></div>
            正在導向綠界付款頁面，請稍候...
          </div>
          <form method="post" action="${APIURL}" style="display:none" id="ecpayForm">
            ${inputs}
            <input type="submit" value="送出參數">
          </form>
          <script>
            // 延遲一點再送出，讓使用者看到載入畫面
            setTimeout(function() {
              document.getElementById('ecpayForm').submit();
            }, 1000);
          </script>
      </body>
      </html>
    `;

    return new Response(htmlContent, {
      headers: {
        "Content-Type": "text/html; charset=utf-8",
        "Cache-Control": "no-cache, no-store, must-revalidate",
      },
    });
  } catch (error) {
    console.error("綠界支付 API 錯誤:", error);
    return NextResponse.json(
      { error: "Internal server error", details: error.message },
      { status: 500 }
    );
  }
}
