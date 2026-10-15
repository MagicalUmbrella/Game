/* Kiểm tra cơ chế cho tests/playtest.py. Nạp bằng add_init_script cùng tests/bots.js.
   Mỗi hàm trả về danh sách lỗi (mảng chuỗi rỗng là đạt) kèm vài số liệu. */
(() => {
  const D = () => window.__dv;
  const W = 480, H = 240, DT = 1 / 60;   // bản đồ thế giới (src/constants.js); bài world() kiểm tra lại
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
    for (const s of d.SIGNS) if (d.world.regionId(s.x, s.y) === 'anphu') need(`biển ${s.name}`, s.x + .5, s.y + 1.2, 1.2);   // biển vùng khác: bài world()
    need('chuồng trâu', d.PEN.x, d.PEN.y, 1.2);
    for (const p of d.SPOTS) need(`khám phá: ${p.name}`, p.x, p.y, 1.1);
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
        if (b.st !== 'follow') errs.push(`đi chậm lại gần bấm E mà không nắm được thừng (st=${b.st}, cách ${Math.hypot(b.x - S.x, b.y - S.y).toFixed(1)} ô, gợi ý "${document.getElementById('prompt').innerText}")`);
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

  /* Đường văn: bấm E chỉ đường thì người ấy tự đi vào rừng theo lối đi được, không cần người chơi dẫn.
     Không có giặc (tắt chỗ xuất hiện) để chỉ thử đường đi. */
  function selfWalk() {
    const d = D(), S = d.S, errs = [];
    Object.assign(S, {year: 1285, season: 0, path: 'van', cha: true, thao: 'wife', child: true});
    S.ev.thao = 1; S.flags.tolich = 'done';
    d.startClimax();
    const M = d.MG;
    M.spawnT = 1e9;
    for (const p of M.v) {
      S.x = p.x; S.y = p.y;
      const tg = M.findTarget();
      if (!tg || !/^Chỉ đường/.test(tg.label)) { errs.push(`đứng cạnh ${p.name} mà không có lựa chọn chỉ đường (${tg && tg.label})`); continue; }
      tg.act();
      if (p.st !== 'self') errs.push(`${p.name} không tự đi sau khi được chỉ đường (st=${p.st})`);
    }
    const Z = d.ZONE; S.x = Z.x0 - 6; S.y = Z.y0 - 6; // người chơi đứng xa, không dẫn ai
    const start = new Map(M.v.map(p => [p, `${Math.floor(p.x)},${Math.floor(p.y)}`]));
    let bad = 0;
    for (let i = 0; i < 60 * 60 && d.MG === M && M.v.some(p => p.st === 'self'); i++) {
      d.step(DT);
      for (const p of M.v) if (p.st === 'self' && `${Math.floor(p.x)},${Math.floor(p.y)}` !== start.get(p) && !d.walkable(Math.floor(p.x), Math.floor(p.y))) bad++;
    }
    const stuck = M.v.filter(p => p.st === 'self').map(p => `${p.name} (${p.x.toFixed(1)}, ${p.y.toFixed(1)})`);
    if (stuck.length) errs.push('sau 60 giây vẫn chưa vào tới rừng: ' + stuck.join(', '));
    if (bad) errs.push(`${bad} lần người tự đi đứng trên ô cấm (đi xuyên cây, nhà, sông)`);
    const safe = M.v.filter(p => p.st === 'safe').length;
    d.setMG(null); document.body.classList.remove('mg');
    return {errs, safe, total: M.v.length};
  }

  /* Ngã xuống khi không có ai đỡ: bạn bị bắt ('captured'), người đang đi theo bị bắt cùng; người chưa dẫn,
     người đang tự đi thì kẹt lại trong làng, không bị bắt. Có người cùng đánh còn đứng thì được kéo vào rừng ('down'). */
  function downRule() {
    const d = D(), S = d.S, errs = [];
    Object.assign(S, {year: 1285, season: 0, path: 'vo', co: 'army', cha: true, thao: 'wife', child: true});
    S.ev.thao = 1; S.flags.de = 'lost'; S.duc = 0; S.tieng = 0;
    d.startClimax();
    const M = d.MG, [a, b, c] = M.v;
    if (M.al.length) errs.push('kiểu nhân vật thử không được có đồng minh');
    a.st = 'follow'; b.st = 'self'; b.dest = [a.x, a.y]; // c vẫn 'wait'
    M.hp = 0; d.step(DT);
    const r = S.res || {};
    if (r.reason !== 'captured') errs.push(`hết máu, không ai đỡ mà không bị bắt (${r.reason})`);
    if (!S.capt || S.capt.how !== 'down') errs.push(`ngã xuống không ai đỡ mà S.capt.how là ${S.capt && S.capt.how} (mong 'down')`);
    if (!/trại giặc/.test(document.querySelector('#modal').innerText)) errs.push('bị bắt mà không có lựa chọn giải về trại giặc');
    if (a.st !== 'lost') errs.push(`người đang đi theo (${a.name}) phải bị bắt, thực tế ${a.st}`);
    if (b.st !== 'left') errs.push(`người đang tự đi (${b.name}) phải kẹt lại trong làng, thực tế ${b.st}`);
    if (c.st !== 'left') errs.push(`người chưa dẫn (${c.name}) phải kẹt lại trong làng, thực tế ${c.st}`);
    while (d.modalOpen) d.nextModal();
    // có Cò đứng cạnh: ngã xuống thì được kéo vào rừng, không bị bắt
    delete S.capt; S.res = null; S.co = 'village'; S.ended = false;
    d.startClimax(); const M2 = d.MG; M2.hp = 0; d.step(DT);
    if ((S.res || {}).reason !== 'down') errs.push(`có Cò đứng cạnh mà hết máu vẫn không ra kiểu ngã xuống (${(S.res || {}).reason})`);
    if (S.capt) errs.push('có người đỡ mà vẫn ghi bị bắt');
    while (d.modalOpen) d.nextModal();
    return {errs};
  }

  /* Ba hồi đêm 1285: hồi 1 giặc chỉ đứng ở bờ bắc; hồi 2 nhà cháy, lửa chặn lối nhưng luôn còn đường vào rừng;
     hồi 3 có tên đầu toán, cu Tí. Đưa hết mọi người vào rừng sớm thì hắn tới với cu Tí làm con tin; hạ hắn thì
     cứu được. Đổi mình lấy con tin thì bị bắt, con tin an toàn. */
  function acts() {
    const d = D(), errs = [], Z = d.ZONE, zc = [(Z.x0 + Z.x1) / 2 + .5, (Z.y0 + Z.y1) / 2 + .5];
    const fresh = () => { d.setS(Object.assign(d.newState('Thử'), {year: 1285, season: 0, path: 'vo', vo: 60, co: 'army', cha: true, thao: 'wife', child: true, quests: {trau: 'done'}}));
      d.S.ev.thao = 1; d.S.flags.tolich = 'done'; d.startClimax(); return d.MG; };
    let M = fresh(), S = d.S;
    S.x = zc[0]; S.y = zc[1];
    for (let i = 0; i < 20 * 60; i++) d.step(DT);
    if (M.act !== 1) errs.push(`giây 20 mà đã sang hồi ${M.act}`);
    const south = M.en.filter(e => e.y > d.tolichY(e.x) + 1).length;
    if (south) errs.push(`hồi 1 đã có ${south} tên giặc sang bờ nam`);
    if (!M.en.length) errs.push('hồi 1 không có giặc tụ ở bờ bắc');
    for (let i = 0; i < 60 * 60 && d.MG === M; i++) d.step(DT);
    if (M.act !== 2) errs.push(`giây 80 mà không ở hồi 2 (hồi ${M.act})`);
    if (M.burn.length < 3) errs.push(`giây 80 mới có ${M.burn.length} nhà cháy`);
    if (!M.fire.size) errs.push('nhà cháy mà không có lửa chặn lối');
    // lửa không được cắt đường vào rừng của bất kỳ ai còn ngoài làng
    const seen = new Set([`${Z.x0 + 3},${Z.y0 + 5}`]), q = [[Z.x0 + 3, Z.y0 + 5]], now = M.T - M.t;
    const fire = (x, y) => { const e = M.fire.get(y * W + x); return e != null && e > now; };
    while (q.length) { const [x, y] = q.pop(); for (const [a, b] of [[1, 0], [-1, 0], [0, 1], [0, -1]]) { const k = `${x + a},${y + b}`; if (!seen.has(k) && d.walkable(x + a, y + b) && !fire(x + a, y + b)) { seen.add(k); q.push([x + a, y + b]); } } }
    const near = (o) => { for (let dy = -1; dy <= 1; dy++) for (let dx = -1; dx <= 1; dx++) if (seen.has(`${Math.floor(o.x) + dx},${Math.floor(o.y) + dy}`)) return true; return false; };
    for (const p of M.v) if (['wait', 'follow', 'self'].includes(p.st) && !near(p)) errs.push(`lửa cắt đường vào rừng của ${p.name}`);
    d.setMG(null); document.body.classList.remove('mg');
    // đưa hết vào rừng sớm: sang hồi 3, tên đầu toán tới cùng cu Tí làm con tin
    M = fresh(); S = d.S; M.spawnT = 1e9;
    for (const p of M.v) { p.st = 'safe'; p.x = Z.x0 + 2; p.y = Z.y0 + 3; p.spot = [p.x, p.y]; }
    for (const s of M.sk) { s.st = 'safe'; }
    S.x = zc[0]; S.y = zc[1]; d.step(DT);
    if (M.act !== 2) errs.push(`mọi người đã vào rừng từ hồi 1 mà chưa sang hồi 2 (hồi ${M.act})`);
    for (let i = 0; i < 13 * 60 && d.MG === M && M.act < 3; i++) d.step(DT);
    if (M.act !== 3 || !M.boss) errs.push(`mọi người đã vào rừng mà 13 giây sau chưa sang hồi 3 (hồi ${M.act})`);
    else if (!M.boss.cap || M.boss.cap.id !== 'ti') errs.push('hồi 3 sớm: tên đầu toán không giữ cu Tí làm con tin');
    if (!d.MG) errs.push('đêm kết thúc trước khi gặp tên đầu toán');
    for (let i = 0; i < 40 * 60 && d.MG === M && M.boss && M.boss.st !== 'hold'; i++) d.step(DT);
    if (M.boss && M.boss.st !== 'hold') errs.push(`tên đầu toán không về tới sân đình (st=${M.boss.st}, ở ${M.boss.x.toFixed(1)},${M.boss.y.toFixed(1)})`);
    // đánh hạ hắn
    for (let i = 0; i < 400 && d.MG === M && M.boss && !M.boss.dead; i++) { M.hp = M.maxhp; S.x = M.boss.x + .7; S.y = M.boss.y; M.cd = 0; M.key(' '); d.step(.05); }
    const ti = M.v.find(p => p.id === 'ti');
    if (!M.boss || !M.boss.dead) errs.push('không đánh hạ được tên đầu toán');
    else if (!ti || ti.st !== 'wait') errs.push(`hạ tên đầu toán mà cu Tí chưa được thả (${ti && ti.st})`);
    if (d.MG === M) { d.setMG(null); document.body.classList.remove('mg'); }
    // đổi mình lấy con tin
    M = fresh(); S = d.S; M.spawnT = 1e9;
    const me = M.v.find(p => p.id === 'me');
    M.t = 45.01; d.step(DT);
    if (M.act !== 3) errs.push('M.t 45 mà chưa sang hồi 3');
    for (let i = 0; i < 60 * 60 && d.MG === M && !(M.boss && M.boss.cap); i++) d.step(DT);
    if (!M.boss || !M.boss.cap) errs.push('hồi 3: tên đầu toán không bắt được ai làm con tin');
    else {
      const h = M.boss.cap; S.x = M.boss.x + 1; S.y = M.boss.y;
      const tg = M.findTarget();
      if (!tg || !/^Đổi mình/.test(tg.label)) errs.push(`đứng cạnh tên đầu toán mà không có lựa chọn đổi mình (${tg && tg.label})`);
      else { tg.act(); d.mpick(0);
        const r = S.res || {};
        if (r.reason !== 'surrender') errs.push(`đổi mình mà kết thúc là ${r.reason}`);
        if (!r.saved || !r.saved.includes(h.name)) errs.push(`đổi mình mà ${h.name} không được thả vào rừng`);
        if (!S.capt || S.capt.for !== h.name) errs.push('đổi mình mà chưa ghi S.capt.for');
        // bị giải sang trại giặc (màn chơi), đứng yên cho lính lôi đi, chọn im lặng khi sứ giả đi ngang, rồi biên niên
        d.mpick(0);
        for (let i = 0; i < 20000 && (d.MG || d.modalOpen) && !/Hết chương một/.test(document.querySelector('#modal').innerText); i++) { if (d.modalOpen) d.mpick(1); else d.step(0.05); }
        const txt = document.querySelector('#modal').innerText;
        if (!/Hết chương một/.test(txt)) errs.push('sau cảnh trại giặc không tới màn hết chương');
        if (!/đổi mình lấy/.test(txt)) errs.push('biên niên thiếu dòng đổi mình');
        if (!/trại giặc/.test(txt)) errs.push('mở đầu chương hai không nhắc trại giặc');
        while (d.modalOpen) d.nextModal(); }
    }
    if (d.MG) { d.setMG(null); document.body.classList.remove('mg'); }
    return {errs};
  }

  /* Bạn đã vào rừng, chỉ còn thóc ngoài làng: giặc không được đứng dàn hàng ở bìa rừng mà phải đi lại
     lục lọi trong làng. Đo tỉ lệ lần giặc đứng sát bìa rừng và tốc độ di chuyển trung bình. */
  function noCamping() {
    const d = D(), S = d.S, errs = [];
    Object.assign(S, {year: 1285, season: 0, path: 'vo', co: 'army', cha: true});
    S.flags.tolich = 'done';
    d.startClimax();
    const M = d.MG, Z = d.ZONE;
    for (const p of M.v) { p.st = 'safe'; p.x = Z.x0 + 2; p.y = Z.y0 + 3; p.spot = [p.x, p.y]; }
    S.x = (Z.x0 + Z.x1) / 2 + .5; S.y = (Z.y0 + Z.y1) / 2 + .5;
    let near = 0, samples = 0, moved = 0;
    const last = new Map();
    for (let i = 0; i < 50 * 60 && d.MG === M; i++) {
      d.step(DT);
      if (i < 20 * 60) continue; // cho giặc kịp vào làng
      for (const e of M.en) {
        if (e.dead || e.st === 'flee') continue;
        samples++;
        const dx = Math.max(Z.x0 - e.x, 0, e.x - (Z.x1 + 1)), dy = Math.max(Z.y0 - e.y, 0, e.y - (Z.y1 + 1));
        if (Math.hypot(dx, dy) < 2) near++;
        const p = last.get(e); if (p) moved += Math.hypot(e.x - p[0], e.y - p[1]); last.set(e, [e.x, e.y]);
      }
    }
    const speed = samples ? moved / (samples * DT) : 0;
    if (!samples) errs.push('không có giặc nào để đo');
    else {
      if (near / samples > 0.1) errs.push(`giặc đứng sát bìa rừng ${(100 * near / samples).toFixed(0)}% thời gian (tối đa 10%)`);
      if (speed < 0.5) errs.push(`giặc gần như đứng yên (tốc độ TB ${speed.toFixed(2)} ô/giây)`);
    }
    d.setMG(null); document.body.classList.remove('mg');
    return {errs, near: samples ? near / samples : 0, speed};
  }

  // Bấm lựa chọn trong hội thoại đang mở theo chữ trên nút. Trả về false nếu không có hoặc bị khóa.
  function choose(text) {
    const b = [...document.querySelectorAll('#dialog .opt')].find(x => x.textContent.includes(text));
    if (!b || b.disabled) { if (D().dialogOpen) D().pick(99); return false; }
    b.click(); return true;
  }
  const closeDialog = () => { const o = [...document.querySelectorAll('#dialog .opt')]; if (D().dialogOpen && o.length) o[o.length - 1].click(); };

  /* Giấy bút, thuốc bổ mỗi mùa chỉ mua được một lần. */
  function shopLimit() {
    const d = D(), S = d.S, errs = [];
    Object.assign(S, {year: 1276, tien: 999});
    S.ev = new Proxy({}, {get: () => 1});
    const v0 = S.van;
    for (let season = 0; season < 4; season++) {
      for (let i = 0; i < 4; i++) { d.talkSach(); choose('Mua giấy bút'); closeDialog(); }
      for (let i = 0; i < 3; i++) { S.suc = 0; d.talkTong(); choose('Mua thuốc bổ'); closeDialog(); }
      if (S.suc > 2) errs.push(`mùa ${season + 1}: mua thuốc bổ nhiều lần (Sức ${S.suc})`);
      d.advance(1);
      while (d.modalOpen) d.nextModal();
    }
    const per = (S.van - v0) / 4;
    if (per > 2) errs.push(`giấy bút cho ${per} Văn mỗi mùa (tối đa 2)`);
    return {errs, per};
  }

  /* Lo trước ngày giặc đến: chưa có tin Toa Đô thì chưa làm được; làm đủ ba việc thì đêm 1285 có
     bà Tư, bé Sen ở sẵn trong rừng, một bao thóc giấu sẵn, trai làng cầm giáo; biên niên ghi lại. */
  function prep() {
    const d = D(), S = d.S, errs = [];
    Object.assign(S, {year: 1281, season: 0, tien: 100, path: 'nong', cha: true, thao: 'wife', child: true});
    S.ev.thao = 1; S.tieng = 40; S.flags.de = 'saved'; S.quests.trau = 'done';
    d.talkLy(); if (choose('dựng lán')) errs.push('năm 1281 (chưa có tin Toa Đô) đã góp được tiền dựng lán'); closeDialog();
    S.year = 1283;
    for (const [talk, text] of [['talkLy', 'dựng lán'], ['talkRen', 'Rèn giáo'], ['talkCha', 'Cất bớt thóc']]) {
      d[talk](); if (!choose(text)) errs.push(`năm 1283 không làm được việc "${text}" (${talk})`); closeDialog();
    }
    if (S.tien !== 100 - 20 - 16 - 10) errs.push(`tiền sau ba việc là ${S.tien}, mong ${100 - 46}`);
    if (!S.flags.lan || !S.flags.giao || !S.flags.catThoc) errs.push('thiếu cờ sau khi làm đủ ba việc');
    S.year = 1285; S.season = 0;
    d.startClimax();
    const M = d.MG;
    for (const id of ['batu', 'sen']) { const p = M.v.find(x => x.id === id); if (!p || p.st !== 'safe') errs.push(`${id} chưa ở sẵn trong rừng`); }
    if (M.sk.filter(s => s.st === 'safe').length !== 1) errs.push('không có đúng một bao thóc giấu sẵn');
    const trai = M.al.filter(a => a.id.startsWith('trai'));
    if (!trai.length) errs.push('kiểu nhân vật thử phải có trai làng');
    if (trai.some(a => !a.giao || !/_giao$/.test(a.look.id))) errs.push('trai làng chưa có giáo');
    window.__bots.climaxTeleport(true);
    d.mpick(0); // Nhìn lại cuộc đời
    const chron = document.querySelector('#modal').innerText;
    for (const t of ['dựng lán', 'rèn giáo', 'cất bớt thóc']) if (!chron.includes(t)) errs.push(`biên niên thiếu dòng "${t}"`);
    return {errs};
  }

  /* Mốc chỉ số: Tiếng quyết định số trai làng, Võ thêm máu và sát thương cho mọi đường; phím C mở bảng chỉ số. */
  function statTiers() {
    const d = D(), S = d.S, errs = [];
    const night = (setup) => {
      d.setS(Object.assign(d.newState('Thử'), {year: 1285, season: 0, path: 'van', co: 'army', quests: {trau: 'done'}}));
      Object.assign(d.S, setup); d.startClimax();
      const M = d.MG, r = {trai: M.al.filter(a => a.id.startsWith('trai')).length, hp: M.maxhp};
      d.setMG(null); document.body.classList.remove('mg'); return r;
    };
    for (const [tieng, want] of [[0, 0], [19, 0], [20, 1], [40, 2], [60, 3], [100, 3]]) {
      const r = night({tieng});
      if (r.trai !== want) errs.push(`Tiếng ${tieng}: ${r.trai} trai làng, mong ${want}`);
    }
    if (night({duc: 100, tieng: 0}).trai !== 0) errs.push('Đức cao mà Tiếng 0 vẫn có trai làng (trai làng phải theo Tiếng)');
    if (night({tieng: 60, path: 'nong', flags: {de: 'saved'}}).trai !== 4) errs.push('Tiếng 60 + giữ đê + đường nông phải ra 4 trai làng (tối đa)');
    if (night({tieng: 40, flags: {dh: 'hoa'}}).trai !== 1) errs.push('nói "hòa" ở Diên Hồng phải bớt một trai làng');
    for (const [the, want] of [[20, 3], [55, 4], [80, 5]]) { const r = night({the}); if (r.hp !== want) errs.push(`Thể trạng ${the} (đường văn): ${r.hp} máu, mong ${want}`); }
    for (const [vo, want] of [[0, 4], [25, 5], [74, 5], [75, 6]]) {
      const r = night({vo});
      if (r.hp !== want) errs.push(`Võ ${vo} (đường văn): ${r.hp} máu, mong ${want}`);
    }
    // phím C
    d.setS(d.newState('Thử')); d.startPlay(false); while (d.modalOpen) d.nextModal();
    S.duc = 0; S.tieng = 0;
    window.dispatchEvent(new KeyboardEvent('keydown', {key: 'c'})); window.dispatchEvent(new KeyboardEvent('keyup', {key: 'c'}));
    const txt = d.modalOpen ? document.querySelector('#modal').innerText : '';
    if (!/Bảng chỉ số/i.test(txt)) errs.push('bấm C không mở bảng chỉ số');
    else for (const t of ['Văn', 'Võ', 'Đức', 'Tiếng', 'Thể trạng', 'Nghề', 'Chèo thuyền', 'trai làng']) if (!txt.includes(t)) errs.push(`bảng chỉ số thiếu "${t}"`);
    while (d.modalOpen) d.nextModal();
    return {errs};
  }

  /* Chuyện đời thường: mọi chuyện, mọi lựa chọn chạy không lỗi, ghi kết quả, có dòng biên niên. */
  function lifeAll() {
    const d = D(), errs = [];
    let n = 0;
    for (const e of d.LIFE) for (let ci = 0; ci < e.ch.length; ci++) {
      d.setS(Object.assign(d.newState('Thử'), {year: 1258 + e.age[0], season: e.s ?? 1, tien: 50, van: 40, vo: 40, duc: 30,
        items: ['Lá thuốc'], quests: {hoc: 'done', trau: 'done'}, cha: true, thay: true}));
      d.S.life = e.id === 'travay' ? {chovay: 'cho'} : {}; d.S.vayYear = d.S.year - 1;
      d.startPlay(false); while (d.modalOpen) d.nextModal();
      d.runLife(e);
      const visible = e.ch.filter(c => !c.show || c.show());
      const c = e.ch[ci]; if (!visible.includes(c)) continue;
      const b = document.getElementById('mopt' + visible.indexOf(c));
      if (!b || b.disabled) { errs.push(`${e.id}/${c.k}: nút bị khóa dù đủ điều kiện`); while (d.modalOpen) d.nextModal(); continue; }
      b.click(); n++;
      const k = d.S.life[e.id];
      if (k == null) errs.push(`${e.id}/${c.k}: chọn xong mà không ghi kết quả`);
      else if (!(k in e.chron)) errs.push(`${e.id}/${c.k}: kết quả "${k}" không có dòng biên niên`);
      while (d.modalOpen) d.nextModal();
    }
    return {errs, nch: n};
  }

  /* Nhịp: sống từ 1264 tới hết 1284, mỗi mùa ngủ một giấc, chọn ngẫu nhiên khi có chuyện. Sự kiện lịch sử
     tính theo lịch (không chạy thật). Đo số chuyện đời thường và quãng dài nhất không có chuyện gì. */
  function lifePacing() {
    const d = D(), errs = [];
    d.setS(Object.assign(d.newState('Thử'), {quests: {hoc: 'done', trau: 'done'}, tien: 20, van: 30, vo: 30, duc: 20}));
    d.S.ev = new Proxy({}, {get: () => 1});
    d.startPlay(false); while (d.modalOpen) d.nextModal();
    const main = new Set(d.EVENTS.map(e => e.y * 4 + e.s)), happened = [];
    let count = 0;
    while (d.S.year < 1285) {
      d.advanceOne();
      const t = d.S.year * 4 + d.S.season;
      if (d.modalOpen) { count++; happened.push(t);
        const bs = [...document.querySelectorAll('#modal .opt')].filter(b => !b.disabled);
        bs[Math.floor(Math.random() * bs.length)].click(); while (d.modalOpen) d.nextModal(); }
      else if (main.has(t)) happened.push(t);
    }
    const all = [...new Set(happened.concat([...main].filter(t => t < 1285 * 4)))].sort((a, b) => a - b);
    let gap = 0, at = 1264 * 4;
    let where = '';
    for (const t of all) { if (t - at - 1 > gap) { gap = t - at - 1; where = `${Math.floor(at / 4)}.${at % 4} → ${Math.floor(t / 4)}.${t % 4}`; } at = t; }
    if (count < 14) errs.push(`chỉ có ${count} chuyện đời thường cả đời (mong ít nhất 14)`);
    if (gap > 6) errs.push(`có quãng ${gap} mùa liền không có chuyện gì, từ ${where} (mong tối đa 6)`);
    return {errs, count, gap};
  }

  /* Việc hằng ngày: mỗi màn, mỗi mức chơi cho đúng phần thưởng (khá = mức cũ, giỏi +1, kém/qua loa −1). */
  function daily() {
    const d = D(), errs = [], out = {};
    const cases = [
      ['học chữ (thầy)', 'van', () => { d.talkThay(); d.pick(d.S.quests.hoc === 'active' ? 0 : 0); }, {'giỏi': 3, 'khá': 2, 'kém': 1, 'qua': 1}],
      ['luyện võ (võ sư)', 'vo', () => { d.talkVo(); d.pick(0); }, {'giỏi': 3, 'khá': 2, 'kém': 1, 'qua': 1}],
      ['làm đồng (đường nông)', 'tien', () => d.fieldAction(), {'giỏi': 4, 'khá': 3, 'kém': 2, 'qua': 2}],
    ];
    for (const [name, stat, open, want] of cases) for (const lv of ['giỏi', 'khá', 'kém', 'qua']) {
      d.setS(Object.assign(d.newState('Thử'), {year: 1276, path: 'nong', quests: {hoc: 'done', trau: 'done'}, van: 10, vo: 10}));
      d.startPlay(false); while (d.modalOpen) d.nextModal();
      const full = () => d.S[stat] + ((d.S.frac || {})[stat] || 0);   // chỉ số kể cả phần lẻ (growth ở stats.js)
      const v0 = full(); open();
      if (!d.MG || d.MG.type !== 'daily') { errs.push(`${name}: không mở màn chơi`); break; }
      window.__bots.dailyAuto(lv); d.dailyFlush();
      // học, luyện là việc lặp lại: điểm thô nhân GROW_RATE (Văn, Võ 10 nên chưa chậm dần); đổi ngược về điểm thô để so
      const got = stat === 'tien' ? d.S[stat] - v0 : Math.round((full() - v0) / d.stats.GROW_RATE); (out[name] ||= {})[lv] = got;
      if (got !== want[lv]) errs.push(`${name}, mức ${lv}: +${got}, mong +${want[lv]}`);
      if (d.MG || d.modalOpen) errs.push(`${name}, mức ${lv}: chơi xong mà màn chơi chưa đóng`);
      while (d.modalOpen) d.nextModal();
    }
    for (const lv of ['giỏi', 'kém']) {
      d.setS(Object.assign(d.newState('Thử'), {year: 1270, quests: {ca: 'done'}})); d.startPlay(false); while (d.modalOpen) d.nextModal();
      const t0 = d.S.tien; d.fishAction(); window.__bots.dailyAuto(lv); d.dailyFlush();
      const ok = d.S.tien > t0;
      if (ok !== (lv === 'giỏi')) errs.push(`câu cá, mức ${lv}: ${ok ? 'câu được' : 'không câu được'}`);
    }
    return {errs, out};
  }

  /* Khám phá: đứng ở từng chỗ, bấm E (qua game), có đúng hậu quả; đồ nhặt được dùng được ở nơi khác. */
  function explore() {
    const d = D(), errs = [];
    const fresh = (o) => { d.setS(Object.assign(d.newState('Thử'), {year: 1268, season: 1, quests: {hoc: 'done', trau: 'done'}}, o)); d.startPlay(false); while (d.modalOpen) d.nextModal(); d.closeDialog(); };
    const press = (p) => { d.S.x = p.x; d.S.y = p.y; d.step(DT); ev('e', true); ev('e', false); const ok = d.modalOpen; const txt = ok ? document.querySelector('#modal').innerText : ''; while (d.modalOpen) d.nextModal(); d.closeDialog(); return txt; };
    const want = {tien: S => S.tien >= 8, thuoc: S => S.items.includes('Lá thuốc'), de: S => S.items.includes('Dế chọi'), bia: S => S.van >= 31,
      kiem: S => S.items.includes('Kiếm gỉ'), thuyen: S => S.suc === 3, to: S => S.duc === 1, soi: S => S.items.includes('Sỏi trắng'), do: S => (S.nghe || {}).boi === 1};   // bến đò cũ: tắm sông với lũ trẻ (ông lái đò ra sông Hồng, xem cheo.js)
    for (const p of d.SPOTS) {
      if (p.quest) continue;
      fresh({van: p.id === 'bia' || p.id === 'do' ? 30 : 0, suc: p.id === 'thuyen' ? 2 : 4, year: p.id === 'kiem' ? 1270 : p.id === 'bia' ? 1278 : 1268});   // đọc bia cần Văn 30: tuổi phải đủ lớn (trần theo tuổi)
      const txt = press(p);
      if (!txt) { errs.push(`${p.name}: đứng tại chỗ bấm E không có gì (hội thoại ${d.dialogOpen ? 'đang mở' : 'đóng'}, gợi ý "${document.getElementById('prompt').innerText}")`); continue; }
      if (!want[p.id](d.S)) errs.push(`${p.name}: chưa có hậu quả đúng (${txt.slice(0, 60)}…)`);
      if (p.once !== false && press(p)) errs.push(`${p.name}: xem lại lần nữa vẫn được (đáng lẽ chỉ một lần)`);
    }
    fresh({van: 10}); if (!/Học thêm/.test(press(d.SPOTS.find(p => p.id === 'bia'))) || d.S.found.bia) errs.push('tấm bia: Văn dưới 30 mà vẫn đọc được');
    // dùng đồ
    fresh({items: ['Dế chọi'], year: 1266}); const co0 = d.S.rel.co; d.talkCo(); choose('Tặng Cò con dế'); if (d.S.rel.co !== co0 + 2) errs.push('tặng dế chọi cho Cò không có tác dụng');
    fresh({items: ['Kiếm gỉ'], year: 1274, tien: 5}); d.talkRen(); choose('Rèn lại'); if (!d.S.items.includes('Kiếm sắt') || d.S.tien !== 2) errs.push('rèn lại kiếm gỉ không ra kiếm sắt');
    fresh({items: ['Sỏi trắng'], year: 1273}); d.S.ev.thao = 1; d.S.thao = 'none'; const t0 = d.S.rel.thao; d.talkThao(); choose('Tặng Thảo hòn sỏi'); if (d.S.rel.thao !== t0 + 1) errs.push('tặng sỏi trắng cho Thảo không có tác dụng');
    closeDialog();
    return {errs, nspot: d.SPOTS.length};
  }

  /* Chuỗi nhiệm vụ: làm trọn từng chuỗi qua hội thoại thật; quá hạn thì thành 'fail'; mỗi mùa một bước. */
  function chains() {
    const d = D(), errs = [];
    const fresh = (o) => { d.setS(Object.assign(d.newState('Thử'), {quests: {hoc: 'done', trau: 'done', ca: 'done'}, lifeWait: 1e9}, o)); d.S.ev = new Proxy({}, {get: () => 1}); d.startPlay(false); while (d.modalOpen) d.nextModal(); };
    const season = () => { d.advanceOne(); while (d.modalOpen) d.nextModal(); d.S.suc = 4; };
    const talk = (fn, ...labels) => { d[fn](); for (const l of labels) if (!choose(l)) { errs.push(`${fn}: không thấy lựa chọn "${l}"`); break; } closeDialog(); };
    // Cò
    fresh({year: 1268, van: 12}); const co0 = d.S.rel.co;
    talk('talkCo', 'Sao trông cậu buồn', 'Để tớ dạy');
    for (let i = 0; i < 3; i++) { talk('talkCo', 'Dạy Cò học chữ'); d.talkCo(); if (choose('Dạy Cò học chữ')) errs.push('Cò: một mùa dạy được hai buổi'); closeDialog(); season(); }
    if (d.S.chains.co.st !== 'done') errs.push(`Cò: dạy đủ 3 buổi mà chưa xong (${d.S.chains.co.st}, ${d.S.chains.co.n})`);
    if (d.S.rel.co < co0 + 3) errs.push('Cò: xong mà không thân hơn');
    fresh({year: 1271, van: 12}); talk('talkCo', 'Sao trông cậu buồn', 'Để tớ dạy');
    for (let i = 0; i < 8; i++) season();
    if (d.S.chains.co.st !== 'fail') errs.push(`Cò: quá 15 tuổi mà chưa thành bỏ dở (${d.S.chains.co.st})`);
    // Thảo
    fresh({year: 1273}); d.S.ev = {thao: 1}; d.S.ev = new Proxy({thao: 1}, {get: () => 1}); d.S.thao = 'none';
    talk('talkThao', 'Em có chuyện gì', 'Để anh lo');
    const treSpot = d.SPOTS.find(p => p.id === 'tre');
    for (let i = 0; i < 3; i++) {
      d.S.x = treSpot.x; d.S.y = treSpot.y; d.step(DT); ev('e', true); ev('e', false); while (d.modalOpen) d.nextModal();
      d.step(DT); ev('e', true); ev('e', false); while (d.modalOpen) d.nextModal(); // lần hai trong mùa không tính
      season();
    }
    if (d.S.chains.thao.n !== 3) errs.push(`Thảo: chặt tre được ${d.S.chains.thao.n}/3 bó sau 3 mùa`);
    const th0 = d.S.rel.thao; talk('talkThao', 'Cùng Thảo lợp');
    if (d.S.chains.thao.st !== 'done' || d.S.rel.thao < th0 + 3) errs.push('Thảo: lợp mái xong mà chuỗi chưa xong');
    // thầy Chu
    fresh({year: 1275, van: 22}); const v0 = d.S.van;
    talk('talkThay', 'Thầy trông mệt', 'Con xin chép');
    for (let i = 0; i < 3; i++) { talk('talkThay', 'Chép sách cho thầy'); season(); }
    if (d.S.chains.thay.st !== 'done' || d.S.van < v0 + 4) errs.push(`thầy Chu: chép đủ mà chưa xong (${d.S.chains.thay.st}, Văn +${d.S.van - v0})`);
    fresh({year: 1280, van: 22}); talk('talkThay', 'Thầy trông mệt', 'Con xin chép'); d.S.thay = false; season();
    if (d.S.chains.thay.st !== 'fail') errs.push('thầy Chu: thầy mất mà chuỗi chưa thành dở dang');
    return {errs};
  }

  /* Đánh nhau ở đêm 1285: giặc không đứng chồng lên nhau, không kẹt đứng im, không vào rừng; bấm Space
     khi giặc đứng cạnh (dù đang quay mặt hướng khác) vẫn chém trúng. Bot giỏi chơi cả đường võ lẫn đường văn (có đuốc). */
  function combat() {
    const d = D(), errs = [], out = {};
    for (const [name, build] of [['võ', {path: 'vo', vo: 70, co: 'village', tieng: 40}], ['văn', {path: 'van', van: 55, co: 'army', tieng: 5, dothi: true}]]) {
      d.setS(Object.assign(d.newState('Thử'), {year: 1285, season: 0, cha: true, thao: 'wife', child: true, quests: {trau: 'done'}}, build));
      d.S.ev.thao = 1; d.S.flags.tolich = 'done'; d.startClimax();
      const M = d.MG, Z = d.ZONE, inZ = (x, y) => x >= Z.x0 && x <= Z.x1 + 1 && y >= Z.y0 && y <= Z.y1 + 1;
      let n = 0, overlap = 0, stuck = 0, inside = 0; const last = new Map(), still = new Map();
      const orig = d.step;
      d.step = dt => { orig(dt); if (d.MG !== M) return; const live = M.en.filter(e => !e.dead);
        for (const e of live) { n++; if (inZ(e.x, e.y) && e.st !== 'flee') inside++;
          for (const f of live) if (f !== e && Math.hypot(e.x - f.x, e.y - f.y) < .25) { overlap++; break; }
          const l = last.get(e), arrived = e.tgt && Math.hypot(e.tgt.x - e.x, e.tgt.y - e.y) < .6; if (l && !arrived && Math.hypot(e.x - l[0], e.y - l[1]) < 1e-4 && Math.hypot(e.x - d.S.x, e.y - d.S.y) > 1.5 && !e.cap) { still.set(e, (still.get(e) || 0) + dt); if (still.get(e) > 2) stuck++; } else still.set(e, 0);
          last.set(e, [e.x, e.y]); } };
      window.__bots.climaxBot('giỏi'); d.step = orig;
      out[name] = {overlap: +(100 * overlap / Math.max(1, n)).toFixed(1), stuck, inside};
      if (overlap / Math.max(1, n) > .05) errs.push(`${name}: giặc đứng chồng lên nhau ${out[name].overlap}% thời gian`);
      if (stuck > n * .01) errs.push(`${name}: giặc đứng im kẹt ${stuck} lần`);
      if (inside) errs.push(`${name}: giặc vào trong rừng ${inside} lần`);
      while (d.modalOpen) d.nextModal();
    }
    // dân đang đi theo không bị giặc đang đánh mình tiện tay bắt mất (6 lượt bot khá, đếm số lần người đi theo bị bắt)
    let caught = 0;
    for (let i = 0; i < 6; i++) {
      d.setS(Object.assign(d.newState('Thử'), {year: 1285, season: 0, cha: true, thao: 'wife', child: true, path: i % 2 ? 'vo' : 'nong', vo: 30, co: 'army', quests: {trau: 'done'}}));
      d.S.ev.thao = 1; d.S.flags.tolich = 'done'; d.startClimax();
      const M = d.MG, prev = new Map(M.v.map(p => [p, p.st])), orig = d.step;
      d.step = dt => { orig(dt); if (d.MG !== M) return; for (const p of M.v) { if (p.st === 'cap' && prev.get(p) === 'follow') caught++; prev.set(p, p.st); } };
      window.__bots.climaxBot('khá'); d.step = orig; while (d.modalOpen) d.nextModal();
    }
    out.followCaught = caught;
    if (caught > 3) errs.push(`người đang đi theo bị bắt ${caught} lần trong 6 lượt (tối đa 3)`);
    // tự quay mặt: giặc đứng bên phải, người chơi quay lên trên, bấm Space vẫn trúng
    d.setS(Object.assign(d.newState('Thử'), {year: 1285, season: 0, path: 'vo', vo: 30, co: 'army', quests: {trau: 'done'}}));
    d.startClimax(); const M = d.MG; M.spawnT = 1e9; d.P.dir = 'up';
    M.en.push({x: d.S.x + 1, y: d.S.y, home: [d.S.x + 20, d.S.y], hp: 9, sp: 0, st: 'hunt', cap: null, walk: 0, dir: 'left', flash: 0, dead: false});
    ev(' ', true); ev(' ', false);
    if (M.en[0].hp === 9) errs.push('bấm Space khi giặc đứng bên cạnh mà không chém trúng (không tự quay mặt)');
    d.setMG(null); document.body.classList.remove('mg');
    return {errs, out};
  }

  /* Bị bắt: đánh thua tên đầu toán (còn người cùng đánh) vẫn bị bắt; lừa hỏng thì bị bắt. Rồi màn bị giải đi
     (đứng yên, lính lôi đi: không xuyên tường, sông, rào trại), qua sông, vào bãi tù, lính khám tay, Đỗ Khắc Chung,
     lựa chọn, rạng sáng, hết chương với biên niên đúng nhánh. */
  function captivity() {
    const d = D(), errs = [], out = {};
    const night = (build) => { d.setS(Object.assign(d.newState('Thử'), {year: 1285, season: 0, cha: true, thao: 'wife', child: true, co: 'village', rel: {co: 5, thao: 0}, tieng: 45, quests: {trau: 'done'}}, build));
      d.S.ev.thao = 1; d.S.flags.tolich = 'done'; d.S.flags.de = 'saved'; d.startClimax(); const M = d.MG; M.spawnT = 1e9; M.t = 45.01; d.step(DT);
      for (let i = 0; i < 60 * 60 && d.MG === M && !(M.boss && M.boss.cap); i++) d.step(DT); return M; };
    // 1. đánh thua tên đầu toán khi Cò, trai làng còn đứng: vẫn bị bắt
    let M = night({path: 'vo', vo: 30}), S = d.S;
    if (!M.boss || !M.boss.cap) errs.push('đánh thua: tên đầu toán không bắt được con tin');
    else {
      if (!M.al.some(a => !a.down)) errs.push('kiểu nhân vật thử phải có người cùng đánh còn đứng');
      S.x = M.boss.x + .7; S.y = M.boss.y; M.hp = 0; d.step(DT);
      if ((S.res || {}).reason !== 'captured' || !S.capt || S.capt.how !== 'fight') errs.push(`đánh thua tên đầu toán mà không bị bắt (reason ${(S.res || {}).reason}, how ${S.capt && S.capt.how})`);
    }
    // màn bị giải đi tới hết chương, ghi lại đường đi
    if (d.modalOpen && /trại giặc/.test(document.querySelector('#modal').innerText)) {
      d.mpick(0);
      const E = d.MG; if (!E || E.type !== 'escort') errs.push(`bấm "Bị giải về trại giặc" mà không vào màn áp giải (${E && E.type})`);
      let bad = 0, crossed = false, camp = false, insp = false, kc = false, choice = false, t = 0; const where = new Set();
      for (let i = 0; i < 30000 && !/Hết chương một/.test(document.querySelector('#modal').innerText); i++) {
        if (d.modalOpen) { if (/Sứ giả/.test(document.querySelector('#modal').innerText)) choice = true; d.mpick(1); continue; }
        if (!d.MG) break;
        d.step(0.05); t += 0.05; const Mx = d.MG; if (!Mx) continue;
        if (Mx.type === 'escort' && Mx.crossed) crossed = true;
        if (Mx.type === 'camp') { camp = true; if (Mx.ev.inspDone) insp = true; if (Mx.kc) kc = true;
          const P = d.trai.PEN; if (Math.floor(S.x) < P.x0 || Math.floor(S.x) > P.x1 || Math.floor(S.y) < P.y0 || Math.floor(S.y) > P.y1) { bad++; where.add(`ra ngoài bãi tù ${S.x.toFixed(1)},${S.y.toFixed(1)}`); } }
        if (!(Mx.type === 'escort' && ['board', 'row', 'land'].includes(Mx.phase)) && !d.walkable(Math.floor(S.x), Math.floor(S.y))) { bad++; where.add(`${Mx.type} ô cấm ${Math.floor(S.x)},${Math.floor(S.y)}`); }
      }
      out.seconds = Math.round(t);
      if (!crossed) errs.push('màn áp giải không tới được bến, không qua sông');
      if (!camp) errs.push('không vào tới trại giặc');
      if (!insp) errs.push('không có cảnh lính khám tay tìm chữ Sát Thát');
      if (!kc) errs.push('không có cảnh Đỗ Khắc Chung vào trại');
      if (!choice) errs.push('không hỏi lựa chọn khi sứ giả đi ngang bãi tù');
      if (bad) errs.push(`${bad} lần người chơi đứng sai chỗ: ${[...where].slice(0, 4).join('; ')}`);
      if (!S.capt || !S.capt.map) errs.push('chọn im lặng ghi nhớ mà chưa ghi S.capt.map');
      const txt = document.querySelector('#modal').innerText;
      if (!/Hết chương một/.test(txt)) errs.push(`màn trại giặc không kết thúc ở màn hết chương (sau ${out.seconds} giây)`);
      if (!/đánh nhau với tên đầu toán/.test(txt)) errs.push('biên niên thiếu dòng đánh thua tên đầu toán');
      if (!/ghi nhớ/.test(txt)) errs.push('biên niên thiếu dòng ghi nhớ trại giặc');
      if (out.seconds > 200) errs.push(`màn bị bắt kéo dài ${out.seconds} giây khi đứng yên (quá lâu?)`);
      while (d.modalOpen) d.nextModal();
    } else errs.push('bị bắt mà không có lựa chọn giải về trại giặc');
    if (d.MG) { d.setMG(null); document.body.classList.remove('mg'); }
    // 2. lừa hỏng: bị bắt ngay
    M = night({path: 'van', van: 0, vo: 10}); S = d.S;
    if (M.boss && M.boss.cap) {
      S.x = M.boss.x + 1; S.y = M.boss.y; const tg = M.findTarget(); const rnd = Math.random; Math.random = () => .999;
      if (tg) { tg.act(); const i = [...document.querySelectorAll('#modal .opt')].findIndex(b => /Lừa/.test(b.textContent)); if (i < 0) errs.push('đường văn không có lựa chọn lừa tên đầu toán'); else d.mpick(i); }
      Math.random = rnd;
      if ((S.res || {}).reason !== 'captured' || !S.capt || S.capt.how !== 'trick') errs.push(`lừa hỏng mà không bị bắt (reason ${(S.res || {}).reason}, how ${S.capt && S.capt.how})`);
      while (d.modalOpen) d.nextModal();
    } else errs.push('lừa: tên đầu toán không bắt được con tin');
    if (d.MG) { d.setMG(null); document.body.classList.remove('mg'); }
    return {errs, out};
  }

  /* Bản đồ thế giới: kích thước; chương một không bước ra khỏi vùng An Phú (khóa vùng) và BFS không lan ra ngoài;
     mở hết các vùng thì đi bộ cộng đi đò tới được mọi biển địa danh, đầu đò, cổng doanh trại; trong doanh trại
     từ cổng tây tới được cửa chuồng tù, cổng đông, cổng nam; vẽ một mảnh nền không quá lâu. */
  function world() {
    const d = D(), errs = [], out = {}, wd = d.world;
    if (d.W !== W || d.H !== H) errs.push(`checks.js ghi bản đồ ${W}×${H} nhưng game là ${d.W}×${d.H}`);
    d.setS(Object.assign(d.newState('Thử'), {year: 1270, season: 0, quests: {trau: 'done'}}));
    let S = d.S, prev = d.bfs(43, 50), leak = 0;
    for (let i = 0; i < W * H; i++) if (prev[i] !== -2 && wd.regionId(i % W, (i / W) | 0) !== 'anphu') leak++;
    if (leak) errs.push(`chương một: BFS từ nhà lan ra ${leak} ô ngoài vùng An Phú`);
    // đi thẳng xuống nam ở mép dưới vùng An Phú, đi sang đông ở bến Đông Bộ Đầu: phải dừng ở ranh
    S.x = 40.5; S.y = 70.5; ev('s', true); run(3); ev('s', false);
    if (S.y >= 72) errs.push(`chương một mà đi được xuống phía nam ra ngoài vùng (y ${S.y.toFixed(1)})`);
    if (!/chưa tới lúc/.test(document.getElementById('toast').innerText)) errs.push('chạm ranh vùng chưa mở mà không có lời nhắc');
    // mở hết các vùng: tới được mọi nơi (đi bộ + đò)
    S.regions = Object.keys(wd.REGIONS); S.res = null;
    const seen = new Int32Array(W * H).fill(-2), comp = [[43, 50]];
    const used = new Set();
    while (comp.length) { const [sx, sy] = comp.pop(); const p = d.bfs(sx, sy); for (let i = 0; i < W * H; i++) if (p[i] !== -2) seen[i] = 1;
      wd.FERRIES.forEach((f, k) => { for (const [a, b] of [[f.a, f.b], [f.b, f.a]]) { if (used.has(k + ':' + a)) continue; if (seen[Math.floor(a[1]) * W + Math.floor(a[0])] === 1) { used.add(k + ':' + a); comp.push([Math.floor(b[0]), Math.floor(b[1])]); } } }); }
    const reachSet = seen.map(v => v === 1 ? 0 : -2);
    for (const s of wd.WSIGNS) if (!near(reachSet, s.x + .5, s.y + 1.2, 1.6)) errs.push(`biển "${s.name}" (${s.x}, ${s.y}) không tới được`);
    for (const f of wd.FERRIES) for (const e of [f.a, f.b]) if (!near(reachSet, e[0], e[1], 1.3)) errs.push(`đầu đò "${f.name}" (${e[0]}, ${e[1]}) không tới được`);
    const C = wd.CAMP; if (!near(reachSet, C.x0 - .5, 12.5, 1.2)) errs.push('cổng tây doanh trại không tới được');
    // trong trại (đã dựng): từ cổng tây tới cửa chuồng tù, cổng đông, cổng nam
    S.res = {reason: 'done'}; const T = d.trai;
    const ok = (x, y) => d.walkable(x, y) && !T.campSolid(x, y);
    const q = [[C.x0, 12]], vis = new Set([C.x0 + ',' + 12]);
    while (q.length) { const [x, y] = q.shift(); for (const [a, b] of [[1, 0], [-1, 0], [0, 1], [0, -1]]) { const nx = x + a, ny = y + b, k = nx + ',' + ny; if (vis.has(k) || !ok(nx, ny) || nx < C.x0 - 2 || nx > C.x1 + 2 || ny < C.y0 - 1 || ny > C.y1 + 2) continue; vis.add(k); q.push([nx, ny]); } }
    for (const [nm, x, y] of [['cửa chuồng tù', T.PEN.door, T.PEN.y0 - 2], ['cổng đông', C.x1, 20], ['cổng nam', 153, C.y1], ['trướng Ô Mã Nhi', Math.floor(T.KC_AT[0]), Math.floor(T.KC_AT[1])]])
      if (!vis.has(x + ',' + y)) errs.push(`trong doanh trại không đi được từ cổng tây tới ${nm} (${x}, ${y})`);
    // đi đò thật (bến Chương Dương): có cảnh thuyền, tới bờ bên kia
    S.res = null; const f = wd.FERRIES.find(x => /Chương Dương/.test(x.name)); S.x = f.a[0]; S.y = f.a[1]; d.step(DT);
    const pr = document.getElementById('prompt').innerText; if (!/Đi đò/.test(pr)) errs.push(`đứng ở bến Chương Dương mà không có lựa chọn đi đò ("${pr}")`);
    else { ev('e', true); ev('e', false); if (!d.MG || d.MG.type !== 'ferry') errs.push('đi đò mà không có cảnh thuyền');
      let rowed = false; for (let i = 0; i < 60 * 40 && d.MG; i++) { if (d.MG.phase === 'row') rowed = true; d.step(DT); }
      if (!rowed) errs.push('cảnh đi đò không có lúc chèo thuyền');
      if (Math.hypot(S.x - f.b[0], S.y - f.b[1]) > .6) errs.push(`đi đò xong không tới bờ bên kia (${S.x.toFixed(1)}, ${S.y.toFixed(1)})`); }
    // vẽ một mảnh nền mới
    const t0 = performance.now(); d.groundChunk(2, 9, 4); out.chunkMs = Math.round(performance.now() - t0);
    if (out.chunkMs > 1500) errs.push(`vẽ một mảnh nền mất ${out.chunkMs} ms (quá chậm)`);
    S.res = null;
    return {errs, out};
  }

  /* Hệ chỉ số mới: Đức / Tiếng tách nhau; Sức mỗi mùa theo thể trạng; nghề học qua việc thật; mốc mở việc;
     Đức 25 cho chỉ đường người nhà; thuốc nam tự băng bó; bản lưu cũ được chuyển đổi. */
  function statsV2() {
    const d = D(), errs = [], out = {};
    const fresh = (o) => { d.setS(Object.assign(d.newState('Thử'), {year: 1276, season: 0, quests: {hoc: 'done', trau: 'done'}}, o)); d.startPlay(false); while (d.modalOpen) d.nextModal(); d.closeDialog(); };
    const season = () => { d.advanceOne(); while (d.modalOpen) d.nextModal(); d.closeDialog(); };
    // khung việc cần làm: lúc nào cũng có gợi ý việc mùa này; hết Sức thì nhắc về ngủ
    fresh({}); d.renderHUD(); let q = document.getElementById('quests').innerText;
    if (!/Mùa này/i.test(q) || !/trường làng|Học chữ/.test(q)) errs.push(`khung việc cần làm không gợi ý việc mùa này ("${q.slice(0, 80)}")`);
    d.S.suc = 0; d.renderHUD(); q = document.getElementById('quests').innerText; if (!/Hết Sức/.test(q)) errs.push('hết Sức mà khung việc không nhắc về ngủ');
    // giúp việc làng: Tiếng tăng, Đức không
    fresh({}); d.talkLy(); choose('Giúp việc làng'); closeDialog();
    if (!(d.S.tieng + ((d.S.frac || {}).tieng || 0) > 0) || d.S.duc !== 0) errs.push(`giúp việc làng: Tiếng ${d.S.tieng}, Đức ${d.S.duc} (mong Tiếng tăng, Đức không)`);
    // nghe kinh: mỗi mùa một lần
    fresh({}); for (let i = 0; i < 3; i++) { d.talkSu(); choose('Thắp hương'); closeDialog(); }
    if (d.S.duc !== 1) errs.push(`nghe kinh ba lần một mùa được ${d.S.duc} Đức (mong 1)`);
    // lo việc làng ở nhà: Tiếng có trần
    fresh({year: 1268}); d.fastForward('lang'); while (d.modalOpen) d.nextModal(); d.closeDialog();
    if (d.S.tieng > d.stats.TIENG_FF_CAP) errs.push(`ở nhà lo việc làng mà Tiếng lên ${d.S.tieng}`);
    // Sức theo thể trạng
    for (const [the, want] of [[30, 3], [55, 4], [80, 5]]) { fresh({the}); season(); if (d.S.suc !== want) errs.push(`thể trạng ${the}: mỗi mùa ${d.S.suc} Sức, mong ${want}`); }
    // nghề rèn: quai búa đúng nhịp sáu mùa thì biết nghề, giáo rẻ hơn; quai lệch nhịp thì không tính
    const ren = (lv) => { d.talkRen(); const ok = choose('Phụ bác quai búa'); window.__bots.dailyAuto(lv); d.dailyFlush(); while (d.modalOpen) d.nextModal(); d.closeDialog(); season(); return ok; };
    fresh({year: 1279, tien: 50}); ren('kém'); ren('kém');
    if ((d.S.nghe || {}).ren) errs.push(`quai búa lệch nhịp mà vẫn tính vào nghề rèn (${d.S.nghe.ren})`);
    for (let i = 0; i < d.nghe.NGHE.ren.need; i++) if (!ren('giỏi')) errs.push(`mùa ${i + 1}: không phụ được thợ rèn`);
    if (!d.nghe.knows('ren')) errs.push(`phụ thợ rèn ${d.nghe.NGHE.ren.need} mùa đúng nhịp mà chưa biết nghề rèn (${(d.S.nghe || {}).ren})`);
    d.S.year = 1283; const t0 = d.S.tien; d.talkRen(); choose('Rèn giáo'); closeDialog();
    if (t0 - d.S.tien !== 7) errs.push(`biết nghề rèn mà rèn giáo mất ${t0 - d.S.tien} quan (mong 7)`);
    // chèo thuyền: cầm chèo cho ông lái đò sông Hồng mỗi mùa một chuyến; buông chèo (hết giờ) thì không tính
    const cheo = (bot) => { d.cheo.talkLaiDo(); while (d.modalOpen) d.nextModal(); if (!d.dialogOpen) d.cheo.talkLaiDo(); if (!choose('chèo')) { errs.push('ông lái đò không cho cầm chèo'); return; }
      if (!d.MG || d.MG.type !== 'cheo') { errs.push('không vào được màn chèo đò'); return; }
      if (bot) window.__bots.cheoBot(bot); else { const M = d.MG; for (let t = 0; t < 120 && d.MG === M; t += DT) d.step(DT); }
      while (d.modalOpen) d.nextModal(); d.closeDialog(); season(); };
    fresh({year: 1272}); cheo(null);
    if ((d.S.nghe || {}).cheo) errs.push('buông chèo cả chuyến mà vẫn tính vào nghề chèo thuyền');
    for (let i = 0; i < 4; i++) cheo('khá');
    if (!d.nghe.knows('cheo')) errs.push(`chèo bốn chuyến (bot khá) mà chưa biết chèo thuyền (tiến độ ${(d.S.nghe || {}).cheo})`);
    if (Math.abs(d.S.x - d.cheo.SHORE_W[0]) > 2) errs.push(`chèo xong mà không về bến làng (${d.S.x.toFixed(1)}, ${d.S.y.toFixed(1)})`);
    // Văn 50: viết đơn cho làng
    fresh({van: 50, year: 1276}); d.talkLy(); if (!choose('Viết đơn')) errs.push('Văn 50 mà cụ xã không cho viết đơn'); closeDialog();
    if (!d.S.flags.don || d.S.tieng < 5) errs.push('viết đơn mà không ghi cờ hoặc không thêm Tiếng');
    fresh({van: 49, year: 1276}); d.talkLy(); if (choose('Viết đơn')) errs.push('Văn 49 mà vẫn viết đơn được'); closeDialog();
    // đêm 1285: Đức 25 chỉ đường cho người nhà; thuốc nam tự băng bó; Võ 40 cõng người
    const night = (o) => { d.setS(Object.assign(d.newState('Thử'), {year: 1285, season: 0, path: 'nong', co: 'army', cha: true, quests: {trau: 'done'}}, o)); d.startClimax(); return d.MG; };
    let M = night({duc: 25}); d.S.x = M.v.find(p => p.id === 'me').x + .4; d.S.y = M.v.find(p => p.id === 'me').y; d.step(DT);
    if (!/Chỉ đường/.test(document.getElementById('prompt').innerText)) errs.push(`Đức 25: đứng cạnh mẹ mà không chỉ đường được ("${document.getElementById('prompt').innerText}")`);
    d.setMG(null); M = night({duc: 0}); d.S.x = M.v.find(p => p.id === 'me').x + .4; d.S.y = M.v.find(p => p.id === 'me').y; d.step(DT);
    if (/Chỉ đường/.test(document.getElementById('prompt').innerText)) errs.push('Đức 0 (đường nông) mà vẫn chỉ đường được');
    d.setMG(null); M = night({nghe: {thuoc: d.nghe.NGHE.thuoc.need}}); M.spawnT = 1e9; M.hp = 1; d.S.x = 20; d.S.y = 60; run(4);
    if (M.hp !== 2) errs.push(`biết thuốc nam mà còn 1 máu không tự băng bó (máu ${M.hp})`);
    d.setMG(null); document.body.classList.remove('mg');
    // bản lưu cũ (chưa tách Đức, Tiếng)
    try { const old = Object.assign(d.newState('Cũ'), {duc: 50, year: 1280}); delete old.statsV; delete old.tieng; delete old.the; delete old.nghe;
      localStorage.setItem('dvmd-save', JSON.stringify(old)); const r = d.loadSave();
      if (!r || r.tieng !== 50 || r.duc !== 25 || r.the !== 55 || r.statsV !== 2) errs.push(`chuyển bản lưu cũ sai: Tiếng ${r && r.tieng}, Đức ${r && r.duc}, thể trạng ${r && r.the}`);
      localStorage.removeItem('dvmd-save'); } catch (e) { errs.push('lỗi khi đọc bản lưu cũ: ' + e.message); }
    return {errs, out};
  }

  /* Thăng tiến: trượt thi chọn đường, dạy học, lại viên, đội trưởng, ruộng nhà, việc làng 1283, bỏ bút theo kiếm,
     hậu quả đêm 1285 và biên niên. */
  function career() {
    const d = D(), errs = [], C = d.chuc;
    const fresh = (o) => { d.setS(Object.assign(d.newState('Thử'), {year: 1276, season: 0, quests: {hoc: 'done', trau: 'done'}}, o)); d.startPlay(false); while (d.modalOpen) d.nextModal(); d.closeDialog(); };
    const mchoose = (text) => { const b = [...document.querySelectorAll('#modal .opt')].find(x => x.textContent.includes(text)); if (!b || b.disabled) return false; b.click(); return true; };
    const flush = () => { while (d.modalOpen) d.nextModal(); d.closeDialog(); };
    const door = (id) => d.doorAction(d.BUILDINGS.find(b => b.id === id));
    const hud = () => { d.renderHUD(); return document.getElementById('hud').textContent; };
    // trượt thi: về làng dạy học
    fresh({path: 'van', van: 40, flags: {exam: 'fail'}}); C.vanFailChoice();
    if (!mchoose('Về làng phụ thầy Chu')) errs.push('trượt thi mà không có lựa chọn về làng dạy học'); flush();
    if (d.S.career.van !== 'day') errs.push(`chọn dạy học mà career.van = ${d.S.career.van}`);
    if (!/Trợ giáo/.test(hud())) errs.push('dạy học mà bảng trạng thái không ghi Trợ giáo');
    const t0 = d.S.tieng; door('truong'); if (!choose('Dạy lũ trẻ')) errs.push('trợ giáo mà ở trường làng không dạy được'); closeDialog(); flush();
    if (d.S.career.hoctro !== 1 || !(d.S.tieng + ((d.S.frac || {}).tieng || 0) > t0)) errs.push(`dạy một buổi: ${d.S.career.hoctro} buổi, Tiếng ${t0}→${d.S.tieng}`);
    d.S.year = 1281; d.S.season = 2; d.EVENTS.find(e => e.id === 'thaymat').run(); flush();
    if (!/Thầy đồ làng/.test(hud())) errs.push('thầy Chu mất mà trợ giáo không thành thầy đồ');
    // lại viên: cần Văn 30, làm việc ở nhà ra tiền
    fresh({path: 'van', van: 20, flags: {exam: 'fail'}}); C.vanFailChoice();
    if (mchoose('lại viên')) errs.push('Văn 20 mà vẫn làm lại viên được'); flush();
    fresh({path: 'van', van: 40, flags: {exam: 'fail'}}); door('home'); if (!choose('trượt thi')) errs.push('bản lưu cũ trượt thi chưa chọn đường: ở nhà không có lựa chọn'); 
    if (!mchoose('lại viên')) errs.push('Văn 40 mà không làm lại viên được'); flush();
    let m0 = d.S.tien; door('home'); if (!choose('Lên huyện')) errs.push('lại viên mà ở nhà không lên huyện làm việc được'); closeDialog(); flush();
    if (d.S.tien !== m0 + 2) errs.push(`lên huyện làm việc: tiền ${m0}→${d.S.tien}`);
    // võ: đội trưởng
    for (const [o, want] of [[{flags: {train: 'top'}, vo: 30}, true], [{flags: {train: 'ok'}, vo: 50, tieng: 30}, true], [{flags: {train: 'ok'}, vo: 40, tieng: 30}, false], [{flags: {train: 'low'}, vo: 80, tieng: 80}, false]]) {
      fresh(Object.assign({path: 'vo', year: 1283, season: 3}, o)); C.trainPromote(); flush();
      if (d.S.career.doi !== want) errs.push(`tập trận ${o.flags.train}, Võ ${o.vo}, Tiếng ${o.tieng || 0}: đội trưởng ${d.S.career.doi}, mong ${want}`);
    }
    fresh({path: 'vo', year: 1284, vo: 30, career: Object.assign(C.newCareer(), {doi: true})}); d.talkVo();
    if (!choose('Luyện trai làng')) errs.push('đội trưởng mà không luyện trai làng thành đội được'); closeDialog(); flush();
    // nông: mua ruộng, mỗi mùa một thửa; làm đồng nhiều ruộng được thêm tiền; thu hoạch mùa thu
    fresh({path: 'nong', year: 1278, tien: 100}); d.talkLy(); if (!choose('Mua thêm một thửa')) errs.push('đường nông mà cụ xã không bán ruộng'); closeDialog(); flush();
    d.talkLy(); if (choose('Mua thêm một thửa')) errs.push('một mùa mua được hai thửa ruộng'); closeDialog(); flush();
    if (d.S.career.ruong !== 3 || d.S.tien !== 94) errs.push(`mua ruộng: ${d.S.career.ruong} thửa, còn ${d.S.tien} quan (mong 3 thửa, 94 quan)`);
    fresh({path: 'van', year: 1278, tien: 100}); d.talkLy(); if (choose('Mua thêm một thửa')) errs.push('đường văn mà mua được ruộng'); closeDialog(); flush();
    fresh({path: 'nong', year: 1278, season: 2, tien: 0, career: Object.assign(C.newCareer(), {ruong: 6})}); d.advanceOne(); flush();
    if (d.S.tien < 2) errs.push(`sáu thửa ruộng mà thu hoạch mùa thu chỉ được ${d.S.tien} quan`);
    if (!/nhiều ruộng/.test(hud())) errs.push('sáu thửa ruộng mà bảng trạng thái không đổi danh vị');
    // việc làng 1283
    const xa = d.EVENTS.find(e => e.id === 'xachinh');
    fresh({path: 'nong', year: 1283, tieng: 35, duc: 10}); xa.run(); mchoose('Ra nhận'); flush();
    if (d.S.career.xa !== 'win') errs.push(`đường nông Tiếng 35 Đức 10 mà không được chọn (điểm ${C.xaScore()})`);
    if (d.prepCost('lan') !== 10) errs.push(`làm xã chính mà dựng lán vẫn ${d.prepCost('lan')} quan`);
    fresh({path: 'vo', year: 1283, tieng: 10}); xa.run(); mchoose('Ra nhận'); flush();
    if (d.S.career.xa !== 'lose') errs.push('Tiếng 10 mà vẫn được chọn');
    if (d.prepCost('lan') !== 20) errs.push('không làm xã chính mà dựng lán rẻ đi');
    // bỏ bút theo kiếm
    fresh({path: 'van', year: 1283, season: 3, vo: 20}); d.EVENTS.find(e => e.id === 'tietche').run();
    if (!mchoose('Bỏ bút')) errs.push('đường văn Võ 20 mà không bỏ bút theo kiếm được');
    if (d.S.path !== 'vo' || !d.MG || d.MG.type !== 'timing') errs.push(`bỏ bút theo kiếm: đường ${d.S.path}, màn chơi ${d.MG && d.MG.type}`);
    d.setMG(null); document.body.classList.remove('mg'); flush();
    // đêm 1285: đội trưởng, xã chính thêm trai làng
    const night = (c) => { d.setS(Object.assign(d.newState('Thử'), {year: 1285, season: 0, path: 'vo', co: 'army', cha: true, tieng: 20, quests: {trau: 'done'}, career: Object.assign(C.newCareer(), c)})); d.startClimax(); const n = d.MG.al.filter(a => a.id.startsWith('trai')).length; d.setMG(null); document.body.classList.remove('mg'); return n; };
    const n0 = night({}), n1 = night({doi: true}), n2 = night({doi: true, xa: 'win'});
    if (n1 !== n0 + 1 || n2 !== n0 + 2) errs.push(`trai làng đêm 1285: thường ${n0}, đội trưởng ${n1}, thêm xã chính ${n2}`);
    // biên niên
    d.setS(Object.assign(d.newState('Thử'), {year: 1285, path: 'nong', career: Object.assign(C.newCareer(), {ruong: 4, xa: 'win'})}));
    const L = C.careerChronicle().join(' ');
    if (!/4 thửa/.test(L) || !/xã chính/.test(L)) errs.push(`biên niên thiếu dòng thăng tiến: "${L}"`);
    flush();
    return {errs, trai: [n0, n1, n2]};
  }

  /* Màn chơi giữa game (dịch đậu mùa 1278, sâu 1280, tờ văn tự 1280, toán cướp 1280, đấu vật hội xuân):
     đứng im thì thua (đúng kết cục), bot dịch chuyển theo MG.goal() thì thắng; kết cục hiện trong biên niên. */
  function midgame() {
    const d = D(), errs = [], out = {};
    const flush = () => { while (d.modalOpen) d.nextModal(); d.closeDialog(); };
    const fresh = (o) => { d.setS(Object.assign(d.newState('Thử'), {year: 1280, season: 0, cha: true, quests: {hoc: 'done', trau: 'done'}}, o)); d.startPlay(false); flush(); };
    const idle = (start, maxT = 160) => { d[start](); const M = d.MG; for (let t = 0; t < maxT && d.MG === M; t += DT) d.step(DT); const ended = d.MG !== M; if (!ended) { d.setMG(null); document.body.classList.remove('mg'); } return ended; };
    // bot: đứng ở mục tiêu kế tiếp, bấm E (cướp: Space); khung có lựa chọn thì chọn theo want(text)
    const play = (start, want, maxT = 160, pre = 0) => { d[start](); const M = d.MG; let t = 0;
      for (; t < pre; t += DT) d.step(DT);   // đứng chờ trước (ví dụ đợi nhà bên có người ốm)
      while (d.MG === M && t < maxT) { const g = M.goal && M.goal(); if (g) { d.S.x = g[0]; d.S.y = g[1] + .3; }
        for (let i = 0; i < 6; i++) { d.step(DT); t += DT; }
        if (M.type === 'cuop') { ev(' ', true); ev(' ', false); } else { ev('e', true); ev('e', false); }
        while (d.modalOpen) { const o = [...document.querySelectorAll('#modal .opt')]; const b = want && o.find(x => want(x.textContent)); if (b) b.click(); else if (o.length > 1) o[0].click(); else d.nextModal(); } }
      while (d.modalOpen) { const o = [...document.querySelectorAll('#modal .opt')]; const b = want && o.find(x => want(x.textContent)); if (b) b.click(); else d.nextModal(); }
      return t; };
    // dịch đậu mùa
    fresh({year: 1278}); if (!idle('startDich') || d.S.flags.daumua !== 'matcuu' || d.S.cha) errs.push(`dịch: đứng im mà kết cục ${d.S.flags.daumua}, cha ${d.S.cha}`);
    fresh({year: 1278}); out.dich = play('startDich', null, 160, 26); if (!['cham', 'nam'].includes(d.S.flags.daumua) || !d.S.cha) errs.push(`dịch: bot chạy chữa mà kết cục ${d.S.flags.daumua}`);
    if (!d.S.flags.dichGiup) errs.push('dịch: bot đi qua nhà chị Lụa mà không cứu đứa nhỏ');
    // sâu cắn lúa
    fresh({path: 'nong'}); if (!idle('startSau') || d.S.flags.sau !== 'mat') errs.push(`sâu: đứng im mà kết cục ${d.S.flags.sau}`);
    fresh({path: 'nong'}); out.sau = play('startSau'); if (d.S.flags.sau !== 'giu') errs.push(`sâu: bot bắt sâu mà kết cục ${d.S.flags.sau}`);
    // tờ văn tự: chọn sổ ruộng và người làm chứng vắng mặt thì thắng
    fresh({path: 'van', van: 45}); out.kien = play('startKien', x => /Sổ ruộng|vắng làng/.test(x)); if (d.S.flags.kien !== 'thang') errs.push(`tờ văn tự: bot chọn đúng chứng cứ mà kết cục ${d.S.flags.kien}`);
    fresh({path: 'van', van: 45}); play('startKien', x => /khóc|Cột mốc/.test(x)); if (d.S.flags.kien !== 'thua') errs.push(`tờ văn tự: chọn chứng cứ yếu mà kết cục ${d.S.flags.kien}`);
    // toán cướp
    fresh({path: 'vo', vo: 40}); if (!idle('startCuop') || !['lost', 'nga'].includes(d.S.flags.cuop)) errs.push(`cướp: đứng im mà kết cục ${d.S.flags.cuop}`);
    fresh({path: 'vo', vo: 40}); out.cuop = play('startCuop'); if (d.S.flags.cuop !== 'win') errs.push(`cướp: bot đuổi đánh mà kết cục ${d.S.flags.cuop}`);
    // đấu vật: bấm luân phiên A, D thì thắng; đứng im thì thua
    const vat = (mash) => { d.S.year++; d.hoiVat(); const M = d.MG; let k = 0;
      for (let t = 0; t < 25 && d.MG === M && !M.over; t += DT) { if (mash && (t * 60 | 0) % 4 === 0) { ev(k++ % 2 ? 'a' : 'd', true); } d.MG && d.MG.tick && d.MG.tick(DT); }
      d.vatFlush(); flush(); };
    fresh({year: 1276, season: 0, vo: 40}); vat(false); if (d.S.vat.lost !== 1 || d.S.vat.lv !== 0) errs.push(`vật: đứng im mà thắng (${JSON.stringify(d.S.vat)})`);
    for (let i = 0; i < 3; i++) vat(true); if (!d.S.vat.do) errs.push(`vật: bấm đều tay ba năm mà chưa thành đô vật (${JSON.stringify(d.S.vat)})`);
    // đô vật thêm 1 máu đêm 1285
    const hp = (o) => { d.setS(Object.assign(d.newState('Thử'), {year: 1285, season: 0, path: 'nong', co: 'army', quests: {trau: 'done'}}, o)); d.startClimax(); const h = d.MG.maxhp; d.setMG(null); document.body.classList.remove('mg'); return h; };
    if (hp({vat: {lv: 2, do: true, won: 3, lost: 0, last: 0}}) !== hp({}) + 1) errs.push('đô vật mà đêm 1285 không thêm máu');
    // biên niên
    d.setS(Object.assign(d.newState('Thử'), {flags: {sau: 'giu', kien: 'thang', cuop: 'win'}, vat: {do: true, won: 3, lost: 1}}));
    const L = d.midChronicle().join(' ');
    for (const w of ['sâu', 'văn tự', 'cướp', 'đô vật']) if (!L.includes(w)) errs.push(`biên niên thiếu dòng "${w}"`);
    flush();
    return {errs, out};
  }

  /* Mạch anh Ngũ: việc nghe anh ba lần (mỗi năm một lần), tin năm 1278, bãi tập 1283 (mọi mức điểm), bến Đông Bộ Đầu
     1284 (đường văn, nông), lời nhắc đêm 1285. */
  function nguArc() {
    const d = D(), errs = [];
    const flush = () => { while (d.modalOpen) d.nextModal(); d.closeDialog(); };
    const fresh = (o) => { d.setS(Object.assign(d.newState('Thử'), {quests: {hoc: 'done', trau: 'done'}, lifeWait: 99}, o)); d.startPlay(false); flush(); };
    const talk = () => { d.talkNgu(); const b = [...document.querySelectorAll('#dialog .opt')][0]; if (b && !/Đóng|Tạm biệt/.test(b.textContent)) b.click(); flush(); };
    fresh({year: 1271, season: 3}); d.advanceOne(); flush();
    if (d.S.quests.ngu !== 'active') errs.push('năm 1272 chưa có việc "Chàng trai đọc sách bên đường"');
    talk(); talk(); if (d.S.nguN !== 1) errs.push(`một năm nói chuyện hai lần mà tính ${d.S.nguN} lần (mong 1)`);
    d.S.year = 1273; talk(); d.S.year = 1275; talk();
    if (d.S.nguN !== 3 || d.S.quests.ngu !== 'done') errs.push(`ba năm nghe anh Ngũ: ${d.S.nguN} lần, việc ${d.S.quests.ngu}`);
    d.S.year = 1278; d.S.season = 1; d.EVENTS.find(e => e.id === 'ngu').run(); const news = document.querySelector('#modal').innerText; flush();
    if (!/Phạm Ngũ Lão/.test(news) || !/nợ công danh/.test(news)) errs.push('tin năm 1278 không nêu tên Phạm Ngũ Lão hoặc thiếu câu riêng cho người nghe đủ ba lần');
    // chưa gặp: hết 1277 thì việc tự bỏ, không có tin 1278
    fresh({year: 1277, season: 3}); d.S.quests.ngu = 'active'; d.advanceOne(); flush();
    if (d.S.quests.ngu) errs.push('sang năm 1278 mà việc nghe anh Ngũ còn treo');
    // bãi tập 1283: đã gặp thì điểm thấp anh vẫn tới
    fresh({year: 1283, season: 3, path: 'vo', vo: 30, nguMet: true, nguN: 1}); d.startTraining(); const M = d.MG; let saw = false;
    for (let i = 0; i < 60 * 60 && d.MG === M; i++) { if (M.phase === 'aim' && M.pos > 400) d.tmHit(); if (M.phase === 'ngu') saw = true; d.step(DT); }
    flush(); if (!saw || !d.S.flags.nguKnows) errs.push(`bãi tập 1283 (điểm ${M.score}): anh Ngũ không tới`);
    // bến Đông Bộ Đầu 1284: đường văn đã gặp anh bên đường
    fresh({year: 1284, season: 2, path: 'van', nguMet: true, nguN: 2}); d.EVENTS.find(e => e.id === 'duyetbinh').run(); flush();
    if (d.S.quests.nguDB !== 'active') errs.push('duyệt binh 1284: đường văn đã gặp anh Ngũ mà không có việc gặp ở bến');
    const npc = d.NPCS.find(n => n.id === 'ngutuong'); if (!npc || !npc.show()) errs.push('năm 1284 không thấy Phạm Ngũ Lão ở bến');
    npc.talk(); const b = [...document.querySelectorAll('#dialog .opt')][0]; b && b.click(); flush();
    if (!d.S.nguDB || !d.S.flags.nguKnows || d.S.quests.nguDB !== 'done') errs.push('nói chuyện ở bến mà chưa ghi đã gặp lại');
    if (!/bến Đông Bộ Đầu/.test(d.ngu.nguRecall())) errs.push('đêm 1285 lời báo quân tới không nhắc lần gặp ở bến');
    fresh({year: 1284, season: 2, path: 'vo', nguMet: true, flags: {nguKnows: true}}); d.EVENTS.find(e => e.id === 'duyetbinh').run(); flush();
    if (d.S.quests.nguDB) errs.push('đã gặp anh ở bãi tập 1283 mà duyệt binh vẫn giao việc gặp ở bến');
    return {errs};
  }

  window.__checks = {nguArc, midgame, career, statsV2, world, captivity, acts, combat, chains, explore, daily, reach, noDiagonal, buffalo, terrain, selfWalk, downRule, noCamping, shopLimit, prep, statTiers, lifeAll, lifePacing};
})();
