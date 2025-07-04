import csv
from django.core.management.base import BaseCommand
from ...models import User  # Replace 'yourapp' with your app's name
from django.contrib.auth.hashers import make_password

class Command(BaseCommand):
    help = 'Import Users from a CSV file'

    def add_arguments(self, parser):
        parser.add_argument('users.csv', type=str, help='The path to the CSV file to import')

    def handle(self, *args, **kwargs):
        csv_filepath = kwargs['users.csv']
        
        try:
            with open(csv_filepath, newline='', encoding='utf-8') as csvfile:
                reader = csv.DictReader(csvfile)
                count = 0
                for row in reader:
                    if not User.objects.filter(email=row['email']).exists():
                        user = User(
                            name=row['name'],
                            email=row['email'],
                            phone_number=row.get('phone_number', ''),
                            role=row['role'],
                            username=row['email']
                        )
                        user.set_password(row['password'])  # Use set_password to hash the password
                        user.save()
                        count += 1

                self.stdout.write(self.style.SUCCESS(f'Successfully imported {count} households.'))
        except FileNotFoundError:
            self.stderr.write(self.style.ERROR(f'File "{csv_filepath}" not found.'))
        except Exception as e:
            self.stderr.write(self.style.ERROR(f'Error: {e}'))
