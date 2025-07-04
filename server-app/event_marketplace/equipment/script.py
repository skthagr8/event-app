import os, requests
from django.core.files.base import ContentFile
from .models import Equipment
import django

os.environ.setdefault("DJANGO_SETTINGS_MODULE", "event_marketplace.settings")
django.setup()

def download_and_save_images():
    for item in Equipment.objects.all():
        if item.image_url and not item.image:
            try:
                response = requests.get(item.image_url)
                if response.status_code == 200:
                    filename = os.path.basename(item.image_url)
                    item.image.save(filename, ContentFile(response.content), save=True)
            except Exception as e:
                print(f"Failed to download {item.image_url}: {e}")
