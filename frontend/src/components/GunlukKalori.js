import React, { useState } from 'react';
import './GunlukKalori.css'; 
function GunlukKalori() {
  const [kilo, setKilo] = useState('');
  const [boy, setBoy] = useState('');
  const [yas, setYas] = useState('');
  const [cinsiyet, setCinsiyet] = useState('erkek');
  const [aktivite, setAktivite] = useState('1.2');
  
  const [sonuc, setSonuc] = useState(null);
  const [kayitMesaji, setKayitMesaji] = useState('');
  const [hataMesaji, setHataMesaji] = useState('');

  
  const veritabaninaKaydet = async (kaloriDegeri) => {
    try {
      const response = await fetch('https://sm-life-akilli-yasam-1007.up.railway.app/api/olcum-kaydet', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          kullanici_id: 1, 
          tur: 'GUNLUK_KALORI',
          deger: kaloriDegeri,
          aciklama: `Aktivite Katsayısı: ${aktivite}`,
          detay: { kilo, boy, yas, cinsiyet, aktivite }
        }),
      });

      if (response.ok) {
        setKayitMesaji("✅ Kalori ihtiyacı kaydedildi!");
        setTimeout(() => setKayitMesaji(''), 3000);
      } else {
        setHataMesaji("❌ Kayıt yapılamadı.");
      }
    } catch (error) {
      console.error("Hata:", error);
      setHataMesaji("❌ Sunucu hatası.");
    }
  };

  
  const hesapla = (e) => {
    e.preventDefault();
    if (!kilo || !boy || !yas) {
      setHataMesaji("Lütfen tüm alanları doldurunuz.");
      return;
    }

    let bmr;
    
    if (cinsiyet === 'erkek') {
      bmr = 88.362 + (13.397 * kilo) + (4.799 * boy) - (5.677 * yas);
    } else {
      bmr = 447.593 + (9.247 * kilo) + (3.098 * boy) - (4.330 * yas);
    }

    
    const toplamKalori = bmr * parseFloat(aktivite);
    const yuvarlanmisSonuc = Math.round(toplamKalori);

    setSonuc(yuvarlanmisSonuc);
    setHataMesaji('');

    
    veritabaninaKaydet(yuvarlanmisSonuc);
  };

  return (
    <div className="kalori-container">
      <div className="kalori-card">
        <h2 className="kalori-title">🔥 Günlük Kalori İhtiyacı</h2>
        
        <form onSubmit={hesapla} className="kalori-form">
          
          
          <div className="input-group">
            <select 
              value={cinsiyet} 
              onChange={(e) => setCinsiyet(e.target.value)} 
              className="kalori-select"
            >
              <option value="erkek">Erkek</option>
              <option value="kadin">Kadın</option>
            </select>
            
            <input 
              type="number" 
              placeholder="Yaş" 
              value={yas} 
              onChange={(e)=>setYas(e.target.value)} 
              className="kalori-input" 
            />
          </div>

          
          <div className="input-group">
            <input 
              type="number" 
              placeholder="Kilo (kg)" 
              value={kilo} 
              onChange={(e)=>setKilo(e.target.value)} 
              className="kalori-input" 
            />
            <input 
              type="number" 
              placeholder="Boy (cm)" 
              value={boy} 
              onChange={(e)=>setBoy(e.target.value)} 
              className="kalori-input" 
            />
          </div>

          <select 
            value={aktivite} 
            onChange={(e) => setAktivite(e.target.value)} 
            className="kalori-select"
          >
            <option value="1.2">Hareketsiz (Masa başı iş)</option>
            <option value="1.375">Az Hareketli (Haftada 1-3 gün spor)</option>
            <option value="1.55">Orta Hareketli (Haftada 3-5 gün spor)</option>
            <option value="1.725">Çok Hareketli (Haftada 6-7 gün spor)</option>
            <option value="1.9">Ekstra Hareketli (Ağır antrenman)</option>
          </select>

          <button type="submit" className="kalori-btn">
            HESAPLA VE KAYDET
          </button>
        </form>

        {sonuc && (
          <div className="result-box">
            <h3 className="result-value">{sonuc} kcal</h3>
            <p className="result-desc">Kilonuzu korumak için günlük almanız gereken tahmini enerji.</p>
          </div>
        )}

        
        {kayitMesaji && <div className="message-box message-success">{kayitMesaji}</div>}
        {hataMesaji && <div className="message-box message-error">{hataMesaji}</div>}

      </div>
    </div>
  );
}

export default GunlukKalori;