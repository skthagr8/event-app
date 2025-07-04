import os
from urllib.parse import urlparse
from django.core.files import File
from django.core.management.base import BaseCommand
from django.conf import settings
from equipment.models import Equipment  # Adjust if your model/app name differs

class Command(BaseCommand):
    help = 'Import locally downloaded equipment images into the database'

    def handle(self, *args, **kwargs):
        # Directory where images were downloaded
        image_dir = os.path.join(settings.MEDIA_ROOT, 'downloaded_images')

        if not os.path.isdir(image_dir):
            self.stdout.write(self.style.ERROR(f"❌ Directory does not exist: {image_dir}"))
            return

        equipments = Equipment.objects.filter(image_url__startswith='http').exclude(image__isnull=False).exclude(image__exact='')
        self.stdout.write(f"Found {equipments.count()} equipment entries to update.")

        for equipment in equipments:
            try:
                filename = os.path.basename(urlparse(equipment.image_url).path)
                if isinstance(filename, bytes):
                    filename = filename.decode('utf-8')
                image_path = os.path.join(image_dir, filename)

                if os.path.isfile(image_path):
                    with open(image_path, 'rb') as img_file:
                        equipment.image.save(filename, File(img_file), save=True)
                        self.stdout.write(self.style.SUCCESS(f"✓ Saved image for: {equipment.name}"))
                else:
                    self.stdout.write(self.style.WARNING(f"⚠ Image not found for: {equipment.name} -> {filename}"))

            except Exception as e:
                self.stdout.write(self.style.ERROR(f"❌ Error processing {equipment.name}: {str(e)}"))

        self.stdout.write(self.style.SUCCESS("✔ Local image import completed."))
