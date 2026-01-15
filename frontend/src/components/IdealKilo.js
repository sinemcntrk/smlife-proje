import React, { useState } from 'react';
import './IdealKilo.css'; // CSS bağlantısı

function IdealKilo() {
  const [boy, setBoy] = useState('');
  const [cinsiyet, setCinsiyet] = useState('erkek');
  const [sonuc, setSonuc] = useState(null);
  const [kayitMesaji, setKayitMesaji] = useState('');
  const [hataMesaji, setHataMesaji] = useState('');

  
  const veritabaninaKaydet = async (idealKiloDegeri) => {
    try {
      const response = await fetch('https://smlife-backend.onrender.com/api/olcum-kaydet', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          kullanici_id: 1, 
          tur: 'IDEAL_KILO',
          deger: idealKiloDegeri,
          aciklama: `Cinsiyet: ${cinsiyet}`,
          detay: { boy: boy, cinsiyet: cinsiyet }
        }),
      });

      if (response.ok) {
        setKayitMesaji("✅ Hesaplama kaydedildi!");
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
    if (!boy) {
      setHataMesaji("Lütfen boyunuzu giriniz.");
      return;
    }

    
    const boyInch = boy / 2.54;
    const over5ft = boyInch - 60; 

    let ideal;
    if (over5ft <= 0) {
      ideal = cinsiyet === 'erkek' ? 52 : 49;
    } else {
      if (cinsiyet === 'erkek') {
        ideal = 52 + (1.9 * over5ft);
      } else {
        ideal = 49 + (1.7 * over5ft);
      }
    }

    const sonucDegeri = ideal.toFixed(1);
    setSonuc(sonucDegeri);
    setHataMesaji('');

    
    veritabaninaKaydet(sonucDegeri);
  };

  return (
    <div className="ideal-container">
      <div className="ideal-card">
        <h2 className="ideal-title">İdeal Kilo Hesaplama</h2>
        
        <form onSubmit={hesapla} className="ideal-form">
          <select 
            value={cinsiyet} 
            onChange={(e) => setCinsiyet(e.target.value)}
            className="ideal-select"
          >
            <option value="erkek">Erkek</option>
            <option value="kadin">Kadın</option>
          </select>

          <input 
            type="number" 
            placeholder="Boyunuz (cm) - Örn: 175" 
            value={boy} 
            onChange={(e) => setBoy(e.target.value)}
            className="ideal-input"
          />

          <button type="submit" className="ideal-btn">
            HESAPLA VE KAYDET
          </button>
        </form>

        {sonuc && (
          <div className="result-box">
            <h3 className="result-value">{sonuc} kg</h3>
            <p className="result-desc">Robinson formülüne göre ideal kilonuz.</p>
          </div>
        )}

        
        {kayitMesaji && <div className="message-box message-success">{kayitMesaji}</div>}
        {hataMesaji && <div className="message-box message-error">{hataMesaji}</div>}

      </div>
    </div>
  );
}

export default IdealKilo;