import pickle
import numpy as np
import os

# Define the path to the trained model
MODEL_PATH = os.path.join(os.path.dirname(__file__), 'model', 'model.pkl')
model = None

def load_model():
    """Loads the Random Forest model from disk."""
    global model
    try:
        if os.path.exists(MODEL_PATH):
            with open(MODEL_PATH, 'rb') as f:
                model = pickle.load(f)
            print("Model loaded successfully.")
        else:
            print(f"Model not found at {MODEL_PATH}. Prediction will not work until the model is trained in Step 3.")
    except Exception as e:
        print(f"Error loading model: {e}")

# Try to load the model on startup
load_model()

def predict_gesture(landmarks):
    """
    Predicts the sign language gesture given the normalized landmarks.
    """
    if model is None:
        return None
        
    try:
        # The model expects a 2D array: (n_samples, n_features)
        # MediaPipe provides 21 landmarks, each with x, y, z -> 63 features total
        features = np.array(landmarks).reshape(1, -1)
        
        # Predict the class
        prediction = model.predict(features)
        
        return prediction[0]
    except Exception as e:
        print(f"Prediction error: {e}")
        return None
