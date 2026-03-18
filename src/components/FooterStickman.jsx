import { useEffect, useRef } from 'react';
import gsap from 'gsap';

const COL = '#00ff7f';

const FooterStickman = ({ footerRef }) => {
  const canvasRef = useRef(null);

  useEffect(() => {
    const canvas = canvasRef.current;
    if (!canvas) return;
    const ctx  = canvas.getContext('2d');
    const root = footerRef?.current || canvas.parentElement;
    let animId, masterTl;
    const dpr = Math.min(window.devicePixelRatio || 1, 2);

    /* ── Resize ──────────────────────────────────────────────── */
    const resize = () => {
      const r = root.getBoundingClientRect();
      canvas.width  = Math.floor(r.width  * dpr);
      canvas.height = Math.floor(r.height * dpr);
      canvas.style.width  = r.width  + 'px';
      canvas.style.height = r.height + 'px';
      ctx.setTransform(dpr, 0, 0, dpr, 0, 0);
    };
    resize();

    /* ── Proportions ─────────────────────────────────────────── */
    const P = { headR: 6, neckLen: 5, torsoLen: 22, upperArm: 13, foreArm: 11, upperLeg: 16, lowerLeg: 14 };
    const feetLen = P.upperLeg + P.lowerLeg;

    /* ── GSAP-driven state ───────────────────────────────────── */
    const s = {
      x: -80, y: 0,
      lean: 0, faceDir: 1, opacity: 1,
      headTilt: 0, headNod: 0,
      lShoulder: 0.22, lElbow: 0.12, rShoulder: -0.22, rElbow: 0.12,
      lHip: 0.07, lKnee: 0.07, rHip: -0.07, rKnee: 0.07,
      phase: 0, speed: 0,
    };

    /* ── Cursor state (independent of GSAP) ─────────────────── */
    const cursor  = { x: -9999, y: -9999, active: false };
    const look    = { tilt: 0, nod: 0 };  // smoothed look direction
    let isFleeing = false;

    /* ── Draw ────────────────────────────────────────────────── */
    const draw = () => {
      ctx.clearRect(0, 0, canvas.width / dpr, canvas.height / dpr);
      s.phase += s.speed;
      const ws = Math.sin(s.phase), wc = Math.cos(s.phase), wAbs = Math.abs(wc);

      // Smooth head toward cursor (overrides GSAP head state)
      const headWorldY = s.y - feetLen - P.torsoLen - P.neckLen;
      if (cursor.active) {
        const dx = cursor.x - s.x;
        const dy = cursor.y - headWorldY;
        const targetTilt = Math.max(-0.55, Math.min(0.55, dx / 160));
        const targetNod  = Math.max(-0.38, Math.min(0.30, -dy / 140));
        look.tilt += (targetTilt - look.tilt) * 0.13;
        look.nod  += (targetNod  - look.nod)  * 0.13;
      } else {
        look.tilt += (s.headTilt - look.tilt) * 0.09;
        look.nod  += (s.headNod  - look.nod)  * 0.09;
      }

      ctx.save();
      ctx.translate(s.x, s.y);
      ctx.globalAlpha = s.opacity;
      ctx.strokeStyle = COL; ctx.fillStyle = COL;
      ctx.lineCap = 'round'; ctx.lineJoin = 'round';
      ctx.shadowColor = COL; ctx.shadowBlur = 8;

      const pelBob = s.speed !== 0 ? wAbs * 2.5 : 0;
      const pelY = -feetLen - pelBob, pelX = ws * 1.2;
      const lean = s.lean + ws * 0.022;
      const shlX = pelX + Math.sin(lean) * P.torsoLen;
      const shlY = pelY - Math.cos(lean) * P.torsoLen;
      const nkX  = shlX + Math.sin(look.tilt) * P.neckLen;
      const nkY  = shlY - Math.cos(look.nod)  * P.neckLen - Math.sin(look.nod) * P.neckLen * 0.4;
      const hcX  = nkX, hcY = nkY - P.headR;

      [{ hip: s.lHip + ws * 0.32, knee: s.lKnee + wAbs * 0.20 },
       { hip: s.rHip - ws * 0.32, knee: s.rKnee + wAbs * 0.20 }]
        .forEach(({ hip, knee }) => {
          const kx = pelX + Math.sin(hip) * P.upperLeg;
          const ky = pelY + Math.cos(hip) * P.upperLeg;
          const fa = hip * (1 - Math.max(0, Math.min(0.95, knee)));
          const fx = kx + Math.sin(fa) * P.lowerLeg;
          const fy = ky + Math.cos(fa) * P.lowerLeg;
          const w = (hip === s.lHip + ws * 0.32) ? 3.5 : 3;
          ctx.lineWidth = w; ctx.beginPath(); ctx.moveTo(pelX, pelY); ctx.lineTo(kx, ky); ctx.stroke();
          ctx.lineWidth = w - 0.5; ctx.beginPath(); ctx.moveTo(kx, ky); ctx.lineTo(fx, fy); ctx.stroke();
          ctx.lineWidth = 2.5; ctx.beginPath(); ctx.moveTo(fx - s.faceDir * 2, fy); ctx.lineTo(fx + s.faceDir * 7, fy); ctx.stroke();
        });

      ctx.lineWidth = 4; ctx.beginPath(); ctx.moveTo(pelX, pelY); ctx.lineTo(shlX, shlY); ctx.stroke();

      // Right arm reaches toward cursor if it's above and close
      const cursorNearby = cursor.active && Math.hypot(cursor.x - s.x, cursor.y - headWorldY) < 120;
      const rShTarget = cursorNearby
        ? Math.max(-1.4, Math.min(0.8, -(cursor.y - headWorldY) / 60))
        : s.rShoulder - wc * 0.18;

      [{ sh: s.lShoulder + wc * 0.18, elbow: s.lElbow, side: -1 },
       { sh: rShTarget,               elbow: s.rElbow,  side:  1 }]
        .forEach(({ sh, elbow, side }) => {
          const ex = shlX + Math.sin(sh) * P.upperArm;
          const ey = shlY + Math.cos(sh) * P.upperArm;
          const fa = sh + elbow * side;
          ctx.lineWidth = 3;   ctx.beginPath(); ctx.moveTo(shlX, shlY); ctx.lineTo(ex, ey); ctx.stroke();
          ctx.lineWidth = 2.5; ctx.beginPath(); ctx.moveTo(ex, ey); ctx.lineTo(ex + Math.sin(fa) * P.foreArm, ey + Math.cos(fa) * P.foreArm); ctx.stroke();
        });

      ctx.lineWidth = 3; ctx.beginPath(); ctx.moveTo(shlX, shlY); ctx.lineTo(nkX, nkY); ctx.stroke();
      ctx.lineWidth = 2.5;
      ctx.beginPath(); ctx.arc(hcX, hcY, P.headR, 0, Math.PI * 2); ctx.stroke();
      ctx.beginPath(); ctx.arc(hcX + s.faceDir * 3.5, hcY - 0.5 + look.nod * 2, 1.6, 0, Math.PI * 2); ctx.fill();

      ctx.restore();
    };

    const loop = () => { draw(); animId = requestAnimationFrame(loop); };
    loop();

    /* ── Cursor events ───────────────────────────────────────── */
    const flee = (towardX) => {
      if (isFleeing) return;
      isFleeing = true;
      masterTl?.pause();
      const dir    = towardX < s.x ? 1 : -1;
      const fleeX  = Math.max(20, Math.min(W - 20, s.x + dir * 110));
      gsap.killTweensOf(s, 'x,speed,lean,faceDir');
      const tl = gsap.timeline({
        onComplete: () => {
          setTimeout(() => { isFleeing = false; masterTl?.resume(); }, 600);
        },
      });
      tl.to(s, { faceDir: dir, speed: dir * 0.25, lean: dir * 0.15, duration: 0.08 });
      tl.to(s, { x: fleeX, duration: 0.45, ease: 'power3.out' }, '<0.04');
      tl.to(s, { speed: 0, lean: 0, duration: 0.22, ease: 'power2.out' });
    };

    const onMouseMove = (e) => {
      const r = root.getBoundingClientRect();
      cursor.x = e.clientX - r.left;
      cursor.y = e.clientY - r.top;
      cursor.active = true;
      const dist = Math.hypot(cursor.x - s.x, cursor.y - s.y);
      if (dist < 52) flee(cursor.x);
    };
    const onMouseLeave = () => { cursor.active = false; };
    const onClick = (e) => {
      const r = root.getBoundingClientRect();
      const cx = e.clientX - r.left, cy = e.clientY - r.top;
      const dist = Math.hypot(cx - s.x, cy - s.y);
      if (dist < 120) {
        // Clicked near stickman → celebrate
        gsap.killTweensOf(s);
        masterTl?.pause();
        const tl = gsap.timeline({
          onComplete: () => { setTimeout(() => { isFleeing = false; masterTl?.resume(); }, 400); },
        });
        tl.to(s, { y: s.y - 38, lHip: -0.5, rHip: 0.5, lKnee: 0.08, rKnee: 0.08, lShoulder: -1.1, rShoulder: 1.1, duration: 0.24, ease: 'power2.out' });
        tl.to(s, { y: curY, lHip: 0.22, rHip: -0.22, lKnee: 0.55, rKnee: 0.55, duration: 0.20, ease: 'power2.in' });
        tl.to(s, { ...IDLE, duration: 0.24, ease: 'elastic.out(1, 0.5)' });
        isFleeing = true;
      }
    };

    root.addEventListener('mousemove',  onMouseMove, { passive: true });
    root.addEventListener('mouseleave', onMouseLeave);
    root.addEventListener('click',      onClick);

    /* ── DOM position helper ─────────────────────────────────── */
    const rel = (el) => {
      if (!el) return null;
      const fr = root.getBoundingClientRect(), er = el.getBoundingClientRect();
      return { top: er.top - fr.top, bottom: er.bottom - fr.top, left: er.left - fr.left, right: er.right - fr.left, midX: (er.left + er.right) / 2 - fr.left, w: er.width, h: er.height };
    };

    /* ── Text splitting ──────────────────────────────────────── */
    const splitIntoChars = (el) => {
      if (!el) return { spans: [], restore: () => {} };
      const originalHTML = el.innerHTML;
      el.innerHTML = '';
      const spans = [...el.textContent || ''].map(ch => {
        const sp = document.createElement('span');
        sp.textContent = ch;
        sp.style.cssText = 'display:inline-block;position:relative;white-space:pre;';
        el.appendChild(sp);
        return sp;
      });
      return { spans, restore: () => { el.innerHTML = originalHTML; } };
    };

    /* ── Query & split ───────────────────────────────────────── */
    const logoLink  = root.querySelector('a[href="/"]');
    const intellEl  = logoLink?.querySelector('span:last-child');
    const superEl   = logoLink?.querySelector('span:first-child');
    const socialEls = Array.from(root.querySelectorAll('.icon-btn'));
    const copyEl    = root.querySelector('footer > div > div:last-child > span:first-child');
    const futureEl  = root.querySelector('footer > div > div:last-child > span:last-child');
    const borderEl  = root.querySelector('footer > div > div:last-child');

    const { spans: superChars,  restore: restoreSuper  } = splitIntoChars(superEl);
    const { spans: futureChars, restore: restoreFuture } = splitIntoChars(futureEl);

    /* ── Layout ──────────────────────────────────────────────── */
    const W = root.getBoundingClientRect().width;
    const H = root.getBoundingClientRect().height;
    const ground = H - 4;

    const logoR   = rel(logoLink);
    const intellR = rel(intellEl);
    const socRs   = socialEls.map(rel).filter(Boolean);
    const copyR   = rel(copyEl);
    const borderR = rel(borderEl);
    const superRs = superChars.map(rel);

    const futureLetters = futureChars.map(sp => ({ sp, r: rel(sp) })).filter(({ sp }) => sp.textContent.trim() !== '');

    const logoLeft  = logoR    ? logoR.left  - 6    : W * 0.08;
    const onLogoY   = logoR    ? logoR.top   - feetLen : ground - 100;
    const intellX   = intellR  ? intellR.left - 8   : W * 0.16;
    const soc0X     = socRs[0] ? socRs[0].midX      : W * 0.14;
    const soc1X     = socRs[1] ? socRs[1].midX      : W * 0.17;
    const soc2X     = socRs[2] ? socRs[2].midX      : W * 0.20;
    const socTopY   = socRs[0] ? socRs[0].top       : H * 0.52;
    const barY      = borderR  ? borderR.top         : H * 0.74;
    const copyX     = copyR    ? copyR.left + 8      : W * 0.10;
    const futureX   = futureLetters[0] ? futureLetters[0].r.left - 8 : W * 0.74;

    /* ── Poses ───────────────────────────────────────────────── */
    const IDLE = { lHip: 0.07, lKnee: 0.07, rHip: -0.07, rKnee: 0.07, lShoulder: 0.22, lElbow: 0.12, rShoulder: -0.22, rElbow: 0.12, lean: 0, headTilt: 0, headNod: 0 };
    const SQUAT = { lHip: 0.32, lKnee: 0.64, rHip: -0.32, rKnee: 0.64, lShoulder: 0.18, rShoulder: -0.18, lean: 0.12 };
    const AIR   = { lHip: -0.38, lKnee: 0.22, rHip: 0.38, rKnee: 0.22, lShoulder: -0.95, rShoulder: 0.95, lean: -0.1 };
    const SIT   = { lHip: 0.78, lKnee: 0.72, rHip: -0.78, rKnee: 0.72, lShoulder: 0.12, lElbow: 0.30, rShoulder: -0.12, rElbow: 0.30, lean: 0.07 };

    const pose = (tl, p, dur = 0.26, ease = 'power2.out') => tl.to(s, { ...p, duration: dur, ease });

    /* ── Motion helpers ──────────────────────────────────────── */
    let curX = -80, curY = ground;

    const walkTo = (tl, tx, ty, spd = 160) => {
      const dir = tx > curX ? 1 : -1;
      const dur = Math.max(Math.abs(tx - curX) / spd, 0.10);
      curX = tx; curY = ty;
      tl.to(s, { speed: dir * 0.19, lean: dir * 0.10, faceDir: dir, duration: 0.14, ease: 'power2.in' });
      tl.to(s, { x: tx, y: ty, duration: dur, ease: 'none' }, '<0.08');
      tl.to(s, { speed: 0, lean: 0, duration: 0.18, ease: 'power2.out' });
      pose(tl, IDLE, 0.18);
    };
    const jumpTo = (tl, tx, ty, arcH = 36) => {
      const dir = tx > curX ? 1 : -1;
      s.faceDir = dir; curX = tx; curY = ty;
      pose(tl, SQUAT, 0.13, 'power2.in');
      tl.to(s, { x: tx, y: ty - arcH, ...AIR, duration: 0.25, ease: 'power2.out' });
      tl.to(s, { y: ty, lHip: 0.22, rHip: -0.22, lKnee: 0.52, rKnee: 0.52, duration: 0.18, ease: 'power2.in' });
      pose(tl, IDLE, 0.24, 'elastic.out(1, 0.5)');
    };
    const wave = (tl) => {
      tl.to(s, { rShoulder: 1.30, rElbow: 0.08, duration: 0.13, ease: 'power2.out' });
      tl.to(s, { rShoulder: 0.70, rElbow: 0.40, duration: 0.13, ease: 'power2.in' });
      tl.to(s, { rShoulder: 1.20, rElbow: 0.10, duration: 0.12, ease: 'power2.out' });
      tl.to(s, { rShoulder: -0.22, rElbow: 0.12, duration: 0.16 });
    };

    /* ── DOM reset ───────────────────────────────────────────── */
    const resetDom = () => {
      [logoLink, intellEl, ...socialEls, copyEl, futureEl, borderEl, ...superChars, ...futureChars]
        .forEach(el => { if (el) gsap.set(el, { clearProps: 'all' }); });
    };

    /* ── Timeline ────────────────────────────────────────────── */
    Object.assign(s, IDLE, { x: -80, y: ground });

    masterTl = gsap.timeline({
      repeat: -1, repeatDelay: 4, delay: 0.6,
      onRepeat: () => {
        resetDom();
        Object.assign(s, IDLE, { x: -80, y: ground, opacity: 1, phase: 0 });
        curX = -80; curY = ground;
      },
    });

    // ── Enter → push "intelligenza" ──────────────────────────
    walkTo(masterTl, intellX, ground, 200);
    masterTl.to(s, { faceDir: 1, duration: 0.01 });
    masterTl.to(s, { lean: 0.33, rShoulder: 0.84, rElbow: 0.62, lShoulder: 0.46, lElbow: 0.42, lHip: 0.24, lKnee: 0.40, rHip: -0.14, rKnee: 0.20, duration: 0.24, ease: 'power2.out' });
    if (intellEl) masterTl.to(intellEl, { x: 28, duration: 0.36, ease: 'power2.out' }, '<');
    masterTl.to(s, { lean: 0.37, duration: 0.28, ease: 'sine.inOut', yoyo: true, repeat: 2 });
    if (intellEl) masterTl.to(intellEl, { x: 0, duration: 0.48, ease: 'elastic.out(1, 0.4)' });
    pose(masterTl, IDLE, 0.18);

    // ── Jump onto logo, walk along kicking every letter ───────
    jumpTo(masterTl, logoLeft + 4, onLogoY, 32);
    if (superRs.length > 0) {
      const lastR = superRs[superRs.length - 1];
      const walkEnd = lastR ? lastR.right + 6 : logoLeft + 80;
      // Walk across — each char topples as stickman's X passes it
      masterTl.to(s, { speed: 0.18, lean: 0.09, faceDir: 1, duration: 0.12 });
      superChars.forEach((ch, i) => {
        if (!ch.textContent.trim() || !superRs[i]) return;
        const h = superRs[i].h;
        masterTl.to(ch, { rotation: (i % 2 === 0 ? 52 : -48), transformOrigin: 'bottom center', y: h * 0.26, duration: 0.15, ease: 'power2.in' }, `+=${i * 0.10}`);
      });
      masterTl.to(s, { x: walkEnd, duration: superChars.length * 0.10 + 0.12, ease: 'none' }, '<');
      curX = walkEnd;
      masterTl.to(s, { speed: 0, lean: 0, duration: 0.18 });
      pose(masterTl, IDLE, 0.16);
    }
    // Look back at mess → letters snap back
    masterTl.to(s, { faceDir: -1, duration: 0.05 });
    superChars.forEach(ch => { masterTl.to(ch, { rotation: 0, y: 0, duration: 0.50, ease: 'elastic.out(1, 0.4)' }, '<0.02'); });
    masterTl.to(s, { faceDir: 1, duration: 0.06, delay: 0.30 });

    // ── Jump off logo, run to social icons ────────────────────
    jumpTo(masterTl, logoR ? logoR.right + 8 : intellX + 80, ground, 24);
    walkTo(masterTl, soc0X, ground, 220);
    jumpTo(masterTl, soc0X, socTopY - feetLen, 22);
    masterTl.to(socialEls[0], { y: 6, scaleY: 0.76, duration: 0.08, yoyo: true, repeat: 3, ease: 'none' });
    pose(masterTl, SQUAT, 0.11, 'power3.in');
    pose(masterTl, IDLE,  0.17, 'elastic.out(1, 0.6)');

    jumpTo(masterTl, soc1X, socTopY - feetLen, 18);
    masterTl.to(socialEls[1], { y: 6, scaleY: 0.76, duration: 0.08, yoyo: true, repeat: 3, ease: 'none' });
    pose(masterTl, SQUAT, 0.11, 'power3.in');
    pose(masterTl, IDLE,  0.17, 'elastic.out(1, 0.6)');

    jumpTo(masterTl, soc2X, socTopY - feetLen, 18);
    masterTl.to(socialEls[2], { y: 6, scaleY: 0.76, duration: 0.08, yoyo: true, repeat: 3, ease: 'none' });
    pose(masterTl, SQUAT, 0.11, 'power3.in');
    masterTl.to(s, { lean: 0.52, y: socTopY - feetLen + 7, rHip: 0.18, lHip: 0.48, rShoulder: 0.68, lShoulder: -0.18, duration: 0.18, ease: 'power2.out' });
    masterTl.to(s, { y: ground, lean: 0, duration: 0.24, ease: 'power2.in' });
    pose(masterTl, IDLE, 0.24, 'elastic.out(1, 0.4)');
    curX = soc2X; curY = ground;

    // ── Sit on bottom bar, shake copyright ────────────────────
    masterTl.to(s, { lShoulder: 0.48, lElbow: 0.42, rShoulder: -0.48, rElbow: 0.42, lean: 0.11, headNod: -0.22, duration: 0.32 }); // tired
    walkTo(masterTl, copyX, ground, 105);
    jumpTo(masterTl, copyX, barY - feetLen, 24);
    pose(masterTl, SIT, 0.26);
    masterTl.to(s, { headTilt: -0.26, duration: 0.48, ease: 'power2.inOut' });
    masterTl.to(s, { headTilt:  0.26, duration: 0.68, ease: 'power2.inOut' });
    masterTl.to(s, { headTilt:  0.00, duration: 0.28 });
    if (copyEl) masterTl.to(copyEl, { x: 5, rotation: 1.5, duration: 0.06, yoyo: true, repeat: 9, ease: 'none' });
    masterTl.to(s, { headNod: 0.18, duration: 0.18 });
    masterTl.to(s, { headNod: 0.00, duration: 0.16 });

    // ── Stand, sprint to "IL FUTURO", domino ──────────────────
    pose(masterTl, IDLE, 0.22, 'power3.out');
    walkTo(masterTl, futureX, ground, 175);
    masterTl.to(s, { faceDir: 1, duration: 0.01 });
    // sprint into first letter
    masterTl.to(s, { speed: 0.26, lean: 0.14, duration: 0.09 });
    masterTl.to(s, { x: futureX + 8, duration: 0.14, ease: 'power3.in' }, '<0.04');
    masterTl.to(s, { speed: 0, lean: 0.44, lHip: 0.30, lKnee: 0.32, duration: 0.12, ease: 'power3.out' });
    curX = futureX + 8;
    // domino
    futureLetters.forEach(({ sp, r }, i) => {
      masterTl.to(sp, { rotation: -72, transformOrigin: 'bottom left', y: (r?.h ?? 16) * 0.28, duration: 0.15, ease: 'power2.in' }, `+=${i === 0 ? 0 : 0.055}`);
    });
    // recoil
    masterTl.to(s, { lean: -0.28, x: futureX - 20, lShoulder: 0.82, rShoulder: -0.28, duration: 0.24, ease: 'power2.out' }, '<');
    pose(masterTl, IDLE, 0.24, 'elastic.out(1, 0.3)');
    curX = futureX - 20;
    masterTl.to(s, { headTilt: 0.20, duration: 0.22 });
    // letters snap back
    futureLetters.forEach(({ sp }) => { masterTl.to(sp, { rotation: 0, y: 0, duration: 0.52, ease: 'elastic.out(1, 0.4)' }, '<0.02'); });
    masterTl.to(s, { headTilt: 0, duration: 0.18, delay: 0.12 });
    // shrug
    masterTl.to(s, { lShoulder: -0.80, lElbow: 0.80, rShoulder: 0.80, rElbow: 0.80, headTilt: 0.18, lean: 0.05, duration: 0.20 });
    masterTl.to(s, { lShoulder: 0.22, lElbow: 0.12, rShoulder: -0.22, rElbow: 0.12, headTilt: 0, lean: 0, duration: 0.20 });

    // ── Celebrate, wave, exit ─────────────────────────────────
    walkTo(masterTl, W * 0.84, ground, 260);
    pose(masterTl, SQUAT, 0.12, 'power2.in');
    masterTl.to(s, { y: curY - 38, lHip: -0.50, rHip: 0.50, lKnee: 0.08, rKnee: 0.08, lShoulder: -1.10, rShoulder: 1.10, duration: 0.24, ease: 'power2.out' });
    masterTl.to(s, { y: curY, lHip: 0.22, rHip: -0.22, lKnee: 0.52, rKnee: 0.52, duration: 0.18, ease: 'power2.in' });
    pose(masterTl, IDLE, 0.24, 'elastic.out(1, 0.5)');
    wave(masterTl);
    masterTl.to(s, { faceDir: 1, duration: 0.01 });
    masterTl.to(s, { speed: 0.26, lean: 0.13, duration: 0.10 });
    masterTl.to(s, { x: W + 90, duration: 1.4, ease: 'power1.in' });

    /* ── Cleanup ─────────────────────────────────────────────── */
    const ro = new ResizeObserver(resize);
    ro.observe(root);

    return () => {
      cancelAnimationFrame(animId);
      masterTl?.kill();
      ro.disconnect();
      root.removeEventListener('mousemove',  onMouseMove);
      root.removeEventListener('mouseleave', onMouseLeave);
      root.removeEventListener('click',      onClick);
      resetDom();
      restoreSuper();
      restoreFuture();
    };
  }, [footerRef]);

  return (
    <canvas
      ref={canvasRef}
      style={{ position: 'absolute', inset: 0, pointerEvents: 'none', zIndex: 10 }}
    />
  );
};

export default FooterStickman;
