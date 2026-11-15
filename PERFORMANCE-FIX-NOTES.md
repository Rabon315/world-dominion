WORLD DOMINION — Performance patch notes

Changes in this patch:
- Intro canvas now uses a desynchronized opaque 2D context where supported.
- Intro rendering is throttled to 30 FPS; idle menu background is throttled to 18 FPS.
- Device pixel ratio is capped (1.15 on small screens, 1.35 elsewhere) to reduce fill-rate/GPU pressure.
- Star and dust counts reduced (240 -> 90 stars; 70 -> 28 dust particles).
- Repeated full-screen film-grain tile compositing removed.
- Intro letterbox bars are reduced and omitted on mobile screens.
- Intro animation pauses while the document is hidden and resumes when visible.
- Settings now include a persistent Persian/English language selector; every label and option inside the Settings panel is translated in English.
- Existing offline simulation, save format, country list, and game logic were not rewritten.

Validation:
- node --check passed for intro.js, ui.js, save.js.
- tests/logic.js passed.
- tests/countries.js passed (194 selectable countries; 30 flag choices).
- Browser tests were not run because Playwright is not installed in this environment.

Known incomplete work:
- This patch does not claim a complete English translation of every game screen.
- This patch does not connect the game client to an authoritative multiplayer server. The existing source is still offline-first.
