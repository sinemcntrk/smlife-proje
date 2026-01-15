import React from 'react';
import { BrowserRouter as Router, Routes, Route } from 'react-router-dom';



import Home from './components/Home';
import Login from './components/Login';
import Register from './components/Register';
import Dashboard from './components/Dashboard';


import VkiHesapla from './components/VkiHesapla';
import IdealKilo from './components/IdealKilo';
import GunlukKalori from './components/GunlukKalori';
import VucutYag from './components/VucutYag';

function App() {
  return (
    <Router>
      <Routes>
        
        
        <Route path="/" element={<Home />} />
        
        
        <Route path="/login" element={<Login />} />
        <Route path="/register" element={<Register />} />
        
        
        <Route path="/dashboard" element={<Dashboard />} />

        
        <Route path="/vki-hesapla" element={<VkiHesapla />} />
        
        
        <Route path="/ideal-kilo" element={<IdealKilo />} />
        
        
        <Route path="/gunluk-kalori" element={<GunlukKalori />} />
        
       
        <Route path="/yag-orani" element={<VucutYag />} />

      </Routes>
    </Router>
  );
}

export default App;