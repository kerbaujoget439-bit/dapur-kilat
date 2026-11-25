// The chopping board: raw toppings go on, three chops turn them into chopped
// toppings ready for the plate. Every chop answers at once — a thunk, a burst of
// bits, and a visible cut on the board.
import { INGREDIENTS } from './recipes.js';
import { addParticles } from './game-state.js';

export const CHOPS_NEEDED = 3;

/** Put a raw choppable ingredient from the chef's hands onto the board. */
export function placeOnBoard(state) {
  const carried = state.carried;
  if (!carried || carried.type !== 'ingredient') return false;
  if (carried.prep !== 'raw') return false;
  if (!INGREDIENTS[carried.kind].choppable) return false;
  if (state.board) return false;
  state.board = { kind: carried.kind, chops: CHOPS_NEEDED, prep: 'raw' };
  state.carried = null;
  return true;
}

/** One chop on whatever sits on the board. Returns 'chopped' when it is done. */
export function chopBoard(state) {
  if (!state.board) return null;
  state.board.chops -= 1;
  const color = INGREDIENTS[state.board.kind].color;
  addParticles(state, 148, 330, color, 10, 130, true);
  addParticles(state, 148, 330, '#ffffff', 4, 90, true);
  if (state.board.chops <= 0) {
    state.board.prep = 'chopped';
    return 'chopped';
  }
  return 'chopping';
}

/** Pick the finished chopped topping — or a raw one you changed your mind about — off the board. */
export function takeFromBoard(state) {
  if (!state.board) return false;
  if (state.carried) return false;
  state.carried = { type: 'ingredient', kind: state.board.kind, prep: state.board.prep };
  state.board = null;
  return true;
}
