from flask import Flask, request, jsonify
from flask_cors import CORS
import requests
import os
import io

app = Flask(__name__)
CORS(app, resources={r"/*": {"origins": "*"}})

# BURAYA HUGGING FACE TOKEN'INI YAPIŞTIR 👇
API_TOKEN = os.environ.get("HUGGINGFACE_TOKEN")

# Yemek tanıyan hazır, eğitilmiş profesyonel bir model
API_URL = "https://api-inference.huggingface.co/models/nateraw/food"

headers = {"Authorization": f"Bearer {API_TOKEN}"}

print("✅ Bulut Tabanlı AI Servisi Başlatıldı!")

# İngilizce gelen sonuçları Türkçe'ye ve kalorilere çevirelim
food_database = {
    "pizza": {"label": "Pizza", "cal": 266, "p": 11, "c": 33, "f": 10},
    "hamburger": {"label": "Hamburger", "cal": 295, "p": 17, "c": 30, "f": 12},
    "french_fries": {"label": "Patates Kızartması", "cal": 312, "p": 3, "c": 41, "f": 15},
    "ice_cream": {"label": "Dondurma", "cal": 207, "p": 3, "c": 24, "f": 11},
    "fried_rice": {"label": "Pirinç Pilavı", "cal": 130, "p": 2, "c": 28, "f": 0},
    "grilled_salmon": {"label": "Izgara Somon", "cal": 206, "p": 22, "c": 0, "f": 12},
    "chicken_wings": {"label": "Tavuk Kanat", "cal": 203, "p": 30, "c": 0, "f": 8},
    "steak": {"label": "Biftek", "cal": 271, "p": 26, "c": 0, "f": 19},
    "spaghetti_bolognese": {"label": "Spagetti Bolonez", "cal": 297, "p": 13, "c": 46, "f": 7},
    "apple_pie": {"label": "Elmalı Turta", "cal": 237, "p": 2, "c": 34, "f": 10},
    "banana": {"label": "Muz", "cal": 89, "p": 1.1, "c": 23, "f": 0.3},
    "apple": {"label": "Elma", "cal": 52, "p": 0.3, "c": 14, "f": 0.2}
}

def query_huggingface(image_bytes):
    response = requests.post(API_URL, headers=headers, data=image_bytes)
    
    # --- YENİ EKLENEN KISIM (HATA AYIKLAMA) ---
    print(f"Status Code: {response.status_code}") # 200 mü 401 mi 503 mü?
    print(f"Response Text: {response.text}")       # Gelen cevabı loglara yaz
    # ------------------------------------------

    if response.status_code != 200:
        return {"error": f"API Hatası: {response.status_code} - {response.text}"}

    return response.json()

@app.route('/', methods=['GET'])
def home():
    return "Gerçek AI Servisi Çalışıyor (Hugging Face API) 🧠"

@app.route('/predict', methods=['POST'])
def predict():
    if 'file' not in request.files:
        return jsonify({'error': 'Resim yüklenmedi'}), 400
    
    file = request.files['file']
    
    try:
        # Resmi byte formatında oku
        image_bytes = file.read()
        
        # Hugging Face'e gönder ve sonucu al (Gerçek Analiz)
        output = query_huggingface(image_bytes)
        
        # Hata kontrolü (Model yükleniyor olabilir)
        if isinstance(output, dict) and 'error' in output:
             return jsonify({'error': 'Model şu an uyanıyor, 10sn sonra tekrar deneyin.'}), 503

        # En yüksek ihtimalli sonucu al
        # Output şöyle gelir: [{'label': 'pizza', 'score': 0.99}, ...]
        best_prediction = output[0]
        english_label = best_prediction['label']
        confidence = round(best_prediction['score'], 4)
        
        # Bizim veritabanında var mı diye bak
        nutrition = food_database.get(english_label)
        
        # Eğer listemizde yoksa varsayılan değerler dön
        if not nutrition:
            label_tr = english_label.replace("_", " ").title() # Örn: hot_dog -> Hot Dog
            calories = 150
            protein = 5
            carbs = 10
            fat = 5
        else:
            label_tr = nutrition['label']
            calories = nutrition['cal']
            protein = nutrition['p']
            carbs = nutrition['c']
            fat = nutrition['f']

        return jsonify({
            'success': True,
            'label': label_tr,     # Türkçe isim
            'eng_label': english_label, # Debug için
            'confidence': confidence,
            'calories': calories,
            'protein': protein,
            'carbs': carbs,
            'fat': fat
        })

    except Exception as e:
        return jsonify({'error': str(e)}), 500

if __name__ == '__main__':
    port = int(os.environ.get('PORT', 5001))
    app.run(host='0.0.0.0', port=port)