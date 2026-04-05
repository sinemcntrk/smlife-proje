import React, { useState } from 'react';
import axios from 'axios';

const AIScreen = () => {
  const [image, setImage] = useState(null);
  const [preview, setPreview] = useState(null);
  const [result, setResult] = useState(null);
  const [loading, setLoading] = useState(false);

  // Resim seçildiğinde hem dosyayı tut hem de önizleme oluştur
  const handleImageChange = (e) => {
    const file = e.target.files[0];
    if (file) {
      setImage(file);
      setPreview(URL.createObjectURL(file)); // Seçilen resmi ekranda göster
      setResult(null); // Eski sonucu temizle
    }
  };

  const handleAnalyze = async () => {
    if (!image) return alert("Lütfen önce bir yemek fotoğrafı seçin!");
    
    setLoading(true);
    const formData = new FormData();
    formData.append('image', image);

    try {
      // Yeni aktif AI servis adresin
      const response = await axios.post('https://smlife-proje-production.up.railway.app/predict', formData, {
        headers: { 'Content-Type': 'multipart/form-data' }
      });

      setResult(response.data);
    } catch (error) {
      console.error("AI Hatası:", error);
      alert("AI Analizi şu an yapılamıyor. Sunucu loglarını kontrol edin.");
    } finally {
      setLoading(false);
    }
  };

  return (
    <div style={styles.container}>
      <div style={styles.card}>
        <h2 style={styles.title}>AI Yemek Analizi 🥑</h2>
        <p style={styles.subtitle}>Yemeğinin fotoğrafını yükle, Gemini 1.5 Flash analiz etsin!</p>

        {/* Resim Seçme Alanı */}
        <div style={styles.uploadSection}>
          <input 
            type="file" 
            id="fileInput"
            onChange={handleImageChange} 
            accept="image/*" 
            style={styles.hiddenInput}
          />
          <label htmlFor="fileInput" style={styles.uploadLabel}>
            {preview ? "Resmi Değiştir" : "Fotoğraf Seç"}
          </label>
        </div>

        {/* Önizleme */}
        {preview && (
          <div style={styles.previewContainer}>
            <img src={preview} alt="Önizleme" style={styles.previewImage} />
          </div>
        )}

        {/* Analiz Butonu */}
        <button 
          onClick={handleAnalyze} 
          disabled={loading || !image} 
          style={{...styles.button, backgroundColor: loading ? '#ccc' : '#10b981'}}
        >
          {loading ? "Analiz Ediliyor... ✨" : "Analiz Et"}
        </button>

        {/* Sonuç Alanı */}
        {result && (
          <div style={styles.resultCard}>
            <h3 style={styles.resultTitle}>Tahmin: {result.food} 🥗</h3>
            <div style={styles.statsRow}>
              <div style={styles.stat}>
                <span style={styles.statLabel}>Enerji</span>
                <span style={styles.statValue}>{result.calories} kcal</span>
              </div>
              <div style={styles.stat}>
                <span style={styles.statLabel}>Güven</span>
                <span style={styles.statValue}>%{Math.round((result.accuracy || 0) * 100)}</span>
              </div>
            </div>
          </div>
        )}
      </div>
    </div>
  );
};

// Modern CSS-in-JS Tasarımı
const styles = {
  container: {
    display: 'flex',
    justifyContent: 'center',
    padding: '40px 20px',
    backgroundColor: '#f1f5f9',
    minHeight: '100vh',
    fontFamily: "'Segoe UI', Tahoma, Geneva, Verdana, sans-serif"
  },
  card: {
    backgroundColor: '#fff',
    padding: '30px',
    borderRadius: '20px',
    boxShadow: '0 10px 25px rgba(0,0,0,0.1)',
    maxWidth: '500px',
    width: '100%',
    textAlign: 'center'
  },
  title: { color: '#1e293b', marginBottom: '10px' },
  subtitle: { color: '#64748b', fontSize: '14px', marginBottom: '25px' },
  hiddenInput: { display: 'none' },
  uploadLabel: {
    backgroundColor: '#3b82f6',
    color: '#fff',
    padding: '12px 24px',
    borderRadius: '10px',
    cursor: 'pointer',
    fontWeight: 'bold',
    display: 'inline-block',
    marginBottom: '20px'
  },
  previewContainer: { marginBottom: '20px', borderRadius: '15px', overflow: 'hidden' },
  previewImage: { width: '100%', maxHeight: '300px', objectFit: 'cover' },
  button: {
    width: '100%',
    color: '#fff',
    border: 'none',
    padding: '15px',
    borderRadius: '12px',
    fontSize: '16px',
    fontWeight: 'bold',
    cursor: 'pointer',
    transition: '0.3s'
  },
  resultCard: {
    marginTop: '25px',
    padding: '20px',
    backgroundColor: '#f8fafc',
    borderRadius: '15px',
    border: '2px solid #e2e8f0'
  },
  resultTitle: { color: '#059669', marginBottom: '15px' },
  statsRow: { display: 'flex', justifyContent: 'space-around' },
  stat: { display: 'flex', flexDirection: 'column' },
  statLabel: { fontSize: '12px', color: '#64748b' },
  statValue: { fontSize: '18px', fontWeight: 'bold', color: '#1e293b' }
};

export default AIScreen;