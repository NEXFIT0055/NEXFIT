import { NextResponse } from "next/server";
import { sendUnsubscribeConfirmation } from "@/lib/email";
import db from "@/lib/forum-db";

export async function GET(req) {
  const { searchParams } = new URL(req.url);
  const email = searchParams.get("email");

  if (!email) {
    return new Response(
      `
      <!DOCTYPE html>
      <html>
        <head>
          <title>無效的取消訂閱連結</title>
          <meta charset="utf-8">
          <meta name="viewport" content="width=device-width, initial-scale=1">
        </head>
        <body style="font-family: Arial, sans-serif; text-align: center; padding: 50px; background: #f8f9fa; margin: 0;">
          <div style="max-width: 500px; margin: 0 auto; background: white; padding: 40px; border-radius: 10px; box-shadow: 0 4px 20px rgba(0,0,0,0.1);">
            <h2 style="color: #dc3545; margin-top: 0;">❌ 無效的取消訂閱連結</h2>
            <p style="color: #666;">請檢查您的郵件連結是否正確。</p>
            <a href="${process.env.NEXT_PUBLIC_BASE_URL}" 
               style="display: inline-block; background: #007bff; color: white; padding: 10px 20px; text-decoration: none; border-radius: 5px; margin-top: 20px;">
              返回首頁
            </a>
          </div>
        </body>
      </html>
    `,
      {
        headers: { "Content-Type": "text/html; charset=utf-8" },
      }
    );
  }

  try {
    // 獲取用戶資訊
    const [users] = await db.query(
      "SELECT name, newsletter FROM users WHERE email = ?",
      [email]
    );

    if (users.length === 0) {
      return new Response(
        `
        <!DOCTYPE html>
        <html>
          <head>
            <title>找不到該電子郵件</title>
            <meta charset="utf-8">
            <meta name="viewport" content="width=device-width, initial-scale=1">
          </head>
          <body style="font-family: Arial, sans-serif; text-align: center; padding: 50px; background: #f8f9fa; margin: 0;">
            <div style="max-width: 500px; margin: 0 auto; background: white; padding: 40px; border-radius: 10px; box-shadow: 0 4px 20px rgba(0,0,0,0.1);">
              <h2 style="color: #ffc107; margin-top: 0;">⚠️ 找不到該電子郵件</h2>
              <p style="color: #666;">該電子郵件地址未在我們的系統中找到。</p>
              <a href="${process.env.NEXT_PUBLIC_BASE_URL}" 
                 style="display: inline-block; background: #007bff; color: white; padding: 10px 20px; text-decoration: none; border-radius: 5px; margin-top: 20px;">
                返回首頁
              </a>
            </div>
          </body>
        </html>
      `,
        {
          headers: { "Content-Type": "text/html; charset=utf-8" },
        }
      );
    }

    const user = users[0];

    // 如果已經取消訂閱
    if (!user.newsletter) {
      return new Response(
        `
        <!DOCTYPE html>
        <html>
          <head>
            <title>已取消訂閱</title>
            <meta charset="utf-8">
            <meta name="viewport" content="width=device-width, initial-scale=1">
          </head>
          <body style="font-family: Arial, sans-serif; text-align: center; padding: 50px; background: #f8f9fa; margin: 0;">
            <div style="max-width: 500px; margin: 0 auto; background: white; padding: 40px; border-radius: 10px; box-shadow: 0 4px 20px rgba(0,0,0,0.1);">
              <h2 style="color: #28a745; margin-top: 0;">✅ 您已經取消訂閱</h2>
              <p style="color: #666;">您之前已經取消了電子報訂閱。</p>
              <a href="${process.env.NEXT_PUBLIC_BASE_URL}" 
                 style="display: inline-block; background: #007bff; color: white; padding: 10px 20px; text-decoration: none; border-radius: 5px; margin-top: 20px;">
                返回首頁
              </a>
            </div>
          </body>
        </html>
      `,
        {
          headers: { "Content-Type": "text/html; charset=utf-8" },
        }
      );
    }

    // 執行取消訂閱
    const [result] = await db.query(
      "UPDATE users SET newsletter = 0 WHERE email = ?",
      [email]
    );

    if (result.affectedRows === 0) {
      throw new Error("更新失敗");
    }

    // 發送取消訂閱確認信
    try {
      await sendUnsubscribeConfirmation(email, user.name);
      console.log(`✅ 取消訂閱確認信已發送給: ${email}`);
    } catch (emailError) {
      console.error("取消訂閱確認信發送失敗:", emailError);
    }

    return new Response(
      `
      <!DOCTYPE html>
      <html>
        <head>
          <title>取消訂閱成功</title>
          <meta charset="utf-8">
          <meta name="viewport" content="width=device-width, initial-scale=1">
        </head>
        <body style="font-family: Arial, sans-serif; text-align: center; padding: 50px; background: #f8f9fa; margin: 0;">
          <div style="max-width: 500px; margin: 0 auto; background: white; padding: 40px; border-radius: 10px; box-shadow: 0 4px 20px rgba(0,0,0,0.1);">
            <h2 style="color: #28a745; margin-top: 0;">取消訂閱成功</h2>
            <p style="color: #666; line-height: 1.6;">
              您已成功取消電子報訂閱。我們已經發送確認信到您的信箱。<br>
              如果這是誤操作，您可以隨時在個人資料中重新訂閱。
            </p>
            <a href="${process.env.NEXT_PUBLIC_BASE_URL}" 
               style="display: inline-block; background: #007bff; color: white; padding: 12px 25px; text-decoration: none; border-radius: 5px; margin-top: 20px; font-weight: bold;">
              🏠 返回首頁
            </a>
          </div>
        </body>
      </html>
    `,
      {
        headers: { "Content-Type": "text/html; charset=utf-8" },
      }
    );
  } catch (error) {
    console.error("取消訂閱失敗:", error);
    return new Response(
      `
      <!DOCTYPE html>
      <html>
        <head>
          <title>取消訂閱失敗</title>
          <meta charset="utf-8">
          <meta name="viewport" content="width=device-width, initial-scale=1">
        </head>
        <body style="font-family: Arial, sans-serif; text-align: center; padding: 50px; background: #f8f9fa; margin: 0;">
          <div style="max-width: 500px; margin: 0 auto; background: white; padding: 40px; border-radius: 10px; box-shadow: 0 4px 20px rgba(0,0,0,0.1);">
            <h2 style="color: #dc3545; margin-top: 0;">❌ 取消訂閱失敗</h2>
            <p style="color: #666;">系統發生錯誤，請稍後再試或聯繫客服。</p>
            <a href="${process.env.NEXT_PUBLIC_BASE_URL}" 
               style="display: inline-block; background: #007bff; color: white; padding: 10px 20px; text-decoration: none; border-radius: 5px; margin-top: 20px;">
              返回首頁
            </a>
          </div>
        </body>
      </html>
    `,
      {
        headers: { "Content-Type": "text/html; charset=utf-8" },
      }
    );
  }
}
