from pathlib import Path

from PIL import Image

src = Path(r"C:\Users\LalogistiqueElkVelt\Documents\Codex\2026-06-15\cr-e-un-site-web-professionnel\outputs\assets\logo-elk-velt.png")
dst = Path(r"C:\Users\LalogistiqueElkVelt\Documents\Codex\2026-06-15\cr-e-un-site-web-professionnel\outputs\assets\logo-elk-velt-transparent.png")

image = Image.open(src).convert("RGBA")
pixels = image.load()

for y in range(image.height):
    for x in range(image.width):
        r, g, b, a = pixels[x, y]
        if r > 238 and g > 238 and b > 238:
            pixels[x, y] = (r, g, b, 0)

image.save(dst)
print(dst)
