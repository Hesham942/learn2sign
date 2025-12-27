import mediapipe as mp
import numpy as np
from typing import Optional, List
import cv2

class HandLandmarkExtractor:
    """Wrapper around MediaPipe Hands for landmark extraction."""
    
    def __init__(self, min_detection_confidence: float = 0.5, min_tracking_confidence: float = 0.5):
        self.mp_hands = mp.solutions.hands
        self.hands = self.mp_hands.Hands(
            static_image_mode=True,
            max_num_hands=1,
            min_detection_confidence=min_detection_confidence,
            min_tracking_confidence=min_tracking_confidence
        )
    
    def extract(self, image: np.ndarray) -> Optional[List[float]]:
        """
        Extract 63 landmark features (21 landmarks × 3 coordinates).
        Landmarks are normalized relative to wrist position.
        
        Args:
            image: BGR image as numpy array
            
        Returns:
            List of 63 floats (x, y, z for each of 21 landmarks) or None if no hand detected
        """
        # Convert BGR to RGB for MediaPipe
        rgb_image = cv2.cvtColor(image, cv2.COLOR_BGR2RGB)
        
        # Process image
        results = self.hands.process(rgb_image)
        
        if not results.multi_hand_landmarks:
            return None
        
        # Get first hand's landmarks
        hand_landmarks = results.multi_hand_landmarks[0]
        
        # Extract raw landmarks
        landmarks = []
        for lm in hand_landmarks.landmark:
            landmarks.extend([lm.x, lm.y, lm.z])
        
        # Normalize relative to wrist (landmark 0)
        landmarks = self._normalize_landmarks(landmarks)
        
        return landmarks
    
    def _normalize_landmarks(self, landmarks: List[float]) -> List[float]:
        """Normalize landmarks relative to wrist position."""
        landmarks = np.array(landmarks, dtype=float)
        
        # Wrist is at indices 0, 1, 2 (x, y, z)
        wrist_x, wrist_y, wrist_z = landmarks[0], landmarks[1], landmarks[2]
        
        # Subtract wrist position from all landmarks
        for i in range(0, 63, 3):
            landmarks[i] -= wrist_x
            landmarks[i + 1] -= wrist_y
            landmarks[i + 2] -= wrist_z
        
        return landmarks.tolist()
    
    def __del__(self):
        """Clean up MediaPipe resources."""
        if hasattr(self, 'hands'):
            self.hands.close()
