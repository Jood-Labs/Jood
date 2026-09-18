# -*- coding: utf-8 -*-
"""Validate a ground-truth file against the scorer that will grade it.

Four things must hold before a benchmark can be trusted:
  1. every ground-truth key has exactly one image file on disk, and vice versa;
  2. no two alias groups inside one image can be confused by the matcher - otherwise a
     correct prediction lands in the wrong group and scores as a miss AND a false positive;
  3. a perfect prediction scores exactly 1.000. If it does not, the ceiling is below 1.0
     and every number this file produces is understated;
  4. an empty prediction scores exactly 0.000.

Run this before spending a single API call.

Usage
-----
    python validate_ground_truth.py ground_truth_test.json /content/drive/MyDrive/JoodVLMTest
"""
import importlib.util, json, os, sys, collections

spec = importlib.util.spec_from_file_location("evaluate_detection", "evaluate_detection.py")
ev = importlib.util.module_from_spec(spec); sys.modules["evaluate_detection"] = ev; spec.loader.exec_module(ev)

GT_FILE, IMG_DIR = sys.argv[1], sys.argv[2]
EXT = (".jpg", ".jpeg", ".png", ".heic", ".heif", ".webp")
gt = json.load(open(GT_FILE, encoding="utf-8"))
keys = [k for k in gt if not k.startswith("_")]
problems = []

# ---- 1. files -------------------------------------------------------------
on_disk = collections.defaultdict(list)
for f in os.listdir(IMG_DIR):
    if f.lower().endswith(EXT):
        on_disk[os.path.splitext(f)[0]].append(f)
for k in keys:
    if k not in on_disk:
        problems.append(f"[files] no image on disk for ground-truth key {k!r}")
    elif len(on_disk[k]) > 1:
        problems.append(f"[files] {k!r} matches several files: {on_disk[k]}")
for stem in on_disk:
    if stem not in keys:
        problems.append(f"[files] image {stem!r} on disk is not in the ground truth (it will be skipped)")

# ---- 2. internal separability --------------------------------------------
for k in keys:
    must = gt[k]["must"]
    seen = {}
    for i, group in enumerate(must):
        for alias in group:
            landed = ev.best_group(must, alias)
            if landed != i:
                problems.append(f"[collision] {k}: alias {alias!r} of group {i} "
                                f"({must[i][0]!r}) is matched to group {landed} "
                                f"({must[landed][0]!r})")
            if alias in seen and seen[alias] != i:
                problems.append(f"[duplicate] {k}: alias {alias!r} appears in two groups")
            seen[alias] = i
        for other in gt[k].get("optional", []):
            if ev.best_group([group], other[0]) is not None:
                problems.append(f"[overlap] {k}: optional {other[0]!r} is unreachable - "
                                f"the matcher routes it to must group {group[0]!r} first")
    for trap in gt[k].get("traps", []):
        if ev.best_group(must, trap) is not None:
            problems.append(f"[trap] {k}: trap {trap!r} also matches a must group")

# ---- 2b. near-collisions (warning, not an error) --------------------------
# Two groups whose aliases are token-nested ("cream" inside "cream cheese"). The
# best-match scorer resolves these correctly - every alias is verified above - but a
# free-text prediction that falls between them could go either way, so they are printed
# for a human to eyeball once.
warnings = []
for k in keys:
    must = gt[k]["must"]
    for i in range(len(must)):
        for j in range(i + 1, len(must)):
            pairs = [(a, b) for a in must[i] for b in must[j] if ev.overlap(a, b) > 0]
            if pairs:
                warnings.append(f"[near]  {k}: {must[i][0]!r} <-> {must[j][0]!r}  "
                                f"e.g. {pairs[0][0]!r} / {pairs[0][1]!r}")

# ---- 3. perfect-prediction ceiling ---------------------------------------
# Every alias in turn, so the ceiling is verified for each spelling, not just the first.
depth = max((len(g) for k in keys for g in gt[k]["must"]), default=1)
for variant in range(depth):
    perfect = {k: {"items": [{"ingredient_en": g[min(variant, len(g) - 1)],
                              "confidence": 0.99} for g in gt[k]["must"]],
                   "sec": 0.0, "tiled": False} for k in keys}
    scored = ev.score_run(gt, perfect, 0.0)
    p, r, f1 = scored["micro"]
    if round(f1, 6) != 1.0:
        problems.append(f"[ceiling] alias variant {variant}: micro F1 is {f1:.3f}, not 1.000 "
                        f"(P={p:.3f} R={r:.3f}, FP={scored['fp']}, FN={scored['fn']})")
        for row in scored["rows"]:
            if row["fn"] or row["fp"]:
                problems.append(f"          {row['image']}: missed={row['missed']} extra={row['extra']}")

# ---- 4. empty-prediction floor -------------------------------------------
empty = {k: {"items": [], "sec": 0.0, "tiled": False} for k in keys}
if round(ev.score_run(gt, empty, 0.0)["micro"][2], 6) != 0.0:
    problems.append("[floor] an empty prediction does not score 0.000")

# ---- report ---------------------------------------------------------------
n_labels = sum(len(gt[k]["must"]) for k in keys)
print(f"{GT_FILE}: {len(keys)} images, {n_labels} must labels, "
      f"{sum(len(gt[k].get('optional', [])) for k in keys)} optional, "
      f"{sum(len(gt[k].get('traps', [])) for k in keys)} traps")
if warnings:
    print(f"\n{len(warnings)} near-collision(s) - resolved by best-match scoring, listed for review:")
    for w in warnings:
        print("  " + w)
if problems:
    print(f"\n{len(problems)} PROBLEM(S):")
    for p in problems:
        print("  " + p)
    sys.exit(1)
print("OK - files match, no alias collisions, a perfect prediction scores 1.000")