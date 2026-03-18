import { useRef, useEffect } from 'react';
import gsap from 'gsap';
import { ScrollTrigger } from 'gsap/ScrollTrigger';
import { ArrowRight, ArrowLeft } from 'lucide-react';
import ArticleCard from './ArticleCard';

gsap.registerPlugin(ScrollTrigger);

const CategoryCarousel = ({ category, posts }) => {
  const containerRef = useRef(null);
  const scrollRef = useRef(null);

  useEffect(() => {
    const container = containerRef.current;
    
    const ctx = gsap.context(() => {
      gsap.from(".carousel-header", {
        scrollTrigger: {
          trigger: container,
          start: "top 80%",
        },
        opacity: 0,
        x: -40,
        duration: 1,
        ease: "power3.out"
      });

      gsap.from(".category-card", {
        scrollTrigger: {
          trigger: container,
          start: "top 80%",
        },
        opacity: 0,
        x: 60,
        stagger: 0.1,
        duration: 1.2,
        ease: "power2.out"
      });
    }, container);

    return () => ctx.revert();
  }, []);

  const scrollLeft = () => {
    scrollRef.current.scrollBy({ left: -400, behavior: 'smooth' });
  };

  const scrollRight = () => {
    scrollRef.current.scrollBy({ left: 400, behavior: 'smooth' });
  };

  return (
    <div ref={containerRef} className="py-24 border-b border-[var(--border)] overflow-hidden">
      <div className="container-max flex items-end justify-between mb-12 carousel-header">
        <div>
          <span className="text-[10px] font-mono text-[var(--accent)] tracking-[0.4em] uppercase mb-2 block">Sect_Protocol</span>
          <h2 className="text-4xl font-bold uppercase tracking-tighter">{category}</h2>
        </div>
        <div className="flex gap-4">
          <button onClick={scrollLeft} className="interactive w-12 h-12 glass rounded-full flex items-center justify-center hover:border-[var(--accent)] transition-all">
            <ArrowLeft size={18} />
          </button>
          <button onClick={scrollRight} className="interactive w-12 h-12 glass rounded-full flex items-center justify-center hover:border-[var(--accent)] transition-all">
            <ArrowRight size={18} />
          </button>
        </div>
      </div>

      <div 
        ref={scrollRef}
        className="flex gap-8 overflow-x-auto scrollbar-hide px-[4vw] pb-10 snap-x snap-mandatory"
        style={{ scrollbarWidth: 'none', msOverflowStyle: 'none' }}
      >
        {posts.map((post) => (
          <div key={post.id} className="category-card snap-start">
            <ArticleCard post={post} variant="standard" />
          </div>
        ))}
      </div>
    </div>
  );
};

export default CategoryCarousel;
