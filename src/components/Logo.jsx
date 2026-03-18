/**
 * LOGO — "SYNAPTIC TRISKELION"
 *
 * Concept: tre braccia spiralanti (come galassia / turbina neurale)
 * che ruotano attorno a un nucleo centrale luminoso.
 * Rappresenta i tre assi della superintelligenza:
 * percezione → ragionamento → azione — in ciclo perpetuo.
 *
 * 3D: tre pale di turbina curvilinee + sfera nucleus + anello toro.
 * Scansione: logo mark senza lettere, riconoscibile a qualunque scala.
 */

const Logo = ({
  size = 36,
  accentColor = "var(--accent)",
  baseColor = "rgba(255,255,255,0.85)",
  className = "",
}) => {
  const id = "sg";

  return (
    <svg
      width={size}
      height={size}
      viewBox="0 0 100 100"
      fill="none"
      xmlns="http://www.w3.org/2000/svg"
      className={className}
      aria-label="Superintelligenza"
      style={{ display: "block" }}
    >
      <defs>
        {/* Glow radiale attorno al nucleo */}
        <radialGradient id={`${id}-halo`} cx="50%" cy="50%" r="50%">
          <stop offset="0%"   stopColor={accentColor} stopOpacity="0.28" />
          <stop offset="100%" stopColor={accentColor} stopOpacity="0"   />
        </radialGradient>

        {/* Sfumatura lungo ogni braccio: opaco all'inizio, pieno alla fine */}
        <linearGradient id={`${id}-arm`} x1="0%" y1="0%" x2="100%" y2="100%">
          <stop offset="0%"   stopColor={accentColor} stopOpacity="0.45" />
          <stop offset="100%" stopColor={accentColor} stopOpacity="0.95" />
        </linearGradient>
      </defs>

      {/* ── Anello esterno (cornice di riferimento) ─────────────── */}
      <circle
        cx="50" cy="50" r="43"
        stroke={accentColor}
        strokeWidth="0.7"
        opacity="0.28"
      />

      {/* ── Anello intermedio tratteggiato ───────────────────────── */}
      <circle
        cx="50" cy="50" r="28"
        stroke={accentColor}
        strokeWidth="0.5"
        strokeDasharray="2.8 4.6"
        opacity="0.18"
      />

      {/* ── Halo morbido attorno al nucleo ───────────────────────── */}
      <circle cx="50" cy="50" r="20" fill={`url(#${id}-halo)`} />

      {/* ── Tre braccia spiralanti — triskelion ─────────────────────
           Curva: parte dal bordo esterno (top, r=43),
           si allarga verso l'esterno come ala galattica,
           poi rientra verso il centro. Rotazione 120° per braccio.  */}
      {[0, 120, 240].map((deg) => (
        <g key={deg} transform={`rotate(${deg}, 50, 50)`}>
          {/* Alone morbido del braccio */}
          <path
            d="M 50 7 C 82 14, 68 44, 55 50"
            stroke={accentColor}
            strokeWidth="5"
            strokeLinecap="round"
            opacity="0.08"
          />
          {/* Braccio principale */}
          <path
            d="M 50 7 C 82 14, 68 44, 55 50"
            stroke={accentColor}
            strokeWidth="1.9"
            strokeLinecap="round"
            opacity="0.88"
          />
        </g>
      ))}

      {/* ── Dot satellite alle origini dei bracci (sul ring esterno) */}
      {[0, 120, 240].map((deg) => (
        <circle
          key={deg}
          cx="50" cy="7" r="3"
          fill={accentColor}
          transform={`rotate(${deg}, 50, 50)`}
        />
      ))}

      {/* ── Piccolo cerchio nucleo ────────────────────────────────── */}
      <circle
        cx="50" cy="50" r="9.5"
        stroke={baseColor}
        strokeWidth="0.7"
        opacity="0.18"
      />

      {/* ── Nucleo centrale (glow layer) ──────────────────────────── */}
      <circle cx="50" cy="50" r="6.5" fill={accentColor} opacity="0.35" />

      {/* ── Nucleo pieno ─────────────────────────────────────────── */}
      <circle cx="50" cy="50" r="4.8" fill={accentColor} />

      {/* ── Pupilla interna ──────────────────────────────────────── */}
      <circle cx="50" cy="50" r="1.9" fill="#000" opacity="0.72" />
    </svg>
  );
};

export default Logo;
