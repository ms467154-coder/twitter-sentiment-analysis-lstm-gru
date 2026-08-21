import axios from 'axios';
import type { BulkPredictionResponse, PredictionResponse } from '../types';

const apiClient = axios.create({
  baseURL: 'http://localhost:8000',
  timeout: 600000,
});

export async function fetchPrediction(text: string): Promise<PredictionResponse> {
  const response = await apiClient.post<PredictionResponse>('/predict', { text }, { headers: { 'Content-Type': 'application/json' } });
  return response.data;
}

export async function fetchBulkPrediction(file: File): Promise<BulkPredictionResponse> {
  const formData = new FormData();
  formData.append('file', file);

  const response = await apiClient.post<BulkPredictionResponse>('/predict-bulk', formData, {
    headers: { 'Content-Type': 'multipart/form-data' },
  });

  return response.data;
}
