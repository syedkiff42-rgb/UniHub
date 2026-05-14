/**
 * Run once to create all tables:  node src/config/setupDb.js
 */
const mysql = require('mysql2/promise');
const fs    = require('fs');
const path  = require('path');
require('dotenv').config();

async function setup() {
  const conn = await mysql.createConnection({
    host:     process.env.DB_HOST     || 'localhost',
    port:     parseInt(process.env.DB_PORT) || 3306,
    user:     process.env.DB_USER     || 'root',
    password: process.env.DB_PASSWORD || '',
    multipleStatements: true,
  });

  const sql = fs.readFileSync(
    path.join(__dirname, '../../database/schema.sql'),
    'utf8'
  );

  await conn.query(sql);
  console.log('✅ Database and tables created successfully.');
  await conn.end();
}

setup().catch(err => {
  console.error('❌ Setup failed:');
  console.error('   Code   :', err.code);
  console.error('   Message:', err.message || err.sqlMessage || String(err));
  process.exit(1);
});
