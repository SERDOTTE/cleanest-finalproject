# CleanNest — Mattress & Upholstery Cleaning Services

WDD330 Final Project — Rodrigo Serdotte Freitas

## Tech Stack

- **Frontend:** Vite + Vanilla JS (ES Modules `.mjs`) — Single Page Application
- **Backend:** Node.js + Express in [server/server.js](server/server.js) (separate process)
- **Styling:** CSS with design tokens and animations

## Getting Started

### 1. Install dependencies

```bash
npm install
```

### 2. Run the frontend (Vite dev server)

```bash
npm run dev
```

Opens at `http://localhost:5173`

### 3. Run the backend (Express — separate terminal)

```bash
npm run server
```

Starts the API at `http://localhost:3000`. The Vite dev server proxies `/submit`
requests to this port automatically, so no CORS config is needed during development.

### 4. Production build

```bash
npm run build   # Output to dist/
npm run preview # Preview the built site locally
```

---

## Project Structure

```
finalproject/
├── index.html              ← Vite SPA entry (single HTML shell)
├── vite.config.js
├── package.json
├── public/
│   └── images/             ← Static assets served at /images/
├── src/
│   ├── main.mjs            ← App bootstrap (CSS imports + module init)
│   ├── router.mjs          ← Hash-based SPA router
│   ├── pages/
│   │   ├── home.mjs        ← Home section
│   │   ├── services.mjs    ← Service catalog + modal
│   │   ├── about.mjs       ← About Us section
│   │   └── contact.mjs     ← Contact form + scheduling
│   ├── modules/
│   │   ├── api.mjs         ← Centralized fetch (ViaCEP + Calendar endpoints)
│   │   ├── storage.mjs     ← localStorage manager + session recovery
│   │   ├── calculator.mjs  ← Pricing logic (+ stub for PDF quote)
│   │   ├── booking.mjs     ← Wizard state + step validation (stubs for Calendar)
│   │   └── ui/
│   │       ├── menu.mjs    ← Hamburger menu
│   │       └── theme.mjs   ← Dark/light toggle
│   └── data/
│       └── services.mjs    ← Re-exports service catalog
├── data/
│   └── services-list.mjs   ← Service catalog source of truth
├── styles/
│   ├── base.css            ← Reset + design tokens
│   ├── index.css           ← Home page styles
│   ├── services.css        ← Service grid + modal
│   ├── about.css           ← About page styles
│   ├── contact.css         ← Contact form + scheduling
│   └── animations.css      ← Unified animations + dark mode tokens
├── server/
│   └── server.js           ← Express API (form submissions)
```

## Notes

- `npm start` launches Vite on port 5173.
- `npm run server` launches the Express API on port 3000.
- `npm run build` produces a clean production build in `dist/`.

### Common Workflow Commands

- `npm install` installs all dependencies.
- `npm start` starts the Vite local dev server.
- `npm run server` starts the Express API used by form submission.
- `npm run lint` runs ESLint checks.
- `npm run lint:fix` runs ESLint and auto-fixes what it can.
- `npm run format` runs Prettier to format files.
- `npm run build` creates the production build.
- `npm run preview` serves the built files locally for final checks.

---

## Roadmap (per project proposal)

### Week 6 — Business Logic & Data Persistence

- [x] `calculator.mjs` — Full pricing wizard UI
- [x] `storage.mjs` — Cart abandonment toast/banner
- [x] `booking.mjs` — Multi-step wizard with progress bar
- [x] Dynamic review hub

### Week 7 — API Integrations & Deployment

- [x] `api.mjs` — ViaCEP lookup + service area notice
- [x] `api.mjs` — Google Calendar availability + event creation
- [ ] Automatic PDF quote generator
- [ ] Animations polish
- [ ] Deployment to Vercel
