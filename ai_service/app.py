from flask import Flask, request, jsonify
from flask_cors import CORS
import tensorflow as tf
from tensorflow.keras.applications.mobilenet_v2 import MobileNetV2, preprocess_input, decode_predictions
from tensorflow.keras.preprocessing import image
from PIL import Image
import numpy as np
import io
import os
from flask_cors import CORS

app = Flask(__name__)
CORS(app)

print("Yapay Zeka Modeli Yükleniyor... (Biraz sürebilir)")
model = MobileNetV2(weights='imagenet')
print("✅ Model Hazır!")



def prepare_image(img):
    img = img.resize((224, 224))
    x = image.img_to_array(img)
    x = np.expand_dims(x, axis=0)
    x = preprocess_input(x)
    return x

@app.route('/', methods=['GET'])
def home():
    return "Python AI Servisi Çalışıyor! 🧠"

@app.route('/predict', methods=['POST'])
def predict():
    if 'file' not in request.files:
        return jsonify({'error': 'Resim yüklenmedi'}), 400
    
    file = request.files['file']
    
    try:
        img = Image.open(io.BytesIO(file.read()))
        processed_image = prepare_image(img)
        preds = model.predict(processed_image)
        decoded = decode_predictions(preds, top=1)[0]
        
        label = decoded[0][1] 
        confidence = float(decoded[0][2])
        
       
        nutrition = food_database.get(label, None)

        if nutrition:
            calories = nutrition['cal']
            protein = nutrition['p']
            carbs = nutrition['c']
            fat = nutrition['f']
        else:
            
            calories = int(confidence * 100) + 100 
            protein = 10 
            carbs = 20   
            fat = 5      

        return jsonify({
            'success': True,
            'label': label,
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