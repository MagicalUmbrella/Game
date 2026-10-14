"""Chạy thử Đại Việt Một Đời bằng Playwright + Chromium.

Cách dùng:  npm test
       hoặc  npm run build:test && python3 tests/playtest.py [--runs 3] [--seed 1] [--shots DIR]

Script phục vụ bản build `dist-test/` (build với `--mode test`, có hook window.__dv
khai báo trong src/main.js) qua một HTTP server cục bộ, nạp thêm tests/bots.js và
tests/checks.js vào trang, rồi chạy:
  1. Cân bằng điểm: đến lớp (thầy đồ, võ sư) phải cho nhiều điểm hơn hẳn tự học,
     tự luyện ở nhà (Chọn việc chính). Tự học không vượt trần.
  2. Cơ chế: mọi nơi cần đến đều đi tới được (BFS), không đi chéo, trâu giật mình.
  3. Độ khó: bot bấm phím thật chơi lụt 1270 và đêm 1285 với ba mức tay nghề.
  4. Chạy thật vài giây (vẽ minigame), chụp ảnh.
  5. Chơi hết chương một với lựa chọn ngẫu nhiên; minigame do bot dịch chuyển chơi
     bằng luật thật. Bắt mọi lỗi pageerror.
Math.random trong trang có seed (--seed) nên kết quả gần như lặp lại được.
Thoát với mã 1 nếu có lỗi hoặc kiểm tra không đạt.
"""
import argparse, functools, http.server, os, random, subprocess, sys, tempfile, threading
from playwright.sync_api import sync_playwright

ROOT = os.path.dirname(os.path.dirname(os.path.abspath(__file__)))
DIST = os.path.join(ROOT, 'dist-test')
HERE = os.path.dirname(os.path.abspath(__file__))
# Math.random có seed (mulberry32), cài trước khi game chạy.
SEEDED = """(() => {let s=%d>>>0; Math.random=()=>{s=(s+0x6D2B79F5)|0; let t=Math.imul(s^(s>>>15),1|s);
  t=(t+Math.imul(t^(t>>>7),61|t))^t; return ((t^(t>>>14))>>>0)/4294967296}})();"""


def serve(build=False):
    """Phục vụ dist-test/ trên một cổng trống, trả về URL."""
    if build or not os.path.exists(os.path.join(DIST, 'index.html')):
        subprocess.run(['npm', 'run', 'build:test'], cwd=ROOT, check=True, stdout=subprocess.DEVNULL)
    class Quiet(http.server.SimpleHTTPRequestHandler):
        def log_message(self, *a):
            pass
    handler = functools.partial(Quiet, directory=DIST)
    srv = http.server.ThreadingHTTPServer(('127.0.0.1', 0), handler)
    threading.Thread(target=srv.serve_forever, daemon=True).start()
    return f'http://127.0.0.1:{srv.server_port}/'


# Bấm hết modal đang mở bằng lựa chọn đầu tiên còn bấm được.
CLEAR_MODALS = """() => {for(let k=0;k<50&&__dv.modalOpen&&!(__dv.S&&__dv.S.ended);k++){
  const b=[...document.querySelectorAll('#modal .opt')].find(x=>!x.disabled); if(!b)break; b.click()}}"""

# Một bước chơi ngẫu nhiên. Trả về trạng thái để Python ghi log.
STEP = """(r) => {
  const D=__dv, S=D.S, rnd=n=>Math.floor(r*n);
  if(S && S.ended) return 'ended';
  const M=D.MG;
  if(M && M.type==='timing'){ if(M.round<6) D.tmHit(); return 'train'; }
  if(D.modalOpen){
    const inp=document.querySelector('#modal input'); if(inp && !inp.value) inp.value='Kiểm Thử';
    const bs=[...document.querySelectorAll('#modal .opt')].filter(b=>!b.disabled);
    if(bs.length) bs[rnd(bs.length)].click(); return 'modal';
  }
  if(M){ // lụt, đêm giặc: bot dịch chuyển chơi bằng luật thật, lúc cố hết sức, lúc bỏ dở
    if(M.type==='climax') __bots.climaxTeleport(r<.5); else __bots.floodTeleport(r<.6);
    return 'mg';
  }
  if(D.dialogOpen){
    const bs=[...document.querySelectorAll('#dialog .opt')].filter(b=>!b.disabled);
    bs[rnd(bs.length)].click(); return 'dialog';
  }
  const a=['ff','ff','ff','thay','vo','sleep'][rnd(6)];
  if(a==='ff') D.chooseFocus(); else if(a==='thay') D.talkThay(); else if(a==='vo') D.talkVo(); else D.advance(1);
  return a;
}"""


def launch(p):
    try:
        return p.chromium.launch()
    except Exception:  # bản Playwright khác bản Chromium cài sẵn
        exe = next((os.path.join(d, f) for d, _, fs in os.walk('/opt/pw-browsers') for f in fs
                    if f in ('chrome', 'chromium', 'chrome-headless-shell') and os.access(os.path.join(d, f), os.X_OK)), None)
        if not exe:
            raise
        return p.chromium.launch(executable_path=exe)


def new_page(browser, url, errors, seed=1):
    page = browser.new_page(viewport={'width': 1280, 'height': 800})
    page.on('pageerror', lambda e: errors.append(str(e)))
    page.add_init_script(SEEDED % seed)
    page.add_init_script(path=os.path.join(HERE, 'bots.js'))
    page.add_init_script(path=os.path.join(HERE, 'checks.js'))
    page.goto(url)
    page.wait_for_function('window.__dv && window.__bots && window.__checks')
    page.evaluate("() => localStorage.removeItem('dvmd-save')")
    return page


def fresh(page, path=None):
    page.evaluate("""(path) => {const D=__dv; while(D.modalOpen) D.nextModal(); if(D.MG) D.setMG(null);
      const s=D.newState('Kiểm Thử'); s.path=path; D.setS(s); D.startPlay(false)}""", path)
    page.evaluate(CLEAR_MODALS)


def balance(page, fails):
    """So sánh điểm mỗi mùa: đến lớp dùng hết Sức vs tự học ở nhà."""
    out = {}
    for path in (None, 'van', 'vo'):
        for k, talk in (('van', 'talkThay'), ('vo', 'talkVo')):
            # Đến lớp: mỗi mùa dùng hết 4 Sức, rồi ngủ.
            fresh(page, path)
            page.evaluate("() => {__dv.S.year=1267; __dv.S.ev=new Proxy({}, {get:()=>1})}")
            cls = page.evaluate(f"""() => {{const D=__dv; let n=0, v0=D.S.{k};
              for(let s=0;s<8;s++){{ for(let i=0;i<4;i++){{ D.{talk}(); D.pick(0) }} D.advance(1); n++ }}
              return (D.S.{k}-v0)/n }}""")
            # Tự học: chọn việc chính, 8 mùa (bỏ qua sự kiện).
            fresh(page, path)
            page.evaluate("() => {__dv.S.year=1267; __dv.S.ev=new Proxy({}, {get:()=>1})}")
            home = page.evaluate(f"""() => {{const D=__dv, v0=D.S.{k}; let n=0;
              const y0=D.S.year*4+D.S.season; D.fastForward('{k}');
              n=D.S.year*4+D.S.season-y0; return [(D.S.{k}-v0)/n, D.S.{k}, n] }}""")
            name = f"{path or 'chưa chọn đường'} · {k}"
            out[name] = (cls, home[0], home[1])
            if cls < 3 * home[0]:
                fails.append(f'cân bằng {name}: đến lớp {cls:.2f}/mùa, tự học {home[0]:.2f}/mùa (cần đến lớp ≥ 3×)')
            cap = 45 if path == k else 25
            if home[1] > cap:
                fails.append(f'cân bằng {name}: tự học vượt trần {cap} ({home[1]})')
    return out


def mechanics(page, fails):
    """Đi tới được mọi nơi, không đi chéo, trâu giật mình."""
    for name, fn in (('đi tới được (BFS)', 'reach'), ('không đi chéo', 'noDiagonal'), ('trâu giật mình', 'buffalo'),
                     ('đường văn: dân tự vào rừng', 'selfWalk'), ('ngã xuống: ai bị bắt, ai kẹt lại', 'downRule'),
                     ('giặc không đứng dàn hàng ở bìa rừng', 'noCamping')):
        fresh(page)
        r = page.evaluate(f'() => __checks.{fn}()')
        extra = (f" ({r['n']} điểm)" if 'n' in r else f" ({r['safe']}/{r['total']} vào tới rừng)" if 'safe' in r
                 else f" (sát bìa rừng {100 * r['near']:.0f}% thời gian, tốc độ TB {r['speed']:.1f} ô/giây)" if 'near' in r else '')
        print(f"  {name}{extra}: {'đạt' if not r['errs'] else 'LỖI'}")
        fails.extend(f'{name}: {e}' for e in r['errs'])
    for dredged in (True, False):
        name = 'đêm 1285, giặc đi đúng địa hình (' + ('đã vét sông' if dredged else 'chưa vét sông') + ')'
        fresh(page)
        r = page.evaluate('(x) => __checks.terrain(x)', dredged)
        print(f"  {name}: {'đạt' if not r['errs'] else 'LỖI'} (lội sông {r['wade']}, ở bờ nam {r['south']} trên {r['samples']} mẫu)")
        fails.extend(f'{name}: {e}' for e in r['errs'])


def teleport_checks(page, fails):
    """Bot dịch chuyển (dùng trong lượt chơi ngẫu nhiên) cho ra đúng kết quả, và kết quả hiện trong biên niên."""
    for name, start, bot, want in (
            ('lụt, cố hết sức', "S.year=1270;S.season=2;D.startFlood()", '__bots.floodTeleport(true)', "S.flags.de==='saved'"),
            ('lụt, bỏ dở', "S.year=1270;S.season=2;D.startFlood()", '__bots.floodTeleport(false)', "S.flags.de==='lost'"),
            ('đêm 1285, cứu đủ', "S.year=1285;S.season=0;S.flags.de='saved';D.startClimax()", '__bots.climaxTeleport(true)', "S.res.reason==='done'"),
            ('đêm 1285, bỏ mặc mọi người', "S.year=1285;S.season=0;S.flags.de='lost';D.startClimax()", '__bots.climaxTeleport(false, 1)', "S.res.reason==='dawn'&&S.res.saved.length===0&&document.querySelector('#modal h2').textContent==='Bình minh'")):
        fresh(page)
        r = page.evaluate(f"""() => {{const D=__dv,S=D.S; {start}; {bot}; const ok={want};
          let chron=null; if(S.res){{ D.mpick(0); chron=document.querySelector('#modal').innerText }}
          return {{ok, de:S.flags.de, res:S.res&&S.res.reason, chron}}}}""")
        ok = r['ok']
        if r['chron'] is not None:
            # biên niên phải có dòng về trận lụt và người được cứu
            line = {'saved': 'đắp', 'lost': 'vỡ'}[r['de']]
            if 'Biên niên' not in r['chron'] and 'BIÊN NIÊN' not in r['chron'].upper():
                ok = False; fails.append(f'{name}: màn kết không có phần Biên niên đời bạn')
            elif '1270' not in r['chron']:
                ok = False; fails.append(f'{name}: biên niên không nhắc trận lụt 1270')
        print(f"  {name}: {'đạt' if ok else 'LỖI'} (đê: {r['de']}, đêm 1285: {r['res']})")
        if not r['ok']:
            fails.append(f"{name}: kết quả không như mong đợi (đê: {r['de']}, đêm 1285: {r['res']})")


SKILLS = ('giỏi', 'khá', 'kém')


def flood_table(page, fails, n):
    """Bot bấm phím chơi lụt 1270, n lượt mỗi ô. Người chơi 12 tuổi; có hoặc không có Cò đắp giúp."""
    print(f"  {'tay nghề':9s} {'Cò giúp':8s} {'giữ được đê':>11s} {'mực nước TB':>11s} {'thời gian TB':>12s}")
    out = {}
    for sk in SKILLS:
        for co in (0, 3):
            rs = []
            for _ in range(n):
                fresh(page)
                rs.append(page.evaluate("""([sk,co]) => {const D=__dv; D.S.year=1270; D.S.season=2; D.S.rel.co=co;
                  D.startFlood(); return __bots.floodBot(sk)}""", [sk, co]))
            win = sum(r['win'] for r in rs)
            out[(sk, co)] = win / n
            print(f"  {sk:9s} {'có' if co else 'không':8s} {win:>7d}/{n:<3d} {sum(r['level'] for r in rs) / n:11.2f} {sum(r['t'] for r in rs) / n:11.1f}s")
    if out[('giỏi', 0)] < 1:
        fails.append('lụt 1270: bot giỏi tự làm một mình mà có lượt không giữ được đê (quá khó?)')
    return out


# Các kiểu nhân vật cho đêm 1285 (mã JS chạy trên S trước startClimax). Mọi kiểu đều có cha, vợ Thảo, bé Sen.
CLIMAX_BUILDS = {
    'võ, có Cò và trai làng': "S.path='vo';S.co='village';S.rel.co=4;S.flags.de='saved';S.flags.lang=6;S.flags.tolich='done';",
    'võ, một mình': "S.path='vo';S.co='army';S.flags.tolich='done';",
    'văn đỗ (Văn 55), có Cò': "S.path='van';S.van=55;S.dothi=true;S.co='village';S.rel.co=4;S.flags.tolich='done';",
    'văn đỗ (Văn 55), một mình': "S.path='van';S.van=55;S.dothi=true;S.co='army';S.flags.tolich='done';",
    'nông, có Cò, chưa vét sông': "S.path='nong';S.co='village';S.rel.co=2;S.flags.tolich='skip';",
}
REASON = {'done': 'đủ người', 'dawn': 'trời sáng', 'down': 'ngã xuống'}


def climax_table(page, fails, n):
    """Bot bấm phím chơi đêm 1285 với vài kiểu nhân vật, n lượt mỗi ô."""
    print(f"  {'nhân vật':30s} {'tay nghề':9s} {'cứu TB':>7s} {'thóc TB':>7s} {'ngã xuống':>9s}  kết thúc")
    out = {}
    for name, setup in CLIMAX_BUILDS.items():
        for sk in SKILLS:
            rs = []
            for _ in range(n):
                fresh(page)
                rs.append(page.evaluate("""([setup,sk]) => {const D=__dv,S=D.S; S.year=1285; S.season=0; S.cha=true;
                  S.ev.thao=1; S.thao='wife'; S.child=true; new Function('S',setup)(S);
                  D.startClimax(); return __bots.climaxBot(sk)}""", [setup, sk]))
            total = rs[0]['total']
            saved = sum(r['saved'] for r in rs) / n
            down = sum(r['reason'] == 'down' for r in rs)
            ends = ', '.join(f"{REASON.get(k, k)} {sum(r['reason'] == k for r in rs)}" for k in ('done', 'dawn', 'down') if any(r['reason'] == k for r in rs))
            out[(name, sk)] = (saved, total, down)
            print(f"  {name:30s} {sk:9s} {saved:4.1f}/{total:<2d} {sum(r['thoc'] for r in rs) / n:4.1f}/{rs[0]['thocT']:<2d} {down:>5d}/{n:<3d}  {ends}")
    saved, total, down = out[('võ, có Cò và trai làng', 'giỏi')]
    if down or saved < total - 1:
        fails.append(f"đêm 1285: nhân vật mạnh nhất, bot giỏi mà chỉ cứu TB {saved:.1f}/{total}, ngã xuống {down} lần (quá khó?)")
    return out


def smoke(page, shots, fails):
    """Chạy thật vài giây: đi bằng phím, lụt 1270, đêm 1285. Bot ở trên bỏ qua phần vẽ,
    nên ở đây cho game chạy theo thời gian thật và chụp ảnh."""
    fresh(page)
    x0 = page.evaluate('() => __dv.S.x')
    page.keyboard.down('d'); page.wait_for_timeout(600); page.keyboard.up('d')
    if page.evaluate('() => __dv.S.x') <= x0:
        fails.append('bấm D nhưng nhân vật không đi sang phải')
    page.screenshot(path=os.path.join(shots, 'smoke-walk.png'))
    for name, setup, start in (('flood', '__dv.S.year=1270;__dv.S.season=2', '__dv.startFlood()'),
                               ('climax', '__dv.S.year=1285;__dv.S.season=0;__dv.S.path="vo"', '__dv.startClimax()')):
        fresh(page)
        page.evaluate(f'() => {{{setup}; {start}}}')
        page.evaluate(CLEAR_MODALS)
        if not page.evaluate('() => !!__dv.MG'):
            fails.append(f'{name}: minigame không bắt đầu')
            continue
        for k in 'wasd':
            page.keyboard.down(k); page.wait_for_timeout(500); page.keyboard.up(k)
        page.wait_for_timeout(1500)
        page.screenshot(path=os.path.join(shots, f'smoke-{name}.png'))
    print('  xong, ảnh smoke-*.png')


def playthrough(page, rng):
    page.evaluate(CLEAR_MODALS)  # màn tiêu đề → bắt đầu → đặt tên → thôi nôi
    page.evaluate(STEP, rng.random())
    log = []
    for step in range(4000):
        st = page.evaluate(STEP, rng.random())
        log.append(st)
        if st == 'ended':
            break
        if st == 'train':
            page.wait_for_timeout(rng.randint(5, 40))
    S = page.evaluate("""() => {const S=__dv.S; return {year:S.year, ended:!!S.ended, van:S.van, vo:S.vo, duc:S.duc, tien:S.tien,
      path:S.path, de:S.flags.de, res:S.res && S.res.reason, saved:S.res && S.res.saved.length, lost:S.res && S.res.lost.length}}""")
    S['steps'] = len(log)
    return S


def main():
    ap = argparse.ArgumentParser()
    ap.add_argument('--runs', type=int, default=3)
    ap.add_argument('--seed', type=int, default=1)
    ap.add_argument('--shots', default=None, help='thư mục lưu ảnh chụp màn hình')
    ap.add_argument('--build', action='store_true', help='build lại dist-test/ trước khi chạy')
    ap.add_argument('--no-bots', action='store_true', help='bỏ phần đo độ khó bằng bot bấm phím (nhanh hơn)')
    ap.add_argument('--bot-runs', type=int, default=4, help='số lượt bot chơi mỗi ô trong bảng độ khó')
    a = ap.parse_args()
    url = serve(a.build)
    shots = a.shots or tempfile.mkdtemp(prefix='dvmd-')
    os.makedirs(shots, exist_ok=True)
    fails, errors = [], []
    with sync_playwright() as p:
        b = launch(p)
        page = new_page(b, url, errors, a.seed)
        print('== Cân bằng (điểm mỗi mùa: đến lớp | tự học ở nhà | giá trị sau khi tự học) ==')
        for k, (c, h, v) in balance(page, fails).items():
            print(f'  {k:28s} {c:5.2f} | {h:5.2f} | {v}')
        print('== Cơ chế ==')
        mechanics(page, fails)
        print('== Bot dịch chuyển (dùng trong lượt chơi ngẫu nhiên) ==')
        teleport_checks(page, fails)
        if not a.no_bots:
            print('== Độ khó lụt 1270 (bot bấm phím) ==')
            flood_table(page, fails, a.bot_runs)
            print('== Độ khó đêm 1285 (bot bấm phím) ==')
            climax_table(page, fails, a.bot_runs)
        print('== Chạy thật: đi lại, lụt, đêm giặc ==')
        smoke(page, shots, fails)
        page.close()
        print('== Chơi ngẫu nhiên hết chương một ==')
        for i in range(a.runs):
            rng = random.Random(a.seed + i)
            page = new_page(b, url, errors, a.seed + i)
            r = playthrough(page, rng)
            shot = os.path.join(shots, f'run{i + 1}.png')
            page.screenshot(path=shot)
            print(f'  lượt {i + 1}: {r}  ảnh: {shot}')
            if not r['ended']:
                fails.append(f'lượt {i + 1} không chơi hết chương (dừng ở năm {r["year"]})')
            page.close()
        b.close()
    for e in errors:
        fails.append('pageerror: ' + e)
    print('== Kết quả ==')
    if fails:
        for f in fails:
            print('  LỖI', f)
        sys.exit(1)
    print('  Tất cả đạt.')


if __name__ == '__main__':
    main()
