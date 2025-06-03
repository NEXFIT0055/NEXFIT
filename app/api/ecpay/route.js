import * as crypto from "crypto";

export async function GET(req) {
  const { searchParams } = new URL(req.url);
  const amount = Number(searchParams.get("amount")) || 0;
  const items = searchParams.get("items") || "";

  const itemName =
    items.split(",").length > 1
      ? items.split(",").join("#")
      : "NEXFIT 線上商城購買一批";

  // 綠界參數
  const MerchantID = "3002607";
  const HashKey = "pwFHCqoQZGmho4w6";
  const HashIV = "EkRm7iFT261dpevs";
  let isStage = true;

  const TotalAmount = amount;
  const TradeDesc = "商店線上付款";
  const ItemName = itemName;
  const ReturnURL = "https://www.ecpay.com.tw";
  const ClientBackURL = "http://localhost:3000/shop/checkout/success";
  const ChoosePayment = "ALL";

  const stage = isStage ? "-stage" : "";
  const algorithm = "sha256";
  const digest = "hex";
  const APIURL = `https://payment${stage}.ecpay.com.tw//Cashier/AioCheckOut/V5`;

  const now = new Date();
  const MerchantTradeNo = `od${now.getFullYear()}${(now.getMonth() + 1)
    .toString()
    .padStart(2, "0")}${now.getDate().toString().padStart(2, "0")}${now
    .getHours()
    .toString()
    .padStart(2, "0")}${now.getMinutes().toString().padStart(2, "0")}${now
    .getSeconds()
    .toString()
    .padStart(2, "0")}${now.getMilliseconds().toString().padStart(2, "0")}`;

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

  function CheckMacValueGen(parameters, algorithm, digest) {
    let Step0 = Object.entries(parameters)
      .map(([key, value]) => `${key}=${value}`)
      .join("&");

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

    const Step1 = Step0.split("&")
      .sort((a, b) => {
        const keyA = a.split("=")[0];
        const keyB = b.split("=")[0];
        return keyA.localeCompare(keyB);
      })
      .join("&");
    const Step2 = `HashKey=${HashKey}&${Step1}&HashIV=${HashIV}`;
    const Step3 = DotNETURLEncode(encodeURIComponent(Step2));
    const Step4 = Step3.toLowerCase();
    const Step5 = crypto.createHash(algorithm).update(Step4).digest(digest);
    const Step6 = Step5.toUpperCase();
    return Step6;
  }
  const CheckMacValue = CheckMacValueGen(ParamsBeforeCMV, algorithm, digest);

  const AllParams = { ...ParamsBeforeCMV, CheckMacValue };

  // 產生自動送出表單的 HTML
  const inputs = Object.entries(AllParams)
    .map(
      ([key, value]) =>
        `<input name="${key}" value="${value.toString()}" style="display:none"><br/>`
    )
    .join("");

  const htmlContent = `
    <!DOCTYPE html>
    <html>
    <head>
        <title></title>
    </head>
    <body>
        <form method="post" action="${APIURL}" style="display:none">
    ${inputs}
    <input type="submit" value="送出參數" style="display:none">
        </form>
    <script>
      document.forms[0].submit();
    </script>
    </body>
    </html>
    `;

  return new Response(htmlContent, {
    headers: { "Content-Type": "text/html; charset=utf-8" },
  });
}
