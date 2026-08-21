import { motion } from 'framer-motion';
import { GitBranch } from 'lucide-react';

const navItems = ['Home', 'Documentation', 'Performance', 'GitHub', 'Contact'];

export function NavBar() {
  return (
    <motion.header
      initial={{ opacity: 0, y: -20 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ duration: 0.55, ease: 'easeOut' }}
      className="sticky top-0 z-30 border-b border-white/10 bg-night/90 backdrop-blur-xl"
    >
      <div className="mx-auto flex max-w-7xl items-center justify-between px-6 py-5 md:px-8">
        <div className="flex items-center gap-3 text-white">
          <div className="flex h-11 w-11 items-center justify-center rounded-2xl bg-white/10 text-accent shadow-card">
            <GitBranch size={20} />
          </div>
          <div>
            <p className="text-base font-semibold tracking-[0.04em]">Salem Predictions</p>
          </div>
        </div>

        <nav className="hidden items-center gap-8 md:flex">
          {navItems.map((item) => (
            <a key={item} href="#" className="text-sm font-medium text-muted transition hover:text-white">
              {item}
            </a>
          ))}
        </nav>

        <a
          href="#"
          className="hidden rounded-full bg-accent px-5 py-3 text-sm font-semibold text-white shadow-glow transition hover:bg-blue-500 md:inline-flex"
        >
          Get Started
        </a>
      </div>
    </motion.header>
  );
}
