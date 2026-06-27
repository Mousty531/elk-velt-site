import io
import os

import pdfplumber
from PIL import Image

PDF_PATH = r"C:\Users\LalogistiqueElkVelt\Downloads\kicks+2025_ (5).pdf"
OUT_DIR = r"C:\Users\LalogistiqueElkVelt\Documents\Codex\2026-06-15\cr-e-un-site-web-professionnel\outputs\assets\parts"

os.makedirs(OUT_DIR, exist_ok=True)

with pdfplumber.open(PDF_PATH) as pdf:
    page = pdf.pages[0]
    images = sorted(page.images, key=lambda item: item["top"])
    for index, image_info in enumerate(images, 1):
        data = image_info["stream"].get_data()
        image = Image.open(io.BytesIO(data)).convert("RGB")
        path = os.path.join(OUT_DIR, f"part-{index:02d}.jpg")
        image.save(path, quality=92)
        print(index, image_info.get("name"), image.size, path)
