#!/usr/bin/env python3
"""Vẽ toàn bộ sprite người của game ra một tấm ảnh: src/assets/nguoi.png (+ nguoi.json).

Kiểu vẽ theo mẫu chủ dự án gửi: pixel thô, đầu to, viền đen dày, màu tươi phẳng, mắt vuông 2×2.
Mỗi nhân vật ghép từ các mẫu điểm ảnh viết bằng chữ (mỗi chữ là một màu, '.' là trong suốt):
tóc hoặc mũ nón, mặt, râu, thân áo, chân, vũ khí. Viền đen thêm tự động quanh hình.

Ảnh ra là một lưới ô 32×40: mỗi hàng một nhân vật, mỗi cột một khung:
  0–2  đi xuống (đứng, bước trái, bước phải)    3–5  đi sang trái    6–8  đi lên
  9–10 chém xuống (vung lên, chém)              11–12 chém sang trái  13–14 chém lên
Hướng phải là ảnh lật của hướng trái (game tự lật). Chân nhân vật chạm điểm (16, 37) của ô.

Cách dùng:  python3 tools/ve_nguoi.py            (ghi đè src/assets/nguoi.png và nguoi.json)
            python3 tools/ve_nguoi.py --xem a.png --to 6   (thêm ảnh xem trước phóng to, có tên)
Có thể sửa thẳng nguoi.png bằng Aseprite, Piskel… nhưng chạy lại script này sẽ ghi đè.
"""
import argparse, json, os
from PIL import Image, ImageDraw, ImageFont

CW, CH, AX, AY = 32, 40, 16, 37        # ô và điểm neo (chân)
X0 = 9                                 # cột trong ô của cột 0 trong mẫu (mẫu rộng 14)
DIRS = ['down', 'left', 'up']
OUT = '#1a1210'                        # màu viền

# ---------------------------------------------------------------- bảng màu chung
BASE = dict(
    S='#f3bf96', s='#d99169', b='#ee8f7c', K='#1a1210', m='#b9473a', u='#e3b190', w='#ffffff',
    H='#2b2226', h='#54434b', G='#140f11',                 # tóc đen
    A='#f1e6c8', a='#c8b48e',                               # viền áo, áo lót trắng
    X='#d0473a',                                            # yếm đỏ
    B='#7a3a2a', q='#4e2418', e='#d99169',
    P='#3e3430', p='#29211e', O='#3a2a22', o='#22180f',
    T='#2a2427', U='#4a4045', t='#141012',                  # khăn, mũ (mặc định đen)
    D='#3a2418', d='#24150d',                               # râu
    J='#2b2526', j='#1a1617',                               # váy
    F='#7a5a3c', f='#4e3826',                               # lông thú
    M='#8a94a0', N='#dfe5ea', n='#555d68',                  # kim loại
    Y='#e9b93a', y='#a87d1e', R='#d63c2c', r='#8f2419',
    W='#a8743e', V='#6a4422', Z='#6a4a32', z='#45301f',
)
GREY = dict(H='#c9c4bd', h='#f2efea', G='#8f8a84', D='#e9e5df', d='#b5afa7')
WHITE = dict(H='#e9e6e0', h='#ffffff', G='#a9a49c', D='#f4f1ec', d='#c3bdb4')


def cloth(c, k='C'):
    """Ba tông cho một màu áo: sáng, giữa, tối (chữ hoa sáng = k.lower()+'L'…)."""
    def sh(hexc, f):
        r, g, b = (int(hexc[i:i + 2], 16) for i in (1, 3, 5))
        if f > 0: r, g, b = (v + (255 - v) * f for v in (r, g, b))
        else: r, g, b = (v * (1 + f) for v in (r, g, b))
        return '#%02x%02x%02x' % tuple(max(0, min(255, round(v))) for v in (r, g, b))
    return {'C': c, 'L': sh(c, .22), 'c': sh(c, -.25), 'k': sh(c, -.45)} if k == 'C' else {k: c}


def shade(hexc, f):
    return cloth(hexc)['L' if f > 0 else 'c'] if abs(f) in (.22, .25) else cloth(hexc)['C']

# ---------------------------------------------------------------- mẫu: (hàng, chuỗi, lệch cột)
def T(*rows, y=0, x=0):
    return [(y + i, r, x) for i, r in enumerate(rows)]

FACE = {  # mặt người lớn, hàng 5–9
    'down': T('.sSKKSSSSKKSs.', '.sSKKSSSSKKSs.', '..SSSSSSSSSS..', '..SSSSmmSSSS..', '...SSSSSSSS...', y=5),
    'left': T('.SKKSSSsseHG..', 'SSKKSSSsseHG..', '.SSSSSSSSHG...', '.SmSSSSSSG....', '..SSSSSSs.....', y=5),
    'up': [],
}
FACE_KID = {
    'down': T('.sSKKSSSSKKSs.', '.sSKKSSSSKKSs.', '..SbSSSSSSbS..', '..SSSSmmSSSS..', '...SSSSSSSS...', y=5),
    'left': T('.SKKSSSSseS...', 'SSKKSSSSseS...', '.SbSSSSSSSS...', '.SmSSSSSSSs...', '..SSSSSSss....', y=5),
    'up': [],
}
FACE_W = {  # đàn bà: má hồng, môi đỏ, tóc buông hai bên
    'down': T('.HSKKSSSSKKSG.', '.HSKKSSSSKKSG.', '.HSbSSSSSSbSG.', '.HGSSSmmSSSGG.', '.GG.SSSSSS.GG.', '.GG........GG.', y=5),
    'left': T('.SKKSSSSHHHG..', 'SSKKSSSSsHHG..', '.SbSSSSSsHHG..', '.SmSSSSSsHG...', '..SSSSSssHG...', '.......GHG....', y=5),
    'up': [],
}

HAIR = {
    'knot': {  # búi tó
        'down': T('......HH......', '.....HhHG.....', '...HHHHHHHG...', '..HHhhHHHHHG..', '..HhHHHHHHHG..', '..HHSSSSSSHG..', '..HSSSSSSSSG..', y=-2),
        'left': T('........HH....', '.......HhHG...', '....HHHHHHHG..', '...HHhhHHHHHG.', '..HHhHHHHHHHG.', '..SSSSHHHHHHG.', '.SSSSSSSHHHHG.', y=-2),
        'up': T('......HH......', '.....HhHG.....', '...HHHHHHHG...', '..HHhhHHHHHG..', '..HhHHHHHHHG..', '..HHHHHHHHHG..', '..HHHHHHHHHG..',
                '.sHHHHHHHHHGs.', '.sHHHHHHHHHGs.', '..GHHHHHHHGG..', '...GGGGGGGG...', '....SSSSSS....', y=-2),
    },
    'spiky': {  # tóc ngắn dựng (Cò)
        'down': T('...H.H.HH.....', '..HHHHHHHHG...', '.HHhhHHHHHHG..', '..HhHHHHHHHGG.', '..HHHHHHHHHG..', '..HSHSSSHSHG..', '..HSSSSSSSSG..', y=-2),
        'left': T('....H.H.HH....', '...HHHHHHHHG..', '..HhhHHHHHHHGG', '..HhHHHHHHHHG.', '..HHHHHHHHHHG.', '..SHSSHHHHHHG.', '.SSSSSSSHHHHG.', y=-2),
        'up': T('...H.H.HH.....', '..HHHHHHHHG...', '.HHhhHHHHHHG..', '..HhHHHHHHHGG.', '..HHHHHHHHHG..', '..HHHHHHHHHG..', '..HHHHHHHHHG..',
                '.sHHHHHHHHHGs.', '.sHHHHHHHHHGs.', '..GHHHHHHHGG..', '...GGGGGGGG...', '....SSSSSS....', y=-2),
    },
    'kid': {  # trẻ con để chỏm
        'down': T('......HH......', '....uuHhuu....', '..uuuuuuuuuu..', '..uuuuuuuuuu..', '..SSSSSSSSSS..', '..SSSSSSSSSS..', y=-1),
        'left': T('........HH....', '.....uuuHhu...', '...uuuuuuuuu..', '..uuuuuuuuuu..', '..SSSSSSSSSS..', '.SSSSSSSSSSS..', y=-1),
        'up': T('......HH......', '....uuHhuu....', '..uuuuuuuuuu..', '..uuuuuuuuuu..', '..SSSSSSSSSS..', '..SSSSSSSSSS..', '.sSSSSSSSSSSs.',
                '.sSSSSSSSSSSs.', '..SSSSSSSSSS..', '..sSSSSSSSSs..', '...ssssssss...', y=-1),
    },
    'kid2': {  # bé gái: hai chỏm trái đào
        'down': T('..HH......HH..', '..HhuuuuuuHG..', '..uuuuuuuuuu..', '..uuuuuuuuuu..', '..SSSSSSSSSS..', '..SSSSSSSSSS..', y=-1),
        'left': T('....HH....HH..', '....Hhuuuuu...', '...uuuuuuuuu..', '..uuuuuuuuuu..', '..SSSSSSSSSS..', '.SSSSSSSSSSS..', y=-1),
        'up': T('..HH......HH..', '..HhuuuuuuHG..', '..uuuuuuuuuu..', '..uuuuuuuuuu..', '..SSSSSSSSSS..', '..SSSSSSSSSS..', '.sSSSSSSSSSSs.',
                '.sSSSSSSSSSSs.', '..SSSSSSSSSS..', '..sSSSSSSSSs..', '...ssssssss...', y=-1),
    },
    'bald': {  # sư: đầu cạo trơn
        'down': T('....uuuuuu....', '..uuuuuuuuuu..', '..uuuuuuuuuu..', '..SSSSSSSSSS..', '..SSSSSSSSSS..', y=0),
        'left': T('....uuuuuu....', '...uuuuuuuuu..', '..uuuuuuuuuu..', '..SSSSSSSSSS..', '.SSSSSSSSSSS..', y=0),
        'up': T('....uuuuuu....', '..uuuuuuuuuu..', '..uuuuuuuuuu..', '..SSSSSSSSSS..', '..SSSSSSSSSS..', '.sSSSSSSSSSSs.',
                '.sSSSSSSSSSSs.', '..SSSSSSSSSS..', '..sSSSSSSSSs..', '...ssssssss...', y=0),
    },
    'bun': {  # đàn bà: búi tóc sau đỉnh, rẽ ngôi giữa
        'down': T('.....HHHH.....', '....HhHHHG....', '.....GGGG.....', '...HHHHHHHG...', '..HHhHHHHHHG..', '..HhHHGGHHHG..', '..HHHSSSSHHG..', '..HHSSSSSSHG..', y=-3),
        'left': T('.......HHHH...', '......HhHHHG..', '.......GGGG...', '....HHHHHHHG..', '...HHhHHHHHHG.', '..HhHHHHHHHHG.', '..SSHHHHHHHHG.', '.SSSSSSHHHHHG.', y=-3),
        'up': T('.....HHHH.....', '....HhHHHG....', '.....GGGG.....', '...HHHHHHHG...', '..HHhHHHHHHG..', '..HhHHHHHHHG..', '..HHHHHHHHHG..', '..HHHHHHHHHG..',
                '.HHHHHHHHHHHG.', '.HHHHHHHHHHGG.', '.GHHHHHHHHHGG.', '.GGHHHHHHHGGG.', '..GGGGGGGGGG..', '...GG....GG...', y=-3),
    },
}

HAT = {
    'nonla': {d: T('.......TT.......', '......TUTt......', '.....TUUTtt.....', '....TUUTTTtt....', '...TUTTTTTTtt...', '..TUTTTTTTTTtt..',
                   '.TTTTTTTTTTTTTt.', 'tttttttttttttttt', y=-6, x=-1) for d in DIRS},
    'khan': {  # khăn chít đen (thầy đồ, cụ xã, học trò)
        'down': T('....TTTTTT....', '...TUUTTTTt...', '..TUTTTTTTTt..', '..TTTTTTTTTt..', '..tttttttttt..', y=-1),
        'left': T('.....TTTTTT...', '....TUUTTTTt..', '...TUTTTTTTTt.', '..TTTTTTTTTTt.', '..ttttttttttt.', '..........tt..', y=-1),
        'up': T('....TTTTTT....', '...TUUTTTTt...', '..TUTTTTTTTt..', '..TTTTTTTTTt..', '..tttttttttt..', '.....tttt.....', '.....t..t.....', y=-1),
    },
    'scarf': {  # khăn vuông mỏ quạ (mẹ, người bán hàng)
        'down': T('.....TTTT.....', '...TTUUTTTt...', '..TUTTTTTTTt..', '..TTTTttTTTt..', '..TTTSSSSTTt..', '..tTSSSSSSTt..', y=-2),
        'left': T('......TTTT....', '....TTUUTTTt..', '...TUTTTTTTTt.', '..TTTTTTTTTTt.', '..SSTTTTTTTTt.', '.SSSSSSTTTTTt.', y=-2),
        'up': T('.....TTTT.....', '...TTUUTTTt...', '..TUTTTTTTTt..', '..TTTTTTTTTt..', '..TTTTTTTTTt..', '..TTTTTTTTTt..', '.tTTTTTTTTTtt.',
                '.tTTTTTTTTTtt.', '..tTTTTTTTtt..', '...tttttttt...', '....SSSSSS....', y=-2),
    },
    'band': {  # khăn đỏ buộc trán
        'down': T('..RRRRRRRRRr..', y=2),
        'left': T('..RRRRRRRRRRr.', '...........rR.', '............r.', y=2),
        'up': T('..RRRRRRRRRr..', '......rRr.....', '.....rR.Rr....', '.....r...r....', y=2),
    },
    'tong': {  # mũ tròn người Tống
        'down': T('.....TTTT.....', '....TUTTTt....', '...TUTTTTTt...', '..TTTTTTTTTt..', '.tttttttttttt.', y=-2),
        'left': T('......TTTT....', '.....TUTTTt...', '....TUTTTTTt..', '...TTTTTTTTTt.', '..ttttttttttt.', y=-2),
        'up': T('.....TTTT.....', '....TUTTTt....', '...TUTTTTTt...', '..TTTTTTTTTt..', '.tttttttttttt.', y=-2),
    },
    'quan': {  # mũ quan văn có cánh
        'down': T('....TTTTTT....', '...TUTTTTTt...', 'tt.TTTTTTTt.tt', 'tTTTTTTTTTTTTt', '..tttttttttt..', y=-2),
        'left': T('.....TTTTTT...', '....TUTTTTTt..', '....TTTTTTTTtt', '...TTTTTTTTTTt', '..ttttttttttt.', y=-2),
        'up': T('....TTTTTT....', '...TUTTTTTt...', 'tt.TTTTTTTt.tt', 'tTTTTTTTTTTTTt', '..tttttttttt..', y=-2),
    },
    'mutran': {  # mũ trụ tướng nhà Trần: đỏ viền vàng, chóp vàng
        'down': T('......YY......', '.....RRRR.....', '....RNRRRr....', '...RRYYYYRr...', '..RRRRRRRRRr..', '..YYYYYYYYYY..', '.Rr........rR.', '.Rr........rR.', '.r..........r.', y=-3),
        'left': T('.......YY.....', '......RRRR....', '.....RNRRRr...', '....RRYYYYRr..', '...RRRRRRRRRr.', '..YYYYYYYYYYY.', '..........RRr.', '..........RRr.', '..........Rr..', y=-3),
        'up': T('......YY......', '.....RRRR.....', '....RNRRRr....', '...RRYYYYRr...', '..RRRRRRRRRr..', '..YYYYYYYYYY..', '.RRRRRRRRRRRr.', '.RRRRRRRRRRRr.', '.rRRRRRRRRRrr.', '..rrrrrrrrrr..', y=-3),
    },
    'mugiac': {  # mũ trụ nhọn của giặc, vành lông, che tai
        'down': T('......MN......', '.....MNMn.....', '....MNMMMn....', '...MNMMMMMn...', '..MNMMMMMMMn..', '..nnnnnnnnnn..', '.FFFFFFFFFFFf.', '.Ff........fF.', '.Ff........fF.', '.Ff........fF.', '.ff........ff.', y=-4),
        'left': T('.......MN.....', '......MNMn....', '.....MNMMMn...', '....MNMMMMMn..', '...MNMMMMMMMn.', '..nnnnnnnnnnn.', '.FFFFFFFFFFFFf', '.........FFFFf', '.........FfFFf', '.........FFFf.', '.........fff..', y=-4),
        'up': T('......MN......', '.....MNMn.....', '....MNMMMn....', '...MNMMMMMn...', '..MNMMMMMMMn..', '..nnnnnnnnnn..', '.FFFFFFFFFFFf.', '.FFfFFFFfFFFf.', '.FFFFFfFFFFFf.', '.FfFFFFFFfFFf.', '.fFFFFFFFFFff.', '..ffffffffff..', y=-4),
    },
    'plume': {d: T('......Rr......', '.....RRr......', '......R.......', y=-7) for d in DIRS},
    'tram': {  # trâm cài và bông hoa đỏ trên búi tóc
        'down': T('..........Rr..', '.YY.......R...', y=-3),
        'left': T('............R.', '.....YY....Rr.', y=-3),
        'up': T('.YY.......Rr..', '...........R..', y=-3),
    },
}

BEARD = {
    'full': {'down': T('..SDDSSSSDDS..', '..DDDDmmDDDD..', '..DDDDDDDDDD..', '...DDDDDDDD...', '....DDDDDD....', '.....dDDd.....', y=7),
             'left': T('.SDDSSSS......', '.DDDDSSS......', '.DDDDDDS......', '..DDDDD.......', '..dDDd........', y=7), 'up': []},
    'long': {'down': T('..SDDSSSSDDS..', '..DDDDmmDDDD..', '..DDDDDDDDDD..', '...DDDDDDDD...', '....DDDDDD....', '....dDDDDd....', '.....DDDD.....', '......dd......', y=7),
             'left': T('.SDDSSSS......', '.DDDDSSS......', '.DDDDDDS......', '..DDDDD.......', '..DDDD........', '..dDDd........', '...dd.........', y=7), 'up': []},
    'mus': {'down': T('....dDmmDd....', '....d....d....', y=8), 'left': T('.Dm...........', '.d............', y=8), 'up': []},   # ria rủ hai bên miệng, chừa một hàng da dưới mắt
    'goat': {'down': T('....DDDDDD....', '..SSSSmmSSSS..', '....SSDDSSS...', '.....DDDD.....', '......dd......', y=7),
             'left': T('.DDDSSSS......', '.SmSS.........', '..DDS.........', '..DD..........', '..d...........', y=7), 'up': []},
}

# ---------------------------------------------------------------- thân (hàng 10…)
def torso_shirt(d):
    if d == 'down': return T('.LLCCAAAACCcc.', 'LLCCCCAACCCccc', 'LCKCCCCACCCKcc', 'LCKCCCCCACCKcc', 'LCKBBBBBBBBKcc', 'SSKCCCCqCCCKss', 'SsKCCCCqCCCKss', '..KccccccccK..', y=10)
    if d == 'left': return T('....LCCCCCc...', '...ACCCCCCcc..', '...LACCCCCcc..', '...LCACCCCcc..', '...BBBBBBBqq..', '...LCCCCCCcc..', '...LCCCCCCcc..', '...cccccccc...', y=10)
    return T('.LLCCCCCCCCcc.', 'LLCCCCCCCCCccc', 'LCKCCCCCCCCKcc', 'LCKCCCCCCCCKcc', 'LCKBBBBqqBBKcc', 'SSKCCCCCCCCKss', 'SsKCCCCCCCCKss', '..KccccccccK..', y=10)

def torso_robe(d):
    if d == 'down': return T('.LLCCAAAACCcc.', 'LLCCCCAACCCccc', 'LCKCCCCACCCKcc', 'LCKCCCCCACCKcc', 'LCKBBBBBBBBKcc', 'SSKCCCCCACCKss', 'SsKCCCCCACCKss', '..LCCCCCACCc..', '..LCCCCCACCc..', '..AAAAAAAAAa..', y=10)
    if d == 'left': return T('....LCCCCCc...', '...ACCCCCCcc..', '...LACCCCCcc..', '...LCACCCCcc..', '...BBBBBBBqq..', '...ACCCCCCcc..', '...ACCCCCCcc..', '..AACCCCCCccc.', '..ACCCCCCCccc.', '..AAAAAAAAAaa.', y=10)
    return T('.LLCCCCCCCCcc.', 'LLCCCCCCCCCccc', 'LCKCCCCCCCCKcc', 'LCKCCCCCCCCKcc', 'LCKBBBBqqBBKcc', 'SSKCCCCCCCCKss', 'SsKCCCCCCCCKss', '..LCCCCCCCCc..', '..LCCCCCCCCc..', '..AAAAAAAAAa..', y=10)

def torso_dress(d):
    if d == 'down': return T('.LLCCAXXACCcc.', 'LLCCCAXXACCccc', 'LCKCCCAACCCKcc', 'LCKCCCCCCCCKcc', 'LCKBBBBBBBBKcc', 'SSKJJCJJCJJKss', 'SsKJJCJJCJJKss', '..JJJJJJJJJj..', '..JJJJjJJJJj..', '..jjjjjjjjjj..', y=10)
    if d == 'left': return T('....LCCCCCc...', '...XCCCCCCcc..', '...XACCCCCcc..', '...LCCCCCCcc..', '...BBBBBBBqq..', '...JJJJJJJjj..', '...JJJJJJJjj..', '..JJJJJJJJjjj.', '..JJJJJJJJjjj.', '..jjjjjjjjjjj.', y=10)
    return T('.LLCCCCCCCCcc.', 'LLCCCCCCCCCccc', 'LCKCCCCCCCCKcc', 'LCKCCCCCCCCKcc', 'LCKBBBBqqBBKcc', 'SSKJJJJJJJJKss', 'SsKJJJJJJJJKss', '..JJJJJJJJJj..', '..JJJJJJJJJj..', '..jjjjjjjjjj..', y=10)

def torso_monk(d):
    if d == 'down': return T('.LLCCCCCCCCcc.', 'LLCACCCCCCCccc', 'LCKCACCCCCCKcc', 'LCKCCACCCCCKcc', 'LCKCCCACCCCKcc', 'SSKCCCCACCCKss', 'SsKCCCCCACCKss', '..LCCCCCCACc..', '..LCCCCCCCAc..', '..cccccccccc..', y=10)
    if d == 'left': return T('....LCCCCCc...', '...LCCCCCAcc..', '...LCCCCACcc..', '...LCCCACCcc..', '...LCCACCCcc..', '...LCACCCCcc..', '...LACCCCCcc..', '..LCCCCCCCccc.', '..LCCCCCCCccc.', '..ccccccccccc.', y=10)
    return T('.LLCCCCCCCCcc.', 'LLCCCCCCCCACcc', 'LCKCCCCCCACKcc', 'LCKCCCCCACCKcc', 'LCKCCCCACCCKcc', 'SSKCCCACCCCKss', 'SsKCCACCCCCKss', '..LCACCCCCCc..', '..LACCCCCCCc..', '..cccccccccc..', y=10)

def torso_armor(d):  # áo choàng giặc: cổ lông, vạt chéo, đai khóa vàng
    if d == 'down': return T('.FFFFFFFFFFFf.', 'LLCCCCCFCCCccc', 'LCKCCCCCFCCKcc', 'LCKCCCCCCFCKcc', 'LCKBBBBYBBBKcc', 'SSKCCCCCCFCKss', 'SsKCCCCCCFCKss', '..KFFFFFFFFK..', y=10)
    if d == 'left': return T('....FFFFFFf...', '...FCCCCCCcc..', '...LFCCCCCcc..', '...LCFCCCCcc..', '...BBYBBBBqq..', '...FCCCCCCcc..', '...FCCCCCCcc..', '...FFFFFFFF...', y=10)
    return T('.FFFFFFFFFFFf.', 'LLCCCCCCCCCccc', 'LCKCCCCCCCCKcc', 'LCKCCCCCCCCKcc', 'LCKBBBBBBBBKcc', 'SSKCCCCCCCCKss', 'SsKCCCCCCCCKss', '..KFFFFFFFFK..', y=10)

def torso_tuong(d):  # giáp tướng nhà Trần: giáp đỏ, vai và đai vàng
    if d == 'down': return T('.YYCCAAAACCYy.', 'YYYCCCAACCYYyy', 'LCKCYYYYCCCKcc', 'LCKCYCCYCCCKcc', 'LCKYYYYYYYYKcc', 'SSKCCCCCCCCKss', 'SsKCYCCYCCYKss', '..KYYYYYYYYK..', y=10)
    if d == 'left': return T('....YCCCCCc...', '...YYCCCCCcc..', '...YYYYCCCcc..', '...LCYCCCCcc..', '...YYYYYYYyy..', '...LCCCCCCcc..', '...LCYCCYCcc..', '...YYYYYYYY...', y=10)
    return T('.YYCCCCCCCCYy.', 'YYYCCCCCCCYYyy', 'LCKCCCCCCCCKcc', 'LCKCCCCCCCCKcc', 'LCKYYYYYYYYKcc', 'SSKCCCCCCCCKss', 'SsKCCCCCCCCKss', '..KYYYYYYYYK..', y=10)

def torso_apron(d):  # thợ rèn: cởi trần, tạp dề da
    if d == 'down': return T('.SSSSSSSSSSss.', 'SSSSZZZZZZSsss', 'SSKSZZZZZZSKss', 'SSKSZZZZZZSKss', 'SSKBBBBBBBBKss', 'SSKZZZZZZZZKss', 'SsKZZZZZZZZKss', '..KzzzzzzzzK..', y=10)
    if d == 'left': return T('....SSSSSSs...', '...ZZSSSSSss..', '...ZZZSSSSss..', '...ZZZSSSSss..', '...BBBBBBBqq..', '...ZZZCCCCcc..', '...ZZZCCCCcc..', '...zzzcccccc..', y=10)
    return T('.SSSSSSSSSSss.', 'SSSSSSSSSSSsss', 'SSKSSSSSSSSKss', 'SSKSSSSSSSSKss', 'SSKBBBBBBBBKss', 'SSKCCCCCCCCKss', 'SsKCCCCCCCCKss', '..KccccccccK..', y=10)

def torso_vest(d):  # Cò: áo cộc tay, để tay trần
    if d == 'down': return T('.SLCCAAAACCcs.', 'SSLCCCAACCCcss', 'SSKCCCCACCCKss', 'SSKCCCCCACCKss', 'SSKBBBBBBBBKss', 'SSKCCCCqCCCKss', 'SsKCCCCqCCCKss', '..KccccccccK..', y=10)
    if d == 'left': return T('....LCCCCCc...', '...ACCCCCCcc..', '...LACCCCCcc..', '...LCACCCCcc..', '...BBBBBBBqq..', '...LCCCCCCcc..', '...LCCCCCCcc..', '...cccccccc...', y=10)
    return T('.SLCCCCCCCCcs.', 'SSLCCCCCCCCcss', 'SSKCCCCCCCCKss', 'SSKCCCCCCCCKss', 'SSKBBBBqqBBKss', 'SSKCCCCCCCCKss', 'SsKCCCCCCCCKss', '..KccccccccK..', y=10)

def slim(fn):
    """Thân nhìn nghiêng mỏng lại 2 điểm ảnh ở phía lưng, cho lưng thẳng xuống từ gáy (không phình như gù)."""
    def f(d):
        rows = fn(d)
        if d != 'left': return rows
        out = []
        for y, r, x in rows:
            j = max(i for i, ch in enumerate(r) if ch != '.')
            k = max(j - 2, min(i for i, ch in enumerate(r) if ch != '.') + 3)
            out.append((y, r[:k] + r[k + 2:] + '..', x))
        return out
    return f

TORSO = {k: slim(v) for k, v in dict(shirt=torso_shirt, robe=torso_robe, dress=torso_dress, monk=torso_monk, armor=torso_armor, tuong=torso_tuong, apron=torso_apron, vest=torso_vest).items()}
LONG = {'robe', 'dress', 'monk'}       # áo dài tới chân: chỉ thấy bàn chân

# tay phía trước khi nhìn nghiêng: ống tay 2 cột, nắm tay 2×2; vung theo bước
SIDE_ARM = {0: (6, 6), 1: (5, 4), 2: (7, 8)}   # (cột ống tay dưới, cột nắm tay)
def side_arm(f, sleeve='C', bare=False):
    a, h = SIDE_ARM[f]
    c1, c2 = ('S', 's') if bare else ('L', sleeve)
    rows = [(11, 6, c1 + c2), (12, 6, c1 + c2), (13, a, c1 + c2), (14, a, c1 + c2), (15, h, 'SS'), (16, h, 'Ss')]
    return [(y, '.' * x + s, 0) for y, x, s in rows]

# chân: [khung 0, 1, 2], hàng 18–20
LEGS = {
    'bare': {'down': [T('...PPp..PPp...', '...PPp..PPp...', '..SSSs..SSSs..', y=18), T('...PPp..PPp...', '..SSSs..PPp...', '........SSSs..', y=18), T('...PPp..PPp...', '...PPp..SSSs..', '..SSSs........', y=18)],
             'left': [T('.....PPPp.....', '.....PPPp.....', '....SSSSs.....', y=18), T('....PPp.PPp...', '...PPp...PPp..', '..SSSs....SSs.', y=18), T('.....PPPPp....', '....PPp.PPp...', '...SSSs.SSs...', y=18)]},
    'boots': {'down': [T('...PPp..PPp...', '...OOo..OOo...', '..OOOo..OOOo..', y=18), T('...PPp..PPp...', '..OOOo..OOo...', '........OOOo..', y=18), T('...PPp..PPp...', '...OOo..OOOo..', '..OOOo........', y=18)],
              'left': [T('.....PPPp.....', '.....OOOo.....', '....OOOOo.....', y=18), T('....PPp.PPp...', '...OOo...OOo..', '..OOOo....OOo.', y=18), T('.....PPPPp....', '....OOo.OOo...', '...OOOo.OOo...', y=18)]},
    'feet': {'down': [T('...OOo..OOo...', y=20), T('...OOo........', y=20), T('........OOo...', y=20)],
             'left': [T('....OOOo......', y=20), T('..OOo...OOo...', y=20), T('...OOo.OOo....', y=20)]},
}
LEGS['bare']['up'] = [LEGS['bare']['down'][i] for i in (0, 2, 1)]
LEGS['boots']['up'] = [LEGS['boots']['down'][i] for i in (0, 2, 1)]
LEGS['feet']['up'] = [LEGS['feet']['down'][i] for i in (0, 2, 1)]

# ---------------------------------------------------------------- vũ khí
WEAPON = {  # màu cán, màu lưỡi (theo thứ tự từ tay ra), độ dài
    'kiem': ('YNNNNNM', 1), 'dao': ('yMNNNNM', 1), 'gay': ('WWWWWWWV', 0), 'giao': ('V' + 'W' * 20 + 'MMN', 0),
}
def stroke(x, y, dx, dy, colors, back=0):
    """Một nét thẳng (ngang, dọc hoặc chéo 45°) bắt đầu ở (x, y), lùi trước 'back' ô (phần cán sau tay)."""
    out = []
    for i, ch in enumerate(colors):
        k = i - back
        out.append((y + dy * k, x + dx * k, ch))
    return out

# ---------------------------------------------------------------- nhân vật
def C(c): return cloth(c)
def P2(c): return {'P': c, 'p': shade(c, -.25)}
def B2(c): return {'B': c, 'q': shade(c, -.25)}

PEOPLE = [
    # id, tên, kiểu: hair, hat, face, beard, torso, legs, weapon, kid, bảng màu riêng
    ('ban_be', 'Bạn lúc nhỏ', dict(hair='kid', torso='shirt', legs='bare', kid=True, pal={**C('#9a6a3a'), **B2('#5a3a22'), **P2('#5a4a3a')})),
    ('ban_nong', 'Bạn · nông', dict(hair='knot', torso='shirt', legs='bare', weapon='gay', pal={**C('#8a5a30'), **B2('#4e3a24'), **P2('#4a3e34')})),
    ('ban_van', 'Bạn · văn', dict(hair='knot', hat='khan', torso='robe', legs='feet', weapon='gay', pal={**C('#2f5f86'), **B2('#1e3a52'), 'T': '#2e3552', 'U': '#4d587e', 't': '#1b2036'})),
    ('ban_vo', 'Bạn · võ', dict(hair='knot', hat='band', torso='shirt', legs='boots', weapon='kiem', pal={**C('#a8382a'), **B2('#2a2226'), **P2('#2e2a2c')})),
    ('co_be', 'Cò lúc nhỏ', dict(hair='spiky', torso='vest', legs='bare', kid=True, pal={**C('#5f8a3a'), **B2('#4a3a22'), **P2('#4a4034')})),
    ('co', 'Cò', dict(hair='spiky', torso='vest', legs='bare', weapon='gay', pal={**C('#5f8a3a'), **B2('#4a3a22'), **P2('#4a4034')})),
    ('co_do', 'Cò (theo quân)', dict(hair='spiky', hat='band', torso='vest', legs='bare', weapon='gay', pal={**C('#5f8a3a'), **B2('#4a3a22'), **P2('#4a4034')})),
    ('thao', 'Thảo', dict(hair='bun', hat='tram', face='w', torso='dress', legs='feet', pal={**C('#3f9a7a'), **B2('#7a2f2a')})),
    ('me', 'Mẹ', dict(hair='bun', hat='scarf', face='w', torso='dress', legs='feet', pal={**C('#8a4a62'), **B2('#3a2a2a'), 'T': '#3a2a2a', 'U': '#5a4444', 't': '#20171a'})),
    ('me_gia', 'Mẹ (già)', dict(hair='bun', hat='scarf', face='w', torso='dress', legs='feet', pal={**GREY, **C('#7a4a5a'), **B2('#3a2a2a'), 'T': '#3a2a2a', 'U': '#5a4444', 't': '#20171a'})),
    ('cha', 'Cha', dict(hair='knot', hat='nonla', beard='mus', torso='shirt', legs='bare', pal={**C('#6b5233'), **B2('#3e2e1e'), **P2('#3e3630'), 'T': '#e6c98a', 'U': '#fbe8b8', 't': '#b08f52'})),
    ('cha_gia', 'Cha (già)', dict(hair='knot', hat='nonla', beard='full', torso='shirt', legs='bare', pal={**GREY, **C('#6b5233'), **B2('#3e2e1e'), **P2('#3e3630'), 'T': '#e6c98a', 'U': '#fbe8b8', 't': '#b08f52'})),
    ('batu', 'Bà Tư', dict(hair='bun', face='w', torso='dress', legs='feet', pal={**GREY, **C('#5e4e3c'), **B2('#3a2e22')})),
    ('sen', 'Bé Sen', dict(hair='kid2', torso='shirt', legs='bare', kid=True, pal={**C('#e0708a'), **B2('#a03a4a'), **P2('#5a4a4a')})),
    ('thay', 'Thầy đồ Chu', dict(hair='knot', hat='khan', beard='long', torso='robe', legs='feet', pal={**WHITE, **C('#33606a'), **B2('#1f3a40'), 'T': '#2e3552', 'U': '#4d587e', 't': '#1b2036'})),
    ('vosu', 'Lão võ sư Hoàng', dict(hair='knot', hat='band', beard='long', torso='vest', legs='boots', pal={**WHITE, **C('#8a2f22'), **B2('#2a2226'), **P2('#2e2a2c')})),
    ('su', 'Sư cụ', dict(hair='bald', torso='monk', legs='feet', pal={**C('#b0702e'), 'A': '#e8a83a', 'a': '#b87a1e'})),
    ('ly', 'Cụ xã', dict(hair='knot', hat='khan', beard='goat', torso='robe', legs='feet', pal={**GREY, **C('#2c3a5e'), **B2('#d9b25a'), 'A': '#e9b93a', 'a': '#a87d1e', 'T': '#2e3552', 'U': '#4d587e', 't': '#1b2036'})),
    ('hsach', 'Chủ hàng sách', dict(hair='knot', beard='goat', torso='robe', legs='feet', pal={**C('#4a6a4a'), **B2('#2e3e2e')})),
    ('hren', 'Bác thợ rèn', dict(hair='knot', hat='band', beard='full', torso='apron', legs='bare', pal={**C('#4a3a30'), **B2('#2a2020'), **P2('#3a3230')})),
    ('tong', 'Lái buôn người Tống', dict(hair='knot', hat='tong', beard='mus', torso='robe', legs='feet', pal={**C('#3f6f9a'), **B2('#d9b25a'), 'A': '#e9b93a', 'a': '#a87d1e'})),
    ('dan1', 'Người bán hàng', dict(hair='bun', hat='scarf', face='w', torso='dress', legs='feet', pal={**C('#7a5a9a'), **B2('#3a2a3a'), 'T': '#6a3a3a', 'U': '#8a5050', 't': '#40221f'})),
    ('gom', 'Bà hàng gốm', dict(hair='bun', face='w', torso='dress', legs='feet', pal={**GREY, **C('#5a7a5a'), **B2('#2e3e2e')})),
    ('linh', 'Lính gác', dict(hair='knot', hat='band', torso='shirt', legs='boots', weapon='giao', hold=True, pal={**C('#b0362a'), **B2('#e9b93a'), **P2('#2e2a2c')})),
    ('quan', 'Quân Trần', dict(hair='knot', hat='band', torso='shirt', legs='boots', weapon='giao', hold=True, pal={**C('#9a3a26'), **B2('#3a2a22'), **P2('#2e2a2c')})),
    ('hocquan', 'Học quan', dict(hair='knot', hat='quan', beard='goat', torso='robe', legs='feet', pal={**C('#5a3a7a'), **B2('#e9b93a'), 'A': '#e9b93a', 'a': '#a87d1e'})),
    ('voquan', 'Võ quan', dict(hair='knot', hat='mutran', beard='full', torso='tuong', legs='boots', pal={**C('#a8302a'), **P2('#2e2a2c')})),
    ('ngu', 'Chàng trai đọc sách', dict(hair='knot', torso='shirt', legs='bare', pal={**C('#5f5a48'), **B2('#3a3428'), **P2('#3e3a34')})),
    ('ngu_tuong', 'Phạm Ngũ Lão', dict(hair='knot', hat='mutran', torso='tuong', legs='boots', weapon='giao', hold=True, pal={**C('#a8302a'), **P2('#2e2a2c')})),
    ('trai', 'Trai làng', dict(hair='knot', hat='band', torso='shirt', legs='bare', weapon='gay', pal={**C('#7a5a3a'), **B2('#4a3a24'), **P2('#4a3e34')})),
    ('trai_giao', 'Trai làng (giáo)', dict(hair='knot', hat='band', torso='shirt', legs='bare', weapon='giao', hold=True, pal={**C('#7a5a3a'), **B2('#4a3a24'), **P2('#4a3e34')})),
    ('giac', 'Giặc', dict(hair='knot', hat='mugiac', beard='mus', torso='armor', legs='boots', weapon='dao', pal={**C('#3e4a62'), **B2('#3a2a1e'), **P2('#2a2826')})),
    ('giac_ky', 'Giặc kỵ', dict(hair='knot', hat='mugiac', plume=True, beard='full', torso='armor', legs='boots', weapon='dao', pal={**C('#6a4a2e'), **B2('#3a2a1e'), **P2('#2a2826')})),
    # đêm 1285, hồi ba (hư cấu): tên đầu toán giặc áo đỏ thẫm, đai vàng; cu Tí con nhà hàng xóm
    ('giac_dau', 'Tên đầu toán', dict(hair='knot', hat='mugiac', plume=True, beard='full', torso='armor', legs='boots', weapon='dao', pal={**C('#7a2622'), **B2('#d9b25a'), **P2('#241f1e')})),
    ('laido', 'Ông lái đò', dict(hair='knot', hat='nonla', beard='long', torso='shirt', legs='bare', pal={**GREY, **C('#4f6a74'), **B2('#2e3e44'), **P2('#3e3a34'), 'T': '#e6c98a', 'U': '#fbe8b8', 't': '#b08f52'})),
    ('khach', 'Khách qua đò', dict(hair='bun', hat='nonla', face='w', torso='dress', legs='feet', pal={**C('#9a6a4a'), **B2('#4a3020'), 'T': '#e6c98a', 'U': '#fbe8b8', 't': '#b08f52'})),
    ('ti', 'Cu Tí nhà bên', dict(hair='kid', torso='shirt', legs='bare', kid=True, pal={**C('#5a7890'), **B2('#33404e'), **P2('#4a4440')})),
    # trại giặc đêm 12 tháng giêng 1285: tướng Nguyên Ô Mã Nhi (giáp xanh thẫm, đai vàng), Đỗ Khắc Chung (quan văn nước ta)
    ('o_ma_nhi', 'Ô Mã Nhi', dict(hair='knot', hat='mugiac', plume=True, beard='full', torso='armor', legs='boots', pal={**C('#283652'), **B2('#e9b93a'), **P2('#1e1c22')})),
    ('khac_chung', 'Đỗ Khắc Chung', dict(hair='knot', hat='quan', beard='goat', torso='robe', legs='feet', pal={**C('#2f6a5e'), **B2('#d9b25a'), 'A': '#e9b93a', 'a': '#a87d1e'})),
]

# ---------------------------------------------------------------- ghép một khung
def frame(spec, d, f, atk=None):
    """d: 'down' | 'left' | 'up'; f: 0–2 bước; atk: None | 0 (vung lên) | 1 (chém)."""
    pal = {**BASE, **spec['pal']}
    kid = spec.get('kid')
    grid = {}
    def put(layer, dy=0, dx=0):
        for y, row, x in layer:
            for i, ch in enumerate(row):
                if ch != '.': grid[(x + i + dx, y + dy)] = ch
    def pix(lst, dy=0):
        for y, x, ch in lst: grid[(x, y + dy)] = ch

    torso_name = spec['torso']
    # nhìn nghiêng: đầu lùi ra sau 1 cột cho đầu nằm ngay trên thân (không chúi ra trước như gù)
    HX, BX = (1, 0) if d == 'left' else (0, 0)
    bob = 1 if (f and atk is None) else 0
    # trẻ con: thân ngắn (bỏ 3 hàng), chân 2 hàng
    def kidcut(layer):
        if not kid: return layer
        keep = {10: 10, 11: 11, 14: 12, 15: 13, 17: 14}
        return [(keep[y], r, x) for y, r, x in layer if y in keep]
    # vũ khí cầm dọc (giáo) vẽ trước, nằm sau người
    wpn = spec.get('weapon')
    hold = spec.get('hold') and atk is None
    if hold:
        cols = WEAPON[wpn][0]
        if d == 'down': pix(stroke(13, 17, 0, -1, cols, 1), bob)
        elif d == 'left': pix(stroke(3 + BX, 17, 0, -1, cols, 1), bob)
        else: pix(stroke(0, 17, 0, -1, cols, 1), bob)
    # chân
    if kid:
        legs = LEGS[spec['legs']][d][f if atk is None else 0]
        legs = [({18: 15, 20: 16}[y], r, x) for y, r, x in legs if y != 19]  # 2 hàng: 15, 16
    else:
        legs = LEGS[spec['legs']][d][f if atk is None else 0]
    put(legs, 0, BX)
    # thân
    tor = TORSO[torso_name](d)
    if torso_name in LONG and f and atk is None:  # vạt áo dài đung đưa
        sw = 1 if f == 1 else -1
        tor = [(y, r, x + (sw if y >= 17 else 0)) for y, r, x in tor]
    put(kidcut(tor), bob, BX)
    if d == 'left':
        bare = torso_name in ('vest', 'apron')
        put(kidcut(side_arm(f if atk is None else 0, bare=bare)), bob, BX)
    # đầu; nhìn nghiêng thì bỏ 1 cột tóc sau gáy (cột 10) cho đầu bớt sâu, tóc không lùi ra sau quá xa,
    # mà đầu vẫn tròn (bỏ 2 cột thì gáy thẳng đuột như cái hộp)
    def sq(layer):
        if d != 'left': return layer
        return [(y, r[:10] + r[11:] + '.' if x == 0 else r, x) for y, r, x in layer]
    hair = sq(HAIR[spec['hair']][d])
    if d == 'left':   # gáy tròn: phần sau đỉnh đầu (hàng 1, 2) nhô thêm một điểm ảnh
        hair = [(y, r[:12] + 'G' + r[13:] if y in (1, 2) and r[11] != '.' and r[12] == '.' else r, x) for y, r, x in hair]
    put(hair, bob, HX)
    face = FACE_W if spec.get('face') == 'w' else FACE_KID if kid else FACE
    if spec['hair'] in ('bun',) and d != 'up' and spec.get('face') == 'w':
        put(sq(face[d]), bob, HX)
    elif d != 'up':
        put(sq(face[d]), bob, HX)
    if spec.get('beard'): put(BEARD[spec['beard']][d], bob, HX)
    if spec.get('hat'): put(sq(HAT[spec['hat']][d]) if spec['hat'] != 'nonla' else HAT['nonla'][d], bob, HX)
    if spec.get('plume'): put(HAT['plume'][d], bob, HX)
    # chém
    if atk is not None and wpn:
        cols, back = WEAPON[wpn]
        if wpn == 'giao': cols, back = cols[-8:], 0
        hand = []
        if d == 'down':
            if atk == 0: hx, hy = 12, 8; pix(stroke(hx + 1, hy, 0, -1, cols, back)); hand = [(hy, hx, 'S'), (hy, hx + 1, 'S'), (hy + 1, hx, 's'), (hy + 1, hx + 1, 's')]
            else: hx, hy = 4, 15; pix(stroke(hx, hy + 1, -1, 1, cols, back)); hand = [(hy, hx, 'S'), (hy, hx + 1, 'S'), (hy + 1, hx, 's'), (hy + 1, hx + 1, 's')]
            for (yy, xx) in [(15, 0), (15, 1), (16, 0), (16, 1)] if atk == 1 else [(15, 12), (15, 13), (16, 12), (16, 13)]:
                grid.pop((xx, yy), None)
        elif d == 'left':
            if atk == 0: hx, hy = 9, 9; pix(stroke(hx + 1, hy, 1, -1, cols, back))
            else: hx, hy = 1, 13; pix(stroke(hx - 1, hy, -1, 0, cols, back))
            hand = [(hy, hx, 'S'), (hy, hx + 1, 'S'), (hy + 1, hx, 's'), (hy + 1, hx + 1, 's')]
        else:
            if atk == 0: hx, hy = 12, 9; pix(stroke(hx + 1, hy, 1, -1, cols, back))
            else: hx, hy = 12, 4; pix(stroke(hx + 1, hy - 1, 0, -1, cols, back))
            hand = [(hy, hx, 'S'), (hy, hx + 1, 'S'), (hy + 1, hx, 's'), (hy + 1, hx + 1, 's')]
        pix(hand)
    return grid, pal


def render(grid, pal, kid):
    img = Image.new('RGBA', (CW, CH), (0, 0, 0, 0))
    px = img.load()
    oy = (AY - 2) - (16 if kid else 20)
    for (x, y), ch in grid.items():
        X, Y = x + X0, y + oy
        if 0 <= X < CW and 0 <= Y < CH:
            c = pal.get(ch)
            if c is None: raise KeyError(f'không có màu cho chữ {ch!r}')
            px[X, Y] = tuple(int(c[i:i + 2], 16) for i in (1, 3, 5)) + (255,)
    # viền đen quanh hình (4 hướng)
    oc = tuple(int(OUT[i:i + 2], 16) for i in (1, 3, 5)) + (255,)
    edge = [(x, y) for y in range(CH) for x in range(CW) if px[x, y][3] == 0 and any(
        0 <= x + dx < CW and 0 <= y + dy < CH and px[x + dx, y + dy][3] and px[x + dx, y + dy] != oc for dx, dy in ((1, 0), (-1, 0), (0, 1), (0, -1)))]
    for x, y in edge: px[x, y] = oc
    return img


FRAMES = [('down', 0, None), ('down', 1, None), ('down', 2, None), ('left', 0, None), ('left', 1, None), ('left', 2, None),
          ('up', 0, None), ('up', 1, None), ('up', 2, None), ('down', 0, 0), ('down', 0, 1), ('left', 0, 0), ('left', 0, 1), ('up', 0, 0), ('up', 0, 1)]


def main():
    ap = argparse.ArgumentParser()
    root = os.path.dirname(os.path.dirname(os.path.abspath(__file__)))
    ap.add_argument('--ra', default=os.path.join(root, 'src', 'assets', 'nguoi.png'))
    ap.add_argument('--xem', default=None, help='ảnh xem trước phóng to có tên nhân vật')
    ap.add_argument('--to', type=int, default=5)
    a = ap.parse_args()
    sheet = Image.new('RGBA', (CW * len(FRAMES), CH * len(PEOPLE)), (0, 0, 0, 0))
    meta = {'cw': CW, 'ch': CH, 'ax': AX, 'ay': AY, 'frames': [f'{d}{f}' if k is None else f'{d}a{k}' for d, f, k in FRAMES], 'people': {}}
    for r, (pid, name, spec) in enumerate(PEOPLE):
        for c, (d, f, k) in enumerate(FRAMES):
            g, pal = frame(spec, d, f, k)
            sheet.alpha_composite(render(g, pal, spec.get('kid')), (c * CW, r * CH))
        meta['people'][pid] = {'row': r, 'name': name, 'kid': bool(spec.get('kid')), 'fight': bool(spec.get('weapon'))}
    sheet.save(a.ra)
    with open(os.path.splitext(a.ra)[0] + '.json', 'w', encoding='utf-8') as fh:
        json.dump(meta, fh, ensure_ascii=False, indent=1)
    print('Đã ghi', a.ra, sheet.size)
    if a.xem:
        s = a.to
        lw = 150
        prev = Image.new('RGB', (lw + sheet.width * s, sheet.height * s), (111, 154, 79))
        prev.paste(sheet.resize((sheet.width * s, sheet.height * s), Image.NEAREST), (lw, 0), sheet.resize((sheet.width * s, sheet.height * s), Image.NEAREST))
        dr = ImageDraw.Draw(prev)
        try: font = ImageFont.truetype('DejaVuSans.ttf', 14)   # có dấu tiếng Việt nếu máy có font này
        except OSError: font = None
        for r, (pid, name, _) in enumerate(PEOPLE): dr.text((6, r * CH * s + CH * s // 2), name, fill='white', font=font)
        prev.save(a.xem)
        print('Xem trước:', a.xem)


if __name__ == '__main__':
    main()
