import mysql from 'mysql2/promise';

const db = mysql.createPool({
  host: process.env.DB_HOST || "localhost",
  user: process.env.DB_USER || "root",
  password: process.env.DB_PASSWORD || "",
  database: process.env.DB_NAME || "db_laundry",
  port: parseInt(process.env.DB_PORT || "3306"),
  ssl: process.env.DB_SSL === 'true' ? { rejectUnauthorized: true } : undefined,
});

export default db;
