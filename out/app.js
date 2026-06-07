const routes = {
  "new-orleans": {
    city: "New Orleans",
    summary: "Canal Street toward the French Quarter",
    start: { lat: 29.9547, lng: -90.0751, heading: 72 },
    distancePerStep: 0.08,
    roads: [
      ["Canal Street", "Start downtown and roll toward the river."],
      ["Royal Street", "Slip into the French Quarter grid."],
      ["Esplanade Avenue", "Follow the live oak corridor."],
      ["St. Charles Avenue", "Cruise the streetcar line."],
      ["Magazine Street", "Explore shops, porches, and neighborhood texture."]
    ]
  },
  "san-francisco": {
    city: "San Francisco",
    summary: "Market Street toward the Embarcadero",
    start: { lat: 37.7936, lng: -122.3965, heading: 238 },
    distancePerStep: 0.11,
    roads: [
      ["Market Street", "Track the city spine through downtown."],
      ["Embarcadero", "Follow the waterfront and piers."],
      ["Lombard Street", "Climb toward steep neighborhood roads."],
      ["Great Highway", "Move along the ocean edge."],
      ["Twin Peaks Boulevard", "Look for skyline views and turns."]
    ]
  },
  "tokyo": {
    city: "Tokyo",
    summary: "Shibuya crossing to Omotesando",
    start: { lat: 35.6595, lng: 139.7005, heading: 64 },
    distancePerStep: 0.06,
    roads: [
      ["Shibuya Crossing", "Begin in dense pedestrian and sign motion."],
      ["Koen-dori", "Climb through shopping streets."],
      ["Omotesando", "Follow the boulevard and architecture."],
      ["Aoyama-dori", "Open into a broader arterial road."],
      ["Meiji Jingu Gaien", "Finish near tree-lined city edges."]
    ]
  }
}

const state = {
  cityKey: "new-orleans",
  mode: "scenic",
  provider: "demo",
  running: false,
  step: 0,
  distance: 0,
  speedMs: 2000,
  timer: null,
  saved: [],
  google: {
    panorama: null,
    service: null,
    loaded: false
  }
}

const $ = id => document.getElementById(id)

const els = {
  citySelect: $("citySelect"),
  modeSelect: $("modeSelect"),
  speedRange: $("speedRange"),
  speedValue: $("speedValue"),
  routeList: $("routeList"),
  autoDriveButton: $("autoDriveButton"),
  stageAutoButton: $("stageAutoButton"),
  pauseButton: $("pauseButton"),
  nextButton: $("nextButton"),
  backButton: $("backButton"),
  saveButton: $("saveButton"),
  saveNoteButton: $("saveNoteButton"),
  demoModeButton: $("demoModeButton"),
  loadGoogleButton: $("loadGoogleButton"),
  apiKeyInput: $("apiKeyInput"),
  noteInput: $("noteInput"),
  savedList: $("savedList"),
  streetViewStage: $("streetViewStage"),
  demoStage: $("demoStage"),
  providerStatus: $("providerStatus"),
  providerMetric: $("providerMetric"),
  cityMetric: $("cityMetric"),
  headingMetric: $("headingMetric"),
  distanceMetric: $("distanceMetric"),
  currentRoad: $("currentRoad"),
  currentCity: $("currentCity"),
  currentSummary: $("currentSummary"),
  driveHint: $("driveHint"),
  stepBadge: $("stepBadge"),
  miniCar: $("miniCar")
}

hydrate()
render()

els.citySelect.addEventListener("change", () => {
  state.cityKey = els.citySelect.value
  state.step = 0
  state.distance = 0
  if (state.provider === "google" && state.google.loaded) {
    setGoogleStart()
  }
  render()
})

els.modeSelect.addEventListener("change", () => {
  state.mode = els.modeSelect.value
  render()
})

els.speedRange.addEventListener("input", () => {
  state.speedMs = Number(els.speedRange.value)
  restartTimerIfRunning()
  render()
})

els.autoDriveButton.addEventListener("click", startDriving)
els.stageAutoButton.addEventListener("click", startDriving)
els.pauseButton.addEventListener("click", pauseDriving)
els.nextButton.addEventListener("click", () => driveStep(1))
els.backButton.addEventListener("click", () => driveStep(-1))
els.saveButton.addEventListener("click", saveCurrentView)
els.saveNoteButton.addEventListener("click", saveCurrentView)
els.demoModeButton.addEventListener("click", useDemoMode)
els.loadGoogleButton.addEventListener("click", loadGoogleMode)

function hydrate() {
  const savedKey = localStorage.getItem("mapExplorer.googleMapsKey")
  if (savedKey) els.apiKeyInput.value = savedKey
}

function currentRoute() {
  return routes[state.cityKey]
}

function currentRoad() {
  const route = currentRoute()
  return route.roads[wrapStep(state.step, route.roads.length)]
}

function wrapStep(step, length) {
  return ((step % length) + length) % length
}

function startDriving() {
  state.running = true
  restartTimerIfRunning()
  render()
}

function pauseDriving() {
  state.running = false
  if (state.timer) clearInterval(state.timer)
  state.timer = null
  render()
}

function restartTimerIfRunning() {
  if (state.timer) clearInterval(state.timer)
  state.timer = null
  if (!state.running) return
  state.timer = setInterval(() => driveStep(1), state.speedMs)
}

function driveStep(direction) {
  if (state.provider === "google" && state.google.panorama) {
    driveGoogleStep(direction)
  } else {
    state.step += direction
  }

  state.distance = Math.max(0, state.distance + currentRoute().distancePerStep * direction)
  render()
}

function driveGoogleStep(direction) {
  const panorama = state.google.panorama
  const links = panorama.getLinks?.() ?? []
  if (!links.length) {
    state.step += direction
    return
  }

  const currentHeading = panorama.getPov().heading ?? currentRoute().start.heading
  const sorted = [...links].sort((a, b) => {
    const aScore = headingDelta(a.heading ?? currentHeading, currentHeading)
    const bScore = headingDelta(b.heading ?? currentHeading, currentHeading)
    return aScore - bScore
  })
  const nextLink = direction >= 0 ? sorted[0] : sorted[sorted.length - 1]

  if (nextLink?.pano) {
    panorama.setPano(nextLink.pano)
    panorama.setPov({
      heading: nextLink.heading ?? currentHeading,
      pitch: 0
    })
  }

  state.step += direction
}

function headingDelta(a, b) {
  const delta = Math.abs((((a - b) % 360) + 540) % 360 - 180)
  return Number.isFinite(delta) ? delta : 0
}

function saveCurrentView() {
  const route = currentRoute()
  const [road, hint] = currentRoad()
  const note = els.noteInput.value.trim()
  const entry = {
    city: route.city,
    road,
    note: note || hint,
    provider: state.provider === "google" ? "Google Street View" : "Demo Street View",
    step: wrapStep(state.step, route.roads.length),
    distance: state.distance.toFixed(1)
  }

  state.saved.unshift(entry)
  state.saved = state.saved.slice(0, 8)
  els.noteInput.value = ""
  render()
}

function useDemoMode() {
  pauseDriving()
  state.provider = "demo"
  state.google.panorama = null
  state.google.service = null
  els.streetViewStage.innerHTML = ""
  render()
}

async function loadGoogleMode() {
  const key = els.apiKeyInput.value.trim()
  if (!key) {
    setStatus("Paste a Google Maps API key to load live Street View.")
    return
  }

  localStorage.setItem("mapExplorer.googleMapsKey", key)
  setStatus("Loading Google Street View...")

  try {
    await loadGoogleMaps(key)
    state.provider = "google"
    state.google.loaded = true
    state.google.service = new google.maps.StreetViewService()
    state.google.panorama = new google.maps.StreetViewPanorama(els.streetViewStage, {
      addressControl: false,
      fullscreenControl: false,
      motionTracking: false,
      motionTrackingControl: false,
      panControl: false,
      showRoadLabels: true,
      zoomControl: true
    })
    setGoogleStart()
    setStatus("Google Street View loaded.")
    render()
  } catch (error) {
    console.error(error)
    state.provider = "demo"
    setStatus("Could not load Google Street View. Demo mode is still available.")
    render()
  }
}

function setGoogleStart() {
  if (!state.google.panorama) return

  const route = currentRoute()
  state.google.panorama.setPosition({ lat: route.start.lat, lng: route.start.lng })
  state.google.panorama.setPov({ heading: route.start.heading, pitch: 0 })
  state.google.panorama.setZoom(1)
}

function loadGoogleMaps(key) {
  if (window.google?.maps) return Promise.resolve()

  return new Promise((resolve, reject) => {
    window.__mapExplorerGoogleReady = () => resolve()
    const script = document.createElement("script")
    script.src = `https://maps.googleapis.com/maps/api/js?key=${encodeURIComponent(key)}&callback=__mapExplorerGoogleReady`
    script.async = true
    script.defer = true
    script.onerror = () => reject(new Error("Google Maps script failed to load."))
    document.head.appendChild(script)
  })
}

function render() {
  const route = currentRoute()
  const routeStep = wrapStep(state.step, route.roads.length)
  const [road, hint] = currentRoad()
  const heading = googleHeading() ?? ((route.start.heading + routeStep * 19) % 360)
  const progress = routeStep / Math.max(1, route.roads.length - 1)

  els.cityMetric.textContent = route.city
  els.currentCity.textContent = route.city
  els.currentRoad.textContent = road
  els.currentSummary.textContent = hint
  els.driveHint.textContent = state.running
    ? `${state.modeLabel ?? modeLabel()} mode is running. Next: ${nextRoadName(routeStep)}.`
    : "Press Auto Drive to begin exploring."
  els.headingMetric.textContent = `${Math.round(heading)} deg`
  els.distanceMetric.textContent = `${state.distance.toFixed(1)} mi`
  els.providerMetric.textContent = state.provider === "google" ? "Google" : "Demo"
  els.providerStatus.textContent = state.provider === "google"
    ? "Google Street View ready"
    : "Demo Street View ready"
  els.stepBadge.textContent = String(routeStep + 1)
  els.speedValue.textContent = `${(state.speedMs / 1000).toFixed(1)}s / step`
  els.demoStage.classList.toggle("running", state.running)
  els.demoStage.style.display = state.provider === "google" ? "none" : "grid"
  els.streetViewStage.style.display = state.provider === "google" ? "block" : "none"
  els.autoDriveButton.disabled = state.running
  els.stageAutoButton.disabled = state.running
  els.pauseButton.disabled = !state.running
  els.miniCar.style.left = `${22 + progress * 54}%`
  els.miniCar.style.top = `${74 - progress * 48}%`

  renderRouteList(route, routeStep)
  renderSaved()
}

function googleHeading() {
  return state.google.panorama?.getPov?.().heading
}

function modeLabel() {
  const labels = {
    scenic: "Scenic roads",
    downtown: "Downtown grid",
    random: "Random turns"
  }
  return labels[state.mode] ?? "Scenic roads"
}

function nextRoadName(routeStep) {
  const route = currentRoute()
  return route.roads[wrapStep(routeStep + 1, route.roads.length)][0]
}

function renderRouteList(route, routeStep) {
  els.routeList.innerHTML = route.roads.map(([name, hint], index) => `
    <div class="route-item" aria-current="${index === routeStep ? "step" : "false"}">
      <div class="route-step">${index + 1}</div>
      <div class="route-copy">
        <strong>${escapeHtml(name)}</strong>
        <span>${escapeHtml(index === routeStep ? "Current road" : hint)}</span>
      </div>
    </div>
  `).join("")
}

function renderSaved() {
  if (!state.saved.length) {
    els.savedList.innerHTML = `<div class="empty">No saved discoveries yet.</div>`
    return
  }

  els.savedList.innerHTML = state.saved.map(item => `
    <div class="saved-item">
      <strong>${escapeHtml(item.road)}</strong>
      <span>${escapeHtml(item.city)} · ${escapeHtml(item.provider)} · ${escapeHtml(item.distance)} mi</span>
      <span>${escapeHtml(item.note)}</span>
    </div>
  `).join("")
}

function setStatus(message) {
  els.providerStatus.textContent = message
}

function escapeHtml(value) {
  return String(value)
    .replaceAll("&", "&amp;")
    .replaceAll("<", "&lt;")
    .replaceAll(">", "&gt;")
    .replaceAll('"', "&quot;")
    .replaceAll("'", "&#039;")
}
