import { useRef, useState, useEffect } from 'react';
import { motion } from 'framer-motion';
import { ArrowLeft, ArrowRight } from 'lucide-react';
import ArticleCard from './ArticleCard';

const NewsCarousel = ({ posts }) => {
  const containerRef = useRef(null);
  const [scrollProgress, setScrollProgress] = useState(0);

  const scroll = (direction) => {
    if (containerRef.current) {
      const scrollAmount = 300; // Match card width + gap
      const scrollTo = direction === 'left' 
        ? containerRef.current.scrollLeft - scrollAmount 
        : containerRef.current.scrollLeft + scrollAmount;
      containerRef.current.scrollTo({ left: scrollTo, behavior: 'smooth' });
    }
  };

  const handleScroll = () => {
    if (containerRef.current) {
      const { scrollLeft, scrollWidth, clientWidth } = containerRef.current;
      setScrollProgress(scrollLeft / (scrollWidth - clientWidth));
    }
  };

  return (
    <div className="relative w-full overflow-hidden py-16">
      <div className="flex items-end justify-between mb-10 border-b border-[var(--border)] pb-6 mx-2">
        <div className="flex flex-col gap-1">
          <span className="text-[8px] font-mono text-[var(--accent-cyan)] tracking-[.5em] uppercase block">Intelligence_Feed</span>
          <h2 className="text-xl font-medium tracking-tighter uppercase">RECENT_DATA_LOGS</h2>
        </div>
        
        <div className="flex gap-4">
          <button 
            onClick={() => scroll('left')}
            className="w-8 h-8 glass-panel border border-[var(--border)] flex items-center justify-center hover:border-[var(--accent-cyan)] hover:text-white transition-all text-[var(--text-dim)]"
          >
            <ArrowLeft size={16} />
          </button>
          <button 
            onClick={() => scroll('right')}
            className="w-8 h-8 glass-panel border border-[var(--border)] flex items-center justify-center hover:border-[var(--accent-cyan)] hover:text-white transition-all text-[var(--text-dim)]"
          >
            <ArrowRight size={16} />
          </button>
        </div>
      </div>

      <div 
        ref={containerRef}
        onScroll={handleScroll}
        className="flex gap-6 overflow-x-auto snap-x snap-mandatory scrollbar-hide px-2 pb-6"
        style={{ scrollbarWidth: 'none', msOverflowStyle: 'none' }}
      >
        {posts.map((post) => (
          <div key={post.id} className="snap-start">
            <ArticleCard post={post} variant="compact" />
          </div>
        ))}
      </div>

      {/* Subtle Progress Bar */}
      <div className="mx-2 h-[1px] bg-[var(--border)] relative">
        <motion.div 
          className="absolute h-[2px] bg-[var(--accent-cyan)] -top-[0.5px] left-0 transition-all duration-300"
          style={{ width: `${(scrollProgress * 100) || 0}%` }}
        />
      </div>
    </div>
  );
};

export default NewsCarousel;
