import onnxruntime as ort
import numpy as np
from typing import Tuple, List
import joblib

class SignClassifier:
    """Wrapper around the ONNX model for ASL classification."""
    
    def __init__(self, model_path: str, label_encoder_path: str = None):
        """
        Initialize classifier with ONNX model.
        
        Args:
            model_path: Path to the .onnx model file
            label_encoder_path: Path to label encoder .pkl file (optional)
        """
        self.session = ort.InferenceSession(model_path)
        self.input_name = self.session.get_inputs()[0].name
        
        # Load label encoder if provided
        if label_encoder_path:
            self.label_encoder = joblib.load(label_encoder_path)
            self.labels = list(self.label_encoder.classes_)
        else:
            # Default labels A-Z
            self.labels = [chr(i) for i in range(ord('A'), ord('Z') + 1)]
    
    def _get_probabilities(self, landmarks: List[float]) -> np.ndarray:
        """Get softmax probabilities from model output."""
        features = np.array(landmarks, dtype=np.float32).reshape(1, -1)
        outputs = self.session.run(None, {self.input_name: features})
        logits = outputs[0][0]
        
        # Apply softmax
        exp_logits = np.exp(logits - np.max(logits))
        probabilities = exp_logits / exp_logits.sum()
        return probabilities
    
    def predict(self, landmarks: List[float]) -> Tuple[str, float]:
        """
        Predict ASL letter from hand landmarks.
        
        Args:
            landmarks: List of 63 floats (normalized landmark coordinates)
            
        Returns:
            Tuple of (predicted_letter, confidence_score)
        """
        probabilities = self._get_probabilities(landmarks)
        predicted_idx = int(np.argmax(probabilities))
        confidence = float(probabilities[predicted_idx])
        letter = self.labels[predicted_idx]
        
        return letter, confidence
    
    def predict_top_k(self, landmarks: List[float], k: int = 5) -> List[Tuple[str, float]]:
        """
        Get top-k predictions with confidence scores.
        
        Args:
            landmarks: List of 63 floats (normalized landmark coordinates)
            k: Number of top predictions to return
            
        Returns:
            List of (letter, confidence) tuples sorted by confidence
        """
        probabilities = self._get_probabilities(landmarks)
        top_indices = np.argsort(probabilities)[::-1][:k]
        
        results = []
        for idx in top_indices:
            letter = self.labels[idx]
            confidence = float(probabilities[idx])
            results.append((letter, confidence))
        
        return results
