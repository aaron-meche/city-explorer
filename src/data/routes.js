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
  }
}

export const defaultRouteId = "new-orleans-french-quarter"
