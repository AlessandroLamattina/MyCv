# CV di Alessandro Lamattina

Sito personale con curriculum, esperienze lavorative, certificazioni e progetti.
HTML, CSS e JavaScript statici — nessun build step, nessuna dipendenza da Node:
si pubblica con un semplice push su GitHub Pages.

## Struttura

```
index.html            Home: hero, informazioni personali, esperienze, competenze
certificati.html       Griglia certificati con lightbox e link ai PDF
python.html            Progetti Python, progetti web e tool di automazione
facedetection.html     Demo di face tracking 3D (MediaPipe + Three.js)

css/tokens.css         Variabili: colori (tema chiaro/scuro), spaziature, tipografia
css/base.css           Reset e layout di base
css/components.css     Componenti: navbar, card, timeline, lightbox, ecc.

js/data.js             Unica fonte dati: informazioni personali, esperienze,
                        competenze, certificati, progetti e tool
js/app.js              Navbar, tema, reveal on scroll, back-to-top, render sezioni
js/hero3d.js           Sfondo 3D dell'hero (Three.js, disattivato su mobile/
                        prefers-reduced-motion o se WebGL non è disponibile)
js/certificates.js     Griglia certificati e lightbox accessibile
js/facedetection.js    Logica della demo di face tracking

file/                  Immagini, video e il CV in PDF
file/cert/             PDF originali delle certificazioni
tools/                 Script di automazione (Python, PowerShell) collegati
                        dalla pagina progetti
```

## Anteprima locale

Serve un piccolo server statico (aprire i file con `file://` blocca il
caricamento di `js/data.js` in alcuni browser). Con Python già installato:

```
python -m http.server 8000
```

poi apri `http://localhost:8000/`.

## Aggiornare i contenuti

Esperienze, competenze, certificati e progetti si modificano in un solo
punto: [js/data.js](js/data.js). Le pagine HTML si limitano a renderizzare
quei dati, non contengono testo duplicato.

## Note

- Effetti (GSAP/Lenis/Three.js) caricati da CDN con `defer`: se un CDN non
  risponde, il sito resta comunque leggibile e navigabile (nessuna
  dipendenza bloccante).
- I video in `file/` (~100 MB totali) non sono stati ricompressi: se possibile
  vale la pena ridurli con `ffmpeg` per velocizzare il caricamento di
  `python.html`.
