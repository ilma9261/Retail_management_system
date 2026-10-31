import mysql from 'mysql2/promise';
import dotenv from 'dotenv';
import fs from 'fs';
import path from 'path';
import { fileURLToPath } from 'url';

dotenv.config();

const __dirname = path.dirname(fileURLToPath(import.meta.url));

// Database configuration with environment variable defaults
export const dbConfig = {
  host: process.env.MYSQL_HOST || 'localhost',
  port: parseInt(process.env.MYSQL_PORT || '3306', 10),
  user: process.env.MYSQL_USER || 'root',
  password: process.env.MYSQL_PASSWORD || 'rootpassword',
  database: process.env.MYSQL_DATABASE || 'retailflow_db',
  waitForConnections: true,
  connectionLimit: 10,
  queueLimit: 0,
  enableKeepAlive: true,
  keepAliveInitialDelay: 0,
  multipleStatements: true,
};

let pool = null;

export const getPool = () => {
  if (!pool) {
    pool = mysql.createPool(dbConfig);
  }
  return pool;
};

// Initialize database schema and seeds if needed
export const initDB = async () => {
  try {
    // 1. First ensure database exists (connect without database selected)
    const adminConnection = await mysql.createConnection({
      host: dbConfig.host,
      port: dbConfig.port,
      user: dbConfig.user,
      password: dbConfig.password,
      multipleStatements: true,
    });

    await adminConnection.query(`CREATE DATABASE IF NOT EXISTS \`${dbConfig.database}\` CHARACTER SET utf8mb4 COLLATE utf8mb4_unicode_ci;`);
    await adminConnection.end();

    // 2. Now run schema.sql if tables do not exist
    const p = getPool();
    const [tables] = await p.query('SHOW TABLES;');
    if (tables.length === 0) {
      console.log('📦 Initializing MySQL schema for retailflow_db...');
      const schemaPath = path.resolve(__dirname, '../../database/schema.sql');
      const seedPath = path.resolve(__dirname, '../../database/seed.sql');

      if (fs.existsSync(schemaPath)) {
        const schemaSql = fs.readFileSync(schemaPath, 'utf8');
        await p.query(schemaSql);
        console.log('✅ MySQL schema created successfully.');
      }

      if (fs.existsSync(seedPath)) {
        const seedSql = fs.readFileSync(seedPath, 'utf8');
        await p.query(seedSql);
        console.log('✅ MySQL initial seed data inserted.');
      }
    } else {
      console.log(`✅ Connected to MySQL database "${dbConfig.database}" (${tables.length} tables found).`);
    }

    return p;
  } catch (err) {
    console.error('❌ MySQL initialization error:', err.message);
    throw err;
  }
};

export default {
  getPool,
  initDB,
  query: (sql, params) => getPool().query(sql, params),
};
