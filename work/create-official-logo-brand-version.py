from pathlib import Path

from PIL import Image, ImageFilter

src = Path(r"C:\Users\LalogistiqueElkVelt\Documents\Codex\2026-06-15\cr-e-un-site-web-professionnel\outputs\assets\logo-elk-velt.png")
logo_out = Path(r"C:\Users\LalogistiqueElkVelt\Documents\Codex\2026-06-15\cr-e-un-site-web-professionnel\outputs\assets\logo-elk-velt-officiel.png")
card_src = Path(r"C:\Users\LALOGI~1\AppData\Local\Temp\codex-clipboard-b7d25365-4189-4b8e-a124-9c38b782debf.png")
card_out = Path(r"C:\Users\LalogistiqueElkVelt\Documents\Codex\2026-06-15\cr-e-un-site-web-professionnel\outputs\carte-affaires-logo-officiel.png")

brand_navy = (3, 24, 48)

logo = Image.open(src).convert("RGBA")
pixels = logo.load()

for y in range(logo.height):
    for x in range(logo.width):
        r, g, b, a = pixels[x, y]
        whiteness = min(r, g, b)
        if r > 238 and g > 238 and b > 238:
            pixels[x, y] = (255, 255, 255, 0)
            continue

        # Preserve antialiasing by turning pale edge pixels into partial alpha.
        edge_alpha = max(0, min(255, int((245 - whiteness) * 2.6)))
        alpha = min(a, edge_alpha) if whiteness > 150 else a
        pixels[x, y] = (*brand_navy, alpha)

logo.save(logo_out)

card = Image.open(card_src).convert("RGBA")
clear_box = (0, 0, 760, 292)
card.alpha_composite(
    Image.new("RGBA", (clear_box[2] - clear_box[0], clear_box[3] - clear_box[1]), (255, 255, 255, 255)),
    clear_box[:2],
)

# Use the official logo composition. Upscale only for the card and apply light sharpening.
target_width = 610
scale = target_width / logo.width
logo_large = logo.resize((target_width, round(logo.height * scale)), Image.Resampling.LANCZOS)
logo_large = logo_large.filter(ImageFilter.UnsharpMask(radius=1.2, percent=135, threshold=2))
card.alpha_composite(logo_large, (34, 20))

card.convert("RGB").save(card_out, quality=96)

print(logo_out)
print(card_out)
