"""
Ingredient-detection service for the Jood app.

Given one photo of a kitchen, fridge shelf or counter, this module asks a
vision-language model what edible items are in it and returns them in the shape
`models.ingredient.DetectedIngredient` expects: a plain English ingredient name
and a confidence. The user confirms or corrects that list in the app, and the
confirmed names become the `ingredients` field of a recipe-generation request.

The model call, the prompt, the tiling rule and the merge below are identical to
the ones measured in `detection_benchmark/`:

    22 held-out images, 103 ingredient labels, one run, no confidence floor
    F1 0.926   precision 0.940   recall 0.913
    deepseek-flash, temperature 0, top_p 1, prompt SHA-256 0f3581548932546e

Changing PROMPT, MAX_PX, CROWDED_AT, GRID or OVERLAP invalidates that number.
If any of them has to change, re-run the benchmark and update both places.

Two mechanisms carry most of the accuracy:

* Adaptive tiling. The endpoint caps every image at a fixed token budget, so in a
  crowded scene each product lands at 20-40 px and the model starts inventing
  plausible brand names instead of reading them. A photo whose first pass returns
  CROWDED_AT or more items is re-scanned as overlapping tiles. Tiles are issued in
  parallel, so a crowded photo costs one extra call of latency, not four.
* Semantic merge. The full image may return "cream" where a tile returns "analogue
  cream" for the same can. Entries fold when one token set contains the other, and
  the more specific name survives. Items the model explicitly declined to identify
  are dropped rather than surfaced to the user as inventions.

Low-confidence items are returned, not hidden: the product shows the user what it
saw and lets them delete what is wrong. A floor here would silently lose real
ingredients, which is the more expensive error.

Latency is 13-20 s for an ordinary photo and up to ~45 s for a crowded one that
triggers tiling.
"""

import asyncio
import base64
import io
import json
import logging
import os
import random
import re
import time
from concurrent.futures import ThreadPoolExecutor
from functools import lru_cache
from pathlib import Path
from typing import Any, cast

import httpx
from dotenv import load_dotenv
from fastapi import HTTPException
from openai import OpenAI
from PIL import Image

load_dotenv(Path(__file__).resolve().parent.parent / ".env")
logger = logging.getLogger(__name__)

# iPhone photos arrive as HEIC. Optional so a missing wheel cannot stop the API
# from booting; JPEG and PNG keep working either way.
try:
    import pillow_heif

    pillow_heif.register_heif_opener()
except Exception:  # noqa: BLE001 - absence is not an error
    logger.warning("pillow-heif is not installed; HEIC uploads will be rejected.")


# Configuration

MODEL = os.getenv("DEEPSEEK_MODEL", "deepseek-flash")

MAX_PX = 1300          # the endpoint downsamples beyond this anyway
CROWDED_AT = 7         # first-pass item count that triggers tiling
GRID = 2               # GRID x GRID tiles
OVERLAP = 0.15         # tile overlap, so an object on a seam is not cut in half
MAX_ATTEMPTS = 3       # transient upstream failures are retried
JPEG_QUALITY = 88
MAX_UPLOAD_BYTES = 25 * 1024 * 1024

UNIDENTIFIED = "unidentified"


# Prompt
#
# Rule 3 states a general linguistic pattern, not a product. Never add an example
# drawn from the benchmark images: tuning the prompt on the test set is how a
# benchmark stops measuring anything.

PROMPT = """You are a kitchen inventory scanner for a Saudi Arabian household.

List EVERY distinct edible item visible in this photo: fresh produce, meat, dairy,
packaged and canned goods, bottles, jars, spices, bread, drinks.

RULES
1. Maximise recall. If you can see it, list it, even if you are unsure what it is.
2. One entry per distinct product. The same product repeated is one entry with a count.
3. ingredient_en names the FOOD ITSELF, never its packing medium, flavour, cut or
   container. Labels of the form "<food> in <liquid>", "<flavour> flavour <food>",
   "<preparation> <food>" and "<food> in <container>" all reduce to <food>.
4. visible_text must be text you can actually READ in the image, copied verbatim.
   Never reconstruct a label from memory of what a brand usually looks like.
5. If you cannot read the label, set brand and product_name to null and give the
   generic food name with a low confidence. If you cannot tell what the food is at
   all, use ingredient_en "unidentified item". Guessing a brand is worse than null.
6. Do NOT list non-food objects: utensils, bags, containers, shelves, appliances.
7. Work systematically from top-left to bottom-right, then sweep the image once more
   for anything you skipped and append it before returning.

Return ONLY this JSON, no markdown fence:
{"items":[{"ingredient_en":"milk","ingredient_ar":"حليب","brand":"Almarai or null",
"product_name":"full product name or null","visible_text":"text you can read or null",
"count":1,"confidence":0.9}]}"""


# DeepSeek client


@lru_cache(maxsize=1)
def get_client() -> OpenAI:
    """Build a cached DeepSeek client using its OpenAI-compatible API.

    Separate from the recipe service's client: a vision call carries a base64
    image and needs a longer read timeout than a text completion.
    """

    api_key = os.getenv("DEEPSEEK_API_KEY")

    if not api_key:
        raise RuntimeError(
            "DEEPSEEK_API_KEY is not configured."
        )

    http_client = httpx.Client(
        timeout=httpx.Timeout(
            90.0,
            connect=10.0,
        )
    )

    return OpenAI(
        api_key=api_key,
        base_url="https://api.deepseek.com",
        http_client=cast(Any, http_client),
        max_retries=0,
    )


# Image handling


def open_image(payload: bytes) -> Image.Image:
    """Decode uploaded bytes into RGB, whatever the phone produced."""

    try:
        return Image.open(io.BytesIO(payload)).convert("RGB")
    except Exception as error:  # noqa: BLE001
        raise HTTPException(
            status_code=400,
            detail="The uploaded file is not a readable image.",
        ) from error


def encode(image: Image.Image) -> str:
    """Downscale to the endpoint's effective limit and base64-encode as JPEG."""

    width, height = image.size
    scale = min(1.0, MAX_PX / max(width, height))

    if scale < 1:
        image = image.resize(
            (
                int(width * scale),
                int(height * scale),
            )
        )

    buffer = io.BytesIO()
    image.save(buffer, "JPEG", quality=JPEG_QUALITY)

    return base64.b64encode(buffer.getvalue()).decode()


def make_tiles(image: Image.Image) -> list[Image.Image]:
    """Cut the photo into GRID x GRID overlapping tiles."""

    width, height = image.size
    tile_w, tile_h = width / GRID, height / GRID
    pad_x, pad_y = tile_w * OVERLAP, tile_h * OVERLAP

    tiles = []

    for row in range(GRID):
        for col in range(GRID):
            box = (
                int(max(0, col * tile_w - pad_x)),
                int(max(0, row * tile_h - pad_y)),
                int(min(width, (col + 1) * tile_w + pad_x)),
                int(min(height, (row + 1) * tile_h + pad_y)),
            )
            tiles.append(image.crop(box))

    return tiles


# Model call


def strip_fence(text: str) -> str:
    """Some providers wrap JSON in ```json ... ``` despite the instruction not to."""

    cleaned = (text or "").strip()

    if cleaned.startswith("```"):
        cleaned = re.sub(r"^```[a-zA-Z]*\s*", "", cleaned)
        cleaned = re.sub(r"\s*```$", "", cleaned)

    return cleaned


def call_deepseek(image: Image.Image) -> list[dict[str, Any]]:
    """Make one synchronous vision call and return its raw item list."""

    payload = encode(image)

    response = get_client().chat.completions.create(
        model=MODEL,
        temperature=0,          # pinned: the sampler must add no variance
        top_p=1,
        response_format={
            "type": "json_object",
        },
        messages=[
            {
                "role": "user",
                "content": [
                    {
                        "type": "image_url",
                        "image_url": {
                            "url": "data:image/jpeg;base64," + payload,
                        },
                    },
                    {
                        "type": "text",
                        "text": PROMPT,
                    },
                ],
            }
        ],
        stream=False,
    )

    parsed = json.loads(strip_fence(response.choices[0].message.content))
    items = parsed.get("items")

    if not isinstance(items, list):
        raise ValueError("The vision response contained no 'items' list.")

    return [item for item in items if isinstance(item, dict)]


def call_with_retry(image: Image.Image) -> list[dict[str, Any]]:
    """One vision call, retried with exponential backoff and jitter.

    Runs inside a worker thread, so sleeping here never blocks the event loop.
    """

    last_error: Exception | None = None

    for attempt in range(1, MAX_ATTEMPTS + 1):
        try:
            return call_deepseek(image)
        except Exception as error:  # noqa: BLE001 - retry anything transient
            last_error = error
            logger.warning(
                "Vision call failed on attempt %d/%d: %s",
                attempt,
                MAX_ATTEMPTS,
                error,
            )

            if attempt < MAX_ATTEMPTS:
                time.sleep(2 ** (attempt - 1) + random.uniform(0, 0.5))

    raise RuntimeError(
        f"The vision model failed after {MAX_ATTEMPTS} attempts: {last_error}"
    )


# Merge


def canonical(name: str | None) -> frozenset[str]:
    """Token set with crude singularisation: 'Carrots' -> {carrot}."""

    words = set()

    for word in re.sub(r"[^a-z0-9 ]", " ", (name or "").lower()).split():
        if len(word) > 3 and word.endswith("s") and not word.endswith("ss"):
            word = word[:-1]
        words.add(word)

    return frozenset(words)


def merge(item_lists: list[list[dict[str, Any]]]) -> list[dict[str, Any]]:
    """Fold the full-image pass and the tile passes into one list.

    Two entries describe the same object when one token set contains the other, so
    "cream" folds into "analogue cream" and "carrots" into "carrot"; the more
    specific name survives. Entries the model declined to identify are dropped:
    they make no claim, so showing them to the user as detections would be noise.
    """

    flat = [item for items in item_lists for item in items]

    flat.sort(
        key=lambda it: (
            -len(canonical(it.get("ingredient_en"))),
            -float(it.get("confidence") or 0.0),
        )
    )

    kept: list[dict[str, Any]] = []

    for item in flat:
        name = (item.get("ingredient_en") or "").strip()

        if not name or UNIDENTIFIED in name.lower():
            continue

        current = canonical(name)
        absorbed = False

        for seen in kept:
            other = canonical(seen["ingredient_en"])

            if current <= other or other <= current:
                absorbed = True
                break

        if not absorbed:
            kept.append(dict(item))

    return kept


def to_response(items: list[dict[str, Any]]) -> list[dict[str, Any]]:
    """Reduce the model's rich item to what DetectedIngredient exposes.

    Names are lower-cased so they match the ingredient sets the recipe service
    compares against, and the list is ordered most-confident first so the user
    reviews the certain items before the doubtful ones.
    """

    rows = []

    for item in items:
        name = (item.get("ingredient_en") or "").strip().lower()

        if not name:
            continue

        try:
            confidence = float(item.get("confidence"))
        except (TypeError, ValueError):
            confidence = 0.5

        rows.append(
            {
                "name": name,
                "confidence": round(min(max(confidence, 0.0), 1.0), 2),
            }
        )

    rows.sort(key=lambda row: -row["confidence"])

    return rows


# Entry point


def detect(payload: bytes) -> list[dict[str, Any]]:
    """Synchronous detection: bytes in, [{name, confidence}] out."""

    image = open_image(payload)
    first = call_with_retry(image)

    if len(first) < CROWDED_AT:
        return to_response(merge([first]))

    logger.info(
        "Crowded photo (%d items on the first pass); re-scanning as %dx%d tiles.",
        len(first),
        GRID,
        GRID,
    )

    tiles = make_tiles(image)

    with ThreadPoolExecutor(max_workers=GRID * GRID) as pool:
        passes = [first, *pool.map(call_with_retry, tiles)]

    return to_response(merge(passes))


async def detect_ingredients_from_image(image) -> list[dict[str, Any]]:
    """Detect the edible items in one uploaded photo.

    `image` is the FastAPI UploadFile from POST /ingredients/detect; raw bytes are
    accepted too, which is what the tests use. The model call is blocking and takes
    seconds, so it runs in a worker thread and the event loop stays free.
    """

    if isinstance(image, (bytes, bytearray)):
        payload = bytes(image)
    else:
        payload = await image.read()

    if not payload:
        raise HTTPException(
            status_code=400,
            detail="The uploaded image is empty.",
        )

    if len(payload) > MAX_UPLOAD_BYTES:
        raise HTTPException(
            status_code=413,
            detail="The uploaded image is larger than 25 MB.",
        )

    try:
        items = await asyncio.to_thread(detect, payload)
    except HTTPException:
        raise
    except RuntimeError as error:
        logger.exception("Ingredient detection failed.")
        raise HTTPException(
            status_code=502,
            detail=str(error),
        ) from error

    logger.info("Detected %d ingredient(s).", len(items))

    return items
