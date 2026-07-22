const pet = document.getElementById("pet");
const bubble = document.getElementById("bubble");
const animations = globalThis.AXUAN_ANIMATIONS;

let animationToken = 0;
let animationTimer = null;
let dragging = false;
let dragDirection = null;
let pointerStart = null;
let previousPointer = null;
let randomActionTimer = null;
let reminderVisible = false;

function showFrame(state, frameIndex) {
  const animation = animations[state];
  pet.style.backgroundPosition = `${-frameIndex * 192}px ${-animation.row * 208}px`;
}

function playState(state, loops = 1, onComplete = playIdle) {
  const animation = animations[state];
  const token = ++animationToken;
  clearTimeout(animationTimer);
  let frameIndex = 0;
  let completedLoops = 0;

  function advance() {
    if (token !== animationToken) return;
    showFrame(state, frameIndex);
    const delay = animation.durations[frameIndex];
    animationTimer = setTimeout(() => {
      frameIndex += 1;
      if (frameIndex >= animation.durations.length) {
        frameIndex = 0;
        completedLoops += 1;
        if (loops !== Infinity && completedLoops >= loops) {
          onComplete?.();
          return;
        }
      }
      advance();
    }, delay);
  }

  advance();
}

function playIdle() {
  playState("idle", Infinity, null);
}

function randomFriendlyAction() {
  const pool = ["waving", "jumping"];
  return pool[Math.floor(Math.random() * pool.length)];
}

function scheduleRandomAction() {
  clearTimeout(randomActionTimer);
  const delay = 45_000 + Math.floor(Math.random() * 45_000);
  randomActionTimer = setTimeout(() => {
    if (!dragging && !reminderVisible) playState(randomFriendlyAction());
    scheduleRandomAction();
  }, delay);
}

function showReminder(message) {
  reminderVisible = true;
  bubble.textContent = message;
  bubble.classList.add("visible");
  playState("waiting", 8, () => {
    reminderVisible = false;
    bubble.classList.remove("visible");
    playIdle();
  });
}

pet.addEventListener("pointerdown", (event) => {
  if (event.button !== 0) return;
  pet.setPointerCapture(event.pointerId);
  dragging = false;
  dragDirection = null;
  pointerStart = { x: event.screenX, y: event.screenY };
  previousPointer = pointerStart;
});

pet.addEventListener("pointermove", (event) => {
  if (!pointerStart || !previousPointer) return;
  const totalDistance = Math.hypot(event.screenX - pointerStart.x, event.screenY - pointerStart.y);
  if (totalDistance >= 4) dragging = true;
  if (!dragging) return;

  const dx = event.screenX - previousPointer.x;
  const dy = event.screenY - previousPointer.y;
  previousPointer = { x: event.screenX, y: event.screenY };
  globalThis.axuan.moveBy(dx, dy);

  if (Math.abs(dx) >= 1) {
    const nextDirection = dx > 0 ? "running-right" : "running-left";
    if (nextDirection !== dragDirection) {
      dragDirection = nextDirection;
      playState(nextDirection, Infinity, null);
    }
  }
});

function finishPointer(event) {
  if (!pointerStart) return;
  if (pet.hasPointerCapture?.(event.pointerId)) {
    pet.releasePointerCapture(event.pointerId);
  }
  const wasDragging = dragging;
  pointerStart = null;
  previousPointer = null;
  dragging = false;
  dragDirection = null;
  if (wasDragging) playIdle();
  else playState(randomFriendlyAction());
}

pet.addEventListener("pointerup", finishPointer);
pet.addEventListener("pointercancel", finishPointer);
pet.addEventListener("keydown", (event) => {
  if (event.key === "Enter" || event.key === " ") {
    event.preventDefault();
    playState(randomFriendlyAction());
  }
});
pet.addEventListener("contextmenu", (event) => {
  event.preventDefault();
  globalThis.axuan.openMenu();
});

globalThis.axuan.onReminder(showReminder);
playIdle();
scheduleRandomAction();
