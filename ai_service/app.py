from flask import Flask, request, jsonify
from flask_cors import CORS
import google.generativeai as genai
import os
import json

app = Flask(__name__)
CORS(app, resources={r"/*": {"origins": "*"}})

API_KEY = os.environ.get("GOOGLE_API_KEY")

if API_KEY:
    genai.configure(api_key=API_KEY)

print("✅ AI Servisi (Multi-Model Modu) Hazır!")

def analyze_image_with_gemini(image_data, mime_type):
    # Denenecek modellerin listesi (Biri çalışmazsa diğerine geçer)
    model = genai.GenerativeModel('gemini-1.5-flash')
    
    last_error = ""

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
    Ekstra hiçbir açıklama yapma. Sadece JSON.
    """

    for model_name in models_to_try:
        try:
            print(f"📡 Deneniyor: {model_name}...")
            model = genai.GenerativeModel(model_name)
            
            response = model.generate_content([
                {'mime_type': mime_type, 'data': image_data},
                prompt
            ])
            
            text_response = response.text.replace("```json", "").replace("```", "").strip()
            return json.loads(text_response)

        except Exception as e:
            print(f"❌ {model_name} başarısız oldu: {str(e)}")
            last_error = str(e)
            continue # Bir sonraki modeli dene

    # Hiçbiri çalışmazsa hata dön
    return {"error_details": f"Tüm modeller denendi ama başarısız oldu. Son hata: {last_error}"}

@app.route('/', methods=['GET'])
def home():
    return "AI Servisi Çalışıyor! 🧠"

@app.route('/predict', methods=['POST'])
def predict():
    if 'file' not in request.files:
        return jsonify({'error': 'Resim yüklenmedi'}), 400
    
    file = request.files['file']
    
    if not API_KEY:
        return jsonify({'error': 'API Key Eksik!'}), 500

    try:
        mime_type = file.mimetype or "image/jpeg"
        image_data = file.read()
        
        result = analyze_image_with_gemini(image_data, mime_type)
        
        if "error_details" in result:
            return jsonify({'error': f"AI Hatası: {result['error_details']}"}), 500

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
        return jsonify({'error': str(e)}), 500

if __name__ == '__main__':
    port = int(os.environ.get('PORT', 5001))
    app.run(host='0.0.0.0', port=port)