# Twitter Sentiment Analysis — LSTM & GRU

A production-oriented full-stack NLP application that turns the preserved Twitter sentiment research project into a practical inference workspace. It combines a React/Vite frontend with a FastAPI service around the existing tokenizer, preprocessing contract, label mapping, and persisted LSTM artifact.

[![Python](https://img.shields.io/badge/Python-3.11%2B-3776AB?logo=python&logoColor=white)](https://www.python.org/) [![FastAPI](https://img.shields.io/badge/API-FastAPI-009688?logo=fastapi&logoColor=white)](https://fastapi.tiangolo.com/) [![React](https://img.shields.io/badge/Frontend-React-61DAFB?logo=react&logoColor=111827)](https://react.dev/) [![TensorFlow](https://img.shields.io/badge/ML-TensorFlow-FF6F00?logo=tensorflow&logoColor=white)](https://www.tensorflow.org/)

## Project Overview

The application analyzes individual text samples and batch files containing one sentence or tweet per row. Supported batch formats are CSV, Excel (`.xlsx`/`.xls`), and JSON. Each processed row receives the real LSTM sentiment label and confidence returned by the preserved model. The four output classes are `Positive`, `Negative`, `Neutral`, and `Irrelevant`.

> **Source-of-truth principle:** The notebook, datasets, preprocessing, tokenizer, padding behavior, labels, evaluation work, and persisted model artifacts remain the authoritative ML implementation. The application layer productizes that work without retraining or changing the model.

## Architecture Diagram

```mermaid
flowchart LR
  A[User Input] --> B[React Frontend]
  B --> C[POST /api/predict or /api/predict-bulk]
C --> D[FastAPI Backend]
  D --> E[Text Preprocessing]
  E --> F[Tokenizer \n(tokenizer.pkl)]
  F --> G[Pad Sequences \n(maxlen=100)]
  G --> H[LSTM Model \n(sentiment_model.keras)]
  H --> I[Label Decoder \n(label_encoder.pkl)]
  I --> J[Prediction Response]
  J --> B
  B --> A
```

## Folder Structure

```text
Twitter Sentment Analysis/
├── backend/
│   ├── app.py
│   ├── model_loader.py
│   ├── preprocessing.py
│   ├── schemas.py
│   └── requirements.txt
├── salem-predictions/
│   ├── package.json
│   ├── tsconfig.json
│   ├── tailwind.config.js
│   ├── vite.config.ts
│   ├── src/
│   │   ├── App.tsx
│   │   ├── main.tsx
│   │   ├── index.css
│   │   ├── api/
│   │   │   └── predictionService.ts
│   │   ├── components/
│   │   │   ├── FeatureCard.tsx
│   │   │   ├── InfoCard.tsx
│   │   │   ├── MetricPanel.tsx
│   │   │   ├── NavBar.tsx
│   │   │   ├── PredictionForm.tsx
│   │   │   └── SectionHeading.tsx
│   │   ├── hooks/
│   │   │   └── usePrediction.ts
│   │   └── types.ts
│   └── index.html
├── sentmentanalysis.ipynb
├── twitter_training.csv
└── twitter_validation.csv
```

## Installation and Local Launch

### Prerequisites

The project requires **Python 3.11 or later**, **Node.js 20 or later**, and `pip`. The repository already contains a backend virtual environment at `backend\\.venv`; if that environment does not exist on another machine, create it during setup.

### One-time setup

Open PowerShell in the project folder and install the dependencies once:

```powershell
$PROJECT = 'C:\Users\AbdElhalk\OneDrive\Desktop\NLP &LLMs Projects\Twitter Sentment Analysis LSTM GRU'
Set-Location -LiteralPath $PROJECT

# Backend environment and dependencies
Set-Location -LiteralPath (Join-Path $PROJECT 'backend')
python -m venv .venv
& .\.venv\Scripts\Activate.ps1
python -m pip install -r requirements.txt

# Frontend dependencies
Set-Location -LiteralPath (Join-Path $PROJECT 'salem-predictions')
npm install
```

> **PowerShell note:** The project path contains an ampersand (`&`). Always use `Set-Location -LiteralPath` as shown above; do not paste the path into an unquoted `cd` command.

## Open the Backend and Frontend

Start the backend and frontend in **two separate PowerShell terminals**. Keep both terminals open while using the application.

### Terminal 1 — FastAPI backend

```powershell
$PROJECT = 'C:\Users\AbdElhalk\OneDrive\Desktop\NLP &LLMs Projects\Twitter Sentment Analysis LSTM GRU'
Set-Location -LiteralPath $PROJECT
& .\backend\.venv\Scripts\Activate.ps1
python -m uvicorn backend.app:app --reload --host 0.0.0.0 --port 8001
```

The backend will be available at `http://localhost:8001`. Its interactive API documentation is at `http://localhost:8001/docs`. The live preview uses port 8001 because port 8000 is occupied by an older running process on this desktop.

### Terminal 2 — React/Vite frontend

```powershell
$PROJECT = 'C:\Users\AbdElhalk\OneDrive\Desktop\NLP &LLMs Projects\Twitter Sentment Analysis LSTM GRU'
Set-Location -LiteralPath (Join-Path $PROJECT 'salem-predictions')
npm run dev -- --host 0.0.0.0 --port 5173
```

Open the application at `http://localhost:5173`.

## API Documentation

### Prediction endpoint

`POST /api/predict` is the primary endpoint. `/predict` remains available as a compatibility alias.

### Request body

```json
{
  "text": "I absolutely love this new update!"
}
```

### Response body

```json
{
  "text": "I absolutely love this new update!",
  "lstm": {
    "model": "LSTM",
    "available": true,
    "prediction": "Positive",
    "confidence": 0.958
  },
  "gru": {
    "model": "GRU",
    "available": false,
    "prediction": null,
    "confidence": null,
    "note": "No trained GRU model artifact is available for inference."
  }
}
```

The API only displays values returned by the persisted LSTM model. The GRU experiment is documented in the notebook, but no saved GRU artifact is present in the repository, so the interface marks it as unavailable rather than fabricating a result.

### Health and model endpoints

`GET /api/health` reports backend and model availability. `GET /api/models` reports the available model artifacts and the four output classes.

### Batch prediction endpoint

`POST /api/predict-bulk` accepts one uploaded `.csv`, `.xlsx`, `.xls`, or `.json` file. The backend detects a column named `text`, `tweet`, `content`, `sentence`, or `review`; when no named column exists, it uses the first column. JSON may be an array of objects or an object containing a `data` or `records` array. Each non-empty row is analyzed with the preserved LSTM pipeline and returned with its row index, cleaned text, prediction, and confidence.

```text
POST /api/predict-bulk
multipart/form-data: file=<your-file.csv|your-file.xlsx|your-file.json>
```

The frontend displays the complete row-level table and provides a **Download predictions** action that exports the results as CSV.

### Validation

The `text` field is required, must contain at least one character after preprocessing, and may contain up to 1,000 characters.

## Screenshots

> Add screenshots of the application here once available.

- Hero section with interactive prediction card
- Performance cards and feature grid
- Sentiment result display with animated confidence bar

## Future Improvements

- Add authentication and protected API endpoints
- Add batch prediction support for multiple texts
- Add model versioning and metadata endpoints
- Add a docker-compose stack for frontend + backend
- Add end-to-end tests for both UI and API
- Add continuous deployment pipeline

## License

This project is released under the MIT License.
