import { motion } from 'framer-motion';

const Skeleton = ({ className }) => {
  return (
    <div className={`relative overflow-hidden bg-[var(--bg-surface)] rounded-2xl ${className}`}>
      <motion.div
        animate={{
          x: ['-100%', '100%'],
        }}
        transition={{
          duration: 1.5,
          repeat: Infinity,
          ease: 'linear',
        }}
        className="absolute inset-0 bg-gradient-to-r from-transparent via-[rgba(255,255,255,0.03)] to-transparent"
      />
    </div>
  );
};

export const ArticleSkeleton = () => (
  <div className="md:col-span-4 h-full glass-panel rounded-3xl p-8 border border-[var(--border)]">
    <Skeleton className="h-64 w-full mb-6" />
    <Skeleton className="h-4 w-1/3 mb-4" />
    <Skeleton className="h-8 w-full mb-4" />
    <Skeleton className="h-20 w-full" />
  </div>
);

export default Skeleton;
