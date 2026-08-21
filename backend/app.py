import logging
from pathlib import Path
from typing import List
import json

import pandas as pd
from fastapi import FastAPI, File, HTTPException, UploadFile
from fastapi.middleware.cors import CORSMiddleware

from .model_loader import ModelBundle, create_prediction, load_model_bundle
from .preprocessing import clean_text
from .schemas import BulkPredictionItem, BulkPredictionResponse, ModelPrediction, PredictionRequest, PredictionResponse

logger = logging.getLogger("sentiment-api")
logging.basicConfig(level=logging.INFO, format="%(asctime)s %(levelname)s %(message)s")

app = FastAPI(
    title="Twitter Sentiment Analysis API",
    description="Inference API for the preserved LSTM model from the Twitter sentiment project.",
    version="2.0.0",
)
app.add_middleware(
    CORSMiddleware,
    allow_origin_regex=r"http://(localhost|127\.0\.0\.1)(:\d+)?",
    allow_credentials=True,
    allow_methods=["*"],
    allow_headers=["*"],
)

MODEL_BASE_PATH = Path(__file__).resolve().parent
model_bundle: ModelBundle | None = None


@app.on_event("startup")
async def startup_event() -> None:
    global model_bundle
    model_bundle = load_model_bundle(MODEL_BASE_PATH)
    logger.info("LSTM model bundle loaded")


@app.get("/")
async def root() -> dict:
    return {"name": "Twitter Sentiment Analysis API", "status": "ok", "lstm_available": model_bundle is not None, "gru_available": False}


@app.get("/api/health")
async def health() -> dict:
    return {"status": "healthy" if model_bundle is not None else "degraded", "models": {"lstm": model_bundle is not None, "gru": False}}


@app.get("/api/models")
async def models() -> dict:
    return {
        "models": [
            {"name": "LSTM", "available": True, "artifact": "backend/sentiment_model.keras"},
            {"name": "GRU", "available": False, "artifact": None, "note": "The notebook contains the GRU experiment, but no persisted GRU artifact is present in this repository."},
        ],
        "classes": ["Neutral", "Positive", "Negative", "Irrelevant"],
    }


def _predict_lstm(text: str) -> ModelPrediction:
    if model_bundle is None:
        raise HTTPException(status_code=503, detail="LSTM model is not loaded")
    prediction, confidence = create_prediction(model_bundle, text)
    return ModelPrediction(model="LSTM", available=True, prediction=prediction, confidence=confidence)


@app.post("/api/predict", response_model=PredictionResponse)
@app.post("/predict", response_model=PredictionResponse)
async def predict(payload: PredictionRequest) -> PredictionResponse:
    cleaned_text = clean_text(payload.text)
    if not cleaned_text:
        raise HTTPException(status_code=422, detail="Text must contain valid content")
    lstm = _predict_lstm(cleaned_text)
    gru = ModelPrediction(model="GRU", available=False, note="No trained GRU model artifact is available for inference.")
    return PredictionResponse(text=cleaned_text, lstm=lstm, gru=gru)


def read_bulk_input_file(upload_file: UploadFile) -> pd.DataFrame:
    filename = (upload_file.filename or "").lower()
    upload_file.file.seek(0)
    if filename.endswith((".xlsx", ".xls")):
        return pd.read_excel(upload_file.file)
    if filename.endswith(".csv"):
        return pd.read_csv(upload_file.file)
    if filename.endswith(".json"):
        try:
            payload = json.load(upload_file.file)
        except json.JSONDecodeError as exc:
            raise HTTPException(status_code=400, detail="The JSON file is invalid") from exc
        if isinstance(payload, list):
            return pd.DataFrame(payload)
        if isinstance(payload, dict):
            records = payload.get("data", payload.get("records", payload))
            if isinstance(records, list):
                return pd.DataFrame(records)
            return pd.DataFrame([records])
        raise HTTPException(status_code=400, detail="JSON must contain an object or an array of objects")
    raise HTTPException(status_code=400, detail="Upload a CSV, Excel, or JSON file")


@app.post("/api/predict-bulk", response_model=BulkPredictionResponse)
@app.post("/predict-bulk", response_model=BulkPredictionResponse)
async def predict_bulk(file: UploadFile = File(...)) -> BulkPredictionResponse:
    if model_bundle is None:
        raise HTTPException(status_code=503, detail="LSTM model is not loaded")
    if not file.filename or not file.filename.lower().endswith((".csv", ".xlsx", ".xls", ".json")):
        raise HTTPException(status_code=400, detail="Upload a CSV, Excel, or JSON file")
    try:
        df = read_bulk_input_file(file)
    except HTTPException:
        raise
    except Exception as exc:
        raise HTTPException(status_code=400, detail="Could not read the uploaded file") from exc
    if df.empty or df.shape[1] == 0:
        raise HTTPException(status_code=400, detail="Uploaded file is empty")
    named = [c for c in df.columns if str(c).lower() in {"text", "tweet", "content", "sentence", "review"}]
    text_column = named[0] if named else df.columns[0]
    results: List[BulkPredictionItem] = []
    for row_index, value in enumerate(df[text_column].fillna("").astype(str)):
        text = clean_text(value)
        if not text:
            continue
        prediction, confidence = create_prediction(model_bundle, text)
        results.append(BulkPredictionItem(row_index=row_index, text=text, prediction=prediction, confidence=confidence))
    return BulkPredictionResponse(total_rows=len(df), processed_rows=len(results), results=results)
