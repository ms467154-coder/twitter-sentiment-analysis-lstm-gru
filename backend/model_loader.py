import logging
from pathlib import Path
from typing import Any

import joblib
import tensorflow as tf
from keras.preprocessing.sequence import pad_sequences

logger = logging.getLogger(__name__)

MAX_LENGTH = 100
NOTEBOOK_LABELS = ['Neutral', 'Positive', 'Negative', 'Irrelevant']
NOTEBOOK_LABEL_MAP = {0: 'Neutral', 1: 'Positive', 2: 'Negative', 3: 'Irrelevant'}


class ModelBundle:
    def __init__(self, model: tf.keras.Model, tokenizer: Any, label_encoder: Any) -> None:
        self.model = model
        self.tokenizer = tokenizer
        self.label_encoder = label_encoder


def _build_label_mapping(label_encoder_path: Path) -> dict[int, str]:
    joblib.dump(NOTEBOOK_LABEL_MAP, label_encoder_path)
    return NOTEBOOK_LABEL_MAP


def _load_label_mapping(label_encoder_path: Path) -> dict[int, str]:
    if label_encoder_path.exists():
        logger.info('Loading label encoder from %s', label_encoder_path)
        loaded = joblib.load(label_encoder_path)
        if isinstance(loaded, dict):
            return loaded
        if isinstance(loaded, list):
            return {index: label for index, label in enumerate(loaded)}

    logger.warning('label_encoder.pkl not found or invalid; creating one from the notebook label mapping')
    return _build_label_mapping(label_encoder_path)


def load_model_bundle(base_path: Path | str) -> ModelBundle:
    base_path = Path(base_path)
    model_path = base_path / 'sentiment_model.keras'
    tokenizer_path = base_path / 'tokenizer.pkl'
    label_encoder_path = base_path / 'label_encoder.pkl'

    logger.info('Loading model from %s', model_path)
    model = tf.keras.models.load_model(model_path)

    logger.info('Loading tokenizer from %s', tokenizer_path)
    tokenizer = joblib.load(tokenizer_path)

    label_mapping = _load_label_mapping(label_encoder_path)

    return ModelBundle(model=model, tokenizer=tokenizer, label_encoder=label_mapping)


def create_prediction(model_bundle: ModelBundle, text: str) -> tuple[str, float]:
    sequence = model_bundle.tokenizer.texts_to_sequences([text])
    padded = pad_sequences(sequence, maxlen=MAX_LENGTH, padding='pre', truncating='pre')
    raw_prediction = model_bundle.model.predict(padded, verbose=0)[0]
    confidence = float(max(raw_prediction))
    predicted_index = int(raw_prediction.argmax())
    label_mapping = model_bundle.label_encoder
    predicted_label = label_mapping.get(predicted_index, NOTEBOOK_LABELS[predicted_index])
    return predicted_label, confidence
