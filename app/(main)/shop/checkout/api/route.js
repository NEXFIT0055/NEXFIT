import { NextResponse } from "next/server";

export async function POST(request) {
  try {
    const body = await request.formData();
    console.log("收到 7-11 POST 回調資料:", body);

    // 將 FormData 轉換為物件
    const formDataObject = {};
    for (const [key, value] of body.entries()) {
      formDataObject[key] = value;
    }

    console.log("解析後的資料:", formDataObject);

    
    const storeData = {
      storeid: formDataObject.CVSStoreID || formDataObject.storeid || "",
      storename: formDataObject.CVSStoreName || formDataObject.storename || "",
      storeaddress:
        formDataObject.CVSAddress || formDataObject.storeaddress || "",
      telephone: formDataObject.CVSTelephone || formDataObject.telephone || "",
    };

    if (storeData.storeid && storeData.storename) {
      const successHtml = `
        <!DOCTYPE html>
        <html>
        <head>
            <meta charset="utf-8">
            <title>門市選擇成功</title>
            <style>
              body { 
                font-family: Arial, sans-serif; 
                text-align: center; 
                padding: 50px;
                background-color: #f5f5f5;
              }
              .container {
                max-width: 400px;
                margin: 0 auto;
                background: white;
                padding: 30px;
                border-radius: 8px;
                box-shadow: 0 2px 10px rgba(0,0,0,0.1);
              }
              .success {
                color: #27ae60;
                font-size: 18px;
                margin-bottom: 20px;
              }
              .store-info {
                background: #f8f9fa;
                padding: 15px;
                border-radius: 5px;
                margin: 15px 0;
                text-align: left;
              }
              .store-info p {
                margin: 5px 0;
                font-size: 14px;
              }
              .close-btn {
                background: #3498db;
                color: white;
                border: none;
                padding: 10px 20px;
                border-radius: 5px;
                cursor: pointer;
                font-size: 16px;
                margin-top: 15px;
              }
              .close-btn:hover {
                background: #2980b9;
              }
            </style>
        </head>
        <body>
            <div class="container">
              <div class="success">門市選擇成功！</div>
              
              <div class="store-info">
                <p><strong>門市代號：</strong>${storeData.storeid}</p>
                <p><strong>門市名稱：</strong>${storeData.storename}</p>
                <p><strong>門市地址：</strong>${storeData.storeaddress}</p>
                ${
                  storeData.telephone
                    ? `<p><strong>電話：</strong>${storeData.telephone}</p>`
                    : ""
                }
              </div>
              
              <p style="color: #666; font-size: 14px;">
                資訊已自動同步，視窗將自動關閉
              </p>
              
              <button class="close-btn" onclick="closeWindow()">
                手動關閉視窗
              </button>
            </div>
            
            <script>
              // 門市資料
              const storeData = ${JSON.stringify(storeData)};
              
              console.log('POST 接收到門市資料:', storeData);
              
              // 儲存到 localStorage
              try {
                localStorage.setItem('store711', JSON.stringify(storeData));
                console.log('門市資料已儲存到 localStorage');
              } catch (error) {
                console.error('儲存門市資料失敗:', error);
              }
              
              // 通知父視窗
              if (window.parent && window.parent !== window) {
                try {
                  // 使用 postMessage 通知父視窗
                  window.parent.postMessage({
                    type: '7-11-store-selected',
                    data: storeData
                  }, '*');
                  
                  console.log('已通知父視窗門市選擇完成');
                } catch (error) {
                  console.error('通知父視窗失敗:', error);
                }
              }
              
              // 關閉視窗函數
              function closeWindow() {
                try {
                  window.close();
                } catch (error) {
                  console.log('無法自動關閉視窗，請手動關閉');
                  alert('請手動關閉此視窗');
                }
              }
              
              // 3秒後自動關閉
              setTimeout(closeWindow, 3000);
            </script>
        </body>
        </html>
      `;

      return new Response(successHtml, {
        headers: {
          "Content-Type": "text/html; charset=utf-8",
          "Cache-Control": "no-cache, no-store, must-revalidate",
        },
      });
    }
  } catch (error) {
    console.error("處理 POST 回調時發生錯誤:", error);
  }

  // 如果沒有資料或發生錯誤，返回錯誤頁面
  const errorHtml = `
    <!DOCTYPE html>
    <html>
    <head>
        <meta charset="utf-8">
        <title>處理錯誤</title>
        <style>
          body { 
            font-family: Arial, sans-serif; 
            text-align: center; 
            padding: 50px;
            background-color: #f5f5f5;
          }
          .error { 
            color: #e74c3c; 
            font-size: 18px; 
            margin-bottom: 20px;
          }
        </style>
    </head>
    <body>
        <div class="error">❌ 沒有接收到門市資料</div>
        <p>請重新選擇門市</p>
        <button onclick="window.close()" style="
          background: #3498db;
          color: white;
          border: none;
          padding: 10px 20px;
          border-radius: 5px;
          cursor: pointer;
          font-size: 16px;
        ">關閉視窗</button>
        <script>
          setTimeout(() => {
            window.close();
          }, 3000);
        </script>
    </body>
    </html>
  `;

  return new Response(errorHtml, {
    headers: { "Content-Type": "text/html; charset=utf-8" },
    status: 400,
  });
}

export async function GET(request) {
  try {
    // 處理 GET 請求（URL 參數方式）
    const { searchParams } = new URL(request.url);

    console.log(
      "收到 7-11 GET 回調參數:",
      Object.fromEntries(searchParams.entries())
    );

    // 取得門市資訊
    const storeData = {
      storeid:
        searchParams.get("CVSStoreID") || searchParams.get("storeid") || "",
      storename:
        searchParams.get("CVSStoreName") || searchParams.get("storename") || "",
      storeaddress:
        searchParams.get("CVSAddress") ||
        searchParams.get("storeaddress") ||
        "",
      telephone:
        searchParams.get("CVSTelephone") || searchParams.get("telephone") || "",
    };

    console.log("解析後的門市資料:", storeData);

    // 如果有門市資料，生成成功頁面
    if (storeData.storeid && storeData.storename) {
      const successHtml = `
        <!DOCTYPE html>
        <html>
        <head>
            <meta charset="utf-8">
            <title>門市選擇成功</title>
            <style>
              body { 
                font-family: Arial, sans-serif; 
                text-align: center; 
                padding: 50px;
                background-color: #f5f5f5;
              }
              .container {
                max-width: 400px;
                margin: 0 auto;
                background: white;
                padding: 30px;
                border-radius: 8px;
                box-shadow: 0 2px 10px rgba(0,0,0,0.1);
              }
              .success {
                color: #27ae60;
                font-size: 18px;
                margin-bottom: 20px;
              }
              .store-info {
                background: #f8f9fa;
                padding: 15px;
                border-radius: 5px;
                margin: 15px 0;
                text-align: left;
              }
              .store-info p {
                margin: 5px 0;
                font-size: 14px;
              }
              .close-btn {
                background: #3498db;
                color: white;
                border: none;
                padding: 10px 20px;
                border-radius: 5px;
                cursor: pointer;
                font-size: 16px;
                margin-top: 15px;
              }
              .close-btn:hover {
                background: #2980b9;
              }
            </style>
        </head>
        <body>
            <div class="container">
              <div class="success">門市選擇成功！</div>
              
              <div class="store-info">
                <p><strong>門市代號：</strong>${storeData.storeid}</p>
                <p><strong>門市名稱：</strong>${storeData.storename}</p>
                <p><strong>門市地址：</strong>${storeData.storeaddress}</p>
                ${
                  storeData.telephone
                    ? `<p><strong>電話：</strong>${storeData.telephone}</p>`
                    : ""
                }
              </div>
              
              <p style="color: #666; font-size: 14px;">
                資訊已自動同步，視窗將自動關閉
              </p>
              
              <button class="close-btn" onclick="closeWindow()">
                手動關閉視窗
              </button>
            </div>
            
            <script>
              // 門市資料
              const storeData = ${JSON.stringify(storeData)};
              
              console.log('GET 接收到門市資料:', storeData);
              
              // 儲存到 localStorage
              try {
                localStorage.setItem('store711', JSON.stringify(storeData));
                console.log('門市資料已儲存到 localStorage');
              } catch (error) {
                console.error('儲存門市資料失敗:', error);
              }
              
              // 通知父視窗
              if (window.parent && window.parent !== window) {
                try {
                  // 使用 postMessage 通知父視窗
                  window.parent.postMessage({
                    type: '7-11-store-selected',
                    data: storeData
                  }, '*');
                  
                  console.log('已通知父視窗門市選擇完成');
                } catch (error) {
                  console.error('通知父視窗失敗:', error);
                }
              }
              
              // 關閉視窗函數
              function closeWindow() {
                try {
                  window.close();
                } catch (error) {
                  console.log('無法自動關閉視窗，請手動關閉');
                  alert('請手動關閉此視窗');
                }
              }
              
              // 3秒後自動關閉
              setTimeout(closeWindow, 3000);
            </script>
        </body>
        </html>
      `;

      return new Response(successHtml, {
        headers: {
          "Content-Type": "text/html; charset=utf-8",
          "Cache-Control": "no-cache, no-store, must-revalidate",
        },
      });
    } else {
      // 沒有門市資料，顯示等待頁面
      const waitingHtml = `
        <!DOCTYPE html>
        <html>
        <head>
            <meta charset="utf-8">
            <title>等待門市選擇</title>
            <style>
              body { 
                font-family: Arial, sans-serif; 
                text-align: center; 
                padding: 50px;
                background-color: #f5f5f5;
              }
              .container {
                max-width: 400px;
                margin: 0 auto;
                background: white;
                padding: 30px;
                border-radius: 8px;
                box-shadow: 0 2px 10px rgba(0,0,0,0.1);
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
            <div class="container">
              <h3>7-11 門市選擇</h3>
              <div class="spinner"></div>
              <p>正在等待門市選擇...</p>
              <p style="color: #666; font-size: 14px;">
                請在新視窗中選擇門市
              </p>
            </div>
        </body>
        </html>
      `;

      return new Response(waitingHtml, {
        headers: {
          "Content-Type": "text/html; charset=utf-8",
          "Cache-Control": "no-cache, no-store, must-revalidate",
        },
      });
    }
  } catch (error) {
    console.error("處理 GET 回調時發生錯誤:", error);

    const errorHtml = `
      <!DOCTYPE html>
      <html>
      <head>
          <meta charset="utf-8">
          <title>處理錯誤</title>
          <style>
            body { font-family: Arial, sans-serif; text-align: center; padding: 50px; }
            .error { color: #e74c3c; font-size: 18px; }
          </style>
      </head>
      <body>
          <div class="error">❌ 處理門市選擇時發生錯誤</div>
          <p>錯誤訊息: ${error.message}</p>
          <button onclick="window.close()">關閉視窗</button>
          <script>
            setTimeout(() => {
              window.close();
            }, 5000);
          </script>
      </body>
      </html>
    `;

    return new Response(errorHtml, {
      headers: { "Content-Type": "text/html; charset=utf-8" },
      status: 500,
    });
  }
}
