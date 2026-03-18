import { useEffect, useRef } from 'react';
import * as THREE from 'three';
import { GLTFLoader } from 'three/examples/jsm/loaders/GLTFLoader.js';
import gsap from 'gsap';

/**
 * Renders the GLTF stickman in the footer with full procedural bone animation.
 * Bone map (from scene.gltf node list):
 *   Bone_41        = pelvis root
 *   Bone.001_40    = lower spine
 *   Bone.002_3     = upper spine
 *   Bone.003_2     = head
 *   Bone.004_21    = R clavicle    Bone.028_39 = L clavicle
 *   Bone.005_20    = R upper arm   Bone.029_38 = L upper arm
 *   Bone.006_19    = R forearm     Bone.030_37 = L forearm
 *   Bone.010_44    = R thigh       Bone.013_47 = L thigh
 *   Bone.011_43    = R shin        Bone.014_46 = L shin
 *   Bone.012_42    = R foot        Bone.027_45 = L foot
 */
const FooterModel = ({ footerRef }) => {
  const canvasRef = useRef(null);

  useEffect(() => {
    const canvas = canvasRef.current;
    if (!canvas) return;
    const root = footerRef?.current || canvas.parentElement;

    /* ── Canvas size ─────────────────────────────────────────── */
    const dpr = Math.min(window.devicePixelRatio || 1, 2);
    let W = 1, H = 1;

    const resize = () => {
      const r = root.getBoundingClientRect();
      W = Math.max(1, Math.floor(r.width));
      H = Math.max(1, Math.floor(r.height));
      renderer.setSize(W, H);
      canvas.style.width  = W + 'px';
      canvas.style.height = H + 'px';
      updateCamera();
    };

    /* ── Three.js core ───────────────────────────────────────── */
    const renderer = new THREE.WebGLRenderer({ canvas, alpha: true, antialias: true });
    renderer.setPixelRatio(dpr);
    renderer.outputColorSpace = THREE.SRGBColorSpace;
    renderer.setClearColor(0x000000, 0);

    const scene = new THREE.Scene();

    const modelH   = 4.69;
    const targetPx = 70;
    let   ppu      = targetPx / modelH;

    const camera = new THREE.OrthographicCamera(0, 1, 0, -1, -50, 50);

    const updateCamera = () => {
      ppu = targetPx / modelH;
      camera.left   =  0;
      camera.right  =  W / ppu;
      camera.top    =  0;
      camera.bottom = -H / ppu;
      camera.updateProjectionMatrix();
    };
    updateCamera();

    /* ── Lights ──────────────────────────────────────────────── */
    scene.add(new THREE.AmbientLight(0xffffff, 0.7));
    const dirLight = new THREE.DirectionalLight(0x00ff7f, 1.4);
    dirLight.position.set(2, 6, 4);
    scene.add(dirLight);
    const rimLight = new THREE.DirectionalLight(0xffffff, 0.4);
    rimLight.position.set(-3, 2, -2);
    scene.add(rimLight);

    /* ── Model state (driven by GSAP) ────────────────────────── */
    let model    = null;
    let isLoaded = false;
    const bones  = {};   // name → THREE.Bone
    const restQ  = {};   // name → quaternion (rest pose clone)

    const s = {
      x:           -2,
      yBob:         0,
      facingRight:  true,
      walkSpeed:    0,
      tiltZ:        0,
    };

    let walkPhase = 0;

    const groundY = () => -H / ppu + modelH + 0.05;

    /* ── Bone names to animate ───────────────────────────────── */
    const ANIM_BONES = [
      'Bone_41', 'Bone.001_40', 'Bone.002_3', 'Bone.003_2',
      'Bone.004_21', 'Bone.005_20', 'Bone.006_19',
      'Bone.028_39', 'Bone.029_38', 'Bone.030_37',
      'Bone.010_44', 'Bone.011_43', 'Bone.012_42',
      'Bone.013_47', 'Bone.014_46', 'Bone.027_45',
    ];

    /* ── Procedural walk/idle ────────────────────────────────── */
    const _tmpQ = new THREE.Quaternion();
    const _tmpE = new THREE.Euler();

    // Apply a local-space euler delta on top of the rest-pose quaternion
    const setDelta = (name, rx, ry, rz) => {
      const b = bones[name];
      if (!b || !restQ[name]) return;
      _tmpE.set(rx, ry, rz, 'XYZ');
      _tmpQ.setFromEuler(_tmpE);
      b.quaternion.copy(restQ[name]).multiply(_tmpQ);
    };

    // Reset a bone to rest pose
    const resetBone = (name) => {
      const b = bones[name];
      if (b && restQ[name]) b.quaternion.copy(restQ[name]);
    };

    const applyPose = (phase, speed) => {
      const amp  = Math.min(Math.abs(speed), 1.0);
      const idle = 1 - amp;
      const sp   = Math.sin(phase);
      const cp   = Math.cos(phase);
      const t    = performance.now() * 0.001;

      // ── Idle breathing (when not walking) ──────────────────
      const breathe = Math.sin(t * 1.2) * 0.03 * idle;

      // ── Pelvis & spine ─────────────────────────────────────
      setDelta('Bone_41',     0, 0, cp * 0.06 * amp);
      setDelta('Bone.001_40', breathe, 0, -cp * 0.04 * amp);
      setDelta('Bone.002_3',  sp * 0.05 * amp + breathe * 0.5, 0, 0);
      setDelta('Bone.003_2',  -0.12 * amp, 0, 0);   // look forward while walking

      // ── Right leg ──────────────────────────────────────────
      //  sp > 0 → right leg swings forward; knee bends on backswing
      const rSwing    =  sp * 0.55 * amp;
      const rKnee     =  Math.max(0, -sp) * 0.75 * amp;
      const rFootComp = -rSwing * 0.35;

      setDelta('Bone.010_44',  rSwing,    0, 0);
      setDelta('Bone.011_43',  rKnee,     0, 0);
      setDelta('Bone.012_42',  rFootComp, 0, 0);

      // ── Left leg (antiphase) ────────────────────────────────
      const lSwing    = -sp * 0.55 * amp;
      const lKnee     =  Math.max(0,  sp) * 0.75 * amp;
      const lFootComp = -lSwing * 0.35;

      setDelta('Bone.013_47',  lSwing,    0, 0);
      setDelta('Bone.014_46',  lKnee,     0, 0);
      setDelta('Bone.027_45',  lFootComp, 0, 0);

      // ── Arms (opposite to legs) ─────────────────────────────
      const rArmSwing = -sp * 0.45 * amp;
      const lArmSwing =  sp * 0.45 * amp;

      // Clavicles: subtle forward/back
      setDelta('Bone.004_21', 0, 0, rArmSwing * 0.2);
      setDelta('Bone.028_39', 0, 0, lArmSwing * 0.2);

      // Upper arms
      setDelta('Bone.005_20', rArmSwing, 0, 0);
      setDelta('Bone.029_38', lArmSwing, 0, 0);

      // Forearms: bend slightly on forward swing
      setDelta('Bone.006_19', Math.max(0, rArmSwing) * 0.6, 0, 0);
      setDelta('Bone.030_37', Math.max(0, lArmSwing) * 0.6, 0, 0);

      // ── Idle: gentle arm/head sway when stopped ─────────────
      if (idle > 0.05) {
        const idleSway = Math.sin(t * 0.8) * 0.08 * idle;
        const idleArm  = Math.sin(t * 0.6) * 0.12 * idle;
        setDelta('Bone.003_2',  idleSway * 0.5,  idleSway, 0);
        setDelta('Bone.005_20', idleArm,          0, 0);
        setDelta('Bone.029_38', -idleArm * 0.7,   0, 0);
      }
    };

    /* ── GLTFLoader ──────────────────────────────────────────── */
    const loader = new GLTFLoader();
    loader.load(
      '/models/scene.gltf',
      (gltf) => {
        model = gltf.scene;
        model.rotation.y = Math.PI / 2;

        model.traverse((child) => {
          if (child.isMesh) {
            child.material = new THREE.MeshStandardMaterial({
              color:     new THREE.Color(0x00ff7f),
              roughness: 0.7,
              metalness: 0.1,
              emissive:  new THREE.Color(0x003318),
            });
          }
          if (child.isBone && ANIM_BONES.includes(child.name)) {
            bones[child.name]  = child;
            restQ[child.name]  = child.quaternion.clone();
          }
        });

        model.position.set(s.x, groundY(), 0);
        scene.add(model);
        isLoaded = true;

        runSequence();
      },
      undefined,
      (err) => console.warn('FooterModel: GLTF load error —', err.message),
    );

    /* ── Render loop ─────────────────────────────────────────── */
    const clock = new THREE.Clock();
    let animId;

    const tick = () => {
      animId = requestAnimationFrame(tick);
      const delta = clock.getDelta();

      if (!isLoaded || !model) { renderer.render(scene, camera); return; }

      // Advance walk phase proportional to speed
      walkPhase += delta * Math.abs(s.walkSpeed) * 5.5;

      // Procedural bone animation
      applyPose(walkPhase, s.walkSpeed);

      // Model root position & orientation
      model.position.x = s.x;
      model.position.y = groundY() + s.yBob;
      model.position.z = 0;
      model.rotation.z = s.tiltZ;

      // Smooth facing direction
      const targetRotY = s.facingRight ? Math.PI / 2 : -Math.PI / 2;
      model.rotation.y += (targetRotY - model.rotation.y) * 0.25;

      // Vertical bob from body weight
      if (Math.abs(s.walkSpeed) > 0.01) {
        s.yBob = Math.sin(clock.getElapsedTime() * 8) * 0.06;
      } else {
        s.yBob *= 0.85;
      }

      renderer.render(scene, camera);
    };
    tick();

    /* ── DOM helpers ─────────────────────────────────────────── */
    const rel = (el) => {
      if (!el) return null;
      const fr = root.getBoundingClientRect();
      const er = el.getBoundingClientRect();
      return {
        left:  er.left  - fr.left,
        right: er.right - fr.left,
        midX: (er.left + er.right) / 2 - fr.left,
        top:   er.top   - fr.top,
        bottom:er.bottom- fr.top,
      };
    };

    const pxToWorld = (px) => px / ppu;

    /* ── GSAP choreography ───────────────────────────────────── */
    let masterTl;

    const runSequence = () => {
      const logoEl    = root.querySelector('a[href="/"]');
      const socialEls = Array.from(root.querySelectorAll('.icon-btn'));
      const futureEl  = root.querySelector('footer > div > div:last-child > span:last-child');

      const logoR  = rel(logoEl);
      const socRs  = socialEls.map(rel).filter(Boolean);
      const futureR = rel(futureEl);

      const xStart  = -2;
      const xLogo   = logoR    ? pxToWorld(logoR.midX)       : pxToWorld(W * 0.12);
      const xSoc0   = socRs[0] ? pxToWorld(socRs[0].midX)    : pxToWorld(W * 0.15);
      const xSoc1   = socRs[1] ? pxToWorld(socRs[1].midX)    : pxToWorld(W * 0.18);
      const xSoc2   = socRs[2] ? pxToWorld(socRs[2].midX)    : pxToWorld(W * 0.21);
      const xFuture = futureR  ? pxToWorld(futureR.left - 10): pxToWorld(W * 0.72);
      const xRight  = pxToWorld(W * 0.82);
      const xExit   = pxToWorld(W + 80);

      // curX tracks conceptual position when building the timeline
      let curX = xStart;
      s.x = xStart;

      const walk = (tl, tx, spd = 1.8) => {
        const dir = tx > curX;
        const dist = Math.abs(tx - curX);
        tl.to(s, { facingRight: dir,   duration: 0.05 });
        tl.to(s, { walkSpeed:   spd,   duration: 0.15, ease: 'power2.in'  }, '<');
        tl.to(s, { x: tx, duration: Math.max(dist / (spd * 1.2), 0.2), ease: 'none' }, '<0.1');
        tl.to(s, { walkSpeed: 0,       duration: 0.18, ease: 'power2.out' });
        curX = tx;
      };

      const pause  = (tl, t = 0.5) => tl.to(s, { duration: t });
      const bounce = (tl) => {
        tl.to(s, { yBob: 0.3, duration: 0.18, ease: 'power2.out' });
        tl.to(s, { yBob: 0,   duration: 0.22, ease: 'bounce.out' });
      };
      const spin = (tl) => {
        tl.to(s, { tiltZ: Math.PI * 2, duration: 0.5, ease: 'power1.inOut' });
        tl.to(s, { tiltZ: 0,           duration: 0.05 });
      };

      masterTl = gsap.timeline({ repeat: -1, repeatDelay: 3, delay: 0.6 });

      walk(masterTl, xLogo);
      pause(masterTl, 0.6);
      bounce(masterTl);
      walk(masterTl, xLogo + 0.8);
      bounce(masterTl);
      pause(masterTl, 0.4);

      walk(masterTl, xSoc0);
      bounce(masterTl);
      pause(masterTl, 0.2);

      walk(masterTl, xSoc1, 2.5);
      bounce(masterTl);
      pause(masterTl, 0.2);

      walk(masterTl, xSoc2, 2.5);
      bounce(masterTl);
      pause(masterTl, 0.3);

      walk(masterTl, xFuture, 2.2);
      pause(masterTl, 0.3);

      masterTl.to(s, { tiltZ: -0.35, duration: 0.25, ease: 'power2.out' });
      masterTl.to(s, { tiltZ: -0.40, duration: 0.3,  ease: 'sine.inOut', yoyo: true, repeat: 2 });
      masterTl.to(s, { tiltZ:  0,    duration: 0.22, ease: 'power2.out' });

      walk(masterTl, xRight, 2.0);
      spin(masterTl);
      pause(masterTl, 0.3);

      masterTl.to(s, { tiltZ:  0.20, duration: 0.14 });
      masterTl.to(s, { tiltZ: -0.20, duration: 0.14 });
      masterTl.to(s, { tiltZ:  0.20, duration: 0.14 });
      masterTl.to(s, { tiltZ:  0.00, duration: 0.14 });

      walk(masterTl, xExit, 3.5);
    };

    /* ── Initial size ────────────────────────────────────────── */
    const r0 = root.getBoundingClientRect();
    W = Math.max(1, Math.floor(r0.width));
    H = Math.max(1, Math.floor(r0.height));
    renderer.setSize(W, H);
    canvas.style.width  = W + 'px';
    canvas.style.height = H + 'px';
    updateCamera();

    const ro = new ResizeObserver(resize);
    ro.observe(root);

    /* ── Cleanup ─────────────────────────────────────────────── */
    return () => {
      cancelAnimationFrame(animId);
      masterTl?.kill();
      ro.disconnect();
      renderer.dispose();
    };
  }, [footerRef]);

  return (
    <canvas
      ref={canvasRef}
      style={{ position: 'absolute', inset: 0, pointerEvents: 'none', zIndex: 10 }}
    />
  );
};

export default FooterModel;
