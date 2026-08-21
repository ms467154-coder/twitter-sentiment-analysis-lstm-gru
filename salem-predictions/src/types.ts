import type { ElementType } from 'react';

export type PredictionResponse = {
  prediction: 'Positive' | 'Negative' | 'Neutral' | 'Irrelevant';
  confidence: number;
};

export type BulkPredictionItem = {
  row_index: number;
  text: string;
  prediction: 'Positive' | 'Negative' | 'Neutral' | 'Irrelevant';
  confidence: number;
};

export type BulkPredictionResponse = {
  total_rows: number;
  processed_rows: number;
  results: BulkPredictionItem[];
};

export type FeatureCard = {
  icon: ElementType;
  title: string;
  description: string;
};

export type MetricCard = {
  label: string;
  value: string;
  tone: 'accuracy' | 'loss';
};
