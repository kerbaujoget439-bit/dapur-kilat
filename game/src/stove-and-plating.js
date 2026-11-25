// The wok and the plating counter: bases cook in the wok over a few sizzling
// seconds, then join chopped toppings on the plate. A plate is finished only when
// it holds exactly one cooked base and the toppings its dish asks for.
import { INGREDIENTS } from './recipes.js';
import { addParticles } from './game-state.js';

export const COOK_SECONDS = 4;
export const BURN_SECONDS = 8;

/** Drop a raw base (rice or noodles) from the chef's hands into the wok. */
export function placeInWok(state) {
  const carried = state.carried;
  if (!carried || carried.type !== 'ingredient') return false;
  if (carried.prep !== 'raw') return false;
  if (!INGREDIENTS[carried.kind].base) return false;
  if (state.wok) return false;
  state.wok = { kind: carried.kind, progress: 0, cooked: false, burnt: false, burntIn: BURN_SECONDS };
  state.carried = null;
  return true;
}

/**
 * Tick the wok: steam while it cooks, a pop when the base is ready — and if a
 * cooked base sits in the wok too long it burns and must be scraped out.
 * Returns 'cooked' the moment it finishes, 'burnt' the moment it burns, else null.
 */
export function updateWok(state, dt) {
  if (!state.wok) return null;
  if (!state.wok.cooked) {
    state.wok.progress += dt / COOK_SECONDS;
    if (state.rng() < dt * 6) {
      addParticles(state, 812, 320, '#e8e8e8', 1, 40, true);
    }
    if (state.wok.progress >= 1) {
      state.wok.progress = 1;
      state.wok.cooked = true;
      addParticles(state, 812, 330, '#ffd94a', 8, 90, true);
      return 'cooked';
    }
    return null;
  }
  if (!state.wok.burnt) {
    state.wok.burntIn -= dt;
    if (state.rng() < dt * 4) {
      addParticles(state, 812, 320, '#5a5a5a', 1, 30, true);
    }
    if (state.wok.burntIn <= 0) {
      state.wok.burnt = true;
      addParticles(state, 812, 330, '#3a3a3a', 12, 80, true);
      return 'burnt';
    }
  }
  return null;
}

/** Lift the cooked base out of the wok — a burnt one stays until scraped. */
export function takeFromWok(state) {
  if (!state.wok || !state.wok.cooked || state.wok.burnt) return false;
  if (state.carried) return false;
  state.carried = { type: 'ingredient', kind: state.wok.kind, prep: 'cooked' };
  state.wok = null;
  return true;
}

/** Scrape a burnt base out of the wok so the station is usable again. */
export function scrapeWok(state) {
  if (!state.wok || !state.wok.burnt) return false;
  state.wok = null;
  addParticles(state, 812, 330, '#3a3a3a', 10, 100, true);
  return true;
}

/** Lay a cooked base or a chopped topping onto the plate on the counter. */
export function addToPlate(state) {
  const carried = state.carried;
  if (!carried || carried.type !== 'ingredient') return false;
  if (!state.plate) state.plate = { contents: [] };
  const contents = state.plate.contents;
  if (carried.prep === 'cooked') {
    if (contents.some((c) => c.endsWith(':cooked'))) return false;
    contents.push(`${carried.kind}:cooked`);
  } else if (carried.prep === 'chopped') {
    if (contents.length >= 4) return false;
    const key = `${carried.kind}:chopped`;
    if (contents.includes(key)) return false;
    contents.push(key);
  } else {
    return false;
  }
  state.carried = null;
  return true;
}

/** Pick the plate up off the counter. */
export function takePlate(state) {
  if (!state.plate || state.plate.contents.length === 0) return false;
  if (state.carried) return false;
  state.carried = { type: 'plate', contents: state.plate.contents };
  state.plate = null;
  return true;
}

/** Set a carried plate back down on the counter. */
export function putPlateDown(state) {
  if (!state.carried || state.carried.type !== 'plate') return false;
  if (state.plate) return false;
  state.plate = { contents: state.carried.contents };
  state.carried = null;
  return true;
}
