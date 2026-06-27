from pathlib import Path

from PIL import Image, ImageFilter

card_path = Path(r"C:\Users\LalogistiqueElkVelt\Downloads\Image jointe par l’utilisateur.png")
logo_path = Path(r"C:\Users\LalogistiqueElkVelt\Downloads\ChatGPT Image 16 juin 2026, 00_19_55.png")
out_path = Path(r"C:\Users\LalogistiqueElkVelt\Documents\Codex\2026-06-15\cr-e-un-site-web-professionnel\outputs\carte-affaires-nouveau-logo.png")
site_logo_out = Path(r"C:\Users\LalogistiqueElkVelt\Documents\Codex\2026-06-15\cr-e-un-site-web-professionnel\outputs\assets\logo-elk-velt-nouveau.png")

card = Image.open(card_path).convert("RGBA")
logo = Image.open(logo_path).convert("RGBA")

# Crop the whitespace around the supplied logo.
alpha_mask = Image.new("L", logo.size, 0)
mask_pixels = alpha_mask.load()
logo_pixels = logo.load()
for y in range(logo.height):
    for x in range(logo.width):
        r, g, b, a = logo_pixels[x, y]
        if not (r > 244 and g > 244 and b > 244):
            mask_pixels[x, y] = 255

bbox = alpha_mask.getbbox()
if bbox:
    logo = logo.crop(bbox)

# Remove the white background while preserving the logo artwork and soft edges.
logo = logo.convert("RGBA")
pixels = logo.load()
for y in range(logo.height):
    for x in range(logo.width):
        r, g, b, a = pixels[x, y]
        if r > 246 and g > 246 and b > 246:
            pixels[x, y] = (255, 255, 255, 0)

site_logo_out.parent.mkdir(parents=True, exist_ok=True)
logo.save(site_logo_out)

# Clear the old logo/slogan area of the card only.
clear_box = (0, 0, 485, 178)
card.alpha_composite(
    Image.new("RGBA", (clear_box[2] - clear_box[0], clear_box[3] - clear_box[1]), (255, 255, 255, 255)),
    clear_box[:2],
)

# Fit the new logo into the top-left brand area without covering the truck image.
target_width = 455
scale = target_width / logo.width
target_height = round(logo.height * scale)
if target_height > 145:
    target_height = 145
    target_width = round(logo.width * (target_height / logo.height))

logo_card = logo.resize((target_width, target_height), Image.Resampling.LANCZOS)
logo_card = logo_card.filter(ImageFilter.UnsharpMask(radius=1.0, percent=115, threshold=2))

x = 8
y = 20
card.alpha_composite(logo_card, (x, y))

card.convert("RGB").save(out_path, quality=96)
print(site_logo_out)
print(out_path)
