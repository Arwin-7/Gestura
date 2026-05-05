from flask import Flask, request, jsonify
from flask_socketio import SocketIO, emit
from flask_cors import CORS
import base64
import numpy as np
import cv2
from detector import process_frame
from classifier import predict_gesture

app = Flask(__name__)
CORS(app)
# allow_unsafe_werkzeug might be needed in some dev environments
socketio = SocketIO(app, cors_allowed_origins="*", async_mode='threading')

@app.route('/')
def index():
    return jsonify({"status": "Gestura Backend is running!"})

@socketio.on('connect')
def test_connect():
    print('Client connected to WebSocket')

@socketio.on('disconnect')
def test_disconnect():
    print('Client disconnected from WebSocket')

@socketio.on('process_frame')
def handle_frame(data):
    try:
        # Expected data format: 'data:image/jpeg;base64,/9j/4AAQ...'
        if ',' in data:
            image_data = data.split(',')[1]
        else:
            image_data = data
            
        img_bytes = base64.b64decode(image_data)
        
        # Convert bytes to numpy array
        np_arr = np.frombuffer(img_bytes, np.uint8)
        
        # Decode image
        img = cv2.imdecode(np_arr, cv2.IMREAD_COLOR)
        
        if img is None:
            emit("gesture", {"gesture": None, "error": "Invalid image data"})
            return
            
        # 1. Process frame with MediaPipe to get landmarks
        landmarks = process_frame(img)
        
        if landmarks:
            # 2. Predict gesture using the ML model
            gesture = predict_gesture(landmarks)
            
            if gesture:
                # 3. Emit the predicted gesture back to the frontend
                emit("gesture", {"gesture": str(gesture)})
            else:
                emit("gesture", {"gesture": None, "error": "Could not classify"})
        else:
            emit("gesture", {"gesture": None, "error": "No hand detected"})
            
    except Exception as e:
        print(f"Error processing frame: {e}")
        emit("error", {"message": str(e)})

if __name__ == '__main__':
    socketio.run(app, debug=True, port=5000)
