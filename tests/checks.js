/* Kiểm tra cơ chế cho tests/playtest.py. Nạp bằng add_init_script cùng tests/bots.js.
   Mỗi hàm trả về danh sách lỗi (mảng chuỗi rỗng là đạt) kèm vài số liệu. */
(() => {
  const D = () => window.__dv;
  const W = 96, H = 72, DT = 1 / 60;
  const ev = (k, down) => window.dispatchEvent(new KeyboardEvent(down ? 'keydown' : 'keyup', {key: k}));
  const run = (sec, dt = DT) => { for (let t = 0; t < sec; t += dt) D().step(dt); };

  // Có ô đi tới được (từ nhà) mà tâm ô cách (x, y) không quá r?
  function near(prev, x, y, r) {
    for (let ty = Math.floor(y - r - 1); ty <= y + r + 1; ty++)
      for (let tx = Math.floor(x - r - 1); tx <= x + r + 1; tx++)
        if (tx >= 0 && ty >= 0 && tx < W && ty < H && prev[ty * W + tx] !== -2 && Math.hypot(tx + .5 - x, ty + .5 - y) <= r) return true;
    return false;
  }

  /* Mọi NPC, cửa nhà, biển, chuồng trâu, đống đất và chỗ đê vỡ (1270), người và thóc cần cứu, rừng
     trú ẩn (1285), chỗ giấu trâu đều đi tới được từ nhà. Bán kính lấy nhỏ hơn bán kính bấm E một chút. */
  function reach() {
    const d = D(), S = d.S, prev = d.bfs(43, 50), errs = [];
    let n = 0;
    const need = (name, x, y, r) => { n++; if (!near(prev, x, y, r)) errs.push(`không tới được ${name} (${x.toFixed(1)}, ${y.toFixed(1)})`); };
    // NPC: thử vị trí ở nhiều năm và nhiều nhánh truyện (NPC có at() đổi chỗ theo trạng thái)
    const seen = new Set();
    for (const year of [1264, 1270, 1276, 1282, 1285]) for (const thao of ['none', 'wife', 'co']) for (const co of ['village', 'army']) {
      Object.assign(S, {year, thao, co});
      for (const npc of d.NPCS) {
        const [x, y] = npc.at ? npc.at() : [npc.x, npc.y], k = `${npc.id}@${x},${y}`;
        if (!seen.has(k)) { seen.add(k); need(`NPC ${npc.name}`, x, y, 1.2); }
      }
    }
    Object.assign(S, {year: 1264, thao: 'none', co: 'village'});
    for (const b of d.BUILDINGS) if (['home', 'cung', 'chua', 'dinh', 'truong', 'thap'].includes(b.id))
      need(`cửa ${b.name || b.id}`, b.x + Math.floor(b.w / 2) + .5, b.y + b.h + .3, 1.0);
    for (const s of d.SIGNS) need(`biển ${s.name}`, s.x + .5, s.y + 1.2, 1.2);
    need('chuồng trâu', d.PEN.x, d.PEN.y, 1.2);
    // lụt 1270
    S.year = 1270; S.season = 2; d.startFlood();
    need('đống bao đất', d.MG.pile.x, d.MG.pile.y, 1.4);
    d.MG.br.forEach((b, i) => need(`chỗ đê vỡ ${i + 1}`, b.x, b.y, 1.4));
    d.setMG(null); document.body.classList.remove('mg');
    // đêm 1285, đủ mọi người (cha còn sống, có vợ con, giữ thóc)
    Object.assign(S, {year: 1285, season: 0, cha: true, thao: 'wife', child: true});
    S.ev.thao = 1; S.flags.duyet = 'giu';
    d.startClimax();
    for (const p of d.MG.v) need(`(1285) ${p.name}`, p.x, p.y, 1.1);
    d.MG.sk.forEach((s, i) => need(`(1285) bao thóc ${i + 1}`, s.x, s.y, 1.1));
    const Z = d.ZONE;
    need('rừng trú ẩn', (Z.x0 + Z.x1) / 2 + .5, (Z.y0 + Z.y1) / 2 + .5, 6);
    d.setMG(null); document.body.classList.remove('mg');
    // chỗ giấu trâu
    const spots = d.hideSpots();
    if (spots.length < 3) errs.push(`chỉ có ${spots.length} chỗ giấu trâu (cần ít nhất 3)`);
    for (const [x, y] of spots) if (prev[y * W + x] === -2) errs.push(`chỗ giấu trâu (${x}, ${y}) không tới được`);
    return {errs, n: n + spots.length};
  }

  // Tìm chỗ trống rộng quanh nhà để thử đi lại.
  function openSpot() {
    const d = D();
    for (let r = 0; r < 20; r++) for (let y = 50 - r; y <= 50 + r; y++) for (let x = 43 - r; x <= 43 + r; x++) {
      let ok = true;
      for (let dy = -3; dy <= 3 && ok; dy++) for (let dx = -3; dx <= 3 && ok; dx++) ok = d.walkable(x + dx, y + dy) && d.canStand(x + dx + .5, y + dy + .5);
      if (ok) return [x + .5, y + .5];
    }
    return null;
  }

  /* Giữ hai phím thì chỉ đi theo phím bấm sau cùng, không bao giờ đi chéo. */
  function noDiagonal() {
    const d = D(), S = d.S, errs = [], p = openSpot();
    if (!p) return {errs: ['không tìm được chỗ trống để thử']};
    const trial = (first, second, expect) => {
      [S.x, S.y] = p;
      ev(first, true); ev(second, true);
      let x0 = S.x, y0 = S.y;
      for (let i = 0; i < 18; i++) {
        const bx = S.x, by = S.y;
        d.step(DT);
        if (Math.abs(S.x - bx) > 1e-9 && Math.abs(S.y - by) > 1e-9) { errs.push(`giữ ${first}+${second}: đi chéo`); break; }
      }
      const dx = S.x - x0, dy = S.y - y0;
      const ok = expect === 'x' ? Math.abs(dx) > .2 && Math.abs(dy) < 1e-9 : Math.abs(dy) > .2 && Math.abs(dx) < 1e-9;
      if (!ok) errs.push(`giữ ${first} rồi ${second}: mong đi theo trục ${expect}, thực tế dx=${dx.toFixed(2)} dy=${dy.toFixed(2)}`);
      ev(first, false); ev(second, false);
    };
    trial('d', 'w', 'y'); trial('w', 'd', 'x'); trial('a', 's', 'y'); trial('arrowup', 'arrowleft', 'x');
    return {errs};
  }

  /* Trâu: cha giao việc thì trâu lạc vào rừng và để lại dấu chân; chạy (Shift) lại gần thì trâu giật mình
     bỏ chạy rồi dừng ở chỗ khác; đi chậm lại gần rồi bấm E thì nắm được thừng. */
  function buffalo() {
    const d = D(), S = d.S, b = S.buffalo, errs = [];
    S.year = 1266;
    d.startQuest('trau'); d.loseBuffalo();
    if (b.st !== 'lost') errs.push(`trâu chưa lạc (st=${b.st})`);
    if (!b.tracks || !b.tracks.length) errs.push('trâu lạc mà không để lại dấu chân');
    if (!near(d.bfs(43, 50), b.x, b.y, 1.2)) errs.push(`trâu lạc tới chỗ không đi tới được (${b.x.toFixed(1)}, ${b.y.toFixed(1)})`);
    // Đi theo đường BFS từ nhà tới trâu, dừng ở điểm trên đường cách trâu khoảng r ô.
    const startOnPath = r => {
      const path = d.pathTo(43, 50, Math.floor(b.x), Math.floor(b.y));
      for (let i = path.length - 1; i >= 0; i--) {
        const x = path[i] % W + .5, y = ((path[i] / W) | 0) + .5;
        if (Math.hypot(x - b.x, y - b.y) >= r) { S.x = x; S.y = y; return true; }
      }
      return false;
    };
    const approach = (run, stopAt, maxT) => {
      const w = window.__bots.makeWalker({run, hesitate: 0, react: 0});
      for (let t = 0; t < maxT; t += DT) {
        if (w.toward(b.x, b.y, stopAt) || (run && b.st === 'run')) break;
        d.step(DT);
      }
      w.releaseAll();
    };
    if (!startOnPath(4.5)) errs.push('không có đường từ nhà tới chỗ trâu');
    else {
      approach(true, 1.0, 5);
      if (b.bolts !== 1 || b.st !== 'run') errs.push(`chạy (Shift) lại gần mà trâu không giật mình (bolts=${b.bolts}, st=${b.st})`);
      const x0 = b.x, y0 = b.y;
      for (let t = 0; t < 30 && b.st === 'run'; t += DT) d.step(DT);
      if (b.st !== 'lost') errs.push(`trâu chạy mãi không dừng (st=${b.st})`);
      else if (Math.hypot(b.x - x0, b.y - y0) < 3) errs.push('trâu giật mình nhưng không chạy đi đâu');
      if (!startOnPath(4.5)) errs.push('trâu chạy tới chỗ không có đường đi tới');
      else {
        approach(false, 1.2, 20);
        d.step(DT); ev('e', true); ev('e', false);
        if (b.bolts !== 1) errs.push(`đi chậm lại gần mà trâu vẫn giật mình (bolts=${b.bolts})`);
        if (b.st !== 'follow') errs.push(`đi chậm lại gần bấm E mà không nắm được thừng (st=${b.st}, cách ${Math.hypot(b.x - S.x, b.y - S.y).toFixed(1)} ô)`);
      }
    }
    return {errs};
  }

  /* Đêm 1285: giặc và người cùng đánh không đi xuyên cây, nhà; chỉ lội sông Tô Lịch khi chưa vét sông.
     Giặc vẫn phải tới được làng (qua cầu hoặc lội), không kẹt ở bờ bắc. Chạy 70 giây, người chơi đứng yên ở rừng. */
  function terrain(dredged) {
    const d = D(), S = d.S, errs = [];
    Object.assign(S, {year: 1285, season: 0, path: 'vo', co: 'village', cha: true});
    S.flags.tolich = dredged ? 'done' : 'skip';
    d.startClimax();
    const M = d.MG, Z = d.ZONE;
    S.x = (Z.x0 + Z.x1) / 2 + .5; S.y = (Z.y0 + Z.y1) / 2 + .5;
    let bad = 0, wade = 0, samples = 0, south = 0;
    const where = new Set();
    for (let i = 0; i < 70 * 60 && d.MG === M; i++) {
      d.step(DT);
      for (const o of M.en.concat(M.al)) {
        if (o.dead || o.down) continue;
        samples++;
        const tx = Math.floor(o.x), ty = Math.floor(o.y);
        if (d.walkable(tx, ty)) { if (M.en.includes(o) && o.y > d.tolichY(o.x) + 3) south++; continue; }
        if (M.en.includes(o) && d.tileAt(tx, ty) === d.WA && !dredged) { wade++; continue; }
        bad++; where.add(`${M.en.includes(o) ? 'giặc' : o.name} ở ${tx},${ty}`);
      }
    }
    if (bad) errs.push(`${bad}/${samples} lần có người đứng trên ô cấm: ${[...where].slice(0, 5).join('; ')}`);
    if (!south) errs.push('giặc không sang được bờ nam sông Tô Lịch (kẹt?)');
    if (dredged && wade) errs.push('đã vét sông mà giặc vẫn lội sông');
    d.setMG(null); document.body.classList.remove('mg');
    return {errs, samples, wade, south};
  }

  window.__checks = {reach, noDiagonal, buffalo, terrain};
})();
