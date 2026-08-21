import { motion } from 'framer-motion';

type SectionHeadingProps = {
  title: string;
  subtitle?: string;
  align?: 'left' | 'center';
};

export function SectionHeading({ title, subtitle, align = 'center' }: SectionHeadingProps) {
  return (
    <motion.div
      initial={{ opacity: 0, y: 24 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ duration: 0.6, ease: 'easeOut' }}
      className={`max-w-3xl ${align === 'center' ? 'mx-auto text-center' : 'text-left'}`}
    >
      <p className="text-sm font-semibold uppercase tracking-[0.28em] text-accent mb-4">
        Salem Predictions
      </p>
      <h2 className="text-4xl md:text-5xl font-semibold leading-tight tracking-[-0.04em] text-white">
        {title}
      </h2>
      {subtitle ? (
        <p className="mt-4 text-base leading-8 text-muted">{subtitle}</p>
      ) : null}
    </motion.div>
  );
}
