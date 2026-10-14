"""Đi tham quan game và chụp ảnh lại để người (hoặc agent người chơi thử) xem bằng mắt.

Cách dùng:  npm run build:test && python3 tests/tham_quan.py THƯ_MỤC [--phan canh,npc,sukien,dem] [--seed 1]

Ghi vào THƯ_MỤC:
  canh-<nơi>-<mùa>.png   các vùng bản đồ (làng, sông Tô Lịch, ruộng, rừng, kinh thành, cổng, đê, sông Hồng) × 4 mùa
  npc-<id>-<năm>.png      hội thoại với từng NPC lúc nhỏ (1266) và lúc lớn (1276)
  sk-<số>.png             từng khung sự kiện trong một lượt chơi hết chương (lựa chọn ngẫu nhiên có seed)
  dem-<số>.png            đêm 1285 ở vài thời điểm
  chu.jsonl               chữ của mọi hội thoại, khung sự kiện đã chụp (để soát chính tả, câu chữ)
  index.md                danh sách ảnh kèm chú thích
Lỗi JavaScript (pageerror) in ra cuối và ghi vào index.md.
"""
import argparse, json, os, random, sys
sys.path.insert(0, os.path.dirname(os.path.abspath(__file__)))
import playtest as pt
from playwright.sync_api import sync_playwright

NOI = [('lang', 43.5, 51.5, 'Làng An Phú, nhà mình'), ('song', 40, 24.5, 'Sông Tô Lịch'), ('ruong', 46, 60, 'Ruộng'),
       ('rung', 14, 46, 'Rừng phía tây'), ('kinh', 52, 12, 'Kinh thành'), ('cong', 53.5, 21.5, 'Cổng nam kinh thành'),
       ('de', 80, 23, 'Đê sông Hồng, cống Tô Lịch'), ('hong', 80, 40, 'Bãi sông Hồng'), ('chua', 23, 15, 'Chùa làng')]
MUA = ['xuan', 'ha', 'thu', 'dong']
TEXT = """() => { const m=document.querySelector('#modal'), d=document.querySelector('#dialog');
  return {modal: m && !m.hidden ? m.innerText : '', dialog: d && !d.hidden ? d.innerText : ''} }"""


def main():
    ap = argparse.ArgumentParser()
    ap.add_argument('out')
    ap.add_argument('--phan', default='canh,npc,sukien,dem')
    ap.add_argument('--seed', type=int, default=1)
    ap.add_argument('--max-sk', type=int, default=90, help='số khung sự kiện tối đa chụp')
    a = ap.parse_args()
    os.makedirs(a.out, exist_ok=True)
    phan = set(a.phan.split(','))
    idx, errors = ['# Tham quan game', ''], []
    chu = open(os.path.join(a.out, 'chu.jsonl'), 'w', encoding='utf-8')
    shot = lambda page, name, cap: (page.screenshot(path=os.path.join(a.out, name)), idx.append(f'- `{name}`: {cap}'))
    url = pt.serve()
    with sync_playwright() as p:
        b = pt.launch(p)
        page = pt.new_page(b, url, errors, a.seed)

        if 'canh' in phan:
            idx += ['', '## Cảnh', '']
            pt.fresh(page, 'nong')
            page.evaluate("() => {__dv.S.year=1276}")
            for si, mua in enumerate(MUA):
                for k, x, y, ten in NOI:
                    page.evaluate("([x,y,s]) => {const d=__dv;d.S.season=s;d.S.x=x;d.S.y=y;d.step(.016)}", [x, y, si])
                    page.wait_for_timeout(250)
                    shot(page, f'canh-{k}-{mua}.png', f'{ten}, mùa {["xuân","hạ","thu","đông"][si]}')

        if 'npc' in phan:
            idx += ['', '## Hội thoại NPC', '']
            for year in (1266, 1276):
                pt.fresh(page, 'van' if year > 1270 else None)
                ids = page.evaluate("(y) => {const d=__dv;d.S.year=y;d.S.ev=new Proxy({}, {get:()=>1});return d.NPCS.map(n=>n.id)}", year)
                for nid in ids:
                    ok = page.evaluate("""(id) => {const d=__dv,n=d.NPCS.find(n=>n.id===id);d.closeDialog();while(d.modalOpen)d.nextModal();
                      if(n.show&&!n.show())return false;const p=n.at?n.at():[n.x,n.y];d.S.x=p[0];d.S.y=p[1]+1;d.step(.016);n.talk();return true}""", nid)
                    if not ok: continue
                    page.wait_for_timeout(700)   # chữ hiện dần
                    t = page.evaluate(TEXT)
                    chu.write(json.dumps({'loai': 'npc', 'id': nid, 'nam': year, **t}, ensure_ascii=False) + '\n')
                    shot(page, f'npc-{nid}-{year}.png', f'nói chuyện với {nid}, năm {year}')
                    page.evaluate("() => {const d=__dv;d.closeDialog();while(d.modalOpen)d.nextModal()}")

        if 'sukien' in phan:
            idx += ['', '## Sự kiện trong một lượt chơi', '']
            rng = random.Random(a.seed)
            pt.fresh(page)
            n = 0
            for step in range(600):
                st = page.evaluate("() => ({ended: __dv.S && __dv.S.ended, modal: __dv.modalOpen, year: __dv.S && __dv.S.year, season: __dv.S && __dv.S.season})")
                if st['modal'] and n < a.max_sk:
                    page.wait_for_timeout(120)
                    t = page.evaluate(TEXT)
                    chu.write(json.dumps({'loai': 'sukien', 'so': n, 'nam': st['year'], 'mua': st['season'], **t}, ensure_ascii=False) + '\n')
                    shot(page, f'sk-{n:03d}.png', f'năm {st["year"]}, mùa {st["season"]}: {t["modal"][:60].splitlines()[0] if t["modal"] else ""}')
                    n += 1
                if st['ended']:
                    shot(page, 'sk-ket.png', 'màn kết chương một')
                    break
                page.evaluate(pt.STEP, rng.random())

        if 'dem' in phan:
            idx += ['', '## Đêm 1285', '']
            pt.fresh(page, 'vo')
            page.evaluate("() => {const d=__dv;d.S.year=1285;d.S.season=0;d.S.co='village';d.S.nguMet=true;d.startClimax();while(d.modalOpen)d.nextModal()}")
            for i, secs in enumerate([0, 8, 25, 60, 110]):
                page.evaluate("(t) => {const d=__dv;for(let k=0;k<t*30&&d.MG;k++){__bots.climaxTeleport(true);d.step(1/30)}}", secs - ([0, 8, 25, 60, 110][i - 1] if i else 0))
                page.wait_for_timeout(200)
                shot(page, f'dem-{i}.png', f'đêm 1285, khoảng giây thứ {secs}')
                if not page.evaluate("() => !!__dv.MG"): break

        b.close()
    chu.close()
    if errors:
        idx += ['', '## Lỗi JavaScript', ''] + [f'- {e}' for e in errors]
    with open(os.path.join(a.out, 'index.md'), 'w', encoding='utf-8') as f:
        f.write('\n'.join(idx) + '\n')
    print('Đã ghi', a.out, '·', len([l for l in idx if l.startswith('- `')]), 'ảnh ·', len(errors), 'lỗi JavaScript')
    for e in errors: print('LỖI', e)


if __name__ == '__main__':
    main()
