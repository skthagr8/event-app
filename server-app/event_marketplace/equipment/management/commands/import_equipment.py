import csv
from django.core.management.base import BaseCommand
from ...models import Equipment, Category  # Replace 'yourapp' with your app's name
from users.models import User
from django.contrib.auth.hashers import make_password
from pprint import pprint

def str_to_bool(value):
    false_values = {'false', '0', 'no', 'off'}
    true_values = {'true', '1', 'yes', 'on'}
    cleaned_value = str(value).strip().lower()

    if cleaned_value in false_values:
        return False
    elif cleaned_value in true_values:
        return True
    else:
        raise ValueError(f"Invalid boolean value: {value}")

class Command(BaseCommand):
    help = 'Import Categories from a CSV file'

    def add_arguments(self, parser):
        parser.add_argument('updated_equipment_listings', type=str, help='The path to the CSV file to import')

    def handle(self, *args, **kwargs):
        csv_filepath = kwargs['updated_equipment_listings']
        
        try:
            with open(csv_filepath, newline='', encoding='utf-8') as csvfile:
                reader = csv.DictReader(csvfile)
                if reader.fieldnames is None:
                    raise ValueError("CSV file is empty or missing header row.")
                reader.fieldnames = [field.strip().lower() for field in reader.fieldnames]
                count = 0
                row_list = []
                for row in reader:
                    row_list.append(row)
                for row in row_list:
                    print(f"Row keys: {row.keys()}")

                    try:
                        category_name = row['category'].strip()
                        category = Category.objects.get(name__iexact=category_name) 

                        equipment = Equipment(
                            vendor=User.objects.get(id=row['user_id'].strip()), 
                            category=category,
                            image=row['image_url'].strip() if row.get('image_url') else None,
                            name=row['title'].strip(),
                            description=row['description'].strip(),
                            price_per_day=float(row['rent_price_per_day'].strip()),
                            buying_price=float(row['price'].strip()),
                            quantity=int(row['quantity'].strip()),
                            is_available=str_to_bool(row['is_available'].strip()),
                            is_premium=str_to_bool(row['premium'].strip()),
                            for_sale=str_to_bool(row['for_sale'].strip()),
                            condition=row['condition'].strip(),
                        )
                        equipment.save()
                        count += 1
                    except Category.DoesNotExist:
                        category = Category.objects.create(name=category_name)
                    except User.DoesNotExist:
                        self.stderr.write(self.style.ERROR(f'User with ID {row["user_id"].strip()} does not exist.'))
                        continue
                    except Exception as e:
                        self.stderr.write(self.style.ERROR(f'Error processing row: {e}'))

                    

                self.stdout.write(self.style.SUCCESS(f'Successfully imported {count} items.'))
        except FileNotFoundError:
            self.stderr.write(self.style.ERROR(f'File "{csv_filepath}" not found.'))
        except Exception as e:
            self.stderr.write(self.style.ERROR(f'Error: {e}'))
