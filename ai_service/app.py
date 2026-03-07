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

print("✅ AI Servisi (Gemini 1.5 Flash Modu) Hazır!")

def analyze_image_with_gemini(image_data, mime_type):
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
        Ekstra hiçbir açıklama yapma. Sadece JSON.
        """

        response = model.generate_content([
            {'mime_type': mime_type, 'data': image_data},
            prompt
        ])
        
        # JSON temizleme işlemi (Gemini'nin süslü kod bloklarını filtreliyoruz)
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