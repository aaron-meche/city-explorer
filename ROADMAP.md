# Map Explorer
A map exploring software written by a map lover, designed to empower geography, city design, and highway routing learning.

Officially started on June 15, 2026

## Interface

1. The Landing Page
Static, no-scroll, fixed viewport. The background is a slow moving aerial pan of downtown Manhattan with visible streets, tall buildings, and traffic motion. A centered control menu sits vertically and horizontally in the viewport.

Primary elements:
- "Map Explorer" app title.
- "Start Exploring" button that opens the main map exploring screen.
- "Play Guesser" button that opens the GeoGuessr-like challenge mode.
- "Preferences" button that opens settings before entering a mode.
- Small provider/status text for demo mode or live Street View availability.

Behavior:
- The landing page should load instantly and not require a map provider key.
- Button focus, hover, and pressed states should be clear.
- If a user already has saved preferences, the landing page should respect them when launching a mode.

2. Map Exploring Screen
Static, no-scroll, fixed viewport. The embedded map or Street View layer fills 100% of the screen height and width. Standard map view is the default; satellite view is optional. The map surface remains the primary visual element, with compact floating controls layered above it.

Screen layout:
- TopLeftContainer
- TopRightContainer
- BottomLeftContainer
- BottomRightContainer
- CenterStageOverlay, used only for current route prompts, loading states, and mode-specific temporary messaging.

TopLeftContainer:
- Starts as a search button.
- Expands into a search bar when clicked or focused.
- Supports searches for road names, city names, state names, country names, landmarks, coordinates, and saved discoveries.
- Shows recent searches and route presets when empty.
- Submitting a result should pan the map, update the current location context, and offer "Explore Here" and "Start Route" actions.

TopRightContainer:
- Contains map view preference controls.
- Includes toggles for standard map, satellite, road line display, text labels, traffic, terrain, borders, and points of interest.
- Includes a compact provider switch for Demo mode and Google Street View mode.
- Shows live provider health: ready, loading, missing key, quota/error, or demo fallback.

BottomLeftContainer:
- Contains movement and exploration controls.
- Primary controls: Back, Next Turn, Auto Drive, Pause, Save View.
- Includes an Auto Drive speed slider and exploration mode selector.
- Exploration modes should include at minimum Scenic Roads, Downtown Grid, Random Turns, Coastal, Historic, and Highway Routing.
- Shows the active route step list when expanded.
- Collapses to a compact transport bar on small screens.

BottomRightContainer:
- Contains the current place and discovery panel.
- Shows current city, road, heading, distance traveled, provider, and route step.
- Includes a note field for "What did you notice here?"
- Includes "Save Current View" and a saved discoveries list.
- Saved discoveries should include place name, road, coordinates when available, provider, distance, note, and timestamp.
- Can expand into a richer details panel with nearby roads, landmarks, and route history.

Map and Street View behavior:
- Demo mode should work without an API key.
- Google Street View mode should load only after the user provides a key locally.
- Auto Drive should advance through route steps in demo mode and panorama links in live Street View mode.
- The interface should never block exploration just because live Street View is unavailable; it should fall back to demo mode with a clear status message.

3. Guesser Screen
Static, no-scroll, fixed viewport. The player is dropped into a Street View or demo panorama and must guess the location on a map.

Core layout:
- Main panorama fills the viewport.
- A collapsible guess map sits in the lower right by default.
- Top bar shows round number, score, timer, and mode.
- Bottom transport controls allow limited movement based on the selected game rules.

Game flow:
- Start round.
- Explore the location.
- Place a guess on the map.
- Submit guess.
- Reveal true location, distance error, score, and route/context notes.
- Continue to next round or end game summary.

Game options:
- City-only, country-only, world, highways, downtowns, landmarks, and custom saved-route challenges.
- Timed and untimed modes.
- Movement allowed, no-move, pan-only, and single-view modes.

4. Preferences Screen
Fixed viewport or modal-style screen reachable from the landing page and map screen.

Preference groups:
- Map defaults: starting city, default view type, labels, traffic, terrain, measurement units.
- Exploration defaults: mode, auto-drive speed, route length, movement style.
- Provider settings: demo mode, Google Street View key, provider status, key removal.
- Guesser defaults: game type, round count, timer, movement rules.
- Privacy and storage: saved discoveries, local API key storage, clear local data.

5. Responsive Behavior
- Desktop: floating corner containers may expand independently without covering the main map target.
- Tablet: left and right panels collapse into drawers, with transport controls pinned along the bottom.
- Mobile: the map remains full screen; search, layers, route controls, and discoveries become bottom-sheet panels.
- Text must not overflow buttons or panels.
- Important controls must remain reachable with one hand on mobile.

6. Accessibility and Input
- All buttons, sliders, selects, search fields, and map controls must be keyboard reachable.
- Visible focus states are required.
- Icon-only buttons need accessible labels and tooltips.
- Motion-heavy backgrounds and Auto Drive animation should respect reduced-motion preferences.
- Color must not be the only way to communicate provider state, route state, or game result.
