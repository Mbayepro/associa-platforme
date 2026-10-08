'use client';

import { motion, Variants } from 'framer-motion';
import Link from 'next/link';

const container: Variants = {
  hidden: { opacity: 0 },
  show: {
    opacity: 1,
    transition: {
      staggerChildren: 0.1
    }
  }
};

const item: Variants = {
  hidden: { opacity: 0, y: 20 },
  show: { opacity: 1, y: 0, transition: { type: "spring", stiffness: 300, damping: 24 } }
};

export function AnimatedKPIGrid({ children }: { children: React.ReactNode }) {
  return (
    <motion.div 
      variants={container}
      initial="hidden"
      animate="show"
      className="grid grid-cols-2 gap-4 sm:grid-cols-3 lg:grid-cols-6"
    >
      {children}
    </motion.div>
  );
}

export function AnimatedKPICard({
  label,
  value,
  icon,
  href,
  color,
}: {
  label: string;
  value: string | number;
  icon: React.ReactNode;
  href: string;
  color: string;
}) {
  return (
    <motion.div variants={item}>
      <Link href={href} className="block h-full group rounded-2xl border border-neutral-200/60 dark:border-neutral-800 bg-white/50 backdrop-blur-xl dark:bg-neutral-900/50 p-5 shadow-sm transition-all hover:-translate-y-1 hover:shadow-md hover:border-brand-primary/30">
        <div className="flex items-start justify-between">
          <div className={`flex h-10 w-10 items-center justify-center rounded-xl ${color} transition-transform duration-300 group-hover:scale-110 group-hover:rotate-3`}>
            {icon}
          </div>
        </div>
        <div className="mt-4">
          <p className="text-2xl sm:text-3xl font-bold tracking-tight text-neutral-900 dark:text-white">{value}</p>
          <p className="text-xs font-medium text-neutral-500 dark:text-neutral-400 mt-1">{label}</p>
        </div>
      </Link>
    </motion.div>
  );
}
