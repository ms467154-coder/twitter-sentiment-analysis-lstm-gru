import { motion } from 'framer-motion';

type InfoCardProps = {
  label: string;
  value: string;
};

export function InfoCard({ label, value }: InfoCardProps) {
  return (
    <motion.div
      initial={{ opacity: 0, y: 16 }}
      whileInView={{ opacity: 1, y: 0 }}
      viewport={{ once: true, amount: 0.4 }}
      transition={{ duration: 0.55, ease: 'easeOut' }}
      className="rounded-3xl border border-white/10 bg-white/5 p-6 shadow-card"
    >
      <p className="text-sm uppercase tracking-[0.22em] text-muted">{label}</p>
      <p className="mt-4 text-xl font-semibold leading-tight text-white md:text-2xl">{value}</p>
    </motion.div>
  );
}
