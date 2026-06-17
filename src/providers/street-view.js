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
