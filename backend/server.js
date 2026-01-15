const express = require('express');
const cors = require('cors');
const pool = require('./db');
const multer = require('multer');
const path = require('path');

const app = express();
const PORT = 5000;

app.use(cors());
app.use(express.json());

app.use('/uploads', express.static(path.join(__dirname, 'uploads')));

const createTables = async () => {
  try {
    await pool.query(`CREATE TABLE IF NOT EXISTS son_users (
      id SERIAL PRIMARY KEY,
      name VARCHAR(100),
      email VARCHAR(100) UNIQUE,
      password VARCHAR(100) NOT NULL,
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

    console.log("Tablolar Hazır/Kontrol Edildi");
  } catch (err) {
    console.error("Tablo hatası:", err.message);
  }
};

createTables();

const storage = multer.diskStorage({
  destination: (req, file, cb) => {
    cb(null, 'uploads/');
  },
  filename: (req, file, cb) => {
    cb(null, 'user-' + Date.now() + path.extname(file.originalname));
  }
});

const upload = multer({ storage: storage });

const getLast7Days = () => {
  const days = [];
  for (let i = 6; i >= 0; i--) {
    const d = new Date();
    d.setDate(d.getDate() - i);
    const dayStr = d.toLocaleDateString('tr-TR', { day: '2-digit', month: '2-digit' }).replace(/\./g, '/');
    days.push(dayStr);
  }
  return days;
};

const mergeData = (emptyDays, dbData) => {
  return emptyDays.map(day => {
    const found = dbData.find(item => item.date === day);
    return {
      date: day,
      value: found ? Number(found.value) : 0
    };
  });
};

app.get('/graph-data/:user', async (req, res) => {
  const { user } = req.params;
  try {
    const waterRes = await pool.query(`SELECT to_char(created_at, 'DD/MM') as date, SUM(amount_ml) as value FROM bitirme_water_logs WHERE username = $1 GROUP BY date ORDER BY date DESC LIMIT 7`, [user]);
    const sleepRes = await pool.query(`SELECT to_char(created_at, 'DD/MM') as date, duration_hours as value FROM bitirme_sleep_logs WHERE username = $1 ORDER BY created_at DESC LIMIT 7`, [user]);
    const foodRes = await pool.query(`SELECT to_char(created_at, 'DD/MM') as date, SUM(calories) as value FROM bitirme_food_logs WHERE username = $1 GROUP BY date ORDER BY date DESC LIMIT 7`, [user]);

    const last7Days = getLast7Days();

    res.json({
      water: mergeData(last7Days, waterRes.rows),
      sleep: mergeData(last7Days, sleepRes.rows),
      calories: mergeData(last7Days, foodRes.rows)
    });
  } catch (err) { console.error(err); res.status(500).send("Hata"); }
});

app.post('/register', async (req, res) => {
  const { name, goal, current_weight, target_weight, height, birthdate, gender, diet_type, activity_level, email, password, sports } = req.body;
  try {
    const sportsString = sports && Array.isArray(sports) ? sports.join(', ') : '';
    const newUser = await pool.query(
      `INSERT INTO son_users (name, goal, current_weight, target_weight, height, birthdate, gender, diet_type, activity_level, email, password, sports) VALUES ($1, $2, $3, $4, $5, $6, $7, $8, $9, $10, $11, $12) RETURNING *`,
      [name, goal, current_weight, target_weight, height, birthdate, gender, diet_type, activity_level, email, password, sportsString]
    );
    res.json({ success: true, user: newUser.rows[0] });
  } catch (err) { console.error(err); res.status(500).json({ success: false, error: err.message }); }
});

app.post('/login', async (req, res) => {
  const { email, password } = req.body;
  try {
    const user = await pool.query('SELECT * FROM son_users WHERE email = $1 AND password = $2', [email, password]);
    if (user.rows.length > 0) res.json({ success: true, user: user.rows[0] });
    else res.status(401).json({ success: false, message: "Hatalı giriş" });
  } catch (err) { res.status(500).json({ error: err.message }); }
});

app.post('/upload-pp', upload.single('file'), async (req, res) => {
  if (!req.file) return res.status(400).json({ error: "Dosya yüklenemedi" });

  const { username } = req.body;
  const cleanPath = `/uploads/${req.file.filename}`;

  try {
    await pool.query("UPDATE son_users SET profile_pic = $1 WHERE name = $2", [cleanPath, username]);
    res.json({ success: true, filePath: cleanPath });
  } catch (err) {
    console.error(err);
    res.status(500).json({ error: "Veritabanı hatası" });
  }
});

app.get('/user-details/:name', async (req, res) => {
  const { name } = req.params;
  try {
    const result = await pool.query(
      "SELECT current_weight, height, birthdate, gender, activity_level, profile_pic FROM son_users WHERE name = $1",
      [name]
    );

    if (result.rows.length > 0) {
      res.json(result.rows[0]);
    } else {
      res.json({
        current_weight: 70,
        height: 170,
        birthdate: '2000-01-01',
        gender: 'Erkek',
        activity_level: 'Orta',
        profile_pic: null
      });
    }
  } catch (err) { console.error(err); res.status(500).send("Hata"); }
});

app.post('/add-water', async (req, res) => {
  const { username, amount } = req.body;
  try {
    await pool.query(
      "INSERT INTO bitirme_water_logs (username, amount_ml, created_at) VALUES ($1, $2, CURRENT_DATE)",
      [username, amount]
    );
    res.json({ success: true });
  }
  catch (err) { console.error(err); res.status(500).send("Hata"); }
});

app.get('/water/:user', async (req, res) => {
  const { user } = req.params;
  try {
    const result = await pool.query(
        "SELECT SUM(amount_ml) as total FROM bitirme_water_logs WHERE username = $1 AND created_at = CURRENT_DATE",
        [user]
    );
    res.json({ total: result.rows[0].total || 0 });
  }
  catch (err) { console.error(err); res.status(500).send("Hata"); }
});

app.post('/set-sleep', async (req, res) => {
  const { username, duration } = req.body;
  try {
    const check = await pool.query("SELECT * FROM bitirme_sleep_logs WHERE username = $1 AND created_at = CURRENT_DATE", [username]);
    if (check.rows.length > 0) { await pool.query("UPDATE bitirme_sleep_logs SET duration_hours = $1 WHERE username = $2 AND created_at = CURRENT_DATE", [duration, username]); }
    else { await pool.query("INSERT INTO bitirme_sleep_logs (username, duration_hours) VALUES ($1, $2)", [username, duration]); }
    res.json({ success: true });
  } catch (err) { console.error(err); res.status(500).send("Hata"); }
});

app.get('/sleep/:user', async (req, res) => {
  const { user } = req.params;
  try { const result = await pool.query("SELECT duration_hours FROM bitirme_sleep_logs WHERE username = $1 AND created_at = CURRENT_DATE", [user]); res.json({ duration: result.rows.length > 0 ? result.rows[0].duration_hours : 0 }); }
  catch (err) { console.error(err); res.status(500).send("Hata"); }
});

app.post('/save-analysis', async (req, res) => {
  const { username, food_name, calories, confidence, meal_type, protein, carbs, fat } = req.body;
  try {
    await pool.query(
      "INSERT INTO bitirme_food_logs (username, food_name, calories, confidence, meal_type, protein, carbs, fat) VALUES ($1, $2, $3, $4, $5, $6, $7, $8)",
      [username, food_name, calories, confidence, meal_type, protein || 0, carbs || 0, fat || 0]
    );
    res.json({ success: true });
  } catch (err) { console.error(err); res.status(500).send("Hata"); }
});

app.get('/history/:user', async (req, res) => {
  const { user } = req.params;
  try {
    const result = await pool.query("SELECT * FROM bitirme_food_logs WHERE username = $1 ORDER BY created_at DESC LIMIT 20", [user]);
    res.json(result.rows);
  } catch (err) { console.error(err); res.status(500).send("Hata"); }
});

app.delete('/delete-food/:id', async (req, res) => {
  const { id } = req.params;
  try {
    await pool.query("DELETE FROM bitirme_food_logs WHERE id = $1", [id]);
    res.json({ success: true });
  } catch (err) { console.error(err); res.status(500).send("Hata"); }
});

app.post('/add-exercise', async (req, res) => {
  const { username, exercise_name, duration_min, calories_burned } = req.body;
  try { await pool.query("INSERT INTO bitirme_exercise_logs (username, exercise_name, duration_min, calories_burned) VALUES ($1, $2, $3, $4)", [username, exercise_name, duration_min, calories_burned]); res.json({ success: true }); }
  catch (err) { console.error(err); res.status(500).send("Hata"); }
});

app.get('/exercises/:user', async (req, res) => {
  const { user } = req.params;
  try { const result = await pool.query("SELECT * FROM bitirme_exercise_logs WHERE username = $1 ORDER BY created_at DESC LIMIT 10", [user]); res.json(result.rows); }
  catch (err) { console.error(err); res.status(500).send("Hata"); }
});

app.get('/weekly-exercise/:user', async (req, res) => {
  const { user } = req.params;
  try {
    const result = await pool.query(`
      SELECT SUM(duration_min) as total_min
      FROM bitirme_exercise_logs
      WHERE username = $1
      AND created_at >= CURRENT_DATE - INTERVAL '7 days'
    `, [user]);

    const total = result.rows[0].total_min || 0;
    res.json({ total_min: parseInt(total) });
  } catch (err) { console.error(err); res.status(500).send("Hata"); }
});

app.listen(PORT, () => console.log(`🚀 Server ${PORT} portunda çalışıyor!`));