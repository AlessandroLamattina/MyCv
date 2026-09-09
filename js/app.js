/**
 * app.js — comportamento condiviso da tutte le pagine:
 * tema, menu a comparsa (burger flottante in basso a sinistra), carosello
 * esperienze, back-to-top, reveal on scroll, più il render dei blocchi
 * dati (home, progetti) con un set di icone SVG proprio invece di emoji.
 *
 * Scritto per degradare bene: ogni funzione controlla che gli elementi
 * che le servono esistano davvero prima di agganciarsi.
 */
(function () {
  "use strict";

  const prefersReducedMotion = window.matchMedia("(prefers-reduced-motion: reduce)").matches;

  /* ------------------------------------------------------------------ */
  /* Set di icone SVG (sostituisce le emoji usate in precedenza)         */
  /* ------------------------------------------------------------------ */
  const ICON_PATHS = {
    pin: '<path d="M12 21s-6.5-6-6.5-10.8A6.5 6.5 0 0 1 18.5 10.2C18.5 15 12 21 12 21Z"/><circle cx="12" cy="10" r="2.3"/>',
    phone: '<path d="M5 4h3l1.3 3.8-1.8 1.4a11 11 0 0 0 4.8 4.8l1.4-1.8L18.5 13.5v3a1.3 1.3 0 0 1-1.4 1.3A15 15 0 0 1 4.2 5.4 1.3 1.3 0 0 1 5.5 4Z"/>',
    mail: '<rect x="3" y="5.5" width="18" height="13" rx="1.5"/><path d="m3.5 6.5 8.5 6.5 8.5-6.5"/>',
    graduation: '<path d="M2 9 12 4l10 5-10 5-10-5Z"/><path d="M6 12.3V17c0 1.4 2.8 2.7 6 2.7s6-1.3 6-2.7v-4.7"/><path d="M22 9v5.5"/>',
    network: '<circle cx="12" cy="5" r="2.1"/><circle cx="5" cy="18.5" r="2.1"/><circle cx="19" cy="18.5" r="2.1"/><path d="M12 7.1v5.4m0 0-5.8 4M12 12.5l5.8 4"/>',
    cloud: '<path d="M7.5 18h9.7a3.8 3.8 0 0 0 .4-7.6 5.6 5.6 0 0 0-10.7-1.5A4.2 4.2 0 0 0 7.5 18Z"/>',
    device: '<rect x="7" y="2.5" width="10" height="19" rx="1.6"/><path d="M10.8 18.2h2.4"/>',
    grid: '<rect x="3.5" y="3.5" width="7" height="7" rx="1"/><rect x="13.5" y="3.5" width="7" height="7" rx="1"/><rect x="3.5" y="13.5" width="7" height="7" rx="1"/><rect x="13.5" y="13.5" width="7" height="7" rx="1"/>',
    layers: '<path d="M3.5 8 12 3.5 20.5 8 12 12.5 3.5 8Z"/><path d="m3.5 12.2 8.5 4.3 8.5-4.3"/><path d="m3.5 16.2 8.5 4.3 8.5-4.3"/>',
    terminal: '<rect x="2.5" y="4.5" width="19" height="15" rx="1.5"/><path d="m6.5 9.5 4 3-4 3"/><path d="M12.5 15.5h5"/>',
    code: '<path d="m8.5 8-4 4 4 4"/><path d="m15.5 8 4 4-4 4"/>',
    ticket: '<path d="M3 8.3A2.3 2.3 0 0 1 5.3 6h13.4A2.3 2.3 0 0 1 21 8.3v1.9a1.7 1.7 0 0 0 0 3.2v1.9a2.3 2.3 0 0 1-2.3 2.4H5.3A2.3 2.3 0 0 1 3 15.3v-1.9a1.7 1.7 0 0 0 0-3.2Z"/><path d="M9.3 6.3v11.4"/>',
    clipboard: '<rect x="5.5" y="4.5" width="13" height="17" rx="1.5"/><rect x="9" y="2.5" width="6" height="3.5" rx="1"/><path d="M8.5 11h7M8.5 14.5h7M8.5 18h4"/>',
    lock: '<rect x="5" y="11" width="14" height="9" rx="1.6"/><path d="M8 11V8a4 4 0 0 1 8 0v3"/>',
    award: '<circle cx="12" cy="8.3" r="5.3"/><path d="m8.3 13-1.6 6.7 5.3-2.5 5.3 2.5-1.6-6.7"/>',
    camera: '<rect x="3" y="7" width="14" height="11" rx="1.8"/><path d="m17 10.3 4-2.2v7.8l-4-2.2"/><circle cx="10" cy="12.5" r="3"/>',
    download: '<path d="M12 4v11m0 0 4-4m-4 4-4-4"/><path d="M5 19.5h14"/>',
    chevronLeft: '<path d="M14.5 6 8 12l6.5 6"/>',
    chevronRight: '<path d="M9.5 6 16 12l-6.5 6"/>',
    close: '<path d="m6 6 12 12M18 6 6 18"/>',
    doc: '<path d="M7 3.5h7l4 4v13a1.5 1.5 0 0 1-1.5 1.5h-9A1.5 1.5 0 0 1 6 20.5v-15A1.5 1.5 0 0 1 7 3.5Z"/><path d="M14 3.5V8h4"/>',
    external: '<path d="M7 17 17 7M8 7h9v9"/>',
    dot: '<circle cx="12" cy="12" r="3"/>',
    burst: '<path d="M12 2v6M12 16v6M4.2 4.2l4.2 4.2M15.6 15.6l4.2 4.2M2 12h6M16 12h6M4.2 19.8l4.2-4.2M15.6 8.4l4.2-4.2"/>',
  };

  function icon(name, size) {
    const inner = ICON_PATHS[name] || ICON_PATHS.dot;
    const px = size || 20;
    return (
      '<svg width="' + px + '" height="' + px + '" viewBox="0 0 24 24" fill="none" ' +
      'stroke="currentColor" stroke-width="1.6" stroke-linecap="round" stroke-linejoin="round" aria-hidden="true">' +
      inner +
      "</svg>"
    );
  }

  /* ------------------------------------------------------------------ */
  /* Tema chiaro/scuro                                                   */
  /* ------------------------------------------------------------------ */
  function initTheme() {
    const toggle = document.querySelector(".theme-toggle");
    if (!toggle) return;

    function currentTheme() {
      return document.documentElement.getAttribute("data-theme");
    }

    function apply(theme) {
      if (theme) {
        document.documentElement.setAttribute("data-theme", theme);
      } else {
        document.documentElement.removeAttribute("data-theme");
      }
      try {
        if (theme) localStorage.setItem("cv-theme", theme);
        else localStorage.removeItem("cv-theme");
      } catch (err) {
        /* localStorage non disponibile: il tema resta valido solo per la sessione */
      }
    }

    toggle.addEventListener("click", () => {
      const isDark =
        currentTheme() === "dark" ||
        (!currentTheme() && window.matchMedia("(prefers-color-scheme: dark)").matches);
      apply(isDark ? "light" : "dark");
    });
  }

  /* ------------------------------------------------------------------ */
  /* Menu a comparsa: burger flottante in basso a sinistra + overlay      */
  /* ------------------------------------------------------------------ */
  function initMenuOverlay() {
    const fab = document.querySelector(".menu-fab");
    const overlay = document.querySelector(".menu-overlay");
    const main = document.getElementById("main");
    if (!fab || !overlay) return;

    let lastFocused = null;

    function close() {
      fab.setAttribute("aria-expanded", "false");
      overlay.setAttribute("data-open", "false");
      overlay.setAttribute("aria-hidden", "true");
      document.body.classList.remove("menu-open");
      document.body.style.overflow = "";
      if (main) main.removeAttribute("inert");
      if (lastFocused) lastFocused.focus();
    }
    function open() {
      lastFocused = document.activeElement;
      fab.setAttribute("aria-expanded", "true");
      overlay.setAttribute("data-open", "true");
      overlay.setAttribute("aria-hidden", "false");
      document.body.classList.add("menu-open");
      document.body.style.overflow = "hidden";
      if (main) main.setAttribute("inert", "");
      const firstLink = overlay.querySelector("a");
      if (firstLink) firstLink.focus();
    }

    fab.addEventListener("click", () => {
      fab.getAttribute("aria-expanded") === "true" ? close() : open();
    });

    overlay.querySelectorAll("a").forEach((a) => a.addEventListener("click", close));

    document.addEventListener("keydown", (e) => {
      if (e.key === "Escape" && fab.getAttribute("aria-expanded") === "true") {
        close();
      }
    });
  }

  /* ------------------------------------------------------------------ */
  /* Back to top                                                         */
  /* ------------------------------------------------------------------ */
  function initBackToTop() {
    const btn = document.querySelector(".back-to-top");
    if (!btn) return;

    let ticking = false;
    function update() {
      btn.setAttribute("data-visible", window.scrollY > 600 ? "true" : "false");
      ticking = false;
    }
    window.addEventListener(
      "scroll",
      () => {
        if (!ticking) {
          requestAnimationFrame(update);
          ticking = true;
        }
      },
      { passive: true }
    );
    btn.addEventListener("click", () => {
      window.scrollTo({ top: 0, behavior: prefersReducedMotion ? "auto" : "smooth" });
    });
  }

  /* ------------------------------------------------------------------ */
  /* Reveal on scroll                                                    */
  /* ------------------------------------------------------------------ */
  function initReveal() {
    const items = document.querySelectorAll(".reveal");
    if (!items.length) return;

    if (prefersReducedMotion || !("IntersectionObserver" in window)) {
      items.forEach((el) => el.classList.add("is-visible"));
      return;
    }

    const observer = new IntersectionObserver(
      (entries) => {
        entries.forEach((entry) => {
          if (entry.isIntersecting) {
            entry.target.classList.add("is-visible");
            observer.unobserve(entry.target);
          }
        });
      },
      { threshold: 0.15, rootMargin: "0px 0px -60px 0px" }
    );
    items.forEach((el) => observer.observe(el));
  }

  /* ------------------------------------------------------------------ */
  /* Smooth scroll via Lenis, se disponibile da CDN (altrimenti CSS)     */
  /* ------------------------------------------------------------------ */
  function initSmoothScroll() {
    if (prefersReducedMotion || typeof window.Lenis === "undefined") return;
    try {
      const lenis = new window.Lenis({ duration: 1.1, smoothWheel: true });
      function raf(time) {
        lenis.raf(time);
        requestAnimationFrame(raf);
      }
      requestAnimationFrame(raf);
    } catch (err) {
      /* Lenis non essenziale: se fallisce resta lo scroll nativo */
    }
  }

  /* ------------------------------------------------------------------ */
  /* Footer: anno corrente                                               */
  /* ------------------------------------------------------------------ */
  function initFooterYear() {
    document.querySelectorAll("[data-year]").forEach((el) => {
      el.textContent = new Date().getFullYear();
    });
  }

  /* ------------------------------------------------------------------ */
  /* Render: card informazioni personali (home)                          */
  /* ------------------------------------------------------------------ */
  function renderPersonalInfo(data) {
    const root = document.getElementById("informazioni-personali");
    if (!root) return;
    const { personalInfo, education } = data;

    root.innerHTML = `
      <div class="glass-card profile-card reveal">
        <img class="profile-card__photo" src="${personalInfo.photo}" alt="Foto di ${personalInfo.name}" loading="lazy">
        <h3>${personalInfo.name}</h3>
        <p class="profile-card__role">${personalInfo.role}</p>
        <div class="profile-card__socials">
          <a href="${personalInfo.linkedin}" target="_blank" rel="noopener" aria-label="Profilo LinkedIn">
            <svg viewBox="0 0 24 24" fill="currentColor" aria-hidden="true"><path d="M20.45 20.45h-3.55v-5.57c0-1.33-.02-3.03-1.85-3.03-1.85 0-2.14 1.45-2.14 2.94v5.66H9.36V9h3.41v1.56h.05c.48-.9 1.63-1.85 3.36-1.85 3.6 0 4.27 2.37 4.27 5.45v6.29zM5.34 7.43a2.06 2.06 0 1 1 0-4.12 2.06 2.06 0 0 1 0 4.12zM7.12 20.45H3.56V9h3.56v11.45z"/></svg>
          </a>
          <a href="${personalInfo.github}" target="_blank" rel="noopener" aria-label="Profilo GitHub">
            <svg viewBox="0 0 24 24" fill="currentColor" aria-hidden="true"><path d="M12 2C6.48 2 2 6.58 2 12.25c0 4.53 2.87 8.37 6.84 9.73.5.1.68-.22.68-.49 0-.24-.01-1.04-.01-1.88-2.78.62-3.37-1.21-3.37-1.21-.45-1.18-1.11-1.5-1.11-1.5-.9-.63.07-.62.07-.62 1 .07 1.53 1.05 1.53 1.05.9 1.55 2.34 1.11 2.91.85.09-.66.35-1.11.64-1.37-2.22-.26-4.56-1.13-4.56-5.03 0-1.11.38-2.02 1.02-2.73-.1-.26-.44-1.31.1-2.72 0 0 .83-.27 2.75 1.04a9.3 9.3 0 0 1 5 0c1.91-1.31 2.75-1.04 2.75-1.04.54 1.41.2 2.46.1 2.72.64.71 1.02 1.62 1.02 2.73 0 3.91-2.34 4.77-4.57 5.02.36.32.68.94.68 1.9 0 1.37-.01 2.47-.01 2.81 0 .27.18.6.69.49A10.26 10.26 0 0 0 22 12.25C22 6.58 17.52 2 12 2z"/></svg>
          </a>
        </div>
      </div>
      <div class="glass-card info-card reveal">
        <div class="info-item">
          <span class="info-item__icon">${icon("pin", 18)}</span>
          <div><div class="info-item__label">Residenza</div><div class="info-item__value">${personalInfo.home}</div></div>
        </div>
        <div class="info-item">
          <span class="info-item__icon">${icon("phone", 18)}</span>
          <div><div class="info-item__label">Telefono</div><div class="info-item__value"><a href="tel:${personalInfo.phone.replace(/\s+/g, "")}">${personalInfo.phone}</a></div></div>
        </div>
        <div class="info-item">
          <span class="info-item__icon">${icon("mail", 18)}</span>
          <div><div class="info-item__label">Email</div><div class="info-item__value"><a href="mailto:${personalInfo.email}">${personalInfo.email}</a><br><a href="mailto:${personalInfo.email2}">${personalInfo.email2}</a></div></div>
        </div>
        <div class="info-item">
          <span class="info-item__icon">${icon("graduation", 18)}</span>
          <div><div class="info-item__label">Formazione</div><div class="info-item__value">${education
            .map((e) => `${e.degree} — ${e.school} (${e.year})`)
            .join("<br>")}</div></div>
        </div>
      </div>
    `;
  }

  /* ------------------------------------------------------------------ */
  /* Render + comportamento: galleria circolare esperienze (home)         */
  /* Le card sono disposte su un anello in 3D (CSS transform puro, nessuna
     libreria): la card frontale è quella leggibile/attiva, le altre
     ruotano intorno sfumando in opacità/sfocatura. Si ruota trascinando
     (mouse o touch via Pointer Events), con le frecce o da tastiera.    */
  /* ------------------------------------------------------------------ */
  function renderExperiences(data) {
    const stage = document.getElementById("exp-stage");
    const ring = document.getElementById("exp-ring");
    const carousel = document.getElementById("exp-carousel");
    if (!stage || !ring || !carousel) return;

    const experiences = data.experiences;
    const count = experiences.length;

    stage.innerHTML = experiences
      .map(
        (exp) => `
      <article class="glass-card exp-card${exp.current ? " exp-card--current" : ""}">
        <div class="exp-card__head">
          <h3>${exp.title}</h3>
          <span class="exp-card__period">${exp.period}</span>
        </div>
        <div class="exp-card__company">${exp.company}</div>
        <p class="exp-card__desc">${exp.description}</p>
        <ul class="exp-card__tasks">
          ${exp.tasks.map((t) => `<li>${t}</li>`).join("")}
        </ul>
        <div class="badge-row">
          ${exp.tags.map((t) => `<span class="badge">${t}</span>`).join("")}
        </div>
      </article>
    `
      )
      .join("");

    const cards = Array.from(stage.children);
    if (!cards.length) return;

    const prevBtn = carousel.querySelector("[data-exp-prev]");
    const nextBtn = carousel.querySelector("[data-exp-next]");
    const counterCurrent = carousel.querySelector("[data-exp-current]");
    const counterTotal = carousel.querySelector("[data-exp-total]");
    const dotsRoot = carousel.querySelector("[data-exp-dots]");

    if (counterTotal) counterTotal.textContent = String(count).padStart(2, "0");
    if (dotsRoot) {
      dotsRoot.innerHTML = cards
        .map((_, i) => `<button aria-label="Vai all'esperienza ${i + 1}" data-go="${i}"></button>`)
        .join("");
    }

    const angleStep = 360 / count;
    let radius = 0;
    let currentIndex = 0;
    let rotation = 0; // gradi correnti dell'anello (negativo di currentIndex*angleStep a riposo)
    let dragging = false;
    let axisLocked = null; // 'x' | 'y' — quale gesto ha "vinto" durante il trascinamento
    let dragStartX = 0;
    let dragStartY = 0;
    let dragStartRotation = 0;
    let autoplayTimer = null;
    const AUTOPLAY_DELAY = 4200;

    function computeRadius() {
      const cardWidth = cards[0].getBoundingClientRect().width || 300;
      // Il moltiplicatore 1.4 lascia un vero spazio tra una scheda e
      // l'altra: senza, il raggio minimo le disporrebbe bordo a bordo.
      const spacing = 1.4;
      if (count <= 2) {
        radius = cardWidth * 0.75 * spacing;
        return;
      }
      const denom = Math.tan(Math.PI / count);
      radius = (denom > 0.0001 ? cardWidth / 2 / denom : cardWidth * 0.75) * spacing;
    }

    function normalizeAngleDiff(deg) {
      let d = deg % 360;
      if (d > 180) d -= 360;
      if (d < -180) d += 360;
      return d;
    }

    function layout(animated) {
      stage.style.transition =
        animated && !prefersReducedMotion ? "transform 0.6s var(--ease-out)" : "none";
      stage.style.transform = `rotateY(${rotation}deg)`;

      cards.forEach((card, i) => {
        const cardAngle = i * angleStep;
        card.style.transform = `translate(-50%, -50%) rotateY(${cardAngle}deg) translateZ(${radius}px)`;
        const diff = Math.abs(normalizeAngleDiff(cardAngle + rotation));
        const isFront = diff < angleStep / 2 + 0.5;
        const opacity = diff < 1 ? 1 : Math.max(0.12, 1 - diff / 130);
        const blur = diff < 20 ? 0 : Math.min(5, (diff - 20) / 30);
        card.style.opacity = String(opacity);
        card.style.filter = blur ? `blur(${blur}px)` : "none";
        card.style.pointerEvents = isFront ? "auto" : "none";
        card.classList.toggle("exp-card--front", isFront);
        card.setAttribute("aria-hidden", isFront ? "false" : "true");
      });
    }

    function updateUI() {
      if (counterCurrent) counterCurrent.textContent = String(currentIndex + 1).padStart(2, "0");
      if (dotsRoot) {
        Array.from(dotsRoot.children).forEach((dot, i) => {
          dot.setAttribute("aria-current", i === currentIndex ? "true" : "false");
        });
      }
    }

    function pauseAutoplay() {
      clearTimeout(autoplayTimer);
      autoplayTimer = null;
    }
    function scheduleAutoplay() {
      pauseAutoplay();
      // Nota: non si esclude qui in base a prefers-reduced-motion — la
      // regola globale in base.css forza già transizioni/animazioni a
      // durata quasi nulla per chi lo richiede, quindi il contenuto
      // avanza comunque ma senza il movimento vero e proprio.
      if (count <= 1) return;
      autoplayTimer = setTimeout(() => goTo(currentIndex + 1, true), AUTOPLAY_DELAY);
    }

    function goTo(index, animated) {
      currentIndex = ((index % count) + count) % count;
      rotation = -currentIndex * angleStep;
      layout(animated !== false);
      updateUI();
      scheduleAutoplay();
    }

    if (prevBtn) prevBtn.addEventListener("click", () => goTo(currentIndex - 1, true));
    if (nextBtn) nextBtn.addEventListener("click", () => goTo(currentIndex + 1, true));
    if (dotsRoot) {
      dotsRoot.addEventListener("click", (e) => {
        const btn = e.target.closest("[data-go]");
        if (!btn) return;
        goTo(Number(btn.dataset.go), true);
      });
    }

    // L'autoscorrimento si ferma finché l'utente sta guardando/usando la
    // galleria (hover, focus da tastiera o trascinamento) e riparte da capo
    // appena la lascia, così non ruota mentre si sta leggendo una scheda.
    ring.addEventListener("mouseenter", pauseAutoplay);
    ring.addEventListener("mouseleave", scheduleAutoplay);
    ring.addEventListener("focusin", pauseAutoplay);
    ring.addEventListener("focusout", scheduleAutoplay);

    // Trascinamento con Pointer Events: unifica mouse e touch. Il gesto
    // resta "libero" (verticale = scroll di pagina, orizzontale = rotazione
    // dell'anello) finché non supera una soglia minima di movimento.
    stage.addEventListener("pointerdown", (e) => {
      if (e.button !== undefined && e.button !== 0) return;
      pauseAutoplay();
      dragging = true;
      axisLocked = null;
      dragStartX = e.clientX;
      dragStartY = e.clientY;
      dragStartRotation = rotation;
      stage.classList.add("is-dragging");
      stage.setPointerCapture(e.pointerId);
    });

    stage.addEventListener("pointermove", (e) => {
      if (!dragging) return;
      const dx = e.clientX - dragStartX;
      const dy = e.clientY - dragStartY;
      if (axisLocked === null && (Math.abs(dx) > 6 || Math.abs(dy) > 6)) {
        axisLocked = Math.abs(dx) > Math.abs(dy) ? "x" : "y";
      }
      if (axisLocked !== "x") return;
      e.preventDefault();
      rotation = dragStartRotation + dx * 0.35;
      layout(false);
    });

    function endDrag() {
      if (!dragging) return;
      dragging = false;
      stage.classList.remove("is-dragging");
      if (axisLocked === "x") {
        goTo(Math.round(-rotation / angleStep), true);
      } else {
        scheduleAutoplay();
      }
      axisLocked = null;
    }
    stage.addEventListener("pointerup", endDrag);
    stage.addEventListener("pointercancel", endDrag);

    stage.setAttribute("tabindex", "0");
    stage.addEventListener("keydown", (e) => {
      if (e.key === "ArrowRight") {
        e.preventDefault();
        goTo(currentIndex + 1, true);
      } else if (e.key === "ArrowLeft") {
        e.preventDefault();
        goTo(currentIndex - 1, true);
      }
    });

    window.addEventListener("resize", () => {
      computeRadius();
      layout(false);
    });

    computeRadius();
    goTo(0, false);
  }

  /* ------------------------------------------------------------------ */
  /* Render: competenze (home)                                           */
  /* ------------------------------------------------------------------ */
  function renderSkills(data) {
    const root = document.getElementById("skills-grid");
    if (!root) return;

    root.innerHTML = data.skills
      .map(
        (s) => `
      <div class="skill-card reveal">
        <span class="skill-card__icon">${icon(s.icon, 18)}</span>
        <div><h3>${s.name}</h3><p>${s.note}</p></div>
      </div>
    `
      )
      .join("");
  }

  /* ------------------------------------------------------------------ */
  /* Render: progetti Python + Web + Tool (python.html)                  */
  /* ------------------------------------------------------------------ */
  function mediaBlockFor(project) {
    const videos = (project.videos || [])
      .map(
        (v) => `
      <div class="project-card__media">
        <video controls preload="none" playsinline poster="" aria-label="${v.label}">
          <source src="${v.src}" type="video/mp4">
          Il tuo browser non supporta la riproduzione video. <a href="${v.src}">Scarica il video</a>.
        </video>
      </div>`
      )
      .join("");
    const images = (project.images || [])
      .map((src) => `<div class="project-card__media"><img src="${src}" alt="Screenshot — ${project.title}" loading="lazy"></div>`)
      .join("");
    return videos + images;
  }

  function renderPythonProjects(data) {
    const root = document.getElementById("python-projects");
    if (!root) return;
    root.innerHTML = data.pythonProjects
      .map(
        (p) => `
      <article class="glass-card project-card project-card--wide reveal">
        <div class="stack" style="gap: var(--space-4)">
          ${mediaBlockFor(p)}
        </div>
        <h3>${p.title}</h3>
        <p>${p.description}</p>
        <div class="badge-row">${p.tags.map((t) => `<span class="badge">${t}</span>`).join("")}</div>
        ${
          p.link
            ? `<div class="project-card__footer"><a class="project-card__link" href="${p.link.href}" target="_blank" rel="noopener">${p.link.label} ${icon("external", 16)}</a></div>`
            : ""
        }
      </article>
    `
      )
      .join("");
  }

  function renderWebProjects(data) {
    const root = document.getElementById("web-projects");
    if (!root) return;
    root.innerHTML = data.webProjects
      .map(
        (p) => `
      <article class="glass-card project-card reveal">
        <h3>${p.title}</h3>
        <p>${p.description}</p>
        <div class="badge-row">${p.tags.map((t) => `<span class="badge">${t}</span>`).join("")}</div>
        <div class="project-card__footer">
          <a class="project-card__link" href="${p.link.href}" target="_blank" rel="noopener">${p.link.label} ${icon("external", 16)}</a>
        </div>
      </article>
    `
      )
      .join("");
  }

  function renderTools(data) {
    const root = document.getElementById("tools-grid");
    if (!root) return;
    root.innerHTML = data.tools
      .map(
        (t) => `
      <article class="glass-card project-card reveal">
        <div class="tool-card__icon">${icon(t.icon, 18)}</div>
        <h3>${t.title}</h3>
        <p>${t.description}</p>
        <div class="badge-row">${t.tags.map((tag) => `<span class="badge">${tag}</span>`).join("")}</div>
        <div class="project-card__footer">
          <a class="project-card__link" href="${t.path}" download>Scarica sorgente ${icon("download", 16)}</a>
        </div>
      </article>
    `
      )
      .join("");
  }

  /* ------------------------------------------------------------------ */
  /* Bootstrap                                                           */
  /* ------------------------------------------------------------------ */
  document.addEventListener("DOMContentLoaded", () => {
    initTheme();
    initMenuOverlay();
    initBackToTop();
    initSmoothScroll();
    initFooterYear();

    const data = window.CV_DATA;
    if (data) {
      renderPersonalInfo(data);
      renderExperiences(data);
      renderSkills(data);
      renderPythonProjects(data);
      renderWebProjects(data);
      renderTools(data);
    }

    // Il reveal va inizializzato DOPO il render, altrimenti gli elementi
    // generati dinamicamente non sarebbero ancora nel DOM da osservare.
    initReveal();
  });

  // Esposto per riuso da certificates.js (stesso set di icone, un solo posto da mantenere).
  window.CV_ICON = icon;
})();
