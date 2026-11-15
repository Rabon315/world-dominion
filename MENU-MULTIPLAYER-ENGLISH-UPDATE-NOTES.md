# World Dominion — Main Menu / English UI Update

## Applied
- Removed the tap-to-enter intro gate, the cinematic canvas intro, intro subtitles, and skip control. The main menu now opens immediately.
- Reworked the main-menu visual treatment with a luminous navy/gold presentation, responsive action layout, and a prominent teal Multiplayer entry.
- Added a Multiplayer screen with Public World and Private World panels and an explicit server connection status.
- Added Persian/English interface switching for the title screen, main actions, country setup, command dock, settings, common HUD labels, notifications, and a substantial set of management-screen labels.
- Added English country-name labels for 181 of the 194 selectable countries; remaining names retain their Persian source label.
- English numeric formatting now uses Western digits.

## Important multiplayer status
The Multiplayer screen is an honest UI entry point only. Public/private room actions remain disabled because this source has no live authoritative multiplayer server connection. This update does not claim online gameplay is working.

## Verification
- `node --check` passed for the changed JavaScript files.
- `npm test` passed: logic and country catalogue tests.
- Browser automation tests could not run because Playwright is not installed in this environment. A headless Chromium screenshot attempt timed out, so visual verification on an actual Android device is still required.
