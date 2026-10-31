import mysql from 'mysql2/promise';
import fs from 'fs';
import path from 'path';
import { fileURLToPath } from 'url';
import dotenv from 'dotenv';

dotenv.config();

const __dirname = path.dirname(fileURLToPath(import.meta.url));

const runMigration = async () => {
  const host = process.env.MYSQL_HOST || 'localhost';
  const port = parseInt(process.env.MYSQL_PORT || '3306', 10);
  const user = process.env.MYSQL_USER || 'root';
  const password = process.env.MYSQL_PASSWORD || 'rootpassword';
  const database = process.env.MYSQL_DATABASE || 'retailflow_db';

  console.log(`Connecting to MySQL on ${host}:${port} as ${user}...`);

  const conn = await mysql.createConnection({
    host,
    port,
    user,
    password,
    multipleStatements: true
  });

  console.log('Applying database/schema.sql...');
  const schemaSql = fs.readFileSync(path.join(__dirname, 'schema.sql'), 'utf8');
  await conn.query(schemaSql);
  console.log('✅ Schema created successfully.');

  console.log('Applying database/seed.sql...');
  const seedSql = fs.readFileSync(path.join(__dirname, 'seed.sql'), 'utf8');
  await conn.query(seedSql);
  console.log('✅ Seed data inserted successfully.');

  await conn.end();
  console.log('🎉 Migration & Seed Complete!');
  process.exit(0);
};

runMigration().catch(err => {
  console.error('❌ Migration failed:', err.message);
  process.exit(1);
});
