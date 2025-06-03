import nodemailer from "nodemailer";

const createTransporter = () => {
  // 檢查環境變數
  if (!process.env.EMAIL_USER) {
    throw new Error("EMAIL_USER 環境變數未設定");
  }

  // Gmail 配置
  if (process.env.EMAIL_SERVICE === "gmail" || !process.env.EMAIL_SERVICE) {
    if (!process.env.EMAIL_APP_PASSWORD) {
      throw new Error("EMAIL_APP_PASSWORD 環境變數未設定");
    }

    if (process.env.NODE_ENV === "development") {
      console.log("📧 使用 Gmail 服務發送郵件");
      console.log("📧 寄件者:", process.env.EMAIL_USER);
    }

    return nodemailer.createTransport({
      service: "gmail",
      auth: {
        user: process.env.EMAIL_USER,
        pass: process.env.EMAIL_APP_PASSWORD,
      },
    });
  }

  // SMTP 配置（通用）
  if (process.env.NODE_ENV === "development") {
    console.log("📧 使用 SMTP 服務發送郵件");
    console.log("📧 SMTP Host:", process.env.SMTP_HOST);
    console.log("📧 SMTP Port:", process.env.SMTP_PORT || 587);
  }

  return nodemailer.createTransport({
    host: process.env.SMTP_HOST,
    port: parseInt(process.env.SMTP_PORT) || 587,
    secure: process.env.SMTP_SECURE === "true", // true for 465, false for other ports
    auth: {
      user: process.env.SMTP_USER,
      pass: process.env.SMTP_PASSWORD,
    },
  });
};

export async function sendEmail({ to, subject, html, text }) {
  try {
    // 驗證必要參數
    if (!to) {
      throw new Error("收件者 email 地址未提供");
    }
    if (!subject) {
      throw new Error("郵件主題未提供");
    }
    if (!html && !text) {
      throw new Error("郵件內容未提供");
    }

    if (process.env.NODE_ENV === "development") {
      console.log("📧 準備發送郵件...");
      console.log("📧 收件者:", to);
      console.log("📧 主題:", subject);
    }

    const transporter = createTransporter();

    // 驗證連接
    try {
      await transporter.verify();
      if (process.env.NODE_ENV === "development") {
        console.log("✅ 郵件服務連接成功");
      }
    } catch (verifyError) {
      console.error("❌ 郵件服務連接失敗:", verifyError.message);
      throw new Error(`無法連接到郵件服務: ${verifyError.message}`);
    }

    const mailOptions = {
      from: {
        name: process.env.EMAIL_FROM_NAME || "您的網站名稱",
        address: process.env.EMAIL_FROM || process.env.EMAIL_USER,
      },
      to,
      subject,
      html,
      text: text || html?.replace(/<[^>]*>/g, "") || "", // 安全的 HTML 標籤移除
    };

    const result = await transporter.sendMail(mailOptions);

    if (process.env.NODE_ENV === "development") {
      console.log("✅ 郵件發送成功");
      console.log("📧 Message ID:", result.messageId);
      console.log("📧 已發送至:", to);
    }

    return {
      success: true,
      messageId: result.messageId,
      recipient: to,
    };
  } catch (error) {
    console.error("❌ 郵件發送失敗:", error.message);

    // 根據不同錯誤類型提供更詳細的錯誤訊息
    let errorMessage = "郵件發送失敗";

    if (error.code === "EAUTH") {
      errorMessage =
        "Gmail 認證失敗，請檢查 EMAIL_USER 和 EMAIL_APP_PASSWORD 是否正確";
    } else if (error.code === "ENOTFOUND") {
      errorMessage = "無法連接到郵件服務器，請檢查網路連線";
    } else if (error.code === "ECONNECTION") {
      errorMessage = "連接郵件服務器失敗，請稍後再試";
    } else if (error.code === "ETIMEDOUT") {
      errorMessage = "郵件發送超時，請稍後再試";
    } else if (error.message.includes("Invalid login")) {
      errorMessage = "Gmail 登入失敗，請確認帳號密碼正確且已開啟兩步驟驗證";
    } else if (error.message.includes("收件者 email")) {
      errorMessage = error.message;
    } else if (error.message.includes("郵件主題")) {
      errorMessage = error.message;
    } else if (error.message.includes("郵件內容")) {
      errorMessage = error.message;
    } else if (error.message.includes("環境變數")) {
      errorMessage = error.message;
    } else {
      errorMessage = `郵件發送失敗: ${error.message}`;
    }

    throw new Error(errorMessage);
  }
}

// 🆕 新增：發送歡迎電子報
export async function sendWelcomeNewsletter(userEmail, userName) {
  if (!isValidEmail(userEmail)) {
    throw new Error("無效的 email 地址");
  }

  const welcomeHtml = generateWelcomeNewsletterEmail(userName, userEmail);
  const welcomeText = `
    歡迎訂閱我們的電子報！
    
    親愛的 ${userName || "會員"}，
    
    感謝您訂閱我們的電子報！我們將為您提供：
    - 最新的健身課程資訊
    - 專業教練的訓練建議
    - 獨家會員優惠與活動
    
    
    
    立即查看課程：${process.env.NEXT_PUBLIC_BASE_URL}reservation/course
    
    如需取消訂閱：${
      process.env.NEXT_PUBLIC_BASE_URL
    }/unsubscribe?email=${encodeURIComponent(userEmail)}
  `;

  try {
    const result = await sendEmail({
      to: userEmail,
      subject: "🎉 歡迎訂閱我們的電子報！",
      html: welcomeHtml,
      text: welcomeText,
    });

    if (process.env.NODE_ENV === "development") {
      console.log("✅ 歡迎電子報發送成功:", result.messageId);
    }

    return result;
  } catch (error) {
    console.error("❌ 歡迎電子報發送失敗:", error);
    throw error;
  }
}

// 發送定期電子報給多個訂閱者
export async function sendRegularNewsletter(subscribers, content) {
  if (!Array.isArray(subscribers) || subscribers.length === 0) {
    throw new Error("訂閱者列表不能為空");
  }

  if (!content || !content.title || !content.articles) {
    throw new Error("電子報內容格式不正確");
  }

  const results = [];
  const delayBetweenEmails = 200; // 200ms 延遲避免被限制

  if (process.env.NODE_ENV === "development") {
    console.log(`📧 開始發送電子報給 ${subscribers.length} 位訂閱者`);
  }

  for (const subscriber of subscribers) {
    try {
      if (!isValidEmail(subscriber.email)) {
        results.push({
          email: subscriber.email,
          success: false,
          error: "無效的 email 地址",
        });
        continue;
      }

      const newsletterHtml = generateRegularNewsletterEmail(
        content,
        subscriber
      );
      const newsletterText = generateRegularNewsletterText(content, subscriber);

      const result = await sendEmail({
        to: subscriber.email,
        subject: content.title,
        html: newsletterHtml,
        text: newsletterText,
      });

      results.push({
        email: subscriber.email,
        success: true,
        messageId: result.messageId,
      });

      // 避免發送太快被限制
      if (results.length < subscribers.length) {
        await new Promise((resolve) => setTimeout(resolve, delayBetweenEmails));
      }
    } catch (error) {
      console.error(`發送給 ${subscriber.email} 失敗:`, error.message);
      results.push({
        email: subscriber.email,
        success: false,
        error: error.message,
      });
    }
  }

  const successCount = results.filter((r) => r.success).length;
  const failedCount = results.filter((r) => !r.success).length;

  if (process.env.NODE_ENV === "development") {
    console.log(
      `✅ 電子報發送完成！成功: ${successCount}，失敗: ${failedCount}`
    );
  }

  return {
    results,
    summary: {
      total: subscribers.length,
      success: successCount,
      failed: failedCount,
    },
  };
}

// 取消訂閱確認信
export async function sendUnsubscribeConfirmation(userEmail, userName) {
  if (!isValidEmail(userEmail)) {
    throw new Error("無效的 email 地址");
  }

  const confirmationHtml = generateUnsubscribeConfirmationEmail(userName);
  const confirmationText = `
    取消訂閱確認
    
    親愛的 ${userName || "會員"}，
    
    我們已經為您取消電子報訂閱。
    
    如果這是誤操作，您可以隨時在個人資料頁面重新訂閱。
    
    感謝您曾經的支持！
    
    返回網站：${process.env.NEXT_PUBLIC_BASE_URL}
  `;

  try {
    const result = await sendEmail({
      to: userEmail,
      subject: "✅ 已取消電子報訂閱",
      html: confirmationHtml,
      text: confirmationText,
    });

    if (process.env.NODE_ENV === "development") {
      console.log("✅ 取消訂閱確認信發送成功:", result.messageId);
    }

    return result;
  } catch (error) {
    console.error("❌ 取消訂閱確認信發送失敗:", error);
    throw error;
  }
}

// 驗證 email 格式
export function isValidEmail(email) {
  const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
  return emailRegex.test(email);
}

// 重置密碼郵件 HTML
export function generatePasswordResetEmail(resetUrl, userEmail) {
  return `
    <div style="font-family: Arial, sans-serif; max-width: 600px; margin: 0 auto; padding: 20px;">
      <div style="background: #AFC16D; padding: 30px; text-align: center; border-radius: 10px 10px 0 0;">
        <h1 style="color: white; margin: 0; font-size: 28px;">重置密碼</h1>
      </div>
      
      <div style="background: #ffffff; padding: 30px; border: 1px solid #e0e0e0; border-radius: 0 0 10px 10px;">
        <h2 style="color: #333; margin-top: 0;">重置您的密碼</h2>
        
        <p style="color: #666; line-height: 1.6;">
          您好，<br>
          我們收到了您重置密碼的請求。請點擊下方按鈕來設定新密碼：
        </p>
        
        <div style="text-align: center; margin: 30px 0;">
          <a href="${resetUrl}" 
             style="display: inline-block; 
                    background: #AFC16D; 
                    color: white; 
                    padding: 15px 30px; 
                    text-decoration: none; 
                    border-radius: 25px; 
                    font-weight: bold;
                    font-size: 16px;
                    box-shadow: 0 4px 15px rgba(102, 126, 234, 0.3);">
              重置密碼
          </a>
        </div>
        
        <p style="color: #666; font-size: 14px; line-height: 1.6;">
          如果按鈕無法點擊，請複製以下連結到瀏覽器：<br>
          <span style="word-break: break-all; color: #667eea;">${resetUrl}</span>
        </p>
        
        <div style="background: #f8f9fa; padding: 15px; border-radius: 5px; margin: 20px 0;">
          <p style="margin: 0; color: #666; font-size: 14px;">
            ⚠️ <strong>安全提醒：</strong><br>
            • 此連結將在 1 小時後失效<br>
            • 如果您沒有請求重置密碼，請忽略此郵件<br>
            • 請勿將此連結分享給他人
          </p>
        </div>
        
        <hr style="border: none; border-top: 1px solid #e0e0e0; margin: 20px 0;">
        
        <p style="color: #999; font-size: 12px; text-align: center; margin: 0;">
          此郵件由系統自動發送，請勿回覆<br>
          © ${new Date().getFullYear()} ${
    process.env.EMAIL_FROM_NAME || "您的網站名稱"
  }
        </p>
      </div>
    </div>
  `;
}

// 歡迎電子報 HTML
export function generateWelcomeNewsletterEmail(userName, userEmail) {
  const unsubscribeUrl = `${
    process.env.NEXT_PUBLIC_BASE_URL
  }/unsubscribe?email=${encodeURIComponent(userEmail)}`;
  const coursesUrl = `${process.env.NEXT_PUBLIC_BASE_URL}/reservation/course`;

  return `
    <div style="font-family: Arial, sans-serif; max-width: 600px; margin: 0 auto; padding: 20px;">
      <div style="background: #AFC16D; color: white; padding: 30px; text-align: center; border-radius: 10px 10px 0 0;">
        <h1 style="margin: 0; font-size: 32px;">🎉 歡迎加入我們！</h1>
        <p style="margin: 10px 0 0 0; font-size: 18px;">感謝您訂閱我們的電子報</p>
      </div>
      
      <div style="background: #f9f9f9; padding: 30px; border-radius: 0 0 10px 10px;">
        <h2 style="color: #333; margin-top: 0;">親愛的 ${
          userName || "會員"
        }，您好！</h2>
        
        <p style="color: #666; line-height: 1.6; font-size: 16px;">
          非常感謝您訂閱我們的電子報！我們很高興能與您分享：
        </p>
        
        <div style="background: white; padding: 25px; border-radius: 8px; margin: 20px 0; box-shadow: 0 2px 10px rgba(0,0,0,0.1);">
          <ul style="list-style: none; padding: 0; margin: 0;">
            <li style="padding: 8px 0; border-bottom: 1px solid #f0f0f0; color:#101828;">🏃‍♀️ 最新的健身課程資訊</li>
            <li style="padding: 8px 0; border-bottom: 1px solid #f0f0f0; color:#101828;">💪 專業教練的訓練建議</li>
            <li style="padding: 8px 0; color:#101828;">🎁 獨家會員優惠與活動</li>
          </ul>
        </div>
        
        <div style="background: #3C2918; padding: 20px; border-radius: 8px; margin: 25px 0; text-align: center;">
          <h3 style="margin: 0 0 10px 0; color: #ffffff;">特別優惠</h3>
          <p style="margin: 0; color: #ffffff; font-weight: bold;">
            作為新訂閱者，您將獲得首次課程 <span style="font-size: 20px; color: #fec21d;">20%</span> 的折扣優惠！
          </p>
        </div>
        
        <p style="color: #666; line-height: 1.6;">
          我們承諾只會發送對您有價值的內容，絕不會濫發垃圾郵件。
        </p>
        
        <div style="text-align: center; margin: 30px 0;">
          <a href="${coursesUrl}" 
             style="display: inline-block; 
                    background: #AFC16D; 
                    color: white; 
                    padding: 15px 30px; 
                    text-decoration: none; 
                    border-radius: 25px; 
                    font-weight: bold;
                    font-size: 16px;
                    box-shadow: 0 4px 15px rgba(102, 126, 234, 0.3);">
             立即查看課程
          </a>
        </div>
        
        <hr style="border: none; border-top: 1px solid #e0e0e0; margin: 30px 0;">
        
        <p style="color: #999; font-size: 12px; text-align: center; margin: 0;">
          如果您不想再收到我們的電子報，可以隨時 
          <a href="${unsubscribeUrl}" style="color: #667eea; text-decoration: none;">取消訂閱</a><br>
          © ${new Date().getFullYear()} ${
    process.env.EMAIL_FROM_NAME || "您的網站名稱"
  }. 版權所有.
        </p>
      </div>
    </div>
  `;
}

// 定期電子報 HTML
export function generateRegularNewsletterEmail(content, subscriber) {
  const unsubscribeUrl = `${
    process.env.NEXT_PUBLIC_BASE_URL
  }/unsubscribe?email=${encodeURIComponent(subscriber.email)}`;

  return `
    <div style="font-family: Arial, sans-serif; max-width: 600px; margin: 0 auto; padding: 20px;">
      <div style="background: linear-gradient(135deg, #667eea 0%, #764ba2 100%); color: white; padding: 30px; text-align: center; border-radius: 10px 10px 0 0;">
        <h1 style="margin: 0; font-size: 28px;">${content.title}</h1>
        <p style="margin: 10px 0 0 0;">${new Date().toLocaleDateString(
          "zh-TW"
        )}</p>
      </div>
      
      <div style="background: #f9f9f9; padding: 30px;">
        <h2 style="color: #333; margin-top: 0;">親愛的 ${
          subscriber.name || "會員"
        }，您好！</h2>
        
        ${content.articles
          .map(
            (article) => `
          <div style="background: white; margin: 20px 0; padding: 25px; border-radius: 8px; box-shadow: 0 2px 10px rgba(0,0,0,0.1);">
            <h3 style="color: #333; margin-top: 0; border-bottom: 2px solid #667eea; padding-bottom: 10px;">${
              article.title
            }</h3>
            <p style="color: #666; line-height: 1.6;">${article.content}</p>
            ${
              article.link
                ? `
              <div style="margin-top: 15px;">
                <a href="${article.link}" 
                   style="color: #667eea; text-decoration: none; font-weight: bold;">
                  📖 閱讀更多 →
                </a>
              </div>
            `
                : ""
            }
          </div>
        `
          )
          .join("")}
        
        <hr style="border: none; border-top: 1px solid #e0e0e0; margin: 30px 0;">
        
        <p style="color: #999; font-size: 12px; text-align: center; margin: 0;">
          <a href="${unsubscribeUrl}" style="color: #667eea; text-decoration: none;">取消訂閱</a> | 
          © ${new Date().getFullYear()} ${
    process.env.EMAIL_FROM_NAME || "您的網站名稱"
  }. 版權所有.
        </p>
      </div>
    </div>
  `;
}

// 定期電子報純文字版本
export function generateRegularNewsletterText(content, subscriber) {
  return `
    ${content.title}
    ${new Date().toLocaleDateString("zh-TW")}
    
    親愛的 ${subscriber.name || "會員"}，您好！
    
    ${content.articles
      .map(
        (article) => `
    ${article.title}
    ─────────────────
    ${article.content}
    ${article.link ? `閱讀更多：${article.link}` : ""}
    `
      )
      .join("\n")}
    
    ─────────────────────────────────────────
    取消訂閱：${
      process.env.NEXT_PUBLIC_BASE_URL
    }/unsubscribe?email=${encodeURIComponent(subscriber.email)}
    © ${new Date().getFullYear()} ${
    process.env.EMAIL_FROM_NAME || "您的網站名稱"
  }
  `;
}

// 取消訂閱確認信 HTML
export function generateUnsubscribeConfirmationEmail(userName) {
  const homeUrl = process.env.NEXT_PUBLIC_BASE_URL;

  return `
    <div style="font-family: Arial, sans-serif; max-width: 600px; margin: 0 auto; padding: 20px;">
      <div style="background: #f8f9fa; padding: 30px; text-align: center; border-radius: 10px; border: 1px solid #e9ecef;">
        <h1 style="color: #6c757d; margin: 0; font-size: 28px;">✅ 取消訂閱成功</h1>
      </div>
      
      <div style="background: #ffffff; padding: 30px; border: 1px solid #e9ecef; border-top: none; border-radius: 0 0 10px 10px;">
        <h2 style="color: #333; margin-top: 0;">親愛的 ${
          userName || "會員"
        }，</h2>
        
        <p style="color: #666; line-height: 1.6; font-size: 16px;">
          我們已經為您取消電子報訂閱。您將不會再收到我們的電子報。
        </p>
        
        <div style="background: #e3f2fd; padding: 20px; border-radius: 8px; margin: 25px 0;">
          <p style="margin: 0; color: #1976d2;">
            💡 <strong>溫馨提醒：</strong><br>
            如果這是誤操作，您可以隨時在個人資料頁面重新訂閱我們的電子報。
          </p>
        </div>
        
        <p style="color: #666; line-height: 1.6;">
          感謝您曾經的支持！我們希望未來還能為您提供服務。
        </p>
        
        <div style="text-align: center; margin: 30px 0;">
          <a href="${homeUrl}" 
             style="display: inline-block; 
                    background: #6c757d; 
                    color: white; 
                    padding: 12px 25px; 
                    text-decoration: none; 
                    border-radius: 20px; 
                    font-weight: bold;">
            🏠 返回網站
          </a>
        </div>
        
        <hr style="border: none; border-top: 1px solid #e0e0e0; margin: 30px 0;">
        
        <p style="color: #999; font-size: 12px; text-align: center; margin: 0;">
          © ${new Date().getFullYear()} ${
    process.env.EMAIL_FROM_NAME || "您的網站名稱"
  }. 版權所有.
        </p>
      </div>
    </div>
  `;
}
