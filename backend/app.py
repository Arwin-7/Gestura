from flask import Flask, jsonify
from flask_socketio import SocketIO, emit
from flask_cors import CORS
from detector import normalize_landmarks
from classifier import predict_gesture

app = Flask(__name__)
CORS(app)
socketio = SocketIO(app, cors_allowed_origins="*", async_mode='threading')

@app.route('/')
def index():
    return jsonify({"status": "Gestura Backend is running!"})

@socketio.on('connect')
def on_connect():
    print('Client connected')

@socketio.on('disconnect')
def on_disconnect():
    print('Client disconnected')

@socketio.on('send_landmarks')
def handle_landmarks(data):
    """
    Receives a flat array of 63 floats [x0,y0,z0, x1,y1,z1, ...]
    from MediaPipe running in the browser, and emits back the predicted gesture.
    data = { landmarks: [63 numbers] }
    """
    try:
        raw = data.get('landmarks', [])

        if not raw:
            emit('gesture', {'gesture': None, 'error': 'No landmarks received'})
            return

        # Normalise
        features = normalize_landmarks(raw)

        if features is None:
            emit('gesture', {'gesture': None, 'error': 'Invalid landmark data'})
            return

        # Predict
        gesture = predict_gesture(features)

        if gesture:
            emit('gesture', {'gesture': str(gesture)})
        else:
            emit('gesture', {'gesture': None, 'error': 'Model not loaded yet'})

    except Exception as e:
        print(f"Error: {e}")
        emit('error', {'message': str(e)})

if __name__ == '__main__':
    socketio.run(app, debug=True, port=5000)
