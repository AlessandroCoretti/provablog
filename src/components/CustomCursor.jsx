import { useEffect, useRef } from 'react';
import gsap from 'gsap';

const CustomCursor = () => {
  const dotRef  = useRef(null);
  const ringRef = useRef(null);

  useEffect(() => {
    const dot  = dotRef.current;
    const ring = ringRef.current;

    gsap.set([dot, ring], { xPercent: -50, yPercent: -50 });

    const onMove = ({ clientX: x, clientY: y }) => {
      gsap.to(dot,  { x, y, duration: 0.08, ease: 'none',      overwrite: true });
      gsap.to(ring, { x, y, duration: 0.45, ease: 'power3.out', overwrite: true });
    };

    const onEnter = () => {
      gsap.to(ring, { scale: 1.7, borderColor: 'rgba(0,255,127,0.35)', duration: 0.3, ease: 'power2.out', overwrite: true });
      gsap.to(dot,  { scale: 0,                                          duration: 0.2, overwrite: true });
    };

    const onLeave = () => {
      gsap.to(ring, { scale: 1, borderColor: 'rgba(0,255,127,0.55)', duration: 0.35, ease: 'power2.out', overwrite: true });
      gsap.to(dot,  { scale: 1,                                        duration: 0.25, overwrite: true });
    };

    const onClick = () => {
      gsap.timeline()
        .to(dot, { scale: 2.5, opacity: 0.6, duration: 0.1,  ease: 'power2.out' })
        .to(dot, { scale: 1,   opacity: 1,   duration: 0.35, ease: 'elastic.out(1,0.5)' });
    };

    window.addEventListener('mousemove', onMove);
    window.addEventListener('click', onClick);

    const targets = document.querySelectorAll('a, button, .interactive, input, textarea');
    targets.forEach(el => {
      el.addEventListener('mouseenter', onEnter);
      el.addEventListener('mouseleave', onLeave);
    });

    return () => {
      window.removeEventListener('mousemove', onMove);
      window.removeEventListener('click', onClick);
      targets.forEach(el => {
        el.removeEventListener('mouseenter', onEnter);
        el.removeEventListener('mouseleave', onLeave);
      });
    };
  }, []);

  return (
    <>
      <div ref={ringRef} className="cursor-ring" style={{ top: 0, left: 0 }} />
      <div ref={dotRef}  className="cursor-dot"  style={{ top: 0, left: 0 }} />
    </>
  );
};

export default CustomCursor;
