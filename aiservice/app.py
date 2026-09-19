import os
import logging
from contextlib import asynccontextmanager
from typing import Dict, Any, Optional

import joblib
import numpy as np
import pandas as pd
from fastapi import FastAPI, HTTPException, status
from fastapi.middleware.cors import CORSMiddleware
from pydantic import BaseModel, Field

logging.basicConfig(
    level=logging.INFO,
    format="%(asctime)s [%(levelname)s] %(name)s: %(message)s"
)
logger = logging.getLogger("railclip-ai-service")

# Resolve absolute paths for model directory
BASE_DIR = os.path.dirname(os.path.abspath(__file__))
MODELS_DIR = os.path.join(BASE_DIR, "models")

# Global model state dictionary
ai_bundle = {
    "model": None,
    "feature_names": None,
    "status_encoder": None,
    "frequency_encoder": None,
    "priority_encoder": None,
    "loaded": False,
}

def load_ai_bundle():
    """Load all 5 trained model and encoder files."""
    model_path = os.path.join(MODELS_DIR, "railway_clip_priority_model.pkl")
    feature_path = os.path.join(MODELS_DIR, "feature_names.pkl")
    status_path = os.path.join(MODELS_DIR, "status_encoder.pkl")
    freq_path = os.path.join(MODELS_DIR, "frequency_encoder.pkl")
    priority_path = os.path.join(MODELS_DIR, "priority_encoder.pkl")

    required_files = [
        ("XGBoost Model", model_path),
        ("Feature Names", feature_path),
        ("Status Encoder", status_path),
        ("Frequency Encoder", freq_path),
        ("Priority Encoder", priority_path),
    ]

    for name, path in required_files:
        if not os.path.exists(path):
            raise FileNotFoundError(f"Missing required AI artifact: {name} at {path}")

    logger.info("Loading model artifacts from: %s", MODELS_DIR)
    ai_bundle["model"] = joblib.load(model_path)
    ai_bundle["feature_names"] = joblib.load(feature_path)
    ai_bundle["status_encoder"] = joblib.load(status_path)
    ai_bundle["frequency_encoder"] = joblib.load(freq_path)
    ai_bundle["priority_encoder"] = joblib.load(priority_path)
    ai_bundle["loaded"] = True

    logger.info("Features loaded (%d): %s", len(ai_bundle["feature_names"]), ai_bundle["feature_names"])
    logger.info("Status classes: %s", list(ai_bundle["status_encoder"].classes_))
    logger.info("Frequency classes: %s", list(ai_bundle["frequency_encoder"].classes_))
    logger.info("Priority classes: %s", list(ai_bundle["priority_encoder"].classes_))

@asynccontextmanager
async def lifespan(app: FastAPI):
    # Startup
    try:
        load_ai_bundle()
    except Exception as exc:
        logger.error("Failed to load AI model bundle on startup: %s", exc, exc_info=True)
        raise exc
    yield
    # Shutdown
    ai_bundle.clear()
    logger.info("AI service unloaded.")

app = FastAPI(
    title="RailClip Maintenance Priority AI Microservice",
    description="Inference microservice for Railway Clip Maintenance Priority Prediction using trained XGBoost classifier.",
    version="1.0.0",
    lifespan=lifespan
)

# Enable CORS for communication from Node backend / tools
app.add_middleware(
    CORSMiddleware,
    allow_origins=["*"],
    allow_credentials=True,
    allow_methods=["*"],
    allow_headers=["*"],
)

class ClipPredictionRequest(BaseModel):
    clip_age_days: float = Field(..., description="Age of the railway clip in days since installation.")
    total_scans: int = Field(..., ge=0, description="Total number of scans/inspections conducted.")
    loose_count: int = Field(0, ge=0, description="Cumulative count of times the clip was detected loose.")
    wear_count: int = Field(0, ge=0, description="Cumulative count of times wear was detected on the clip.")
    replacement_count: int = Field(0, ge=0, description="Number of times replacement occurred.")
    days_since_last_inspection: float = Field(..., ge=0, description="Days elapsed since the previous inspection.")
    days_since_last_repair: float = Field(..., ge=0, description="Days elapsed since the last repair action.")
    last_status: str = Field(..., description="Last observed status: Healthy, Good, Loose, or Worn.")
    train_frequency: str = Field("Medium", description="Track section train frequency: High, Medium, or Low.")

class ClipPredictionResponse(BaseModel):
    maintenance_priority: str
    confidence: float
    probabilities: Dict[str, float]
    normalized_status: str
    normalized_frequency: str
    engineered_features: Dict[str, float]

def normalize_status(raw_status: str, valid_classes: list) -> str:
    """
    Standardize status values.
    Detects mismatch where the application passes 'Healthy' while the model
    encoder was trained strictly on ['Good', 'Loose', 'Worn'].
    """
    cleaned = str(raw_status or "").strip().lower()
    mapping = {
        "healthy": "Good",
        "good": "Good",
        "loose": "Loose",
        "worn": "Worn",
        "wear": "Worn"
    }

    if cleaned in mapping:
        standardized = mapping[cleaned]
        if cleaned == "healthy":
            logger.info("Detected application status 'Healthy' -> standardized to '%s' for model encoder compatibility.", standardized)
        return standardized

    # If title-cased matches valid classes directly
    title_val = str(raw_status or "").strip().title()
    if title_val in valid_classes:
        return title_val

    raise HTTPException(
        status_code=status.HTTP_422_UNPROCESSABLE_ENTITY,
        detail=f"Invalid Last_Status '{raw_status}'. Allowed values: ['Healthy', 'Good', 'Loose', 'Worn']. Model encoder expects one of {valid_classes}."
    )

def normalize_frequency(raw_freq: str, valid_classes: list) -> str:
    """Standardize train frequency values."""
    cleaned = str(raw_freq or "").strip().lower()
    mapping = {
        "high": "High",
        "medium": "Medium",
        "low": "Low",
        "normal": "Medium",
        "med": "Medium",
    }

    if cleaned in mapping:
        return mapping[cleaned]

    title_val = str(raw_freq or "").strip().title()
    if title_val in valid_classes:
        return title_val

    # Default fallback
    logger.warning("Unrecognized Train_Frequency '%s', defaulting to 'Medium'.", raw_freq)
    return "Medium"

@app.get("/health")
def health_check():
    """Health check endpoint to verify microservice status and model readiness."""
    return {
        "status": "healthy" if ai_bundle["loaded"] else "initializing",
        "model_loaded": ai_bundle["loaded"],
        "expected_features": ai_bundle["feature_names"],
        "status_classes": list(ai_bundle["status_encoder"].classes_) if ai_bundle["loaded"] else [],
        "frequency_classes": list(ai_bundle["frequency_encoder"].classes_) if ai_bundle["loaded"] else [],
        "priority_classes": list(ai_bundle["priority_encoder"].classes_) if ai_bundle["loaded"] else [],
    }

@app.post("/predict", response_model=ClipPredictionResponse)
def predict_priority(req: ClipPredictionRequest):
    """
    Receive prepared railway clip metrics, perform feature engineering,
    encode categorical attributes, align with feature_names.pkl order,
    and predict Maintenance Priority with confidence.
    """
    if not ai_bundle["loaded"]:
        raise HTTPException(
            status_code=status.HTTP_503_SERVICE_UNAVAILABLE,
            detail="AI model is not yet loaded into memory."
        )

    model = ai_bundle["model"]
    feature_names = ai_bundle["feature_names"]
    status_encoder = ai_bundle["status_encoder"]
    frequency_encoder = ai_bundle["frequency_encoder"]
    priority_encoder = ai_bundle["priority_encoder"]

    # 1. Categorical Normalization and Encoding
    norm_status = normalize_status(req.last_status, list(status_encoder.classes_))
    norm_freq = normalize_frequency(req.train_frequency, list(frequency_encoder.classes_))

    encoded_status = int(status_encoder.transform([norm_status])[0])
    encoded_freq = int(frequency_encoder.transform([norm_freq])[0])

    # 2. Calculate Engineered Features (matching exact training pipeline)
    clip_age_days = float(req.clip_age_days)
    total_scans = int(req.total_scans)
    loose_count = int(req.loose_count)
    wear_count = int(req.wear_count)
    replacement_count = int(req.replacement_count)

    clip_age_years = round(clip_age_days / 365.0, 2)
    loose_rate = (loose_count / total_scans) if total_scans > 0 else 0.0
    wear_rate = (wear_count / total_scans) if total_scans > 0 else 0.0
    replacement_rate = (replacement_count / total_scans) if total_scans > 0 else 0.0
    inspection_frequency = round(clip_age_days / total_scans, 2) if total_scans > 0 else float(clip_age_days)
    maintenance_index = loose_count * 2 + wear_count * 3 + replacement_count * 5
    health_index = max(0.0, float(100 - maintenance_index))

    # 3. Assemble Feature Dictionary
    feature_dict = {
        "Clip_Age_Days": clip_age_days,
        "Total_Scans": total_scans,
        "Loose_Count": loose_count,
        "Wear_Count": wear_count,
        "Replacement_Count": replacement_count,
        "Days_Since_Last_Inspection": float(req.days_since_last_inspection),
        "Days_Since_Last_Repair": float(req.days_since_last_repair),
        "Last_Status": encoded_status,
        "Train_Frequency": encoded_freq,
        "Clip_Age_Years": clip_age_years,
        "Loose_Rate": loose_rate,
        "Wear_Rate": wear_rate,
        "Replacement_Rate": replacement_rate,
        "Inspection_Frequency": inspection_frequency,
        "Maintenance_Index": float(maintenance_index),
        "Health_Index": float(health_index),
    }

    # 4. Guarantee exact feature order as required by the model
    try:
        input_df = pd.DataFrame([feature_dict])[feature_names]
    except KeyError as key_err:
        raise HTTPException(
            status_code=status.HTTP_500_INTERNAL_SERVER_ERROR,
            detail=f"Feature alignment failed: {key_err}"
        )

    # 5. Execute Prediction
    try:
        prediction_code = int(model.predict(input_df)[0])
        decoded_priority = str(priority_encoder.inverse_transform([prediction_code])[0])
    except Exception as pred_err:
        logger.error("Model prediction error: %s", pred_err, exc_info=True)
        raise HTTPException(
            status_code=status.HTTP_500_INTERNAL_SERVER_ERROR,
            detail=f"Model inference failed: {pred_err}"
        )

    # 6. Calculate Confidence and Probabilities
    if hasattr(model, "predict_proba"):
        probabilities_raw = model.predict_proba(input_df)[0]
        confidence = round(float(np.max(probabilities_raw)) * 100.0, 2)
        classes = list(priority_encoder.classes_)
        probabilities = {
            cls: round(float(probabilities_raw[i]) * 100.0, 2)
            for i, cls in enumerate(classes)
        }
    else:
        confidence = 100.0
        probabilities = {decoded_priority: 100.0}

    return ClipPredictionResponse(
        maintenance_priority=decoded_priority,
        confidence=confidence,
        probabilities=probabilities,
        normalized_status=norm_status,
        normalized_frequency=norm_freq,
        engineered_features={
            "Clip_Age_Years": clip_age_years,
            "Loose_Rate": round(loose_rate, 4),
            "Wear_Rate": round(wear_rate, 4),
            "Replacement_Rate": round(replacement_rate, 4),
            "Inspection_Frequency": inspection_frequency,
            "Maintenance_Index": float(maintenance_index),
            "Health_Index": float(health_index),
        }
    )

# Alias for `uvicorn app:main`
main = app
