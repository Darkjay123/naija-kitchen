/* Naija Kitchen - game data
   Every recipe here follows how the dish is actually cooked in a Nigerian kitchen.
   Steps drive the mini-games in js/game.js. */

const INGREDIENTS = {
  meat:      {name:'Beef & goat meat', img:'assets/img/ing_meat.png',      price:2500, unit:'1kg'},
  stockfish: {name:'Stockfish & dried fish', img:'assets/img/ing_stockfish.png', price:1800, unit:'handful'},
  pepper:    {name:'Pepper, tomato & onion', img:'assets/img/ing_pepper.png', price:1200, unit:'basket'},
  egusi:     {name:'Ground egusi', img:'assets/img/ing_egusi.png',         price:1500, unit:'2 cups'},
  ogbono:    {name:'Ground ogbono', img:'assets/img/ing_ogbono.png',       price:1600, unit:'1 cup'},
  palmoil:   {name:'Palm oil', img:'assets/img/ing_palmoil.png',           price:1000, unit:'50cl'},
  ugu:       {name:'Ugu leaves', img:'assets/img/ing_ugu.png',             price:500,  unit:'bunch'},
  crayfish:  {name:'Ground crayfish', img:'assets/img/ing_crayfish.png',   price:800,  unit:'cup'},
  seasoning: {name:'Stock cubes, salt & spice', img:'assets/img/ing_seasoning.png', price:600, unit:'pack'},
  rice:      {name:'Long grain rice', img:'assets/img/ing_rice.png',       price:1700, unit:'2 cups'}
};

/* Step types:
   chop   - tap when the blade marker is inside the green zone
   heat   - stop the rising gauge inside the safe band (bleaching oil, frying)
   order  - add ingredients from the tray in the correct order
   stir   - keep the stirring meter up for the full duration
   simmer - let it cook, tap the moment it is ready (not early, not late)
   season - slide to the right amount, taste is scored against the target
*/

const RECIPES = [
  {
    id:'egusi',
    name:'Egusi soup',
    blurb:'Thick melon seed soup, fried in bleached palm oil with meat, fish and ugu.',
    dish:'assets/img/dish_egusi.png',
    difficulty:'Beginner',
    difficultyClass:'easy',
    budget:9000,
    reward:4500,
    list:['meat','stockfish','pepper','egusi','palmoil','ugu','crayfish','seasoning'],
    lesson:[
      'Season and boil the meat and stockfish first. That stock is the flavour of the whole pot.',
      'Bleach the palm oil lightly, until it just turns from red to clear-ish. Burnt oil ruins egusi.',
      'Fry the egusi paste in the oil until it cakes and the oil floats out. This is what kills the raw taste.',
      'Add the stock slowly. Too much at once makes watery egusi.',
      'Ugu goes in last, off the heat or under two minutes, so it stays green.'
    ],
    steps:[
      {type:'chop', title:'Cut the meat and wash the fish',
       instruction:'Tap when the knife is in the green band. Even cuts cook evenly.',
       tip:'<b>Why:</b> uniform pieces finish at the same time, so nothing is raw while the rest is falling apart.',
       hits:7, speed:1.5, zone:0.22},
      {type:'season', title:'Season the meat and put it on fire',
       instruction:'Slide to the right amount of stock cube, onion and salt, then start the boil.',
       tip:'<b>Why:</b> meat seasoned before boiling makes stock. Meat seasoned after boiling just tastes salty on the outside.',
       target:0.62, tolerance:0.14, label:'Seasoning'},
      {type:'simmer', title:'Boil the meat and stockfish',
       instruction:'Let it boil. Tap STOP the moment the meat is tender, not before, not after.',
       tip:'<b>Why:</b> you want the meat soft but still holding shape, and you want that stock reserved, never poured away.',
       seconds:9, ready:[0.58,0.84]},
      {type:'heat', title:'Bleach the palm oil',
       instruction:'Heat the oil and stop it inside the green band. Too far and it burns.',
       tip:'<b>Why:</b> bleaching removes the raw palm oil taste. Past the band it smokes bitter and the soup turns dark.',
       speed:0.85, zone:[0.5,0.72]},
      {type:'order', title:'Build the base in order',
       instruction:'Tap the ingredients in the order a Nigerian kitchen adds them.',
       tip:'<b>Why:</b> onion and pepper fry first, then the egusi paste, then stock, then the protein. Order is the recipe.',
       sequence:['pepper','egusi','crayfish','meat','stockfish']},
      {type:'stir', title:'Fry the egusi until it cakes',
       instruction:'Keep stirring. Hold the meter up until the egusi lumps and the oil floats out.',
       tip:'<b>Why:</b> unfried egusi tastes raw and chalky. You are looking for lumps and a ring of oil on top.',
       seconds:9},
      {type:'simmer', title:'Add the stock and let it thicken',
       instruction:'Pour the reserved stock and simmer. Tap when it is thick, not watery, not dry.',
       tip:'<b>Why:</b> add stock a little at a time. Egusi thickens as it sits, so stop slightly looser than you want it.',
       seconds:10, ready:[0.6,0.86]},
      {type:'chop', title:'Shred the ugu',
       instruction:'Tap in the green band to shred the leaves fine.',
       tip:'<b>Why:</b> finely shredded ugu wilts in seconds and keeps its colour.',
       hits:5, speed:1.8, zone:0.24},
      {type:'simmer', title:'Ugu in, then off the fire',
       instruction:'Stir the ugu in and tap the moment it turns bright green.',
       tip:'<b>Why:</b> ugu cooked long goes dark and loses its taste. Two minutes maximum, then off.',
       seconds:6, ready:[0.35,0.62]}
    ]
  },

  {
    id:'ogbono',
    name:'Ogbono soup',
    blurb:'The drawing soup. Dissolve ogbono in oil first or it will never draw properly.',
    dish:'assets/img/dish_ogbono.png',
    difficulty:'Tricky',
    difficultyClass:'',
    budget:9000,
    reward:5200,
    list:['meat','stockfish','pepper','ogbono','palmoil','ugu','crayfish','seasoning'],
    lesson:[
      'Ogbono is dissolved in warm palm oil off the heat, never sprinkled into boiling water.',
      'Low heat only. High heat kills the draw.',
      'Never cover the pot tight while ogbono cooks, it turns the soup bitter and kills the stretch.',
      'Stir often. Ogbono catches at the bottom of the pot fast.',
      'Vegetables go in at the very end.'
    ],
    steps:[
      {type:'season', title:'Season and boil meat and fish',
       instruction:'Set your seasoning level, then get the stock going.',
       tip:'<b>Why:</b> ogbono carries very little flavour of its own, the stock is doing all the work.',
       target:0.6, tolerance:0.14, label:'Seasoning'},
      {type:'simmer', title:'Boil until tender',
       instruction:'Tap STOP when the meat is soft and the stock is rich.',
       tip:'<b>Why:</b> keep every drop of that stock, you will need it for the draw.',
       seconds:9, ready:[0.56,0.82]},
      {type:'heat', title:'Warm the palm oil gently',
       instruction:'Stop inside the band. Warm, not bleached, not smoking.',
       tip:'<b>Why:</b> ogbono dissolves in warm oil. Hot or bleached oil seizes it and you lose the draw.',
       speed:0.75, zone:[0.34,0.54]},
      {type:'stir', title:'Dissolve the ogbono in the oil',
       instruction:'Off the heat, work the ogbono into the oil until smooth with no lumps.',
       tip:'<b>Why:</b> this single step decides whether your soup draws or turns to grit.',
       seconds:8},
      {type:'order', title:'Into the pot, in order',
       instruction:'Tap in the correct order.',
       tip:'<b>Why:</b> the dissolved ogbono meets the stock on low heat, then pepper and crayfish, then protein.',
       sequence:['ogbono','pepper','crayfish','meat','stockfish']},
      {type:'simmer', title:'Low heat, lid off',
       instruction:'Let it draw. Tap when it is glossy and stretchy.',
       tip:'<b>Why:</b> lid off and low heat. A covered pot makes ogbono bitter.',
       seconds:11, ready:[0.62,0.88]},
      {type:'chop', title:'Shred the ugu',
       instruction:'Tap in the green band.',
       tip:'<b>Why:</b> fine leaves stir in without breaking the draw.',
       hits:5, speed:1.8, zone:0.24},
      {type:'simmer', title:'Vegetables last',
       instruction:'Stir in and tap immediately it wilts.',
       tip:'<b>Why:</b> anything more than a minute and the greens go dull.',
       seconds:6, ready:[0.32,0.6]}
    ]
  },

  {
    id:'ricestew',
    name:'Nigerian rice and stew',
    blurb:'Fluffy white rice and a deep fried red stew. The stew lives or dies on how long you fry it.',
    dish:'assets/img/dish_ricestew.png',
    difficulty:'Beginner',
    difficultyClass:'easy',
    budget:8000,
    reward:4000,
    list:['rice','meat','pepper','palmoil','seasoning','crayfish'],
    lesson:[
      'Blend pepper, tomato and onion, then boil the blend down until the water is gone. Watery blend makes sour stew.',
      'Fry the paste in hot oil until it darkens and the oil separates and floats. This is the whole secret.',
      'Fry the meat separately and add it with its stock.',
      'Rice: wash until the water runs clear, then cook with just enough water, and do not stir it to death.',
      'Rest the rice covered off the heat for five minutes before serving.'
    ],
    steps:[
      {type:'chop', title:'Blend and cut',
       instruction:'Tap in the green band to blend pepper, tomato and onion.',
       tip:'<b>Why:</b> a slightly coarse blend gives the stew body. Water-thin blend gives you soup.',
       hits:6, speed:1.6, zone:0.23},
      {type:'simmer', title:'Boil down the blend',
       instruction:'Cook the blend until the water dries. Tap when it is thick paste.',
       tip:'<b>Why:</b> frying a watery blend just steams it, and that is why some stew tastes sour.',
       seconds:10, ready:[0.6,0.88]},
      {type:'heat', title:'Heat the oil',
       instruction:'Stop in the green band. Hot enough to fry, not smoking.',
       tip:'<b>Why:</b> cold oil soaks into the paste. Smoking oil burns the tomato instantly.',
       speed:0.9, zone:[0.52,0.74]},
      {type:'stir', title:'Fry the stew',
       instruction:'Keep it moving until it darkens and the oil floats to the top.',
       tip:'<b>Why:</b> that ring of oil on the surface is the sign the stew is properly fried.',
       seconds:10},
      {type:'order', title:'Finish the stew',
       instruction:'Add in order.',
       tip:'<b>Why:</b> seasoning goes in while frying, then meat with its stock, then crayfish to round it off.',
       sequence:['seasoning','meat','crayfish']},
      {type:'season', title:'Taste and adjust',
       instruction:'Slide to the right salt level.',
       tip:'<b>Why:</b> stock cubes already carry salt. Taste before you add more, you cannot remove it.',
       target:0.55, tolerance:0.13, label:'Salt'},
      {type:'chop', title:'Wash the rice',
       instruction:'Tap in the band until the water runs clear.',
       tip:'<b>Why:</b> washing off loose starch is what stops the rice clumping.',
       hits:6, speed:1.7, zone:0.24},
      {type:'simmer', title:'Cook the rice',
       instruction:'Tap when the grains are soft and the water has dried.',
       tip:'<b>Why:</b> once the water level drops below the rice, lower the heat and let steam finish it.',
       seconds:10, ready:[0.64,0.9]}
    ]
  },

  {
    id:'vegetable',
    name:'Vegetable soup (efo riro style)',
    blurb:'Leafy greens in fried pepper base and palm oil, packed with meat and fish.',
    dish:'assets/img/dish_vegetable.png',
    difficulty:'Beginner',
    difficultyClass:'easy',
    budget:8500,
    reward:4200,
    list:['meat','stockfish','pepper','palmoil','ugu','crayfish','seasoning'],
    lesson:[
      'Wash the leaves properly, shred them, and squeeze out excess water so the soup does not turn watery.',
      'Fry the blended pepper in palm oil until it loses its raw smell.',
      'Protein and stock go in before the vegetables.',
      'Greens go in last and cook for about three minutes, uncovered.',
      'Do not drown it. Vegetable soup should be thick, not swimming.'
    ],
    steps:[
      {type:'chop', title:'Wash and shred the leaves',
       instruction:'Tap in the green band, then squeeze out the water.',
       tip:'<b>Why:</b> water left in the leaves is the number one cause of watery vegetable soup.',
       hits:7, speed:1.6, zone:0.23},
      {type:'season', title:'Season and boil the protein',
       instruction:'Set the seasoning and get the stock going.',
       tip:'<b>Why:</b> the stock from the meat and dried fish is the backbone of the soup.',
       target:0.6, tolerance:0.14, label:'Seasoning'},
      {type:'heat', title:'Bleach the palm oil lightly',
       instruction:'Stop inside the band.',
       tip:'<b>Why:</b> light bleaching only. This soup wants the oil present, not destroyed.',
       speed:0.85, zone:[0.44,0.66]},
      {type:'stir', title:'Fry the pepper base',
       instruction:'Fry until the raw smell goes and the oil separates.',
       tip:'<b>Why:</b> underfried pepper base tastes sharp and raw in the finished soup.',
       seconds:9},
      {type:'order', title:'Build the pot',
       instruction:'Add in order.',
       tip:'<b>Why:</b> pepper base, then crayfish and seasoning, then protein with stock, greens strictly last.',
       sequence:['pepper','crayfish','seasoning','meat','stockfish','ugu']},
      {type:'simmer', title:'Three minutes, uncovered',
       instruction:'Tap the moment the greens are bright and just wilted.',
       tip:'<b>Why:</b> overcooked greens go grey, lose their bite and leak water into the pot.',
       seconds:7, ready:[0.34,0.62]}
    ]
  }
];

const DECOY_ITEMS = ['rice','ogbono','egusi','ugu','crayfish','palmoil'];
