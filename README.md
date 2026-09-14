# Naija Kitchen

An interactive Nigerian cooking game. You go to the market, haggle for your ingredients, carry them home, and cook the dish step by step in a kitchen where every step is a small game. By the time the pot is done, you have actually learned the recipe.

Play it in a browser, no install, works on phone and desktop.

## Dishes in this build

| Dish | What it teaches |
| --- | --- |
| Egusi soup | Bleaching palm oil, frying egusi until it cakes, greens last |
| Ogbono soup | Dissolving ogbono in warm oil, low heat, lid off |
| Nigerian rice and stew | Boiling down the blend, frying the stew until the oil floats |
| Vegetable soup (efo riro style) | Squeezing the leaves dry, frying the pepper base, three minutes for the greens |

## How it plays

1. Pick a dish from the kitchen.
2. Market run with a budget. Every stall is a real ingredient with a real price, and you can haggle by stopping the marker in the green band for roughly 20 percent off. Buying the wrong thing costs you money.
3. Cook. Each recipe step is its own mini-game:
   - chop: tap while the blade is in the band
   - heat: stop the rising gauge before the oil burns
   - order: add ingredients in the order a Nigerian kitchen actually adds them
   - stir: keep the meter up until the oil floats out
   - simmer: tap the moment it is ready, early is raw and late is ruined
   - season: slide, taste, adjust
4. Finish and you get stars, money and the written lesson for that dish.

Money, stars and level persist in local storage.

## Running it

It is static. Nothing to build.

```bash
git clone https://github.com/Darkjay123/naija-kitchen.git
cd naija-kitchen
python3 -m http.server 8000
# open http://localhost:8000
```

Or just enable GitHub Pages on the repo and it runs from there.

## Project layout

```
index.html        scenes: title, home, market, kitchen, result
css/style.css     the whole look: photographic backgrounds, glass panels, steam, pot
js/data.js        ingredients and recipes, each step with its real cooking reason
js/game.js        engine: scenes, market, haggling, all six mini-games, scoring
assets/img/       photographic art: backgrounds, ingredients, dishes, and the cook's sprites
assets/video/     looping cooking clips played behind each step
```

## Adding a dish

Everything about a recipe lives in `js/data.js`. Add an entry to `RECIPES` with its `list` of ingredient ids, its `steps`, and a `lesson` array, and it appears on the home screen with no other change. New ingredients go in the `INGREDIENTS` map with an image in `assets/img/`.

## Roadmap

- Real filmed footage behind each step (drop clips into assets/video with the same filenames, no code change)
- A third walk pose and a stirring animation for the cook
- 3D cookware instead of the current styled pot
- Sound: market noise, sizzling, the knife on the board
- More dishes: jollof, afang, banga, moi moi, pepper soup, akara
- Timed service mode, customers and a restaurant to build up
- Pidgin and Yoruba, Igbo, Hausa language options

## Credits

Built by John Enechukwu with Fo (Wajo AI). Art is generated, not scraped, so the repo carries no third-party image licences.

## Licence

MIT. See LICENSE.
