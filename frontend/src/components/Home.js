import React from 'react';
import { Link } from 'react-router-dom';
import './Home.css';

function Home() {
  return (
    <div className="home-container">
      
      
      <nav className="home-navbar">
        <Link to="/" className="home-logo">SMLife</Link>

        <div className="nav-links">
          
          
          <div className="nav-dropdown">
            <span className="nav-item">Araçlar ▾</span>
            <div className="dropdown-menu">
              <Link to="/ideal-kilo" className="dropdown-item">İdeal Kilo Hesaplama</Link>
              <Link to="/gunluk-kalori" className="dropdown-item">Günlük Kalori İhtiyacı</Link>
              <Link to="/vki-hesapla" className="dropdown-item">Vücut Kitle İndeksi</Link>
              <Link to="/yag-orani" className="dropdown-item">Vücut Yağ Oranı</Link>
            </div>
          </div>

          <Link to="#" className="nav-item">İçerik</Link>
          <Link to="#" className="nav-item">İletişim</Link>
        </div>

        <div style={{display: 'flex', alignItems: 'center'}}>
          <Link to="/register" className="nav-item-register">Kayıt Ol</Link>
          <Link to="/login" className="login-btn">Giriş Yap</Link>
        </div>
      </nav>

     
      <header className="hero-section">
        <h1 className="hero-title">Sağlıklı Yaşama Adım Atın</h1>
        <p className="hero-text">
          SMLife ile vücut kitle indeksinizi hesaplayın, günlük kalori takibi yapın ve 
          daha sağlıklı bir geleceğe bizimle yürüyün.
        </p>
      </header>

      
      <section className="card-grid">
        <div className="feature-card">
          <h3 className="card-title">🏃‍♂️ İdeal Kilo & VKİ</h3>
          <p className="card-desc">Vücut kitle indeksinizi öğrenin ve ideal kilonuza ulaşın.</p>
          <Link to="/vki-hesapla" className="card-link">Hesapla &rarr;</Link>
        </div>

        <div className="feature-card">
          <h3 className="card-title">🔥 Günlük Kalori</h3>
          <p className="card-desc">Günlük almanız gereken kalori miktarını hesaplayın.</p>
         
        </div>

        <div className="feature-card">
          <h3 className="card-title">⚖️ Vücut Yağ Oranı</h3>
          <p className="card-desc">Vücudunuzdaki yağ oranını analiz edin.</p>
        </div>

        <div className="feature-card">
          <h3 className="card-title">💪 Egzersiz Programı</h3>
          <p className="card-desc">Size özel egzersiz önerileri ile zinde kalın.</p>
        </div>
      </section>

    </div>
  );
}

export default Home;