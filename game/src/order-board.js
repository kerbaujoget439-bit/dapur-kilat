// The order board: spawning tickets, ticking their patience down, matching a
// finished plate against them, and paying out when a dish is served.
import { pickDish, dishComponents, serveReward } from './recipes.js';
import { MAX_ORDERS, addFloat, addParticles } from './game-state.js';

function spawnInterval(elapsedSeconds) {
  return Math.max(7, 13 - elapsedSeconds * 0.05);
}

function patienceFor(elapsedSeconds) {
  return Math.max(30, 48 - elapsedSeconds * 0.08);
}

/** Add one new order ticket to the board. */
export function spawnOrder(state) {
  const dish = pickDish(state.rng, state.time);
  const patience = patienceFor(state.time);
  state.orders.push({
    id: state.nextOrderId,
    dish,
    patience,
    patienceMax: patience,
    bornAt: state.time,
  });
  state.nextOrderId += 1;
}

/** Tick the spawn clock and every ticket's patience; fail tickets that run out. */
export function updateOrders(state, dt) {
  state.spawnIn -= dt;
  if (state.spawnIn <= 0 && state.orders.length < MAX_ORDERS) {
    spawnOrder(state);
    state.spawnIn = spawnInterval(state.time);
  }
  for (let i = state.orders.length - 1; i >= 0; i -= 1) {
    const order = state.orders[i];
    order.patience -= dt;
    if (order.patience <= 0) {
      state.orders.splice(i, 1);
      state.failed += 1;
      state.hearts -= 1;
      state.streak = 0;
      addFloat(state, 480, 90, 'PESANAN GAGAL!', '#ff6b5e');
      addParticles(state, 480, 70, '#ff6b5e', 16, 120, true);
    }
  }
}

/** The ticket with the least patience left — the one to cook for first. */
export function mostUrgentOrder(orders) {
  let best = null;
  for (const order of orders) {
    if (best === null || order.patience < best.patience) best = order;
  }
  return best;
}

/** True when the plate holds exactly the dish's components, no more and no fewer. */
export function plateMatchesDish(plateContents, dish) {
  const wanted = dishComponents(dish);
  if (plateContents.length !== wanted.length) return false;
  const have = plateContents.slice().sort().join('|');
  return have === wanted.slice().sort().join('|');
}

/** Serve the plate: pay the cook, clear the ticket, celebrate. Returns the order or null. */
export function servePlate(state) {
  if (!state.carried || state.carried.type !== 'plate') return null;
  const contents = state.carried.contents;
  for (let i = 0; i < state.orders.length; i += 1) {
    const order = state.orders[i];
    if (!plateMatchesDish(contents, order.dish)) continue;
    const fraction = Math.max(0, order.patience / order.patienceMax);
    const reward = serveReward(order.dish, fraction);
    state.streak += 1;
    const streakBonus = Math.min(state.streak - 1, 5) * 2;
    state.coins += reward + streakBonus;
    state.served += 1;
    state.orders.splice(i, 1);
    state.carried = null;
    addFloat(state, 842, 470, `+${reward + streakBonus} KOIN`, '#ffd94a');
    if (state.streak >= 2) addFloat(state, 842, 440, `RENTETAN x${state.streak}!`, '#ff9d3b');
    addParticles(state, 842, 480, '#ffd94a', 22, 160, true);
    return order;
  }
  return null;
}
