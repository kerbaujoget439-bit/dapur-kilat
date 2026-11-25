// The menu of Dapur Kilat: six ingredients and eight original dishes. A dish is one
// cooked base plus two (later three) chopped toppings; every dish is a different
// combination, so orders force a different route through the kitchen each time.
export const INGREDIENTS = {
  rice: { label: 'Nasi', color: '#f7f1dc', dark: '#d9cfa8', base: true, choppable: false },
  noodles: { label: 'Mie', color: '#f2c14e', dark: '#c98f1f', base: true, choppable: false },
  egg: { label: 'Telur', color: '#fff6d8', dark: '#e8c96a', base: false, choppable: true },
  chicken: { label: 'Ayam', color: '#e8a58c', dark: '#b96a4e', base: false, choppable: true },
  chilli: { label: 'Cabai', color: '#e23b2e', dark: '#9c1f16', base: false, choppable: true },
  greens: { label: 'Sayur', color: '#58b368', dark: '#2f7a3e', base: false, choppable: true },
};

export const INGREDIENT_KINDS = ['rice', 'noodles', 'egg', 'chicken', 'chilli', 'greens'];

export const DISHES = [
  { name: 'Nasi Kilat', base: 'rice', toppings: ['egg', 'chilli'] },
  { name: 'Mie Berani', base: 'noodles', toppings: ['chilli', 'greens'] },
  { name: 'Ayam Ceria', base: 'rice', toppings: ['chicken', 'greens'] },
  { name: 'Mie Pagi', base: 'noodles', toppings: ['egg', 'greens'] },
  { name: 'Nasi Pedas', base: 'rice', toppings: ['chicken', 'chilli'] },
  { name: 'Mie Kilat', base: 'noodles', toppings: ['egg', 'chilli'] },
  { name: 'Nasi Sayur Telur', base: 'rice', toppings: ['egg', 'greens'] },
  { name: 'Nasi Komplit', base: 'rice', toppings: ['egg', 'chicken', 'chilli'] },
  { name: 'Mie Komplit', base: 'noodles', toppings: ['egg', 'chicken', 'greens'] },
  { name: 'Mie Komplit Pedas', base: 'noodles', toppings: ['chicken', 'chilli', 'greens'] },
];

/** The plate contents a dish needs, as `kind:prep` keys. */
export function dishComponents(dish) {
  const parts = [`${dish.base}:cooked`];
  for (const topping of dish.toppings) parts.push(`${topping}:chopped`);
  return parts;
}

/** A dish for a new order: the two- and three-topping dishes only join the menu later. */
export function pickDish(rng, elapsedSeconds) {
  const pool = elapsedSeconds < 60 ? DISHES.slice(0, 7) : DISHES;
  return pool[Math.floor(rng() * pool.length)];
}

/** Coins for serving a dish: base pay plus a tip for serving with patience to spare. */
export function serveReward(dish, patienceFraction) {
  const base = 10 + 5 * dish.toppings.length;
  const tip = Math.round(5 * patienceFraction);
  return base + tip;
}
