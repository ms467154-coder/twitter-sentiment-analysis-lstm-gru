import { useState, type KeyboardEvent } from 'react';
import { motion } from 'framer-motion';
import { Loader2, Sparkles, Upload } from 'lucide-react';
import type { BulkPredictionResponse, PredictionResponse } from '../types';

const sentimentStyles = {
  Positive: {
    border: 'border-emerald-400/20',
    text: 'text-emerald-400',
    bar: 'bg-emerald-400',
  },
  Negative: {
    border: 'border-rose-400/20',
    text: 'text-rose-400',
    bar: 'bg-rose-400',
  },
  Neutral: {
    border: 'border-slate-400/20',
    text: 'text-slate-300',
    bar: 'bg-slate-300',
  },
  Irrelevant: {
    border: 'border-sky-400/20',
    text: 'text-sky-400',
    bar: 'bg-sky-400',
  },
};

type PredictionFormProps = {
  input: string;
  setInput: (value: string) => void;
  onSubmit: () => void;
  onClear: () => void;
  isLoading: boolean;
  prediction: PredictionResponse | null;
  error: string | null;
  selectedFile: File | null;
  onFileSelect: (file: File | null) => void;
  onUpload: () => void;
  isUploading: boolean;
  bulkPrediction: BulkPredictionResponse | null;
  bulkError: string | null;
};

export function PredictionForm({
  input,
  setInput,
  onSubmit,
  onClear,
  isLoading,
  prediction,
  error,
  selectedFile,
  onFileSelect,
  onUpload,
  isUploading,
  bulkPrediction,
  bulkError,
}: PredictionFormProps) {
  const characters = input.length;
  const [mode, setMode] = useState<'single' | 'bulk'>('single');

  const handleKeyDown = (event: KeyboardEvent<HTMLTextAreaElement>) => {
    if (event.key === 'Enter' && !event.shiftKey) {
      event.preventDefault();
      onSubmit();
    }
  };

  const handleDownloadCsv = () => {
    if (!bulkPrediction) {
      return;
    }

    const rows = [
      ['row_index', 'text', 'prediction', 'confidence'],
      ...bulkPrediction.results.map((item) => [
        item.row_index,
        `"${item.text.replace(/"/g, '""')}"`,
        item.prediction,
        item.confidence.toFixed(4),
      ]),
    ];

    const csvContent = rows.map((row) => row.join(',')).join('\n');
    const blob = new Blob([csvContent], { type: 'text/csv;charset=utf-8;' });
    const url = window.URL.createObjectURL(blob);
    const link = document.createElement('a');
    link.href = url;
    link.download = `bulk-predictions-${Date.now()}.csv`;
    document.body.appendChild(link);
    link.click();
    link.remove();
    window.URL.revokeObjectURL(url);
  };

  const emotion = prediction?.prediction ?? 'Positive';
  const style = sentimentStyles[emotion];
  const percentage = prediction ? Math.round(prediction.confidence * 100) : 0;
  const bulkSentimentBreakdown = bulkPrediction
    ? ['Positive', 'Negative', 'Neutral', 'Irrelevant'].map((label) => {
        const count = bulkPrediction.results.filter((item) => item.prediction === label).length;
        const percent = bulkPrediction.results.length ? Math.round((count / bulkPrediction.results.length) * 100) : 0;
        return { label, count, percent };
      })
    : [];
  const activeResultStyle = mode === 'bulk' && bulkPrediction ? { border: 'border-white/10', text: 'text-accent', bar: 'bg-accent' } : style;

  return (
    <motion.div
      initial={{ opacity: 0, y: 20 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ duration: 0.55, ease: 'easeOut' }}
      className="relative overflow-hidden rounded-[2rem] border border-white/10 bg-[#11172a] p-6 shadow-card"
    >
      <div className="absolute left-0 top-1/2 h-72 w-72 -translate-y-1/2 rounded-full bg-accent/10 blur-3xl" />
      <div className="relative grid gap-5 lg:grid-cols-[1.15fr_0.85fr]">
        <div className="rounded-[1.5rem] border border-white/10 bg-surface/70 p-5 shadow-soft">
          <div className="flex flex-wrap items-center justify-between gap-3">
            <div>
              <p className="text-sm uppercase tracking-[0.26em] text-muted">Choose your workflow</p>
              <p className="mt-2 text-sm text-muted">Analyze one sentence or process a whole Excel sheet in one go.</p>
            </div>
            <div className="inline-flex rounded-full border border-white/10 bg-night/70 p-1">
              <button
                type="button"
                onClick={() => setMode('single')}
                className={`rounded-full px-4 py-2 text-sm font-medium transition ${mode === 'single' ? 'bg-accent text-white shadow-glow' : 'text-muted hover:text-white'}`}
              >
                Single Sentence
              </button>
              <button
                type="button"
                onClick={() => setMode('bulk')}
                className={`rounded-full px-4 py-2 text-sm font-medium transition ${mode === 'bulk' ? 'bg-accent text-white shadow-glow' : 'text-muted hover:text-white'}`}
              >
                Excel Upload
              </button>
            </div>
          </div>

          {mode === 'single' ? (
            <div className="mt-6 rounded-[1.5rem] border border-white/10 bg-night/70 p-5">
              <div className="flex items-center gap-2 text-sm text-accent">
                <Sparkles className="h-4 w-4" />
                <span>Fast single-text sentiment analysis</span>
              </div>
              <textarea
                value={input}
                onChange={(event) => setInput(event.target.value)}
                onKeyDown={handleKeyDown}
                rows={5}
                className="mt-4 w-full resize-none rounded-2xl border border-white/10 bg-[#0b1120] p-4 text-[0.95rem] leading-7 text-white outline-none transition focus:border-accent focus:ring-2 focus:ring-accent/20 placeholder:text-slate-400/90 placeholder:font-medium"
                placeholder="Write a sentence you want to understand..."
              />
              <div className="mt-4 flex items-center justify-between gap-4 text-sm text-muted">
                <button
                  type="button"
                  onClick={onClear}
                  disabled={isLoading}
                  className="rounded-full border border-accent/20 bg-accent/10 px-4 py-2 text-white transition hover:bg-accent/15 disabled:cursor-not-allowed disabled:opacity-60"
                >
                  Clear
                </button>
                <span>{characters} characters</span>
              </div>
              <div className="mt-5 text-right">
                <button
                  type="button"
                  onClick={onSubmit}
                  disabled={isLoading || input.trim().length === 0}
                  className="inline-flex items-center justify-center gap-3 rounded-full bg-accent px-6 py-3 text-sm font-semibold text-white shadow-glow transition hover:bg-blue-500 disabled:cursor-not-allowed disabled:opacity-60"
                >
                  {isLoading ? <Loader2 className="h-4 w-4 animate-spin" /> : null}
                  Analyze
                </button>
              </div>
            </div>
          ) : (
            <div className="mt-6 rounded-[1.5rem] border border-white/10 bg-night/70 p-5">
              <div className="flex items-center gap-2 text-sm text-accent">
                <Upload className="h-4 w-4" />
                <span>Bulk classification for spreadsheets or CSV files</span>
              </div>
              <div className="mt-5 rounded-[1.25rem] border border-dashed border-white/10 bg-[#0b1120] p-4">
                <div className="flex flex-wrap items-center justify-between gap-3">
                  <div>
                    <p className="text-sm uppercase tracking-[0.26em] text-muted">Upload Data</p>
                    <p className="mt-2 text-sm text-muted">Drop in a spreadsheet or CSV with a text column such as text, sentence, review, or content.</p>
                  </div>
                  <button
                    type="button"
                    onClick={onUpload}
                    disabled={isUploading || !selectedFile}
                    className="inline-flex items-center justify-center gap-2 rounded-full border border-accent/20 bg-accent/10 px-4 py-2 text-sm font-medium text-white transition hover:bg-accent/15 disabled:cursor-not-allowed disabled:opacity-60"
                  >
                    {isUploading ? <Loader2 className="h-4 w-4 animate-spin" /> : <Upload className="h-4 w-4" />}
                    Upload
                  </button>
                </div>

                <label className="mt-4 flex cursor-pointer items-center justify-center rounded-2xl border border-dashed border-white/10 bg-white/5 px-4 py-4 text-sm text-white/80 transition hover:bg-white/10">
                  <input
                    type="file"
                    accept=".xlsx,.xls,.csv"
                    className="sr-only"
                    onChange={(event) => onFileSelect(event.target.files?.[0] ?? null)}
                  />
                  <span className="font-medium tracking-wide text-white/90">{selectedFile ? selectedFile.name : 'Choose Excel or CSV file (.xlsx, .xls, .csv)'}</span>
                </label>
              </div>

              {bulkError ? (
                <div className="mt-3 rounded-2xl border border-rose-400/20 bg-rose-500/10 px-3 py-2 text-sm text-rose-200">
                  {bulkError}
                </div>
              ) : null}

              {bulkPrediction ? (
                <div className="mt-3 rounded-2xl border border-white/10 bg-white/5 px-3 py-3 text-sm text-muted">
                  <div className="flex flex-wrap items-center justify-between gap-3">
                    <p className="text-white">
                      Processed {bulkPrediction.processed_rows} of {bulkPrediction.total_rows} rows.
                    </p>
                    <button
                      type="button"
                      onClick={handleDownloadCsv}
                      className="rounded-full border border-accent/20 bg-accent/10 px-3 py-2 text-xs font-semibold uppercase tracking-[0.2em] text-white transition hover:bg-accent/15"
                    >
                      Download CSV
                    </button>
                  </div>
                  <div className="mt-2 flex flex-wrap gap-2">
                    {bulkPrediction.results.slice(0, 6).map((item) => (
                      <span key={`${item.row_index}-${item.prediction}`} className="rounded-full border border-white/10 bg-night/80 px-3 py-1 text-xs text-white/80">
                        {item.prediction}
                      </span>
                    ))}
                  </div>
                </div>
              ) : null}
            </div>
          )}

          {error ? (
            <div className="mt-5 rounded-3xl border border-rose-400/20 bg-rose-500/10 px-4 py-3 text-sm text-rose-200">
              {error}
            </div>
          ) : null}
        </div>

        <div
          className={`flex min-h-[200px] flex-col justify-between rounded-[1.5rem] border ${activeResultStyle.border} bg-[#0f162a]/80 p-5 text-white shadow-soft`}
        >
          {mode === 'bulk' && bulkPrediction ? (
            <>
              <div>
                <p className={`text-sm uppercase tracking-[0.26em] ${activeResultStyle.text}`}>Bulk sentiment breakdown</p>
                <div className="mt-4 flex items-end justify-between gap-6">
                  <div>
                    <p className="text-3xl font-semibold leading-none">{bulkPrediction.processed_rows}</p>
                    <p className="mt-2 text-sm text-muted">rows analyzed</p>
                  </div>
                  <div className="rounded-full border border-white/10 bg-white/5 px-3 py-2 text-sm text-muted">
                    {bulkPrediction.total_rows} total
                  </div>
                </div>
              </div>
              <div className="mt-6 space-y-3">
                {bulkSentimentBreakdown.map((item) => (
                  <div key={item.label}>
                    <div className="mb-1 flex items-center justify-between text-sm">
                      <span className="text-white/80">{item.label}</span>
                      <span className={activeResultStyle.text}>{item.percent}%</span>
                    </div>
                    <div className="h-2 overflow-hidden rounded-full bg-white/10">
                      <div className={`h-full rounded-full ${activeResultStyle.bar}`} style={{ width: `${item.percent}%` }} />
                    </div>
                  </div>
                ))}
              </div>
            </>
          ) : prediction ? (
            <>
              <div>
                <p className={`text-sm uppercase tracking-[0.26em] ${style.text}`}>{prediction.prediction}</p>
                <div className="mt-6 flex items-end justify-between gap-6">
                  <p className="text-5xl font-semibold leading-none">{percentage}%</p>
                </div>
              </div>
              <div className="mt-8 rounded-full border border-white/10 bg-white/5 p-2">
                <div className="relative h-4 overflow-hidden rounded-full bg-white/10">
                  <motion.div
                    initial={{ width: 0 }}
                    animate={{ width: `${percentage}%` }}
                    transition={{ duration: 0.8, ease: 'easeOut' }}
                    className={`h-full rounded-full ${style.bar}`}
                  />
                </div>
              </div>
              <div className="mt-4 flex items-center gap-3 text-sm text-muted">
                <span className={style.text}>Success</span>
                <span>Prediction complete</span>
              </div>
            </>
          ) : (
            <div className="flex h-full flex-col items-center justify-center rounded-[1.75rem] border border-dashed border-white/10 bg-black/20 p-6 text-center text-sm text-muted">
              <p className="mb-3 text-white">Enter text and analyze to see the sentiment result.</p>
              <p>Press Enter to submit, Shift+Enter for a newline.</p>
            </div>
          )}
        </div>
      </div>
    </motion.div>
  );
}
