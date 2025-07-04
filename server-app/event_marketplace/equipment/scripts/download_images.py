# download_images.py
import os
import requests
from django.core.files import File
from django.core.files.temp import NamedTemporaryFile
from equipment.models import Equipment

def download_images():
    for eq in Equipment.objects.all():
        if eq.image or not eq.image_url:
            continue  # Skip if already downloaded or no URL

        try:
            response = requests.get(eq.image_url, timeout=10)
            response.raise_for_status()

            img_temp = NamedTemporaryFile(delete=True)
            img_temp.write(response.content)
            img_temp.flush()

            file_ext = eq.image_url.split('.')[-1].split('?')[0][:4]  # crude extension guess
            filename = f"{eq.pk}.{file_ext}"

            eq.image.save(filename, File(img_temp), save=True)
            print(f"Saved image for equipment ID {eq.pk}")
        except Exception as e:
            print(f"Failed for ID {eq.pk}: {e}")
