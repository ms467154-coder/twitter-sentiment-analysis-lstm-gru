import { motion } from 'framer-motion';
import type { FeatureCard } from '../types';

export function FeatureCard({ icon: Icon, title, description }: FeatureCard) {
  return (
    <motion.article
      initial={{ opacity: 0, y: 14 }}
      whileInView={{ opacity: 1, y: 0 }}
      viewport={{ once: true, amount: 0.4 }}
      transition={{ duration: 0.55, ease: 'easeOut' }}
      className="group rounded-3xl border border-white/10 bg-white/5 p-6 shadow-card transition hover:border-accent/30 hover:bg-white/10"
    >
      <div className="flex h-12 w-12 items-center justify-center rounded-3xl bg-accent/10 text-accent transition group-hover:bg-accent/15">
        <Icon size={20} />
      </div>
      <h3 className="mt-5 text-lg font-semibold text-white">{title}</h3>
      <p className="mt-3 text-sm leading-7 text-muted">{description}</p>
    </motion.article>
  );
}
