"""
CLI and standalone inference helper for Railway Clip Maintenance Priority.
Loads the five trained model artifacts and predicts maintenance priority for a single sample.
"""

import os
import argparse
import joblib
import numpy as np
import pandas as pd

BASE_DIR = os.path.dirname(os.path.abspath(__file__))
MODELS_DIR = os.path.join(BASE_DIR, "models")

def load_artifacts():
    return {
        "model": joblib.load(os.path.join(MODELS_DIR, "railway_clip_priority_model.pkl")),
        "feature_names": joblib.load(os.path.join(MODELS_DIR, "feature_names.pkl")),
        "status_encoder": joblib.load(os.path.join(MODELS_DIR, "status_encoder.pkl")),
        "frequency_encoder": joblib.load(os.path.join(MODELS_DIR, "frequency_encoder.pkl")),
        "priority_encoder": joblib.load(os.path.join(MODELS_DIR, "priority_encoder.pkl")),
    }

def predict_single(
    clip_age_days: float,
    total_scans: int,
    loose_count: int,
    wear_count: int,
    replacement_count: int,
    days_since_last_inspection: float,
    days_since_last_repair: float,
    last_status: str,
    train_frequency: str = "Medium",
    artifacts: dict = None
):
    if artifacts is None:
        artifacts = load_artifacts()

    model = artifacts["model"]
    feature_names = artifacts["feature_names"]
    status_encoder = artifacts["status_encoder"]
    frequency_encoder = artifacts["frequency_encoder"]
    priority_encoder = artifacts["priority_encoder"]

    # Normalization: Map 'Healthy' to 'Good'
    norm_status = last_status.strip().lower()
    if norm_status == "healthy" or norm_status == "good":
        norm_status = "Good"
    elif norm_status == "loose":
        norm_status = "Loose"
    elif norm_status in ["worn", "wear"]:
        norm_status = "Worn"
    else:
        norm_status = "Good"

    norm_freq = train_frequency.strip().title()
    if norm_freq not in frequency_encoder.classes_:
        norm_freq = "Medium"

    encoded_status = int(status_encoder.transform([norm_status])[0])
    encoded_freq = int(frequency_encoder.transform([norm_freq])[0])

    # Feature Engineering
    clip_age_years = round(clip_age_days / 365.0, 2)
    loose_rate = (loose_count / total_scans) if total_scans > 0 else 0.0
    wear_rate = (wear_count / total_scans) if total_scans > 0 else 0.0
    replacement_rate = (replacement_count / total_scans) if total_scans > 0 else 0.0
    inspection_frequency = round(clip_age_days / total_scans, 2) if total_scans > 0 else float(clip_age_days)
    maintenance_index = loose_count * 2 + wear_count * 3 + replacement_count * 5
    health_index = max(0.0, float(100 - maintenance_index))

    data = {
        "Clip_Age_Days": clip_age_days,
        "Total_Scans": total_scans,
        "Loose_Count": loose_count,
        "Wear_Count": wear_count,
        "Replacement_Count": replacement_count,
        "Days_Since_Last_Inspection": days_since_last_inspection,
        "Days_Since_Last_Repair": days_since_last_repair,
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

    df = pd.DataFrame([data])[feature_names]

    pred_code = int(model.predict(df)[0])
    decoded_priority = str(priority_encoder.inverse_transform([pred_code])[0])

    if hasattr(model, "predict_proba"):
        probs = model.predict_proba(df)[0]
        confidence = round(float(np.max(probs)) * 100.0, 2)
        classes = list(priority_encoder.classes_)
        prob_dict = {cls: round(float(probs[i]) * 100.0, 2) for i, cls in enumerate(classes)}
    else:
        confidence = 100.0
        prob_dict = {decoded_priority: 100.0}

    return {
        "maintenance_priority": decoded_priority,
        "confidence": confidence,
        "probabilities": prob_dict,
        "engineered_features": {
            "Clip_Age_Years": clip_age_years,
            "Loose_Rate": round(loose_rate, 4),
            "Wear_Rate": round(wear_rate, 4),
            "Replacement_Rate": round(replacement_rate, 4),
            "Inspection_Frequency": inspection_frequency,
            "Maintenance_Index": float(maintenance_index),
            "Health_Index": float(health_index),
        }
    }

if __name__ == "__main__":
    parser = argparse.ArgumentParser(description="Railway Clip Maintenance Priority Inference")
    parser.add_argument("--clip-age", type=float, default=300.0)
    parser.add_argument("--scans", type=int, default=10)
    parser.add_argument("--loose", type=int, default=0)
    parser.add_argument("--wear", type=int, default=0)
    parser.add_argument("--replacements", type=int, default=0)
    parser.add_argument("--days-since-insp", type=float, default=15.0)
    parser.add_argument("--days-since-repair", type=float, default=120.0)
    parser.add_argument("--status", type=str, default="Healthy")
    parser.add_argument("--frequency", type=str, default="Medium")
    args = parser.parse_args()

    result = predict_single(
        clip_age_days=args.clip_age,
        total_scans=args.scans,
        loose_count=args.loose,
        wear_count=args.wear,
        replacement_count=args.replacements,
        days_since_last_inspection=args.days_since_insp,
        days_since_last_repair=args.days_since_repair,
        last_status=args.status,
        train_frequency=args.frequency
    )
    print("--- Inference Result ---")
    print(f"Predicted Priority: {result['maintenance_priority']}")
    print(f"Confidence: {result['confidence']}%")
    print(f"Probabilities: {result['probabilities']}")
    print(f"Engineered Features: {result['engineered_features']}")
