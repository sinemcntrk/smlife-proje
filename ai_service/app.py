from flask import Flask, request, jsonify
from flask_cors import CORS
import google.generativeai as genai
import os
import json

app = Flask(__name__)
CORS(app, resources={r"/*": {"origins": "*"}})

# API Key Kontrolü
API_KEY = os.environ.get("GOOGLE_API_KEY")

if API_KEY:
    genai.configure(api_key=API_KEY)

print("✅ Google Gemini AI Servisi (Debug Modu) Hazır!")

def analyze_image_with_gemini(image_data, mime_type):
    """Resmi Google Gemini'ye gönderir ve sonucu (veya hatayı) döner"""
    try:
        model = genai.GenerativeModel('gemini-1.5-flash')
        
        prompt = """
        Sen uzman bir diyetisyensin. Bu resimdeki yiyeceği analiz et.
        Bana SADECE geçerli bir JSON formatında şu verileri ver:
        {
            "food_name": "Yemeğin Türkçe Adı",
            "calories": 100 (sayı),
            "protein": 10 (sayı),
            "carbs": 20 (sayı),
            "fat": 5 (sayı),
            "confidence": 0.95
        }
        Ekstra hiçbir yazı yazma (markdown backticks kullanma), sadece saf JSON döndür.
        """

        response = model.generate_content([
            {'mime_type': mime_type, 'data': image_data},
            prompt
        ])
        
        # Gelen yanıtı temizle
        text_response = response.text.replace("```json", "").replace("```", "").strip()
        return json.loads(text_response)

    except Exception as e:
        # HATA OLUŞURSA GİZLEME, GERİ DÖNDÜR!
        return {"error_details": str(e)}

@app.route('/', methods=['GET'])
def home():
    return "Google Gemini AI Servisi Aktif! 🧠✨"

@app.route('/predict', methods=['POST'])
def predict():
    if 'file' not in request.files:
        return jsonify({'error': 'Resim yüklenmedi'}), 400
    
    file = request.files['file']
    
    # 1. API Anahtarı Yoksa Hemen Söyle
    if not API_KEY:
        return jsonify({'error': 'SUNUCU HATASI: GOOGLE_API_KEY Render ortam değişkenlerinde bulunamadı!'}), 500

    try:
        # 2. Resim Formatını Otomatik Algıla (PNG mi JPG mi?)
        mime_type = file.mimetype or "image/jpeg"
        image_data = file.read()
        
        # 3. Google'a Gönder
        result = analyze_image_with_gemini(image_data, mime_type)
        
        # Eğer sonuçta hata detayı varsa kullanıcıya göster
        if "error_details" in result:
            print(f"Gemini Hatası: {result['error_details']}") # Loglara da yaz
            return jsonify({'error': f"AI Hatası: {result['error_details']}"}), 500

        # Başarılıysa sonucu dön
        return jsonify({
            'success': True,
            'label': result.get('food_name', 'Bilinmeyen'),
            'confidence': result.get('confidence', 0.8),
            'calories': result.get('calories', 0),
            'protein': result.get('protein', 0),
            'carbs': result.get('carbs', 0),
            'fat': result.get('fat', 0)
        })

    except Exception as e:
        return jsonify({'error': f"Sistem Hatası: {str(e)}"}), 500

if __name__ == '__main__':
    port = int(os.environ.get('PORT', 5001))
    app.run(host='0.0.0.0', port=port)