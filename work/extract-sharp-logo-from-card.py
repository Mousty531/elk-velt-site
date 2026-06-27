from pathlib import Path

from PIL import Image

card_path = Path(r"C:\Users\LALOGI~1\AppData\Local\Temp\codex-clipboard-b7d25365-4189-4b8e-a124-9c38b782debf.png")
logo_out = Path(r"C:\Users\LalogistiqueElkVelt\Documents\Codex\2026-06-15\cr-e-un-site-web-professionnel\outputs\assets\logo-elk-velt-sharp.png")
card_out = Path(r"C:\Users\LalogistiqueElkVelt\Documents\Codex\2026-06-15\cr-e-un-site-web-professionnel\outputs\carte-affaires-logo-site-net.png")

card = Image.open(card_path).convert("RGBA")

# Crop only the main logo block from the business card, without the slogan line.
logo_crop = card.crop((0, 8, 735, 205))

# Make the white card background transparent while preserving the exact navy/gold pixels.
pixels = logo_crop.load()
for y in range(logo_crop.height):
    for x in range(logo_crop.width):
        r, g, b, a = pixels[x, y]
        if r > 242 and g > 242 and b > 242:
            pixels[x, y] = (r, g, b, 0)

logo_out.parent.mkdir(parents=True, exist_ok=True)
logo_crop.save(logo_out)

# Rebuild the card with the exact sharp logo source and clean the old logo zone.
new_card = card.copy()
clear_box = (0, 0, 760, 292)
new_card.alpha_composite(
    Image.new("RGBA", (clear_box[2] - clear_box[0], clear_box[3] - clear_box[1]), (255, 255, 255, 255)),
    clear_box[:2],
)

# The logo is already card-native resolution, so avoid scaling.
new_card.alpha_composite(logo_crop, (0, 8))
new_card.convert("RGB").save(card_out, quality=96)

print(logo_out)
print(card_out)
