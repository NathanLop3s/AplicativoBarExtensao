import mysql from 'mysql2/promise';
import type { PoolOptions } from 'mysql2/promise';
import dotenv from 'dotenv';

dotenv.config();

const access: PoolOptions = {
  host: process.env.DB_HOST!,
  user: process.env.DB_USER!,
  password: process.env.DB_PASS!,
  database: process.env.DB_NAME!,
  port: Number(process.env.DB_PORT) || 3306,
};

const pool = mysql.createPool(access);

pool.getConnection()
  .then(conn => {
    console.log("✅ Conectado ao Railway!");
    conn.release();
  })
  .catch(err => console.log("❌ Erro:", err.message));

export default pool;