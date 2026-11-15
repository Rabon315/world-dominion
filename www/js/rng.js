// Seeded PRNG (mulberry32). ALL game randomness must go through R().
// State (rngS) is part of the saved game so a restored game continues identically.
let rngS=1;
function seedRng(s){rngS=(s>>>0)||1}
function R(){rngS=(rngS+0x6D2B79F5)>>>0;let t=rngS;t=Math.imul(t^(t>>>15),t|1);t^=t+Math.imul(t^(t>>>7),t|61);return((t^(t>>>14))>>>0)/4294967296}
