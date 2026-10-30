# THE DEVIL'S PROJECT

A cinematic, local-only research interface prototype. This project intentionally contains no AI backend, web-search integration, or external research service. Every result shown is clearly identified as illustrative demo content.

## Run

Open `index.html` in a modern browser. The app has no build step or package dependencies. For local server preview, run `python -m http.server 8000` from this folder, then open `http://localhost:8000`.

The cinematic opening runs once per browser session, can be skipped, and is bypassed when the operating system requests reduced motion. History, saved demo notes, and interface preferences stay in browser local storage. No sensitive personal information is collected.

## Interface areas

Home, Universal Search, People Intelligence, Scholarships, Technology, Organizations, Education, Deep Research, Saved Files, History, and Settings are all implemented as client-side views. Search interactions preview sample result cards only; no query leaves the browser.

## Environment note

This workspace was created without Node.js or npm available. To keep the interface immediately runnable in this environment, the prototype uses native HTML, CSS, and JavaScript rather than React/Vite. The page structure is organized into reusable rendering and interaction functions for a future framework migration.