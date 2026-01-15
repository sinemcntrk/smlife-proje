import React, { useState } from 'react';
import './VucutYag.css'; 

function VucutYag() {
  const [cinsiyet, setCinsiyet] = useState('erkek');
  const [boy, setBoy] = useState('');
  const [boyun, setBoyun] = useState('');
  const [bel, setBel] = useState('');
  const [kalca, setKalca] = useState(''); 

  const [sonuc, setSonuc] = useState(null);
  const [durum, setDurum] = useState('');
  const [kayitMesaji, setKayitMesaji] = useState('');
  const [hataMesaji, setHataMesaji] = useState('');

  const veritabaninaKaydet = async (yagOrani, durumAciklamasi) => {
    try {
      const response = await fetch('https://smlife-backend.onrender.com/api/olcum-kaydet', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          kullanici_id: 1, 
          tur: 'VUCUT_YAG',
          deger: yagOrani,
          aciklama: durumAciklamasi,
          detay: { boy, boyun, bel, kalca, cinsiyet }
        }),
      });

      if (response.ok) {
        setKayitMesaji("✅ Yağ oranı kaydedildi!");
        setTimeout(() => setKayitMesaji(''), 3000);
      } else {
        setHataMesaji("❌ Kayıt başarısız.");
      }
    } catch (error) {
      console.error("Hata:", error);
      setHataMesaji("❌ Sunucu hatası.");
    }
  };

  
  const hesapla = (e) => {
    e.preventDefault();
    
    
    if (!boy || !boyun || !bel) {
      setHataMesaji("Lütfen zorunlu alanları doldurunuz.");
      return;
    }
    if (cinsiyet === 'kadin' && !kalca) {
      setHataMesaji("Kadınlar için kalça ölçüsü zorunludur.");
      return;
    }

    let yagOrani;
    
    if (cinsiyet === 'erkek') {
      yagOrani = 495 / (1.0324 - 0.19077 * Math.log10(bel - boyun) + 0.15456 * Math.log10(boy)) - 450;
    } else {
      yagOrani = 495 / (1.29579 - 0.35004 * Math.log10(parseFloat(bel) + parseFloat(kalca) - parseFloat(boyun)) + 0.22100 * Math.log10(boy)) - 450;
    }

  
    const sonucDegeri = yagOrani.toFixed(1);
    
    
    let durumMetni = "";
    if (cinsiyet === 'erkek') {
      if (yagOrani < 6) durumMetni = "Hayati Yağ";
      else if (yagOrani < 14) durumMetni = "Atletik";
      else if (yagOrani < 18) durumMetni = "Fit";
      else if (yagOrani < 25) durumMetni = "Ortalama";
      else durumMetni = "Obez";
    } else {
      if (yagOrani < 14) durumMetni = "Hayati Yağ";
      else if (yagOrani < 21) durumMetni = "Atletik";
      else if (yagOrani < 25) durumMetni = "Fit";
      else if (yagOrani < 32) durumMetni = "Ortalama";
      else durumMetni = "Obez";
    }

    setSonuc(sonucDegeri);
    setDurum(durumMetni);
    setHataMesaji('');

    // Kaydet
    veritabaninaKaydet(sonucDegeri, durumMetni);
  };

  return (
    <div className="yag-container">
      <div className="yag-card">
        <h2 className="yag-title">Vücut Yağ Oranı</h2>
        
        <form onSubmit={hesapla} className="yag-form">
          <select 
            value={cinsiyet} 
            onChange={(e) => setCinsiyet(e.target.value)}
            className="yag-select"
          >
            <option value="erkek">Erkek</option>
            <option value="kadin">Kadın</option>
          </select>

          <input 
            type="number" 
            placeholder="Boy (cm)" 
            value={boy} 
            onChange={(e)=>setBoy(e.target.value)} 
            className="yag-input"
          />
          
          <input 
            type="number" 
            placeholder="Boyun Çevresi (cm)" 
            value={boyun} 
            onChange={(e)=>setBoyun(e.target.value)} 
            className="yag-input"
          />
          
          <input 
            type="number" 
            placeholder="Bel Çevresi (cm)" 
            value={bel} 
            onChange={(e)=>setBel(e.target.value)} 
            className="yag-input"
          />

        
          {cinsiyet === 'kadin' && (
            <input 
              type="number" 
              placeholder="Kalça Çevresi (cm)" 
              value={kalca} 
              onChange={(e)=>setKalca(e.target.value)} 
              className="yag-input"
              style={{border: '1px solid #ec407a'}} 
            />
          )}

          <button type="submit" className="yag-btn">
            HESAPLA VE KAYDET
          </button>
        </form>

        {sonuc && (
          <div className="result-box">
            <h3 className="result-value">%{sonuc}</h3>
            <p className="result-desc">{durum}</p>
          </div>
        )}

        {kayitMesaji && <div className="message-box message-success">{kayitMesaji}</div>}
        {hataMesaji && <div className="message-box message-error">{hataMesaji}</div>}

      </div>
    </div>
  );
}

export default VucutYag;