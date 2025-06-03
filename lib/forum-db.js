import mysql from "mysql2/promise";

// 建立連線
const db = mysql.createPool({
  host: process.env.AIVEN_HOST,
  port: process.env.AIVEN_PORT || 27871,
  user: process.env.AIVEN_USER,
  password: process.env.AIVEN_PASSWORD,
  database: process.env.AIVEN_DATABASE,
  waitForConnections: true,
  connectionLimit: 10,
  queueLimit: 0,
  ssl: {
    rejectUnauthorized: false,
  },
  acquireTimeout: 60000,
  timeout: 60000,
  reconnect: true,
  idleTimeout: 300000,
});

// 健康檢查
const healthCheckInterval =
  process.env.NODE_ENV === "production" ? 300000 : 60000;

setInterval(async () => {
  try {
    await db.query("SELECT 1");
    if (process.env.NODE_ENV !== "production") {
      console.log("資料庫連線正常");
    }
  } catch (err) {
    console.error("資料庫連線異常", err);
  }
}, healthCheckInterval);

export default db;
