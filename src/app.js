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

document.addEventListener("click", event => {
  const stepButton = event.target.closest("[data-step-direction]")
  if (!stepButton) return

  const direction = Number(stepButton.dataset.stepDirection)
  setStep(state.step + direction)
})

function setStep(nextStep) {
  state.step = clampStep(nextStep)
  renderRouteProgress()
}

function renderRouteProgress() {
  const current = activeStep()

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
  if (back) back.disabled = state.step === 0
  if (next) next.disabled = state.step === route().steps.length - 1

  document.documentElement.style.setProperty("--route-progress", `${state.step / (route().steps.length - 1)}`)
  document.title = `${current.road} · Map Explorer`
}

renderRouteProgress()
