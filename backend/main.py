from fastapi import FastAPI, HTTPException
from fastapi.middleware.cors import CORSMiddleware
from pydantic import BaseModel
import base64
import numpy as np
import cv2
from io import BytesIO
from PIL import Image
import time

app = FastAPI(title="Sign Language Recognition API")

# Enable CORS for mobile app
app.add_middleware(
    CORSMiddleware,
    allow_origins=["*"],
    allow_credentials=True,
    allow_methods=["*"],
    allow_headers=["*"],
)

class PredictRequest(BaseModel):
    image: str  # Base64 encoded image

class PredictResponse(BaseModel):
    letter: str = ""
    confidence: float = 0.0
    landmarks_detected: bool = False
    processing_time_ms: float = 0.0
    error: str = ""
    top_predictions: list = []

# Will be initialized on startup
landmark_extractor = None
classifier = None

@app.on_event("startup")
async def startup_event():
    global landmark_extractor, classifier
    from landmark_extractor import HandLandmarkExtractor
    from classifier import SignClassifier
    
    # Lower detection confidence for better detection on mobile
    landmark_extractor = HandLandmarkExtractor(
        min_detection_confidence=0.5,
        min_tracking_confidence=0.5
    )
    classifier = SignClassifier(
        "../asl_model_clean.onnx",
        "../asl_label_encoder.pkl"
    )
    print("✅ ONNX Model and MediaPipe loaded successfully!")

@app.get("/")
async def root():
    return {"message": "Sign Language Recognition API", "status": "running"}

@app.get("/health")
async def health():
    return {"status": "healthy"}

@app.post("/predict", response_model=PredictResponse)
async def predict(request: PredictRequest):
    start_time = time.time()
    
    try:
        # Decode base64 image
        image_data = base64.b64decode(request.image)
        image = Image.open(BytesIO(image_data))
        image_np = np.array(image)
        
        # Handle different image formats
        if len(image_np.shape) == 2:
            image_bgr = cv2.cvtColor(image_np, cv2.COLOR_GRAY2BGR)
        elif image_np.shape[2] == 4:
            image_bgr = cv2.cvtColor(image_np, cv2.COLOR_RGBA2BGR)
        elif image_np.shape[2] == 3:
            image_bgr = cv2.cvtColor(image_np, cv2.COLOR_RGB2BGR)
        else:
            image_bgr = image_np
        
        # FIX: Mobile front camera sends rotated image
        # 1. Rotate 90 degrees clockwise to fix orientation
        # 2. Flip horizontally to match training data (mirror effect)
        image_bgr = cv2.rotate(image_bgr, cv2.ROTATE_90_CLOCKWISE)
        image_bgr = cv2.flip(image_bgr, 1)
        
        # Extract landmarks
        landmarks = landmark_extractor.extract(image_bgr)
        
        processing_time = (time.time() - start_time) * 1000
        
        if landmarks is None:
            return PredictResponse(
                landmarks_detected=False,
                processing_time_ms=processing_time,
                error="No hand detected in image"
            )
        
        # Get prediction
        letter, confidence = classifier.predict(landmarks)
        
        # Get top 3 predictions for debugging
        top_preds = classifier.predict_top_k(landmarks, k=3)
        
        processing_time = (time.time() - start_time) * 1000
        
        return PredictResponse(
            letter=letter,
            confidence=confidence,
            landmarks_detected=True,
            processing_time_ms=processing_time,
            top_predictions=[{"letter": l, "confidence": c} for l, c in top_preds]
        )
        
    except Exception as e:
        processing_time = (time.time() - start_time) * 1000
        return PredictResponse(
            landmarks_detected=False,
            processing_time_ms=processing_time,
            error=str(e)
        )

if __name__ == "__main__":
    import uvicorn
    uvicorn.run(app, host="0.0.0.0", port=8000)
