"""In bảng mọi sprite người (mọi kiểu nhân vật, 4 hướng, 3 khung bước) ra ảnh PNG để xem đồ họa.

Cách dùng:  npm run build:test && python3 tests/sprite_sheet.py [ảnh.png] [--scale 4] [--bg cỏ|đêm]
"""
import argparse, os, sys
sys.path.insert(0, os.path.dirname(os.path.abspath(__file__)))
import playtest as pt
from playwright.sync_api import sync_playwright

# Danh sách nhân vật: đọc từ src/assets/nguoi.json (do tools/ve_nguoi.py sinh ra).
import json
with open(os.path.join(os.path.dirname(os.path.abspath(__file__)), '..', 'src', 'assets', 'nguoi.json'), encoding='utf-8') as _f:
    LOOKS = [(v['name'], {'id': k}) for k, v in json.load(_f)['people'].items()]

DRAW = """([looks, scale, bg]) => {
  const dirs = ['down', 'left', 'right', 'up'], frames = [0, 1, 2, 'a0', 'a1'];
  const cw = 34 * scale, ch = 42 * scale, labelH = 18;
  const c = document.createElement('canvas');
  c.width = cw * dirs.length * frames.length + 140; c.height = (ch + labelH) * looks.length + 10;
  const g = c.getContext('2d'); g.imageSmoothingEnabled = false;
  g.fillStyle = bg === 'đêm' ? '#1a2230' : '#6f9a4f'; g.fillRect(0, 0, c.width, c.height);
  g.font = '600 13px system-ui'; g.textBaseline = 'middle';
  looks.forEach(([name, look], r) => {
    const y0 = r * (ch + labelH) + 6;
    g.fillStyle = '#fff'; g.fillText(name, 6, y0 + ch / 2);
    dirs.forEach((d, i) => frames.forEach((f, j) => {
      const sp = __dv.personSprite(look, d, f), x = 140 + (i * frames.length + j) * cw;
      g.drawImage(sp, x + (cw - sp.width * scale) / 2, y0 + ch - sp.height * scale, sp.width * scale, sp.height * scale);
    }));
  });
  return c.toDataURL('image/png');
}"""


def main():
    ap = argparse.ArgumentParser()
    ap.add_argument('out', nargs='?', default='sprites.png')
    ap.add_argument('--scale', type=int, default=4)
    ap.add_argument('--bg', default='cỏ')
    ap.add_argument('--only', default='', help='chỉ in các nhân vật có tên chứa chuỗi này, cách nhau dấu phẩy')
    a = ap.parse_args()
    url = pt.serve()
    errors = []
    with sync_playwright() as p:
        b = pt.launch(p)
        page = pt.new_page(b, url, errors)
        keys = [k.strip() for k in a.only.split(',') if k.strip()]
        looks = [l for l in LOOKS if not keys or any(k in l[0] for k in keys)]
        data = page.evaluate(DRAW, [looks, a.scale, a.bg])
        import base64
        open(a.out, 'wb').write(base64.b64decode(data.split(',')[1]))
        b.close()
    print('Đã lưu', a.out, *(['lỗi:', errors] if errors else []))


if __name__ == '__main__':
    main()
