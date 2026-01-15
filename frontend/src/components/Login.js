import React, { useState } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import './Auth.css';

const Login = () => {
  const navigate = useNavigate();
  const [formData, setFormData] = useState({ email: '', password: '' });

  const handleChange = (e) => {
    setFormData({ ...formData, [e.target.name]: e.target.value });
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    try {
      const response = await fetch('https://smlife-backend.onrender.com/login', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(formData),
      });

      const data = await response.json();

      if (data.success) {
        localStorage.setItem('userName', data.user.name || data.user.email); 
        
        alert("Giriş Başarılı! Hoş geldin.");
        navigate('/dashboard');
      } else {
        alert("Hata: " + (data.message || "Giriş yapılamadı"));
      }
    } catch (error) {
      console.error("Login Hatası:", error);
      alert("Sunucuya bağlanılamadı!");
    }
  };

  return (
    <div className="auth-container">
      <div className="wizard-box">
        <h2 style={{color: '#2c3e50', marginBottom: '20px'}}>Giriş Yap</h2>
        
        <form onSubmit={handleSubmit}>
          <div className="input-group">
            <label>E-posta Adresi</label>
            <input type="email" name="email" onChange={handleChange} required placeholder="ornek@mail.com" />
          </div>
          
          <div className="input-group">
            <label>Şifre</label>
            <input type="password" name="password" onChange={handleChange} required placeholder="******" />
          </div>
          
          <div className="btn-row">
            <button type="submit" className="btn-primary">Giriş Yap</button>
          </div>
        </form>
        
        <p style={{marginTop: '20px', color: '#7f8c8d'}}>
          Hesabın yok mu? <Link to="/register" style={{color: '#1abc9c', fontWeight: 'bold'}}>Kayıt Ol</Link>
        </p>
      </div>
    </div>
  );
};

export default Login;