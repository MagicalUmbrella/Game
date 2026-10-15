/* Bot chơi game cho tests/playtest.py. Nạp vào trang bằng add_init_script, dùng hook window.__dv
   (chỉ có trong bản build --mode test, xem cuối src/main.js).

   Hai loại bot:
   - Bot "phím" (floodBot, climaxBot): bấm phím thật (gửi KeyboardEvent vào game) theo đường BFS, chạy
     từng nhịp __dv.step(dt). Đi qua đúng xử lý phím, va chạm, luật minigame, chỉ bỏ phần vẽ, nên chạy
     nhanh hơn thời gian thật rất nhiều. Dùng để đo độ khó.
   - Bot "dịch chuyển" (floodTeleport, climaxTeleport): đặt nhân vật ngay cạnh mục tiêu rồi gọi tương
     tác của minigame. Nhanh, dùng trong lượt chơi ngẫu nhiên để minigame ra kết quả bằng luật thật. */
(() => {
  const DT = 1 / 60;
  const D = () => window.__dv;
  const ev = (k, down) => window.dispatchEvent(new KeyboardEvent(down ? 'keydown' : 'keyup', {key: k}));
  const DIRKEY = {up: 'w', down: 's', left: 'a', right: 'd'};
  const dirOf = (dx, dy) => Math.abs(dx) > Math.abs(dy) ? (dx > 0 ? 'right' : 'left') : (dy > 0 ? 'down' : 'up');

  // Tay nghề: run = giữ Shift chạy; hesitate = giây chần chừ sau mỗi lần bấm E; react = giây phản xạ khi giặc áp sát.
  const SKILL = {
    'giỏi': {run: true, hesitate: 0, react: 0},
    'khá': {run: false, hesitate: 0.4, react: 0.3},
    'kém': {run: false, hesitate: 1.2, react: 0.8},
  };

  function makeWalker(skill) {
    const held = new Set();
    let path = null, goalKey = '', repath = 0, last = null, still = 0;
    const press = k => { if (!held.has(k)) { held.add(k); ev(k, true); } };
    const release = k => { if (held.has(k)) { held.delete(k); ev(k, false); } };
    const stop = () => ['w', 'a', 's', 'd'].forEach(release);
    const only = k => { ['w', 'a', 's', 'd'].forEach(x => x !== k && release(x)); press(k); };

    // Ô đi được, tới được, gần điểm đích nhất (tâm ô cách đích không quá r).
    function plan(gx, gy, r) {
      const d = D(), S = d.S, sx = Math.floor(S.x), sy = Math.floor(S.y);
      const prev = d.bfs(sx, sy), W = d.W, H = d.H, c = [];
      for (let y = Math.floor(gy - r - 1); y <= gy + r + 1; y++)
        for (let x = Math.floor(gx - r - 1); x <= gx + r + 1; x++) {
          const dist = Math.hypot(x + .5 - gx, y + .5 - gy);
          if (dist <= r && x >= 0 && y >= 0 && x < W && y < H && (prev[y * W + x] !== -2)) c.push([dist, x, y]);
        }
      if (!c.length) return null;
      c.sort((a, b) => a[0] - b[0]);
      const [, tx, ty] = c[0], out = [];
      for (let i = ty * W + tx; i !== -1; i = prev[i]) out.push(i);
      return out.reverse().map(i => [i % W + .5, ((i / W) | 0) + .5]);
    }

    // Đi một nhịp về phía (gx, gy). Trả true khi đã đứng trong bán kính r.
    function toward(gx, gy, r) {
      const S = D().S;
      if (Math.hypot(gx - S.x, gy - S.y) < r) { stop(); return true; }
      skill.run ? press('shift') : release('shift');
      const key = `${gx.toFixed(1)},${gy.toFixed(1)}`;
      if (last && Math.hypot(S.x - last[0], S.y - last[1]) < 0.002) still += DT; else still = 0;
      last = [S.x, S.y];
      if (!path || key !== goalKey || (repath -= DT) <= 0 || still > 0.25) {
        path = plan(gx, gy, Math.max(0.6, r - 0.3)); goalKey = key; repath = 0.5; still = 0;
        if (!path) { stop(); return false; }
      }
      while (path.length > 1 && Math.abs(path[0][0] - S.x) < 0.15 && Math.abs(path[0][1] - S.y) < 0.15) path.shift();
      const [cx, cy] = path[0];
      const dx = cx - S.x, dy = cy - S.y;
      if (Math.abs(dx) < 0.15 && Math.abs(dy) < 0.15) { // tới ô cuối mà chưa đủ gần: nhích thẳng về đích
        const ex = gx - S.x, ey = gy - S.y;
        only(DIRKEY[dirOf(ex, ey)]);
      } else if (Math.abs(dx) >= 0.15) only(dx > 0 ? 'd' : 'a');
      else only(dy > 0 ? 's' : 'w');
      return false;
    }

    return {
      toward, stop, press, release, only,
      tap: k => { ev(k, true); ev(k, false); },
      releaseAll: () => [...held].forEach(release),
    };
  }

  /* ---------- Lụt 1270 ---------- */
  function floodBot(skillName, maxT = 400) {
    const d = D(), skill = SKILL[skillName], w = makeWalker(skill);
    let t = 0, wait = 0, bags = 0, level = 0, M;
    while ((M = d.MG) && M.type === 'flood' && t < maxT) {
      level = M.level;
      if (wait > 0) { wait -= DT; w.stop(); }
      else {
        const S = d.S;
        let g = M.pile;
        if (M.carry) {
          let best = 1e9;
          for (const b of M.br) if (b.got < 2) { const dd = Math.hypot(b.x - S.x, b.y - S.y); if (dd < best) { best = dd; g = b; } }
        }
        if (w.toward(g.x, g.y, 1.3)) {
          const before = M.carry;
          w.tap('e');
          if (M.carry !== before) { wait = skill.hesitate; if (before) bags++; }
        }
      }
      d.step(DT); t += DT;
    }
    w.releaseAll();
    return {win: d.S.flags.de === 'saved', t: +t.toFixed(1), level: +level.toFixed(2), bags};
  }

  function floodTeleport(win) {
    const d = D(), M = d.MG, S = d.S;
    const act = () => { const tg = M.findTarget(); if (tg) tg.act(); };
    for (const b of M.br)
      while (b.got < 2 && (win || Math.random() < 0.5)) {
        S.x = M.pile.x; S.y = M.pile.y; act();
        S.x = b.x; S.y = b.y; act();
      }
    for (let i = 0; i < 4000 && d.MG === M; i++) d.step(0.1);
  }

  /* ---------- Đêm tháng giêng 1285 ---------- */
  const SPAWNS = [[53.5, 21.8], [24.5, 20.4]]; // điểm giặc xuất hiện (src/climax.js, spawnEnemy)
  const zoneC = () => { const Z = D().ZONE; return [(Z.x0 + Z.x1) / 2 + .5, (Z.y0 + Z.y1) / 2 + .5]; };
  const inZone = (x, y) => { const Z = D().ZONE; return x >= Z.x0 && x <= Z.x1 + 1 && y >= Z.y0 && y <= Z.y1 + 1; };

  function climaxBot(skillName, maxT = 200) {
    const d = D(), skill = SKILL[skillName], w = makeWalker(skill);
    let t = 0, wait = 0, react = 0, hp = 0, tLeft = 0, M;
    while ((M = d.MG) && M.type === 'climax' && t < maxT) {
      if (d.modalOpen) { d.mpick(d.S.path === 'van' ? 2 : 1); continue; } // hỏi đổi mình lấy con tin: bot không đổi
      hp = M.hp; tLeft = M.t;
      const S = d.S;
      const live = M.en.filter(e => !e.dead);
      const near = live.filter(e => Math.hypot(e.x - S.x, e.y - S.y) < 1.5).sort((a, b) => Math.hypot(a.x - S.x, a.y - S.y) - Math.hypot(b.x - S.x, b.y - S.y))[0];
      const thief = live.find(e => e.cap);
      // đuốc: khi bị vây, hoặc khi giặc sắp chạm tới dân làng gần mình (đuốc kéo giặc trong vòng 11 ô)
      if (M.decoys > 0 && !M.decoy && (live.filter(e => Math.hypot(e.x - S.x, e.y - S.y) < 7).length >= 3 ||
          live.some(e => !e.cap && e.st !== 'flee' && Math.hypot(e.x - S.x, e.y - S.y) < 10 &&
            M.v.some(p => ['wait', 'follow', 'self'].includes(p.st) && Math.hypot(p.x - e.x, p.y - e.y) < 4)))) w.tap('q');
      // đường văn: đến sát tên đầu toán đang giữ con tin thì thử lừa hắn một lần (lựa chọn thứ hai trong hộp hỏi)
      if (S.path === 'van' && M.boss && !M.boss.dead && M.boss.cap && !M.boss.tricked && Math.hypot(M.boss.x - S.x, M.boss.y - S.y) < 1.5) {
        w.tap('e'); if (d.modalOpen) d.mpick(1); d.step(DT); t += DT; continue;
      }
      if (near && (react -= DT) <= 0) {
        // quay mặt về phía giặc (một nhịp bấm hướng) rồi đánh
        w.only(DIRKEY[dirOf(near.x - S.x, near.y - S.y)]);
        d.step(DT); t += DT;
        w.tap(' ');
        react = skill.react;
        continue;
      }
      if (!near) react = skill.react;
      if (wait > 0) { wait -= DT; w.stop(); }
      else if (thief) w.toward(thief.x, thief.y, 0.9);
      else {
        const following = M.v.filter(p => p.st === 'follow');
        const tasks = M.v.filter(p => p.st === 'wait').map(p => ({o: p, kind: 'v'}))
          .concat(M.carry ? [] : M.sk.filter(s => s.st === 'wait').map(s => ({o: s, kind: 's'})));
        // Ưu tiên người gặp nguy: giặc đang tới gần, hoặc ở gần chỗ giặc kéo vào làng (người chơi quen
        // bản đồ biết điều này). Điểm = khoảng cách tới mình − mức nguy hiểm.
        const hunters = live.filter(e => !e.cap && e.st !== 'flee');
        tasks.forEach(k => {
          k.d = Math.hypot(k.o.x - S.x, k.o.y - S.y);
          const de = Math.min(99, ...hunters.map(e => Math.hypot(e.x - k.o.x, e.y - k.o.y)));
          const ds = Math.min(...SPAWNS.map(([x, y]) => Math.hypot(x - k.o.x, y - k.o.y)));
          k.danger = Math.max(0, 14 - de) * 1.5 + Math.max(0, 24 - ds) * 2;
          k.score = k.d - (k.kind === 'v' ? 1 : 0.5) * k.danger;
        });
        tasks.sort((a, b) => a.score - b.score);
        const next = tasks[0];
        const [zx, zy] = zoneC();
        // Có người theo hoặc đang vác thóc: đưa vào rừng, trừ khi còn người cần dẫn ở gần (gom một lượt).
        const gather = next && next.kind === 'v' && (next.d < 9 || next.danger > 6);
        if ((M.carry || following.length) && !gather && (!next || next.d > 4 || (M.carry && next.kind === 's'))) {
          if (w.toward(zx, zy, 2.5)) w.toward(zx, zy, 0.5);
        } else if (next) {
          if (w.toward(next.o.x, next.o.y, 1.1)) { w.tap('e'); wait = skill.hesitate; }
        } else w.toward(zx, zy, 0.5); // xong việc: vào rừng
      }
      d.step(DT); t += DT;
    }
    w.releaseAll();
    const r = d.S.res || {};
    return {reason: r.reason, saved: (r.saved || []).length, total: (r.saved || []).length + (r.left || []).length + (r.lost || []).length,
      lost: (r.lost || []).length, thoc: r.thoc, thocT: r.thocT, kills: r.kills, hp, tLeft: +tLeft.toFixed(0), boss: r.boss};
  }

  // full: cứu hết; không thì mỗi người, mỗi bao thóc bị bỏ lại với xác suất skip.
  function climaxTeleport(full, skip = 0.3) {
    const d = D(), M = d.MG, S = d.S, [zx, zy] = zoneC();
    const act = () => { const tg = M.findTarget(); if (tg) tg.act(); };
    const toZone = () => { S.x = zx; S.y = zy; };
    for (const p of M.v) {
      if (d.MG !== M) return;
      if (p.st !== 'wait' || (!full && Math.random() < skip)) continue;
      S.x = p.x; S.y = p.y; act(); toZone();
      for (let i = 0; i < 900 && d.MG === M && (p.st === 'follow' || p.st === 'self'); i++) d.step(1 / 30);
    }
    for (const s of M.sk) {
      if (d.MG !== M) return;
      if (s.st !== 'wait' || (!full && Math.random() < skip)) continue;
      S.x = s.x; S.y = s.y; act(); toZone(); d.step(1 / 30);
    }
    // hồi 3: cu Tí, con tin của tên đầu toán. Cứu đủ thì đánh hạ hắn (bấm Space như người chơi), rồi dẫn con tin vào rừng.
    for (let k = 0; k < 4000 && d.MG === M; k++) {
      while (d.modalOpen) d.mpick(1);
      const b = M.boss, tiw = M.v.find(p => p.st === 'wait');
      if (full && b && !b.dead && b.cap) { M.hp = M.maxhp; S.x = b.x + .7; S.y = b.y; M.cd = 0; M.key(' '); d.step(0.05); continue; }
      if (full && tiw) { S.x = tiw.x; S.y = tiw.y; act(); toZone(); for (let i = 0; i < 900 && d.MG === M && (tiw.st === 'follow' || tiw.st === 'self'); i++) d.step(1 / 30); continue; }
      if (!M.boss && M.act < 3) { toZone(); d.step(0.1); continue; }
      break;
    }
    toZone();
    for (let i = 0; i < 4000 && d.MG === M; i++) d.step(0.1);
  }

  /* ---------- Việc hằng ngày (src/minigames/daily.js) ----------
     level: 'giỏi' (trọn vẹn), 'khá' (đạt), 'kém' (hỏng), 'qua' (bấm Làm qua loa). Bấm phím thật qua game,
     chỉ chỉnh đồng hồ, vị trí trong minigame cho đúng lúc. Gọi __dv.dailyFlush() sau để kết thúc ngay. */
  function dailyAuto(level) {
    const d = D(), M = d.MG; if (!M || M.type !== 'daily') return;
    const tap = k => { ev(k, true); ev(k, false); };
    if (level === 'qua') { document.getElementById('mopt0').click(); return; }
    const KEY = {up: 'w', down: 's', left: 'a', right: 'd'};
    if (M.kind === 'viet') {
      M.phase = 'input'; M.t = 0;
      const good = level === 'giỏi' ? M.seq.length : level === 'khá' ? Math.ceil(M.seq.length * .6) : 0;
      for (let i = 0; i < M.seq.length && !M.over; i++) {
        const want = M.seq[i];
        tap(i < good ? KEY[want] : KEY[['up', 'down', 'left', 'right'].find(x => x !== want)]);
      }
    } else if (M.kind === 'vo') {
      for (let r = 0; r < 3 && !M.over; r++) { M.pos = level === 'giỏi' || (level === 'khá' && r < 2) ? M.zc : M.zc + M.zw; tap(' '); }
    } else if (M.kind === 'dong') {
      M.notes.forEach((n, i) => { if (level === 'giỏi' || (level === 'khá' && i % 3 !== 2)) { M.t = n.t; tap(n.k); } });
      M.t = M.end + 1; M.tick(0);
    } else if (M.kind === 'ca') {
      if (level === 'kém') { M.t = 0.3; tap(' '); } else { M.t = M.bite + .1; tap(' '); }
    }
  }

  window.__bots = {SKILL, makeWalker, floodBot, floodTeleport, climaxBot, climaxTeleport, dailyAuto, DT};
})();
