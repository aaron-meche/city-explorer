import assert from "node:assert/strict"
import test from "node:test"
import { routes } from "../src/data/routes.js"
import { explorationStrategies, strategyStep } from "../src/data/strategies.js"
import { formatCoordinates, formatDistance, stepTelemetry } from "../src/lib/telemetry.js"

test("route catalog includes curated road nerd metadata", () => {
  assert.ok(Object.keys(routes).length >= 3)
  for (const route of Object.values(routes)) {
    assert.ok(route.steps.length >= 5)
    for (const step of route.steps) {
      assert.equal(typeof step.roadClass, "string")
      assert.equal(typeof step.gridBearing, "string")
      assert.equal(typeof step.elevationFt, "number")
      assert.equal(typeof step.distanceMiles, "number")
    }
  }
})

test("telemetry formats coordinates and units", () => {
  const route = routes["new-orleans-french-quarter"]
  const telemetry = stepTelemetry(route, route.steps[1], "imperial")
  assert.equal(telemetry.coordinates, "29.9550° N, 90.0715° W")
  assert.equal(telemetry.distance, "0.8 mi")
  assert.equal(formatCoordinates(-12.5, 33.25), "12.5000° S, 33.2500° E")
  assert.equal(formatDistance(1, "metric"), "1.6 km")
})

test("all exploration strategies produce route step movement", () => {
  assert.equal(Object.keys(explorationStrategies).length, 6)
  for (const key of Object.keys(explorationStrategies)) {
    assert.equal(typeof strategyStep(key, 0), "number")
  }
})
