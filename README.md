# Map Explorer

Rue-powered map and Street View exploration for people who like road hierarchy, street grids, rivers, grades, coordinates, and urban form.

## Status

The app is a static Rue interface with vanilla JavaScript state. It includes:

- A full-screen cartographic workspace with a right-aligned navigation bar.
- A collapsible map-type selector controlled by the navbar chevron.
- Search across roads, cities, neighborhoods, landmarks, and coordinates.
- Curated demo routes for New Orleans, San Francisco, and Chicago.
- Auto Drive, manual traversal, route history, and trip summaries.
- Six exploration strategies: scenic, downtown, random, coastal, historic, and highway routing.
- Detailed map telemetry: coordinates, road class, grid bearing, elevation, surface, grade, and river-mile context where relevant.
- Saved discoveries with local persistence.
- A Google Street View provider boundary with demo fallback.
- A demo Guesser mode with map placement, scoring, reveals, and round summaries.

## Commands

```bash
npm run build
npm run dev
npm test
npm run test:browser
npm run check
```

`npm run dev` builds the app and serves `out/` at `http://127.0.0.1:4174`.

`npm run test:browser` uses Playwright. If Playwright was just installed, run:

```bash
npx playwright install chromium
```

## Rue Imports

The app uses intended Rue module syntax now:

```rue
import { Navigation } from "./Navigation.rue"
export component Navigation() { ... }
```

`builder.js` resolves those `.rue` imports into dependency order before handing source to the current Rue compiler. That keeps the app source aligned with the intended language design while native Rue import support can mature later.

## Project Structure

```text
src/main.rue              Rue entrypoint
src/Navigation.rue        Navbar and chevron map-selector toggle
src/Shell.rue             App shell and workspace mounting
src/Panels.rue            Route, telemetry, discovery, and trip panels
src/Guesser.rue           Demo location guessing workspace
src/data/                 Curated routes, strategies, and guesser rounds
src/lib/                  Storage and telemetry helpers
src/providers/            Street View provider boundary
src/styles/               Static responsive and accessibility CSS
tests/                    Node and Playwright tests
out/                      Generated build output, ignored by Git
```

## Google Street View Mode

The UI lets you paste a Google Maps API key locally. The key is stored only in browser `localStorage`. Demo mode works without a key and remains available when Google Street View fails, has no linked panorama, or the key is missing.

## Safety And API Notes

- Do not commit API keys.
- Keep provider code isolated from Rue UI components.
- Treat Auto Drive as a Street View navigation aid, not autonomous driving.
- Respect Google Maps Platform terms and quota limits before public deployment.
