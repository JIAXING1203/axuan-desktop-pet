const test = require("node:test");
const assert = require("node:assert/strict");
const animations = require("../src/animation-data");

const expectedFrames = {
  idle: 6,
  "running-right": 8,
  "running-left": 8,
  waving: 4,
  jumping: 5,
  failed: 8,
  waiting: 6,
  running: 6,
  review: 6,
};

test("animation rows and frame counts match the sprite atlas", () => {
  for (const [state, frameCount] of Object.entries(expectedFrames)) {
    assert.equal(animations[state].durations.length, frameCount, state);
    assert.ok(animations[state].row >= 0 && animations[state].row < 11, state);
    assert.ok(animations[state].durations.every((duration) => duration > 0), state);
  }
});
