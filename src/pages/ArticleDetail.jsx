import { useParams, Link } from 'react-router-dom';
import { useEffect, useRef, useState, useMemo } from 'react';
import gsap from 'gsap';
import { POSTS } from '../data/posts';
import { ArrowLeft, Clock, Calendar, Share2, ArrowRight } from 'lucide-react';
import TableOfContents, { processArticleContent } from '../components/TableOfContents';

/* ── Minimal related row ──────────────────────────────────── */
const RelatedRow = ({ post, index }) => (
  <Link
    to={`/article/${post.id}`}
    className="interactive"
    style={{
      display: 'grid',
      gridTemplateColumns: '40px 1fr auto',
      alignItems: 'center',
      gap: 20,
      padding: '18px 0',
      borderBottom: '1px solid var(--border-light)',
      textDecoration: 'none',
      transition: 'background 0.2s',
    }}
    onMouseEnter={e => {
      e.currentTarget.style.background = 'rgba(0,255,127,0.02)';
      e.currentTarget.querySelector('.rr-title').style.color = 'var(--accent)';
    }}
    onMouseLeave={e => {
      e.currentTarget.style.background = 'transparent';
      e.currentTarget.querySelector('.rr-title').style.color = 'var(--text-primary)';
    }}
  >
    <span style={{
      fontFamily: 'var(--font-mono)', fontSize: 10, color: 'var(--text-dim)', letterSpacing: '0.04em',
    }}>
      {String(index + 1).padStart(2, '0')}
    </span>

    <div style={{ display: 'flex', flexDirection: 'column', gap: 4 }}>
      <span className="cat-tag" style={{ display: 'inline-flex', width: 'fit-content' }}>
        {post.category}
      </span>
      <p
        className="rr-title"
        style={{
          fontFamily: 'var(--font-display)', fontWeight: 700,
          fontSize: 'clamp(0.95rem,1.4vw,1.1rem)',
          color: 'var(--text-primary)', lineHeight: 1.2,
          letterSpacing: '-0.02em', transition: 'color 0.25s',
        }}
      >
        {post.title}
      </p>
    </div>

    <ArrowRight size={14} style={{ color: 'var(--text-dim)', flexShrink: 0 }} />
  </Link>
);

/* ── Main component ──────────────────────────────────────── */
const ArticleDetail = () => {
  const { id }                         = useParams();
  const post                           = POSTS.find(p => p.id === id);
  const containerRef                   = useRef(null);
  const [readingProgress, setProgress] = useState(0);

  const { processedHtml, items: tocItems } = useMemo(() => {
    if (!post) return { processedHtml: '', items: [] };
    return processArticleContent(post.content);
  }, [post]);

  useEffect(() => {
    if (!post) return;
    window.scrollTo(0, 0);

    const onScroll = () => {
      const s = window.scrollY;
      const d = document.documentElement.scrollHeight - window.innerHeight;
      setProgress(d > 0 ? (s / d) * 100 : 0);
    };
    window.addEventListener('scroll', onScroll, { passive: true });

    const ctx = gsap.context(() => {
      gsap.from('.reveal-content', {
        opacity: 0, y: 20, stagger: 0.07, duration: 0.8, ease: 'power3.out',
      });
    }, containerRef);

    return () => {
      ctx.revert();
      window.removeEventListener('scroll', onScroll);
    };
  }, [id, post]);

  if (!post) return (
    <div className="page-pt" style={{
      textAlign: 'center', padding: '160px 0',
      fontFamily: 'var(--font-mono)', fontSize: 11,
      letterSpacing: '0.2em', color: 'var(--text-dim)',
    }}>
      ARTICOLO NON TROVATO
    </div>
  );

  const related = POSTS.filter(p => p.id !== post.id).slice(0, 3);

  return (
    <div ref={containerRef} className="page-pt">
      <div className="reading-progress" style={{ width: `${readingProgress}%` }} />

      {/* ══ HEADER ══════════════════════════════════════════════ */}
      <header style={{
        borderBottom: '1px solid var(--border-light)',
        padding: 'clamp(44px,6vw,72px) 0',
        marginBottom: 60,
      }}>
        <div className="container-bliss">
          <div style={{ maxWidth: 780, margin: '0 auto', textAlign: 'center' }}>

            <Link
              to="/blog"
              className="interactive"
              style={{
                display: 'inline-flex', alignItems: 'center', gap: 7,
                fontFamily: 'var(--font-mono)', fontSize: 9, fontWeight: 400,
                letterSpacing: '0.18em', textTransform: 'uppercase',
                color: 'var(--text-dim)', marginBottom: 32, transition: 'color 0.25s',
              }}
              onMouseEnter={e => (e.currentTarget.style.color = 'var(--accent)')}
              onMouseLeave={e => (e.currentTarget.style.color = 'var(--text-dim)')}
            >
              <ArrowLeft size={11} /> TORNA AL BLOG
            </Link>

            <div className="reveal-content" style={{ marginBottom: 16 }}>
              <span className="cat-tag">{post.category}</span>
            </div>

            <h1 className="reveal-content" style={{
              fontFamily: 'var(--font-display)', fontWeight: 800,
              fontSize: 'clamp(1.8rem, 3.8vw, 3.4rem)',
              lineHeight: 1.05, letterSpacing: '-0.03em',
              color: 'var(--text-primary)', marginBottom: 28,
            }}>
              {post.title}
            </h1>

            <div className="reveal-content" style={{
              display: 'flex', flexWrap: 'wrap', justifyContent: 'center',
              alignItems: 'center', gap: 16,
              fontFamily: 'var(--font-mono)', fontSize: 9, fontWeight: 400,
              letterSpacing: '0.12em', textTransform: 'uppercase', color: 'var(--text-dim)',
            }}>
              <span style={{ display: 'flex', alignItems: 'center', gap: 5 }}>
                <Calendar size={10} /> {post.date}
              </span>
              <span style={{ width: 2, height: 2, background: 'var(--text-dim)', borderRadius: '50%', display: 'inline-block' }} />
              <span style={{ display: 'flex', alignItems: 'center', gap: 5 }}>
                <Clock size={10} /> {post.readingTime}
              </span>
            </div>
          </div>
        </div>
      </header>

      {/* ══ BODY ════════════════════════════════════════════════ */}
      <div className="container-bliss" style={{ marginBottom: 80 }}>

        {/* Feature image */}
        <div className="reveal-content" style={{
          maxWidth: 900, margin: '0 auto 56px',
          aspectRatio: '21/9',
          overflow: 'hidden',
          border: '1px solid var(--border-card)',
        }}>
          <img
            src={post.image}
            alt={post.title}
            style={{
              width: '100%', height: '100%', objectFit: 'cover', display: 'block',
              filter: 'grayscale(15%)',
              transition: 'filter 0.6s',
            }}
            onMouseEnter={e => (e.currentTarget.style.filter = 'grayscale(0%)')}
            onMouseLeave={e => (e.currentTarget.style.filter = 'grayscale(15%)')}
          />
        </div>

        {/* TOC + article */}
        <div style={{
          display: 'flex', gap: 56, alignItems: 'flex-start',
          maxWidth: 1060, margin: '0 auto',
        }}>
          <div className="reveal-content toc-desktop-wrapper" style={{ flexShrink: 0 }}>
            <TableOfContents items={tocItems} />
          </div>

          <article style={{ flex: 1, minWidth: 0 }}>
            <div
              className="reveal-content article-content"
              dangerouslySetInnerHTML={{ __html: processedHtml }}
            />

            {/* Author bar */}
            <div className="reveal-content" style={{
              marginTop: 60, paddingTop: 24,
              borderTop: '1px solid var(--border-light)',
              display: 'flex', flexWrap: 'wrap',
              alignItems: 'center', justifyContent: 'space-between', gap: 14,
            }}>
              <div style={{
                display: 'flex', flexWrap: 'wrap', alignItems: 'center', gap: 14,
                fontFamily: 'var(--font-mono)', fontSize: 9, fontWeight: 400,
                letterSpacing: '0.16em', textTransform: 'uppercase',
                color: 'var(--text-dim)',
              }}>
                <span>AUTORE: {post.author}</span>
              </div>

              <button className="interactive icon-btn" title="Condividi">
                <Share2 size={14} />
              </button>
            </div>
          </article>
        </div>
      </div>

      {/* ══ RELATED ═════════════════════════════════════════════ */}
      <section style={{
        borderTop: '1px solid var(--border-light)',
        padding: 'clamp(60px,8vw,80px) 0 80px',
      }}>
        <div className="container-bliss">
          <div style={{
            display: 'flex', alignItems: 'flex-end', justifyContent: 'space-between',
            marginBottom: 8, flexWrap: 'wrap', gap: 16,
          }}>
            <h2 style={{
              fontFamily: 'var(--font-display)', fontWeight: 800,
              fontSize: 'clamp(1.8rem, 3vw, 2.8rem)',
              lineHeight: 1.0, letterSpacing: '-0.03em',
              color: 'var(--text-primary)',
            }}>
              Altre sinapsi<br />
              <span style={{ color: 'var(--accent)' }}>digitali.</span>
            </h2>

            <Link
              to="/blog"
              className="interactive"
              style={{
                display: 'flex', alignItems: 'center', gap: 7,
                fontFamily: 'var(--font-mono)', fontSize: 9, fontWeight: 400,
                letterSpacing: '0.14em', textTransform: 'uppercase',
                color: 'var(--text-dim)', transition: 'color 0.25s',
              }}
              onMouseEnter={e => (e.currentTarget.style.color = 'var(--accent)')}
              onMouseLeave={e => (e.currentTarget.style.color = 'var(--text-dim)')}
            >
              TUTTI GLI ARTICOLI <ArrowRight size={11} />
            </Link>
          </div>

          {related.map((p, i) => (
            <RelatedRow key={p.id} post={p} index={i} />
          ))}
        </div>
      </section>

      <style>{`
        .toc-desktop-wrapper { display: none; }
        @media (min-width: 1100px) { .toc-desktop-wrapper { display: block; } }
      `}</style>
    </div>
  );
};

export default ArticleDetail;
