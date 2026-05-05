import mediapipe as mp
import cv2
import numpy as np

# Initialize MediaPipe Hands
mp_hands = mp.solutions.hands
hands = mp_hands.Hands(
    static_image_mode=False,
    max_num_hands=1,
    min_detection_confidence=0.5,
    min_tracking_confidence=0.5
)

def process_frame(image):
    """
    Processes an image frame using MediaPipe and returns normalized landmarks.
    """
    # Convert BGR to RGB (MediaPipe expects RGB)
    image_rgb = cv2.cvtColor(image, cv2.COLOR_BGR2RGB)
    
    # Process the image and detect hands
    results = hands.process(image_rgb)
    
    if results.multi_hand_landmarks:
        # We process the first detected hand
        hand_landmarks = results.multi_hand_landmarks[0]
        
        # Extract x, y, z coordinates
        x_coords = []
        y_coords = []
        
        for landmark in hand_landmarks.landmark:
            x_coords.append(landmark.x)
            y_coords.append(landmark.y)
            
        # Normalize the landmarks relative to the bounding box of the hand
        # This makes the prediction scale and position invariant
        min_x, max_x = min(x_coords), max(x_coords)
        min_y, max_y = min(y_coords), max(y_coords)
        
        normalized_landmarks = []
        for landmark in hand_landmarks.landmark:
            # Avoid division by zero
            width = max_x - min_x if max_x != min_x else 1.0
            height = max_y - min_y if max_y != min_y else 1.0
            
            normalized_x = (landmark.x - min_x) / width
            normalized_y = (landmark.y - min_y) / height
            
            # We include z-coordinate as is, or you could normalize it too
            normalized_landmarks.extend([normalized_x, normalized_y, landmark.z])
            
        return normalized_landmarks
    
    return None
