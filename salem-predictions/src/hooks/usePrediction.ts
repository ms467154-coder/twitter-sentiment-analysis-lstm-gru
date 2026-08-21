import { useCallback, useState } from 'react';
import { fetchBulkPrediction, fetchPrediction } from '../api/predictionService';
import type { BulkPredictionResponse, PredictionResponse } from '../types';

export function usePrediction() {
  const [input, setInput] = useState('');
  const [prediction, setPrediction] = useState<PredictionResponse | null>(null);
  const [status, setStatus] = useState<'idle' | 'loading' | 'success' | 'error'>('idle');
  const [error, setError] = useState<string | null>(null);
  const [selectedFile, setSelectedFile] = useState<File | null>(null);
  const [bulkPrediction, setBulkPrediction] = useState<BulkPredictionResponse | null>(null);
  const [bulkStatus, setBulkStatus] = useState<'idle' | 'uploading' | 'success' | 'error'>('idle');
  const [bulkError, setBulkError] = useState<string | null>(null);

  const canSubmit = input.trim().length > 0 && status !== 'loading';

  const analyze = useCallback(async () => {
    if (!input.trim()) {
      return;
    }

    setStatus('loading');
    setError(null);
    setPrediction(null);

    try {
      const result = await fetchPrediction(input.trim());
      setPrediction(result);
      setStatus('success');
    } catch {
      setError('Unable to fetch prediction. Please try again.');
      setPrediction(null);
      setStatus('error');
    }
  }, [input]);

  const uploadFile = useCallback(async () => {
    if (!selectedFile) {
      return;
    }

    setBulkStatus('uploading');
    setBulkError(null);
    setBulkPrediction(null);

    try {
      const result = await fetchBulkPrediction(selectedFile);
      setBulkPrediction(result);
      setBulkStatus('success');
    } catch {
      setBulkError('Unable to process the file. Please try again.');
      setBulkPrediction(null);
      setBulkStatus('error');
    }
  }, [selectedFile]);

  const chooseFile = useCallback((file: File | null) => {
    setSelectedFile(file);
    if (!file) {
      setBulkPrediction(null);
      setBulkStatus('idle');
      setBulkError(null);
    }
  }, []);

  const clear = useCallback(() => {
    setInput('');
    setPrediction(null);
    setStatus('idle');
    setError(null);
    setSelectedFile(null);
    setBulkPrediction(null);
    setBulkStatus('idle');
    setBulkError(null);
  }, []);

  return {
    input,
    setInput,
    prediction,
    status,
    error,
    canSubmit,
    analyze,
    clear,
    selectedFile,
    bulkPrediction,
    bulkStatus,
    bulkError,
    uploadFile,
    chooseFile,
  };
}
