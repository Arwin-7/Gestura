import os
import pickle
import numpy as np
import cv2
from datasets import load_dataset
from sklearn.ensemble import RandomForestClassifier
from sklearn.model_selection import train_test_split
from sklearn.metrics import accuracy_score

# ── Lazy import of the new detector so training works locally too ─────────────
import sys
sys.path.insert(0, os.path.dirname(os.path.dirname(__file__)))
from detector import process_frame          # uses the new Tasks API

MODEL_DIR = os.path.join(os.path.dirname(os.path.dirname(__file__)), 'model')
os.makedirs(MODEL_DIR, exist_ok=True)
MODEL_PATH = os.path.join(MODEL_DIR, 'model.pkl')


def train_model():
    print("1. Loading ASL dataset from Hugging Face …")
    try:
        dataset = load_dataset('danjacobellis/asl_alphabet', split='train[:2000]')
    except Exception as e:
        print(f"Error loading dataset: {e}")
        return

    features, labels = [], []

    print("2. Extracting MediaPipe landmarks from dataset images …")
    for item in dataset:
        image   = item['image']
        label   = item['label']

        image_np = np.array(image)
        if len(image_np.shape) == 2:                        # grayscale → RGB
            image_np = cv2.cvtColor(image_np, cv2.COLOR_GRAY2RGB)
        else:
            image_np = cv2.cvtColor(image_np, cv2.COLOR_RGB2BGR)  # PIL is RGB

        landmarks = process_frame(image_np)
        if landmarks:
            features.append(landmarks)
            labels.append(chr(label + 65))          # 0→A, 1→B …

    if not features:
        print("No hands detected in the dataset images.")
        return

    print(f"Extracted features from {len(features)} images.")

    X = np.array(features)
    y = np.array(labels)

    X_train, X_test, y_train, y_test = train_test_split(
        X, y, test_size=0.2, random_state=42
    )

    print("3. Training Random Forest Classifier …")
    model = RandomForestClassifier(n_estimators=100, random_state=42)
    model.fit(X_train, y_train)

    accuracy = accuracy_score(y_test, model.predict(X_test))
    print(f"Validation accuracy: {accuracy * 100:.2f}%")

    print(f"4. Saving model to {MODEL_PATH} …")
    with open(MODEL_PATH, 'wb') as f:
        pickle.dump(model, f)

    print("Done! model.pkl is ready.")


if __name__ == "__main__":
    train_model()
