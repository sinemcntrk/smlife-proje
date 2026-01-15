import React, { useState } from 'react';
import './VkiHesapla.css'; 
function VkiHesapla() {
  const [kilo, setKilo] = useState('');
  const [boy, setBoy] = useState('');
  const [sonuc, setSonuc] = useState(null);
  const [durum, setDurum] = useState('');
  const [kayitMesaji, setKayitMesaji] = useState(''); 
  const [hataMesaji, setHataMesaji] = useState('');

  
  const veritabaninaKaydet = async (vkiDegeri, vkiDurumu) => {
    try {
      const response = await fetch('https://smlife-backend.onrender.com/api/olcum-kaydet', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          kullanici_id: 1, 
          tur: 'VKI',
          deger: vkiDegeri,
          aciklama: vkiDurumu,
          detay: { boy: boy, kilo: kilo }
        }),
      });

      if (response.ok) {
        setKayitMesaji("✅ Sonuç veritabanına kaydedildi!");
        setHataMesaji('');
        setTimeout(() => setKayitMesaji(''), 4000);
      } else {
        setHataMesaji("❌ Kayıt başarısız oldu.");
      }
    } catch (error) {
      console.error("Bağlantı Hatası:", error);
      setHataMesaji("❌ Sunucuya bağlanılamadı.");
    }
  };

  
  const hesapla = (e) => {
    e.preventDefault();
    if (!kilo || !boy) {
      setHataMesaji("Lütfen boy ve kilo değerlerini giriniz.");
      return;
    }

    const boyMetre = boy / 100;
    const vki = kilo / (boyMetre * boyMetre);
    const vkiFormatli = vki.toFixed(2);

    let durumMetni = "";
    if (vki < 18.5) durumMetni = "Zayıf";
    else if (vki < 25) durumMetni = "Normal";
    else if (vki < 30) durumMetni = "Fazla Kilolu";
    else durumMetni = "Obez";

    setSonuc(vkiFormatli);
    setDurum(durumMetni);
    setHataMesaji(''); 

    
    veritabaninaKaydet(vkiFormatli, durumMetni);
  };

  return (
    <div className="vki-container">
      <div className="vki-card">
        <h2 className="vki-title">VKİ Hesapla</h2>
        
        <form onSubmit={hesapla} className="vki-form">
          <input 
            type="number" 
            placeholder="Kilonuz (kg)" 
            value={kilo} 
            onChange={(e) => setKilo(e.target.value)}
            className="vki-input"
          />
          <input 
            type="number" 
            placeholder="Boyunuz (cm)" 
            value={boy} 
            onChange={(e) => setBoy(e.target.value)}
            className="vki-input"
          />
          <button type="submit" className="vki-btn">
            HESAPLA VE KAYDET
          </button>
        </form>

        
        {sonuc && (
          <div className="result-box">
            <h3 className="result-value">{sonuc}</h3>
            <p className="result-status">{durum}</p>
          </div>
        )}

        
        {kayitMesaji && (
          <div className="message-box message-success">
            {kayitMesaji}
          </div>
        )}
        
        {hataMesaji && (
          <div className="message-box message-error">
            {hataMesaji}
          </div>
        )}

      </div>
    </div>
  );
}

export default VkiHesapla;