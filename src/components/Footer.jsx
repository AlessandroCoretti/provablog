import { useRef } from 'react';
import { Link } from 'react-router-dom';
import { Instagram, Linkedin, Twitter } from 'lucide-react';
import FooterStickman from './FooterStickman';

const sitemapLinks = [
  { label: 'HOME',     to: '/' },
  { label: 'BLOG_HUB', to: '/blog' },
  { label: 'PROGETTI',  to: '/progetti' },
];

const legalLinks = ['PRIVACY_POLICY', 'COOKIE_POLICY', 'CONTACT_US'];
const socialIcons = [Instagram, Linkedin, Twitter];

const Footer = () => {
  const footerRef = useRef(null);
  return (
  <footer ref={footerRef} style={{
    borderTop: '1px solid var(--border-light)',
    paddingTop: 72, paddingBottom: 0,
    position: 'relative',
  }}>
    <FooterStickman footerRef={footerRef} />
    <div className="container-bliss">

      {/* Top */}
      <div style={{
        display: 'flex', flexWrap: 'wrap',
        justifyContent: 'space-between', gap: 48,
        marginBottom: 64,
      }}>
        {/* Brand */}
        <div style={{ display: 'flex', flexDirection: 'column', gap: 16, maxWidth: 300 }}>
          <Link to="/" className="interactive" style={{ display: 'inline-flex', alignItems: 'baseline', gap: 1 }}>
            <span style={{
              fontFamily: 'var(--font-display)', fontSize: 24, fontWeight: 800,
              color: 'var(--text-primary)', letterSpacing: '-0.03em', lineHeight: 1,
            }}>Super</span>
            <span style={{
              fontFamily: 'var(--font-display)', fontSize: 24, fontWeight: 800,
              color: 'var(--accent)', letterSpacing: '-0.03em', lineHeight: 1,
            }}>intelligenza</span>
          </Link>

          <p style={{
            fontSize: 13, fontWeight: 300, lineHeight: 1.8,
            color: 'var(--text-secondary)',
          }}>
            Insights, analisi e visioni dal futuro digitale.
          </p>

          {/* Social */}
          <div style={{ display: 'flex', gap: 8, marginTop: 4 }}>
            {socialIcons.map((Icon, i) => (
              <a key={i} href="#" className="interactive icon-btn">
                <Icon size={13} />
              </a>
            ))}
          </div>
        </div>

        {/* Links */}
        <div style={{ display: 'flex', gap: 52 }}>
          <div style={{ display: 'flex', flexDirection: 'column', gap: 16 }}>
            <span style={{
              fontFamily: 'var(--font-mono)', fontSize: 8, fontWeight: 700,
              color: 'var(--text-dim)', letterSpacing: '0.2em', textTransform: 'uppercase',
            }}>Sitemap</span>
            {sitemapLinks.map(({ label, to }) => (
              <Link key={label} to={to} className="interactive" style={{
                fontFamily: 'var(--font-mono)', fontSize: 10, fontWeight: 400,
                color: 'var(--text-dim)', letterSpacing: '0.12em', textTransform: 'uppercase',
                transition: 'color 0.25s', display: 'block',
              }}
                onMouseEnter={e => (e.currentTarget.style.color = 'var(--accent)')}
                onMouseLeave={e => (e.currentTarget.style.color = 'var(--text-dim)')}
              >{label}</Link>
            ))}
          </div>

          <div style={{ display: 'flex', flexDirection: 'column', gap: 16 }}>
            <span style={{
              fontFamily: 'var(--font-mono)', fontSize: 8, fontWeight: 700,
              color: 'var(--text-dim)', letterSpacing: '0.2em', textTransform: 'uppercase',
            }}>Legal</span>
            {legalLinks.map(label => (
              <span key={label} className="interactive" style={{
                fontFamily: 'var(--font-mono)', fontSize: 10, fontWeight: 400,
                color: 'var(--text-dim)', letterSpacing: '0.12em', textTransform: 'uppercase',
                transition: 'color 0.25s', display: 'block',
                cursor: 'none !important',
              }}
                onMouseEnter={e => (e.currentTarget.style.color = 'var(--accent)')}
                onMouseLeave={e => (e.currentTarget.style.color = 'var(--text-dim)')}
              >{label}</span>
            ))}
          </div>
        </div>
      </div>

      {/* Bottom bar */}
      <div style={{
        borderTop: '1px solid var(--border-light)',
        paddingTop: 18, paddingBottom: 24,
        display: 'flex', flexWrap: 'wrap',
        alignItems: 'center', justifyContent: 'space-between', gap: 10,
      }}>
        <span style={{
          fontFamily: 'var(--font-mono)', fontSize: 8, fontWeight: 400,
          color: 'var(--text-dim)', letterSpacing: '0.2em', textTransform: 'uppercase',
        }}>
          © 2026 SUPERINTELLIGENZA. TUTTI I DIRITTI RISERVATI.
        </span>
        <span style={{
          fontFamily: 'var(--font-mono)', fontSize: 8, fontWeight: 700,
          color: 'var(--accent)', letterSpacing: '0.2em', textTransform: 'uppercase',
          textShadow: '0 0 12px var(--accent-glow)',
        }}>
          IL FUTURO È GIÀ QUI
        </span>
      </div>
    </div>
  </footer>
  );
};

export default Footer;
