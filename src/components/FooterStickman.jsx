import { useEffect, useRef } from 'react';
import gsap from 'gsap';

/**
 * Stick figure with correct anatomical joint bending and human-weight animation.
 *
 * KNEE RULE: lower leg angle = hipAngle * (1 – kneeBend)
 *   → kneeBend=0 → leg fully straight
 *   → kneeBend=1 → lower leg is vertical (max bend)
 *   → works correctly whether leg is forward OR backward
 *
 * ARM RULE: forearm angle = shoulderAngle + elbowBend * side
 *   (elbows always curl toward body center)
 */

const COL = '#00ff7f';

const FooterStickman = ({ footerRef }) => {
  const canvasRef = useRef(null);

  useEffect(() => {
    const canvas = canvasRef.current;
    if (!canvas) return;
    const ctx  = canvas.getContext('2d');
    const root = footerRef?.current || canvas.parentElement;
    let animId;
    let masterTl;

    const dpr = Math.min(window.devicePixelRatio || 1, 2);

    /* ── Resize ─────────────────────────────────────────────── */
    const resize = () => {
      const r = root.getBoundingClientRect();
      canvas.width  = Math.floor(r.width  * dpr);
      canvas.height = Math.floor(r.height * dpr);
      canvas.style.width  = r.width  + 'px';
      canvas.style.height = r.height + 'px';
      ctx.setTransform(dpr, 0, 0, dpr, 0, 0);
    };
    resize();

    /* ── Proportions (bigger = more visible) ─────────────────── */
    const P = {
      headR:     6,
      neckLen:   5,
      torsoLen: 22,
      upperArm: 13,
      foreArm:  11,
      upperLeg: 16,
      lowerLeg: 14,
    };


    /* ── State ─────────────────────────────────────────────────
       All angles in radians. 0 = pointing straight DOWN.
       Positive = tilting right.  ──────────────────────────── */
    const s = {
      x: -80, y: 0,
      lean: 0,          // whole-body tilt (spine from vertical)
      opacity: 1,

      // Head
      headTilt: 0,      // side sway

      // Arms — angle from shoulder (0=down), elbowBend ∈ [0,1]
      lShoulder: 0.25,
      lElbow:    0.15,  // bend amount
      rShoulder: -0.25,
      rElbow:    0.15,

      // Legs — hipAngle (0=down), kneeBend ∈ [0,1]
      lHip:   0.08,
      lKnee:  0.08,
      rHip:  -0.08,
      rKnee:  0.08,

      // Walk cycle
      phase: 0,
      speed: 0,         // drives phase per frame
    };

    /* ── Draw helpers ────────────────────────────────────────── */
    const seg = (x1, y1, x2, y2, w) => {
      ctx.lineWidth = w;
      ctx.beginPath();
      ctx.moveTo(x1, y1);
      ctx.lineTo(x2, y2);
      ctx.stroke();
    };

    const dot = (x, y, r) => {
      ctx.beginPath();
      ctx.arc(x, y, r, 0, Math.PI * 2);
      ctx.fill();
    };

    /* ── Draw one frame ──────────────────────────────────────── */
    const draw = () => {
      const cW = canvas.width  / dpr;
      const cH = canvas.height / dpr;
      ctx.clearRect(0, 0, cW, cH);

      s.phase += s.speed;

      const ws = Math.sin(s.phase);       // walking sine
      const wc = Math.cos(s.phase);       // walking cosine

      ctx.save();
      ctx.translate(s.x, s.y);
      ctx.globalAlpha = s.opacity;
      ctx.strokeStyle = COL;
      ctx.fillStyle   = COL;
      ctx.lineCap     = 'round';
      ctx.lineJoin    = 'round';
      ctx.shadowColor = COL;
      ctx.shadowBlur  = 10;

      // ── Pelvis — just above the feet ──────────────────────
      // Feet at y=0, pelvis at y = -(upperLeg + lowerLeg)
      const pelY = -(P.upperLeg + P.lowerLeg);
      const pelX = ws * 1.5;             // subtle hip sway

      // ── Shoulders — top of spine ──────────────────────────
      const lean  = s.lean + ws * 0.025; // secondary lean sway
      const shlX  = pelX + Math.sin(lean) * P.torsoLen;
      const shlY  = pelY - Math.cos(lean) * P.torsoLen;

      // ── Neck tip / chin ───────────────────────────────────
      const nkX = shlX + Math.sin(s.headTilt) * P.neckLen;
      const nkY = shlY - Math.cos(s.headTilt) * P.neckLen;
      // Head centre
      const hcY = nkY - P.headR;

      // ── LEGS ─────────────────────────────────────────────
      // Walking: left and right alternate with ws
      const legs = [
        { hip: s.lHip + ws * 0.30, knee: s.lKnee + Math.abs(wc) * 0.18, side: -1 },
        { hip: s.rHip - ws * 0.30, knee: s.rKnee + Math.abs(wc) * 0.18, side:  1 },
      ];

      legs.forEach(({ hip, knee }) => {
        // Knee joint
        const kx = pelX + Math.sin(hip) * P.upperLeg;
        const ky = pelY + Math.cos(hip) * P.upperLeg;

        // CORRECT knee: lower leg angle = hip * (1 - knee)
        // This means the lower leg is always less angled than the upper leg
        // so the knee always bends BACKWARD relative to the leg's swing direction
        const footAngle = hip * (1 - Math.max(0, Math.min(1, knee)));
        const fx = kx + Math.sin(footAngle) * P.lowerLeg;
        const fy = ky + Math.cos(footAngle) * P.lowerLeg;

        // Upper leg
        seg(pelX, pelY, kx, ky, 3.5);
        // Lower leg
        seg(kx, ky, fx, fy, 3);

        // Foot — small line pointing forward (direction of lean)
        ctx.globalAlpha = s.opacity;
        const footDir = Math.sign(s.lean >= 0 ? 1 : -1);
        seg(fx, fy, fx + footDir * 8, fy + 1, 2.5);
      });

      // ── TORSO ─────────────────────────────────────────────
      seg(pelX, pelY, shlX, shlY, 4);

      // ── ARMS ──────────────────────────────────────────────
      // side: left=-1, right=1
      // foreArm bends toward body: totalAngle = shoulder + elbow * side
      const arms = [
        { sh: s.lShoulder + wc * 0.18, elbow: s.lElbow, side: -1 },
        { sh: s.rShoulder - wc * 0.18, elbow: s.rElbow, side:  1 },
      ];

      arms.forEach(({ sh, elbow, side }) => {
        const ex = shlX + Math.sin(sh) * P.upperArm;
        const ey = shlY + Math.cos(sh) * P.upperArm;   // cos: arms hang down
        const fa = sh + elbow * side;
        const hx = ex + Math.sin(fa) * P.foreArm;
        const hy = ey + Math.cos(fa) * P.foreArm;

        seg(shlX, shlY, ex, ey, 3);
        seg(ex, ey, hx, hy, 2.5);
      });

      // ── NECK + HEAD ───────────────────────────────────────
      seg(shlX, shlY, nkX, nkY, 3);

      // Head circle
      ctx.lineWidth = 2.5;
      ctx.beginPath();
      ctx.arc(nkX, hcY, P.headR, 0, Math.PI * 2);
      ctx.stroke();

      // Eyes — look in direction of travel
      const eyeSide = s.speed >= 0 ? 1 : -1;
      dot(nkX + eyeSide * 4, hcY - 1, 1.8);

      ctx.restore();
    };

    /* ── Render loop ─────────────────────────────────────────── */
    const loop = () => { draw(); animId = requestAnimationFrame(loop); };
    loop();

    /* ── DOM element positions relative to footer ───────────── */
    const rel = (el) => {
      if (!el) return null;
      const fr = root.getBoundingClientRect();
      const er = el.getBoundingClientRect();
      return {
        top:    er.top    - fr.top,
        bottom: er.bottom - fr.top,
        left:   er.left   - fr.left,
        right:  er.right  - fr.left,
        midX:   (er.left + er.right)  / 2 - fr.left,
        midY:   (er.top  + er.bottom) / 2 - fr.top,
        w:      er.width,
        h:      er.height,
      };
    };

    /* ── Pose helpers ────────────────────────────────────────── */

    // Natural idle stand
    const idle = () => ({
      lHip:  0.06, lKnee: 0.06,
      rHip: -0.06, rKnee: 0.06,
      lShoulder:  0.22, lElbow: 0.12,
      rShoulder: -0.22, rElbow: 0.12,
      lean: 0, headTilt: 0,
    });

    // Squat (anticipation / landing absorb)
    const squat = () => ({
      lHip:  0.30, lKnee: 0.60,
      rHip: -0.30, rKnee: 0.60,
      lShoulder:  0.15, rShoulder: -0.15,
      lean: 0.10,
    });

    // Airborne — legs tucked, arms wide
    const airborne = () => ({
      lHip: -0.35, lKnee: 0.20,
      rHip:  0.35, rKnee: 0.20,
      lShoulder: -0.9, rShoulder: 0.9,
      lean: -0.08,
    });

    // Hanging — arms raised, legs dangle
    const hanging = () => ({
      lShoulder: -1.3, lElbow: 0.35,
      rShoulder:  1.3, rElbow: 0.35,
      lHip:  0.15, lKnee: 0.50,
      rHip: -0.15, rKnee: 0.50,
      lean: 0,
    });

    // Sitting on a ledge — hips bent, arms relaxed
    const sitting = () => ({
      lHip:  0.75, lKnee: 0.70,
      rHip: -0.75, rKnee: 0.70,
      lShoulder:  0.10, lElbow: 0.35,
      rShoulder: -0.10, rElbow: 0.35,
      lean: 0.08,
    });

    const applyPose = (tl, pose, dur = 0.28, ease = 'power2.out') => {
      tl.to(s, { ...pose, duration: dur, ease });
    };

    /* ── Compound motions ─────────────────────────────────────── */

    const startWalk = (tl, dir = 1) => {
      tl.to(s, { speed: dir * 0.20, lean: dir * 0.09, duration: 0.18, ease: 'power2.in' });
    };

    const stopWalk = (tl) => {
      tl.to(s, { speed: 0, lean: 0, duration: 0.22, ease: 'power2.out' });
      applyPose(tl, idle(), 0.22, 'power2.out');
    };

    const walkTo = (tl, tx, ty, distPx) => {
      const dir  = tx > s.x ? 1 : -1;
      const dur  = Math.abs(distPx) / 140;    // 140 px/s
      startWalk(tl, dir);
      tl.to(s, { x: tx, y: ty, duration: Math.max(dur, 0.2), ease: 'none' }, '<0.1');
      stopWalk(tl);
    };

    const jumpTo = (tl, tx, ty, arcH = 50) => {
      // 1. Anticipation squat
      applyPose(tl, squat(), 0.18, 'power2.in');
      // 2. Rise
      tl.to(s, {
        x: tx, y: ty - arcH,
        ...airborne(),
        duration: 0.28, ease: 'power2.out',
      });
      // 3. Fall
      tl.to(s, {
        y: ty,
        lHip:  0.20, lKnee: 0.55,
        rHip: -0.20, rKnee: 0.55,
        duration: 0.22, ease: 'power2.in',
      });
      // 4. Land & settle
      applyPose(tl, idle(), 0.30, 'elastic.out(1,0.45)');
    };

    const wave = (tl, count = 2) => {
      for (let i = 0; i < count; i++) {
        tl.to(s, { rShoulder:  1.3, rElbow: 0.10, duration: 0.16, ease: 'power2.out' });
        tl.to(s, { rShoulder:  0.7, rElbow: 0.40, duration: 0.16, ease: 'power2.in'  });
      }
      tl.to(s, { rShoulder: -0.22, rElbow: 0.12, duration: 0.20 });
    };

    const scratchHead = (tl) => {
      tl.to(s, { rShoulder: -1.1, rElbow: 0.90, headTilt: 0.12, duration: 0.20, ease: 'power2.out' });
      tl.to(s, { rShoulder: -1.0, duration: 0.10 });
      tl.to(s, { rShoulder: -1.1, duration: 0.10 });
      tl.to(s, { rShoulder: -1.0, duration: 0.10 });
      tl.to(s, { rShoulder: -0.22, rElbow: 0.12, headTilt: 0, duration: 0.20, ease: 'power2.in' });
    };

    /* ── Layout references ───────────────────────────────────── */
    const rootR = root.getBoundingClientRect();
    const W = rootR.width;
    const H = rootR.height;

    const ground   = H - 4;
    const feetLen  = P.upperLeg + P.lowerLeg;

    const logoEl     = root.querySelector('a[href="/"]');
    const copyEl     = root.querySelector('footer > div > div:last-child');
    const socialEl   = root.querySelector('.icon-btn');

    const logoR   = rel(logoEl);
    const copyR   = rel(copyEl);
    const socialR = rel(socialEl);

    // Anchors
    const logoX    = logoR   ? logoR.midX : W * 0.13;
    const logoTopY = logoR   ? logoR.top  : H * 0.09;

    const copyTopY = copyR   ? copyR.top    : H * 0.74;
    const copyMidX = copyR   ? copyR.midX   : W * 0.30;

    const socX     = socialR ? socialR.midX : W * 0.17;

    /* ── Derived stand heights ───────────────────────────────── */
    const onGround    = ground;
    const onLogoTop   = logoTopY;          // feet rest here when sitting on logo
    const onCopyTop   = copyTopY;          // sit on the separator bar

    /* ── MASTER SEQUENCE ─────────────────────────────────────── */
    s.x = -80;
    s.y = onGround;
    applyPose({ to: (obj, o) => Object.assign(obj, o) }, idle()); // set initial pose

    masterTl = gsap.timeline({ repeat: -1, repeatDelay: 2.5, delay: 1.0 });

    // ─ 1. Walk in ─────────────────────────────────────────────
    walkTo(masterTl, logoX - 30, onGround, 200);
    masterTl.to(s, { headTilt: 0.2, duration: 0.3, ease: 'power2.out' });

    // ─ 2. Scratch head looking at logo ────────────────────────
    scratchHead(masterTl);
    masterTl.to(s, { headTilt: 0, duration: 0.2 });

    // ─ 3. Jump onto logo text ─────────────────────────────────
    jumpTo(masterTl, logoX, onLogoTop - feetLen, 55);

    // ─ 4. Strut along logo ────────────────────────────────────
    startWalk(masterTl, 1);
    masterTl.to(s, { x: logoX + 45, duration: 0.55, ease: 'none' });
    stopWalk(masterTl);

    // ─ 5. Hang off edge of logo ───────────────────────────────
    masterTl.to(s, {
      x: logoX + 55, y: onLogoTop - feetLen + 12,
      duration: 0.25, ease: 'power2.out',
    });
    applyPose(masterTl, hanging(), 0.22);

    // Pendulum swing
    masterTl.to(s, { lean:  0.28, duration: 0.45, ease: 'sine.inOut' });
    masterTl.to(s, { lean: -0.28, duration: 0.70, ease: 'sine.inOut' });
    masterTl.to(s, { lean:  0.20, duration: 0.55, ease: 'sine.inOut' });
    masterTl.to(s, { lean:  0.00, duration: 0.35, ease: 'sine.out'   });

    // ─ 6. Drop to ground ──────────────────────────────────────
    tl => tl; // label anchor
    masterTl.to(s, {
      y: onGround,
      lHip:  0.20, lKnee: 0.55,
      rHip: -0.20, rKnee: 0.55,
      lean: 0, lShoulder: 0.40, rShoulder: -0.40,
      duration: 0.32, ease: 'power2.in',
    });
    applyPose(masterTl, idle(), 0.30, 'elastic.out(1,0.4)');

    // ─ 7. Jog to social icons area ────────────────────────────
    startWalk(masterTl, 1);
    masterTl.to(s, { x: socX, y: onGround, duration: 0.55, ease: 'none' });
    stopWalk(masterTl);

    // ─ 8. Tap a social icon (reach arm up) ────────────────────
    masterTl.to(s, { rShoulder: -1.4, rElbow: 0.05, duration: 0.22, ease: 'power2.out' });
    masterTl.to(s, { rShoulder: -1.3, duration: 0.08 });
    masterTl.to(s, { rShoulder: -1.4, duration: 0.08 });
    masterTl.to(s, { rShoulder: -0.22, rElbow: 0.12, duration: 0.20, ease: 'power2.in' });

    // ─ 9. Jog to bottom bar ────────────────────────────────────
    walkTo(masterTl, copyMidX, onGround, Math.abs(copyMidX - socX));

    // ─ 10. Jump onto bottom bar line ──────────────────────────
    jumpTo(masterTl, copyMidX, onCopyTop - feetLen, 38);

    // ─ 11. Sit and read copyright ─────────────────────────────
    applyPose(masterTl, sitting(), 0.30);

    masterTl.to(s, { headTilt: -0.28, duration: 0.50, ease: 'power2.inOut' });
    masterTl.to(s, { headTilt:  0.28, duration: 0.70, ease: 'power2.inOut' });
    masterTl.to(s, { headTilt:  0.00, duration: 0.35, ease: 'power2.out'   });

    // ─ 12. Stand up, point right ──────────────────────────────
    applyPose(masterTl, idle(), 0.32, 'power3.out');
    masterTl.to(s, { rShoulder: 1.45, rElbow: 0.05, duration: 0.25, ease: 'power2.out' });
    masterTl.to(s, { rShoulder: -0.22, rElbow: 0.12, duration: 0.22 });

    // ─ 13. Run to right ───────────────────────────────────────
    masterTl.to(s, { y: onGround, duration: 0.25, ease: 'power2.in' });
    startWalk(masterTl, 1);
    masterTl.to(s, {
      x: W * 0.80,
      y: onGround,
      speed: 0.30,
      lean: 0.13,
      duration: 1.4,
      ease: 'none',
    });
    stopWalk(masterTl);

    // ─ 14. Jump in place (celebration) ────────────────────────
    applyPose(masterTl, squat(), 0.15, 'power2.in');
    masterTl.to(s, {
      y: onGround - 42,
      lHip: -0.5, rHip: 0.5, lKnee: 0.1, rKnee: 0.1,
      lShoulder: -1.1, rShoulder: 1.1,
      duration: 0.30, ease: 'power2.out',
    });
    masterTl.to(s, { y: onGround, lHip: 0.25, rHip: -0.25, lKnee: 0.55, rKnee: 0.55, duration: 0.25, ease: 'power2.in' });
    applyPose(masterTl, idle(), 0.28, 'elastic.out(1,0.5)');

    // ─ 15. Wave goodbye and run off screen ────────────────────
    wave(masterTl, 3);
    startWalk(masterTl, 1);
    masterTl.to(s, { x: W + 100, duration: 1.8, ease: 'power1.in' });

    /* ── Cleanup ─────────────────────────────────────────────── */
    const ro = new ResizeObserver(resize);
    ro.observe(root);

    return () => {
      cancelAnimationFrame(animId);
      masterTl?.kill();
      ro.disconnect();
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
