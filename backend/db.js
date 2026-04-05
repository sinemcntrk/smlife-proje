const { Pool } = require('pg');

// Railway'de isek DATABASE_URL kullanılır, yoksa senin yerel ayarların kullanılır.
const isProduction = process.env.DATABASE_URL;

const pool = new Pool({
  connectionString: isProduction ? process.env.DATABASE_URL : "postgresql://postgres:klmkdassa@localhost:5432/akilliyasamdb",
  ssl: isProduction ? { rejectUnauthorized: false } : false
});

module.exports = pool;