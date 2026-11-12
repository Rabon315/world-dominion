# Development log — Android 1.2

## Rebuild focus
- Replaced the dashboard-like first screen with a cinematic title screen and separate country-creation flow.
- Removed the hard-coded Iran default; new games begin in custom-nation mode.
- Added a catalogue of 194 selectable countries and 30 flag choices.
- Added editable nation name, capital, flag, national color, government, and cultural/religious identity.
- Persisted nation identity in the existing save snapshot through the country state object.
- Replaced random-noise-only land generation with a stylized world layout based on recognizable continent silhouettes.
- Packaged offline Noto Sans Arabic and Inter Display fonts.

## Validation
- `npm test:logic`: deterministic simulation, world land/ocean ratio, custom identity/color, economy, population, research, and save validation.
- `npm test:countries`: country catalogue uniqueness and flag picker checks.

## Known scope
- The current world map is stylized and does not yet use a political-boundary dataset for exact real-world country borders.
- A selected real country currently configures national identity, while the player chooses the founding location on the generated world map.
- Multiplayer/server functionality is not included in this offline Android build.
