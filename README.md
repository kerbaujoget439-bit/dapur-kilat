[![make.fun bounty](https://make.fun/badge/best-cooking-game-20261125-0137.svg)](https://make.fun/bounty/best-cooking-game-20261125-0137)
[![rank](https://make.fun/badge/best-cooking-game-20261125-0137/kerbaujoget439-bit/dapur-kilat/rank.svg)](https://make.fun/bounty/best-cooking-game-20261125-0137)
[![reward](https://make.fun/badge/best-cooking-game-20261125-0137/kerbaujoget439-bit/dapur-kilat/reward.svg)](https://make.fun/bounty/best-cooking-game-20261125-0137)

# Dapur Kilat — Rush Hour Kitchen

An original cooking game built for the [make.fun best cooking game bounty](https://make.fun/bounty/best-cooking-game-20261125-0137). You run a tiny lightning-fast kitchen: tickets land on the order board, and every dish is a route — grab the base from the pantry, chop toppings on the board, cook the base in the wok, build the plate, and serve before patience runs out. Three failed orders end the shift.

## How to play

- **Move:** WASD / arrow keys, or click the floor (click a station to walk over and use it).
- **Use a station:** E, Space, or Enter — or click the station when you arrive.
- **Cook a dish:** take rice or noodles → cook it in the wok (4 seconds, sizzling) → chop egg, chicken, chilli or greens on the board (3 chops) → stack everything on the plating counter → carry the finished plate to the serve window.
- **Don't dawdle:** a cooked base left in the wok burns after 8 seconds — scrape it out and start over. Serving dishes in a row builds a streak that pays bonus coins; a failed order resets it.
- **Win the shift:** serve as many orders as you can in 150 seconds. Orders pay coins plus a tip for serving with patience to spare; late in the shift the menu grows three-topping dishes and tickets arrive faster with less patience.
- **P** pauses the shift. **M** mutes the kitchen. **R** restarts after a shift ends.

## Play it

Serve `game/` with any static server (`node serve.ts`, then open http://localhost:8080) — the game runs offline from its own files, no network requests, no libraries. All art is drawn in code and all sounds are synthesized with WebAudio.

## Layout

- `game/index.html` — the page that loads the game.
- `game/src/game-main.js` — the loop, movement, and the interact dispatch.
- `game/src/game-state.js` — state, the shift clock, particles and floating scores.
- `game/src/kitchen-layout.js` — the floor plan: every station's place and approach point.
- `game/src/recipes.js` — the six ingredients and ten original dishes.
- `game/src/order-board.js` — spawning tickets, patience, matching plates, payouts.
- `game/src/chopping-board.js` — the board: three chops per topping.
- `game/src/stove-and-plating.js` — the wok and the plating counter.
- `game/src/input-controls.js` — keyboard and mouse.
- `game/src/sound-effects.js` — synthesized WebAudio kitchen sounds.
- `game/src/kitchen-renderer.js` — the kitchen, the food, the chef.
- `game/src/hud-renderer.js` — the order board, timer, coins, hearts, screens.
- `game/src/shot-stager.js` — the deterministic screenshot scenes (`?shot=`).
- `game/src/seeded-random.js` — the seeded RNG behind orders and scenes.

## License

MIT — see [LICENSE](LICENSE).
