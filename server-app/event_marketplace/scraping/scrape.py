from selenium import webdriver
from selenium.webdriver.common.by import By
from selenium.webdriver.chrome.options import Options
from selenium.webdriver.support.ui import WebDriverWait
from selenium.webdriver.support import expected_conditions as EC
from selenium.common.exceptions import TimeoutException
from bs4 import BeautifulSoup
import time,csv
import os
import pandas as pd

import sys
sys.stdout.reconfigure(encoding='utf-8')

class InfiniteScrollScraperBS4:
    def __init__(self, options, url):
        print("[INIT] Initializing WebDriver")
        options.add_argument('--headless')  # Remove this if you want to see the browser
        options.add_argument('--no-sandbox')
        options.add_argument('--disable-dev-shm-usage')
        self.driver = webdriver.Chrome(options=options)
        self.url = url

    def scroll_until_end(self):
        print("[SCROLL] Starting infinite scroll...")

        last_height = self.driver.execute_script("return document.body.scrollHeight")
        same_scroll_attempts = 0
        max_attempts = 5  # Exit if content doesn't grow after this many tries

        while True:
            self.driver.execute_script("window.scrollBy(0, 400);")  # Scroll small steps
            time.sleep(0.8)  # Shorter wait for smoother and quicker scrolls

            new_height = self.driver.execute_script("return document.body.scrollHeight")

            if new_height == last_height:
                same_scroll_attempts += 1
                if same_scroll_attempts >= max_attempts:
                    print("[SCROLL] Reached the bottom or no more new content.")
                    break
            else:
                same_scroll_attempts = 0

            last_height = new_height

    def extract_listings(self):
        self.driver.get(self.url)

        # Initial wait for important elements
        try:
            WebDriverWait(self.driver, 10).until(
                EC.presence_of_all_elements_located((By.CSS_SELECTOR, 'div.b-list-advert__gallery__item.js-advert-list-item'))
            )
        except TimeoutException:
            print("Timed out waiting for the element to be present.")
        except Exception as e:
            print(f"An error occurred: {e}")

       # self.scroll_until_end()
        time.sleep(5)

        print("[EXTRACT] Collecting all listings with BeautifulSoup...")

        # Get the page source after scrolling
        page_source = self.driver.page_source
        soup = BeautifulSoup(page_source, 'html.parser')

        # Find all masonry items (listings)
        elements = soup.select('div.b-list-advert__gallery__item.js-advert-list-item')

        print(f"[FOUND] Total listings found: {len(elements)}")

        data_dict = []

        for listing in elements:
            data = {}
            # Extract title
            title_elem = listing.find('div', class_='b-advert-title-inner')
            data['title'] = title_elem.get_text(strip=True) if title_elem else 'N/A'



            # Extract price
            price_elem = listing.find('div', class_='qa-advert-price')
            data['price'] = price_elem.get_text(strip=True) if price_elem else 'N/A'

            # Extract location
            location_elem = listing.find('span', class_='b-list-advert__region__text')
            data['location'] = location_elem.get_text(strip=True) if location_elem else 'Nairobi, Unknown'
            
            # Extract description
            desc_elem = listing.find('div', class_='b-list-advert-base__description-text')
            data['description'] = desc_elem.get_text(strip=True) if desc_elem else 'N/A'

            # Extract condition
            condition_elem = listing.find('div', class_='b-list-advert-base__item-attr')
            data['condition'] = condition_elem.get_text(strip=True) if condition_elem else 'N/A'

            # Extract premium status
            premium_icon = listing.find('img', attrs={'src': 'https://assets.jijistatic.com/static/img/premium-landing/enterprise.svg'})
            data['premium'] = premium_icon is not None

            # Extract image URL
            source_elem = listing.find('source', {'type': 'image/webp'})
            if source_elem and 'srcset' in source_elem.attrs:
                data['image_url'] = source_elem['srcset'].split()[0]
            else:
                # Fallback to <img> if <source> is missing
                image_elem = listing.find('img')
                data['image_url'] = image_elem['src'] if image_elem else 'N/A'

            print(f"[DATA] {data}")
            data_dict.append(data)

        self.driver.quit()
        return data_dict




class CSVWriter:
    def __init__(self, data, filename):
        self.filename = filename
        self.data = data

    def write_csv(self):
        with open(self.filename, mode='w', newline='', encoding='utf-8') as file:
            writer = csv.DictWriter(file, fieldnames=self.data[0].keys())
            writer.writeheader()
            for row in self.data:
                writer.writerow(row)

# Example usage
if __name__ == '__main__':
    options = Options()
    scraper_2 = InfiniteScrollScraperBS4(options, 'https://jiji.co.ke/furniture')
    listings_2 = scraper_2.extract_listings()
    filename_2 = 'furniture.csv'
    csv_writer_2 = CSVWriter(listings_2, filename_2)
    csv_writer_2.write_csv()

    items = [
    'projectors',
    'projection screens',
    'DSLR cameras',
    'video cameras',
    'tripods',
    'camera gimbals',
    'microphones',
    'wireless mic systems',
    'PA systems',
    'speakers',
    'mixing consoles',
    'audio interfaces',
    'LED stage lights',
    'moving head lights',
    'spotlights',
    'uplighting kits',
    'lighting stands',
    'fog machines',
    'laser lights',
    'TV screens',
    'monitors',
    'switchers',
    'live stream encoders',
    'walkie talkies',
    'extension cords',
    'power distribution units',
    'battery packs',
    'stage trusses',
    'stage risers',
    'drone cameras',
    'event timers',
    'presentation clickers',
    'laptops',
    'tablet stands',
    'teleprompters',
    'video walls'
]

    


    for item in items:
        URL = f'https://jiji.co.ke/furniture?query={item}'
        scraper = InfiniteScrollScraperBS4(options, URL)
        listings = scraper.extract_listings()
        filename = item + '.csv'
        csv_writer = CSVWriter(listings, filename)
        csv_writer.write_csv()

        df = pd.read_csv(filename)
        print("[CSV] CSV file created successfully.")
        print("[CSV] CSV file content:")
        print(df.head())

        for item in listings:
           print("[ITEM]")
           print(item)
