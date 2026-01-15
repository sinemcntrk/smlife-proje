import React from 'react';
import { Link } from 'react-router-dom';
import './LandingPage.css';

const LandingPage = () => {
  return (
    <div className="landing-container">
      
      
      <nav className="navbar">
        <div className="logo">SM<span>LIFE</span></div>
        
        <ul className="nav-links">
          <li className="dropdown">
            <a href="#features">Araçlar ▾</a>
            <div className="dropdown-content">
              <a href="#bmi">Vücut Kitle İndeksi</a>
              <a href="#calories">Günlük Kalori İhtiyacı</a>
              <a href="#ideal">İdeal Kilo Hesaplama</a>
              <a href="#fat">Vücut Yağ Oranı</a>
            </div>
          </li>
          
        
          <li><a href="#about">İçerik</a></li>
          <li><a href="#contact">Yardım</a></li>
        </ul>

        
        <div className="auth-buttons">
          <Link to="/login" className="btn-login">Üye Girişi</Link>
          <Link to="/register" className="btn-register">Üye Ol</Link>
        </div>
      </nav>

      
      <header className="hero">
        <div className="hero-content">
          <h1>Sağlıklı Bir Yaşama <br /> Hoş Geldiniz</h1>
          <p>
            Yapay zeka destekli kalori takibi, su hatırlatıcıları ve 
            size özel egzersiz planlarıyla hayatınızı değiştirin.
          </p>
          <div className="hero-btns">
            <Link to="/register" className="btn-primary">Hemen Başla 🚀</Link>
          </div>
        </div>
        <div className="hero-image">
          
          🏃‍♂️🍎💧
        </div>
      </header>

      
      <section id="features" className="features-section">
        <h2>SMLife Araçları</h2>
        <div className="features-grid">
          <div className="feature-card">
            <h3>⚖️ İdeal Kilo</h3>
            <p>Boyunuza ve yaşınıza göre olmanız gereken ideal kiloyu öğrenin.</p>
          </div>
          <div className="feature-card">
            <h3>🔥 Kalori İhtiyacı</h3>
            <p>Günlük almanız gereken kaloriyi bilimsel formüllerle hesaplayın.</p>
          </div>
          <Link to="/vki-hesapla" style={{ textDecoration: 'none', color: 'inherit' }}>
  
  <div className="feature-card">
     <h3>📊 Vücut Kitle İndeksi</h3>
     <p>VKİ değeriniz ile sağlık durumunuzu analiz edin.</p>
  </div>

</Link>
          <div className="feature-card">
            <h3>💪 Vücut Yağ Oranı</h3>
            <p>Vücudunuzdaki yağ oranını ve kas dengesini takip edin.</p>
          </div>
        </div>
      </section>

     
      <footer className="footer">
        <p>© 2025 SMLife - Akıllı Yaşam Asistanı</p>
      </footer>
    </div>
  );
};

export default LandingPage;