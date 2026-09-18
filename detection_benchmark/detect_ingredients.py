#!/usr/bin/env python3
"""
Recipe Station - ingredient detection from a kitchen photo.

Sends each photo to a vision-language model and returns the edible items it contains,
as structured JSON: English and Arabic name, brand, product name, readable label text,
count and a confidence. This is the detection stage of the Recipe Station pipeline; the
confirmed items feed recipe generation and the missing-ingredient list downstream.

Pipeline
--------
One pass over every image listed in the ground truth. An image whose first pass returns
CROWDED_AT or more items is re-scanned as overlapping tiles and the results merged,
because the vision endpoint caps every image at a fixed token budget: in a dense scene
each product ends up at 20-40 px and the model starts inventing plausible brand names
instead of reading them. Tiles are issued in parallel, so a crowded image costs roughly
one extra call of wall-clock time, not four.

Merging is semantic, not string equality: the full image may return "cream" while a tile
returns "analogue cream" for the same can. Entries the model explicitly declined to
identify are dropped rather than scored as hallucinations. Low-confidence entries are
KEPT - thresholding is a scoring decision and belongs in evaluate_detection.py, so a
threshold can be swept over saved predictions at zero API cost.

Providers
---------
Every provider is reached through the same OpenAI-compatible client; only the key, base
URL and model name differ. Nothing else in the pipeline is provider-aware, which is what
makes a provider comparison a fair one: same prompt (same SHA-256), same tiling, same
merge, same scorer.

Reproducibility
---------------
These endpoints expose no `seed` parameter, and no hosted LLM is bit-reproducible even at
temperature 0 (batched kernels and MoE routing make it non-deterministic). Chasing a
single "stable" run is therefore the wrong goal. Instead:
  * decoding is pinned (temperature 0, top_p 1) so the sampler adds no extra variance;
  * every run records its full provenance - provider, model, decoding parameters, a
    SHA-256 of the exact prompt and the pipeline settings - so a number can always be
    traced back to the configuration that produced it;
  * `--runs N` repeats the whole benchmark N times into separate files, and
    evaluate_detection.py reports mean +/- standard deviation across them.

Nothing needs editing: the image folder is located by matching filenames against the
ground truth, and the API key is read from Colab Secrets or the environment. Every
setting is also overridable from the command line.

Usage
-----
    python detect_ingredients.py                            # -> predictions.json
    python detect_ingredients.py --gt-file ground_truth_test.json \
                                --out-file predictions_test.json
    python detect_ingredients.py --provider gemini --list-models
    python detect_ingredients.py --runs 3                   # predictions.run1.json ...
"""
from __future__ import annotations

import argparse
import base64
import glob
import hashlib
import io
import json
import os
import platform
import random
import re
import sys
import time
from concurrent.futures import ThreadPoolExecutor
from dataclasses import dataclass, asdict
from datetime import datetime, timezone
from typing import Any, Iterable, Sequence

import pillow_heif
from PIL import Image
from openai import OpenAI

pillow_heif.register_heif_opener()

Item = dict[str, Any]

# --------------------------------------------------------------------------- defaults
# Adding a provider is three lines here and nothing anywhere else. The key itself is
# never written into the file: only the NAME of the secret that holds it.
PROVIDERS = {
    "deepseek": dict(base_url="https://api.deepseek.com",
                     key_env="DEEPSEEK_API_KEY",
                     model="deepseek-flash"),
    "gemini":   dict(base_url="https://generativelanguage.googleapis.com/v1beta/openai/",
                     key_env="GEMINI_API_KEY",
                     model="gemini-2.5-flash"),
}

DEFAULTS = dict(
    gt_file="ground_truth_dev.json",
    out_file="predictions.json",
    provider="deepseek",
    model="",             # blank -> the provider default
    base_url="",          # blank -> the provider default
    max_px=1300,          # the endpoint downsamples beyond this anyway
    crowded_at=7,         # first-pass item count that triggers tiling
    grid=2,               # grid x grid tiles
    overlap=0.15,         # tile overlap, so an object on a seam is not cut in half
    weak_below=0.6,       # reported only; filtering happens in evaluate_detection.py
    workers=6,            # images in parallel
    tile_workers=4,       # tiles of one image in parallel
    max_retries=4,        # transient API failures are retried with backoff
    runs=1,
)

EXTENSIONS = (".jpg", ".jpeg", ".png", ".heic", ".heif", ".webp")
SEARCH_ROOTS = ("/content/drive/MyDrive", ".", os.path.expanduser("~"))
MAX_DEPTH = 5
UNIDENTIFIED = "unidentified"

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


# --------------------------------------------------------------------------- config
@dataclass(frozen=True)
class Config:
    gt_file: str
    out_file: str
    provider: str
    model: str
    base_url: str
    max_px: int
    crowded_at: int
    grid: int
    overlap: float
    weak_below: float
    workers: int
    tile_workers: int
    max_retries: int
    runs: int


def parse_args(argv: Sequence[str] | None = None) -> tuple[Config, bool]:
    p = argparse.ArgumentParser(description=__doc__,
                                formatter_class=argparse.RawDescriptionHelpFormatter)
    for name, value in DEFAULTS.items():
        p.add_argument(f"--{name.replace('_', '-')}", dest=name,
                       type=type(value), default=value,
                       help=f"default: {value}")
    p.add_argument("--list-models", action="store_true",
                   help="print the models this key can reach, then exit")
    args = p.parse_args(argv)
    if args.provider not in PROVIDERS:
        p.error(f"--provider must be one of: {', '.join(PROVIDERS)}")
    if not 0.0 <= args.overlap < 0.5:
        p.error("--overlap must be in [0.0, 0.5)")
    if args.grid < 1 or args.runs < 1 or args.workers < 1:
        p.error("--grid, --runs and --workers must be >= 1")
    preset = PROVIDERS[args.provider]
    args.model = args.model or preset["model"]
    args.base_url = args.base_url or preset["base_url"]
    listing = args.list_models
    del args.list_models
    return Config(**vars(args)), listing


# --------------------------------------------------------------------------- setup
def read_ground_truth_keys(path: str) -> set[str]:
    with open(path, encoding="utf-8") as handle:
        return {k for k in json.load(handle) if not k.startswith("_")}


def find_image_dir(keys: set[str]) -> str:
    """Locate the image folder by matching filenames against the ground-truth keys."""
    best_dir, best_hits = None, 0
    for root in SEARCH_ROOTS:
        if not os.path.isdir(root):
            continue
        root_depth = root.rstrip(os.sep).count(os.sep)
        for dirpath, dirnames, filenames in os.walk(root):
            if dirpath.count(os.sep) - root_depth >= MAX_DEPTH:
                dirnames[:] = []
                continue
            dirnames[:] = [d for d in dirnames if not d.startswith(".")]
            stems = {os.path.splitext(f)[0] for f in filenames
                     if f.lower().endswith(EXTENSIONS)}
            hits = len(keys & stems)
            if hits > best_hits:
                best_dir, best_hits = dirpath, hits
        if best_hits == len(keys):
            break

    if best_dir is None:
        raise SystemExit(
            "Could not find the image folder.\n"
            f"Looked under: {', '.join(SEARCH_ROOTS)}\n"
            "Make sure Google Drive is mounted and the ground truth sits next to this script.")
    print(f"images folder  : {best_dir}   ({best_hits}/{len(keys)} ground-truth files matched)")
    return best_dir


def make_client(cfg: Config) -> OpenAI:
    """Same OpenAI client for every provider; only the key, base URL and model differ,
    which is what keeps a provider comparison fair."""
    env = PROVIDERS[cfg.provider]["key_env"]
    key = ""
    try:                                              # Colab
        from google.colab import userdata
        key = (userdata.get(env) or "").strip()
    except Exception:                                 # local / CI
        pass
    key = key or (os.environ.get(env) or "").strip()
    if not key:
        raise SystemExit(f"{env} not found. In Colab: Secrets -> add {env} -> enable "
                         f"Notebook access. Locally: export {env}=...")
    return OpenAI(api_key=key, base_url=cfg.base_url)


# --------------------------------------------------------------------------- vision
def encode(image: Image.Image, max_px: int) -> str:
    width, height = image.size
    scale = min(1.0, max_px / max(width, height))
    if scale < 1:
        image = image.resize((int(width * scale), int(height * scale)))
    buffer = io.BytesIO()
    image.save(buffer, "JPEG", quality=88)
    return base64.b64encode(buffer.getvalue()).decode()


def strip_fence(text: str) -> str:
    """Some providers wrap JSON in ```json ... ``` despite the instruction not to."""
    cleaned = (text or "").strip()
    if cleaned.startswith("```"):
        cleaned = re.sub(r"^```[a-zA-Z]*\s*", "", cleaned)
        cleaned = re.sub(r"\s*```$", "", cleaned)
    return cleaned


def ask(client: OpenAI, image: Image.Image, cfg: Config) -> list[Item]:
    """One vision call, retried with exponential backoff on transient failures."""
    payload = encode(image, cfg.max_px)
    last_error: Exception | None = None
    for attempt in range(cfg.max_retries):
        try:
            response = client.chat.completions.create(
                model=cfg.model,
                temperature=0,          # pinned: the sampler must add no variance
                top_p=1,
                response_format={"type": "json_object"},
                messages=[{"role": "user", "content": [
                    {"type": "image_url",
                     "image_url": {"url": "data:image/jpeg;base64," + payload}},
                    {"type": "text", "text": PROMPT}]}])
            parsed = json.loads(strip_fence(response.choices[0].message.content))
            items = parsed.get("items")
            if not isinstance(items, list):
                raise ValueError(f"response has no 'items' list: {parsed!r}"[:200])
            return [it for it in items if isinstance(it, dict)]
        except Exception as error:                     # noqa: BLE001 - retry anything transient
            last_error = error
            if attempt == cfg.max_retries - 1:
                break
            time.sleep(2 ** attempt + random.uniform(0, 0.5))
    raise RuntimeError(f"failed after {cfg.max_retries} attempts: {last_error}")


# --------------------------------------------------------------------------- tiling
def make_tiles(image: Image.Image, grid: int, overlap: float) -> list[Image.Image]:
    width, height = image.size
    tile_w, tile_h = width / grid, height / grid
    pad_x, pad_y = tile_w * overlap, tile_h * overlap
    tiles = []
    for row in range(grid):
        for col in range(grid):
            box = (int(max(0, col * tile_w - pad_x)),
                   int(max(0, row * tile_h - pad_y)),
                   int(min(width, (col + 1) * tile_w + pad_x)),
                   int(min(height, (row + 1) * tile_h + pad_y)))
            tiles.append(image.crop(box))
    return tiles


def canonical(name: str | None) -> frozenset[str]:
    """Token set with crude singularisation: 'Carrots' -> {carrot}."""
    words = set()
    for word in re.sub(r"[^a-z0-9 ]", " ", (name or "").lower()).split():
        if len(word) > 3 and word.endswith("s") and not word.endswith("ss"):
            word = word[:-1]
        words.add(word)
    return frozenset(words)


def merge(item_lists: Iterable[Sequence[Item]]) -> list[Item]:
    """Fold the full-image pass and the tile passes into one list.

    Two entries describe the same object when one token set contains the other, so
    "cream" folds into "analogue cream" and "carrots" into "carrot". The more specific
    name survives and inherits any brand or visible text the other one carried.
    Entries the model declined to identify are dropped: they make no claim, so scoring
    them as false positives would punish the model for being honest.
    """
    flat = [item for items in item_lists for item in items]
    flat.sort(key=lambda it: (-len(canonical(it.get("ingredient_en"))),
                              -(it.get("confidence") or 0.0)))
    kept: list[Item] = []
    for item in flat:
        name = (item.get("ingredient_en") or "").strip()
        if not name or UNIDENTIFIED in name.lower():
            continue
        current = canonical(name)
        absorbed = False
        for seen in kept:
            if current <= canonical(seen["ingredient_en"]) or \
               canonical(seen["ingredient_en"]) <= current:
                seen["count"] = max(seen.get("count") or 1, item.get("count") or 1)
                for field in ("brand", "product_name", "visible_text"):
                    if not seen.get(field) and item.get(field):
                        seen[field] = item[field]
                absorbed = True
                break
        if not absorbed:
            kept.append(dict(item))
    return kept


# --------------------------------------------------------------------------- scan
def scan_image(client: OpenAI, path: str, cfg: Config) -> tuple[str, dict[str, Any]]:
    name = os.path.basename(path)
    started = time.time()
    try:
        image = Image.open(path).convert("RGB")
        first = ask(client, image, cfg)
        tiled = len(first) >= cfg.crowded_at
        if tiled:
            tiles = make_tiles(image, cfg.grid, cfg.overlap)
            with ThreadPoolExecutor(max_workers=cfg.tile_workers) as pool:
                items = merge([first, *pool.map(lambda t: ask(client, t, cfg), tiles)])
        else:
            items = merge([first])
        # Informational only: nothing is dropped here. Every item is written to the
        # predictions file and a confidence floor is applied later by
        # evaluate_detection.py --min-conf, so the threshold can be swept over saved
        # predictions at zero API cost.
        weak = sum(1 for it in items if (it.get("confidence") or 0.0) < cfg.weak_below)
        elapsed = round(time.time() - started, 1)
        note = "  [tiled]" if tiled else ""
        note += f"  {weak} weak" if weak else ""
        print(f"{name:24s} {len(items):3d} items {elapsed:6.1f}s{note}", flush=True)
        return name, {"items": items, "sec": elapsed, "tiled": tiled}
    except Exception as error:                         # noqa: BLE001
        print(f"{name:24s} ERROR: {error}", flush=True)
        return name, {"error": str(error)}


def provenance(cfg: Config, n_images: int) -> dict[str, Any]:
    """Everything needed to trace a number back to the configuration that produced it."""
    return {
        "generated_at": datetime.now(timezone.utc).isoformat(timespec="seconds"),
        "provider": cfg.provider,
        "model": cfg.model,
        "endpoint": cfg.base_url,
        "decoding": {"temperature": 0, "top_p": 1,
                     "seed": "unsupported by this endpoint"},
        "prompt_sha256": hashlib.sha256(PROMPT.encode()).hexdigest()[:16],
        "pipeline": {k: v for k, v in asdict(cfg).items()
                     if k not in ("gt_file", "out_file", "runs", "provider")},
        "images": n_images,
        "python": platform.python_version(),
        "note": ("hosted LLMs are not bit-reproducible even at temperature 0; "
                 "use --runs N and report mean +/- std rather than a single run"),
    }


def run_once(client: OpenAI, paths: list[str], cfg: Config, out_file: str) -> None:
    with ThreadPoolExecutor(max_workers=cfg.workers) as pool:
        results = dict(pool.map(lambda p: scan_image(client, p, cfg), paths))

    results["_run"] = provenance(cfg, len(paths))
    with open(out_file, "w", encoding="utf-8") as handle:
        json.dump(results, handle, ensure_ascii=False, indent=1)

    failed = [k for k, v in results.items()
              if not k.startswith("_") and "error" in v]
    tiled = sum(1 for k, v in results.items()
                if not k.startswith("_") and v.get("tiled"))
    print(f"\n{len(paths) - len(failed)}/{len(paths)} succeeded · "
          f"{tiled} tiled · saved to {out_file}")
    if failed:
        raise SystemExit(f"{len(failed)} image(s) failed. Do not read any metrics.\n"
                         f"{results[failed[0]]['error'][:400]}")


def main(argv: Sequence[str] | None = None) -> None:
    cfg, listing = parse_args(argv)
    if listing:
        print(f"models reachable with {PROVIDERS[cfg.provider]['key_env']}:")
        for model in make_client(cfg).models.list():
            print("  " + model.id)
        return

    wanted = read_ground_truth_keys(cfg.gt_file)
    image_dir = find_image_dir(wanted)

    on_disk: dict[str, str] = {}
    for path in sorted(glob.glob(image_dir + "/**/*", recursive=True)):
        if os.path.isfile(path) and path.lower().endswith(EXTENSIONS):
            on_disk.setdefault(os.path.splitext(os.path.basename(path))[0], path)

    absent = sorted(wanted - set(on_disk))
    if absent:
        raise SystemExit("Missing image file(s) for ground-truth entries: "
                         + ", ".join(absent))

    paths = [on_disk[stem] for stem in sorted(wanted)]
    skipped = sorted(set(on_disk) - wanted)
    print(f"images to scan : {len(paths)}  (only those listed in {cfg.gt_file})")
    if skipped:
        print(f"skipped        : {len(skipped)} file(s) on disk but not in the ground "
              f"truth: {', '.join(skipped[:8])}")
    print(f"provider       : {cfg.provider}   ({cfg.base_url})")
    print(f"model          : {cfg.model}   temperature 0, top_p 1")
    print(f"prompt sha256  : {hashlib.sha256(PROMPT.encode()).hexdigest()[:16]}\n")

    client = make_client(cfg)
    stem, ext = os.path.splitext(cfg.out_file)
    for run in range(1, cfg.runs + 1):
        out_file = cfg.out_file if cfg.runs == 1 else f"{stem}.run{run}{ext}"
        if cfg.runs > 1:
            print(f"--- run {run}/{cfg.runs} ---")
        run_once(client, paths, cfg, out_file)


if __name__ == "__main__":
    sys.exit(main())