from flask import Flask, request, jsonify, render_template
from tensorflow.keras.models import load_model
from PIL import Image
import numpy as np

# Initialize Flask app
app = Flask(__name__, template_folder="templates", static_folder="static")

# Path to the model file
MODEL_PATH = 'brain_tumor_detection_model.h5'

# Load the trained model
model = load_model(MODEL_PATH)

# Preprocessing function for the input image
def preprocess_image(image, target_size):
    image = image.resize(target_size)  # Resize the image to the model's input size
    image = np.array(image) / 255.0   # Normalize pixel values to the range [0,1]
    image = np.expand_dims(image, axis=0)  # Add batch dimension
    return image

# Class labels for the tumor types
CLASS_LABELS = ['Glioma', 'Meningioma', 'Pituitary', 'No Tumor']

# Route for the frontend
@app.route('/')
def home():
    return render_template('index.html')  # Serve the HTML frontend from the templates folder

# API endpoint for predictions
@app.route('/predict', methods=['POST'])
def predict():
    if 'file' not in request.files:
        return jsonify({'error': 'No file uploaded'}), 400

    file = request.files['file']
    if file.filename == '':
        return jsonify({'error': 'No selected file'}), 400

    try:
        # Open the uploaded image
        image = Image.open(file)

        # Preprocess the image
        processed_image = preprocess_image(image, target_size=(224, 224))  # Adjust size if needed

        # Predict using the model
        prediction = model.predict(processed_image)

        # Get the index of the class with the highest confidence
        predicted_class_idx = np.argmax(prediction[0])
        predicted_class = CLASS_LABELS[predicted_class_idx]
        confidence = float(prediction[0][predicted_class_idx])

        return jsonify({
            'result': predicted_class,
            'confidence': confidence
        }), 200
    except Exception as e:
        return jsonify({'error': str(e)}), 500

if __name__ == '__main__':
    app.run(debug=True)
