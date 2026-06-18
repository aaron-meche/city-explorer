export class GoogleStreetViewProvider {
  constructor() {
    this.panorama = null
    this.status = "idle"
  }

  async activate({ key, container, position, heading }) {
    if (!key) throw new Error("A Google Maps API key is required.")
    this.status = "loading"
    await loadGoogleMaps(key)

    this.panorama = new google.maps.StreetViewPanorama(container, {
      position,
      pov: { heading, pitch: 0 },
      zoom: 1,
      addressControl: false,
      fullscreenControl: false,
      motionTracking: false,
      motionTrackingControl: false,
      panControl: false,
      showRoadLabels: true
    })
    this.status = "ready"
    return this.panorama
  }

  deactivate() {
    this.panorama = null
    this.status = "idle"
  }

  getPosition() {
    const position = this.panorama?.getPosition?.()
    return position ? { lat: position.lat(), lng: position.lng() } : null
  }

  getHeading() {
    return this.panorama?.getPov?.().heading ?? null
  }

  move(direction = 1) {
    if (!this.panorama) return false
    const links = this.panorama.getLinks?.() ?? []
    if (!links.length) return false

    const currentHeading = this.getHeading() ?? 0
    const ordered = [...links].sort((a, b) => {
      const aDelta = headingDelta(a.heading ?? currentHeading, currentHeading)
      const bDelta = headingDelta(b.heading ?? currentHeading, currentHeading)
      return aDelta - bDelta
    })
    const next = direction >= 0 ? ordered[0] : ordered[ordered.length - 1]
    if (!next?.pano) return false

    this.panorama.setPano(next.pano)
    this.panorama.setPov({ heading: next.heading ?? currentHeading, pitch: 0 })
    return true
  }
}

function headingDelta(a, b) {
  return Math.abs((((a - b) % 360) + 540) % 360 - 180)
}

function loadGoogleMaps(key) {
  if (window.google?.maps?.StreetViewPanorama) return Promise.resolve()

  return new Promise((resolve, reject) => {
    const callbackName = `__mapExplorerGoogleReady${Date.now()}`
    const script = document.createElement("script")
    window[callbackName] = () => {
      delete window[callbackName]
      resolve()
    }
    script.src = `https://maps.googleapis.com/maps/api/js?key=${encodeURIComponent(key)}&callback=${callbackName}`
    script.async = true
    script.defer = true
    script.onerror = () => reject(new Error("Google Maps failed to load."))
    document.head.appendChild(script)
  })
}
