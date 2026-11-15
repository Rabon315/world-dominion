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

## War, settings and saving (2026-11-14)
- War system (`js/war.js`): attacks are only allowed against NEIGHBOURING countries (shared border via a region-adjacency graph). Allies, far countries, ceasefire partners and wars already running are blocked with a clear reason. Declare war, battle, ceasefire, surrender, territory capture, AI attacks on the player and AI-vs-AI border wars. Flip `WAR_NEIGHBORS_ONLY` in war.js to change the rule.
- Unclaimed regions are handed to nearby AI states when a campaign starts, so every border has a real neighbour.
- New settings panel (Graphics / Sound / Game / Saves / About): 4 quality levels (render resolution + fps cap + effects), automatic quality downgrade when the device lags, 5 save slots with load confirmation.
- Saving: writes are verified by reading back, the previous autosave is kept as a backup, autosave runs every 3 game months, after important actions, and when the app is closed or sent to background (also Capacitor pause event). Test: `npm run test:war`.

## Multiplayer backend Phase 1 merged (2026-11-14)
- Added `server/` (Express, Socket.IO, PostgreSQL, JWT auth, worlds, invite codes) and `render.yaml` from the multiplayer package onto the current client (intro + Command Center + war + new settings/saves). The client does not call the server yet; gameplay stays offline and client-side.
- The multiplayer package's client was the older dashboard UI (`dashboard.js`) without the intro/Command Center, so the newer client was kept.
- Server files pass `node --check`; the server was not started here (no database / npm install available).


## Performance and settings language pass
- Intro canvas now stays idle on the static tap gate, then starts only after user interaction.
- Intro animation is frame-capped (24 FPS on touch devices during the cinematic, lower while idle/menu; 30 FPS on desktop intro), with capped DPR and fewer particles/arcs.
- Replaced repeated grain tiling with a cached pattern and removed several perpetual high-cost glow/pulse animations.
- Added persistent Persian/English language selection and translated both settings entry points, including graphics, audio, gameplay, saves, and about tabs.
- Validation: JavaScript syntax checks passed; `npm test` passed (logic and 194-country tests). Browser/Playwright tests were not run because Playwright is not installed in this environment.
