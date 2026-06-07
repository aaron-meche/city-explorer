# Map Explorer

Rue-powered Street View exploration app for people who like maps, driving, and discovering cities.

## Status

Initial scaffold. The app builds a static Rue-authored interface and includes:

- City and route presets.
- Auto Drive playback controls.
- Speed control.
- Saved discovery notes.
- A provider boundary for Google Street View.
- A built-in demo mode that works without an API key.

Google Street View automation requires a Google Maps JavaScript API key with Street View coverage available for the selected route. The app does not commit or require a key for the demo mode.

## Commands

```bash
npm run build
npm run dev
```

`npm run dev` builds the Rue app and serves `out/` at `http://localhost:4174`.

## Google Street View Mode

The UI lets you paste a Google Maps API key locally. The key is stored only in browser `localStorage` for convenience.

When Google mode is loaded, Auto Drive advances by following Street View panorama links instead of requiring repeated manual clicks.

## Project Structure

```text
web/main.rue        Rue-authored app shell and styling
public/app.js       Street View/demo driving controller
scripts/build.mjs   RueRouter static build and public asset copy
scripts/serve.mjs   Small local static server
out/                Generated static app output
```

## Direction

This should grow into an easier map exploration tool:

- Better route planning by city, neighborhood, road type, and scenery.
- Street View autopilot that follows roads smoothly and avoids jumps.
- Saved discoveries with notes and coordinates.
- Exploration modes such as scenic, downtown, coastal, historic, and random.
- Rue-driven UI experiments that keep the product usable while pushing Rue in a real app.

## Safety And API Notes

- Do not commit API keys.
- Keep Google provider code isolated from the Rue UI shell.
- Do not claim full autonomous driving behavior; this is a Street View navigation aid.
- Respect Google Maps Platform terms and quota limits before public deployment.
# city-explorer
