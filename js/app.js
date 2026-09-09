/**
 * app.js — comportamento condiviso da tutte le pagine:
 * tema, navbar/hamburger, back-to-top, reveal on scroll,
 * più il render dei blocchi dati (home, progetti).
 *
 * Scritto per degradare bene: ogni funzione controlla che gli
 * elementi che le servono esistano davvero prima di agganciarsi
 * (a differenza del vecchio script.js/python.js che assumeva
 * sempre la presenza di #home, .carousel, ecc. e andava in errore
 * sulle pagine dove quegli elementi non ci sono).
 */
(function () {
  "use strict";

  const prefersReducedMotion = window.matchMedia("(prefers-reduced-motion: reduce)").matches;

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
        /* localStorage non disponibile (privacy mode ecc.): nessun problema, il tema resta solo per la sessione */
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
  /* Navbar mobile                                                       */
  /* ------------------------------------------------------------------ */
  function initNav() {
    const toggle = document.querySelector(".nav__toggle");
    const links = document.querySelector(".nav__links");
    if (!toggle || !links) return;

    function close() {
      toggle.setAttribute("aria-expanded", "false");
      links.setAttribute("data-open", "false");
    }
    function open() {
      toggle.setAttribute("aria-expanded", "true");
      links.setAttribute("data-open", "true");
    }

    toggle.addEventListener("click", () => {
      const isOpen = toggle.getAttribute("aria-expanded") === "true";
      isOpen ? close() : open();
    });

    links.querySelectorAll("a").forEach((a) => a.addEventListener("click", close));

    document.addEventListener("keydown", (e) => {
      if (e.key === "Escape" && toggle.getAttribute("aria-expanded") === "true") {
        close();
        toggle.focus();
      }
    });
  }

  /* ------------------------------------------------------------------ */
  /* Back to top (un solo listener per tutte le pagine, throttled)       */
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
          <span class="info-item__icon" aria-hidden="true">📍</span>
          <div><div class="info-item__label">Residenza</div><div class="info-item__value">${personalInfo.home}</div></div>
        </div>
        <div class="info-item">
          <span class="info-item__icon" aria-hidden="true">📞</span>
          <div><div class="info-item__label">Telefono</div><div class="info-item__value"><a href="tel:${personalInfo.phone.replace(/\s+/g, "")}">${personalInfo.phone}</a></div></div>
        </div>
        <div class="info-item">
          <span class="info-item__icon" aria-hidden="true">✉️</span>
          <div><div class="info-item__label">Email</div><div class="info-item__value"><a href="mailto:${personalInfo.email}">${personalInfo.email}</a><br><a href="mailto:${personalInfo.email2}">${personalInfo.email2}</a></div></div>
        </div>
        <div class="info-item">
          <span class="info-item__icon" aria-hidden="true">🎓</span>
          <div><div class="info-item__label">Formazione</div><div class="info-item__value">${education
            .map((e) => `${e.degree} — ${e.school} (${e.year})`)
            .join("<br>")}</div></div>
        </div>
      </div>
    `;
  }

  /* ------------------------------------------------------------------ */
  /* Render: timeline esperienze (home)                                  */
  /* ------------------------------------------------------------------ */
  function renderExperiences(data) {
    const root = document.getElementById("timeline");
    if (!root) return;

    root.innerHTML = data.experiences
      .map(
        (exp) => `
      <article class="timeline-item reveal${exp.current ? " timeline-item--current" : ""}">
        <div class="timeline-item__dot" aria-hidden="true">
          <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2"><path d="M3 21h18M5 21V7l7-4 7 4v14M9 9h.01M9 13h.01M9 17h.01M15 9h.01M15 13h.01M15 17h.01"/></svg>
        </div>
        <div class="glass-card timeline-item__card">
          <div class="timeline-item__head">
            <h3>${exp.title}</h3>
            <span class="timeline-item__period">${exp.period}</span>
          </div>
          <div class="timeline-item__company">${exp.company}</div>
          <p class="timeline-item__desc">${exp.description}</p>
          <ul class="timeline-item__tasks">
            ${exp.tasks.map((t) => `<li>${t}</li>`).join("")}
          </ul>
          <div class="badge-row">
            ${exp.tags.map((t) => `<span class="badge">${t}</span>`).join("")}
          </div>
        </div>
      </article>
    `
      )
      .join("");
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
      <div class="glass-card skill-card reveal">
        <span class="skill-card__icon" aria-hidden="true">${s.icon}</span>
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
            ? `<div class="project-card__footer"><a class="project-card__link" href="${p.link.href}" target="_blank" rel="noopener">${p.link.label}
              <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" aria-hidden="true"><path d="M7 17 17 7M8 7h9v9"/></svg></a></div>`
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
          <a class="project-card__link" href="${p.link.href}" target="_blank" rel="noopener">${p.link.label}
            <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" aria-hidden="true"><path d="M7 17 17 7M8 7h9v9"/></svg>
          </a>
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
        <div class="tool-card__icon" aria-hidden="true">${t.icon}</div>
        <h3>${t.title}</h3>
        <p>${t.description}</p>
        <div class="badge-row">${t.tags.map((tag) => `<span class="badge">${tag}</span>`).join("")}</div>
        <div class="project-card__footer">
          <a class="project-card__link" href="${t.path}" download>Scarica sorgente
            <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" aria-hidden="true"><path d="M12 3v12m0 0 4-4m-4 4-4-4M4 21h16"/></svg>
          </a>
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
    initNav();
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
})();
