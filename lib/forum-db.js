// lib/forum-db.js
import mysql from "mysql2/promise";

// 建立連線
const db = mysql.createPool({
  host: process.env.DB_HOST,
  user: process.env.DB_USER,
  password: process.env.DB_PASSWORD,
  database: process.env.DB_NAME,
  waitForConnections: true,
  connectionLimit: 100,
  queueLimit: 0,
});

setInterval(async () => {
  try {
    await db.query("SELECT 1");
    // 可以加上 console.log("資料庫連線正常");
  } catch (err) {
    console.error("資料庫連線異常", err);
  }
}, 60000);

export default db;

// 測試版本
// import mysql from "mysql2/promise";

// // 建立連線
// const db = mysql.createPool({
//   host: process.env.DB_HOST,
//   user: process.env.DB_USER,
//   password: process.env.DB_PASSWORD,
//   database: process.env.DB_NAME,
//   waitForConnections: true,
//   connectionLimit: 10,
//   queueLimit: 0,
// });

// // 簡單健康檢查（不建議印 active/idle 連線數，mysql2/promise 沒這 API）
// setInterval(async () => {
//   try {
//     await db.query("SELECT 1");
//     console.log("資料庫連接正常");
//   } catch (e) {
//     console.log("資料庫連接異常", e);
//   }
// }, 60000);

// export default db;
