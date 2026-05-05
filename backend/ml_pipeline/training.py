import os
import pickle
import numpy as np
import cv2
from datasets import load_dataset
from sklearn.ensemble import RandomForestClassifier
from sklearn.model_selection import train_test_split
from sklearn.metrics import accuracy_score
import mediapipe as mp

# Create model directory if it doesn't exist
MODEL_DIR = os.path.join(os.path.dirname(os.path.dirname(__file__)), 'model')
os.makedirs(MODEL_DIR, exist_ok=True)
MODEL_PATH = os.path.join(MODEL_DIR, 'model.pkl')

# Initialize MediaPipe Hands for static images
mp_hands = mp.solutions.hands
hands = mp_hands.Hands(
    static_image_mode=True, # True is crucial here as we are processing unrelated images
    max_num_hands=1,
    min_detection_confidence=0.5
)

def extract_features(image_np):
    """
    Extracts normalized landmarks from a single image using MediaPipe.
    """
    # MediaPipe expects RGB format
    results = hands.process(image_np)
    
    if results.multi_hand_landmarks:
        hand_landmarks = results.multi_hand_landmarks[0]
        x_coords = [lm.x for lm in hand_landmarks.landmark]
        y_coords = [lm.y for lm in hand_landmarks.landmark]
        
        min_x, max_x = min(x_coords), max(x_coords)
        min_y, max_y = min(y_coords), max(y_coords)
        
        normalized_landmarks = []
        for landmark in hand_landmarks.landmark:
            # Prevent division by zero
            width = max_x - min_x if max_x != min_x else 1.0
            height = max_y - min_y if max_y != min_y else 1.0
            
            normalized_x = (landmark.x - min_x) / width
            normalized_y = (landmark.y - min_y) / height
            
            normalized_landmarks.extend([normalized_x, normalized_y, landmark.z])
            
        return normalized_landmarks
    return None

def train_model():
    print("1. Loading ASL dataset from Hugging Face...")
    try:
        # Loading a sample ASL dataset from HF. 
        # Using a slice 'train[:2000]' to keep training fast for testing purposes.
        # For a full production model, you would use the entire dataset.
        dataset = load_dataset('danjacobellis/asl_alphabet', split='train[:2000]')
    except Exception as e:
        print(f"Error loading dataset: {e}")
        return

    # To map numerical labels (0-25) back to A-Z
    # Usually datasets provide an int2str function or a names array
    # A = 0, B = 1, C = 2...
    
    features = []
    labels = []

    print("2. Processing images and extracting MediaPipe landmarks...")
    for item in dataset:
        # Hugging Face provides images as PIL format
        image = item['image']
        label = item['label']
        
        # Convert PIL image to numpy array
        image_np = np.array(image)
        
        # Convert Grayscale to RGB if necessary
        if len(image_np.shape) == 2:
            image_np = cv2.cvtColor(image_np, cv2.COLOR_GRAY2RGB)
            
        # Extract MediaPipe landmarks
        landmarks = extract_features(image_np)
        
        if landmarks:
            features.append(landmarks)
            # We map the label ID directly (e.g., 0 -> A, 1 -> B)
            # To output a character: chr(label + 65) assuming standard alphabetical order
            char_label = chr(label + 65) 
            labels.append(char_label)

    if not features:
        print("No hands were detected in the dataset. Please check the dataset images.")
        return

    print(f"Successfully extracted features from {len(features)} images.")

    # Convert lists to numpy arrays for scikit-learn
    X = np.array(features)
    y = np.array(labels)

    # Split dataset: 80% for training, 20% for testing
    X_train, X_test, y_train, y_test = train_test_split(X, y, test_size=0.2, random_state=42)

    print("3. Training Random Forest Classifier...")
    # We use a Random Forest because it handles small/medium feature sets (63 features) excellently 
    # and trains very fast without needing GPUs.
    model = RandomForestClassifier(n_estimators=100, random_state=42)
    model.fit(X_train, y_train)

    # Evaluate model
    y_pred = model.predict(X_test)
    accuracy = accuracy_score(y_test, y_pred)
    print(f"Model trained! Validation Accuracy: {accuracy * 100:.2f}%")

    print(f"4. Saving model to {MODEL_PATH}...")
    with open(MODEL_PATH, 'wb') as f:
        pickle.dump(model, f)
    
    print("Training complete! The model is saved and ready to be used by the backend.")

if __name__ == "__main__":
    train_model()
