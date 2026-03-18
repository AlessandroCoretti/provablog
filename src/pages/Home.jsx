import { useState, useMemo, useEffect, useRef, useLayoutEffect } from "react";
import gsap from "gsap";
import { ScrollTrigger } from "gsap/ScrollTrigger";
import { ArrowRight, ChevronDown } from "lucide-react";
import { Link } from "react-router-dom";
import { POSTS, CATEGORIES } from "../data/posts";
import LightPillar from "../components/LightPillar";

gsap.registerPlugin(ScrollTrigger);

/* ── Expandable row with GSAP curtain animation ──────────── */
const ExpandableRow = ({ post, index }) => {
  const [open, setOpen] = useState(false);
  const panelRef = useRef(null);
  const isAnimating = useRef(false);

  useLayoutEffect(() => {
    if (!open) return;
    const panel = panelRef.current;
    if (!panel) return;
    isAnimating.current = true;
    gsap.fromTo(
      panel,
      { clipPath: "inset(0% 0% 100% 0%)", opacity: 0 },
      {
        clipPath: "inset(0% 0% 0% 0%)",
        opacity: 1,
        duration: 0.55,
        ease: "power3.out",
        onComplete: () => { isAnimating.current = false; },
      }
    );
  }, [open]);

  const handleClick = () => {
    if (isAnimating.current) return;
    if (open) {
      const panel = panelRef.current;
      if (!panel) { setOpen(false); return; }
      isAnimating.current = true;
      gsap.to(panel, {
        clipPath: "inset(0% 0% 100% 0%)",
        opacity: 0,
        duration: 0.42,
        ease: "power3.in",
        onComplete: () => {
          isAnimating.current = false;
          setOpen(false);
        },
      });
    } else {
      setOpen(true);
    }
  };

  return (
    <div style={{ borderBottom: "1px solid var(--border-light)" }}>
      {/* Clickable row */}
      <div
        onClick={handleClick}
        className="interactive expandable-row"
        style={{
          display: "grid",
          gridTemplateColumns: "48px 1fr auto",
          alignItems: "center",
          gap: 24,
          padding: "22px 0",
          cursor: "pointer",
          transition: "background 0.2s",
        }}
        onMouseEnter={(e) => {
          e.currentTarget.style.background = "rgba(0,255,127,0.02)";
          const title = e.currentTarget.querySelector(".row-title");
          const arrow = e.currentTarget.querySelector(".row-arrow-right");
          if (title) title.style.color = "var(--accent)";
          if (arrow) { arrow.style.opacity = "1"; arrow.style.transform = "translateX(4px)"; }
        }}
        onMouseLeave={(e) => {
          e.currentTarget.style.background = "transparent";
          const title = e.currentTarget.querySelector(".row-title");
          const arrow = e.currentTarget.querySelector(".row-arrow-right");
          if (title) title.style.color = "var(--text-primary)";
          if (arrow) { arrow.style.opacity = "0.25"; arrow.style.transform = "translateX(0)"; }
        }}
      >
        {/* Index */}
        <span
          style={{
            fontFamily: "var(--font-mono)",
            fontSize: 10,
            fontWeight: 400,
            color: "var(--text-dim)",
            letterSpacing: "0.05em",
            userSelect: "none",
          }}
        >
          {String(index + 1).padStart(2, "0")}
        </span>

        {/* Title + meta */}
        <div>
          <div style={{ display: "flex", alignItems: "center", gap: 10, marginBottom: 4 }}>
            <span
              style={{
                fontFamily: "var(--font-mono)",
                fontSize: 9,
                color: "var(--text-dim)",
                letterSpacing: "0.06em",
              }}
            >
              {post.date}
            </span>
            <span
              style={{
                fontFamily: "var(--font-mono)",
                fontSize: 9,
                color: "var(--text-dim)",
                letterSpacing: "0.06em",
                opacity: 0.6,
              }}
            >
              · {post.readingTime}
            </span>
          </div>
          <p
            className="row-title"
            style={{
              fontFamily: "var(--font-display)",
              fontSize: "clamp(0.95rem,1.4vw,1.18rem)",
              fontWeight: 700,
              color: "var(--text-primary)",
              lineHeight: 1.15,
              letterSpacing: "-0.02em",
              transition: "color 0.25s",
            }}
          >
            {post.title}
          </p>
        </div>

        {/* Chevron */}
        <ChevronDown
          size={16}
          style={{
            color: "var(--text-secondary)",
            opacity: open ? 1 : 0.35,
            transition: "transform 0.35s, opacity 0.25s",
            transform: open ? "rotate(180deg)" : "rotate(0deg)",
            flexShrink: 0,
          }}
        />
      </div>

      {/* Preview panel — rendered when open=true, animated via GSAP */}
      {open && (
        <div
          ref={panelRef}
          style={{
            overflow: "hidden",
            clipPath: "inset(0% 0% 100% 0%)",
            opacity: 0,
          }}
        >
          <Link
            to={`/article/${post.id}`}
            style={{
              display: "grid",
              gridTemplateColumns: "1fr 1fr",
              border: "1px solid var(--border-card)",
              borderRadius: "var(--radius-card)",
              overflow: "hidden",
              marginBottom: 20,
              textDecoration: "none",
              height: 240,
              transition: "border-color 0.35s",
            }}
            className="interactive preview-card"
            onMouseEnter={(e) => {
              e.currentTarget.style.borderColor = "var(--accent-border)";
              const img = e.currentTarget.querySelector(".preview-img");
              const cta = e.currentTarget.querySelector(".preview-cta");
              if (img) { img.style.transform = "scale(1.04)"; img.style.filter = "grayscale(0%)"; }
              if (cta) cta.style.color = "var(--accent)";
            }}
            onMouseLeave={(e) => {
              e.currentTarget.style.borderColor = "var(--border-card)";
              const img = e.currentTarget.querySelector(".preview-img");
              const cta = e.currentTarget.querySelector(".preview-cta");
              if (img) { img.style.transform = "scale(1)"; img.style.filter = "grayscale(20%)"; }
              if (cta) cta.style.color = "var(--text-secondary)";
            }}
          >
            {/* Image */}
            <div style={{ overflow: "hidden", height: "100%" }}>
              <img
                className="preview-img"
                src={post.image}
                alt={post.title}
                loading="lazy"
                style={{
                  width: "100%",
                  height: "100%",
                  objectFit: "cover",
                  display: "block",
                  transition: "transform 0.65s var(--ease), filter 0.65s",
                  filter: "grayscale(20%)",
                }}
              />
            </div>

            {/* Text */}
            <div
              style={{
                padding: "clamp(18px,2.5vw,32px)",
                background: "var(--bg-card)",
                display: "flex",
                flexDirection: "column",
                justifyContent: "center",
                gap: 10,
              }}
            >
              <div style={{ display: "flex", alignItems: "center", gap: 8 }}>
                <span className="cat-tag">{post.category}</span>
                <span
                  style={{
                    fontFamily: "var(--font-mono)",
                    fontSize: 8,
                    color: "var(--text-dim)",
                    letterSpacing: "0.08em",
                    opacity: 0.7,
                  }}
                >
                  clicca per leggere
                </span>
              </div>

              <h3
                style={{
                  fontFamily: "var(--font-display)",
                  fontWeight: 800,
                  fontSize: "clamp(0.9rem,1.2vw,1.1rem)",
                  lineHeight: 1.15,
                  letterSpacing: "-0.025em",
                  color: "var(--text-primary)",
                }}
              >
                {post.title}
              </h3>

              <p
                className="line-clamp-3"
                style={{
                  fontSize: "0.8rem",
                  fontWeight: 300,
                  color: "var(--text-secondary)",
                  lineHeight: 1.65,
                }}
              >
                {post.excerpt}
              </p>

              <div
                className="preview-cta"
                style={{
                  display: "flex",
                  alignItems: "center",
                  gap: 8,
                  fontFamily: "var(--font-mono)",
                  fontSize: 9,
                  fontWeight: 700,
                  letterSpacing: "0.1em",
                  textTransform: "uppercase",
                  color: "var(--text-secondary)",
                  transition: "color 0.25s",
                  marginTop: 4,
                }}
              >
                LEGGI L'ARTICOLO
                <span style={{ flex: 1, height: 1, background: "currentColor", maxWidth: 30 }} />
                <ArrowRight size={12} />
              </div>
            </div>
          </Link>
        </div>
      )}
    </div>
  );
};

/* ── Constants ───────────────────────────────────────────── */
const HOME_CATS = ['AI_SENTIENCE', 'CYBER_SECURITY', 'NEURAL_LINK', 'SPACE_EXPLORATION'];

const CAT_LABELS = {
  AI_SENTIENCE: 'AI SENTIENCE',
  CYBER_SECURITY: 'CYBER SECURITY',
  NEURAL_LINK: 'NEURAL LINK',
  SPACE_EXPLORATION: 'SPACE EXPLORATION',
};

/* ── Main component ──────────────────────────────────────── */
const Home = () => {
  const [selectedCategory, setSelectedCategory] = useState("ALL");
  const pageRef = useRef(null);

  useEffect(() => {
    window.scrollTo(0, 0);
    const ctx = gsap.context(() => {
      const tl = gsap.timeline({ defaults: { ease: "power3.out" } });
      tl.from(".hero-eyebrow", { opacity: 0, y: 16, duration: 0.6 }, 0.1)
        .from(".hero-line-1", { opacity: 0, y: 48, duration: 0.95 }, 0.25)
        .from(".hero-line-2", { opacity: 0, y: 48, duration: 0.95 }, 0.35)
        .from(".hero-sub", { opacity: 0, y: 16, duration: 0.6 }, 0.55)
        .from(".hero-pills", { opacity: 0, y: 12, duration: 0.5 }, 0.7)
        .from(".hero-scroll", { opacity: 0, y: 8, duration: 0.5 }, 0.9);

      gsap.from(".cat-section", {
        opacity: 0,
        y: 40,
        stagger: 0.12,
        duration: 0.85,
        ease: "power3.out",
        scrollTrigger: { trigger: ".categories-wrapper", start: "top 85%" },
      });
    }, pageRef);

    return () => ctx.revert();
  }, []);

  useEffect(() => {
    gsap.from(".cat-section", {
      opacity: 0,
      y: 16,
      stagger: 0.07,
      duration: 0.55,
      ease: "power3.out",
      overwrite: "auto",
    });
  }, [selectedCategory]);

  const byCategory = Object.fromEntries(
    HOME_CATS.map((c) => [c, POSTS.filter((p) => p.category === c).slice(0, 4)])
  );

  const visibleCats = selectedCategory === "ALL"
    ? HOME_CATS
    : HOME_CATS.filter((c) => c === selectedCategory);

  return (
    <div ref={pageRef} className="page-pt">
      {/* ══════════════════════════════════════════════════════
          HERO — fullscreen overlay, 3D behind text
      ══════════════════════════════════════════════════════ */}
      <section
        style={{
          height: "calc(100vh - var(--header-h))",
          minHeight: 600,
          position: "relative",
          display: "flex",
          alignItems: "center",
          justifyContent: "center",
          borderBottom: "1px solid var(--border-light)",
          overflow: "hidden",
        }}
        className="hero-section"
      >
        {/* LightPillar — fullscreen background */}
        <LightPillar
          topColor="#030303"
          bottomColor="#007a3d"
          intensity={1.0}
          rotationSpeed={0.3}
          glowAmount={0.005}
          pillarWidth={3.0}
          pillarHeight={0.4}
          noiseIntensity={0.5}
          mixBlendMode="normal"
          pillarRotation={45}
          quality="high"
        />

        {/* Gradient overlays for text readability */}
        <div
          style={{
            position: "absolute",
            inset: 0,
            zIndex: 1,
            background: "radial-gradient(ellipse at center, transparent 30%, rgba(0,0,0,0.7) 80%)",
            pointerEvents: "none",
          }}
        />
        <div
          style={{
            position: "absolute",
            bottom: 0,
            left: 0,
            right: 0,
            height: "30%",
            zIndex: 1,
            background: "linear-gradient(to top, #000 0%, transparent 100%)",
            pointerEvents: "none",
          }}
        />

        {/* Text content — centered over 3D */}
        <div
          style={{
            position: "relative",
            zIndex: 2,
            display: "flex",
            flexDirection: "column",
            alignItems: "center",
            textAlign: "center",
            padding: "clamp(24px, 4vw, 60px)",
            maxWidth: 900,
          }}
        >
          {/* Eyebrow */}
          <p className="hero-eyebrow section-label" style={{ marginBottom: 28, justifyContent: "center", color: "rgba(255,255,255,0.65)" }}>
            <span style={{ width: 16, height: 1, background: "var(--accent)", display: "inline-block" }} />
            SUPERINTELLIGENZA BLOG
          </p>

          {/* Headline */}
          <h1
            style={{
              fontFamily: "var(--font-display)",
              fontWeight: 800,
              fontSize: "var(--fs-h1)",
              lineHeight: 0.9,
              letterSpacing: "-0.05em",
              color: "var(--text-primary)",
              marginBottom: 28,
              textShadow: "0 0 60px rgba(0,0,0,0.8)",
            }}
          >
            <span className="hero-line-1" style={{ display: "block" }}>
              Dietro ogni
            </span>
            <span
              className="hero-line-2"
              style={{
                display: "block",
                color: "var(--accent)",
                textShadow: "0 0 40px var(--accent-glow), 0 0 80px var(--accent-glow-sm)",
              }}
            >
              click.
            </span>
          </h1>

          {/* Subtitle */}
          <p
            className="hero-sub"
            style={{
              fontSize: "clamp(0.875rem, 1.2vw, 1.05rem)",
              fontWeight: 300,
              lineHeight: 1.75,
              color: "rgba(255,255,255,0.72)",
              maxWidth: 440,
              marginBottom: 40,
            }}
          >
            Insights, analisi e visioni dal futuro digitale. Dove il pensiero incontra la macchina.
          </p>

          {/* Category pills */}
          <div
            className="hero-pills scrollbar-hide"
            style={{
              display: "flex",
              flexWrap: "wrap",
              gap: 6,
              justifyContent: "center",
            }}
          >
            <button onClick={() => setSelectedCategory("ALL")} className={`interactive pill-btn ${selectedCategory === "ALL" ? "active" : ""}`}>
              TUTTI
            </button>
            {CATEGORIES.map((cat) => (
              <button key={cat} onClick={() => setSelectedCategory(cat)} className={`interactive pill-btn ${selectedCategory === cat ? "active" : ""}`}>
                {cat}
              </button>
            ))}
          </div>
        </div>
      </section>

      {/* ══════════════════════════════════════════════════════
          ARTICLES SECTION — 4 category blocks
      ══════════════════════════════════════════════════════ */}
      <section className="container-bliss categories-wrapper" style={{ padding: "clamp(60px,8vw,100px) 0" }}>

        {visibleCats.length === 0 && (
          <p
            style={{
              fontFamily: "var(--font-mono)",
              fontSize: 11,
              letterSpacing: "0.3em",
              textTransform: "uppercase",
              opacity: 0.2,
              padding: "80px 0",
            }}
          >
            NESSUN RISULTATO
          </p>
        )}

        {visibleCats.map((cat) => {
          const posts = byCategory[cat] || [];
          return (
            <div key={cat} className="cat-section" style={{ marginBottom: "clamp(52px,7vw,88px)" }}>
              {/* Category header */}
              <div
                style={{
                  display: "flex",
                  alignItems: "center",
                  justifyContent: "space-between",
                  marginBottom: 8,
                  paddingBottom: 14,
                  borderBottom: "1px solid var(--border-light)",
                }}
              >
                <div style={{ display: "flex", alignItems: "center", gap: 12 }}>
                  <span
                    style={{
                      width: 16,
                      height: 1,
                      background: "var(--accent)",
                      display: "inline-block",
                      flexShrink: 0,
                    }}
                  />
                  <span className="cat-tag" style={{ fontSize: 10, letterSpacing: "0.12em" }}>
                    {CAT_LABELS[cat] || cat}
                  </span>
                </div>
                <Link
                  to="/blog"
                  className="interactive"
                  style={{
                    fontFamily: "var(--font-mono)",
                    fontSize: 9,
                    letterSpacing: "0.14em",
                    textTransform: "uppercase",
                    color: "var(--text-dim)",
                    display: "flex",
                    alignItems: "center",
                    gap: 6,
                    transition: "color 0.25s",
                    textDecoration: "none",
                  }}
                  onMouseEnter={(e) => (e.currentTarget.style.color = "var(--accent)")}
                  onMouseLeave={(e) => (e.currentTarget.style.color = "var(--text-dim)")}
                >
                  VEDI TUTTI <ArrowRight size={10} />
                </Link>
              </div>

              {/* 4 expandable rows */}
              <div>
                {posts.map((post, i) => (
                  <ExpandableRow key={post.id} post={post} index={i} />
                ))}
              </div>
            </div>
          );
        })}
      </section>

      {/* ══════════════════════════════════════════════════════
          CTA
      ══════════════════════════════════════════════════════ */}
      <section
        style={{
          borderTop: "1px solid var(--border-light)",
          padding: "clamp(70px,9vw,110px) 0",
        }}
      >
        <div
          className="cta-grid container-bliss"
          style={{
            display: "grid",
            gridTemplateColumns: "1fr auto",
            alignItems: "center",
            gap: 40,
          }}
        >
          <div>
            <p className="section-label" style={{ marginBottom: 16 }}>
              <span style={{ width: 16, height: 1, background: "var(--accent)", display: "inline-block" }} />
              RESTA CONNESSO
            </p>
            <h2
              style={{
                fontFamily: "var(--font-display)",
                fontWeight: 800,
                fontSize: "var(--fs-h2)",
                lineHeight: 1.0,
                letterSpacing: "-0.035em",
                color: "var(--text-primary)",
              }}
            >
              Il futuro è<br />
              già cominciato.
            </h2>
          </div>

          <Link to="/blog" className="interactive btn-primary" style={{ textDecoration: 'none' }}>
            ESPLORA IL BLOG
            <ArrowRight size={14} />
          </Link>
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
          .preview-card { grid-template-columns: 1fr !important; height: auto !important; }
          .cta-grid { grid-template-columns: 1fr !important; }
        }
      `}</style>
    </div>
  );
};

export default Home;
