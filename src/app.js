import { defaultRouteId, routes } from "./data/routes.js"
import { guesserRounds } from "./data/guesser.js"
import { explorationStrategies, strategyStep } from "./data/strategies.js"
import { readJson, writeJson } from "./lib/storage.js"
import { formatCoordinates, formatDistance, sentenceCase, stepTelemetry } from "./lib/telemetry.js"
import { GoogleStreetViewProvider } from "./providers/street-view.js"

const sessionKey = "mapExplorer.session.v1"
const discoveriesKey = "mapExplorer.discoveries.v1"
const preferencesKey = "mapExplorer.preferences.v1"
const historyKey = "mapExplorer.history.v1"
const googleKey = "mapExplorer.googleMapsKey"
const savedSession = readJson(sessionKey, {})
const savedPreferences = readJson(preferencesKey, {})
const streetViewProvider = new GoogleStreetViewProvider()

const state = {
  routeId: routes[savedSession.routeId] ? savedSession.routeId : defaultRouteId,
  step: Number.isInteger(savedSession.step) ? savedSession.step : 1,
  running: false,
  speedMs: Number(savedSession.speedMs) || 2000,
  timer: null,
  recentSearches: Array.isArray(savedSession.recentSearches) ? savedSession.recentSearches : [],
  mapType: savedSession.mapType || savedPreferences.mapType || "map",
  labels: savedSession.labels ?? savedPreferences.labels ?? true,
  zoom: Number(savedSession.zoom) || 14,
  discoveries: readJson(discoveriesKey, []),
  mode: savedPreferences.mode || "scenic",
  units: savedPreferences.units || "imperial",
  provider: "demo"
}

const routeHistory = Array.isArray(readJson(historyKey, [])) ? readJson(historyKey, []) : []
const guesserState = {
  roundIndex: -1,
  score: 0,
  guess: null,
  revealed: false
}

const route = () => routes[state.routeId]
const activeStep = () => route().steps[state.step]
const clampStep = value => Math.max(0, Math.min(route().steps.length - 1, value))
const reducedMotion = window.matchMedia("(prefers-reduced-motion: reduce)")

document.body.classList.toggle("reduce-motion", reducedMotion.matches)
reducedMotion.addEventListener?.("change", event => {
  document.body.classList.toggle("reduce-motion", event.matches)
})

const searchForm = document.getElementById("mapSearchForm")
const searchInput = document.getElementById("mapSearchInput")
const searchResults = document.getElementById("searchResults")
const discoveryForm = document.getElementById("discoveryForm")
const preferencesForm = document.getElementById("preferencesForm")
const routeSelect = document.getElementById("routeSelect")

routeSelect?.addEventListener("change", event => {
  state.routeId = event.target.value
  state.step = 0
  recordHistory("route", activeStep())
  persistSession()
  renderRouteProgress()
})

preferencesForm?.addEventListener("submit", event => {
  event.preventDefault()
  const preferences = {
    mapType: document.getElementById("preferenceMapType").value,
    labels: document.getElementById("preferenceLabels").checked,
    mode: document.getElementById("preferenceMode").value,
    units: document.getElementById("preferenceUnits").value
  }

  writeJson(preferencesKey, preferences)
  const key = document.getElementById("googleMapsKey").value.trim()
  if (key) window.localStorage.setItem(googleKey, key)

  state.mapType = preferences.mapType
  state.labels = preferences.labels
  state.mode = preferences.mode
  state.units = preferences.units
  hydrateSessionControls()
  persistSession()
  renderRouteProgress()
  setActiveScreen("explore")
})

discoveryForm?.addEventListener("submit", event => {
  event.preventDefault()
  const noteField = document.getElementById("discoveryNote")
  const current = activeStep()
  const note = noteField.value.trim()

  state.discoveries.unshift({
    id: crypto.randomUUID?.() ?? `${Date.now()}`,
    routeId: state.routeId,
    step: state.step,
    road: current.road,
    city: route().city,
    coordinates: { lat: current.lat, lng: current.lng },
    provider: "demo",
    note: note || current.instruction,
    savedAt: new Date().toISOString()
  })
  state.discoveries = state.discoveries.slice(0, 20)
  writeJson(discoveriesKey, state.discoveries)
  noteField.value = ""
  renderDiscoveries()
})

searchForm?.addEventListener("submit", event => {
  event.preventDefault()
  const first = searchMatches(searchInput.value)[0]
  if (first) selectSearchResult(first)
})

searchInput?.addEventListener("input", () => renderSearchResults(searchInput.value))
searchInput?.addEventListener("focus", () => renderSearchResults(searchInput.value))
searchInput?.addEventListener("keydown", event => {
  if (event.key === "Escape") searchResults?.classList.add("hidden")
})

document.getElementById("speedSelect")?.addEventListener("change", event => {
  state.speedMs = Number(event.target.value)
  persistSession()
  if (state.running) {
    stopAutoDrive()
    startAutoDrive()
  }
})

document.addEventListener("click", event => {
  if (event.target.closest("#startGuesserRound")) {
    startGuesserRound()
    return
  }

  const providerButton = event.target.closest("[data-provider]")
  if (providerButton) {
    selectProvider(providerButton.dataset.provider)
    return
  }

  const navigation = event.target.closest("[data-screen]")
  if (navigation) {
    setActiveScreen(navigation.dataset.screen)
    return
  }

  if (event.target.closest("[data-close-preferences]")) {
    setActiveScreen("explore")
    return
  }

  const removeDiscovery = event.target.closest("[data-remove-discovery]")
  if (removeDiscovery) {
    state.discoveries = state.discoveries.filter(item => item.id !== removeDiscovery.dataset.removeDiscovery)
    writeJson(discoveriesKey, state.discoveries)
    renderDiscoveries()
    return
  }

  const mapTypeButton = event.target.closest("[data-map-type]")
  if (mapTypeButton?.matches("button")) {
    applyMapType(mapTypeButton.dataset.mapType)
    return
  }

  const mapAction = event.target.closest("[data-map-action]")
  if (mapAction) {
    applyMapAction(mapAction.dataset.mapAction)
    return
  }

  const searchResult = event.target.closest("[data-search-step]")
  if (searchResult) {
    selectSearchResult({
      routeId: searchResult.dataset.searchRoute,
      step: Number(searchResult.dataset.searchStep)
    })
    return
  }

  if (event.target.closest("#autoDriveButton")) {
    toggleAutoDrive()
    return
  }

  const stepButton = event.target.closest("[data-step-direction]")
  if (!stepButton) return

  const direction = Number(stepButton.dataset.stepDirection)
  navigateStep(direction)
})

function startGuesserRound() {
  guesserState.roundIndex = (guesserState.roundIndex + 1) % guesserRounds.length
  guesserState.guess = null
  guesserState.revealed = false
  const round = guesserRounds[guesserState.roundIndex]
  const targetRoute = routes[round.routeId]
  const targetStep = targetRoute.steps[round.step]

  setText("guesserRoundTitle", `Round ${guesserState.roundIndex + 1} · ${round.title}`)
  setText("guesserHint", round.clue)
  setText("guesserError", "place your guess")
  setText("guesserPanorama", `${targetRoute.city} clue · ${targetStep.road}`)
  document.getElementById("guessMap")?.classList.remove("has-guess", "revealed")
}

async function selectProvider(provider) {
  const demoMap = document.getElementById("demoMap")
  const streetView = document.getElementById("streetViewSurface")

  if (provider === "demo") {
    streetViewProvider.deactivate()
    state.provider = "demo"
    demoMap?.classList.remove("hidden")
    streetView?.classList.remove("active")
    setText("providerStatus", "Demo mode ready")
    return
  }

  const key = document.getElementById("googleMapsKey")?.value.trim() || window.localStorage.getItem(googleKey) || ""
  setText("providerStatus", "Loading Street View…")
  try {
    await streetViewProvider.activate({
      key,
      container: streetView,
      position: { lat: activeStep().lat, lng: activeStep().lng },
      heading: activeStep().heading
    })
    state.provider = "google"
    demoMap?.classList.add("hidden")
    streetView?.classList.add("active")
    setText("providerStatus", "Google Street View ready")
    setActiveScreen("explore")
  } catch (error) {
    console.error(error)
    state.provider = "demo"
    demoMap?.classList.remove("hidden")
    streetView?.classList.remove("active")
    setText("providerStatus", "Street View unavailable · demo mode ready")
  }
}

function navigateStep(direction) {
  if (state.provider === "google") {
    const moved = streetViewProvider.move(direction)
    if (!moved) setText("providerStatus", "No linked panorama · route step used")
  }
  setStep(state.step + direction)
}

function setActiveScreen(screen) {
  document.querySelectorAll("[data-screen]").forEach(button => {
    button.classList.toggle("active", button.dataset.screen === screen)
  })

  const preferences = document.getElementById("preferencesBackdrop")
  const showPreferences = screen === "preferences"
  preferences?.classList.toggle("hidden", !showPreferences)
  preferences?.setAttribute("aria-hidden", String(!showPreferences))

  const guesser = document.getElementById("guesserWorkspace")
  const showGuesser = screen === "guesser"
  guesser?.classList.toggle("hidden", !showGuesser)

  document.getElementById("routePanel")?.classList.toggle("hidden", showGuesser)
  document.getElementById("placePanel")?.classList.toggle("hidden", showGuesser)
}

function applyMapType(type) {
  const map = document.getElementById("demoMap")
  if (!map) return

  if (type === "labels") {
    state.labels = !state.labels
    map.classList.toggle("labels-hidden", !state.labels)
    document.querySelector('[data-map-type="labels"]')?.classList.toggle("active", state.labels)
    persistSession()
    return
  }

  state.mapType = type
  map.dataset.mapType = type
  document.querySelectorAll("button[data-map-type]").forEach(button => {
    if (button.dataset.mapType !== "labels") button.classList.toggle("active", button.dataset.mapType === type)
  })
  persistSession()
}

function applyMapAction(action) {
  const map = document.getElementById("demoMap")
  if (!map) return

  if (action === "locate") {
    setStep(state.step)
    return
  }

  state.zoom = Math.max(13, Math.min(15, state.zoom + (action === "zoom-in" ? 1 : -1)))
  map.dataset.zoom = String(state.zoom)
  persistSession()
}

function searchMatches(query) {
  const normalized = query.trim().toLowerCase()
  const matches = []

  for (const candidate of Object.values(routes)) {
    candidate.steps.forEach((step, index) => {
      const haystack = [candidate.city, candidate.region, candidate.name, step.road, step.neighborhood, `${step.lat},${step.lng}`]
        .join(" ")
        .toLowerCase()
      if (!normalized || haystack.includes(normalized)) {
        matches.push({ routeId: candidate.id, step: index, road: step.road, place: `${candidate.city} · ${step.neighborhood}` })
      }
    })
  }

  return matches.slice(0, 7)
}

function renderSearchResults(query) {
  if (!searchResults) return
  const matches = query.trim()
    ? searchMatches(query)
    : state.recentSearches.length
      ? state.recentSearches
      : searchMatches("")
  searchResults.classList.remove("hidden")
  searchResults.innerHTML = matches.map(match => `
    <button class="search-result" type="button" data-search-route="${escapeHtml(match.routeId)}" data-search-step="${match.step}">
      <strong>${escapeHtml(match.road)}</strong>
      <small>${escapeHtml(match.place)}</small>
    </button>
  `).join("")
}

function selectSearchResult(result) {
  state.routeId = result.routeId
  state.step = clampStep(result.step)
  const selected = {
    routeId: result.routeId,
    step: result.step,
    road: activeStep().road,
    place: `${route().city} · ${activeStep().neighborhood}`
  }
  state.recentSearches = [selected, ...state.recentSearches.filter(item => item.routeId !== result.routeId || item.step !== result.step)].slice(0, 5)
  if (searchInput) searchInput.value = activeStep().road
  searchResults?.classList.add("hidden")
  persistSession()
  renderRouteProgress()
}

function setStep(nextStep) {
  const before = activeStep()
  state.step = clampStep(nextStep)
  if (activeStep().id !== before.id) recordHistory("move", activeStep())
  persistSession()
  renderRouteProgress()
}

function toggleAutoDrive() {
  state.running ? stopAutoDrive() : startAutoDrive()
}

function startAutoDrive() {
  state.running = true
  if (state.step === route().steps.length - 1) state.step = 0
  state.timer = window.setInterval(() => {
    if (state.step === route().steps.length - 1) {
      stopAutoDrive()
      return
    }
    navigateStep(strategyStep(state.mode, state.step))
  }, state.speedMs)
  renderRouteProgress()
}

function stopAutoDrive() {
  state.running = false
  window.clearInterval(state.timer)
  state.timer = null
  renderRouteProgress()
}

function renderRouteProgress() {
  const current = activeStep()
  const telemetry = stepTelemetry(route(), current, state.units)

  setText("routeName", telemetry.routeName)
  setText("currentRegion", telemetry.region)
  setText("currentRoad", telemetry.road)
  setText("headingMetric", telemetry.heading)
  setText("distanceMetric", telemetry.distance)
  setText("stepMetric", `Step ${state.step + 1} of ${route().steps.length}`)
  setText("coordinatesMetric", telemetry.coordinates)
  setText("roadClassMetric", telemetry.roadClass)
  setText("elevationMetric", telemetry.elevation)
  setText("riverMileMetric", telemetry.riverMile)
  setText("gridBearingMetric", telemetry.gridBearing)
  setText("surfaceMetric", telemetry.surface)
  setText("modeSummary", explorationStrategies[state.mode]?.label ?? "Scenic Roads")
  setText("strategyHint", explorationStrategies[state.mode]?.mapHint ?? explorationStrategies.scenic.mapHint)

  renderRouteList()
  renderTripSummary()

  document.querySelectorAll("[data-route-step]").forEach((element, index) => {
    element.classList.toggle("active", index === state.step)
  })

  document.querySelectorAll("[data-waypoint]").forEach((element, index) => {
    element.classList.toggle("active", index === state.step)
    element.textContent = index === state.step ? "➤" : String(index + 1)
  })

  document.querySelectorAll("[data-segment]").forEach((element, index) => {
    element.classList.toggle("complete", index <= state.step)
  })

  const back = document.querySelector('[data-step-direction="-1"]')
  const next = document.querySelector('[data-step-direction="1"]')
  const autoDrive = document.getElementById("autoDriveButton")
  if (routeSelect) routeSelect.value = state.routeId
  document.body.classList.toggle("is-driving", state.running)
  if (back) back.disabled = state.step === 0
  if (next) next.disabled = state.step === route().steps.length - 1
  if (autoDrive) {
    autoDrive.textContent = state.running ? "Pause" : "Auto Drive"
    autoDrive.setAttribute("aria-pressed", String(state.running))
  }

  document.documentElement.style.setProperty("--route-progress", `${state.step / (route().steps.length - 1)}`)
  document.title = `${current.road} · Map Explorer`
}

function renderDiscoveries() {
  const container = document.getElementById("savedDiscoveries")
  if (!container) return

  if (!state.discoveries.length) {
    container.innerHTML = '<div class="saved-empty">No saved discoveries yet.</div>'
    return
  }

  container.innerHTML = state.discoveries.slice(0, 3).map(item => `
    <article class="saved-item" data-discovery-id="${escapeHtml(item.id)}">
      <strong>${escapeHtml(item.road)} — ${escapeHtml(item.note)}</strong>
      <span>${escapeHtml(item.city)} · ${formatCoordinates(item.coordinates.lat, item.coordinates.lng)}</span>
      <button class="saved-remove" type="button" data-remove-discovery="${escapeHtml(item.id)}" aria-label="Remove ${escapeHtml(item.road)}">×</button>
    </article>
  `).join("")
}

function renderRouteList() {
  const list = document.getElementById("routeList")
  if (!list) return

  list.innerHTML = route().steps.map((step, index) => `
    <li class="route-step${index === state.step ? " active" : ""}" data-route-step="${index}">
      <span class="step-number">${index + 1}</span>
      <span>${escapeHtml(step.instruction)}</span>
      <span class="step-distance">${escapeHtml(formatStepDistance(step.distanceMiles))}</span>
    </li>
  `).join("")
}

function recordHistory(type, step) {
  routeHistory.unshift({
    type,
    routeId: state.routeId,
    step: state.step,
    road: step.road,
    roadClass: step.roadClass,
    distanceMiles: step.distanceMiles,
    at: new Date().toISOString()
  })
  routeHistory.splice(24)
  writeJson(historyKey, routeHistory)
}

function renderTripSummary() {
  const visited = routeHistory.filter(item => item.routeId === state.routeId)
  const roadClasses = new Set(visited.map(item => item.roadClass).filter(Boolean))
  const distance = activeStep().distanceMiles
  setText("tripDistance", formatStepDistance(distance))
  setText("tripSteps", String(Math.max(1, visited.length)))
  setText("tripRoadClasses", String(Math.max(1, roadClasses.size)))

  const list = document.getElementById("historyList")
  if (!list) return
  list.innerHTML = visited.slice(0, 5).map(item => `
    <div class="history-item">
      <span>${escapeHtml(item.road)}</span>
      <span>${escapeHtml(sentenceCase(item.roadClass))}</span>
    </div>
  `).join("")
}

function setText(id, value) {
  const element = document.getElementById(id)
  if (element) element.textContent = value
}

function formatStepDistance(miles) {
  return formatDistance(miles, state.units)
}

function escapeHtml(value) {
  return String(value)
    .replaceAll("&", "&amp;")
    .replaceAll("<", "&lt;")
    .replaceAll(">", "&gt;")
    .replaceAll('"', "&quot;")
    .replaceAll("'", "&#039;")
}

function persistSession() {
  writeJson(sessionKey, {
    routeId: state.routeId,
    step: state.step,
    speedMs: state.speedMs,
    recentSearches: state.recentSearches,
    mapType: state.mapType,
    labels: state.labels,
    zoom: state.zoom
  })
}

function hydrateSessionControls() {
  const map = document.getElementById("demoMap")
  if (map) {
    map.dataset.mapType = state.mapType
    map.dataset.zoom = String(state.zoom)
    map.classList.toggle("labels-hidden", !state.labels)
  }

  document.querySelectorAll("button[data-map-type]").forEach(button => {
    if (button.dataset.mapType === "labels") button.classList.toggle("active", state.labels)
    else button.classList.toggle("active", button.dataset.mapType === state.mapType)
  })

  const speed = document.getElementById("speedSelect")
  if (speed) speed.value = String(state.speedMs)

  const mapType = document.getElementById("preferenceMapType")
  const labels = document.getElementById("preferenceLabels")
  const mode = document.getElementById("preferenceMode")
  const units = document.getElementById("preferenceUnits")
  const key = document.getElementById("googleMapsKey")
  if (mapType) mapType.value = state.mapType
  if (labels) labels.checked = state.labels
  if (mode) mode.value = state.mode
  if (units) units.value = state.units
  if (key) key.value = window.localStorage.getItem(googleKey) || ""
  setText("modeSummary", explorationStrategies[state.mode]?.label ?? "Scenic Roads")
}

hydrateSessionControls()
renderDiscoveries()
renderRouteProgress()
