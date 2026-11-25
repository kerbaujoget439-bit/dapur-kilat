// The game's state and its clocks: the shift timer, the order queue, the chef, what
// is carried, what sits on the board, in the wok and on the plate. Pure state plus
// the timers that tick it forward; the stations own their own rules.
import { mulberry32 } from './seeded-random.js';

export const SHIFT_SECONDS = 150;
export const MAX_HEARTS = 3;
export const MAX_ORDERS = 3;

export function createGame(seed) {
  return {
    seed,
    rng: mulberry32(seed),
    time: 0,
    timeLeft: SHIFT_SECONDS,
    coins: 0,
    served: 0,
    failed: 0,
    streak: 0,
    hearts: MAX_HEARTS,
    orders: [],
    nextOrderId: 1,
    spawnIn: 1.5,
    chef: { x: 480, y: 400, face: 1, moving: false },
    carried: null,
    board: null,
    wok: null,
    plate: null,
    particles: [],
    floats: [],
    phase: 'title',
    won: false,
    rush: false,
    startedAt: 0,
  };
}

/** A floating "+25" style label that rises and fades above a spot. */
export function addFloat(state, x, y, text, color) {
  state.floats.push({ x, y, text, color: color || '#ffd94a', life: 1.2, maxLife: 1.2 });
}

/** A burst of small particles: chopped bits, steam, sparks or coins. */
export function addParticles(state, x, y, color, count, speed, up) {
  for (let i = 0; i < count; i += 1) {
    const angle = state.rng() * Math.PI * 2;
    const v = speed * (0.4 + state.rng() * 0.8);
    state.particles.push({
      x, y,
      vx: Math.cos(angle) * v,
      vy: Math.sin(angle) * v - (up ? speed * 0.5 : 0),
      life: 0.5 + state.rng() * 0.5,
      maxLife: 1,
      size: 2 + state.rng() * 3,
      color,
    });
  }
  if (state.particles.length > 220) state.particles.splice(0, state.particles.length - 220);
}

/** Move particles and floats forward; called every frame while playing. */
export function updateEffects(state, dt) {
  for (let i = state.particles.length - 1; i >= 0; i -= 1) {
    const p = state.particles[i];
    p.x += p.vx * dt;
    p.y += p.vy * dt;
    p.vy += 140 * dt;
    p.life -= dt;
    if (p.life <= 0) state.particles.splice(i, 1);
  }
  for (let i = state.floats.length - 1; i >= 0; i -= 1) {
    const f = state.floats[i];
    f.y -= 34 * dt;
    f.life -= dt;
    if (f.life <= 0) state.floats.splice(i, 1);
  }
}

/** The shift is in its last 30 seconds, or an order is about to fail. */
export function computeRush(state) {
  if (state.timeLeft <= 30) return true;
  for (const order of state.orders) {
    if (order.patience <= 8) return true;
  }
  return false;
}
