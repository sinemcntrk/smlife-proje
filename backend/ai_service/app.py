from flask import Flask, request, jsonify
from flask_cors import CORS
import google.generativeai as genai
import os
import json
import io
from PIL import Image  # 📸 Resimleri Google'ın istediği formata çevirmek için eklendi

app = Flask(__name__)
# Tüm originlere izin veriyoruz (Mobil ve Web erişimi için)
CORS(app, resources={r"/*": {"origins": "*"}})

# API Key'i Environment Variable'dan çekiyoruz
API_KEY = os.environ.get("GOOGLE_API_KEY")

if API_KEY:
    genai.configure(api_key=API_KEY)
    print("✅ AI Servisi (Gemini 1.5 Flash) Başarıyla Yapılandırıldı!")
else:
    print("⚠️ UYARI: GOOGLE_API_KEY bulunamadı! Railway/Render Env Vars kısmını kontrol et.")

def analyze_image_with_gemini(image_bytes):
    try:
        # En stabil ve güncel model (Google'ın önerdiği standart isim)
        model = genai.GenerativeModel('gemini-1.5-flash')
        
        prompt = """
        Sen uzman bir diyetisyensin. Bu resimdeki yiyeceği analiz et.
        Bana SADECE geçerli bir JSON formatında şu verileri ver:
        {
            "food_name": "Yemeğin Türkçe Adı",
            "calories": 100,
            "protein": 10,
            "carbs": 20,
            "fat": 5,
            "confidence": 0.95
        }
        Ekstra hiçbir açıklama yapma. Sadece JSON formatında çıktı ver.
        """

        # 📸 Resmi PIL formatına çeviriyoruz (Google'ın kabul ettiği kesin yöntem)
        img = Image.open(io.BytesIO(image_bytes))

        # Resmi ve prompt'u modele gönderiyoruz
        response = model.generate_content([prompt, img])
        
        # JSON temizleme (Markdown kod bloklarını temizliyoruz)
        text_response = response.text.strip()
        if "```json" in text_response:
            text_response = text_response.split("```json")[1].split("```")[0].strip()
        elif "```" in text_response:
            text_response = text_response.split("```")[1].split("```")[0].strip()

        return json.loads(text_response)

    except Exception as e:
        print(f"❌ Yapay Zeka Hatası: {str(e)}")
        return {"error_details": str(e)}

@app.route('/', methods=['GET'])
def home():
    return "🚀 SMLife AI Servisi Çalışıyor! (Gemini 1.5 Flash ile Güçlendirildi)"

@app.route('/predict', methods=['POST'])
def predict():
    # 'image' veya 'file' olarak her iki ihtimali de kontrol ediyoruz
    file = request.files.get('image') or request.files.get('file')
    
    if not file:
        return jsonify({'error': 'Resim dosyası eksik! Lütfen bir resim yükleyin.'}), 400
    
    if not API_KEY:
        return jsonify({'error': 'Sunucuda API Key eksik!'}), 500

    try:
        image_data = file.read()
        
        result = analyze_image_with_gemini(image_data)
        
        if "error_details" in result:
            return jsonify({'error': f"AI Analiz Hatası: {result['error_details']}"}), 500

        # Başarılı yanıtı gönderiyoruz
        return jsonify({
            'success': True,
            'food': result.get('food_name', 'Bilinmeyen'),
            'calories': result.get('calories', 0),
            'protein': result.get('protein', 0),
            'carbs': result.get('carbs', 0),
            'fat': result.get('fat', 0),
            'accuracy': result.get('confidence', 0.8)
        })

    except Exception as e:
        return jsonify({'error': f"Sunucu hatası: {str(e)}"}), 500

if __name__ == '__main__':
    # Railway/Render port ayarı
    port = int(os.environ.get('PORT', 5001))
    app.run(host='0.0.0.0', port=port)