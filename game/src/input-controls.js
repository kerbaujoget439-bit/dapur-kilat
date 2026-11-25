// Keyboard and mouse input: WASD or arrows to walk, E / Space / Enter to use the
// station in front of you, click a station to walk over and use it, click the floor
// to walk there. M mutes the kitchen.
export function createInput(canvas, toLogical) {
  const input = {
    keys: new Set(),
    interactQueued: false,
    pauseQueued: false,
    startQueued: false,
    restartQueued: false,
    clickQueued: null,
    muted: false,
  };

  window.addEventListener('keydown', (event) => {
    if (event.repeat) return;
    const key = event.key.toLowerCase();
    input.keys.add(key);
    if (key === 'e' || key === ' ' || key === 'enter') {
      input.interactQueued = true;
      event.preventDefault();
    }
    if (key === 'enter') input.startQueued = true;
    if (key === 'r') input.restartQueued = true;
    if (key === 'p') input.pauseQueued = true;
    if (key === 'm') input.muted = !input.muted;
  });
  window.addEventListener('keyup', (event) => {
    input.keys.delete(event.key.toLowerCase());
  });
  window.addEventListener('blur', () => input.keys.clear());

  canvas.addEventListener('mousedown', (event) => {
    const point = toLogical(event.clientX, event.clientY);
    input.clickQueued = point;
  });

  return input;
}

/** A unit movement vector from the held keys, or null when no key is held. */
export function keyMoveVector(input) {
  let x = 0;
  let y = 0;
  if (input.keys.has('a') || input.keys.has('arrowleft')) x -= 1;
  if (input.keys.has('d') || input.keys.has('arrowright')) x += 1;
  if (input.keys.has('w') || input.keys.has('arrowup')) y -= 1;
  if (input.keys.has('s') || input.keys.has('arrowdown')) y += 1;
  if (x === 0 && y === 0) return null;
  const length = Math.sqrt(x * x + y * y);
  return { x: x / length, y: y / length };
}

/** True once when the player pressed the interact key since the last frame. */
export function consumeInteract(input) {
  if (!input.interactQueued) return false;
  input.interactQueued = false;
  return true;
}

/** True once when the player pressed the pause key since the last frame. */
export function consumePause(input) {
  if (!input.pauseQueued) return false;
  input.pauseQueued = false;
  return true;
}

/** True once when the player pressed Enter since the last frame. */
export function consumeStart(input) {
  if (!input.startQueued) return false;
  input.startQueued = false;
  return true;
}

/** True once when the player pressed R since the last frame. */
export function consumeRestart(input) {
  if (!input.restartQueued) return false;
  input.restartQueued = false;
  return true;
}

/** True once with the clicked logical point since the last frame. */
export function consumeClick(input) {
  if (!input.clickQueued) return null;
  const point = input.clickQueued;
  input.clickQueued = null;
  return point;
}
