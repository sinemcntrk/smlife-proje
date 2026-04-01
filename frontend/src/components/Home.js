import React from 'react';
import { Link } from 'react-router-dom';

function Home() {
  return (
    <div className="home-container">
      
      {/* 🚀 1. ÜST MENÜ (NAVBAR) */}
      <nav className="home-navbar">
        <Link to="/" className="home-logo">SMLife</Link>

       
<div className="nav-links">
  <div className="nav-dropdown"> {/* <-- Burası ana kapsayıcı */}
    <span className="nav-item">Araçlar ▾</span>
    <div className="dropdown-menu"> {/* <-- Burası gizli olan kısım */}
      <Link to="/ideal-kilo" className="dropdown-item">İdeal Kilo Hesaplama</Link>
      <Link to="/gunluk-kalori" className="dropdown-item">Günlük Kalori İhtiyacı</Link>
      <Link to="/vki-hesapla" className="dropdown-item">Vücut Kitle İndeksi</Link>
      <Link to="/yag-orani" className="dropdown-item">Vücut Yağ Oranı</Link>
    </div>
  </div>
  <a href="#app-features" className="nav-item">Mobil Uygulama</a>
  <a href="#contact-us" className="nav-item">Bize Ulaşın</a>
</div>

        <div style={{display: 'flex', alignItems: 'center'}}>
          <Link to="/register" className="nav-item-register">Kayıt Ol</Link>
          <Link to="/login" className="login-btn">Giriş Yap</Link>
        </div>
      </nav>

      {/* 🚀 2. ANA BAŞLIK (HERO) */}
      <header className="hero-section">
        <h1 className="hero-title">Geleceğin Sağlık Asistanıyla Tanışın</h1>
        <p className="hero-text">
          SMLife, yapay zeka ve akıllı sensör algoritmalarıyla hayatınızı değiştiren tam donanımlı bir yaşam asistanıdır. 
          Aşağıdaki ücretsiz araçlarla vücut analizinizi yapın ve hedeflerinize ilk adımı atın.
        </p>
      </header>

      {/* 🚀 3. HESAPLAMA ARAÇLARI (ESKİ SİSTEMİN KALBİ) */}
      <section className="card-grid">
        <div className="feature-card">
          <h3 className="card-title">🏃‍♂️ İdeal Kilo & VKİ</h3>
          <p className="card-desc">Boy ve yaşınıza göre ideal kilonuzu öğrenin ve durumunuzu analiz edin.</p>
          <Link to="/vki-hesapla" className="card-link">Hesapla &rarr;</Link>
        </div>

        <div className="feature-card">
          <h3 className="card-title">🔥 Günlük Kalori</h3>
          <p className="card-desc">Günlük almanız gereken kalori miktarını bilimsel formüllerle hesaplayın.</p>
          <Link to="/gunluk-kalori" className="card-link">Hesapla &rarr;</Link>
        </div>

        <div className="feature-card">
          <h3 className="card-title">⚖️ Vücut Yağ Oranı</h3>
          <p className="card-desc">Vücudunuzdaki yağ oranını ve kas dengesini detaylı analiz edin.</p>
          <Link to="/yag-orani" className="card-link">Hesapla &rarr;</Link>
        </div>

        <div className="feature-card">
          <h3 className="card-title">💪 Egzersiz Programı</h3>
          <p className="card-desc">Size özel hazırlanan egzersiz önerileri ile formda ve zinde kalın.</p>
        </div>
      </section>

      {/* 🚀 4. MOBİL UYGULAMA ÖZELLİKLERİ (SENİN MÜHENDİSLİK ŞOVUN) */}
      <section id="app-features" className="app-features-section">
        <div className="section-header">
          <h2>SMLife Mobil Uygulaması</h2>
          <p>Sadece bir web sitesi değil. Akıllı telefonunuzu profesyonel bir diyetisyene dönüştürün.</p>
        </div>
        
        <div className="app-grid">
          <div className="app-card">
            <div className="app-icon">📸</div>
            <h4>Yapay Zeka Kamerası</h4>
            <p>MobileNetV2 derin öğrenme modeli ile yediklerinizi saniyeler içinde tanıyın ve kalorinizi otomatik kaydedin.</p>
          </div>
          <div className="app-card">
            <div className="app-icon">👣</div>
            <h4>Canlı Adımsayar</h4>
            <p>Cihaz ivmeölçer sensörleriyle doğrudan haberleşerek adımlarınızı gecikmesiz takip edin.</p>
          </div>
          <div className="app-card">
            <div className="app-icon">🧠</div>
            <h4>Predictive AI</h4>
            <p>Verilerinizi işleyerek olası enerji düşüşlerini ve su ihtiyacınızı önceden tahmin eden akıllı asistan.</p>
          </div>
          <div className="app-card">
            <div className="app-icon">📄</div>
            <h4>PDF Raporu</h4>
            <p>Tüm sağlık verilerinizi tek tıkla profesyonel bir PDF dosyasına dönüştürüp diyetisyeninizle paylaşın.</p>
          </div>
        </div>
      </section>

      <section id="contact-us" className="contact-section">
  <div className="contact-container">
    <div className="contact-info">
      <h2>Bize Ulaşın ✉️</h2>
      <p>SMLife hakkında sorularınız, önerileriniz veya teknik destek talepleriniz için bizimle iletişime geçebilirsiniz.</p>
      <div className="info-item">📧 <span>destek@smlife.com.tr</span></div>
    </div>
    
    <form className="contact-form">
      <input type="text" placeholder="Adınız Soyadınız" required />
      <input type="email" placeholder="E-posta Adresiniz" required />
      <textarea placeholder="Mesajınız..." rows="5" required></textarea>
      <button type="submit" className="login-btn">Mesaj Gönder</button>
    </form>
  </div>
</section>

      {/* 🚀 6. FOOTER */}
      <footer className="home-footer">
        <div className="footer-content">
          <div className="footer-logo">SMLIFE</div>
          <p>© 2026 SMLife - Akıllı Yaşam ve Spor Girişimi</p>
        </div>
      </footer>

    </div>
  );
}

export default Home;