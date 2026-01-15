import React, { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import './Auth.css';

const Register = () => {
  const navigate = useNavigate();
  const [step, setStep] = useState(1);
  const [showSports, setShowSports] = useState(false); 

  
  const [formData, setFormData] = useState({
    name: '', 
    goal: '',
    current_weight: '',
    target_weight: '',
    height: '',
    birthdate: '',
    gender: '',
    diet_type: '',
    activity_level: '',
    sports: [],
    email: '',
    password: ''
  });

  const handleChange = (e) => {
    setFormData({ ...formData, [e.target.name]: e.target.value });
  };

  const selectOption = (field, value) => {
    setFormData({ ...formData, [field]: value });
  };

  const toggleSport = (sportName) => {
    let updatedSports = [...formData.sports];
    if (updatedSports.includes(sportName)) {
      updatedSports = updatedSports.filter(s => s !== sportName);
    } else {
      updatedSports.push(sportName);
    }
    setFormData({ ...formData, sports: updatedSports });
  };

  const nextStep = () => setStep(step + 1);
  const prevStep = () => setStep(step - 1);

  const handleSubmit = async (e) => {
    e.preventDefault();
    try {
      const response = await fetch('https://smlife-backend.onrender.com/register', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(formData),
      });
      const data = await response.json();
      if (data.success) {
        alert("Kayıt Başarılı! 🎉");
        navigate('/login');
      } else {
        alert("Hata: " + data.error);
      }
    } catch (error) {
      alert("Sunucu hatası!");
    }
  };

  const renderStep = () => {
    switch(step) {
      case 1: 
        return (
          <div className="wizard-step">
            <h2>🎯 Hedefin Ne?</h2>
            <div className="options-grid">
              {['Kilo Vermek', 'Kilomu Korumak', 'Kilo Almak'].map(opt => (
                <div key={opt} 
                     className={`option-card ${formData.goal === opt ? 'selected' : ''}`}
                     onClick={() => selectOption('goal', opt)}>
                  {opt}
                </div>
              ))}
            </div>
            <button className="btn-next" onClick={nextStep} disabled={!formData.goal}>Devam Et</button>
          </div>
        );

      case 2: 
        return (
          <div className="wizard-step">
            <h2>⚖️ Kilo Bilgilerin</h2>
            <div className="input-group">
              <label>Şu anki Kilon (kg)</label>
              <input type="number" name="current_weight" value={formData.current_weight} onChange={handleChange} placeholder="70" />
            </div>
            <div className="input-group">
              <label>Hedef Kilon (kg)</label>
              <input type="number" name="target_weight" value={formData.target_weight} onChange={handleChange} placeholder="60" />
            </div>
            <div className="btn-row">
                <button className="btn-back" onClick={prevStep}>Geri</button>
                <button className="btn-next" onClick={nextStep} disabled={!formData.current_weight}>Devam Et</button>
            </div>
          </div>
        );

      case 3: 
        return (
          <div className="wizard-step">
            <h2>📏 Boy ve Yaş</h2>
            <div className="input-group">
              <label>Boyun (cm)</label>
              <input type="number" name="height" value={formData.height} onChange={handleChange} placeholder="175" />
            </div>
            <div className="input-group">
              <label>Doğum Tarihi</label>
              <input type="date" name="birthdate" value={formData.birthdate} onChange={handleChange} />
            </div>
            <div className="btn-row">
                <button className="btn-back" onClick={prevStep}>Geri</button>
                <button className="btn-next" onClick={nextStep} disabled={!formData.height}>Devam Et</button>
            </div>
          </div>
        );

      case 4: 
        return (
          <div className="wizard-step">
            <h2>⚧ Cinsiyetin</h2>
            <div className="options-grid">
              {['Kadın', 'Erkek'].map(opt => (
                <div key={opt} 
                     className={`option-card ${formData.gender === opt ? 'selected' : ''}`}
                     onClick={() => selectOption('gender', opt)}>
                  {opt}
                </div>
              ))}
            </div>
            <div className="btn-row">
                <button className="btn-back" onClick={prevStep}>Geri</button>
                <button className="btn-next" onClick={nextStep} disabled={!formData.gender}>Devam Et</button>
            </div>
          </div>
        );

      case 5: 
        return (
          <div className="wizard-step">
            <h2>🥦 Beslenme Tercihin</h2>
            <div className="options-grid">
              {['Vegan', 'Vejeteryan', 'Glutensiz', 'Laktozsuz', 'Hepçil (Her şeyi yerim)'].map(opt => (
                <div key={opt} 
                     className={`option-card ${formData.diet_type === opt ? 'selected' : ''}`}
                     onClick={() => selectOption('diet_type', opt)}>
                  {opt}
                </div>
              ))}
            </div>
            <div className="btn-row">
                <button className="btn-back" onClick={prevStep}>Geri</button>
                <button className="btn-next" onClick={nextStep} disabled={!formData.diet_type}>Devam Et</button>
            </div>
          </div>
        );

      case 6: 
        return (
          <div className="wizard-step">
            <h2>🏃 Aktivite Düzeyi</h2>
            <div className="options-list">
              {[
                { label: 'Az Hareketli', desc: 'Masa başı iş, az spor' },
                { label: 'Hafif Aktif', desc: 'Haftada 1-2 gün spor' },
                { label: 'Orta Aktif', desc: 'Haftada 3-4 gün spor' },
                { label: 'Çok Aktif', desc: 'Her gün yoğun spor' }
              ].map(opt => (
                <div key={opt.label} 
                     className={`list-card ${formData.activity_level === opt.label ? 'selected' : ''}`}
                     onClick={() => selectOption('activity_level', opt.label)}>
                  <strong>{opt.label}</strong>
                  <small>{opt.desc}</small>
                </div>
              ))}
            </div>
            <div className="extra-sports-section">
              <div 
                className={`accordion-header ${showSports ? 'active' : ''}`} 
                onClick={() => setShowSports(!showSports)}
              >
                <span>➕ İsteğe Bağlı: Ekstra Spor Seç</span>
                <span className="arrow">{showSports ? '▲' : '▼'}</span>
              </div>
              {showSports && (
                <div className="sports-grid-animated">
                  {['Fitness', 'Kick Boks', 'Futbol', 'Basketbol', 'Yüzme', 'Yoga', 'Pilates', 'Koşu', 'Tenis'].map(sport => (
                    <div 
                      key={sport}
                      className={`sport-chip ${formData.sports.includes(sport) ? 'active' : ''}`}
                      onClick={() => toggleSport(sport)}
                    >
                      {sport}
                    </div>
                  ))}
                </div>
              )}
            </div>
            <div className="btn-row">
                <button className="btn-back" onClick={prevStep}>Geri</button>
                <button className="btn-next" onClick={nextStep} disabled={!formData.activity_level}>Devam Et</button>
            </div>
          </div>
        );

      case 7: 
        return (
          <div className="wizard-step">
            <h2>🔒 Hesabı Oluştur</h2>
            
           
            <div className="input-group">
              <label>Adınız Soyadınız</label>
              <input 
                type="text" 
                name="name" 
                value={formData.name} 
                onChange={handleChange} 
                placeholder="Örn: Ahmet Yılmaz" 
                required 
              />
            </div>

            <div className="input-group">
              <label>E-posta Adresi</label>
              <input type="email" name="email" value={formData.email} onChange={handleChange} required />
            </div>
            <div className="input-group">
              <label>Şifre</label>
              <input type="password" name="password" value={formData.password} onChange={handleChange} required />
            </div>
            <div className="btn-row">
                <button className="btn-back" onClick={prevStep}>Geri</button>
                <button className="btn-primary" onClick={handleSubmit}>Kayıt Ol</button>
            </div>
          </div>
        );

      default: return null;
    }
  };

  return (
    <div className="auth-container">
      <div className="auth-box wizard-box">
        <div className="progress-bar" style={{ width: `${(step/7)*100}%` }}></div>
        {renderStep()}
      </div>
    </div>
  );
};

export default Register;