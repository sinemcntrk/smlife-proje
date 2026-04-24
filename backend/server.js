const express = require('express');
const cors = require('cors');
const pool = require('./db');
const multer = require('multer');
const path = require('path');
const fs = require('fs'); 
const bcrypt = require('bcryptjs');
const jwt = require('jsonwebtoken');

// --- 🤖 GEMINI AI KURULUMU ---
const { GoogleGenerativeAI } = require("@google/generative-ai");
// Buraya kendi Google Gemini API anahtarını yazmalısın veya Railway Variables'tan çekmelisin
const genAI = new GoogleGenerativeAI(process.env.GEMINI_API_KEY || AIzaSyB0CBWMOG3TeDB4Ifwxh9xFI5bL9E7Aawo); 
const model = genAI.getGenerativeModel({ model: "gemini-1.5-flash" });

const app = express();

const PORT = process.env.PORT || 5000; 
const JWT_SECRET = process.env.JWT_SECRET || 'smlife_bitirme_projesi_gizli_anahtari_2026';

const corsOptions = {
  origin: [
    'https://smlife-production-1007.up.railway.app', 
    'http://localhost:3000', 
    'http://localhost:8081'  
  ],
  methods: 'GET,HEAD,PUT,PATCH,POST,DELETE',
  credentials: true, 
};

app.use(cors(corsOptions));

// 🚀 KRİTİK: Fotoğraf analizi için Node.js sınırlarını 50MB'a çıkardık
app.use(express.json({ limit: '50mb' }));
app.use(express.urlencoded({ limit: '50mb', extended: true }));

const uploadDir = path.join(__dirname, 'uploads');
if (!fs.existsSync(uploadDir)) {
    fs.mkdirSync(uploadDir);
}
app.use('/uploads', express.static(uploadDir));

// --- TABLO OLUŞTURMA BÖLÜMÜ ---
const createTables = async () => {
  try {
    await pool.query(`CREATE TABLE IF NOT EXISTS son_users (
      id SERIAL PRIMARY KEY,
      name VARCHAR(100),
      email VARCHAR(100) UNIQUE,
      password VARCHAR(255) NOT NULL,
      goal VARCHAR(50),
      current_weight VARCHAR(10),
      target_weight VARCHAR(10),
      height VARCHAR(10),
      birthdate VARCHAR(20),
      gender VARCHAR(20),
      diet_type VARCHAR(50),
      activity_level VARCHAR(50),
      sports TEXT,
      profile_pic VARCHAR(255),
      created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
    );`);

    await pool.query(`CREATE TABLE IF NOT EXISTS bitirme_water_logs (
      id SERIAL PRIMARY KEY,
      username VARCHAR(100),
      amount_ml INTEGER,
      created_at DATE DEFAULT CURRENT_DATE
    );`);

    await pool.query(`CREATE TABLE IF NOT EXISTS bitirme_sleep_logs (
      id SERIAL PRIMARY KEY,
      username VARCHAR(100),
      duration_hours FLOAT,
      created_at DATE DEFAULT CURRENT_DATE,
      UNIQUE(username, created_at)
    );`);

    await pool.query(`CREATE TABLE IF NOT EXISTS bitirme_food_logs (
      id SERIAL PRIMARY KEY,
      username VARCHAR(100),
      food_name VARCHAR(100),
      calories INTEGER,
      meal_type VARCHAR(50),
      confidence FLOAT,
      protein INTEGER DEFAULT 0,
      carbs INTEGER DEFAULT 0,
      fat INTEGER DEFAULT 0,
      created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
    );`);

    await pool.query(`CREATE TABLE IF NOT EXISTS bitirme_exercise_logs (
      id SERIAL PRIMARY KEY,
      username VARCHAR(100),
      exercise_name VARCHAR(100),
      duration_min INTEGER,
      calories_burned INTEGER,
      created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
    );`);

    await pool.query(`CREATE TABLE IF NOT EXISTS bitirme_community_posts (
      id SERIAL PRIMARY KEY,
      username VARCHAR(100),
      action_text TEXT NOT NULL,
      likes INTEGER DEFAULT 0,
      created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
    );`);

    await pool.query(`CREATE TABLE IF NOT EXISTS bitirme_comments (
      id SERIAL PRIMARY KEY,
      post_id INTEGER,
      username VARCHAR(100),
      comment_text TEXT NOT NULL,
      created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
    );`);

    await pool.query(`CREATE TABLE IF NOT EXISTS bitirme_messages (
      id SERIAL PRIMARY KEY,
      sender_username VARCHAR(100),
      receiver_username VARCHAR(100),
      message_text TEXT NOT NULL,
      created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
    );`);

    console.log("Tablolar Hazır/Kontrol Edildi (Railway Uyumlu 🛡️)");
  } catch (err) {
    console.error("Tablo hatası:", err.message);
  }
};
createTables();

// --- MULTER AYARLARI ---
const storage = multer.diskStorage({
  destination: (req, file, cb) => { cb(null, 'uploads/'); },
  filename: (req, file, cb) => { cb(null, 'user-' + Date.now() + path.extname(file.originalname)); }
});
const upload = multer({ storage: storage });

// --- YARDIMCI FONKSİYONLAR ---
const getLast7Days = () => {
  const days = [];
  for (let i = 6; i >= 0; i--) {
    const d = new Date(); d.setDate(d.getDate() - i);
    days.push(d.toLocaleDateString('tr-TR', { day: '2-digit', month: '2-digit' }).replace(/\./g, '/'));
  }
  return days;
};

const mergeData = (emptyDays, dbData) => {
  return emptyDays.map(day => {
    const found = dbData.find(item => item.date === day);
    return { date: day, value: found ? Number(found.value) : 0 };
  });
};

// --- ENDPOINT'LER ---

app.get('/graph-data/:user', async (req, res) => {
  const { user } = req.params;
  try {
    const waterRes = await pool.query(`SELECT to_char(created_at, 'DD/MM') as date, SUM(amount_ml) as value FROM bitirme_water_logs WHERE username = $1 GROUP BY date ORDER BY date DESC LIMIT 7`, [user]);
    const sleepRes = await pool.query(`SELECT to_char(created_at, 'DD/MM') as date, duration_hours as value FROM bitirme_sleep_logs WHERE username = $1 ORDER BY created_at DESC LIMIT 7`, [user]);
    const foodRes = await pool.query(`SELECT to_char(created_at, 'DD/MM') as date, SUM(calories) as value FROM bitirme_food_logs WHERE username = $1 GROUP BY date ORDER BY date DESC LIMIT 7`, [user]);
    const last7Days = getLast7Days();
    res.json({ water: mergeData(last7Days, waterRes.rows), sleep: mergeData(last7Days, sleepRes.rows), calories: mergeData(last7Days, foodRes.rows) });
  } catch (err) { res.status(500).send("Grafik verisi çekilemedi"); }
});

app.post('/register', async (req, res) => {
  const { name, goal, current_weight, target_weight, height, birthdate, gender, diet_type, activity_level, email, password, sports } = req.body;
  try {
    const salt = await bcrypt.genSalt(10);
    const hashedPassword = await bcrypt.hash(password, salt);
    const sportsString = sports && Array.isArray(sports) ? sports.join(', ') : '';
    
    const newUser = await pool.query(
      `INSERT INTO son_users (name, goal, current_weight, target_weight, height, birthdate, gender, diet_type, activity_level, email, password, sports) 
       VALUES ($1, $2, $3, $4, $5, $6, $7, $8, $9, $10, $11, $12) RETURNING *`, 
      [name, goal, current_weight, target_weight, height, birthdate, gender, diet_type, activity_level, email, hashedPassword, sportsString]
    );
    res.json({ success: true, user: newUser.rows[0] });
  } catch (err) { res.status(500).json({ success: false, error: err.message }); }
});

app.post('/login', async (req, res) => {
  const { email, password } = req.body;
  try {
    const user = await pool.query('SELECT * FROM son_users WHERE email = $1', [email]);
    if (user.rows.length === 0) return res.status(401).json({ success: false, message: "Kullanıcı bulunamadı" });

    const validPassword = await bcrypt.compare(password, user.rows[0].password);
    if (!validPassword) return res.status(401).json({ success: false, message: "Hatalı şifre" });

    const token = jwt.sign({ id: user.rows[0].id, email: user.rows[0].email }, JWT_SECRET, { expiresIn: '7d' });
    res.json({ success: true, user: user.rows[0], token: token });
  } catch (err) { res.status(500).json({ error: err.message }); }
});

app.post('/upload-pp', upload.single('file'), async (req, res) => {
  if (!req.file) return res.status(400).json({ error: "Dosya yüklenemedi" });
  const cleanPath = `/uploads/${req.file.filename}`;
  try { 
    await pool.query("UPDATE son_users SET profile_pic = $1 WHERE name = $2", [cleanPath, req.body.username]); 
    res.json({ success: true, filePath: cleanPath }); 
  } catch (err) { res.status(500).json({ error: "Veritabanı hatası" }); }
});

app.get('/user-details/:name', async (req, res) => {
  try {
    const result = await pool.query("SELECT current_weight, target_weight, height, birthdate, gender, activity_level, profile_pic FROM son_users WHERE name = $1", [req.params.name]);
    if (result.rows.length > 0) res.json(result.rows[0]);
    else res.json({ current_weight: 70, target_weight: 65, height: 170, birthdate: '2000-01-01', gender: 'Erkek', activity_level: 'Orta', profile_pic: null });
  } catch (err) { res.status(500).send("Hata"); }
});

app.post('/add-water', async (req, res) => {
  try { await pool.query("INSERT INTO bitirme_water_logs (username, amount_ml, created_at) VALUES ($1, $2, CURRENT_DATE)", [req.body.username, req.body.amount]); res.json({ success: true }); }
  catch (err) { res.status(500).send("Hata"); }
});

app.get('/water/:user', async (req, res) => {
  try { const result = await pool.query("SELECT SUM(amount_ml) as total FROM bitirme_water_logs WHERE username = $1 AND created_at = CURRENT_DATE", [req.params.user]); res.json({ total: result.rows[0].total || 0 }); }
  catch (err) { res.status(500).send("Hata"); }
});

app.post('/set-sleep', async (req, res) => {
  try {
    const check = await pool.query("SELECT * FROM bitirme_sleep_logs WHERE username = $1 AND created_at = CURRENT_DATE", [req.body.username]);
    if (check.rows.length > 0) await pool.query("UPDATE bitirme_sleep_logs SET duration_hours = $1 WHERE username = $2 AND created_at = CURRENT_DATE", [req.body.duration, req.body.username]);
    else await pool.query("INSERT INTO bitirme_sleep_logs (username, duration_hours) VALUES ($1, $2)", [req.body.username, req.body.duration]);
    res.json({ success: true });
  } catch (err) { res.status(500).send("Hata"); }
});

app.get('/sleep/:user', async (req, res) => {
  try { const result = await pool.query("SELECT duration_hours FROM bitirme_sleep_logs WHERE username = $1 AND created_at = CURRENT_DATE", [req.params.user]); res.json({ duration: result.rows.length > 0 ? result.rows[0].duration_hours : 0 }); }
  catch (err) { res.status(500).send("Hata"); }
});

app.post('/save-analysis', async (req, res) => {
  const { username, food_name, calories, confidence, meal_type, protein, carbs, fat } = req.body;
  try { await pool.query("INSERT INTO bitirme_food_logs (username, food_name, calories, confidence, meal_type, protein, carbs, fat) VALUES ($1, $2, $3, $4, $5, $6, $7, $8)", [username, food_name, calories, confidence, meal_type, protein || 0, carbs || 0, fat || 0]); res.json({ success: true }); } 
  catch (err) { res.status(500).send("Hata"); }
});

app.get('/history/:user', async (req, res) => {
  try { const result = await pool.query("SELECT * FROM bitirme_food_logs WHERE username = $1 ORDER BY created_at DESC LIMIT 20", [req.params.user]); res.json(result.rows); } 
  catch (err) { res.status(500).send("Hata"); }
});

app.delete('/delete-food/:id', async (req, res) => {
  try { await pool.query("DELETE FROM bitirme_food_logs WHERE id = $1", [req.params.id]); res.json({ success: true }); } 
  catch (err) { res.status(500).send("Hata"); }
});

app.post('/add-exercise', async (req, res) => {
  const { username, exercise_name, duration_min, calories_burned } = req.body;
  try { await pool.query("INSERT INTO bitirme_exercise_logs (username, exercise_name, duration_min, calories_burned) VALUES ($1, $2, $3, $4)", [username, exercise_name, duration_min, calories_burned]); res.json({ success: true }); }
  catch (err) { res.status(500).send("Hata"); }
});

app.get('/exercises/:user', async (req, res) => {
  try {
    const result = await pool.query("SELECT * FROM bitirme_exercise_logs WHERE username = $1 ORDER BY created_at DESC LIMIT 20", [req.params.user]);
    res.json(result.rows);
  } catch (err) { 
    console.error("Egzersiz geçmişi çekilemedi:", err);
    res.status(500).send("Hata"); 
  }
});

app.post('/community/post', async (req, res) => {
  const { username, action_text } = req.body;
  try {
    const newPost = await pool.query("INSERT INTO bitirme_community_posts (username, action_text) VALUES ($1, $2) RETURNING *", [username, action_text]);
    res.json({ success: true, post: newPost.rows[0] });
  } catch (err) { res.status(500).json({ success: false, error: err.message }); }
});

app.get('/community/feed', async (req, res) => {
  try {
    const result = await pool.query(`
      SELECT p.id, p.username, p.action_text, p.likes, p.created_at, u.profile_pic 
      FROM bitirme_community_posts p
      LEFT JOIN son_users u ON p.username = u.email OR p.username = u.name
      ORDER BY p.created_at DESC LIMIT 50
    `);
    res.json(result.rows);
  } catch (err) { res.status(500).json({ error: "Akış çekilemedi" }); }
});

app.post('/community/like/:id', async (req, res) => {
  try { await pool.query("UPDATE bitirme_community_posts SET likes = likes + 1 WHERE id = $1", [req.params.id]); res.json({ success: true }); } 
  catch (err) { res.status(500).json({ success: false, error: "Beğenilemedi" }); }
});

app.post('/chat/send', async (req, res) => {
  const { sender, receiver, message } = req.body;
  try {
    await pool.query("INSERT INTO bitirme_messages (sender_username, receiver_username, message_text) VALUES ($1, $2, $3)", [sender, receiver, message]);
    res.json({ success: true });
  } catch (err) { res.status(500).json({ error: "Mesaj gönderilemedi" }); }
});

app.get('/chat/inbox/:user', async (req, res) => {
  const { user } = req.params;
  try {
    const result = await pool.query(`
      SELECT DISTINCT CASE WHEN sender_username = $1 THEN receiver_username ELSE sender_username END as chat_partner, MAX(created_at) as last_interaction
      FROM bitirme_messages WHERE sender_username = $1 OR receiver_username = $1
      GROUP BY chat_partner ORDER BY last_interaction DESC
    `, [user]);
    res.json(result.rows);
  } catch (err) { res.status(500).json({ error: "Sohbetler getirilemedi" }); }
});

app.get('/chat/history/:user1/:user2', async (req, res) => {
  const { user1, user2 } = req.params;
  try {
    const result = await pool.query(`
      SELECT * FROM bitirme_messages 
      WHERE (sender_username = $1 AND receiver_username = $2) OR (sender_username = $2 AND receiver_username = $1) 
      ORDER BY created_at ASC`, 
      [user1, user2]
    );
    res.json(result.rows);
  } catch (err) { res.status(500).json({ error: "Mesaj geçmişi çekilemedi" }); }
});

app.post('/community/comment', async (req, res) => {
  const { post_id, username, comment_text } = req.body;
  try {
    await pool.query("INSERT INTO bitirme_comments (post_id, username, comment_text) VALUES ($1, $2, $3)", [post_id, username, comment_text]);
    res.json({ success: true });
  } catch (err) { 
    console.error(err);
    res.status(500).json({ error: "Yorum eklenemedi", details: err.message }); 
  }
});

app.get('/community/comments/:postId', async (req, res) => {
  try {
    const result = await pool.query("SELECT * FROM bitirme_comments WHERE post_id = $1 ORDER BY created_at ASC", [req.params.postId]);
    res.json(result.rows);
  } catch (err) { res.status(500).json({ error: "Yorumlar çekilemedi" }); }
});

// --- ✨ YAPAY ZEKA GIDA VE MOTİVASYON SOHBETİ (AI CHAT) ✨ ---
app.post("/chat", async (req, res) => {
  try {
    const { message, context, image } = req.body;
    const fullPrompt = `Sen profesyonel bir diyetisyen, spor koçu ve SMLife asistanısın. 
    Kullanıcının güncel verileri: ${context}. 
    Kullanıcının mesajı: ${message}`;

    const promptParts = [fullPrompt];

    if (image) {
      promptParts.push({
        inlineData: {
          data: image,
          mimeType: "image/jpeg",
        },
      });
    }

    const result = await model.generateContent(promptParts);
    res.json({ reply: result.response.text() });
  } catch (error) {
    console.error("AI Chat Hatası:", error);
    res.status(500).json({ error: "Yapay zeka şu an yanıt veremiyor." });
  }
});

// --- ✨ YAPAY ZEKA HAFTALIK RAPOR OLUŞTURUCU (KURŞUN GEÇİRMEZ) ✨ ---
app.get('/generate-report/:user', async (req, res) => {
  const { user } = req.params;
  try {
    const userRes = await pool.query("SELECT * FROM son_users WHERE name = $1", [user]);
    const userData = userRes.rows.length > 0 ? userRes.rows[0] : { current_weight: 70, target_weight: 65 };

    const exRes = await pool.query("SELECT SUM(duration_min) as total_min FROM bitirme_exercise_logs WHERE username = $1 AND created_at >= CURRENT_DATE - INTERVAL '7 days'", [user]);
    const foodRes = await pool.query("SELECT SUM(calories) as total_cal FROM bitirme_food_logs WHERE username = $1 AND created_at >= CURRENT_DATE - INTERVAL '7 days'", [user]);
    const waterRes = await pool.query("SELECT SUM(amount_ml) as total_ml FROM bitirme_water_logs WHERE username = $1 AND created_at >= CURRENT_DATE - INTERVAL '7 days'", [user]);

    const weeklyEx = exRes.rows[0].total_min || 0;
    const weeklyCal = foodRes.rows[0].total_cal || 0;
    const weeklyWater = waterRes.rows[0].total_ml || 0;

    const prompt = `Sen SMLife uygulamasının profesyonel, motive edici ve uzman AI Diyetisyen / Spor Koçusun.
    Kullanıcının Adı: ${user}
    Mevcut Kilosu: ${userData.current_weight} kg
    Hedef Kilosu: ${userData.target_weight} kg
    
    Kullanıcının Son 7 Günlük Performansı:
    - Toplam Egzersiz: ${weeklyEx} dakika
    - Toplam Alınan Kalori: ${weeklyCal} kcal
    - Toplam İçilen Su: ${weeklyWater} ml

    LÜTFEN BANA SADECE AŞAĞIDAKİ FORMATTA GEÇERLİ BİR JSON OBJESİ DÖNDÜR. Ekstra metin, markdown veya açıklama KULLANMA.
    {
      "analiz": "Kullanıcının haftalık performansını samimi bir dille analiz et. (Maksimum 3-4 cümle)",
      "diyet": "Hedef kilosuna ulaşması için pratik bir diyet önerisi yaz. (Maksimum 3-4 cümle)",
      "egzersiz": "Mevcut spor dakikasına bakarak gerçekçi bir egzersiz planı çiz. (Maksimum 3-4 cümle)"
    }`;

    const result = await model.generateContent(prompt);
    let textResponse = result.response.text();

    const startIndex = textResponse.indexOf('{');
    const endIndex = textResponse.lastIndexOf('}');
    
    if (startIndex === -1 || endIndex === -1) {
      throw new Error("Yapay zeka geçerli bir format döndürmedi.");
    }
    
    const cleanJsonString = textResponse.substring(startIndex, endIndex + 1);
    const jsonResponse = JSON.parse(cleanJsonString);

    res.json(jsonResponse);

  } catch (error) {
    console.error("Yapay Zeka Rapor Hatası:", error);
    res.status(500).json({ error: "Rapor oluşturulamadı" });
  }
});

app.listen(PORT, '0.0.0.0', () => console.log(`🚀 Server ${PORT} portunda başarıyla çalışıyor!`));