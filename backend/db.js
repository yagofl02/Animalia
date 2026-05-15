import mysql from "mysql2/promise";
import dotenv from "dotenv";

dotenv.config();

const pool = mysql.createPool({
  host: process.env.DB_HOST || "localhost",
  port: Number(process.env.DB_PORT || 3306),
  user: process.env.DB_USER || "animalia",
  password: process.env.DB_PASSWORD || "animalia",
  database: process.env.DB_NAME || "animalia",
  waitForConnections: true,
  connectionLimit: 10,
  queueLimit: 0,
});

export async function checkConnection() {
  const connection = await pool.getConnection();
  await connection.ping();
  connection.release();
  console.log(`✅ Backend conectado a MySQL (${process.env.DB_HOST || "localhost"})`);
}

export async function waitForDatabase(retries = 20, delayMs = 3000) {
  for (let attempt = 1; attempt <= retries; attempt += 1) {
    try {
      await checkConnection();
      return;
    } catch (error) {
      console.log(`Esperando a MySQL (${attempt}/${retries})...`);

      if (attempt === retries) {
        throw error;
      }

      await new Promise((resolve) => setTimeout(resolve, delayMs));
    }
  }
}

export default pool;
