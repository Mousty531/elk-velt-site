from pathlib import Path

from PIL import Image, ImageFilter

card_path = Path(r"C:\Users\LalogistiqueElkVelt\Downloads\Image jointe par l’utilisateur.png")
logo_path = Path(r"C:\Users\LalogistiqueElkVelt\Documents\Codex\2026-06-15\cr-e-un-site-web-professionnel\outputs\assets\logo-elk-velt-officiel.png")
out_path = Path(r"C:\Users\LalogistiqueElkVelt\Documents\Codex\2026-06-15\cr-e-un-site-web-professionnel\outputs\carte-affaires-animal-corrige.png")

card = Image.open(card_path).convert("RGBA")
logo = Image.open(logo_path).convert("RGBA")

# Extract only the animal mark from the official logo. Mask out the letter area.
animal = logo.crop((0, 0, 58, 82))
animal_pixels = animal.load()
for y in range(animal.height):
    for x in range(animal.width):
        if (x > 30 and y > 52) or (x > 44 and y > 42):
            r, g, b, a = animal_pixels[x, y]
            animal_pixels[x, y] = (r, g, b, 0)

# Remove transparent margins around the extracted animal.
alpha = animal.getchannel("A")
bbox = alpha.getbbox()
if bbox:
    animal = animal.crop(bbox)

# Enforce the same deep navy used on the current brand materials while keeping alpha edges.
brand_navy = (3, 24, 48)
pixels = animal.load()
for y in range(animal.height):
    for x in range(animal.width):
        r, g, b, a = pixels[x, y]
        if a:
            pixels[x, y] = (*brand_navy, a)

# Clear only the old animal area on the business card, leaving the ELK letters intact.
clear_box = (0, 28, 82, 134)
card.alpha_composite(
    Image.new("RGBA", (clear_box[2] - clear_box[0], clear_box[3] - clear_box[1]), (255, 255, 255, 255)),
    clear_box[:2],
)

# Resize the official animal to match the visual scale of the original card mark.
target_height = 92
target_width = round(animal.width * (target_height / animal.height))
animal_large = animal.resize((target_width, target_height), Image.Resampling.LANCZOS)
animal_large = animal_large.filter(ImageFilter.UnsharpMask(radius=1.0, percent=130, threshold=2))

card.alpha_composite(animal_large, (3, 31))
card.convert("RGB").save(out_path, quality=96)
print(out_path)
