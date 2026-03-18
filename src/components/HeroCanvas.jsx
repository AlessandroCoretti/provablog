import { useEffect, useRef } from 'react';
import * as THREE from 'three';

/**
 * Three.js neon-green torus knot with:
 *  – auto-rotation
 *  – mouse hover parallax
 *  – click + drag / touch to spin
 *  – particle star field
 *  – breathing scale
 *  – CSS drop-shadow glow (no post-processing needed)
 */
const HeroCanvas = () => {
  const mountRef = useRef(null);

  useEffect(() => {
    const el = mountRef.current;
    if (!el) return;

    const W = el.clientWidth;
    const H = el.clientHeight;

    // ── Core ────────────────────────────────────────────────
    const scene    = new THREE.Scene();
    const camera   = new THREE.PerspectiveCamera(48, W / H, 0.1, 100);
    const renderer = new THREE.WebGLRenderer({ antialias: true, alpha: true });

    camera.position.z = 3.6;
    renderer.setPixelRatio(Math.min(window.devicePixelRatio, 2));
    renderer.setSize(W, H);
    renderer.setClearColor(0x000000, 0);
    el.appendChild(renderer.domElement);

    // ── Neon material helpers ────────────────────────────────
    const lineMat = (opacity = 0.8) => new THREE.LineBasicMaterial({
      color: 0x00ff7f,
      transparent: true,
      opacity,
      blending: THREE.AdditiveBlending,
      depthWrite: false,
    });

    // ── Primary torus knot ───────────────────────────────────
    const knotGeo = new THREE.TorusKnotGeometry(1.25, 0.35, 260, 36);
    const knot    = new THREE.LineSegments(new THREE.WireframeGeometry(knotGeo), lineMat(0.65));

    // ── Outer ghost ring (counter-rotates) ───────────────────
    const knotGeo2 = new THREE.TorusKnotGeometry(1.7, 0.07, 100, 14);
    const knot2    = new THREE.LineSegments(new THREE.WireframeGeometry(knotGeo2), lineMat(0.1));

    // ── Group ────────────────────────────────────────────────
    const group = new THREE.Group();
    group.add(knot, knot2);
    scene.add(group);

    // ── Particle star field ──────────────────────────────────
    const starCount = 2800;
    const starPos   = new Float32Array(starCount * 3);
    for (let i = 0; i < starCount; i++) {
      const r = 3.5 + Math.random() * 8;
      const θ = Math.random() * Math.PI * 2;
      const φ = Math.acos(2 * Math.random() - 1);
      starPos[i * 3]     = r * Math.sin(φ) * Math.cos(θ);
      starPos[i * 3 + 1] = r * Math.sin(φ) * Math.sin(θ);
      starPos[i * 3 + 2] = r * Math.cos(φ);
    }
    const starGeo = new THREE.BufferGeometry();
    starGeo.setAttribute('position', new THREE.BufferAttribute(starPos, 3));
    scene.add(new THREE.Points(starGeo, new THREE.PointsMaterial({
      color: 0x00ff7f,
      size: 0.018,
      transparent: true,
      opacity: 0.3,
      blending: THREE.AdditiveBlending,
      depthWrite: false,
    })));

    // ── Interaction state ────────────────────────────────────
    let autoRotY   = 0;
    let velX = 0, velY = 0;
    let isDragging = false;
    let prevX = 0, prevY = 0;
    const hover = { tx: 0, ty: 0, lx: 0, ly: 0 };

    // Mouse move — parallax + drag
    const onMouseMove = (e) => {
      hover.tx = (e.clientX / window.innerWidth  - 0.5) * 0.6;
      hover.ty = (e.clientY / window.innerHeight - 0.5) * 0.6;
      if (isDragging) {
        velX += (e.clientX - prevX) * 0.007;
        velY += (e.clientY - prevY) * 0.007;
        prevX = e.clientX;
        prevY = e.clientY;
      }
    };

    const onMouseDown = (e) => {
      isDragging = true;
      prevX = e.clientX;
      prevY = e.clientY;
    };

    const onMouseUp = () => { isDragging = false; };

    // Touch
    const onTouchStart = (e) => {
      if (!e.touches[0]) return;
      isDragging = true;
      prevX = e.touches[0].clientX;
      prevY = e.touches[0].clientY;
    };

    const onTouchMove = (e) => {
      if (!isDragging || !e.touches[0]) return;
      velX += (e.touches[0].clientX - prevX) * 0.009;
      velY += (e.touches[0].clientY - prevY) * 0.009;
      prevX = e.touches[0].clientX;
      prevY = e.touches[0].clientY;
    };

    el.addEventListener('mousedown', onMouseDown);
    el.addEventListener('touchstart', onTouchStart, { passive: true });
    window.addEventListener('mousemove', onMouseMove);
    window.addEventListener('mouseup', onMouseUp);
    window.addEventListener('touchmove', onTouchMove, { passive: true });
    window.addEventListener('touchend', onMouseUp);

    // ── Animation loop ───────────────────────────────────────
    let animId;
    const clock = new THREE.Clock();

    const animate = () => {
      animId = requestAnimationFrame(animate);
      const t = clock.getElapsedTime();

      // Parallax lerp
      if (!isDragging) {
        hover.lx += (hover.tx - hover.lx) * 0.04;
        hover.ly += (hover.ty - hover.ly) * 0.04;
      }

      // Drag momentum + auto-rotate
      velX *= 0.94;
      velY *= 0.94;
      autoRotY += 0.0028 + velX;

      group.rotation.y = autoRotY + hover.lx;
      group.rotation.x = velY * 0.5 + hover.ly * 0.5;

      // Inner component spin
      knot.rotation.z  =  t * 0.08;
      knot2.rotation.z = -t * 0.04;

      // Breathing scale
      const breathe = 1 + Math.sin(t * 0.9) * 0.025;
      group.scale.setScalar(breathe);

      renderer.render(scene, camera);
    };

    animate();

    // ── Resize ───────────────────────────────────────────────
    const onResize = () => {
      const w = el.clientWidth, h = el.clientHeight;
      camera.aspect = w / h;
      camera.updateProjectionMatrix();
      renderer.setSize(w, h);
    };
    window.addEventListener('resize', onResize);

    // ── Cleanup ──────────────────────────────────────────────
    return () => {
      cancelAnimationFrame(animId);
      el.removeEventListener('mousedown', onMouseDown);
      el.removeEventListener('touchstart', onTouchStart);
      window.removeEventListener('mousemove', onMouseMove);
      window.removeEventListener('mouseup', onMouseUp);
      window.removeEventListener('touchmove', onTouchMove);
      window.removeEventListener('touchend', onMouseUp);
      window.removeEventListener('resize', onResize);
      renderer.dispose();
      if (el.contains(renderer.domElement)) el.removeChild(renderer.domElement);
    };
  }, []);

  return (
    <div
      ref={mountRef}
      style={{
        width: '100%',
        height: '100%',
        filter: 'drop-shadow(0 0 24px rgba(0, 255, 127, 0.25))',
      }}
    />
  );
};

export default HeroCanvas;
