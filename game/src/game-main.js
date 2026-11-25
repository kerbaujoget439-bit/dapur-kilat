// Dapur Kilat — the game loop: input, movement, the interact dispatch that ties the
// stations together, the shift clocks, and drawing. The ?shot= scenes stage a
// deterministic frame and draw it once instead of looping.
import { VIEW, CHEF_SPEED, CHEF_RADIUS, STATIONS, stationById, nearestStation, hitsCounter, clampToFloor } from './kitchen-layout.js';
import { createGame, updateEffects, computeRush } from './game-state.js';
import { updateOrders, servePlate } from './order-board.js';
import { placeOnBoard, chopBoard, takeFromBoard } from './chopping-board.js';
import { placeInWok, updateWok, takeFromWok, scrapeWok, addToPlate, takePlate, putPlateDown } from './stove-and-plating.js';
import { createInput, keyMoveVector, consumeInteract, consumeClick, consumePause, consumeStart, consumeRestart } from './input-controls.js';
import { SoundBank } from './sound-effects.js';
import { drawKitchen } from './kitchen-renderer.js';
import { drawHud, drawTitle, drawGameOver, drawPaused } from './hud-renderer.js';
import { stageShot } from './shot-stager.js';
import { hashSeed } from './seeded-random.js';

const NO_SOUND = { chop() {}, pop() {}, ding() {}, buzz() {}, tick() {}, fanfare() {}, sadTrombone() {}, streak() {}, setSizzle() {}, setMuted() {}, ensure() {} };

/** Use the station in front of the chef. Returns true when something happened. */
export function interactStation(state, stationId, sfx) {
  const sound = sfx || NO_SOUND;
  const station = stationById(stationId);
  if (!station) return false;
  let done = false;
  if (station.kind === 'ingredient') {
    if (!state.carried) {
      state.carried = { type: 'ingredient', kind: station.id, prep: 'raw' };
      done = true;
    }
  } else if (station.id === 'board') {
    if (state.board && state.board.prep === 'raw') {
      const result = chopBoard(state);
      done = result !== null;
      if (done) sound.chop();
      return done;
    }
    if (state.board && state.board.prep === 'chopped') done = takeFromBoard(state);
    else if (!state.board) done = placeOnBoard(state);
  } else if (station.id === 'wok') {
    if (state.wok && state.wok.burnt) done = scrapeWok(state);
    else if (state.wok && state.wok.cooked) done = takeFromWok(state);
    else if (state.wok) return true;
    else done = placeInWok(state);
  } else if (station.id === 'plating') {
    if (state.carried && state.carried.type === 'plate') done = putPlateDown(state);
    else if (state.carried && state.carried.type === 'ingredient') done = addToPlate(state);
    else if (!state.carried) done = takePlate(state);
  } else if (station.id === 'serve') {
    if (state.carried && state.carried.type === 'plate') {
      const order = servePlate(state);
      if (order) {
        sound.ding();
        if (state.streak >= 2) sound.streak(state.streak);
        return true;
      }
    }
  } else if (station.id === 'bin') {
    if (state.carried) {
      state.carried = null;
      done = true;
    } else if (state.plate) {
      state.plate = null;
      done = true;
    }
  }
  if (done) sound.pop();
  else sound.buzz();
  return done;
}

function moveChef(state, dx, dy) {
  const nextX = state.chef.x + dx;
  if (!hitsCounter(nextX, state.chef.y, CHEF_RADIUS)) state.chef.x = nextX;
  const nextY = state.chef.y + dy;
  if (!hitsCounter(state.chef.x, nextY, CHEF_RADIUS)) state.chef.y = nextY;
  const clamped = clampToFloor(state.chef.x, state.chef.y);
  state.chef.x = clamped.x;
  state.chef.y = clamped.y;
}

/** The station whose counter the point lands on, if any. */
function stationAtPoint(x, y) {
  for (const s of STATIONS) {
    if (x >= s.x - 6 && x <= s.x + s.w + 6 && y >= s.y - 6 && y <= s.y + s.h + 6) return s;
  }
  return null;
}

function boot() {
  const canvas = document.getElementById('game');
  const ctx = canvas.getContext('2d');
  const params = new URLSearchParams(window.location.search);
  const seed = Number(params.get('seed') || '1') || 1;
  const shot = params.get('shot');
  const sound = new SoundBank();
  let state = createGame(seed);

  function fitCanvas() {
    const scale = Math.min(window.innerWidth / VIEW.width, window.innerHeight / VIEW.height);
    canvas.style.width = `${Math.floor(VIEW.width * scale)}px`;
    canvas.style.height = `${Math.floor(VIEW.height * scale)}px`;
  }
  fitCanvas();
  window.addEventListener('resize', fitCanvas);

  function toLogical(clientX, clientY) {
    const rect = canvas.getBoundingClientRect();
    return {
      x: ((clientX - rect.left) / rect.width) * VIEW.width,
      y: ((clientY - rect.top) / rect.height) * VIEW.height,
    };
  }
  const input = createInput(canvas, toLogical);

  if (shot) {
    stageShot(shot, state, (s, id) => interactStation(s, id, NO_SOUND));
    const active = nearestStation(state.chef.x, state.chef.y);
    drawKitchen(ctx, state, active);
    drawHud(ctx, state);
    window.__shotReady = true;
    window.__dapurKilat = {
    get state() { return state; },
    interactStation,
    get seed() { return state.seed; },
    isPaused: () => paused,
  };
    return;
  }

  const nav = { x: null, y: null, stationId: null };
  let lastWholeSecond = -1;
  let paused = false;

  function draw() {
    ctx.clearRect(0, 0, VIEW.width, VIEW.height);
    const active = state.phase === 'play' ? nearestStation(state.chef.x, state.chef.y) : null;
    drawKitchen(ctx, state, active);
    drawHud(ctx, state);
    if (state.phase === 'title') drawTitle(ctx, state);
    if (state.phase === 'over') drawGameOver(ctx, state);
    if (paused && state.phase === 'play') drawPaused(ctx);
  }

  function startShift() {
    sound.ensure();
    input.interactQueued = false;
    state.phase = 'play';
  }

  function restart() {
    state = createGame(hashSeed(`dapur-kilat-${state.seed + 7}`));
    input.interactQueued = false;
    state.phase = 'play';
    lastWholeSecond = -1;
    paused = false;
  }

  function update(dt) {
    sound.setMuted(input.muted);
    if (consumePause(input) && state.phase === 'play') {
      paused = !paused;
      sound.setSizzle(false);
    }
    if (paused) return;
    if (consumeStart(input) && state.phase === 'title') {
      startShift();
    }
    if (consumeRestart(input) && state.phase === 'over') {
      restart();
    }
    const click = consumeClick(input);
    if (click) {
      sound.ensure();
      if (state.phase === 'title') {
        startShift();
      } else if (state.phase === 'play') {
        const hit = stationAtPoint(click.x, click.y);
        const target = hit || nearestStation(click.x, click.y);
        if (target && distanceTo(click, target) < 120) {
          nav.x = target.ax;
          nav.y = target.ay;
          nav.stationId = target.id;
        } else {
          nav.x = click.x;
          nav.y = click.y;
          nav.stationId = null;
        }
      } else if (state.phase === 'over') {
        restart();
      }
    }
    if (state.phase !== 'play') return;
    const keyVec = keyMoveVector(input);
    if (keyVec) {
      nav.x = null;
      nav.stationId = null;
      state.chef.face = keyVec.x !== 0 ? Math.sign(keyVec.x) : state.chef.face;
      state.chef.moving = true;
      moveChef(state, keyVec.x * CHEF_SPEED * dt, keyVec.y * CHEF_SPEED * dt);
    } else if (nav.x !== null) {
      const dx = nav.x - state.chef.x;
      const dy = nav.y - state.chef.y;
      const dist = Math.sqrt(dx * dx + dy * dy);
      if (dist < 8) {
        if (nav.stationId) interactStation(state, nav.stationId, sound);
        nav.x = null;
        nav.stationId = null;
        state.chef.moving = false;
      } else {
        state.chef.moving = true;
        state.chef.face = dx !== 0 ? Math.sign(dx) : state.chef.face;
        const step = Math.min(dist, CHEF_SPEED * dt);
        moveChef(state, (dx / dist) * step, (dy / dist) * step);
      }
    } else {
      state.chef.moving = false;
    }
    if (consumeInteract(input)) {
      sound.ensure();
      const station = nearestStation(state.chef.x, state.chef.y);
      if (station) interactStation(state, station.id, sound);
    }
    state.time += dt;
    state.timeLeft -= dt;
    updateOrders(state, dt);
    const wokEvent = updateWok(state, dt);
    if (wokEvent === 'cooked') sound.pop();
    if (wokEvent === 'burnt') sound.buzz();
    updateEffects(state, dt);
    state.rush = computeRush(state);
    sound.setSizzle(Boolean(state.wok && !state.wok.cooked));
    const whole = Math.ceil(state.timeLeft);
    if (state.timeLeft <= 10 && whole !== lastWholeSecond) {
      lastWholeSecond = whole;
      sound.tick();
    }
    if (state.timeLeft <= 0 || state.hearts <= 0) {
      state.phase = 'over';
      state.won = state.hearts > 0;
      sound.setSizzle(false);
      if (state.won) sound.fanfare();
      else sound.sadTrombone();
    }
  }

  window.__dapurKilat = {
    get state() { return state; },
    interactStation,
    get seed() { return state.seed; },
    isPaused: () => paused,
  };
  let last = performance.now();
  function frame(now) {
    requestAnimationFrame(frame);
    const dt = Math.min(0.05, (now - last) / 1000);
    last = now;
    update(dt);
    draw();
  }
  draw();
  requestAnimationFrame(frame);
}

function distanceTo(point, station) {
  const dx = station.ax - point.x;
  const dy = station.ay - point.y;
  return Math.sqrt(dx * dx + dy * dy);
}

boot();
