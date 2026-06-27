from pathlib import Path
from collections import deque

from PIL import Image

card_path = Path(r"C:\Users\LalogistiqueElkVelt\Downloads\Image jointe par l’utilisateur.png")
img = Image.open(card_path).convert("RGB")
crop = img.crop((0, 20, 145, 150))
w, h = crop.size
dark = set()
for y in range(h):
    for x in range(w):
        r, g, b = crop.getpixel((x, y))
        if r < 45 and g < 60 and b < 85:
            dark.add((x, y))

seen = set()
components = []
for point in list(dark):
    if point in seen:
        continue
    q = deque([point])
    seen.add(point)
    pts = []
    while q:
        x, y = q.popleft()
        pts.append((x, y))
        for nx, ny in ((x+1,y),(x-1,y),(x,y+1),(x,y-1)):
            if (nx, ny) in dark and (nx, ny) not in seen:
                seen.add((nx, ny))
                q.append((nx, ny))
    if len(pts) > 20:
        xs = [p[0] for p in pts]
        ys = [p[1] for p in pts]
        components.append((len(pts), min(xs), min(ys), max(xs), max(ys)))

for item in sorted(components, reverse=True)[:20]:
    print(item)
