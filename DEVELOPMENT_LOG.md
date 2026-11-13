# WORLD DOMINION — development log

## Sovereign strategy core (2026-11-12)
- New campaigns initialize a sovereign simulation (`WORLD`) instead of running the previous territory-expansion/combat loop.
- Added 32 strategic regions and independent country records with GDP, population, industry, science, army, treasury, stability, legitimacy, government and bilateral relations.
- Added a monthly world calendar, country economic updates, AI development choices, diplomacy and alliance formation.
- Replaced the in-game raster ownership view in the new campaign with a schematic regional strategy map. Clicking a region selects its sovereign country as the target for diplomacy/economic actions.
- Added national investment, research, governance reform, trade agreement, diplomatic talks and sanctions actions.
- The player's country management values are synchronized with the new sovereign simulation for existing management panels.
- Save snapshots now include the sovereign world state.

## Known limitations — not claiming these are finished
- The new map is a schematic strategic-region map, not a geographically accurate political map with official borders or all 194 countries represented as separate playable states.
- The country picker contains 194 names, but selecting a real-world country does not yet load its exact real-world borders, population, capital coordinates or historical starting conditions.
- AI diplomacy and economy are foundational simulations, not a deep multi-agent geopolitical model yet.
- Android APK compilation/device QA has not been performed in this environment. Source-level checks and Node logic tests are the validation performed so far.

## Cinematic intro + Command Center (2026-11-13)
- Intro: tap-to-enter gate, ~20 s cinematic (Earth reveal, connection arcs, subtitles, title hit) with procedurally synthesized music/SFX (`js/audio.js`, `js/intro.js`). No audio files.
- Command Center UI matching the concept art (`js/cc.js`, `css/cc.css`): resource bar, date/time + speed, 13-item menu, photoreal map with 32 clickable regional hotspots, country panel, 4 widgets, action bar, responsive for desktop / landscape / portrait.
- New systems: ministers with monthly effects, technology (6 tracks x 3 levels), historic multi-choice decisions with delayed consequences, living-world AI events.
- Limitation: the map is a retouched image with hotspots, not real country polygons; real borders need a GeoJSON dataset.

## Visual + Online foundation pass
- Reduced intro frame workload and capped frame rate to avoid heavy GPU/CPU spikes on mobile.
- Added bilingual UI setting (FA/EN), premium settings styles, subtitle treatment, and refined world map asset.
- Added multiplayer lobby client and integrated Phase 1 Node/Socket.IO/PostgreSQL backend with Render Blueprint.
- Remaining: server-authoritative game simulation, country reservation, shared clock, economy/trade/diplomacy/combat command handlers, load testing above 100 concurrent clients.

- Settings language can switch both directions between Persian and English; language choice persists locally.
- Private multiplayer rooms now expose invitation codes and support joining by code. Browser-authored world snapshots are rejected by the server.
