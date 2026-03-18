import { useRef, useEffect } from 'react';
import gsap from 'gsap';
import { ArrowDown } from 'lucide-react';

const InteractiveHero = () => {
  const heroRef = useRef(null);
  const titleRef = useRef(null);
  const bgRef = useRef(null);

  useEffect(() => {
    const hero = heroRef.current;
    
    // GSAP Introduction
    const ctx = gsap.context(() => {
      gsap.from(".hero-reveal", {
        opacity: 0,
        y: 40,
        stagger: 0.1,
        duration: 1.2,
        ease: "power4.out"
      });

      // Simple mouse-follow for the background pattern
      const onMove = (e) => {
        const { clientX, clientY } = e;
        const xPercent = (clientX / window.innerWidth - 0.5) * 20;
        const yPercent = (clientY / window.innerHeight - 0.5) * 20;
        
        gsap.to(bgRef.current, {
          x: xPercent,
          y: yPercent,
          rotateX: -yPercent / 2,
          rotateY: xPercent / 2,
          duration: 1,
          ease: "power2.out"
        });
      };

      window.addEventListener('mousemove', onMove);
      return () => window.removeEventListener('mousemove', onMove);
    }, hero);

    return () => ctx.revert();
  }, []);

  return (
    <section 
      ref={heroRef}
      className="relative min-h-[90vh] flex flex-col items-center justify-center text-center px-8 overflow-hidden border-b border-[var(--border)]"
    >
      {/* Background Decor */}
      <div 
        ref={bgRef}
        className="absolute inset-x-[-10%] inset-y-[-10%] pointer-events-none opacity-20"
        style={{ perspective: '1000px' }}
      >
        <div className="absolute inset-0 bg-[radial-gradient(circle_at_50%_50%,var(--accent-soft)_0%,transparent_70%)]" />
        <div 
          className="absolute inset-0" 
          style={{ 
            backgroundImage: 'linear-gradient(var(--border) 1px, transparent 1px), linear-gradient(90deg, var(--border) 1px, transparent 1px)',
            backgroundSize: '80px 80px',
            maskImage: 'radial-gradient(circle at 50% 50%, black 20%, transparent 80%)'
          }} 
        />
      </div>

      {/* Content */}
      <div className="relative z-10 max-w-5xl">
        <span className="hero-reveal inline-block px-3 py-1 glass rounded-full text-[9px] font-display font-bold tracking-[0.4em] text-[var(--accent)] mb-8">
          INTELLIGENCE_DEPLOYED // 202X
        </span>
        
        <h1 ref={titleRef} className="hero-reveal text-7xl md:text-9xl font-bold uppercase tracking-tight mb-10 leading-[0.85]">
          Architecting<br />
          <span className="text-[var(--text-dim)]">The Future.</span>
        </h1>

        <p className="hero-reveal text-lg text-[var(--text-secondary)] max-w-2xl mx-auto mb-16 font-light leading-relaxed">
          The definitive stream of high-status corporate intelligence and next-gen technological paradigms. 
          Step into the command center of tomorrow.
        </p>

        <div className="hero-reveal flex flex-wrap justify-center gap-8">
          <button className="interactive px-12 py-4 bg-white text-black font-display font-bold text-xs tracking-widest uppercase hover:bg-[var(--accent)] transition-colors">
            INITIALIZE_SYNC
          </button>
          <button className="interactive px-12 py-4 border border-[var(--border)] text-white font-display font-bold text-xs tracking-widest uppercase hover:border-white transition-colors">
            VIEW_ARCHIVE
          </button>
        </div>
      </div>

      {/* Floating Meta Data */}
      <div className="absolute bottom-10 left-10 flex flex-col gap-1 text-[8px] font-mono text-[var(--text-dim)] uppercase tracking-widest">
        <span>Region: EU_NORTH_01</span>
        <span>Lat: 52.3676° N</span>
        <span>Lon: 4.9041° E</span>
      </div>

      <div className="absolute bottom-10 right-10 animate-bounce opacity-20">
        <ArrowDown size={20} />
      </div>
    </section>
  );
};

export default InteractiveHero;
