import numpy as np

def normalize_landmarks(raw_landmarks):
    try:
        if len(raw_landmarks) != 63:
            return None

        points = [(raw_landmarks[i], raw_landmarks[i+1], raw_landmarks[i+2])
                  for i in range(0, 63, 3)]

        x_coords = [p[0] for p in points]
        y_coords = [p[1] for p in points]

        min_x, max_x = min(x_coords), max(x_coords)
        min_y, max_y = min(y_coords), max(y_coords)

        w = max_x - min_x or 1.0
        h = max_y - min_y or 1.0

        feature_vector = []
        for x, y, z in points:
            feature_vector.append((x - min_x) / w)
            feature_vector.append((y - min_y) / h)
            feature_vector.append(z)

        return feature_vector

    except Exception as e:
        print(f"Landmark normalisation error: {e}")
        return None


def process_frame(image_bgr):
    """Not used in production. Landmarks are sent from the browser."""
    return None
