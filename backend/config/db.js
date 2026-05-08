// const mysql = require("mysql2/promise");
// require("dotenv").config();

// const pool = mysql.createPool({
//   host: process.env.DB_HOST || "localhost",
//   port: Number(process.env.DB_PORT) || 3306,
//   user: process.env.DB_USER || "root",
//   password: process.env.DB_PASSWORD || "",
//   database: process.env.DB_NAME || "resumatch",
//   waitForConnections: true,
//   connectionLimit: 10,
//   queueLimit: 0,
//   timezone: "+00:00",
// });

// // Test connection on startup
// pool
//   .getConnection()
//   .then((conn) => {
//     console.log("✅  MySQL connected — database:", process.env.DB_NAME);
//     conn.release();
//   })
//   .catch((err) => {
//     console.error("❌  MySQL connection failed:", err.message);
//     process.exit(1);
//   });

// module.exports = pool;


const mysql = require("mysql2/promise");
require("dotenv").config();

const pool = mysql.createPool({
  host: process.env.DB_HOST,
  // TiDB Cloud usually uses port 4000
  port: Number(process.env.DB_PORT) || 4000, 
  user: process.env.DB_USER,
  password: process.env.DB_PASSWORD,
  database: process.env.DB_NAME,
  waitForConnections: true,
  connectionLimit: 10,
  queueLimit: 0,
  timezone: "+00:00",
  // CRITICAL: TiDB requires SSL for production connections
  ssl: {
    minVersion: 'TLSv1.2',
    rejectUnauthorized: true
  }
});

// Test connection on startup
pool
  .getConnection()
  .then((conn) => {
    console.log("✅ MySQL connected — database:", process.env.DB_NAME);
    conn.release();
  })
  .catch((err) => {
    console.error("❌ MySQL connection failed:", err.message);
    // On Render, we want to know why it failed in the logs
    process.exit(1);
  });

module.exports = pool;