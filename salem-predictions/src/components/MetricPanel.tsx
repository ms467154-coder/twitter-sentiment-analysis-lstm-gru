import { motion } from 'framer-motion';

type MetricPanelProps = {
  title: string;
  children: React.ReactNode;
};

export function MetricPanel({ title, children }: MetricPanelProps) {
  return (
    <motion.div
      initial={{ opacity: 0, y: 16 }}
      whileInView={{ opacity: 1, y: 0 }}
      viewport={{ once: true, amount: 0.45 }}
      transition={{ duration: 0.55, ease: 'easeOut' }}
      className="rounded-[2rem] border border-white/10 bg-white/5 p-6 shadow-card"
    >
      <p className="text-sm font-semibold uppercase tracking-[0.24em] text-muted">{title}</p>
      <div className="mt-6 min-h-[240px]">{children}</div>
    </motion.div>
  );
}
