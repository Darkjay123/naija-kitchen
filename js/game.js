/* Naija Kitchen - engine */
(function () {
  'use strict';

  const $ = (s, r) => (r || document).querySelector(s);
  const $$ = (s, r) => Array.from((r || document).querySelectorAll(s));
  const clamp = (v, a, b) => Math.max(a, Math.min(b, v));
  const naira = n => '\u20A6' + n.toLocaleString('en-NG');

  const SAVE_KEY = 'naija-kitchen-save-v1';
  const state = {
    money: 12000,
    level: 1,
    stars: 0,
    recipe: null,
    basket: [],
    stepIndex: 0,
    scores: [],
    cleanup: null
  };

  function load() {
    try {
      const raw = JSON.parse(localStorage.getItem(SAVE_KEY) || '{}');
      if (typeof raw.money === 'number') state.money = raw.money;
      if (typeof raw.stars === 'number') state.stars = raw.stars;
      if (typeof raw.level === 'number') state.level = raw.level;
    } catch (e) { /* first run */ }
  }
  function save() {
    try {
      localStorage.setItem(SAVE_KEY, JSON.stringify({
        money: state.money, stars: state.stars, level: state.level
      }));
    } catch (e) { /* storage blocked, play on */ }
  }

  /* ---------- scenes ---------- */
  function show(name) {
    if (state.cleanup) { state.cleanup(); state.cleanup = null; }
    if (name !== 'market') stopClip($('#market-video'));
    if (name !== 'kitchen') stopClip($('#cook-video'));
    $$('.scene').forEach(s => { s.hidden = s.dataset.scene !== name; });
    window.scrollTo(0, 0);
    if (name === 'home') renderHome();
    if (name === 'market') renderMarket();
    if (name === 'kitchen') renderKitchen();
  }

  let toastTimer;
  function toast(msg) {
    const t = $('#toast');
    t.textContent = msg; t.hidden = false;
    clearTimeout(toastTimer);
    toastTimer = setTimeout(() => { t.hidden = true; }, 2200);
  }

  function modal(title, html) {
    $('#modal-title').textContent = title;
    $('#modal-body').innerHTML = html;
    $('#modal').hidden = false;
  }

  /* ---------- home ---------- */
  function renderHome() {
    $('#hud-money').textContent = state.money.toLocaleString('en-NG');
    $('#hud-level').textContent = state.level;
    $('#hud-stars').textContent = state.stars;
    const grid = $('#recipe-grid');
    grid.innerHTML = '';
    RECIPES.forEach(r => {
      const card = document.createElement('div');
      card.className = 'recipe-card';
      card.innerHTML =
        '<img src="' + r.dish + '" alt="' + r.name + '" loading="lazy">' +
        '<div class="meta"><h3>' + r.name + '</h3><p>' + r.blurb + '</p>' +
        '<div class="tags"><span class="tag ' + (r.difficultyClass || '') + '">' + r.difficulty + '</span>' +
        '<span class="tag">' + r.steps.length + ' steps</span>' +
        '<span class="tag">Budget ' + naira(r.budget) + '</span></div></div>';
      card.addEventListener('click', () => startRecipe(r));
      grid.appendChild(card);
    });
  }

  function startRecipe(r) {
    if (state.money < 3000) {
      state.money = 12000;
      toast('Village people tried it. Here is fresh market money.');
    }
    state.recipe = r;
    state.basket = [];
    state.stepIndex = 0;
    state.scores = [];
    walkTo('market', 'Walking to the market');
  }

  /* ---------- market ---------- */
  function renderMarket() {
    const r = state.recipe;
    playClip($('#market-video'), 'assets/video/market.mp4');
    $('#market-title').textContent = r.name;
    $('#market-money').textContent = state.money.toLocaleString('en-NG');

    const stallIds = r.list.slice();
    DECOY_ITEMS.forEach(id => { if (stallIds.indexOf(id) === -1) stallIds.push(id); });
    stallIds.sort(() => Math.random() - 0.5);

    const stalls = $('#stalls');
    stalls.innerHTML = '';
    stallIds.forEach(id => {
      const ing = INGREDIENTS[id];
      const el = document.createElement('div');
      el.className = 'stall';
      el.dataset.id = id;
      el.innerHTML =
        '<img src="' + ing.img + '" alt="' + ing.name + '" loading="lazy">' +
        '<div class="n">' + ing.name + '</div>' +
        '<div class="p">' + naira(ing.price) + ' / ' + ing.unit + '</div>';
      el.addEventListener('click', () => haggle(id, el));
      stalls.appendChild(el);
    });
    renderList();
  }

  function renderList() {
    const r = state.recipe;
    const box = $('#market-list');
    box.innerHTML = '';
    r.list.forEach(id => {
      const got = state.basket.indexOf(id) !== -1;
      const el = document.createElement('div');
      el.className = 'need' + (got ? ' got' : '');
      el.innerHTML = (got ? '\u2713 ' : '') + INGREDIENTS[id].name +
        (got ? '' : ' <b>' + naira(INGREDIENTS[id].price) + '</b>');
      box.appendChild(el);
    });
    const done = r.list.every(id => state.basket.indexOf(id) !== -1);
    const btn = $('#btn-to-kitchen');
    btn.disabled = !done;
    btn.textContent = done ? 'Carry am go house' : 'Still buying (' +
      (r.list.length - state.basket.length) + ' left)';
  }

  /* haggling: stop the moving marker in the discount band */
  function haggle(id, el) {
    const ing = INGREDIENTS[id];
    if (state.money < ing.price) { toast('Money no reach for ' + ing.name); return; }

    const mg = document.createElement('div');
    mg.className = 'modal';
    mg.innerHTML =
      '<div class="modal-card"><h3>Price for ' + ing.name + '</h3>' +
      '<p>Asking price ' + naira(ing.price) + '. Stop the marker in the green to talk her down.</p>' +
      '<div class="bar" id="hag-bar"><div class="zone" id="hag-zone"></div><div class="needle" id="hag-needle"></div></div>' +
      '<button class="btn" id="hag-stop">Stop</button>' +
      '<button class="btn ghost" id="hag-skip">Just pay</button></div>';
    document.body.appendChild(mg);

    const zoneW = 0.18 + Math.random() * 0.08;
    const zoneX = 0.15 + Math.random() * (0.7 - zoneW);
    const zone = mg.querySelector('#hag-zone');
    zone.style.left = (zoneX * 100) + '%';
    zone.style.width = (zoneW * 100) + '%';

    const needle = mg.querySelector('#hag-needle');
    let pos = 0, dir = 1, raf, last = performance.now();
    const speed = 0.75 + Math.random() * 0.35;
    (function loop(now) {
      const dt = (now - last) / 1000; last = now;
      pos += dir * speed * dt;
      if (pos > 1) { pos = 1; dir = -1; }
      if (pos < 0) { pos = 0; dir = 1; }
      needle.style.left = (pos * 100) + '%';
      raf = requestAnimationFrame(loop);
    })(last);

    function finish(discounted) {
      cancelAnimationFrame(raf);
      mg.remove();
      const price = discounted ? Math.round(ing.price * 0.78) : ing.price;
      state.money -= price;
      state.basket.push(id);
      el.classList.add('bought');
      $('#market-money').textContent = state.money.toLocaleString('en-NG');
      renderList();
      toast(discounted
        ? 'You priced am well. ' + ing.name + ' for ' + naira(price)
        : 'Bought ' + ing.name + ' for ' + naira(price));
    }

    mg.querySelector('#hag-stop').addEventListener('click', () => {
      finish(pos >= zoneX && pos <= zoneX + zoneW);
    });
    mg.querySelector('#hag-skip').addEventListener('click', () => finish(false));
  }

  /* ---------- kitchen ---------- */
  function renderKitchen() {
    const r = state.recipe;
    $('#kitchen-recipe').textContent = r.name;
    $('#step-total').textContent = r.steps.length;
    $('#kitchen-score').textContent = '0';
    runStep();
  }

  const POT_COLOURS = ['#2b1a0d', '#5a3517', '#7d4a1c', '#8a5a1e', '#a86b22', '#b8792a'];

  function runStep() {
    const r = state.recipe;
    const step = r.steps[state.stepIndex];
    $('#step-no').textContent = state.stepIndex + 1;
    $('#step-title').textContent = step.title;
    $('#step-instruction').textContent = step.instruction;
    $('#step-tip').innerHTML = step.tip || '';
    const shade = POT_COLOURS[Math.min(POT_COLOURS.length - 1,
      Math.floor(state.stepIndex / r.steps.length * POT_COLOURS.length))];
    $('#pot-content').style.background = shade;

    playClip($('#cook-video'), CLIPS[step.type] || CLIPS.simmer);

    const mg = $('#minigame');
    mg.innerHTML = '';
    const handler = MINIGAMES[step.type];
    state.cleanup = handler(mg, step, finishStep);
  }

  function finishStep(score, note) {
    if (state.cleanup) { state.cleanup(); state.cleanup = null; }
    state.scores.push(clamp(Math.round(score), 0, 100));
    const avg = state.scores.reduce((a, b) => a + b, 0) / state.scores.length;
    $('#kitchen-score').textContent = Math.round(avg);
    if (note) toast(note);
    state.stepIndex++;
    setTimeout(() => {
      if (state.stepIndex >= state.recipe.steps.length) showResult();
      else runStep();
    }, 620);
  }

  /* ---------- mini-games ----------
     Each returns a cleanup function. Each calls done(score 0-100, note). */
  const MINIGAMES = {

    /* chop: tap while the blade marker crosses the green band */
    chop: function (root, step, done) {
      const target = step.hits || 6;
      let hits = 0, misses = 0, pos = 0, dir = 1, raf, last = performance.now();
      const zoneW = step.zone || 0.22;
      let zoneX = 0.5 - zoneW / 2;

      root.innerHTML =
        '<div class="bar"><div class="zone" id="cz"></div><div class="needle" id="cn"></div></div>' +
        '<div class="mg-row"><button class="big-tap" id="ctap">Chop</button></div>' +
        '<div class="counter">Clean cuts <b id="chits">0</b> / ' + target + ' &middot; missed <b id="cmiss">0</b></div>';
      const zone = $('#cz', root), needle = $('#cn', root);
      zone.style.width = (zoneW * 100) + '%';
      zone.style.left = (zoneX * 100) + '%';

      const speed = step.speed || 1.5;
      (function loop(now) {
        const dt = (now - last) / 1000; last = now;
        pos += dir * speed * dt;
        if (pos > 1) { pos = 1; dir = -1; }
        if (pos < 0) { pos = 0; dir = 1; }
        needle.style.left = (pos * 100) + '%';
        raf = requestAnimationFrame(loop);
      })(last);

      function tap() {
        if (pos >= zoneX && pos <= zoneX + zoneW) {
          hits++;
          $('#chits', root).textContent = hits;
          zoneX = 0.08 + Math.random() * (0.84 - zoneW);
          zone.style.left = (zoneX * 100) + '%';
          if (hits >= target) {
            const score = clamp(100 - misses * 9, 25, 100);
            done(score, misses === 0 ? 'Clean knife work.' : null);
          }
        } else {
          misses++;
          $('#cmiss', root).textContent = misses;
        }
      }
      $('#ctap', root).addEventListener('click', tap);
      const key = e => { if (e.code === 'Space') { e.preventDefault(); tap(); } };
      window.addEventListener('keydown', key);
      return () => { cancelAnimationFrame(raf); window.removeEventListener('keydown', key); };
    },

    /* heat: rising gauge, stop inside the safe band */
    heat: function (root, step, done) {
      const z = step.zone || [0.5, 0.72];
      let v = 0, raf, last = performance.now(), stopped = false;
      root.innerHTML =
        '<div class="bar"><div class="zone" id="hz"></div><div class="zone hot" id="hh"></div>' +
        '<div class="fill" id="hf"></div><div class="needle" id="hn"></div></div>' +
        '<div class="mg-row"><button class="big-tap" id="htap">Stop the heat</button></div>' +
        '<div class="counter">Let it rise, cut it inside the green.</div>';
      const zone = $('#hz', root), hot = $('#hh', root);
      zone.style.left = (z[0] * 100) + '%';
      zone.style.width = ((z[1] - z[0]) * 100) + '%';
      hot.style.left = (z[1] * 100) + '%';
      hot.style.width = ((1 - z[1]) * 100) + '%';

      const speed = step.speed || 0.85;
      (function loop(now) {
        const dt = (now - last) / 1000; last = now;
        if (!stopped) {
          v += speed * dt;
          if (v >= 1) { v = 1; stopped = true; settle(); }
          $('#hf', root).style.width = (v * 100) + '%';
          $('#hn', root).style.left = (v * 100) + '%';
        }
        raf = requestAnimationFrame(loop);
      })(last);

      function settle() {
        let score, note;
        if (v < z[0]) {
          score = clamp(100 - (z[0] - v) * 220, 20, 78);
          note = 'Under-heated. It will taste raw.';
        } else if (v <= z[1]) {
          score = 100; note = 'Perfect heat.';
        } else {
          score = clamp(100 - (v - z[1]) * 260, 10, 70);
          note = 'Too far. It burnt small.';
        }
        done(score, note);
      }
      function tap() { if (!stopped) { stopped = true; settle(); } }
      $('#htap', root).addEventListener('click', tap);
      const key = e => { if (e.code === 'Space') { e.preventDefault(); tap(); } };
      window.addEventListener('keydown', key);
      return () => { cancelAnimationFrame(raf); window.removeEventListener('keydown', key); };
    },

    /* order: tap ingredients in the correct sequence */
    order: function (root, step, done) {
      const seq = step.sequence.slice();
      let idx = 0, wrong = 0;
      const shuffled = seq.slice().sort(() => Math.random() - 0.5);
      root.innerHTML = '<div class="tray" id="tray"></div>' +
        '<div class="counter" style="margin-top:10px">Next: <b id="onext">' +
        INGREDIENTS[seq[0]].name + '</b> &middot; wrong order <b id="owrong">0</b></div>';
      const tray = $('#tray', root);
      shuffled.forEach(id => {
        const el = document.createElement('div');
        el.className = 'item';
        el.innerHTML = '<img src="' + INGREDIENTS[id].img + '" alt=""><span>' + INGREDIENTS[id].name + '</span>';
        el.addEventListener('click', () => {
          if (id === seq[idx]) {
            el.classList.add('done');
            idx++;
            if (idx >= seq.length) {
              done(clamp(100 - wrong * 14, 25, 100), wrong === 0 ? 'Correct order, chef.' : null);
            } else {
              $('#onext', root).textContent = INGREDIENTS[seq[idx]].name;
            }
          } else {
            wrong++;
            $('#owrong', root).textContent = wrong;
            el.classList.add('wrong');
            setTimeout(() => el.classList.remove('wrong'), 400);
          }
        });
        tray.appendChild(el);
      });
      return () => {};
    },

    /* stir: hold the meter up by tapping or dragging for the duration */
    stir: function (root, step, done) {
      const dur = (step.seconds || 8) * 1000;
      let energy = 0, quality = 0, samples = 0, raf, last = performance.now(), t0 = last;
      root.innerHTML =
        '<button class="big-tap" id="stap">Stir the pot</button>' +
        '<div class="meter"><i id="smeter"></i></div>' +
        '<div class="counter" style="margin-top:8px">Keep it moving &middot; <b id="stime">' +
        (step.seconds || 8) + 's</b> left</div>';
      const meter = $('#smeter', root);

      function push() { energy = clamp(energy + 0.16, 0, 1); }
      const btn = $('#stap', root);
      btn.addEventListener('click', push);
      btn.addEventListener('pointermove', e => { if (e.pressure > 0 || e.buttons) push(); });
      const key = e => { if (e.code === 'Space') { e.preventDefault(); push(); } };
      window.addEventListener('keydown', key);

      (function loop(now) {
        const dt = (now - last) / 1000; last = now;
        energy = clamp(energy - 0.55 * dt, 0, 1);
        meter.style.width = (energy * 100) + '%';
        quality += energy; samples++;
        const left = Math.max(0, (dur - (now - t0)) / 1000);
        $('#stime', root).textContent = left.toFixed(1) + 's';
        if (now - t0 >= dur) {
          const avg = samples ? quality / samples : 0;
          const score = clamp(avg * 135, 15, 100);
          done(score, avg > 0.62 ? 'The oil is floating. That is it.' : 'Stir harder next time.');
          return;
        }
        raf = requestAnimationFrame(loop);
      })(last);
      return () => { cancelAnimationFrame(raf); window.removeEventListener('keydown', key); };
    },

    /* simmer: progress rises, tap inside the ready window */
    simmer: function (root, step, done) {
      const dur = (step.seconds || 9) * 1000;
      const ready = step.ready || [0.6, 0.85];
      let raf, t0 = performance.now(), stopped = false;
      root.innerHTML =
        '<div class="bar"><div class="zone" id="mz"></div><div class="fill" id="mf"></div>' +
        '<div class="needle" id="mn"></div></div>' +
        '<div class="mg-row"><button class="big-tap" id="mtap">Stop cooking</button></div>' +
        '<div class="counter">Watch the pot. Early is raw, late is ruined.</div>';
      const zone = $('#mz', root);
      zone.style.left = (ready[0] * 100) + '%';
      zone.style.width = ((ready[1] - ready[0]) * 100) + '%';

      (function loop(now) {
        const p = clamp((now - t0) / dur, 0, 1);
        $('#mf', root).style.width = (p * 100) + '%';
        $('#mn', root).style.left = (p * 100) + '%';
        if (p >= 1 && !stopped) { stopped = true; settle(1); return; }
        raf = requestAnimationFrame(loop);
      })(t0);

      function settle(p) {
        let score, note;
        if (p < ready[0]) { score = clamp(100 - (ready[0] - p) * 190, 20, 80); note = 'Small more time was needed.'; }
        else if (p <= ready[1]) { score = 100; note = 'Timed it well.'; }
        else { score = clamp(100 - (p - ready[1]) * 260, 10, 75); note = 'It overcooked small.'; }
        done(score, note);
      }
      function tap() {
        if (stopped) return;
        stopped = true;
        cancelAnimationFrame(raf);
        settle(clamp((performance.now() - t0) / dur, 0, 1));
      }
      $('#mtap', root).addEventListener('click', tap);
      const key = e => { if (e.code === 'Space') { e.preventDefault(); tap(); } };
      window.addEventListener('keydown', key);
      return () => { cancelAnimationFrame(raf); window.removeEventListener('keydown', key); };
    },

    /* season: slider against a hidden target, taste-tested */
    season: function (root, step, done) {
      const target = step.target || 0.6, tol = step.tolerance || 0.13;
      root.innerHTML =
        '<div class="counter">' + (step.label || 'Seasoning') + ' level</div>' +
        '<input type="range" id="srange" min="0" max="100" value="20">' +
        '<div class="meter"><i id="smeter2" style="width:20%"></i></div>' +
        '<div class="mg-row"><button class="btn" id="staste">Taste it</button>' +
        '<span class="counter" id="sfeed">Taste before you commit.</span></div>';
      const range = $('#srange', root), meter = $('#smeter2', root), feed = $('#sfeed', root);
      let tasted = 0;
      range.addEventListener('input', () => { meter.style.width = range.value + '%'; });
      $('#staste', root).addEventListener('click', () => {
        const v = range.value / 100, d = v - target;
        tasted++;
        if (Math.abs(d) <= tol) {
          const score = clamp(100 - Math.abs(d) / tol * 18 - (tasted - 1) * 6, 45, 100);
          feed.textContent = 'Balanced. Lock it in.';
          done(score, 'Seasoning is on point.');
        } else {
          feed.textContent = d < 0 ? 'Bland. It needs more.' : 'Too salty. Ease off.';
        }
      });
      return () => {};
    }
  };


  /* ---------- motion layer ----------
     Each step type plays a looping cooking clip behind the sheet. */
  const CLIPS = {
    chop:'assets/video/chop.mp4',
    heat:'assets/video/boil.mp4',
    order:'assets/video/boil.mp4',
    stir:'assets/video/stir.mp4',
    simmer:'assets/video/boil.mp4',
    season:'assets/video/stir.mp4'
  };

  function playClip(el, src) {
    if (!el) return;
    if (el.dataset.src !== src) {
      el.dataset.src = src;
      el.src = src;
    }
    const go = el.play();
    if (go && go.catch) go.catch(() => { /* autoplay blocked, poster stays */ });
  }
  function stopClip(el) { if (el) { try { el.pause(); } catch (e) {} } }

  /* ---------- walk between places ---------- */
  function walkTo(dest, label) {
    const road = $('#walk-road'), meter = $('#walk-meter'), img = $('#walk-img');
    $('#walk-text').textContent = label;
    img.style.transform = dest === 'home' ? 'scaleX(-1)' : 'none';
    road.style.animationDirection = dest === 'home' ? 'reverse' : 'normal';
    $$('.scene').forEach(s => { s.hidden = s.dataset.scene !== 'walk'; });

    const dur = 2600;
    const t0 = performance.now();
    let raf, finished = false;
    function done() {
      if (finished) return;
      finished = true;
      cancelAnimationFrame(raf);
      $('#walk-skip').removeEventListener('click', done);
      show(dest);
    }
    (function loop(now) {
      const p = clamp((now - t0) / dur, 0, 1);
      meter.style.width = (p * 100) + '%';
      if (p >= 1) { done(); return; }
      raf = requestAnimationFrame(loop);
    })(t0);
    $('#walk-skip').addEventListener('click', done);
    state.cleanup = () => { finished = true; cancelAnimationFrame(raf); };
  }

  /* ---------- result ---------- */
  function showResult() {
    const r = state.recipe;
    const avg = state.scores.reduce((a, b) => a + b, 0) / state.scores.length;
    const stars = avg >= 88 ? 3 : avg >= 68 ? 2 : 1;
    const pay = Math.round(r.reward * (0.55 + stars * 0.18));

    state.money += pay;
    state.stars += stars;
    state.level = 1 + Math.floor(state.stars / 6);
    save();

    $('#result-bg').style.backgroundImage = "url('" + r.dish + "')";
    $('#result-dish').src = r.dish;
    $('#result-title').textContent = r.name;
    $('#result-stars').textContent = '\u2605'.repeat(stars) + '\u2606'.repeat(3 - stars);
    $('#result-verdict').textContent =
      (stars === 3 ? 'Chef level. Nobody go believe say na game you learn am.'
        : stars === 2 ? 'Solid pot. A couple of steps were rushed.'
          : 'It is edible, but go back and watch the timing.') +
      ' You earned ' + naira(pay) + '.';
    $('#result-lesson').innerHTML =
      '<h4>What you just learned</h4><ol>' + r.lesson.map(l => '<li>' + l + '</li>').join('') + '</ol>';
    show('result');
  }

  /* ---------- wiring ---------- */
  document.addEventListener('click', e => {
    const go = e.target.closest('[data-go]');
    if (go) show(go.dataset.go);
  });
  $('#btn-to-kitchen').addEventListener('click', () => walkTo('kitchen', 'Carrying the basket home'));
  $('#btn-retry').addEventListener('click', () => startRecipe(state.recipe));
  $('#modal-close').addEventListener('click', () => { $('#modal').hidden = true; });
  $('#btn-how').addEventListener('click', () => modal('How to play',
    '<ul>' +
    '<li>Pick a dish. Each one is a real recipe split into the steps a Nigerian kitchen actually follows.</li>' +
    '<li>Go to the market with a budget. Buy everything on the list, and haggle to stretch your money.</li>' +
    '<li>In the kitchen, every step is a small game: chopping, bleaching oil, frying, stirring, timing, seasoning.</li>' +
    '<li>Tap the button or press space. Timing is the whole skill.</li>' +
    '<li>Finish and you get stars, money, and the written lesson for the dish.</li>' +
    '</ul>'));

  load();
  show('title');
})();
