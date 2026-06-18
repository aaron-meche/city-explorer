export const routes = {
  "new-orleans-french-quarter": {
    id: "new-orleans-french-quarter",
    city: "New Orleans",
    region: "Louisiana",
    country: "United States",
    name: "French Quarter Loop",
    summary: "Canal Street to the river and back through the historic grid",
    center: { lat: 29.9569, lng: -90.0671 },
    startZoom: 14,
    distanceMiles: 3.1,
    riverSystem: "Mississippi River",
    steps: [
      {
        id: "canal-start",
        instruction: "Start on Canal Street",
        road: "Canal Street",
        neighborhood: "Central Business District",
        lat: 29.95464,
        lng: -90.07512,
        heading: 72,
        distanceMiles: 0,
        roadClass: "principal arterial",
        elevationFt: 3,
        gradePercent: 0.1,
        surface: "asphalt",
        gridBearing: "72° NE",
        riverMileAHP: 95.2
      },
      {
        id: "canal-quarter",
        instruction: "Continue on Canal Street",
        road: "Canal Street",
        neighborhood: "French Quarter",
        lat: 29.955,
        lng: -90.0715,
        heading: 72,
        distanceMiles: 0.8,
        roadClass: "principal arterial",
        elevationFt: 3,
        gradePercent: 0.1,
        surface: "asphalt and streetcar track",
        gridBearing: "72° NE",
        riverMileAHP: 95
      },
      {
        id: "esplanade-turn",
        instruction: "Turn right on Esplanade Avenue",
        road: "Esplanade Avenue",
        neighborhood: "Marigny",
        lat: 29.96538,
        lng: -90.05712,
        heading: 318,
        distanceMiles: 1.6,
        roadClass: "minor arterial",
        elevationFt: 2,
        gradePercent: 0,
        surface: "asphalt",
        gridBearing: "42° NW",
        riverMileAHP: 94.2
      },
      {
        id: "decatur-turn",
        instruction: "Turn right on Decatur Street",
        road: "Decatur Street",
        neighborhood: "French Quarter",
        lat: 29.96012,
        lng: -90.06162,
        heading: 224,
        distanceMiles: 2.3,
        roadClass: "minor arterial",
        elevationFt: 4,
        gradePercent: -0.1,
        surface: "asphalt",
        gridBearing: "44° SW",
        riverMileAHP: 94.8
      },
      {
        id: "basin-finish",
        instruction: "Turn left on Basin Street",
        road: "Basin Street",
        neighborhood: "Tremé",
        lat: 29.9582,
        lng: -90.07202,
        heading: 331,
        distanceMiles: 3.1,
        roadClass: "principal arterial",
        elevationFt: 1,
        gradePercent: 0,
        surface: "asphalt",
        gridBearing: "29° NW",
        riverMileAHP: 95.4
      }
    ]
  },
  "san-francisco-waterfront": {
    id: "san-francisco-waterfront",
    city: "San Francisco",
    region: "California",
    country: "United States",
    name: "Waterfront and Hills",
    summary: "Market Street to the Embarcadero, North Beach, Lombard, and Twin Peaks",
    center: { lat: 37.7954, lng: -122.4079 },
    startZoom: 13,
    distanceMiles: 6.4,
    riverSystem: "San Francisco Bay",
    steps: [
      { id: "market-start", instruction: "Start on Market Street", road: "Market Street", neighborhood: "Financial District", lat: 37.7936, lng: -122.3965, heading: 238, distanceMiles: 0, roadClass: "major arterial", elevationFt: 23, gradePercent: 0.4, surface: "asphalt and transit lanes", gridBearing: "58° SW", riverMileAHP: null },
      { id: "embarcadero-waterfront", instruction: "Follow the Embarcadero north", road: "The Embarcadero", neighborhood: "Waterfront", lat: 37.8017, lng: -122.3972, heading: 332, distanceMiles: 1.2, roadClass: "principal arterial", elevationFt: 9, gradePercent: 0.1, surface: "asphalt", gridBearing: "28° NW", riverMileAHP: null },
      { id: "columbus-north-beach", instruction: "Turn inland on Columbus Avenue", road: "Columbus Avenue", neighborhood: "North Beach", lat: 37.8009, lng: -122.4102, heading: 298, distanceMiles: 2.4, roadClass: "minor arterial", elevationFt: 55, gradePercent: 4.8, surface: "asphalt", gridBearing: "62° NW", riverMileAHP: null },
      { id: "lombard-crooked", instruction: "Climb Lombard Street", road: "Lombard Street", neighborhood: "Russian Hill", lat: 37.8021, lng: -122.4187, heading: 272, distanceMiles: 3.2, roadClass: "collector", elevationFt: 265, gradePercent: 13.6, surface: "brick and asphalt", gridBearing: "88° W", riverMileAHP: null },
      { id: "twin-peaks", instruction: "Finish at Twin Peaks Boulevard", road: "Twin Peaks Boulevard", neighborhood: "Twin Peaks", lat: 37.7544, lng: -122.4477, heading: 204, distanceMiles: 6.4, roadClass: "scenic collector", elevationFt: 830, gradePercent: 7.2, surface: "asphalt", gridBearing: "24° SW", riverMileAHP: null }
    ]
  },
  "chicago-lakefront-grid": {
    id: "chicago-lakefront-grid",
    city: "Chicago",
    region: "Illinois",
    country: "United States",
    name: "Lakefront Grid",
    summary: "Loop street wall to lakefront drives and river crossings",
    center: { lat: 41.8842, lng: -87.6231 },
    startZoom: 14,
    distanceMiles: 4.8,
    riverSystem: "Chicago River",
    steps: [
      { id: "state-start", instruction: "Start on State Street", road: "State Street", neighborhood: "Loop", lat: 41.8837, lng: -87.6277, heading: 0, distanceMiles: 0, roadClass: "minor arterial", elevationFt: 594, gradePercent: 0, surface: "asphalt", gridBearing: "0° N", riverMileAHP: null },
      { id: "wabash-bridge", instruction: "Cross the Chicago River on Wabash", road: "Wabash Avenue", neighborhood: "River North", lat: 41.8884, lng: -87.626, heading: 0, distanceMiles: 0.6, roadClass: "collector", elevationFt: 595, gradePercent: 0.2, surface: "steel grate bridge deck", gridBearing: "0° N", riverMileAHP: null },
      { id: "michigan-avenue", instruction: "Follow Michigan Avenue", road: "Michigan Avenue", neighborhood: "Magnificent Mile", lat: 41.8927, lng: -87.6241, heading: 0, distanceMiles: 1.2, roadClass: "principal arterial", elevationFt: 596, gradePercent: 0.1, surface: "asphalt", gridBearing: "0° N", riverMileAHP: null },
      { id: "lake-shore", instruction: "Turn onto Lake Shore Drive", road: "DuSable Lake Shore Drive", neighborhood: "Streeterville", lat: 41.8938, lng: -87.6117, heading: 177, distanceMiles: 2.7, roadClass: "urban expressway", elevationFt: 582, gradePercent: -0.2, surface: "asphalt", gridBearing: "3° S", riverMileAHP: null },
      { id: "grant-park", instruction: "Finish at Grant Park", road: "Columbus Drive", neighborhood: "Grant Park", lat: 41.8758, lng: -87.6208, heading: 181, distanceMiles: 4.8, roadClass: "collector", elevationFt: 591, gradePercent: 0, surface: "asphalt", gridBearing: "1° S", riverMileAHP: null }
    ]
  }
}

export const defaultRouteId = "new-orleans-french-quarter"
