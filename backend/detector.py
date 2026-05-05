import mediapipe as mp
from mediapipe.tasks import python as mp_python
from mediapipe.tasks.python import vision as mp_vision
from mediapipe.tasks.python.vision import HandLandmarkerOptions
import cv2
import numpy as np
import urllib.request
import os

# ── Download the MediaPipe hand-landmark model on first run ──────────────────
MODEL_PATH = os.path.join(os.path.dirname(__file__), "hand_landmarker.task")
MODEL_URL = (
    "https://storage.googleapis.com/mediapipe-models/"
    "hand_landmarker/hand_landmarker/float16/1/hand_landmarker.task"
)

if not os.path.exists(MODEL_PATH):
    print("Downloading hand landmarker model …")
    urllib.request.urlretrieve(MODEL_URL, MODEL_PATH)
    print("Model downloaded.")

# ── Build the HandLandmarker (new Tasks API) ─────────────────────────────────
_base_opts = mp_python.BaseOptions(model_asset_path=MODEL_PATH)
_landmarker_opts = HandLandmarkerOptions(
    base_options=_base_opts,
    num_hands=1,
    min_hand_detection_confidence=0.5,
    min_tracking_confidence=0.5,
    running_mode=mp_vision.RunningMode.IMAGE,   # static-image mode for server use
)
_landmarker = mp_vision.HandLandmarker.create_from_options(_landmarker_opts)


def process_frame(image_bgr: np.ndarray):
    """
    Accepts a BGR numpy array, runs MediaPipe hand landmark detection,
    and returns a normalised 63-element feature vector, or None.
    """
    # MediaPipe Tasks expects RGB
    image_rgb = cv2.cvtColor(image_bgr, cv2.COLOR_BGR2RGB)
    mp_image = mp.Image(image_format=mp.ImageFormat.SRGB, data=image_rgb)

    result = _landmarker.detect(mp_image)

    if not result.hand_landmarks:
        return None

    landmarks = result.hand_landmarks[0]   # first detected hand

    x_coords = [lm.x for lm in landmarks]
    y_coords = [lm.y for lm in landmarks]

    min_x, max_x = min(x_coords), max(x_coords)
    min_y, max_y = min(y_coords), max(y_coords)

    w = max_x - min_x or 1.0
    h = max_y - min_y or 1.0

    feature_vector = []
    for lm in landmarks:
        feature_vector.append((lm.x - min_x) / w)
        feature_vector.append((lm.y - min_y) / h)
        feature_vector.append(lm.z)            # z stays raw (depth)

    return feature_vector           # 21 landmarks × 3 = 63 features
