export function stepTelemetry(route, step, units = "imperial") {
  return {
    routeName: `${route.city} — ${route.name}`,
    region: `${route.city}, ${route.region}`,
    road: step.road,
    heading: `${Math.round(step.heading)}°`,
    distance: formatDistance(step.distanceMiles, units),
    coordinates: formatCoordinates(step.lat, step.lng),
    roadClass: sentenceCase(step.roadClass),
    elevation: formatElevation(step.elevationFt, units),
    riverMile: step.riverMileAHP == null ? "—" : `Mile ${step.riverMileAHP} AHP`,
    gridBearing: step.gridBearing,
    surface: `${sentenceCase(step.surface)} · ${formatGrade(step.gradePercent)}`
  }
}

export function formatCoordinates(lat, lng) {
  const latitude = `${Math.abs(lat).toFixed(4)}° ${lat >= 0 ? "N" : "S"}`
  const longitude = `${Math.abs(lng).toFixed(4)}° ${lng >= 0 ? "E" : "W"}`
  return `${latitude}, ${longitude}`
}

export function formatDistance(miles, units = "imperial") {
  return units === "metric"
    ? `${(miles * 1.60934).toFixed(1)} km`
    : `${miles.toFixed(1)} mi`
}

export function formatElevation(feet, units = "imperial") {
  return units === "metric"
    ? `${Math.round(feet * 0.3048)} m`
    : `${feet} ft`
}

export function formatGrade(grade) {
  const value = Number(grade)
  if (!Number.isFinite(value)) return "—"
  return `${value > 0 ? "+" : ""}${value.toFixed(1)}% grade`
}

export function sentenceCase(value) {
  const text = String(value ?? "")
  return text ? text[0].toUpperCase() + text.slice(1) : "—"
}
