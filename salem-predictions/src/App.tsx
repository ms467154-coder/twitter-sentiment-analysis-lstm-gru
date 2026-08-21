import { FormEvent, useState } from 'react';
import { Activity, ArrowUpRight, BrainCircuit, Check, ChevronRight, Database, Gauge, Menu, Network, ShieldCheck, Sparkles, X } from 'lucide-react';
import './index.css';

type ModelPrediction = { model: string; available: boolean; prediction?: string; confidence?: number; note?: string };
type PredictionResponse = { text: string; lstm: ModelPrediction; gru: ModelPrediction };
type BatchItem = { row_index: number; text: string; prediction: string; confidence: number };
type BatchResponse = { total_rows: number; processed_rows: number; results: BatchItem[] };

const API_URL = 'http://localhost:8001';
const classColors: Record<string, string> = { Positive: 'positive', Negative: 'negative', Neutral: 'neutral', Irrelevant: 'irrelevant' };

function ModelCard({ result }: { result: ModelPrediction }) {
  const tone = result.prediction ? classColors[result.prediction] ?? 'neutral' : 'muted';
  return <article className={`model-card ${result.available ? '' : 'unavailable'}`}>
    <div className="model-card-top"><span className="model-chip">{result.model}</span><span className={`status-dot ${result.available ? 'online' : ''}`}>{result.available ? 'LIVE' : 'OFFLINE'}</span></div>
    {result.available ? <><p className="model-label">Predicted sentiment</p><div className={`prediction ${tone}`}>{result.prediction}</div><div className="confidence-row"><span>Confidence</span><strong>{result.confidence !== undefined ? `${(result.confidence * 100).toFixed(1)}%` : '—'}</strong></div><div className="confidence-track"><span style={{ width: `${(result.confidence ?? 0) * 100}%` }} /></div></> : <><div className="unavailable-mark"><X size={22} /></div><h3>Artifact not available</h3><p className="muted-copy">{result.note}</p></>}
  </article>;
}

function App() {
  const [text, setText] = useState('I absolutely love this new update!');
  const [result, setResult] = useState<PredictionResponse | null>(null);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');
  const [mobileNav, setMobileNav] = useState(false);
  const [batchFile, setBatchFile] = useState<File | null>(null);
  const [batchResult, setBatchResult] = useState<BatchResponse | null>(null);
  const [batchLoading, setBatchLoading] = useState(false);
  const [batchError, setBatchError] = useState('');

  async function analyze(event?: FormEvent) {
    event?.preventDefault();
    if (!text.trim()) return;
    setLoading(true); setError('');
    try {
      const response = await fetch(`${API_URL}/api/predict`, { method: 'POST', headers: { 'Content-Type': 'application/json' }, body: JSON.stringify({ text }) });
      const data = await response.json();
      if (!response.ok) throw new Error(data.detail ?? 'Prediction failed');
      setResult(data);
    } catch (err) { setError(err instanceof Error ? err.message : 'Could not reach the inference service.'); }
    finally { setLoading(false); }
  }

  async function analyzeBatch() {
    if (!batchFile) return;
    setBatchLoading(true); setBatchError(''); setBatchResult(null);
    try {
      const formData = new FormData();
      formData.append('file', batchFile);
      const response = await fetch(`${API_URL}/api/predict-bulk`, { method: 'POST', body: formData });
      const data = await response.json();
      if (!response.ok) throw new Error(data.detail ?? 'Batch analysis failed');
      setBatchResult(data);
    } catch (err) { setBatchError(err instanceof Error ? err.message : 'Could not analyze this file.'); }
    finally { setBatchLoading(false); }
  }

  function downloadBatch() {
    if (!batchResult) return;
    const csv = ['row_index,text,prediction,confidence', ...batchResult.results.map(row => `${row.row_index},"${row.text.replace(/"/g, '""')}",${row.prediction},${row.confidence}`)].join('\\n');
    const url = URL.createObjectURL(new Blob([csv], { type: 'text/csv;charset=utf-8' }));
    const link = document.createElement('a'); link.href = url; link.download = 'sentiment_predictions.csv'; link.click(); URL.revokeObjectURL(url);
  }

  return <div className="app-shell">
    <header className="topbar"><a className="brand" href="#top"><span className="brand-mark"><BrainCircuit size={21} /></span><span>Salem<span className="brand-accent">/</span>Predictions</span></a><button className="mobile-toggle" onClick={() => setMobileNav(!mobileNav)}><Menu size={20} /></button><nav className={mobileNav ? 'open' : ''}><a href="#analyze" onClick={() => setMobileNav(false)}>Analyze</a><a href="#comparison" onClick={() => setMobileNav(false)}>Comparison</a><a href="#method" onClick={() => setMobileNav(false)}>Method</a><a className="nav-cta" href="#analyze">Run inference <ArrowUpRight size={16} /></a></nav></header>
    <main id="top">
      <section className="hero" id="analyze"><div className="hero-copy"><div className="eyebrow"><span className="pulse" /> Deep learning inference lab</div><h1>Read the signal<br /><em>behind the words.</em></h1><p className="hero-text">A focused workspace for Twitter sentiment analysis, powered by the preserved LSTM model from the original NLP research.</p><div className="hero-meta"><span><Check size={15} /> Four sentiment classes</span><span><Check size={15} /> Pretrained artifact</span></div></div><div className="analysis-panel"><div className="panel-heading"><div><span className="kicker">Live inference</span><h2>Analyze a text sample</h2></div><span className="panel-id">01 / 03</span></div><form onSubmit={analyze}><label htmlFor="tweet">Your text</label><textarea id="tweet" value={text} onChange={e => setText(e.target.value)} maxLength={1000} placeholder="Write a tweet or sentence..." /><div className="form-footer"><span>{text.length} / 1000 characters</span><button className="primary-button" disabled={loading || !text.trim()}>{loading ? 'Analyzing...' : 'Analyze sentiment'} <ChevronRight size={17} /></button></div></form>{error && <div className="error-box">{error}</div>}</div></section>
      <section className="results-section" id="comparison"><div className="section-intro"><div><span className="kicker">Model comparison</span><h2>Two architectures.<br /><em>One clear read.</em></h2></div><p>Results are returned directly from the available persisted artifact. Missing models are marked explicitly—never simulated.</p></div>{result ? <div className="result-grid"><ModelCard result={result.lstm} /><ModelCard result={result.gru} /></div> : <div className="empty-result"><Activity size={20} /><span>Run an analysis to populate the comparison workspace.</span></div>}</section>
      <section className="batch-section" id="batch"><div className="section-intro"><div><span className="kicker">Batch analysis</span><h2>Analyze every<br /><em>row at once.</em></h2></div><p>Upload a CSV, Excel workbook, or JSON array. The selected text column is sent through the same preserved LSTM pipeline, one row at a time.</p></div><div className="batch-panel"><div className="upload-zone"><input id="batch-file" type="file" accept=".csv,.xlsx,.xls,.json,application/json,text/csv,application/vnd.openxmlformats-officedocument.spreadsheetml.sheet" onChange={e => { setBatchFile(e.target.files?.[0] ?? null); setBatchResult(null); setBatchError(''); }} /><label htmlFor="batch-file"><Sparkles size={22} /><strong>{batchFile ? batchFile.name : 'Choose a data file'}</strong><span>{batchFile ? `${(batchFile.size / 1024).toFixed(1)} KB ready to analyze` : 'CSV, XLSX, XLS, or JSON · one text column required'}</span></label></div><div className="batch-actions"><button className="primary-button" onClick={analyzeBatch} disabled={!batchFile || batchLoading}>{batchLoading ? 'Analyzing rows...' : 'Analyze file'} <ChevronRight size={17} /></button>{batchResult && <button className="secondary-button" onClick={downloadBatch}>Download predictions</button>}</div>{batchError && <div className="error-box">{batchError}</div>}{batchResult && <div className="batch-output"><div className="batch-summary"><span><strong>{batchResult.processed_rows}</strong> rows analyzed</span><span><strong>{batchResult.total_rows}</strong> total rows</span></div><div className="table-wrap"><table><thead><tr><th>Row</th><th>Text</th><th>Prediction</th><th>Confidence</th></tr></thead><tbody>{batchResult.results.map(row => <tr key={row.row_index}><td>{row.row_index + 1}</td><td className="row-text">{row.text}</td><td><span className={`table-pill ${classColors[row.prediction] ?? 'neutral'}`}>{row.prediction}</span></td><td>{(row.confidence * 100).toFixed(1)}%</td></tr>)}</tbody></table></div></div>}</div></section>
      <section className="stats-strip"><div><span className="stat-value">100</span><span className="stat-label">Max sequence length</span></div><div><span className="stat-value">128</span><span className="stat-label">Embedding dimensions</span></div><div><span className="stat-value">4</span><span className="stat-label">Output classes</span></div><div><span className="stat-value">1</span><span className="stat-label">Persisted model artifact</span></div></section>
      <section className="method-section" id="method"><div className="section-intro"><div><span className="kicker">System notes</span><h2>Research, made<br /><em>operational.</em></h2></div><p>The application is intentionally thin around the ML core: the notebook, tokenizer, padding contract, labels, and saved weights remain the source of truth.</p></div><div className="method-grid"><article><Database size={20} /><h3>Preserved pipeline</h3><p>Existing text cleaning, tokenization, pre-padding, label mapping, and LSTM weights are reused for inference.</p></article><article><Gauge size={20} /><h3>Transparent output</h3><p>Confidence is displayed only when it is returned by the model. No placeholder metrics or fabricated probabilities.</p></article><article><ShieldCheck size={20} /><h3>Production boundary</h3><p>FastAPI validates requests, loads the model once at startup, and returns a stable structured JSON contract.</p></article></div></section>
    </main><footer><div className="footer-brand"><span className="brand-mark"><Network size={18} /></span><strong>Salem / Predictions</strong></div><span>Twitter Sentiment Analysis — LSTM & GRU</span><span>React · FastAPI · TensorFlow</span></footer>
  </div>;
}
export default App;
