// The screenshot scenes behind ?shot=cover|orders|chopping|serve. Each one plays the
// real rules forward from a fresh world for a fixed number of steps, steered by a
// simple autopilot that always cooks for the most urgent ticket, so the frame is
// what a real game looks like and the same seed always gives the same frame.
import { dishComponents, INGREDIENTS, DISHES } from './recipes.js';
import { stationById, CHEF_SPEED, clampToFloor } from './kitchen-layout.js';
import { updateOrders, mostUrgentOrder, plateMatchesDish, spawnOrder } from './order-board.js';
import { updateWok } from './stove-and-plating.js';
import { updateEffects, computeRush } from './game-state.js';

const STEP = 1 / 60;

/** The components the most urgent order still needs on the plate. */
function missingComponents(state, order) {
  const have = new Set(state.plate ? state.plate.contents : []);
  return dishComponents(order.dish).filter((c) => !have.has(c));
}

function plateHasForeign(state, order) {
  if (!state.plate) return false;
  const want = new Set(dishComponents(order.dish));
  return state.plate.contents.some((c) => !want.has(c));
}

/** Which station the autopilot heads for next. */
export function planTarget(state) {
  const order = mostUrgentOrder(state.orders);
  if (!order) return null;
  const carried = state.carried;
  const want = dishComponents(order.dish);
  if (carried && carried.type === 'plate') {
    if (plateMatchesDish(carried.contents, order.dish)) return 'serve';
    return 'plating';
  }
  if (carried && carried.type === 'ingredient') {
    // A raw ingredient counts as the cooked or chopped thing it is destined to become.
    const destined = carried.prep === 'raw'
      ? `${carried.kind}:${INGREDIENTS[carried.kind].base ? 'cooked' : 'chopped'}`
      : `${carried.kind}:${carried.prep}`;
    if (!want.includes(destined)) return 'bin';
    if (carried.prep === 'raw') return carried.kind === order.dish.base ? 'wok' : 'board';
    return 'plating';
  }
  if (state.plate && plateMatchesDish(state.plate.contents, order.dish)) return 'plating';
  if (state.plate && plateHasForeign(state, order)) return 'plating';
  if (state.wok && state.wok.cooked && want.includes(`${state.wok.kind}:cooked`)) return 'wok';
  if (state.wok && !state.wok.cooked) return 'wok';
  if (state.board && state.board.prep === 'chopped' && want.includes(`${state.board.kind}:chopped`)) return 'board';
  if (state.board && state.board.prep === 'raw') return 'board';
  if (state.wok && state.wok.cooked) return 'wok';
  const missing = missingComponents(state, order);
  if (missing.length === 0) return 'plating';
  const [kind] = missing[0].split(':');
  return kind;
}

function tickWorld(state, dt) {
  state.time += dt;
  state.timeLeft -= dt;
  updateOrders(state, dt);
  updateWok(state, dt);
  updateEffects(state, dt);
  state.rush = computeRush(state);
  if (state.timeLeft <= 0 || state.hearts <= 0) {
    state.phase = 'over';
    state.won = state.hearts > 0;
  }
}

/** Walk the chef toward a station's approach point; interact on arrival. */
function driveChef(state, interact, stationId, dt) {
  const station = stationById(stationId);
  if (!station) return;
  const dx = station.ax - state.chef.x;
  const dy = station.ay - state.chef.y;
  const dist = Math.sqrt(dx * dx + dy * dy);
  if (dist < 26) {
    interact(state, stationId);
    return;
  }
  const step = Math.min(dist, CHEF_SPEED * dt);
  const next = clampToFloor(state.chef.x + (dx / dist) * step, state.chef.y + (dy / dist) * step);
  state.chef.x = next.x;
  state.chef.y = next.y;
  state.chef.moving = true;
  state.chef.face = dx >= 0 ? 1 : -1;
}

/** Play the real rules forward for `seconds` of game time. */
export function simulate(state, interact, seconds) {
  const steps = Math.floor(seconds / STEP);
  for (let i = 0; i < steps; i += 1) {
    if (state.phase !== 'play') break;
    const target = planTarget(state);
    if (target) driveChef(state, interact, target, STEP);
    tickWorld(state, STEP);
  }
}

function dressCover(state) {
  while (state.orders.length < 3) spawnOrder(state);
  const usedNames = new Set();
  for (const order of state.orders) {
    while (usedNames.has(order.dish.name)) {
      const pool = DISHES.filter((d) => !usedNames.has(d.name));
      order.dish = pool[Math.floor(state.rng() * pool.length)];
    }
    usedNames.add(order.dish.name);
  }
  state.orders[0].patience = 8;
  if (!state.wok) state.wok = { kind: 'rice', progress: 0.45, cooked: false, burnt: false, burntIn: 8 };
  if (!state.plate) state.plate = { contents: ['rice:cooked', 'egg:chopped'] };
  state.carried = { type: 'ingredient', kind: 'chilli', prep: 'chopped' };
  state.chef.x = 430;
  state.chef.y = 460;
  state.timeLeft = 58;
  if (state.coins < 40) state.coins = 40;
  if (state.served < 2) state.served = 2;
  state.streak = 2;
  state.rush = computeRush(state);
}

function dressServe(state) {
  const order = mostUrgentOrder(state.orders);
  if (!order) return;
  state.carried = { type: 'plate', contents: dishComponents(order.dish) };
  state.chef.x = 842;
  state.chef.y = 452;
  state.floats.push({ x: 842, y: 440, text: '+25 KOIN', color: '#ffd94a', life: 1.2, maxLife: 1.2 });
  if (state.coins < 25) state.coins = 25;
}

/**
 * Set `state` to the named scene (cover, orders, chopping or serve) and return the
 * screen to draw over it.
 */
export function stageShot(name, state, interact) {
  state.phase = 'play';
  if (name === 'orders') {
    simulate(state, interact, 16);
    return 'play';
  }
  if (name === 'chopping') {
    spawnOrder(state);
    spawnOrder(state);
    state.board = { kind: 'chilli', chops: 1, prep: 'raw' };
    state.wok = { kind: 'rice', progress: 0.6, cooked: false, burnt: false, burntIn: 8 };
    state.plate = { contents: ['rice:cooked'] };
    state.chef.x = 148;
    state.chef.y = 414;
    state.timeLeft = 110;
    state.coins = 25;
    state.served = 1;
    simulate(state, interact, 2);
    return 'play';
  }
  if (name === 'serve') {
    simulate(state, interact, 100);
    dressServe(state);
    return 'play';
  }
  simulate(state, interact, 52);
  dressCover(state);
  return 'play';
}
