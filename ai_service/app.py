from flask import Flask, request, jsonify
from flask_cors import CORS
import google.generativeai as genai
import os
import json

app = Flask(__name__)
CORS(app, resources={r"/*": {"origins": "*"}})

# API Key'i ortam değişkeninden alacağız
API_KEY = os.environ.get("GOOGLE_API_KEY")

# Eğer anahtar yoksa hata vermesin diye boş geçiyoruz (Render'da ekleyeceğiz)
if API_KEY:
    genai.configure(api_key=API_KEY)

print("✅ Google Gemini Vision AI Servisi Hazır!")

def analyze_image_with_gemini(image_data):
    """Resmi Google Gemini'ye gönderir ve besin değerlerini ister"""
    try:
        model = genai.GenerativeModel('gemini-1.5-flash')
        
        # Yapay Zekaya Verdiğimiz Emir (Prompt)
        prompt = """
        Sen uzman bir diyetisyensin. Bu resimdeki yiyeceği analiz et.
        Bana SADECE geçerli bir JSON formatında şu verileri ver:
        {
            "food_name": "Yemeğin Türkçe Adı",
            "calories": 100 (tahmini sayı),
            "protein": 10 (tahmini gram),
            "carbs": 20 (tahmini gram),
            "fat": 5 (tahmini gram),
            "confidence": 0.95 (0-1 arası sayı)
        }
        Ekstra hiçbir yazı yazma, sadece JSON döndür. Eğer resimde yemek yoksa "food_name" kısmına "Yemek Tespit Edilemedi" yaz.
        """

        response = model.generate_content([
            {'mime_type': 'image/jpeg', 'data': image_data},
            prompt
        ])
        
        # Gelen metni temizle (Bazen ```json ... ``` içinde gönderir)
        text_response = response.text.replace("```json", "").replace("```", "").strip()
        return json.loads(text_response)

    except Exception as e:
        print(f"Gemini Hatası: {str(e)}")
        return None

@app.route('/', methods=['GET'])
def home():
    return "Google Gemini AI Servisi Aktif! 🧠✨"

@app.route('/predict', methods=['POST'])
def predict():
    if 'file' not in request.files:
        return jsonify({'error': 'Resim yüklenmedi'}), 400
    
    file = request.files['file']
    
    # API Anahtarı kontrolü
    if not API_KEY:
        return jsonify({'error': 'Sunucuda API Anahtarı eksik!'}), 500

    try:
        # Resmi oku
        image_data = file.read()
        
        # Google'a Sor
        result = analyze_image_with_gemini(image_data)
        
        if result:
            return jsonify({
                'success': True,
                'label': result.get('food_name', 'Bilinmeyen'),
                'confidence': result.get('confidence', 0.8),
                'calories': result.get('calories', 0),
                'protein': result.get('protein', 0),
                'carbs': result.get('carbs', 0),
                'fat': result.get('fat', 0)
            })
        else:
            return jsonify({'error': 'Analiz yapılamadı'}), 500

    except Exception as e:
        return jsonify({'error': str(e)}), 500

if __name__ == '__main__':
    port = int(os.environ.get('PORT', 5001))
    app.run(host='0.0.0.0', port=port)