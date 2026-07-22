(function exposeAnimations(root, factory) {
  const animations = factory();
  if (typeof module === "object" && module.exports) {
    module.exports = animations;
  } else {
    root.AXUAN_ANIMATIONS = animations;
  }
})(typeof globalThis !== "undefined" ? globalThis : this, function createAnimations() {
  return Object.freeze({
    idle: Object.freeze({ row: 0, durations: Object.freeze([280, 110, 110, 140, 140, 320]) }),
    "running-right": Object.freeze({ row: 1, durations: Object.freeze([120, 120, 120, 120, 120, 120, 120, 220]) }),
    "running-left": Object.freeze({ row: 2, durations: Object.freeze([120, 120, 120, 120, 120, 120, 120, 220]) }),
    waving: Object.freeze({ row: 3, durations: Object.freeze([140, 140, 140, 280]) }),
    jumping: Object.freeze({ row: 4, durations: Object.freeze([140, 140, 140, 140, 280]) }),
    failed: Object.freeze({ row: 5, durations: Object.freeze([140, 140, 140, 140, 140, 140, 140, 240]) }),
    waiting: Object.freeze({ row: 6, durations: Object.freeze([150, 150, 150, 150, 150, 260]) }),
    running: Object.freeze({ row: 7, durations: Object.freeze([120, 120, 120, 120, 120, 220]) }),
    review: Object.freeze({ row: 8, durations: Object.freeze([150, 150, 150, 150, 150, 280]) }),
  });
});
