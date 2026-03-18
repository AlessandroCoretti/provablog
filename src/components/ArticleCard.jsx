import { Link } from 'react-router-dom';
import { ArrowUpRight } from 'lucide-react';

const ArticleCard = ({ post, span = false }) => (
  <Link
    to={`/article/${post.id}`}
    className={`card interactive ${span ? 'span-2' : ''}`}
    style={{ display: 'block', textDecoration: 'none' }}
  >
    <div style={{ position: 'relative', aspectRatio: '16/10', overflow: 'hidden' }}>
      <img src={post.image} alt={post.title} loading="lazy" />
      <div
        className="img-overlay"
        style={{
          position: 'absolute', inset: 0,
          background: 'linear-gradient(to top, rgba(0,0,0,0.65) 0%, transparent 55%)',
          opacity: 0, transition: 'opacity 0.4s', pointerEvents: 'none',
        }}
      />
      <div style={{ position: 'absolute', top: 12, left: 12 }}>
        <span className="cat-tag">{post.category}</span>
      </div>
    </div>

    <div style={{ padding: 'clamp(18px, 2.5vw, 28px)' }}>
      <div style={{
        display: 'flex', alignItems: 'center', gap: 7, marginBottom: 10,
        fontFamily: 'var(--font-mono)', fontSize: 9, fontWeight: 400,
        letterSpacing: '0.1em', textTransform: 'uppercase', color: 'var(--text-dim)',
      }}>
        <span>{post.date}</span>
        <span style={{ width: 2, height: 2, background: 'var(--text-dim)', borderRadius: '50%', display: 'inline-block' }} />
        <span>{post.readingTime}</span>
      </div>

      <h3 style={{
        fontFamily: 'var(--font-display)', fontWeight: 700,
        fontSize: 'clamp(1rem, 1.5vw, 1.3rem)',
        color: 'var(--text-primary)', lineHeight: 1.15,
        letterSpacing: '-0.025em', marginBottom: 8,
      }}>
        {post.title}
      </h3>

      <p className="line-clamp-2" style={{
        fontSize: '0.8125rem', color: 'var(--text-secondary)',
        fontWeight: 300, lineHeight: 1.7, marginBottom: 18,
      }}>
        {post.excerpt}
      </p>

      <div style={{
        display: 'inline-flex', alignItems: 'center', gap: 5,
        fontFamily: 'var(--font-mono)', fontSize: 9, fontWeight: 700,
        letterSpacing: '0.1em', textTransform: 'uppercase', color: 'var(--accent)',
      }}>
        LEGGI DI PIÙ <ArrowUpRight size={11} />
      </div>
    </div>
  </Link>
);

export default ArticleCard;
