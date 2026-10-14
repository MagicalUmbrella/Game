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

  /* Ngã xuống khi không có ai đỡ: người đang đi theo bị bắt; người chưa dẫn, người đang tự đi
     thì kẹt lại trong làng, không bị bắt. */
  function downRule() {
    const d = D(), S = d.S, errs = [];
    Object.assign(S, {year: 1285, season: 0, path: 'vo', co: 'army', cha: true, thao: 'wife', child: true});
    S.ev.thao = 1; S.flags.de = 'lost'; S.duc = 0;
    d.startClimax();
    const M = d.MG, [a, b, c] = M.v;
    if (M.al.length) errs.push('kiểu nhân vật thử không được có đồng minh');
    a.st = 'follow'; b.st = 'self'; b.dest = [a.x, a.y]; // c vẫn 'wait'
    M.hp = 0; d.step(DT);
    const r = S.res || {};
    if (r.reason !== 'down') errs.push(`hết máu mà không kết thúc kiểu ngã xuống (${r.reason})`);
    if (a.st !== 'lost') errs.push(`người đang đi theo (${a.name}) phải bị bắt, thực tế ${a.st}`);
    if (b.st !== 'left') errs.push(`người đang tự đi (${b.name}) phải kẹt lại trong làng, thực tế ${b.st}`);
    if (c.st !== 'left') errs.push(`người chưa dẫn (${c.name}) phải kẹt lại trong làng, thực tế ${c.st}`);
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
    S.ev.thao = 1; S.duc = 40; S.flags.de = 'saved'; S.quests.trau = 'done';
    d.talkLy(); if (choose('dựng lán')) errs.push('năm 1281 (chưa có tin Toa Đô) đã góp được tiền dựng lán'); closeDialog();
    S.year = 1283;
    for (const [talk, text] of [['talkLy', 'dựng lán'], ['talkRen', 'Rèn giáo'], ['talkCha', 'Cất bớt thóc']]) {
      d[talk](); if (!choose(text)) errs.push(`năm 1283 không làm được việc "${text}" (${talk})`); closeDialog();
    }
    if (S.tien !== 100 - 12 - 10 - 6) errs.push(`tiền sau ba việc là ${S.tien}, mong ${100 - 28}`);
    if (!S.flags.lan || !S.flags.giao || !S.flags.catThoc) errs.push('thiếu cờ sau khi làm đủ ba việc');
    S.year = 1285; S.season = 0;
    d.startClimax();
    const M = d.MG;
    for (const id of ['batu', 'sen']) { const p = M.v.find(x => x.id === id); if (!p || p.st !== 'safe') errs.push(`${id} chưa ở sẵn trong rừng`); }
    if (M.sk.filter(s => s.st === 'safe').length !== 1) errs.push('không có đúng một bao thóc giấu sẵn');
    const trai = M.al.filter(a => a.id.startsWith('trai'));
    if (!trai.length) errs.push('kiểu nhân vật thử phải có trai làng');
    if (trai.some(a => a.dmg !== 2 || !a.look.spear)) errs.push('trai làng chưa có giáo');
    window.__bots.climaxTeleport(true);
    d.mpick(0); // Nhìn lại cuộc đời
    const chron = document.querySelector('#modal').innerText;
    for (const t of ['dựng lán', 'rèn giáo', 'cất bớt thóc']) if (!chron.includes(t)) errs.push(`biên niên thiếu dòng "${t}"`);
    return {errs};
  }

  /* Mốc chỉ số: Đức quyết định số trai làng, Võ thêm máu và sát thương cho mọi đường; phím C mở bảng chỉ số. */
  function statTiers() {
    const d = D(), S = d.S, errs = [];
    const night = (setup) => {
      d.setS(Object.assign(d.newState('Thử'), {year: 1285, season: 0, path: 'van', co: 'army', quests: {trau: 'done'}}));
      Object.assign(d.S, setup); d.startClimax();
      const M = d.MG, r = {trai: M.al.filter(a => a.id.startsWith('trai')).length, hp: M.maxhp};
      d.setMG(null); document.body.classList.remove('mg'); return r;
    };
    for (const [duc, want] of [[0, 0], [19, 0], [20, 1], [40, 2], [60, 3], [100, 3]]) {
      const r = night({duc});
      if (r.trai !== want) errs.push(`Đức ${duc}: ${r.trai} trai làng, mong ${want}`);
    }
    if (night({duc: 60, path: 'nong', flags: {de: 'saved'}}).trai !== 4) errs.push('Đức 60 + giữ đê + đường nông phải ra 4 trai làng (tối đa)');
    if (night({duc: 40, flags: {dh: 'hoa'}}).trai !== 1) errs.push('nói "hòa" ở Diên Hồng phải bớt một trai làng');
    for (const [vo, want] of [[0, 4], [25, 5], [74, 5], [75, 6]]) {
      const r = night({vo});
      if (r.hp !== want) errs.push(`Võ ${vo} (đường văn): ${r.hp} máu, mong ${want}`);
    }
    // phím C
    d.setS(d.newState('Thử')); d.startPlay(false); while (d.modalOpen) d.nextModal();
    S.duc = 0;
    window.dispatchEvent(new KeyboardEvent('keydown', {key: 'c'})); window.dispatchEvent(new KeyboardEvent('keyup', {key: 'c'}));
    const txt = d.modalOpen ? document.querySelector('#modal').innerText : '';
    if (!/Bảng chỉ số/i.test(txt)) errs.push('bấm C không mở bảng chỉ số');
    else for (const t of ['Văn', 'Võ', 'Đức', 'trai làng']) if (!txt.includes(t)) errs.push(`bảng chỉ số thiếu "${t}"`);
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
      const v0 = d.S[stat]; open();
      if (!d.MG || d.MG.type !== 'daily') { errs.push(`${name}: không mở màn chơi`); break; }
      window.__bots.dailyAuto(lv); d.dailyFlush();
      const got = d.S[stat] - v0; (out[name] ||= {})[lv] = got;
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

  window.__checks = {daily, reach, noDiagonal, buffalo, terrain, selfWalk, downRule, noCamping, shopLimit, prep, statTiers, lifeAll, lifePacing};
})();
