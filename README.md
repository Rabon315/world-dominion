# WORLD DOMINION — Android source

Offline-first Persian grand-strategy prototype. The current new-campaign path uses the sovereign strategy core in `www/js/world.js`.

## Visual rebuild (2026)
- Reworked the in-game shell into a dark navy / black / gold command centre inspired by the supplied WORLD DOMINION concept image.
- Added a responsive left command rail, national status panel, global news/economy/military/event cards, and a compact in-game clock/speed/audio dock.
- The title screen now uses the supplied dashboard concept art as a cinematic backdrop and welcomes the player to WORLD DOMINION.
- Added an original, synthesized ambient tone and subtle UI sound effect. Audio begins only after the player interacts, respecting browser and Android WebView autoplay restrictions.
- Existing simulation, country creation, sovereign regions, management panels, and local save system remain in place.

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
The current playable world map remains a schematic strategy map with 32 strategic regions. It is not yet a geographically accurate political map with official borders for every country. The country picker contains 194 selectable names, but the current map does not yet map all 194 countries to official borders. Android compilation and on-device visual/audio testing are still required.
