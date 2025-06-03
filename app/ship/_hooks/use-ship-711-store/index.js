import { useState, useRef, useEffect, Suspense } from "react";
import { popupCenter, subscribe, unsubscribe, publish } from "./popup-window";
import { useSearchParams } from "next/navigation";
import useInterval from "@/hooks/use-interval";
import useLocalStorage from "@/hooks/use-localstorage";

export function useShip711StoreOpener(
  serverCallbackUrl = "", //必要。伺服器7-11運送商店用Callback路由網址
  {
    title = "7-11運送店家選擇視窗", //跳出視窗標題
    h = 680, //跳出視窗高度
    w = 950, //跳出視窗寬度
    autoCloseMins = 5, //自動關閉
    enableLocalStorage = true, //是否didMount時要讀取localStorage中資料
    keyLocalStorage = "store711", // localStorage中的key
  } = {}
) {
  // 除錯用
  //console.log(serverCallbackUrl, title, h, w, autoCloseMins, enableLocalStorage,keyLocalStorage )

  // eslint-disable-next-line
  const [storedValue, setValue] = useLocalStorage(keyLocalStorage, {
    storeid: "",
    storename: "",
    storeaddress: "",
    outside: "",
    ship: "",
    TempVar: "",
  });

  // 跳出子女視窗用
  const newWindow = useRef(null);

  // 記錄店家狀態用
  const [store711, setStore711] = useState({
    storeid: "",
    storename: "",
    storeaddress: "",
    outside: "",
    ship: "",
    TempVar: "",
  });

  const [startCountDown, setStartCountDown] = useState(false);

  // 預設5 min 倒數時間，自動關閉
  const [countDown, setContDown] = useState(60 * autoCloseMins);

  // 如果使用localStorage，才會使用localStroage的值作為預設值
  useEffect(() => {
    if (storedValue && storedValue.storeid && enableLocalStorage) {
      setStore711(storedValue);
    }
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  useEffect(() => {
    // eslint-disable-next-line
    subscribe("stop-countdown", (e) => setStartCountDown(false));

    subscribe("set-store", (e) => {
      setStore711(e.detail);
    });
    // eslint-disable-next-line
    subscribe("cancel", (e) => {
      setStartCountDown(false);
      // reset countdown
      setContDown(60 * autoCloseMins);
      console.warn("錯誤:001-因為跳出視窗關閉無法取值");
    });

    return () => {
      unsubscribe("set-store");
      unsubscribe("stop-countdown");
    };
    // eslint-disable-next-line
  }, []);

  // 倒數計時，每秒檢查
  useInterval(
    () => {
      //console.log(countDown)
      // 如果偵測到付款跳出視窗關閉
      if (newWindow.current && newWindow.current.closed) {
        setStartCountDown(false);
        // reset countdown
        setContDown(60 * autoCloseMins);

        publish("stop-countdown");
        publish("cancel");

        console.warn("錯誤:002-因為跳出視窗關閉無法取值");
      }

      // 倒數計時結束
      if (countDown === 0) {
        setStartCountDown(false);
        // reset countdown
        setContDown(60 * autoCloseMins);

        publish("cancel");
        console.warn("錯誤:003-因為倒數時間已到無法取值");
        // FIXME: mobile browser(maybe CORS problem)
        if (newWindow.current) {
          newWindow.current.close();
        }
        return;
      }

      setContDown(countDown - 1);
    },
    startCountDown ? 1000 : null
  );

  const openWindow = () => {
    if (!serverCallbackUrl) {
      console.error("錯誤:001-必要。伺服器7-11運送商店用Callback路由網址");
      return;
    }

    newWindow.current = popupCenter(
      "https://emap.presco.com.tw/c2cemap.ashx?eshopid=870&&servicetype=1&url=" +
        serverCallbackUrl,
      title,
      w,
      h
    );

    // 啟動計時器
    setStartCountDown(true);
  };

  // 關閉視窗
  const closeWindow = () => {
    if (newWindow.current) {
      newWindow.current.close();
    }
    setStartCountDown(false);
  };

  return {
    store711,
    openWindow,
    closeWindow,
  };
}

// 內部組件處理 useSearchParams
function CallbackHandler({ keyLocalStorage }) {
  const [storedValue, setValue] = useLocalStorage(keyLocalStorage, {
    storeid: "",
    storename: "",
    storeaddress: "",
    outside: "",
    ship: "",
    TempVar: "",
  });

  // 取得路由的上的搜尋參數(查詢字串)
  const searchParams = useSearchParams();
  // 轉為一般物件
  const params = Object.fromEntries(searchParams);

  useEffect(() => {
    // 確保有參數才執行
    if (Object.keys(params).length === 0) return;

    console.log("Callback 接收到參數:", params);

    // 以下為關閉機制
    // focus回原本視窗
    if (window.opener) {
      window.opener.focus();

      // 通知opener(母視窗)關閉倒數計時
      window.opener.document.dispatchEvent(new CustomEvent("stop-countdown"));

      // 通知opener(母視窗)已完成，回送值
      window.opener.document.dispatchEvent(
        new CustomEvent("set-store", {
          detail: params,
        })
      );

      console.log("已通知母視窗，參數:", params);
    }

    // 設定到localStorage
    setValue(params);

    // 延遲關閉視窗，確保事件已經處理
    setTimeout(() => {
      window.close();
    }, 100);
  }, [params, setValue]);

  return <div>處理中...</div>;
}

// 包裝版本的 hook，保持原有的使用方式
export function useShip711StoreCallback(keyLocalStorage = "store711") {
  // 這個 hook 現在只是為了保持 API 一致性
  // 實際的邏輯在 Ship711CallbackPage 組件中
  return {};
}

// 導出一個新的組件供 callback 頁面使用
export function Ship711CallbackPage({ keyLocalStorage = "store711" }) {
  return (
    <Suspense fallback={<div>Loading...</div>}>
      <CallbackHandler keyLocalStorage={keyLocalStorage} />
    </Suspense>
  );
}
