export const explorationStrategies = {
  scenic: {
    id: "scenic",
    label: "Scenic Roads",
    description: "Favor park edges, waterfronts, tree canopies, and textured neighborhood streets.",
    stepPattern: [1, 1, 1, 1],
    mapHint: "Look for shade, water, old rights-of-way, and street-wall changes."
  },
  downtown: {
    id: "downtown",
    label: "Downtown Grid",
    description: "Follow orthogonal city grids and compare block rhythm, frontage, and land-use intensity.",
    stepPattern: [1, 1, -1, 1],
    mapHint: "Watch lane counts, signal spacing, curb cuts, and one-way pairs."
  },
  random: {
    id: "random",
    label: "Random Turns",
    description: "Take deliberate exploratory jumps while still staying inside the selected route.",
    stepPattern: [1, 2, -1, 1],
    mapHint: "Use surprise turns to catch street hierarchy transitions."
  },
  coastal: {
    id: "coastal",
    label: "Coastal",
    description: "Prioritize riverfronts, bays, canals, and flood-control edges.",
    stepPattern: [1, 1, 2, 1],
    mapHint: "Track levees, port edges, ferry landings, and water-facing grids."
  },
  historic: {
    id: "historic",
    label: "Historic",
    description: "Move slowly through legacy corridors, older building stock, squares, and preserved street forms.",
    stepPattern: [1, -1, 1, 1],
    mapHint: "Compare lot widths, street names, paving clues, and surviving rail/streetcar geometry."
  },
  highway: {
    id: "highway",
    label: "Highway Routing",
    description: "Focus on ramps, arterials, bridge approaches, lane drops, and regional road hierarchy.",
    stepPattern: [2, 1, 1, 2],
    mapHint: "Watch functional class, access control, frontage roads, and interchange spacing."
  }
}

export function strategyStep(strategyId, currentStep) {
  const strategy = explorationStrategies[strategyId] ?? explorationStrategies.scenic
  return strategy.stepPattern[currentStep % strategy.stepPattern.length] ?? 1
}
