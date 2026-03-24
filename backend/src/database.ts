import mysql from 'mysql2/promise';
import dotenv from 'dotenv';

dotenv.config();

const connection = mysql.createPool({
  host: process.env.MYSQLHOST!,
  port: Number(process.env.MYSQLPORT) || 3306,
  user: process.env.MYSQLUSER!,
  password: process.env.MYSQLPASSWORD!,
  database: process.env.MYSQLDATABASE || process.env.MYSQL_DATABASE!,
  waitForConnections: true,
  connectionLimit: 10,
  queueLimit: 0,
});

export default connection;