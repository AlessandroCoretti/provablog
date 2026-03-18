import { useState, useEffect } from 'react';
import { Link, useLocation } from 'react-router-dom';

const Navbar = () => {
  const location  = useLocation();
  const [scrolled, setScrolled] = useState(false);

  useEffect(() => {
    const onScroll = () => setScrolled(window.scrollY > 20);
    window.addEventListener('scroll', onScroll, { passive: true });
    return () => window.removeEventListener('scroll', onScroll);
  }, []);

  const links = [
    { name: 'HOME',     path: '/' },
    { name: 'ARTICOLI', path: '/blog' },
  ];

  return (
    <nav style={{
      position: 'fixed',
      top: 0, left: 0,
      width: '100%',
      height: 'var(--header-h)',
      zIndex: 1000,
      display: 'flex',
      alignItems: 'center',
      justifyContent: 'space-between',
      padding: '0 clamp(20px, 4vw, 64px)',
      background: scrolled ? 'rgba(0,0,0,0.94)' : 'transparent',
      backdropFilter: scrolled ? 'blur(20px) saturate(1.5)' : 'none',
      WebkitBackdropFilter: scrolled ? 'blur(20px) saturate(1.5)' : 'none',
      borderBottom: `1px solid ${scrolled ? 'var(--border-light)' : 'transparent'}`,
      transition: 'background 0.35s ease, border-color 0.35s ease',
    }}>

      {/* Logo */}
      <Link to="/" className="interactive" style={{ display: 'inline-flex', alignItems: 'baseline', gap: 1 }}>
        <span style={{
          fontFamily: 'var(--font-display)',
          fontSize: 16,
          fontWeight: 800,
          color: 'var(--text-primary)',
          letterSpacing: '-0.03em',
        }}>
          Super
        </span>
        <span style={{
          fontFamily: 'var(--font-display)',
          fontSize: 16,
          fontWeight: 800,
          color: 'var(--accent)',
          letterSpacing: '-0.03em',
        }}>
          intelligenza
        </span>
      </Link>

      {/* Center nav */}
      <div style={{
        position: 'absolute',
        left: '50%',
        transform: 'translateX(-50%)',
        display: 'flex',
        alignItems: 'center',
        gap: 36,
      }}>
        {links.map(link => (
          <Link
            key={link.path}
            to={link.path}
            className={`interactive nav-link ${location.pathname === link.path ? 'active' : ''}`}
          >
            {link.name}
          </Link>
        ))}
      </div>

      {/* CTA */}
      <button
        className="interactive"
        style={{
          display: 'inline-flex', alignItems: 'center',
          padding: '7px 16px',
          borderRadius: 'var(--radius-pill)',
          border: '1px solid var(--accent-border)',
          fontFamily: 'var(--font-mono)', fontSize: 9, fontWeight: 400,
          letterSpacing: '0.1em', textTransform: 'uppercase',
          color: 'var(--accent)', background: 'transparent',
          transition: 'all 0.25s var(--ease)',
          boxShadow: '0 0 12px var(--accent-glow-sm)',
        }}
        onMouseEnter={e => {
          e.currentTarget.style.background = 'var(--accent)';
          e.currentTarget.style.color = '#000';
          e.currentTarget.style.boxShadow = '0 0 24px var(--accent-glow)';
        }}
        onMouseLeave={e => {
          e.currentTarget.style.background = 'transparent';
          e.currentTarget.style.color = 'var(--accent)';
          e.currentTarget.style.boxShadow = '0 0 12px var(--accent-glow-sm)';
        }}
      >
        CONTATTI
      </button>
    </nav>
  );
};

export default Navbar;
