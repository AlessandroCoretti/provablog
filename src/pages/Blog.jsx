import { useState, useMemo, useEffect, useRef } from 'react';
import gsap from 'gsap';
import { POSTS, CATEGORIES } from '../data/posts';
import { ArrowRight } from 'lucide-react';
import { Link } from 'react-router-dom';
import { Search } from 'lucide-react';

/* ── Post list row ─────────────────────────────────────────── */
const PostRow = ({ post, index }) => (
  <Link
    to={`/article/${post.id}`}
    className="post-row interactive"
    style={{
      display: 'grid',
      gridTemplateColumns: '52px 110px 1fr 110px 32px',
      alignItems: 'center',
      gap: 20,
      padding: '20px 0',
      borderBottom: '1px solid var(--border-light)',
      textDecoration: 'none',
      transition: 'background 0.2s',
    }}
    onMouseEnter={e => {
      e.currentTarget.style.background = 'rgba(0,255,127,0.02)';
      e.currentTarget.querySelector('.pr-title').style.color = 'var(--accent)';
      e.currentTarget.querySelector('.pr-arrow').style.opacity = '1';
      e.currentTarget.querySelector('.pr-arrow').style.transform = 'translateX(3px)';
    }}
    onMouseLeave={e => {
      e.currentTarget.style.background = 'transparent';
      e.currentTarget.querySelector('.pr-title').style.color = 'var(--text-primary)';
      e.currentTarget.querySelector('.pr-arrow').style.opacity = '0.2';
      e.currentTarget.querySelector('.pr-arrow').style.transform = 'translateX(0)';
    }}
  >
    {/* Index */}
    <span style={{
      fontFamily: 'var(--font-mono)', fontSize: 10, color: 'var(--text-dim)',
      letterSpacing: '0.04em', flexShrink: 0,
    }}>
      {String(index + 1).padStart(2, '0')}
    </span>

    {/* Category */}
    <span><span className="cat-tag">{post.category}</span></span>

    {/* Title + excerpt */}
    <div>
      <p
        className="pr-title"
        style={{
          fontFamily: 'var(--font-display)', fontWeight: 700,
          fontSize: 'clamp(0.95rem, 1.4vw, 1.15rem)',
          color: 'var(--text-primary)', lineHeight: 1.2,
          letterSpacing: '-0.02em', marginBottom: 4,
          transition: 'color 0.25s',
        }}
      >
        {post.title}
      </p>
      <p className="line-clamp-2" style={{
        fontSize: '0.8125rem', color: 'var(--text-secondary)',
        fontWeight: 300, lineHeight: 1.5,
      }}>
        {post.excerpt}
      </p>
    </div>

    {/* Date + reading time */}
    <div style={{
      fontFamily: 'var(--font-mono)', fontSize: 9,
      color: 'var(--text-dim)', letterSpacing: '0.06em',
      display: 'flex', flexDirection: 'column', gap: 3, alignItems: 'flex-end',
    }}>
      <span>{post.date}</span>
      <span>{post.readingTime}</span>
    </div>

    {/* Arrow */}
    <ArrowRight
      className="pr-arrow"
      size={14}
      style={{
        color: 'var(--text-secondary)', opacity: 0.2, flexShrink: 0,
        transition: 'opacity 0.25s, transform 0.25s',
      }}
    />
  </Link>
);

/* ── Blog page ─────────────────────────────────────────────── */
const Blog = () => {
  const [search,           setSearch]           = useState('');
  const [selectedCategory, setSelectedCategory] = useState('ALL');
  const pageRef = useRef(null);

  useEffect(() => {
    window.scrollTo(0, 0);
    const ctx = gsap.context(() => {
      const tl = gsap.timeline({ defaults: { ease: 'power3.out' } });
      tl.from('.blog-eyebrow', { opacity: 0, y: 14, duration: 0.55 }, 0.1)
        .from('.blog-h1-1',    { opacity: 0, y: 40, duration: 0.9  }, 0.2)
        .from('.blog-h1-2',    { opacity: 0, y: 40, duration: 0.9  }, 0.3)
        .from('.blog-controls',{ opacity: 0, y: 14, duration: 0.55 }, 0.55);
    }, pageRef);
    return () => ctx.revert();
  }, []);

  useEffect(() => {
    gsap.from('.post-row', {
      opacity: 0, y: 12, stagger: 0.04, duration: 0.55, ease: 'power3.out', overwrite: 'auto',
    });
  }, [search, selectedCategory]);

  const filteredPosts = useMemo(() => POSTS.filter(post => {
    const q = search.toLowerCase();
    const matchesSearch   = post.title.toLowerCase().includes(q) || post.excerpt.toLowerCase().includes(q);
    const matchesCategory = selectedCategory === 'ALL' || post.category === selectedCategory;
    return matchesSearch && matchesCategory;
  }), [search, selectedCategory]);

  return (
    <div ref={pageRef} className="page-pt" style={{ paddingBottom: 100 }}>

      {/* ══ HEADER ══════════════════════════════════════════════ */}
      <header style={{
        borderBottom: '1px solid var(--border-light)',
        padding: 'clamp(48px,7vw,80px) 0 clamp(36px,5vw,56px)',
      }}>
        <div className="container-bliss">
          <div style={{
            display: 'grid',
            gridTemplateColumns: '1fr auto',
            alignItems: 'flex-end',
            gap: 40,
          }}
            className="blog-header-inner"
          >
            {/* Title block */}
            <div>
              <p className="blog-eyebrow section-label" style={{ marginBottom: 20 }}>
                <span style={{ width: 16, height: 1, background: 'var(--accent)', display: 'inline-block' }} />
                L'ARCHIVIO — {POSTS.length} ARTICOLI
              </p>
              <h1 style={{
                fontFamily: 'var(--font-display)', fontWeight: 800,
                fontSize: 'var(--fs-h1)',
                lineHeight: 0.92, letterSpacing: '-0.04em',
              }}>
                <span className="blog-h1-1" style={{ display: 'block', color: 'var(--text-primary)' }}>
                  Insights &amp;
                </span>
                <span className="blog-h1-2" style={{ display: 'block', color: 'var(--accent)' }}>
                  Perspective.
                </span>
              </h1>
            </div>

            {/* Controls */}
            <div className="blog-controls" style={{ display: 'flex', flexDirection: 'column', gap: 10, width: 380 }}>
              <div style={{ position: 'relative' }}>
                <Search size={13} style={{
                  position: 'absolute', left: 16, top: '50%', transform: 'translateY(-50%)',
                  color: 'var(--text-dim)', pointerEvents: 'none', zIndex: 1,
                }} />
                <input
                  type="text"
                  placeholder="CERCA NELL'ARCHIVIO..."
                  value={search}
                  onChange={e => setSearch(e.target.value)}
                  className="search-input interactive"
                />
              </div>

              <div className="scrollbar-hide" style={{ display: 'flex', gap: 6, overflowX: 'auto' }}>
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
          </div>
        </div>
      </header>

      {/* ══ LIST ════════════════════════════════════════════════ */}
      <div className="container-bliss" style={{ paddingTop: 8 }}>
        {filteredPosts.length > 0 ? (
          <>
            {/* Column headers */}
            <div style={{
              display: 'grid',
              gridTemplateColumns: '52px 110px 1fr 110px 32px',
              gap: 20,
              padding: '14px 0',
              borderBottom: '1px solid var(--border-light)',
              fontFamily: 'var(--font-mono)', fontSize: 8,
              letterSpacing: '0.2em', textTransform: 'uppercase',
              color: 'var(--text-dim)',
            }}
              className="blog-list-header"
            >
              <span>#</span>
              <span>CATEGORIA</span>
              <span>TITOLO</span>
              <span style={{ textAlign: 'right' }}>DATA</span>
              <span />
            </div>

            {filteredPosts.map((post, i) => (
              <PostRow key={post.id} post={post} index={i} />
            ))}
          </>
        ) : (
          <div style={{ padding: '100px 0', opacity: 0.2 }}>
            <p style={{
              fontFamily: 'var(--font-mono)', fontSize: 11,
              letterSpacing: '0.3em', textTransform: 'uppercase',
            }}>
              NESSUN RISULTATO TROVATO
            </p>
          </div>
        )}
      </div>

      <style>{`
        @media (max-width: 900px) {
          .blog-header-inner { grid-template-columns: 1fr !important; align-items: flex-start !important; }
          .blog-controls { width: 100% !important; }
          .post-row { grid-template-columns: 40px 1fr 28px !important; }
          .post-row > :nth-child(2),
          .post-row > :nth-child(4) { display: none; }
          .blog-list-header { grid-template-columns: 40px 1fr 28px !important; }
          .blog-list-header > :nth-child(2),
          .blog-list-header > :nth-child(4) { display: none; }
        }
      `}</style>
    </div>
  );
};

export default Blog;
