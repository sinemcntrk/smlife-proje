const { Pool } = require("pg");
require("dotenv").config();

// Bu satır, .env dosyasındaki veya Render'daki veritabanı linkini alır
const connectionString = process.env.DATABASE_URL;

if (!connectionString) {
  console.error("❌ HATA: DATABASE_URL bulunamadı! .env dosyasını kontrol et.");
}

const pool = new Pool({
  connectionString,
  ssl: {
    rejectUnauthorized: false, // Neon ve Render güvenli bağlantı (SSL) ister
  },
});

pool.connect()
  .then(() => console.log('✅ Veritabanına Başarıyla Bağlandı! (Neon/Cloud)'))
  .catch(err => console.error('❌ Veritabanı Bağlantı Hatası:', err.message));

module.exports = pool;
