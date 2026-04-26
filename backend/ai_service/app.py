from flask import Flask, request, jsonify
from flask_cors import CORS
import google.generativeai as genai
import os
import json
import io
from PIL import Image

app = Flask(__name__)
# Tüm originlere izin veriyoruz
CORS(app, resources={r"/*": {"origins": "*"}})

# API Key Kontrolü
API_KEY = os.environ.get("GOOGLE_API_KEY")

if API_KEY:
    genai.configure(api_key=API_KEY)
    print("✅ SMLife AI Servisi Başarıyla Yapılandırıldı!")
else:
    print("⚠️ UYARI: GOOGLE_API_KEY bulunamadı!")

# --- 📸 FOTOĞRAF ANALİZİ FONKSİYONU ---
def analyze_image_with_gemini(image_bytes):
    try:
        model = genai.GenerativeModel('gemini-2.5-flash')
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
        img = Image.open(io.BytesIO(image_bytes))
        response = model.generate_content([prompt, img])
        
        text_response = response.text.strip()
        if "```json" in text_response:
            text_response = text_response.split("```json")[1].split("```")[0].strip()
        elif "```" in text_response:
            text_response = text_response.split("```")[1].split("```")[0].strip()

        return json.loads(text_response)
    except Exception as e:
        return {"error_details": str(e)}

# --- 🚀 ANA SAYFA ---
@app.route('/', methods=['GET'])
def home():
    return "🚀 SMLife AI Servisi Çalışıyor! (Fotoğraf Analizi + AI Chatbot Aktif)"

# --- 🍱 FOTOĞRAF ANALİZİ ENDPOINT'İ ---
@app.route('/predict', methods=['POST'])
def predict():
    file = request.files.get('image') or request.files.get('file')
    if not file:
        return jsonify({'error': 'Resim dosyası eksik!'}), 400
    
    try:
        image_data = file.read()
        result = analyze_image_with_gemini(image_data)
        
        if "error_details" in result:
            return jsonify({'error': f"AI Analiz Hatası: {result['error_details']}"}), 500

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
        return jsonify({'error': str(e)}), 500

# --- 🤖 AI CHATBOT (SOHBET) ENDPOINT'İ ---
@app.route('/chat', methods=['POST'])
def chat():
    data = request.json
    user_message = data.get("message", "")
    user_context = data.get("context", "") # Boy, kilo, hedef bilgileri

    if not user_message:
        return jsonify({"error": "Mesaj boş olamaz"}), 400

    try:
        model = genai.GenerativeModel('gemini-2.5-flash')
        
        # AI'ya bir kişilik ve bağlam veriyoruz
        full_prompt = f"""
        Sen SMLife uygulamasının resmi yapay zeka diyetisyeni ve sağlık koçusun. 
        Kullanıcı Bilgileri: {user_context}
        
        Kural 1: Kullanıcıya kısa, öz ve motive edici yanıtlar ver.
        Kural 2: Samimi ama profesyonel bir koç gibi davran.
        Kural 3: Yanıtların her zaman Türkçe olsun.
        
        Kullanıcı Mesajı: {user_message}
        """

        response = model.generate_content(full_prompt)
        return jsonify({"reply": response.text})

    except Exception as e:
        return jsonify({"error": str(e)}), 500

if __name__ == '__main__':
    port = int(os.environ.get('PORT', 5001))
    app.run(host='0.0.0.0', port=port)