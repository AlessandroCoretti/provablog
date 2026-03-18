import { useState, useEffect } from 'react';
import gsap from 'gsap';
import { ScrollToPlugin } from 'gsap/ScrollToPlugin';

gsap.registerPlugin(ScrollToPlugin);

export const processArticleContent = (html) => {
  const items = [];
  let i = 0;
  const processedHtml = html.replace(/<h2>([\s\S]*?)<\/h2>/g, (_, inner) => {
    const id   = `toc-${i}`;
    const text = inner.replace(/<[^>]+>/g, '').trim();
    items.push({ id, text });
    i++;
    return `<h2 id="${id}">${inner}</h2>`;
  });
  return { processedHtml, items };
};

const TableOfContents = ({ items }) => {
  const [activeId, setActiveId] = useState(items[0]?.id ?? '');

  useEffect(() => {
    if (items.length === 0) return;
    const observer = new IntersectionObserver(
      (entries) => {
        const visible = entries
          .filter(e => e.isIntersecting)
          .sort((a, b) => a.boundingClientRect.top - b.boundingClientRect.top);
        if (visible.length > 0) setActiveId(visible[0].target.id);
      },
      { rootMargin: '-10% 0% -75% 0%', threshold: 0 },
    );
    items.forEach(({ id }) => {
      const el = document.getElementById(id);
      if (el) observer.observe(el);
    });
    return () => observer.disconnect();
  }, [items]);

  const scrollTo = (id) => {
    const el = document.getElementById(id);
    if (!el) return;
    gsap.to(window, {
      duration: 0.9,
      scrollTo: { y: el, offsetY: 110 },
      ease: 'power3.inOut',
    });
  };

  if (items.length === 0) return null;

  return (
    <nav className="toc-root" aria-label="Indice">
      <p className="toc-label">INDICE</p>
      <ol style={{ listStyle: 'none', padding: 0, margin: 0 }}>
        {items.map(({ id, text }) => (
          <li key={id}>
            <button
              onClick={() => scrollTo(id)}
              className={`interactive toc-item ${activeId === id ? 'toc-active' : ''}`}
            >
              {text}
            </button>
          </li>
        ))}
      </ol>
    </nav>
  );
};

export default TableOfContents;
