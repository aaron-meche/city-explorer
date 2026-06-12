import { defaultRouteId, routes } from "./data/routes.js"

const state = {
  routeId: defaultRouteId,
  step: 1,
  running: false,
  speedMs: 2000,
  timer: null
}

const route = () => routes[state.routeId]
const activeStep = () => route().steps[state.step]
const clampStep = value => Math.max(0, Math.min(route().steps.length - 1, value))
const reducedMotion = window.matchMedia("(prefers-reduced-motion: reduce)")

document.body.classList.toggle("reduce-motion", reducedMotion.matches)
reducedMotion.addEventListener?.("change", event => {
  document.body.classList.toggle("reduce-motion", event.matches)
})

document.getElementById("speedSelect")?.addEventListener("change", event => {
  state.speedMs = Number(event.target.value)
  if (state.running) {
    stopAutoDrive()
    startAutoDrive()
  }
})

document.addEventListener("click", event => {
  if (event.target.closest("#autoDriveButton")) {
    toggleAutoDrive()
    return
  }

  const stepButton = event.target.closest("[data-step-direction]")
  if (!stepButton) return

  const direction = Number(stepButton.dataset.stepDirection)
  setStep(state.step + direction)
})

function setStep(nextStep) {
  state.step = clampStep(nextStep)
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
    setStep(state.step + 1)
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

  setText("currentRegion", `${route().city}, ${route().region}`)
  setText("currentRoad", current.road)
  setText("headingMetric", `${current.heading}°`)
  setText("distanceMetric", `${current.distanceMiles.toFixed(1)} mi`)
  setText("stepMetric", `Step ${state.step + 1} of ${route().steps.length}`)
  setText("coordinatesMetric", formatCoordinates(current.lat, current.lng))
  setText("roadClassMetric", sentenceCase(current.roadClass))
  setText("elevationMetric", `${current.elevationFt} ft`)
  setText("riverMileMetric", current.riverMileAHP == null ? "—" : `Mile ${current.riverMileAHP} AHP`)
  setText("gridBearingMetric", current.gridBearing)
  setText("surfaceMetric", `${sentenceCase(current.surface)} · ${formatGrade(current.gradePercent)}`)

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

function setText(id, value) {
  const element = document.getElementById(id)
  if (element) element.textContent = value
}

function formatCoordinates(lat, lng) {
  const latitude = `${Math.abs(lat).toFixed(4)}° ${lat >= 0 ? "N" : "S"}`
  const longitude = `${Math.abs(lng).toFixed(4)}° ${lng >= 0 ? "E" : "W"}`
  return `${latitude}, ${longitude}`
}

function sentenceCase(value) {
  const text = String(value ?? "")
  return text ? text[0].toUpperCase() + text.slice(1) : "—"
}

function formatGrade(grade) {
  const value = Number(grade)
  if (!Number.isFinite(value)) return "—"
  return `${value > 0 ? "+" : ""}${value.toFixed(1)}% grade`
}

renderRouteProgress()
