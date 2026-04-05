import React, { useEffect, useState, useRef } from 'react';
import { useNavigate } from 'react-router-dom';
import { LineChart, Line, BarChart, Bar, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer, AreaChart, Area } from 'recharts';
import './Dashboard.css';

const foodDatabase = [
  { name: 'Haşlanmış Yumurta', cal: 155, p: 13, c: 1, f: 11 },
  { name: 'Sahanda Yumurta', cal: 180, p: 14, c: 1, f: 15 },
  { name: 'Tam Buğday Ekmeği', cal: 65, p: 3, c: 12, f: 1 },
  { name: 'Beyaz Peynir', cal: 95, p: 6, c: 1, f: 8 },
  { name: 'Izgara Tavuk (100g)', cal: 165, p: 31, c: 0, f: 3.6 },
  { name: 'Tavuk Sote', cal: 220, p: 25, c: 5, f: 10 },
  { name: 'Pilav (1 Porsiyon)', cal: 280, p: 5, c: 60, f: 2 },
  { name: 'Makarna', cal: 300, p: 10, c: 65, f: 2 },
  { name: 'Mercimek Çorbası', cal: 130, p: 8, c: 18, f: 3 },
  { name: 'Köfte (1 Porsiyon)', cal: 350, p: 20, c: 10, f: 25 },
  { name: 'Lahmacun', cal: 400, p: 15, c: 45, f: 18 },
  { name: 'Pizza (1 Dilim)', cal: 250, p: 10, c: 30, f: 10 },
  { name: 'Hamburger', cal: 500, p: 25, c: 40, f: 25 },
  { name: 'Patates Kızartması', cal: 350, p: 4, c: 45, f: 18 },
  { name: 'Elma', cal: 50, p: 0, c: 14, f: 0 },
  { name: 'Muz', cal: 90, p: 1, c: 23, f: 0 },
  { name: 'Yoğurt (1 Kase)', cal: 120, p: 8, c: 10, f: 6 },
  { name: 'Yulaf Ezmesi (50g)', cal: 180, p: 6, c: 30, f: 3 }
];

const exerciseTypes = [
  { name: 'Yürüyüş (Hafif)', met: 3.0 },
  { name: 'Yürüyüş (Tempolu)', met: 4.5 },
  { name: 'Koşu (Hafif)', met: 7.0 },
  { name: 'Koşu (Hızlı)', met: 11.0 },
  { name: 'Bisiklet', met: 7.5 },
  { name: 'Yüzme', met: 6.0 },
  { name: 'Fitness / Ağırlık', met: 5.0 },
  { name: 'Yoga / Pilates', met: 3.0 },
  { name: 'Futbol / Basketbol', met: 8.0 },
  { name: 'Dans', met: 5.0 }
];

const Dashboard = () => {
  const navigate = useNavigate();
  const [userName, setUserName] = useState("");
  const [activeTab, setActiveTab] = useState("overview");
  
  const fileInputRef = useRef(null);

  const [selectedFile, setSelectedFile] = useState(null);
  const [previewUrl, setPreviewUrl] = useState(null);
  const [aiResult, setAiResult] = useState(null);
  const [loading, setLoading] = useState(false);
  
  const [history, setHistory] = useState([]); 
  const [exerciseHistory, setExerciseHistory] = useState([]);
  
  const [targetMeal, setTargetMeal] = useState(null);
  const [searchTerm, setSearchTerm] = useState("");

  const [waterTotal, setWaterTotal] = useState(0);
  const [sleepHours, setSleepHours] = useState(0);
  
  const [userWeight, setUserWeight] = useState(70); 
  const [waterTarget, setWaterTarget] = useState(2300); 
  const [calorieGoal, setCalorieGoal] = useState(2000);
  const [profilePic, setProfilePic] = useState(null);

  const [selectedExercise, setSelectedExercise] = useState(exerciseTypes[0]);
  const [weeklyMinutes, setWeeklyMinutes] = useState(0);
  const weeklyGoal = 150;
  const [timerOn, setTimerOn] = useState(false);
  const [timerTime, setTimerTime] = useState(0);
  const timerRef = useRef(null);

  const [bedTime, setBedTime] = useState("");
  const [wakeTime, setWakeTime] = useState("");
  const [calculatedSleep, setCalculatedSleep] = useState(null);

  const [graphData, setGraphData] = useState({ water: [], sleep: [], calories: [] });

  const [dailyMacros, setDailyMacros] = useState({ p: 0, c: 0, f: 0, cal: 0 });

  useEffect(() => {
    const savedName = localStorage.getItem('userName');
    if (savedName) {
      setUserName(savedName);
      loadAllData(savedName);
    } else {
      navigate('/login');
    }
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [navigate]);

  useEffect(() => {
    if (activeTab === 'overview' && userName) {
      loadAllData(userName);
    }
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [activeTab, userName]);

  useEffect(() => {
    if (bedTime && wakeTime) {
        const start = new Date(`2000-01-01T${bedTime}`);
        const end = new Date(`2000-01-01T${wakeTime}`);
        let diff = end - start;
        if (diff < 0) diff += 24 * 60 * 60 * 1000;
        setCalculatedSleep(parseFloat((diff / (1000 * 60 * 60)).toFixed(1)));
    } else { setCalculatedSleep(null); }
  }, [bedTime, wakeTime]);

  useEffect(() => {
    const target = userWeight * 33;
    setWaterTarget(Math.round(target));
  }, [userWeight]);

  useEffect(() => {
    let p = 0, c = 0, f = 0, cal = 0;
    history.forEach(item => {
        cal += item.calories || 0;
        p += item.protein || 0;
        c += item.carbs || 0;
        f += item.fat || 0;
    });
    setDailyMacros({ p, c, f, cal });
  }, [history]);

  const loadAllData = (user) => {
    fetchUserDetails(user); 
    fetchHistory(user);
    fetchExerciseHistory(user);
    fetchWater(user);
    fetchSleep(user);
    fetchGraphData(user);
    fetchWeeklyExercise(user);
  };

  const calculateTDEE = (weight, height, birthdate, gender, activity) => {
    if (!weight || !height || !birthdate) return 2000;
    const today = new Date();
    const birthDate = new Date(birthdate);
    let age = today.getFullYear() - birthDate.getFullYear();
    const m = today.getMonth() - birthDate.getMonth();
    if (m < 0 || (m === 0 && today.getDate() < birthDate.getDate())) age--;

    let bmr = 0;
    const w = parseFloat(weight);
    const h = parseFloat(height);

    if (gender === 'Kadın' || gender === 'Female') {
        bmr = 447.6 + (9.2 * w) + (3.1 * h) - (4.3 * age);
    } else {
        bmr = 88.36 + (13.4 * w) + (4.8 * h) - (5.7 * age);
    }

    let multiplier = 1.2;
    if (activity === 'Az Hareketli') multiplier = 1.375;
    else if (activity === 'Orta Hareketli') multiplier = 1.55;
    else if (activity === 'Çok Hareketli') multiplier = 1.725;
    else if (activity === 'Sporcu') multiplier = 1.9;

    return Math.round(bmr * multiplier);
  };

  const fetchUserDetails = async (user) => {
    try {
        const res = await fetch(`https://sm-life-akilli-yasam-1007.up.railway.app/user-details/${user}`);
        const data = await res.json();
        if(data.current_weight) { setUserWeight(parseInt(data.current_weight)); }
        if(data.profile_pic) { setProfilePic(`https://sm-life-akilli-yasam-1007.up.railway.app${data.profile_pic}`); }
        
        const calculatedGoal = calculateTDEE(data.current_weight, data.height, data.birthdate, data.gender, data.activity_level);
        setCalorieGoal(calculatedGoal);
    } catch (err) { console.error(err); }
  };

  const fetchWeeklyExercise = async (user) => {
    try {
        const res = await fetch(`https://sm-life-akilli-yasam-1007.up.railway.app/weekly-exercise/${user}`);
        const data = await res.json();
        setWeeklyMinutes(data.total_min);
    } catch (err) { console.error(err); }
  };

  const fetchHistory = async (user) => { try { const res = await fetch(`https://sm-life-akilli-yasam-1007.up.railway.app/history/${user}`); setHistory(await res.json()); } catch (err) {} };
  
  const fetchExerciseHistory = async (user) => { 
    try { 
        const res = await fetch(`https://sm-life-akilli-yasam-1007.up.railway.app/exercises/${user}`); 
        const data = await res.json();
        setExerciseHistory(data); 
    } catch (err) { console.error(err); } 
  };
  const fetchWater = async (user) => { try { const res = await fetch(`https://sm-life-akilli-yasam-1007.up.railway.app/water/${user}`); setWaterTotal((await res.json()).total); } catch (err) {} };
  const fetchSleep = async (user) => { try { const res = await fetch(`https://sm-life-akilli-yasam-1007.up.railway.app/sleep/${user}`); const data = await res.json(); setSleepHours(data.duration); } catch (err) {} };
  const fetchGraphData = async (user) => { try { const res = await fetch(`https://sm-life-akilli-yasam-1007.up.railway.app/graph-data/${user}`); setGraphData(await res.json()); } catch (err) {} };

  const handleProfilePicUpload = async (e) => {
    const file = e.target.files[0];
    if (!file) return;
    const formData = new FormData();
    formData.append('file', file);
    formData.append('username', userName);
    try {
        const res = await fetch('https://sm-life-akilli-yasam-1007.up.railway.app/upload-pp', { method: 'POST', body: formData });
        const data = await res.json();
        if (data.success) {
            setProfilePic(`https://sm-life-akilli-yasam-1007.up.railway.app${data.filePath}?v=${Date.now()}`);
            alert("Profil fotoğrafı güncellendi!");
        } else { alert("Hata oluştu."); }
    } catch (error) { console.error("Upload hatası:", error); }
  };

  const addWater = async (amount) => {
    const currentVal = Number(waterTotal);
    const nextVal = currentVal + amount;
    if (amount < 0 && nextVal < 0) { return alert("Su miktarı 0'dan az olamaz!"); }
    await fetch('https://sm-life-akilli-yasam-1007.up.railway.app/add-water', { method: 'POST', headers: {'Content-Type': 'application/json'}, body: JSON.stringify({ username: userName, amount }) });
    fetchWater(userName); fetchGraphData(userName);
  };

  const saveSleep = async () => {
    if (!calculatedSleep) return alert("Geçerli saat girin!");
    await fetch('https://sm-life-akilli-yasam-1007.up.railway.app/set-sleep', { method: 'POST', headers: {'Content-Type': 'application/json'}, body: JSON.stringify({ username: userName, duration: calculatedSleep }) });
    fetchSleep(userName); fetchGraphData(userName); alert(`Uyku kaydedildi: ${calculatedSleep} saat`);
    setBedTime(""); setWakeTime(""); setCalculatedSleep(null);
  };

  const toggleTimer = () => {
    if (!timerOn) {
        setTimerOn(true);
        timerRef.current = setInterval(() => { setTimerTime(prev => prev + 1); }, 1000);
    } else {
        clearInterval(timerRef.current);
        setTimerOn(false);
    }
  };

  const stopAndSaveTimer = () => {
    clearInterval(timerRef.current);
    setTimerOn(false);
    const minutes = Math.ceil(timerTime / 60);
    if (minutes < 1) return alert("Süre çok kısa!");
    handleSaveExercise(selectedExercise.name, minutes, selectedExercise.met);
    setTimerTime(0);
  };

  const handleSaveExercise = async (name, duration, metVal) => {
      const cal = Math.round(metVal * userWeight * (duration / 60));
      
      setWeeklyMinutes(prev => prev + duration); 
      
      const newActivity = {
          id: Date.now(),
          exercise_name: name,
          duration_min: duration,
          calories_burned: cal
      };
      setExerciseHistory(prev => [newActivity, ...prev]); 

      try {
        await fetch('https://sm-life-akilli-yasam-1007.up.railway.app/add-exercise', { 
            method: 'POST', 
            headers: {'Content-Type': 'application/json'}, 
            body: JSON.stringify({ 
                username: userName, 
                exercise_name: name, 
                duration_min: duration, 
                calories_burned: cal 
            }) 
        });
      } catch (err) {
        console.error("Kayıt hatası:", err);
        alert("Bir hata oluştu, kayıt yapılamadı.");
      }
  };

  const handlePlusClick = (meal) => { setTargetMeal(meal); setSearchTerm(""); setAiResult(null); setPreviewUrl(null); };
  
  const handleManualAdd = async (foodItem) => {
    try {
        await fetch('https://sm-life-akilli-yasam-1007.up.railway.app/save-analysis', { 
            method: 'POST', headers: {'Content-Type': 'application/json'}, 
            body: JSON.stringify({ 
                username: userName, 
                food_name: foodItem.name, 
                calories: foodItem.cal, 
                confidence: 1.0, 
                meal_type: targetMeal, 
                protein: foodItem.p, 
                carbs: foodItem.c, 
                fat: foodItem.f 
            }) 
        });
        fetchHistory(userName); fetchGraphData(userName); setTargetMeal(null);
    } catch (e) { alert("Hata oluştu"); }
  };

  const handleDeleteFood = async (id) => {
      if(!window.confirm("Bu yemeği silmek istediğine emin misin?")) return;
      try {
          await fetch(`https://sm-life-akilli-yasam-1007.up.railway.app/delete-food/${id}`, { method: 'DELETE' });
          fetchHistory(userName);
          fetchGraphData(userName);
      } catch (e) { alert("Silme hatası"); }
  };

  const handleFileSelect = (e) => { const file = e.target.files[0]; if (file) { setSelectedFile(file); setPreviewUrl(URL.createObjectURL(file)); setAiResult(null); } };
  
  const handleAnalyze = async () => {
    if (!selectedFile) return alert("Resim seç!");
    setLoading(true);
    const formData = new FormData(); formData.append('file', selectedFile);
    try {
        const aiRes = await fetch('https://sm-life-akilli-yasam-1007.up.railway.app/predict', { method: 'POST', body: formData });
        const aiData = await aiRes.json();
        if (aiData.success) {
            setAiResult(aiData);
            await fetch('https://sm-life-akilli-yasam-1007.up.railway.app/save-analysis', { 
                method: 'POST', 
                headers: {'Content-Type': 'application/json'}, 
                body: JSON.stringify({ 
                    username: userName, 
                    food_name: aiData.label, 
                    calories: aiData.calories, 
                    confidence: aiData.confidence, 
                    meal_type: targetMeal, 
                    protein: aiData.protein || 10, 
                    carbs: aiData.carbs || 20, 
                    fat: aiData.fat || 5 
                }) 
            });
            fetchHistory(userName); fetchGraphData(userName);
        } else { alert("AI Hatası: " + aiData.error); }
    } catch (e) { alert("Hata oluştu"); } finally { setLoading(false); }
  };
  
  const cancelAnalysis = () => { setSelectedFile(null); setPreviewUrl(null); setAiResult(null); setTargetMeal(null); };
  const handleLogout = () => { localStorage.removeItem('userName'); navigate('/'); };

  const SleepCard = () => {
    let sleepMessage = "Henüz veri yok";
    let messageColor = "#636e72";
    if (sleepHours > 0) {
        if (sleepHours < 6) { sleepMessage = "⚠️ Uykun çok az! En az 6-7 saat uyumalısın."; messageColor = "#e17055"; } 
        else if (sleepHours >= 6 && sleepHours <= 9) { sleepMessage = "✅ Harika! İdeal uyku süresindesin."; messageColor = "#00b894"; } 
        else { sleepMessage = "😴 Biraz fazla uyumuş olabilirsin."; messageColor = "#fdcb6e"; }
    }
    return (
        <div className="card sleep-card">
            <h2>😴 Uyku Takibi</h2>
            <div className="card-content">
                <p style={{marginBottom:'5px', fontSize:'1.1rem'}}>Bugün: <strong style={{color:'#a29bfe', fontSize:'1.4rem'}}>{sleepHours} Saat</strong></p>
                {sleepHours > 0 && (<p style={{color: messageColor, fontSize:'0.9rem', marginBottom:'15px', fontWeight:'bold', padding:'5px', backgroundColor:'#f9f9f9', borderRadius:'5px'}}>{sleepMessage}</p>)}
                <div className="time-inputs-container">
                    <div className="time-group"><label>Yatış 🛌</label><input type="time" className="time-input" value={bedTime} onChange={(e) => setBedTime(e.target.value)} /></div>
                    <div className="time-group"><label>Kalkış ☀️</label><input type="time" className="time-input" value={wakeTime} onChange={(e) => setWakeTime(e.target.value)} /></div>
                </div>
                {calculatedSleep !== null && (<div className="sleep-calculation"><span>Süre: </span><strong>{calculatedSleep} Saat</strong></div>)}
                <button className="btn-save-sleep" onClick={saveSleep}>Kaydet</button>
            </div>
        </div>
    );
  };

  const WaterCard = () => {
    let waterMessage = "";
    let waterColor = "#636e72";
    if (waterTotal < waterTarget) { const diff = waterTarget - waterTotal; waterMessage = `💧 Hedefine ${diff} ml kaldı.`; waterColor = "#0984e3"; } 
    else if (waterTotal > waterTarget + 1500) { waterMessage = "⚠️ Çok fazla su içtin! Dikkat et."; waterColor = "#d63031"; } 
    else { waterMessage = "🎉 Harika! Hedefi tamamladın."; waterColor = "#00b894"; }

    return (
        <div className="card water-card">
            <h2>💧 Su Takibi</h2>
            <div className="card-content">
                <div className="water-circle"><span>{(waterTotal / 1000).toFixed(1)} L</span></div>
                <p style={{fontSize:'1.1rem', fontWeight:'bold'}}>Toplam: {waterTotal} ml</p>
                <p style={{color: waterColor, fontSize:'0.85rem', margin:'10px 0', fontWeight:'bold'}}>{waterMessage}</p>
                <div className="btn-group"><button onClick={() => addWater(200)}>+200ml</button><button onClick={() => addWater(500)}>+500ml</button></div>
                <div className="btn-group" style={{marginTop: '10px'}}><button className="btn-minus" onClick={() => addWater(-200)}>-200ml</button><button className="btn-minus" onClick={() => addWater(-500)}>-500ml</button></div>
            </div>
        </div>
    );
  };

  const FoodCard = () => {
    const mealTargets = { 'Kahvaltı': 400, 'Öğle': 700, 'Akşam': 700, 'Ara Öğün': 200 };
    const filteredFood = foodDatabase.filter(food => food.name.toLowerCase().includes(searchTerm.toLowerCase()));
    
    const maxCal = calorieGoal || 2000;
    const totalCal = dailyMacros.cal;
    const progressPercent = Math.min((totalCal / maxCal) * 100, 100);

    return (
        <div className="card food-card full-width">
            <h2>🍎 Detaylı Beslenme Takibi</h2>
            <div className="nutrition-summary">
                <div className="main-cal-display">
                    <span className="cal-title">Alınan Kalori (Hedef: {maxCal})</span>
                    <span className="cal-value">{totalCal} / {maxCal} kcal</span>
                    <div className="progress-bar-bg"><div className="progress-bar-fill" style={{width: `${progressPercent}%`}}></div></div>
                </div>
                <div className="macro-display">
                    <div className="macro-item protein"><span>Protein</span><strong>{dailyMacros.p}g</strong></div>
                    <div className="macro-item carbs"><span>Karb</span><strong>{dailyMacros.c}g</strong></div>
                    <div className="macro-item fat"><span>Yağ</span><strong>{dailyMacros.f}g</strong></div>
                </div>
            </div>
            <hr className="divider-line"/>
            {!targetMeal ? (
                <div className="meal-buttons-grid">
                    {Object.keys(mealTargets).map((meal) => (
                        <div key={meal} className="meal-add-btn" onClick={() => handlePlusClick(meal)}><span>{meal}</span><span className="plus-icon">+</span></div>
                    ))}
                </div>
            ) : (
                <div className="card-content add-mode">
                    <div className="preview-header"><h3>{targetMeal} Ekle</h3><button className="btn-close" onClick={cancelAnalysis}>İptal</button></div>
                    {previewUrl ? (
                        <div className="preview-box"><img src={previewUrl} alt="Yemek" /><button onClick={handleAnalyze} disabled={loading} className="btn-analyze">{loading ? "..." : "Analiz Et ve Kaydet"}</button>{aiResult && <div className="success-msg">✅ {aiResult.label} Eklendi!</div>}</div>
                    ) : (
                        <><div className="search-box-container"><input type="text" placeholder="Yemek ara..." className="food-search-input" value={searchTerm} onChange={(e) => setSearchTerm(e.target.value)} autoFocus /></div>
                        <div className="food-results-list">
                            {filteredFood.length > 0 ? (filteredFood.map((food, index) => (
                                <div key={index} className="food-result-item" onClick={() => handleManualAdd(food)}>
                                    <div style={{display:'flex', flexDirection:'column'}}><span style={{fontWeight:'bold'}}>{food.name}</span><span style={{fontSize:'0.8rem', color:'#888'}}>P:{food.p}g C:{food.c}g F:{food.f}g</span></div>
                                    <div style={{display:'flex', alignItems:'center', gap:'10px'}}><strong>{food.cal} kcal</strong><span className="add-icon">➕</span></div>
                                </div>
                            ))) : (<div className="no-result">Sonuç bulunamadı...</div>)}
                        </div>
                        <div className="divider"><span>VEYA</span></div><button className="btn-camera-upload" onClick={() => fileInputRef.current.click()}>📸 Fotoğraf Çek / Yükle</button><input type="file" accept="image/*" onChange={handleFileSelect} ref={fileInputRef} hidden /></>
                    )}
                </div>
            )}
            <div className="daily-log-list">
                <h3>🍽️ Bugün Yenilenler</h3>
                {history.length === 0 ? <p style={{color:'#999'}}>Henüz bir şey eklemedin.</p> : 
                 history.map((item) => (
                    <div key={item.id} className="log-item">
                        <div className="log-info"><span className="log-name">{item.food_name}</span><span className="log-detail">{item.meal_type} • {item.calories} kcal</span></div>
                        <button className="btn-delete" onClick={() => handleDeleteFood(item.id)}>🗑️</button>
                    </div>
                ))}
            </div>
        </div>
    );
  };

  const ExerciseCard = () => {
    const percent = Math.min((weeklyMinutes / weeklyGoal) * 100, 100);
    const circumference = 2 * Math.PI * 45;
    const offset = circumference - (percent / 100) * circumference;

    const formatTime = (seconds) => {
        const m = Math.floor(seconds / 60).toString().padStart(2, '0');
        const s = (seconds % 60).toString().padStart(2, '0');
        return `${m}:${s}`;
    };

    return (
        <div className="card exercise-card full-width">
            <h2>💪 Akıllı Egzersiz Asistanı</h2>
            <div className="exercise-top-grid">
                <div className="timer-box">
                    <h3>Canlı Sayaç ⏱️</h3>
                    <div className="timer-display">{formatTime(timerTime)}</div>
                    <div className="timer-controls">
                        {!timerOn ? ( <button className="btn-start" onClick={toggleTimer}>Başlat</button> ) : ( <button className="btn-pause" onClick={toggleTimer}>Durdur</button> )}
                        <button className="btn-finish" onClick={stopAndSaveTimer} disabled={timerTime < 10}>Bitir & Kaydet</button>
                    </div>
                    <div className="timer-select">
                        <label>Aktivite:</label>
                        <select value={selectedExercise.name} onChange={(e) => setSelectedExercise(exerciseTypes.find(t => t.name === e.target.value))}>
                            {exerciseTypes.map((ex, i) => <option key={i} value={ex.name}>{ex.name}</option>)}
                        </select>
                    </div>
                </div>
                <div className="goal-ring-box">
                    <h3>Haftalık Hedef</h3>
                    <div className="ring-container">
                        <svg width="120" height="120">
                            <circle className="ring-bg" cx="60" cy="60" r="45" />
                            <circle className="ring-progress" cx="60" cy="60" r="45" style={{ strokeDasharray: circumference, strokeDashoffset: offset }} />
                        </svg>
                        <div className="ring-text"><strong>{weeklyMinutes}</strong><span>/ {weeklyGoal} dk</span></div>
                    </div>
                    <p style={{fontSize:'0.85rem', color:'#636e72', marginTop:'5px'}}>{weeklyMinutes >= weeklyGoal ? "🎉 Hedef Tamamlandı!" : "Hadi, harekete geç!"}</p>
                </div>
            </div>
            <hr className="divider-line" />
            <h3>📝 Manuel Ekleme</h3>
            <div className="manual-add-row">
                <select className="ex-select" onChange={(e) => setSelectedExercise(exerciseTypes.find(t => t.name === e.target.value))}>
                    {exerciseTypes.map((ex, i) => <option key={i} value={ex.name}>{ex.name}</option>)}
                </select>
                <input type="number" placeholder="Dakika" className="ex-input" id="manualDuration" />
                <button className="btn-save-ex" onClick={() => {
                    const dur = document.getElementById('manualDuration').value;
                    if(dur) handleSaveExercise(selectedExercise.name, parseInt(dur), selectedExercise.met);
                }}>Kaydet</button>
            </div>
            <div className="mini-history">
                <h4>Son Aktiviteler</h4>
                {exerciseHistory.length === 0 ? <p style={{color:'#999'}}>Henüz kayıt yok.</p> :
                 exerciseHistory.map((ex) => (
                    <div key={ex.id} className="mini-history-item"><span>{ex.exercise_name} ({ex.duration_min} dk)</span><strong>🔥 {ex.calories_burned} kcal</strong></div>
                ))}
            </div>
        </div>
    );
  };

  const ChartsSection = () => (
    <div className="charts-section">
      <h3>📊 Haftalık Analiz</h3>
      <div className="charts-grid">
        <div className="chart-card"><h4>Alınan Kalori</h4><ResponsiveContainer width="100%" height={200}><AreaChart data={graphData.calories}><defs><linearGradient id="colorCal" x1="0" y1="0" x2="0" y2="1"><stop offset="5%" stopColor="#55efc4" stopOpacity={0.8}/><stop offset="95%" stopColor="#55efc4" stopOpacity={0}/></linearGradient></defs><XAxis dataKey="date" fontSize={12}/><YAxis fontSize={12}/><Tooltip /><CartesianGrid strokeDasharray="3 3" opacity={0.3} /><Area type="monotone" dataKey="value" stroke="#00b894" fillOpacity={1} fill="url(#colorCal)" /></AreaChart></ResponsiveContainer></div>
        <div className="chart-card"><h4>Su Tüketimi (ml)</h4><ResponsiveContainer width="100%" height={200}><BarChart data={graphData.water}><XAxis dataKey="date" fontSize={12}/><YAxis fontSize={12}/><Tooltip cursor={{fill: '#f0f0f0'}}/><CartesianGrid strokeDasharray="3 3" opacity={0.3} /><Bar dataKey="value" fill="#74b9ff" radius={[5, 5, 0, 0]} /></BarChart></ResponsiveContainer></div>
        <div className="chart-card"><h4>Uyku Süresi (Saat)</h4><ResponsiveContainer width="100%" height={200}><LineChart data={graphData.sleep}><XAxis dataKey="date" fontSize={12}/><YAxis domain={[0, 12]} fontSize={12}/><Tooltip /><CartesianGrid strokeDasharray="3 3" opacity={0.3} /><Line type="monotone" dataKey="value" stroke="#a29bfe" strokeWidth={3} dot={{r:4}} /></LineChart></ResponsiveContainer></div>
      </div>
    </div>
  );

  const HistorySection = () => (
    <div className="history-section">
      <h3>🍽️ Son Yemeklerin</h3>
      <div className="history-list">
        {history.map((item) => (
          <div key={item.id} className="history-item">
            <div style={{textAlign:'left'}}><span style={{display:'block', fontWeight:'bold'}}>{item.food_name}</span><small style={{color:'#7f8c8d', fontSize:'0.85rem'}}>{item.meal_type || 'Genel'}</small></div>
            <strong>{item.calories} kcal</strong>
          </div>
        ))}
      </div>
    </div>
  );

  const renderContent = () => {
    const datePickerHeader = (
        <div style={{display:'flex', justifyContent:'space-between', alignItems:'center', marginBottom:'30px'}}>
            <div>
                <h1>{activeTab === 'overview' ? `Hoş Geldin, ${userName}! 👋` : 
                     activeTab === 'water' ? 'Su Takibi' : 
                     activeTab === 'calories' ? 'Beslenme Günlüğü' :
                     activeTab === 'sleep' ? 'Uyku Takibi' :
                     activeTab === 'exercise' ? 'Egzersiz Takibi' : 'Profil'}</h1>
                <p style={{color:'#636e72'}}>
                    Bugünün verileri
                </p>
            </div>
        </div>
    );

    switch (activeTab) {
      case 'overview': 
        return <div className="content-fade-in">{datePickerHeader}<ChartsSection /><HistorySection /></div>;
      
      case 'water': 
        return <div className="content-fade-in">{datePickerHeader}<div className="center-view"><div style={{maxWidth: '600px', width:'100%'}}><WaterCard /></div></div></div>;
      
      case 'sleep': 
        return <div className="content-fade-in">{datePickerHeader}<div className="center-view"><div style={{maxWidth: '600px', width:'100%'}}><SleepCard /></div></div></div>;
      
      case 'calories': 
        return <div className="content-fade-in">{datePickerHeader}<div className="center-view"><div style={{maxWidth: '900px', width:'100%'}}><FoodCard /></div></div></div>;
      
      case 'exercise': 
        return <div className="content-fade-in">{datePickerHeader}<div className="center-view"><div style={{maxWidth: '800px', width:'100%'}}><ExerciseCard /></div></div></div>;
      
      case 'profile': 
        return (
            <div className="content-fade-in center-view">
                <div className="card profile-card" style={{padding:'40px', textAlign:'center', maxWidth:'500px', width:'100%'}}>
                    <div className="profile-img-container">
                        {profilePic ? ( <img src={profilePic} alt="Profil" className="profile-img" /> ) : ( <div className="profile-initials">{userName.charAt(0).toUpperCase()}</div> )}
                        <label htmlFor="pp-upload" className="edit-icon">📷</label>
                        <input type="file" id="pp-upload" hidden accept="image/*" onChange={handleProfilePicUpload} />
                    </div>
                    <h2>{userName}</h2>
                    <p>Üyelik Tipi: <strong>Standart</strong></p>
                    <p style={{color:'#636e72', fontSize:'0.9rem'}}>Güncel Kilo: {userWeight} kg</p>
                    <button className="btn-logout" onClick={handleLogout} style={{marginTop:'20px'}}>Çıkış Yap</button>
                </div>
            </div>
        );
      default: return null;
    }
  };

  return (
    <div className="dashboard-layout">
      <aside className="sidebar">
        <div className="logo-area">SM<span>LIFE</span></div>
        <div className="sidebar-profile-section">
            {profilePic ? ( <img src={profilePic} alt="Profil" className="sidebar-img" /> ) : ( <div className="sidebar-initials-box">{userName ? userName.charAt(0).toUpperCase() : "?"}</div> )}
            <span className="sidebar-name">{userName}</span>
        </div>
        <nav className="menu">
            <button className={activeTab === 'overview' ? 'active' : ''} onClick={() => setActiveTab('overview')}>🏠 Genel Bakış</button>
            <button className={activeTab === 'calories' ? 'active' : ''} onClick={() => setActiveTab('calories')}>🍎 Kalori</button>
            <button className={activeTab === 'sleep' ? 'active' : ''} onClick={() => setActiveTab('sleep')}>😴 Uyku</button>
            <button className={activeTab === 'water' ? 'active' : ''} onClick={() => setActiveTab('water')}>💧 Su</button>
            <button className={activeTab === 'exercise' ? 'active' : ''} onClick={() => setActiveTab('exercise')}>💪 Egzersiz</button>
            <button className={activeTab === 'profile' ? 'active' : ''} onClick={() => setActiveTab('profile')}>👤 Profil</button>
        </nav>
      </aside>
      <main className="main-content">{renderContent()}</main>
    </div>
  );
};

export default Dashboard;