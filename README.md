# Cara IQ Laboratório (Web)

**Pure browser version** — no Flutter, no install needed after deployment.

Just open the website and analyze your face.

> Original product. Not a copy of any commercial service.

## Features (already working)

- Front + side photo upload
- Original 4-pillar scoring (Harmony, Structure, Dimorphism, Features)
- Key facial ratios calculated from landmark geometry
- Progress history saved in the browser
- Clean English mobile-friendly UI

## How to run it right now (local)

```bash
git clone https://github.com/Peddro313/cara-iq-laboratorio-web.git
cd cara-iq-laboratorio-web
npm install
npm run dev
```

Then open the URL that appears (usually http://localhost:5173).

## How to make it a real website (no terminal for users)

1. Push this repo to GitHub (already done).
2. Go to [vercel.com](https://vercel.com) → Import this repository → Deploy.
3. You get a public link like `https://cara-iq-laboratorio-web.vercel.app`.
4. Anyone can open that link on phone or computer. No install, no terminal.

Same works with Netlify or GitHub Pages.

## Current limitation

Landmark detection still uses demo points. Next step is wiring real **MediaPipe Face Landmarker** in the browser so scores come from the actual photos.

## Repositories

| Version | Repo |
|---------|------|
| Flutter (Android + iOS + Web) | [cara-iq-laboratorio](https://github.com/Peddro313/cara-iq-laboratorio) |
| Pure Web (this one) | [cara-iq-laboratorio-web](https://github.com/Peddro313/cara-iq-laboratorio-web) |

While you install Flutter, I continue improving this web version.
