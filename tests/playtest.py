"""Chạy thử Đại Việt Một Đời bằng Playwright + Chromium.

Cách dùng:  npm test
       hoặc  npm run build:test && python3 tests/playtest.py [--runs 3] [--seed 1] [--shots DIR]

Script phục vụ bản build `dist-test/` (build với `--mode test`, có hook window.__dv
khai báo trong src/main.js) qua một HTTP server cục bộ, rồi chạy:
  1. Kiểm tra cân bằng: đến lớp (thầy đồ, võ sư) phải cho nhiều điểm hơn hẳn
     tự học, tự luyện ở nhà (Chọn việc chính). Tự học không vượt trần.
  2. Chơi hết chương một với lựa chọn ngẫu nhiên, bắt mọi lỗi pageerror.
Thoát với mã 1 nếu có lỗi hoặc kiểm tra không đạt.
"""
import argparse, functools, http.server, os, random, subprocess, sys, tempfile, threading
from playwright.sync_api import sync_playwright

ROOT = os.path.dirname(os.path.dirname(os.path.abspath(__file__)))
DIST = os.path.join(ROOT, 'dist-test')


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
CLEAR_MODALS = """() => {for(let k=0;k<50&&__dv.modalOpen;k++){
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
  if(M){ // minigame chơi ngoài bản đồ: kết thúc ngay với kết quả ngẫu nhiên
    if(M.al) D.finishClimax(['dawn','down','done'][rnd(3)]); else D.endFlood(r<.5);
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


def new_page(browser, url, errors):
    page = browser.new_page(viewport={'width': 1280, 'height': 800})
    page.on('pageerror', lambda e: errors.append(str(e)))
    page.goto(url)
    page.wait_for_function('window.__dv')
    page.evaluate("() => localStorage.removeItem('dvmd-save')")
    return page


def fresh(page, path=None):
    page.evaluate("""(path) => {const s=__dv.newState('Kiểm Thử'); s.path=path; __dv.setS(s);
      document.getElementById('modal').hidden=true; __dv.startPlay(false)}""", path)
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


def smoke(page, shots, fails):
    """Chạy thật vài giây: đi bằng phím, lụt 1270, đêm 1285. Phần vẽ minigame không được
    lượt chơi ngẫu nhiên đụng tới (nó kết thúc minigame ngay)."""
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
    S = page.evaluate("() => {const S=__dv.S; return {year:S.year, ended:!!S.ended, van:S.van, vo:S.vo, duc:S.duc, tien:S.tien, path:S.path, res:S.res && S.res.reason}}")
    S['steps'] = len(log)
    return S


def main():
    ap = argparse.ArgumentParser()
    ap.add_argument('--runs', type=int, default=3)
    ap.add_argument('--seed', type=int, default=1)
    ap.add_argument('--shots', default=None, help='thư mục lưu ảnh chụp màn hình')
    ap.add_argument('--build', action='store_true', help='build lại dist-test/ trước khi chạy')
    a = ap.parse_args()
    url = serve(a.build)
    shots = a.shots or tempfile.mkdtemp(prefix='dvmd-')
    os.makedirs(shots, exist_ok=True)
    fails, errors = [], []
    with sync_playwright() as p:
        try:
            b = p.chromium.launch()
        except Exception:  # bản Playwright khác bản Chromium cài sẵn
            exe = next((os.path.join(d, f) for d, _, fs in os.walk('/opt/pw-browsers') for f in fs
                        if f in ('chrome', 'chromium', 'chrome-headless-shell') and os.access(os.path.join(d, f), os.X_OK)), None)
            if not exe:
                raise
            b = p.chromium.launch(executable_path=exe)
        page = new_page(b, url, errors)
        print('== Cân bằng (điểm mỗi mùa: đến lớp | tự học ở nhà | giá trị sau khi tự học) ==')
        for k, (c, h, v) in balance(page, fails).items():
            print(f'  {k:28s} {c:5.2f} | {h:5.2f} | {v}')
        print('== Chạy thật: đi lại, lụt, đêm giặc ==')
        smoke(page, shots, fails)
        page.close()
        print('== Chơi ngẫu nhiên hết chương một ==')
        for i in range(a.runs):
            rng = random.Random(a.seed + i)
            page = new_page(b, url, errors)
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
