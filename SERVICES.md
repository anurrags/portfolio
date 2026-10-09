# /editor and /drop

Two tools that live inside the portfolio, reachable only by typing the URL
(nothing on the portfolio links to them):

| Route | What | Code |
|---|---|---|
| `/editor`, `/editor/<id>` | Multi-person code editor | `src/editor/` |
| `/drop` | Send files between devices on the same WiFi | `src/drop/` |

One app, one `package.json`, one `node_modules`, one port. Each tool has its own
HTML entry (`editor.html`, `drop.html`), so it loads only its own code and can be
debugged on its own — the portfolio's `index.html` and `src/index.tsx` are
untouched.

```
src/
  editor/      main.tsx (entry) · routes/ · collab/ (Yjs sync) · codemirror/ · export/ · components/
  drop/        main.tsx (entry) · Drop.tsx · network/ (pairing + WebRTC) · components/ · content.json
  shared/      used by both: config.ts (backend URL) · paths.ts · Icon.tsx · styles.css · user.ts
scripts/       Vite plugin: routing, backend, per-page SEO (Node-side, not shipped)
```

The backend is the separate `portfolio-backend` project (deployed on Render).

## Run locally

```bash
npm install
npm start          # http://localhost:3000 — portfolio, /editor, /drop
```

`npm start` also starts `../portfolio-backend` in the background (installing its
dependencies on first run) and forwards `/api` and `/collab` to it, so everything
is on port 3000. On a phone, use the File drop address printed in the terminal.
Set `BACKEND_DIR` if the backend isn't next to this folder.

`npm run build && npm run serve` runs the production build the same way, routed
exactly as on Vercel.

## Deploy on Vercel

`vercel.json` holds the routes. Add under **Project → Settings → Environment
Variables**, then redeploy:

| Variable | Required | Value |
|---|---|---|
| `VITE_API_URL` | yes | The Render backend URL, e.g. `https://portfolio-backend.onrender.com` |
| `PUBLIC_ORIGIN` | no | Canonical site URL for SEO tags. Defaults to Vercel's production domain. |

On Render, `ALLOWED_ORIGINS` must include this site's URL.

## How the pieces connect

- `scripts/servicesPlugin.ts` — serves `/editor`, `/editor/<id>`, `/drop` per
  `vercel.json` in `npm start` and `npm run serve`; forwards the backend; writes
  each page's `<title>`, description and JSON-LD, plus `document.html` (the
  `noindex` page for individual documents) at build time.
- `scripts/backend.ts` — starts the backend on 127.0.0.1 and proxies to it.
- `scripts/seo.ts` — page metadata; the drop FAQ comes from `src/drop/content.json`.
- `src/shared/config.ts` — `VITE_API_URL` if set, otherwise the page's own origin.
