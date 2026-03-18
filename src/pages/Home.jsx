import { useState, useMemo, useEffect, useRef } from 'react';
import gsap from 'gsap';
import { ScrollTrigger } from 'gsap/ScrollTrigger';
import { ArrowRight, ArrowDown } from 'lucide-react';
import { Link } from 'react-router-dom';
import { POSTS, CATEGORIES } from '../data/posts';
import Grainient from '../components/Grainient';

gsap.registerPlugin(ScrollTrigger);

/* ── Row item for the numbered article list ──────────────── */
const ArticleRow = ({ post, index }) => {
  const ref = useRef(null);
  return (
    <Link
      ref={ref}
      to={`/article/${post.id}`}
      className="interactive"
      style={{
        display: 'grid',
        gridTemplateColumns: '48px 1fr auto',
        alignItems: 'center',
        gap: 24,
        padding: '22px 0',
        borderBottom: '1px solid var(--border-light)',
        transition: 'background 0.2s',
        textDecoration: 'none',
      }}
      onMouseEnter={e => {
        e.currentTarget.style.background = 'rgba(0,255,127,0.02)';
        e.currentTarget.querySelector('.row-title').style.color = 'var(--accent)';
        e.currentTarget.querySelector('.row-arrow').style.opacity = '1';
        e.currentTarget.querySelector('.row-arrow').style.transform = 'translateX(4px)';
      }}
      onMouseLeave={e => {
        e.currentTarget.style.background = 'transparent';
        e.currentTarget.querySelector('.row-title').style.color = 'var(--text-primary)';
        e.currentTarget.querySelector('.row-arrow').style.opacity = '0.25';
        e.currentTarget.querySelector('.row-arrow').style.transform = 'translateX(0)';
      }}
    >
      {/* Index */}
      <span style={{
        fontFamily: 'var(--font-mono)', fontSize: 10, fontWeight: 400,
        color: 'var(--text-dim)', letterSpacing: '0.05em',
        userSelect: 'none',
      }}>
        {String(index + 2).padStart(2, '0')}
      </span>

      {/* Title + meta */}
      <div>
        <div style={{ display: 'flex', alignItems: 'center', gap: 10, marginBottom: 4 }}>
          <span className="cat-tag">{post.category}</span>
          <span style={{
            fontFamily: 'var(--font-mono)', fontSize: 9, color: 'var(--text-dim)', letterSpacing: '0.06em',
          }}>
            {post.date}
          </span>
        </div>
        <p
          className="row-title"
          style={{
            fontFamily: 'var(--font-display)', fontSize: 'clamp(1rem,1.5vw,1.25rem)',
            fontWeight: 700, color: 'var(--text-primary)', lineHeight: 1.15,
            letterSpacing: '-0.02em', transition: 'color 0.25s',
          }}
        >
          {post.title}
        </p>
      </div>

      {/* Arrow */}
      <ArrowRight
        className="row-arrow"
        size={16}
        style={{
          color: 'var(--text-secondary)', opacity: 0.25,
          transition: 'opacity 0.25s, transform 0.25s', flexShrink: 0,
        }}
      />
    </Link>
  );
};

/* ── Main component ──────────────────────────────────────── */
const Home = () => {
  const [selectedCategory, setSelectedCategory] = useState('ALL');
  const pageRef = useRef(null);

  useEffect(() => {
    window.scrollTo(0, 0);
    const ctx = gsap.context(() => {
      const tl = gsap.timeline({ defaults: { ease: 'power3.out' } });
      tl.from('.hero-eyebrow', { opacity: 0, y: 16, duration: 0.6 }, 0.1)
        .from('.hero-line-1',  { opacity: 0, y: 48, duration: 0.95 }, 0.25)
        .from('.hero-line-2',  { opacity: 0, y: 48, duration: 0.95 }, 0.35)
        .from('.hero-sub',     { opacity: 0, y: 16, duration: 0.6  }, 0.55)
        .from('.hero-pills',   { opacity: 0, y: 12, duration: 0.5  }, 0.7)
        .from('.hero-scroll',  { opacity: 0, y: 8,  duration: 0.5  }, 0.9);

      gsap.from('.featured-card', {
        opacity: 0, y: 40, duration: 0.85, ease: 'power3.out',
        scrollTrigger: { trigger: '.featured-card', start: 'top 85%' },
      });

      gsap.from('.article-row', {
        opacity: 0, y: 20, stagger: 0.06, duration: 0.65, ease: 'power3.out',
        scrollTrigger: { trigger: '.article-rows', start: 'top 88%' },
      });
    }, pageRef);

    return () => ctx.revert();
  }, []);

  useEffect(() => {
    gsap.from('.article-row, .featured-card', {
      opacity: 0, y: 16, stagger: 0.05, duration: 0.55, ease: 'power3.out', overwrite: 'auto',
    });
  }, [selectedCategory]);

  const filteredPosts = useMemo(() =>
    POSTS.filter(p => selectedCategory === 'ALL' || p.category === selectedCategory),
    [selectedCategory],
  );

  const featured = filteredPosts[0];
  const rest     = filteredPosts.slice(1);

  return (
    <div ref={pageRef} className="page-pt">

      {/* ══════════════════════════════════════════════════════
          HERO — fullscreen overlay, 3D behind text
      ══════════════════════════════════════════════════════ */}
      <section style={{
        height: 'calc(100vh - var(--header-h))',
        minHeight: 600,
        position: 'relative',
        display: 'flex',
        alignItems: 'center',
        justifyContent: 'center',
        borderBottom: '1px solid var(--border-light)',
        overflow: 'hidden',
      }}
        className="hero-section"
      >
        {/* Grainient — fullscreen background */}
        <Grainient
          color1="#373437"
          color2="#00a855"
          color3="#024523"
          grainAmount={0.08}
          warpStrength={1.2}
          warpFrequency={4.0}
          timeSpeed={0.18}
          contrast={1.6}
          saturation={1.2}
          zoom={0.85}
        />

        {/* Gradient overlays for text readability */}
        <div style={{
          position: 'absolute', inset: 0, zIndex: 1,
          background: 'radial-gradient(ellipse at center, transparent 30%, rgba(0,0,0,0.7) 80%)',
          pointerEvents: 'none',
        }} />
        <div style={{
          position: 'absolute', bottom: 0, left: 0, right: 0, height: '30%', zIndex: 1,
          background: 'linear-gradient(to top, #000 0%, transparent 100%)',
          pointerEvents: 'none',
        }} />

        {/* Text content — centered over 3D */}
        <div style={{
          position: 'relative', zIndex: 2,
          display: 'flex', flexDirection: 'column', alignItems: 'center',
          textAlign: 'center',
          padding: 'clamp(24px, 4vw, 60px)',
          maxWidth: 900,
        }}>
          {/* Eyebrow */}
          <p className="hero-eyebrow section-label" style={{ marginBottom: 28, justifyContent: 'center', color: 'rgba(255,255,255,0.65)' }}>
            <span style={{ width: 16, height: 1, background: 'var(--accent)', display: 'inline-block' }} />
            SUPERINTELLIGENZA BLOG
          </p>

          {/* Headline */}
          <h1 style={{
            fontFamily: 'var(--font-display)',
            fontWeight: 800,
            fontSize: 'var(--fs-h1)',
            lineHeight: 0.9,
            letterSpacing: '-0.05em',
            color: 'var(--text-primary)',
            marginBottom: 28,
            textShadow: '0 0 60px rgba(0,0,0,0.8)',
          }}>
            <span className="hero-line-1" style={{ display: 'block' }}>Dietro ogni</span>
            <span className="hero-line-2" style={{
              display: 'block',
              color: 'var(--accent)',
              textShadow: '0 0 40px var(--accent-glow), 0 0 80px var(--accent-glow-sm)',
            }}>
              click.
            </span>
          </h1>

          {/* Subtitle */}
          <p className="hero-sub" style={{
            fontSize: 'clamp(0.875rem, 1.2vw, 1.05rem)', fontWeight: 300, lineHeight: 1.75,
            color: 'rgba(255,255,255,0.72)', maxWidth: 440, marginBottom: 40,
          }}>
            Insights, analisi e visioni dal futuro digitale.
            Dove il pensiero incontra la macchina.
          </p>

          {/* Category pills */}
          <div className="hero-pills scrollbar-hide" style={{
            display: 'flex', flexWrap: 'wrap', gap: 6, justifyContent: 'center',
          }}>
            <button
              onClick={() => setSelectedCategory('ALL')}
              className={`interactive pill-btn ${selectedCategory === 'ALL' ? 'active' : ''}`}
            >TUTTI</button>
            {CATEGORIES.map(cat => (
              <button
                key={cat}
                onClick={() => setSelectedCategory(cat)}
                className={`interactive pill-btn ${selectedCategory === cat ? 'active' : ''}`}
              >{cat}</button>
            ))}
          </div>
        </div>

        {/* Scroll hint — bottom center */}
        <div className="hero-scroll" style={{
          position: 'absolute', bottom: 24, left: '50%', transform: 'translateX(-50%)', zIndex: 2,
          display: 'flex', alignItems: 'center', gap: 10,
          fontFamily: 'var(--font-mono)', fontSize: 9,
          letterSpacing: '0.18em', textTransform: 'uppercase', color: 'var(--text-dim)',
        }}>
          <ArrowDown size={11} /> SCROLL
        </div>
      </section>

      {/* ══════════════════════════════════════════════════════
          ARTICLES SECTION
      ══════════════════════════════════════════════════════ */}
      <section className="container-bliss" style={{ padding: 'clamp(60px,8vw,100px) 0' }}>

        {/* Section header */}
        <div style={{
          display: 'flex', alignItems: 'center', justifyContent: 'space-between',
          marginBottom: 40,
        }}>
          <p className="section-label">
            <span style={{ width: 16, height: 1, background: 'var(--text-dim)', display: 'inline-block' }} />
            ARTICOLI RECENTI
          </p>
          <Link
            to="/blog"
            className="interactive"
            style={{
              fontFamily: 'var(--font-mono)', fontSize: 9, letterSpacing: '0.14em',
              textTransform: 'uppercase', color: 'var(--text-dim)',
              display: 'flex', alignItems: 'center', gap: 7, transition: 'color 0.25s',
            }}
            onMouseEnter={e => (e.currentTarget.style.color = 'var(--accent)')}
            onMouseLeave={e => (e.currentTarget.style.color = 'var(--text-dim)')}
          >
            TUTTI GLI ARTICOLI <ArrowRight size={11} />
          </Link>
        </div>

        {filteredPosts.length === 0 && (
          <p style={{
            fontFamily: 'var(--font-mono)', fontSize: 11, letterSpacing: '0.3em',
            textTransform: 'uppercase', opacity: 0.2, padding: '80px 0',
          }}>
            NESSUN RISULTATO
          </p>
        )}

        {/* Featured card — first post, large horizontal */}
        {featured && (
          <Link
            to={`/article/${featured.id}`}
            className="featured-card interactive"
            style={{
              display: 'grid',
              gridTemplateColumns: '1fr 1fr',
              border: '1px solid var(--border-card)',
              borderRadius: 'var(--radius-card)',
              overflow: 'hidden',
              marginBottom: 0,
              textDecoration: 'none',
              transition: 'border-color 0.35s',
            }}
            onMouseEnter={e => {
              e.currentTarget.style.borderColor = 'var(--accent-border)';
              e.currentTarget.querySelector('.featured-img').style.transform = 'scale(1.04)';
              e.currentTarget.querySelector('.featured-img').style.filter = 'grayscale(0%)';
              e.currentTarget.querySelector('.featured-cta').style.color = 'var(--accent)';
            }}
            onMouseLeave={e => {
              e.currentTarget.style.borderColor = 'var(--border-card)';
              e.currentTarget.querySelector('.featured-img').style.transform = 'scale(1)';
              e.currentTarget.querySelector('.featured-img').style.filter = 'grayscale(20%)';
              e.currentTarget.querySelector('.featured-cta').style.color = 'var(--text-secondary)';
            }}
          >
            {/* Image */}
            <div style={{ overflow: 'hidden', aspectRatio: '4/3' }}>
              <img
                className="featured-img"
                src={featured.image}
                alt={featured.title}
                loading="lazy"
                style={{
                  width: '100%', height: '100%', objectFit: 'cover', display: 'block',
                  transition: 'transform 0.65s var(--ease), filter 0.65s',
                  filter: 'grayscale(20%)',
                }}
              />
            </div>

            {/* Text */}
            <div style={{
              padding: 'clamp(28px,4vw,52px)',
              background: 'var(--bg-card)',
              display: 'flex', flexDirection: 'column', justifyContent: 'center',
              gap: 16,
            }}>
              <div style={{ display: 'flex', alignItems: 'center', gap: 10 }}>
                <span className="cat-tag">{featured.category}</span>
                <span style={{
                  fontFamily: 'var(--font-mono)', fontSize: 9,
                  color: 'var(--text-dim)', letterSpacing: '0.06em',
                }}>
                  {featured.date} · {featured.readingTime}
                </span>
              </div>

              <h2 style={{
                fontFamily: 'var(--font-display)', fontWeight: 800,
                fontSize: 'var(--fs-h3)',
                lineHeight: 1.1, letterSpacing: '-0.03em',
                color: 'var(--text-primary)',
              }}>
                {featured.title}
              </h2>

              <p className="line-clamp-3" style={{
                fontSize: '0.875rem', fontWeight: 300,
                color: 'var(--text-secondary)', lineHeight: 1.75,
              }}>
                {featured.excerpt}
              </p>

              <div
                className="featured-cta"
                style={{
                  display: 'flex', alignItems: 'center', gap: 8,
                  fontFamily: 'var(--font-mono)', fontSize: 10, fontWeight: 700,
                  letterSpacing: '0.1em', textTransform: 'uppercase',
                  color: 'var(--text-secondary)', transition: 'color 0.25s',
                  marginTop: 8,
                }}
              >
                LEGGI L'ARTICOLO
                <span style={{ flex: 1, height: 1, background: 'currentColor', maxWidth: 40 }} />
                <ArrowRight size={14} />
              </div>
            </div>
          </Link>
        )}

        {/* Numbered list for remaining posts */}
        {rest.length > 0 && (
          <div className="article-rows">
            {rest.map((post, i) => (
              <div key={post.id} className="article-row">
                <ArticleRow post={post} index={i} />
              </div>
            ))}
          </div>
        )}
      </section>

      {/* ══════════════════════════════════════════════════════
          CTA
      ══════════════════════════════════════════════════════ */}
      <section style={{
        borderTop: '1px solid var(--border-light)',
        padding: 'clamp(70px,9vw,110px) 0',
      }}>
        <div className="cta-grid container-bliss" style={{
          display: 'grid',
          gridTemplateColumns: '1fr auto',
          alignItems: 'center',
          gap: 40,
        }}>
          <div>
            <p className="section-label" style={{ marginBottom: 16 }}>
              <span style={{ width: 16, height: 1, background: 'var(--accent)', display: 'inline-block' }} />
              RESTA CONNESSO
            </p>
            <h2 style={{
              fontFamily: 'var(--font-display)', fontWeight: 800,
              fontSize: 'var(--fs-h2)',
              lineHeight: 1.0, letterSpacing: '-0.035em',
              color: 'var(--text-primary)',
            }}>
              Il futuro è<br />già cominciato.
            </h2>
          </div>

          <button className="interactive btn-primary">
            ESPLORA IL BLOG
            <ArrowRight size={14} />
          </button>
        </div>
      </section>

      <div style={{ height: 80 }} />

      <style>{`
        .hero-section .pill-btn {
          color: rgba(255,255,255,0.75);
          border-color: rgba(255,255,255,0.22);
        }
        .hero-section .pill-btn:hover {
          color: var(--accent);
          border-color: var(--accent-border);
        }
        .hero-section .hero-scroll {
          color: rgba(255,255,255,0.45) !important;
        }
        @media (max-width: 767px) {
          .featured-card { grid-template-columns: 1fr !important; }
          .cta-grid { grid-template-columns: 1fr !important; }
        }
      `}</style>
    </div>
  );
};

export default Home;
