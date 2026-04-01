import React, { useState } from 'react';
import axios from 'axios';

const AIScreen = () => {
  const [image, setImage] = useState(null);
  const [result, setResult] = useState(null);
  const [loading, setLoading] = useState(false);

  const handleImageChange = (e) => {
    setImage(e.target.files[0]);
  };

  const handleAnalyze = async () => {
    if (!image) return alert("Lütfen bir resim seçin!");
    
    setLoading(true);
    const formData = new FormData();
    formData.append('image', image);

    try {
      // Loglarda gördüğümüz yeni AI adresin:
      const response = await axios.post('https://smlife-ai.onrender.com/predict', formData);
      setResult(response.data);
    } catch (error) {
      alert("AI Analizi başarısız oldu!");
    } finally {
      setLoading(false);
    }
  };

  return (
    <div style={{ padding: '20px', textAlign: 'center' }}>
      <h2>AI Yemek Analizi 🥑</h2>
      <input type="file" onChange={handleImageChange} accept="image/*" />
      <button onClick={handleAnalyze} disabled={loading} style={{ margin: '10px', padding: '10px 20px' }}>
        {loading ? "Analiz Ediliyor..." : "Analiz Et"}
      </button>

      {result && (
        <div style={{ marginTop: '20px', border: '1px solid #ccc', padding: '15px' }}>
          <h3>Sonuç: {result.food}</h3>
          <p>Kalori: {result.calories} kcal</p>
          <p>Güven Oranı: %{Math.round(result.accuracy * 100)}</p>
        </div>
      )}
    </div>
  );
};

export default AIScreen;