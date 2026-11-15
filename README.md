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
