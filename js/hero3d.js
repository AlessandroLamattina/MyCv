/**
 * hero3d.js — sfondo 3D dell'hero (particelle con Three.js).
 *
 * Attivo solo se: Three.js è disponibile da CDN, il browser supporta
 * WebGL, lo schermo è >= 768px e l'utente non ha impostato
 * prefers-reduced-motion. In ogni altro caso l'hero resta comunque
 * presentabile: lo sfondo a griglia è puro CSS, senza dipendenze da JS.
 */
(function () {
  "use strict";

  const canvas = document.getElementById("hero-canvas");
  if (!canvas) return;

  const prefersReducedMotion = window.matchMedia("(prefers-reduced-motion: reduce)").matches;
  if (prefersReducedMotion || window.innerWidth < 768 || typeof window.THREE === "undefined") {
    return;
  }

  function hasWebGL() {
    try {
      const test = document.createElement("canvas");
      return !!(window.WebGLRenderingContext && (test.getContext("webgl") || test.getContext("experimental-webgl")));
    } catch (e) {
      return false;
    }
  }
  if (!hasWebGL()) return;

  const THREE = window.THREE;
  const hero = canvas.closest(".hero");
  let renderer, scene, camera, points, raf;
  let running = false;

  function getAccentColor() {
    const styles = getComputedStyle(document.documentElement);
    return styles.getPropertyValue("--accent").trim() || "#066499";
  }

  function init() {
    scene = new THREE.Scene();
    camera = new THREE.PerspectiveCamera(60, canvas.clientWidth / canvas.clientHeight, 0.1, 100);
    camera.position.z = 8;

    renderer = new THREE.WebGLRenderer({ canvas, alpha: true, antialias: true });
    renderer.setPixelRatio(Math.min(window.devicePixelRatio, 2));
    resize();

    const count = 260;
    const positions = new Float32Array(count * 3);
    for (let i = 0; i < count * 3; i += 3) {
      positions[i] = (Math.random() - 0.5) * 16;
      positions[i + 1] = (Math.random() - 0.5) * 10;
      positions[i + 2] = (Math.random() - 0.5) * 10;
    }
    const geometry = new THREE.BufferGeometry();
    geometry.setAttribute("position", new THREE.BufferAttribute(positions, 3));

    const material = new THREE.PointsMaterial({
      color: new THREE.Color(getAccentColor()),
      size: 0.04,
      transparent: true,
      opacity: 0.55,
      depthWrite: false,
    });

    points = new THREE.Points(geometry, material);
    scene.add(points);

    window.addEventListener("resize", resize);
  }

  function resize() {
    if (!renderer || !hero) return;
    const width = hero.clientWidth;
    const height = hero.clientHeight;
    renderer.setSize(width, height, false);
    camera.aspect = width / height;
    camera.updateProjectionMatrix();
  }

  let lastTime = 0;
  function animate(time) {
    if (!running) return;
    const delta = (time - lastTime) / 1000 || 0;
    lastTime = time;
    if (points) {
      points.rotation.y += delta * 0.03;
      points.rotation.x += delta * 0.008;
    }
    renderer.render(scene, camera);
    raf = requestAnimationFrame(animate);
  }

  function start() {
    if (running) return;
    running = true;
    raf = requestAnimationFrame(animate);
  }
  function stop() {
    running = false;
    if (raf) cancelAnimationFrame(raf);
  }

  try {
    init();
    // Anima solo mentre l'hero è visibile e la tab è attiva: risparmia
    // CPU/GPU quando l'utente scrolla oltre o cambia scheda.
    const observer = new IntersectionObserver(
      (entries) => entries.forEach((e) => (e.isIntersecting ? start() : stop())),
      { threshold: 0.05 }
    );
    observer.observe(hero);
    document.addEventListener("visibilitychange", () => {
      if (document.hidden) stop();
      else if (hero.getBoundingClientRect().top < window.innerHeight) start();
    });
  } catch (err) {
    // Qualunque errore WebGL riporta semplicemente al fallback CSS:
    // l'hero resta comunque leggibile.
    stop();
  }
})();
