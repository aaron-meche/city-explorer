# Map Explorer
A map exploring software written by a map lover, designed to empower geography, city design, and highway routing learning.

Officially started on June 15, 2026

## Interface

1. The Landing Page
Static, no scroll fixed screen. Background is a moving aerial panning image of downtown Manhattan, displaying large buildings. Control menu is a centered (vertically and horizontally) collection of buttons. VStack of elements: "Map Explorer" App Title, "Start Exploring" button that launches map, "Play Guesser" button that starts geoguesser-like game, "Preferences" button that opens settings / preferences screen

2. Map Exploring Screen
Static, no scroll fixed screen. Embedded map layer is 100% of screen height and width. Full map in standard map view, not satellite by default. Screen code layout is as follows: TopLeftContainer, TopRightContiainer, BottomLeftContainer, BottonRightContainer. These three containers are appropriately positioned and dynamically resize to accomodate the contents of the page. 
- TopLeftContainer contains a search button that expands to a larger search bar when clicked, allowing the user to search for different things: such as road names, city names, state names, country names, landmarks, etc.-
- TopRightContainer is the map view preference section, displaying buttons that allow the toggling of satellite view, road line display, text label display, etc.
- BottomLeftContainer 