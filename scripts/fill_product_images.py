import os
import re
import time
import requests
from supabase import create_client
from dotenv import load_dotenv


# =========================================================
# CONFIG
# =========================================================

load_dotenv("backend/.env")

SUPABASE_URL = os.getenv("SUPABASE_URL")
SUPABASE_KEY = (
    os.getenv("SUPABASE_SERVICE_ROLE_KEY")
    or os.getenv("SUPABASE_KEY")
)

if not SUPABASE_URL or not SUPABASE_KEY:
    raise ValueError("Supabase credentials not found.")

supabase = create_client(SUPABASE_URL, SUPABASE_KEY)

HEADERS = {
    "User-Agent": (
        "Mozilla/5.0 (Windows NT 10.0; Win64; x64) "
        "AppleWebKit/537.36 (KHTML, like Gecko) "
        "Chrome/152.0.0.0 Safari/537.36"
    ),
    "Accept-Language": "en-US,en;q=0.9",
}


# =========================================================
# DANUBE PRODUCT PAGES
# =========================================================

PRODUCT_PAGES = {
    "almonds": "https://danube.sa/en/products/american-raw-almond-kg",
    "apple": "https://danube.sa/en/products/green-apple",
    "asparagus": "https://danube.sa/en/products/freshly-green-asparagus-370g",
    "avocado": "https://danube.sa/en/products/avocado",
    "banana": "https://danube.sa/en/products/banana-pack",
    "barbecue sauce": "https://danube.sa/en/products/freshly-original-bbq-sauce-510g",
    "basil": "https://danube.sa/en/products/freshly-basil-leaves-142g",
    "beef": "https://danube.sa/en/products/danube-beef-slice-thin-steak-kg",
    "bell pepper": "https://danube.sa/en/products/red-bell-pepper-kg",
    "black beans": "https://danube.sa/en/products/freshly-beans-black-15oz",
    "blueberry": "https://danube.sa/en/products/blueberrt-pack",
    "bread": "https://danube.sa/en/products/white-bread-mini-size",
    "broccoli": "https://danube.sa/en/products/brocoli",
    "brown rice": "https://danube.sa/en/products/alwalimah-indian-brown-rice-2-kg-long-grain",
    "bulgur": "https://danube.sa/en/products/coarse-white-bulgur-kg",
    "burger buns": "https://danube.sa/en/products/danube-bakery-german-burger-buns-4-pcs",
    "butter": "https://danube.sa/en/products/shahad-unsalted-butter-1-kg",
    "cabbage": "https://danube.sa/en/products/cabbage-kg",
    "carrot": "https://danube.sa/en/products/carrot-kg",
    "cauliflower": "https://danube.sa/en/products/cauliflower-kg",
    "celery": "https://danube.sa/en/products/celery",
    "cheese": "https://danube.sa/en/products/15534",
    "chicken": "https://danube.sa/en/products/al-watania-poultry-fresh-chicken-breasts-450g",
    "chicken thighs": "https://danube.sa/en/products/radwa_fresh_chicken_thighs_fillet_500g",
    "chickpeas": "https://danube.sa/en/products/beans-more-medium-chickpeas-800g",
    "cilantro": "https://danube.sa/en/products/coriander-green-leaves",
    "cinnamon": "https://danube.sa/en/products/esnad-cinnamon-powder-100g",
    "coconut milk": "https://danube.sa/en/products/freshly-coconut-milk-15oz",
    "cooking cream": "https://danube.sa/en/products/almarai-cooking-cream-1ltr",
    "corn": "https://danube.sa/en/products/freshly-whole-kernel-corn-185-g",
    "couscous": "https://danube.sa/en/products/pastazara-couscous-500-g",
    "cream cheese": "https://danube.sa/en/products/almarai-cream-cheese-24-piece",
    "cucumber": "https://danube.sa/en/products/cucumber-kg",
    "cumin": "https://danube.sa/en/products/majdi-cumin-powder-200g",
    "dates": "https://danube.sa/en/products/arjoon_sukkary_dates_1_kg",
    "dill": "https://danube.sa/en/products/dill-leaves",
    "egg": "https://danube.sa/en/products/baladi-fresh-eggs-30-pieces",
    "eggplant": "https://danube.sa/en/products/eggplant-big-pack",
    "fava beans": "https://danube.sa/en/products/california-garden-plain-fava-beans-medammes-450-g",
    "feta": "https://danube.sa/en/products/danube-feta-cheese-500-g",
    "flour": "https://danube.sa/en/products/best-mix-all-purpose-flour-1kg",
    "garlic": "https://danube.sa/en/products/garlic-kg",
    "ginger": "https://danube.sa/en/products/ginger-kg",
    "granola": "https://danube.sa/en/products/fitness-crunchy-oats-granola-with-chocolate-almonds-and-quinoa-600g",
    "grapes": "https://danube.sa/en/products/rrd-grape-global-kg",
    "green beans": "https://danube.sa/en/products/beans",
    "green onion": "https://danube.sa/en/products/green-onion",
    "ground beef": "https://danube.sa/en/products/trecot-brazilian-ground-beef-500g-500g-500g",
    "heavy cream": "https://danube.sa/en/products/nadec-whipping-cream-500ml",
    "honey": "https://danube.sa/en/products/al-shifa-natural-honey-250g",
    "hot sauce": "https://danube.sa/en/products/danube-hot-sauce-1kg",
    "jasmine rice": "https://danube.sa/en/products/blest-jasmine-rice-5kg",
    "ketchup": "https://danube.sa/en/products/freshly-tomato-ketchup-680g",
    "kidney beans": "https://danube.sa/en/products/freshly-red-kidney-beans-580g",
    "lemon": "https://danube.sa/en/products/lemons-small",
    "lentils": "https://danube.sa/en/products/green-lentils-kg",
    "lettuce": "https://danube.sa/en/products/lettuce-round-espean",
    "mango": "https://danube.sa/en/products/danube-mango-keet",
    "mayonnaise": "https://danube.sa/en/products/noor-mayonnaise-original-2-500ml",
    "milk": "https://danube.sa/en/products/saudia-whole-milk-1-l-1a34047e",
    "mint": "https://danube.sa/en/products/mint-leaves2",
    "mozzarella": "https://danube.sa/en/products/natural-mozzarella-cheese",
    "mushroom": "https://danube.sa/en/products/mushroom-1pack",
    "mustard": "https://danube.sa/en/products/freshly-yellow-mustard-680g",
    "noodles": "https://danube.sa/en/products/sharwood-s-medium-egg-noodles-226-g",
    "oats": "https://danube.sa/en/products/al-alali-white-oats-400g",
    "onion": "https://danube.sa/en/products/onion-bag",
    "orange": "https://danube.sa/en/products/orange-navel-kg",
    "paprika": "https://danube.sa/en/products/spices-and-more-sweet-ground-paprika-210g",
    "parmesan": "https://danube.sa/en/products/danube-parmesan-cheese-kg",
    "parsley": "https://danube.sa/en/products/parsley-leaves",
    "pasta": "https://danube.sa/en/products/treva-spaghetti-400g",
    "peanut butter": "https://danube.sa/en/products/freshly-creamy-peanut-butter-12-oz",
    "peas": "https://danube.sa/en/products/dari-frozen-peas-400g",
    "pineapple": "https://danube.sa/en/products/danube-pineapple-baby",
    "pita bread": "https://danube.sa/en/products/danube-bakery-protein-arabic-bread-medium",
    "potato": "https://danube.sa/en/products/potato-bag",
    "quinoa": "https://danube.sa/en/products/afia-quinoa-white-400-g",
    "rice": "https://danube.sa/en/products/aloha-white-kernel-basmati-rice-5kg",
    "salmon": "https://danube.sa/en/products/salmon-fillet-kg",
    "sardines": "https://danube.sa/en/products/danube_sardines_small_1kg",
    "shrimp": "https://danube.sa/en/products/danube-medium-shrimp-1kg",
    "soy sauce": "https://danube.sa/en/products/kikkoman-soy-sauce-250ml",
    "spinach": "https://danube.sa/en/products/25828",
    "strawberry": "https://danube.sa/en/products/strawberry-pack-a058f327-8e0e-415e-afb6-a7a75d7bba73",
    "sweet potato": "https://danube.sa/en/products/sweet-potato",
    "tahini": "https://danube.sa/en/products/al_jameel_fine_tahini_500g",
    "toast bread": "https://danube.sa/en/products/toast-bread",
    "tomato": "https://danube.sa/en/products/tomato-pack",
    "tomato paste": "https://danube.sa/en/products/al-alali-tomato-paste-220-g",
    "tomato sauce": "https://danube.sa/en/products/freshly-tomato-sauce-15-oz",
    "tortilla": "https://danube.sa/en/products/danube-bakery-tortilla-bread-big-size-400-g",
    "tuna": "https://danube.sa/en/products/tuna-fish-kg",
    "turkey": "https://danube.sa/en/products/siniora-premium-hardwood-smoked-turkey-breast-1kg",
    "turmeric": "https://danube.sa/en/products/esnad-turmeric-powder-100g",
    "vinegar": "https://danube.sa/en/products/freshly-white-vinegar-32oz",
    "white beans": "https://danube.sa/en/products/hayat-white-beans-500g",
    "white fish": "https://danube.sa/en/products/walima-white-fish-fillet-1kg",
    "yogurt": "https://danube.sa/en/products/almarai-fresh-sour-full-fat-yoghurt-170g",
    "zucchini": "https://danube.sa/en/products/zuccini-kg",
}


# =========================================================
# EXTRACT PRICE FROM DANUBE PAGE
# =========================================================

def extract_price(product_url):
    response = requests.get(
        product_url,
        headers=HEADERS,
        timeout=20
    )

    if response.status_code != 200:
        print(f"HTTP {response.status_code}")
        return None

    match = re.search(
        r'"price"\s*:\s*"?([0-9]+(?:\.[0-9]+)?)"?',
        response.text,
        re.IGNORECASE
    )

    if not match:
        return None

    return float(match.group(1))


# =========================================================
# MAIN
# =========================================================

def main():

    print("\n==========================================")
    print(" Jood - Update 100 Danube Prices")
    print("==========================================\n")

    # Get actual products from Supabase
    products = (
        supabase
        .table("products")
        .select("id, ingredient_key, name, price")
        .order("ingredient_key")
        .execute()
        .data
    )

    print(f"Products in DB: {len(products)}")
    print(f"Danube mappings: {len(PRODUCT_PAGES)}\n")

    # Safety check BEFORE touching DB
    db_keys = {
        product["ingredient_key"]
        for product in products
    }

    mapping_keys = set(PRODUCT_PAGES.keys())

    missing = sorted(db_keys - mapping_keys)
    extra = sorted(mapping_keys - db_keys)

    if missing:
        print("STOPPED.")
        print("Products without Danube URL:")
        for item in missing:
            print(f" - {item}")
        return

    if extra:
        print("Extra mappings:")
        for item in extra:
            print(f" - {item}")
        print()

    print("Mapping check passed.")
    print("Starting price update...\n")

    updated = []
    failed = []

    for index, product in enumerate(products, start=1):

        key = product["ingredient_key"]
        name = product["name"]
        old_price = product["price"]

        url = PRODUCT_PAGES[key]

        print("------------------------------------------")
        print(f"[{index}/{len(products)}] {key} - {name}")
        print(f"Old price: {old_price}")
        print(f"Danube: {url}")

        try:
            new_price = extract_price(url)

            if new_price is None:
                print("X PRICE NOT FOUND")
                failed.append(key)
                print()
                time.sleep(0.7)
                continue

            print(f"Danube price: {new_price:.2f} SAR")

            # IMPORTANT:
            # Update PRICE ONLY
            (
                supabase
                .table("products")
                .update({
                    "price": new_price
                })
                .eq("id", product["id"])
                .execute()
            )

            print(
                f"UPDATED: {old_price} -> "
                f"{new_price:.2f} SAR"
            )

            updated.append(key)

        except Exception as error:
            print(f"X ERROR: {error}")
            failed.append(key)

        print()
        time.sleep(0.7)

    print("\n==========================================")
    print(" DONE")
    print("==========================================")
    print(f"Products in DB: {len(products)}")
    print(f"Updated: {len(updated)}")
    print(f"Failed: {len(failed)}")

    if failed:
        print("\nFailed products:")
        for item in failed:
            print(f" - {item}")


if __name__ == "__main__":
    main()