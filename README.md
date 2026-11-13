# WORLD DOMINION — Android source

Offline-first Persian grand-strategy prototype. The current new-campaign path uses the sovereign strategy core in `www/js/world.js`.

## Current gameplay
- Select/create a national identity and establish a capital in a strategic region.
- Manage GDP, treasury, population, industry, science, army, stability and legitimacy.
- Advance through a monthly world calendar.
- Interact with AI states through diplomacy, trade agreements and sanctions.
- Invest in national development, research and governance reform.

## Run checks
```bash
npm test
```

## Android build
```bash
npm install
npx cap sync android
cd android
./gradlew assembleDebug
```

The debug APK is normally written to `android/app/build/outputs/apk/debug/app-debug.apk`.

## Important scope note
The current world map is schematic and contains 32 strategic regions. It is not yet an accurate political map of every country with official borders, and the 194-name country picker does not yet load real-world country datasets. Android compilation and device testing are still required.

## Visual update and multiplayer foundation (2026-11)
- Intro animation is capped at 30 FPS (24 FPS in the menu), uses a reduced device-pixel ratio, fewer particles, and pauses when the tab is hidden.
- Subtitles have a higher-contrast glass panel.
- Settings now use a premium gold/navy treatment and include Persian/English UI language selection.
- World map artwork is upscaled and sharpened for higher-resolution rendering.
- `server/` contains the Render + PostgreSQL + Socket.IO multiplayer foundation.
- The title screen includes an online lobby for account registration/login, public/private world creation, joining worlds, and world chat.
- Important: online gameplay authority (economy, combat, diplomacy, time and country ownership) is not complete yet. These actions remain disabled server-side until the simulation is migrated. Do not describe this build as a finished competitive multiplayer release.
