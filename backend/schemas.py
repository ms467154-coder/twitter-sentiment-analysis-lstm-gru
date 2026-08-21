from typing import Optional
from pydantic import BaseModel, Field


class PredictionRequest(BaseModel):
    text: str = Field(..., min_length=1, max_length=1000)


class ModelPrediction(BaseModel):
    model: str
    available: bool
    prediction: Optional[str] = None
    confidence: Optional[float] = None
    note: Optional[str] = None


class PredictionResponse(BaseModel):
    text: str
    lstm: ModelPrediction
    gru: ModelPrediction


class BulkPredictionItem(BaseModel):
    row_index: int
    text: str
    prediction: str
    confidence: float


class BulkPredictionResponse(BaseModel):
    total_rows: int
    processed_rows: int
    results: list[BulkPredictionItem]
