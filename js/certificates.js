/**
 * certificates.js — griglia certificati + lightbox accessibile.
 * Attivo solo in certificati.html (controlla l'esistenza di #cert-grid).
 */
(function () {
  "use strict";

  document.addEventListener("DOMContentLoaded", () => {
    const grid = document.getElementById("cert-grid");
    const data = window.CV_DATA;
    if (!grid || !data) return;

    const certificates = data.certificates;
    let lastFocused = null;
    let currentIndex = -1;

    grid.innerHTML = certificates
      .map((cert, i) => {
        const media = cert.image
          ? `<img src="${cert.image}" alt="Anteprima certificato — ${cert.title}" loading="lazy" decoding="async">`
          : `<span class="cert-card__media--doc" aria-hidden="true">📄</span>`;
        return `
        <article class="glass-card cert-card reveal">
          <button class="cert-card__media" data-index="${i}" aria-label="Ingrandisci: ${cert.title}" ${cert.image ? "" : "disabled"}>
            ${media}
          </button>
          <div class="cert-card__body">
            <h3>${cert.title}</h3>
            <p>${cert.issuer}</p>
            <div class="cert-card__actions">
              ${cert.image ? `<button class="cert-card__view" data-index="${i}">Ingrandisci</button>` : ""}
              ${cert.pdf ? `<a class="cert-card__view" href="${cert.pdf}" target="_blank" rel="noopener">Apri PDF</a>` : ""}
            </div>
          </div>
        </article>
      `;
      })
      .join("");

    // Lightbox
    const lightbox = document.getElementById("lightbox");
    if (!lightbox) return;
    const lightboxImg = lightbox.querySelector(".lightbox__figure img");
    const lightboxTitle = lightbox.querySelector("[data-lightbox-title]");
    const lightboxIssuer = lightbox.querySelector("[data-lightbox-issuer]");
    const closeBtn = lightbox.querySelector(".lightbox__close");
    const prevBtn = lightbox.querySelector(".lightbox__nav--prev");
    const nextBtn = lightbox.querySelector(".lightbox__nav--next");

    const withImage = certificates.map((c, i) => ({ ...c, i })).filter((c) => c.image);

    function openAt(index) {
      const item = certificates[index];
      if (!item || !item.image) return;
      currentIndex = index;
      lightboxImg.src = item.image;
      lightboxImg.alt = `Certificato: ${item.title}`;
      lightboxTitle.textContent = item.title;
      lightboxIssuer.textContent = item.issuer;
      lastFocused = document.activeElement;
      lightbox.setAttribute("data-open", "true");
      lightbox.setAttribute("aria-hidden", "false");
      closeBtn.focus();
      document.body.style.overflow = "hidden";
    }

    function close() {
      lightbox.setAttribute("data-open", "false");
      lightbox.setAttribute("aria-hidden", "true");
      document.body.style.overflow = "";
      if (lastFocused) lastFocused.focus();
    }

    function step(dir) {
      if (currentIndex === -1) return;
      const pool = withImage.map((c) => c.i);
      const pos = pool.indexOf(currentIndex);
      const next = pool[(pos + dir + pool.length) % pool.length];
      openAt(next);
    }

    grid.addEventListener("click", (e) => {
      const target = e.target.closest("[data-index]");
      if (!target || target.disabled) return;
      openAt(Number(target.dataset.index));
    });

    closeBtn.addEventListener("click", close);
    prevBtn.addEventListener("click", () => step(-1));
    nextBtn.addEventListener("click", () => step(1));

    lightbox.addEventListener("click", (e) => {
      if (e.target === lightbox) close();
    });

    document.addEventListener("keydown", (e) => {
      if (lightbox.getAttribute("data-open") !== "true") return;
      if (e.key === "Escape") close();
      if (e.key === "ArrowLeft") step(-1);
      if (e.key === "ArrowRight") step(1);
      if (e.key === "Tab") {
        // Focus trap semplice: solo i controlli della lightbox sono raggiungibili
        const focusables = [prevBtn, nextBtn, closeBtn];
        const idx = focusables.indexOf(document.activeElement);
        e.preventDefault();
        const nextIdx = e.shiftKey ? (idx <= 0 ? focusables.length - 1 : idx - 1) : (idx + 1) % focusables.length;
        focusables[nextIdx].focus();
      }
    });
  });
})();
