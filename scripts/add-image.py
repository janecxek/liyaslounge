#!/usr/bin/env python3
"""Neues Bild für die Website aufbereiten.

Aufruf:  python3 scripts/add-image.py pfad/zum/foto.jpg mein-bildname
Erzeugt assets/img/mein-bildname-{480..3840}.webp + mein-bildname.jpg (bis 4K, nie grösser als das Original)
und trägt das Bild in scripts/imgmeta.json ein. Benötigt Pillow (pip install Pillow).
"""
import base64, io, json, os, sys
from PIL import Image, ImageFilter, ImageOps

if len(sys.argv) != 3:
    sys.exit(__doc__)
src, name = sys.argv[1], sys.argv[2]
root = os.path.join(os.path.dirname(os.path.abspath(__file__)), '..')
out = os.path.join(root, 'assets', 'img')
meta_path = os.path.join(root, 'scripts', 'imgmeta.json')

im = ImageOps.exif_transpose(Image.open(src)).convert('RGB')
W, H = im.size
MAX = 3840  # 4K – grössere Originale werden auf 3840 px Breite begrenzt
widths = [w for w in (480, 800, 1200, 1600, 2000, 2560, 3200) if w < min(W, MAX)] + [min(W, MAX)]
for w in widths:
    r = im if w == W else im.resize((w, round(H * w / W)), Image.LANCZOS)
    r.save(os.path.join(out, f'{name}-{w}.webp'), 'WEBP', quality=90, method=6)
fw = min(1600, W)
(im if fw == W else im.resize((fw, round(H * fw / W)), Image.LANCZOS)).save(os.path.join(out, f'{name}.jpg'), 'JPEG', quality=90, optimize=True, progressive=True)

meta = json.load(open(meta_path))
old = meta.get(name, {})
meta[name] = {'w': W, 'h': H, 'widths': widths, 'ratio': H / W}
# Fokuspunkt (fx/fy) eines bereits vorhandenen Bildes behalten
meta[name].update({k: old[k] for k in ('fx', 'fy') if k in old})
# unscharfe Mini-Vorschau (LQIP), wird angezeigt, bis das Bild geladen ist
t = im.resize((24, max(1, round(H * 24 / W))), Image.LANCZOS).filter(ImageFilter.GaussianBlur(0.6))
buf = io.BytesIO(); t.save(buf, 'WEBP', quality=45)
meta[name]['lqip'] = 'data:image/webp;base64,' + base64.b64encode(buf.getvalue()).decode()
json.dump(meta, open(meta_path, 'w'), indent=1)
print(f'✓ {name}: {len(widths)} Varianten ({", ".join(map(str, widths))} px)')
