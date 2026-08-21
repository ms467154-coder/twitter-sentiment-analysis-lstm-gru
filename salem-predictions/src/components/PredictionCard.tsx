import { motion } from 'framer-motion';
import { CheckCircle2 } from 'lucide-react';

export function PredictionCard() {
  return (
    <motion.div
      initial={{ opacity: 0, scale: 0.96 }}
      animate={{ opacity: 1, scale: 1 }}
      transition={{ duration: 0.55, ease: 'easeOut' }}
      className="relative overflow-hidden rounded-[2rem] border border-white/10 bg-[#11172a] p-8 shadow-card"
    >
      <div className="absolute left-0 top-1/2 h-72 w-72 -translate-y-1/2 rounded-full bg-accent/10 blur-3xl" />
      <div className="relative grid gap-6 lg:grid-cols-[1.2fr_0.8fr]">
        <div className="rounded-[1.75rem] border border-white/10 bg-surface/70 p-6 shadow-soft">
          <p className="text-sm uppercase tracking-[0.26em] text-muted">Type your sentence...</p>
          <div className="mt-6 min-h-[180px] rounded-3xl border border-white/10 bg-night/80 p-6 text-sm leading-7 text-muted">
            I love this product! Everything works perfectly.
          </div>
          <div className="mt-5 flex items-center gap-4 text-sm text-muted">
            <button className="rounded-full border border-accent/20 bg-accent/10 px-4 py-2 text-white transition hover:bg-accent/15">
              Clear
            </button>
            <span>Pred. 2ms ago</span>
          </div>
        </div>

        <div className="flex min-h-[220px] flex-col justify-between rounded-[1.75rem] border border-white/10 bg-[#0f162a]/80 p-6 text-white shadow-soft">
          <div>
            <p className="text-sm uppercase tracking-[0.26em] text-accent/80">Positive</p>
            <div className="mt-6 flex items-end justify-between gap-6">
              <p className="text-5xl font-semibold leading-none">98.2%</p>
            </div>
          </div>
          <div className="mt-8 rounded-full border border-white/10 bg-white/5 p-2">
            <div className="relative h-4 overflow-hidden rounded-full bg-white/10">
              <div className="h-full w-[72%] rounded-full bg-accent" />
            </div>
          </div>
          <div className="mt-4 flex items-center gap-3 text-sm text-muted">
            <CheckCircle2 size={18} className="text-accent" />
            <span>Pred. 2ms ago</span>
          </div>
        </div>
      </div>
    </motion.div>
  );
}
