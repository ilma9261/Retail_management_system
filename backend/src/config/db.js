import mysql from 'mysql2/promise';
import dotenv from 'dotenv';
import path from 'path';
import { fileURLToPath } from 'url';

dotenv.config();
try {
  const __dirname = path.dirname(fileURLToPath(import.meta.url));
  dotenv.config({ path: path.resolve(__dirname, '../../.env') });
} catch (e) {}

const mysqlUri = process.env.MYSQL_URI || process.env.MYSQL_URL;

export const dbConfig = mysqlUri
  ? {
      uri: mysqlUri,
      waitForConnections: true,
      connectionLimit: 10,
      queueLimit: 0,
      multipleStatements: true,
      ssl: { rejectUnauthorized: false }
    }
  : {
      host: process.env.MYSQL_HOST || 'localhost',
      port: parseInt(process.env.MYSQL_PORT || '3306', 10),
      user: process.env.MYSQL_USER || 'root',
      password: process.env.MYSQL_PASSWORD || '',
      database: process.env.MYSQL_DATABASE || 'retailflow_db',
      waitForConnections: true,
      connectionLimit: 10,
      queueLimit: 0,
      multipleStatements: true,
      ssl: process.env.MYSQL_SSL === 'false' ? false : { rejectUnauthorized: false }
    };

let pool = null;

export const getPool = () => {
  if (!pool) {
    pool = mysql.createPool(dbConfig);
  }
  return pool;
};

export const initDB = async () => {
  try {
    const p = getPool();
    await p.query('SELECT 1 + 1 AS connected;');
    console.log('✅ Connected to MySQL database successfully.');
    return p;
  } catch (err) {
    console.error('❌ MySQL connection error:', err.message);
    throw err;
  }
};

export default {
  getPool,
  initDB,
  query: (sql, params) => getPool().query(sql, params),
};
