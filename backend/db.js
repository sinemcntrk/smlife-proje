const { Pool } = require('pg');

const pool = new Pool({
  user: 'postgres', // İŞTE BURASI EKSİKTİ! (HP yerine postgres yazdık)
  password: 'klmkdassa', // Kendi şifreni yaz
  host: 'localhost',
  port: 5432,
  database: 'akilliyasamdb' 
});
module.exports = pool;