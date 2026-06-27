from pathlib import Path

from PIL import Image

card_path = Path(r"C:\Users\LALOGI~1\AppData\Local\Temp\codex-clipboard-b7d25365-4189-4b8e-a124-9c38b782debf.png")
logo_path = Path(r"C:\Users\LalogistiqueElkVelt\Documents\Codex\2026-06-15\cr-e-un-site-web-professionnel\outputs\assets\logo-elk-velt-transparent.png")
out_path = Path(r"C:\Users\LalogistiqueElkVelt\Documents\Codex\2026-06-15\cr-e-un-site-web-professionnel\outputs\carte-affaires-logo-site.png")

card = Image.open(card_path).convert("RGBA")
logo = Image.open(logo_path).convert("RGBA")

# Clear the existing logo/slogan block only. The source card background is white in this area.
clear_box = (0, 0, 760, 292)
card.alpha_composite(Image.new("RGBA", (clear_box[2] - clear_box[0], clear_box[3] - clear_box[1]), (255, 255, 255, 255)), clear_box[:2])

# Place the same logo used on the website, scaled conservatively to preserve quality.
target_width = 520
scale = target_width / logo.width
target_size = (target_width, round(logo.height * scale))
logo_large = logo.resize(target_size, Image.Resampling.LANCZOS)

x = 52
y = 34
card.alpha_composite(logo_large, (x, y))

card.convert("RGB").save(out_path, quality=95)
print(out_path)
