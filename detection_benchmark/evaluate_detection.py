#!/usr/bin/env python3
"""
Recipe Station - multi-label evaluation of ingredient detection.

Task formulation
----------------
Each image carries a SET of ingredient labels; the model returns a SET of predicted
items. This is multi-label classification, so the standard protocol applies:
precision / recall / F1 over label decisions. Mean Average Precision is NOT applicable
- it requires bounding boxes and IoU overlap, which this task has neither of and the
product does not need.

Definitions used throughout
---------------------------
TP  true positive   a ground-truth label that the model reported
FN  false negative  a ground-truth label that the model did not report
FP  false positive  a reported item with no ground-truth label behind it

Averaging
---------
micro       pool every label decision, then compute P/R/F1 once.   <- headline
macro       compute P/R/F1 per label, then take the unweighted mean. Averaged over
            GROUND-TRUTH labels only: unmatched predictions are counted in micro (as
            FP) but are not given their own label columns, because a column that is
            all-zero in y_true scores 0 by definition and would drag macro down
            without carrying any information.
per-sample  compute P/R/F1 per image, then take the mean. Closest proxy for what one
            user experiences on one photo.

Label matching
--------------
A ground-truth entry is a list of accepted aliases. Each prediction is assigned to the
alias group it fits BEST (Jaccard overlap over token sets), not to the first group that
happens to match, which stops a broad label ("beef") from being absorbed by a narrower
one ("ground beef") and vice versa. Tokens are singularised so "burgers" matches
"burger". Several predictions may map to one group - two brands of the same ingredient
are one ingredient, not one hit plus one false positive.

Variance
--------
Hosted LLMs are not bit-reproducible even at temperature 0, and these endpoints expose
no seed. Pass several prediction files (detect_ingredients.py --runs N) and every figure
is reported as mean +/- sample standard deviation.

Usage
-----
    python evaluate_detection.py ground_truth_test.json predictions_test.json
    python evaluate_detection.py ground_truth_dev.json pred.run1.json pred.run2.json
    python evaluate_detection.py ground_truth_test.json predictions_test.json --min-conf 0.6
    python evaluate_detection.py ground_truth_test.json predictions_test.json --sweep

--min-conf discards predictions below a confidence threshold before scoring. It is a
scoring decision, not a capture decision: detect_ingredients.py saves every item, so a
threshold is free to explore. --sweep prints the whole precision/recall trade-off curve.
"""
from __future__ import annotations

import argparse
import json
import re
import statistics
import sys
from typing import Any, Iterable, Sequence

from sklearn.metrics import precision_recall_fscore_support
from sklearn.preprocessing import MultiLabelBinarizer

AUDIT_AT = 3                      # unmatched predictions before an image is flagged
SWEEP_POINTS = (0.0, 0.3, 0.4, 0.5, 0.6, 0.7, 0.8)
LINE = "=" * 128
THIN = "-" * 128

Item = dict[str, Any]
Group = Sequence[str]


# --------------------------------------------------------------------------- matching
def tokens(text: str | None) -> frozenset[str]:
    """Lower-case, strip punctuation, singularise: 'Breaded Burgers' -> {breaded, burger}."""
    words = set()
    for word in re.sub(r"[^a-z0-9 ]", " ", (text or "").lower()).split():
        if len(word) > 3 and word.endswith("s") and not word.endswith("ss"):
            word = word[:-1]
        words.add(word)
    return frozenset(words)


def overlap(alias: str, text: str) -> float:
    """0.0 if the two do not describe the same thing, else Jaccard similarity."""
    a, t = tokens(alias), tokens(text)
    if not a or not t or not (a <= t or t <= a):
        return 0.0
    return len(a & t) / len(a | t)


def best_group(groups: Sequence[Group], text: str) -> int | None:
    """Index of the alias group that fits `text` best, or None."""
    best_index, best_score = None, 0.0
    for index, group in enumerate(groups):
        score = max((overlap(alias, text) for alias in group), default=0.0)
        if score > best_score:
            best_index, best_score = index, score
    return best_index


# --------------------------------------------------------------------------- scoring
def score_image(spec: dict[str, Any], items: Sequence[Item]):
    """Return (true_labels, predicted_labels, unmatched, traps) for one image."""
    text = [" ".join(filter(None, [it.get("ingredient_en"),
                                   it.get("product_name"),
                                   it.get("brand")])) for it in items]
    must: Sequence[Group] = spec["must"]
    optional: Sequence[Group] = spec.get("optional", [])

    claimed, hit_groups = set(), set()
    for index, line in enumerate(text):
        group = best_group(must, line)
        if group is not None:
            claimed.add(index)
            hit_groups.add(group)
        elif best_group(optional, line) is not None:
            claimed.add(index)

    unmatched = [items[i].get("ingredient_en") or f"item_{i}"
                 for i in range(len(text)) if i not in claimed]
    traps = [u for u in unmatched
             if any(overlap(t, u) > 0 for t in spec.get("traps", []))]
    return ({g[0] for g in must},
            {must[i][0] for i in hit_groups},
            unmatched,
            traps)


def score_run(gt: dict[str, Any], pred: dict[str, Any], min_conf: float) -> dict[str, Any]:
    """Score one predictions file. Per-image rows plus the three averaged metrics."""
    y_true, y_pred, rows = [], [], []
    withheld = 0

    for key, spec in gt.items():
        if key.startswith("_"):
            continue
        match = next((k for k in pred
                      if not k.startswith("_") and k.rsplit(".", 1)[0] == key), None)
        if match is None or "items" not in pred.get(match, {}):
            sys.exit(f'FATAL: no prediction for "{key}". Check the filenames in the predictions file.')

        record = pred[match]
        items = record["items"]
        if min_conf > 0:
            kept = [it for it in items if (it.get("confidence") or 0.0) >= min_conf]
            withheld += len(items) - len(kept)
            items = kept

        truth, predicted, unmatched, traps = score_image(spec, items)
        y_true.append(truth)
        y_pred.append(predicted | {"~" + u for u in unmatched})

        tp = len(truth & predicted)
        rows.append({"image": key,
                     "tp": tp,
                     "fn": len(truth - predicted),
                     "fp": len(unmatched),
                     "precision": tp / (tp + len(unmatched)) if tp + len(unmatched) else 0.0,
                     "recall": tp / len(truth) if truth else 0.0,
                     "missed": sorted(truth - predicted),
                     "extra": unmatched,
                     "traps": traps,
                     "n_pred": len(items),
                     "sec": record.get("sec"),
                     "tiled": record.get("tiled")})

    binarizer = MultiLabelBinarizer().fit(y_true + y_pred)
    Y, P = binarizer.transform(y_true), binarizer.transform(y_pred)
    gt_cols = [i for i, c in enumerate(binarizer.classes_) if not c.startswith("~")]

    return {"rows": rows,
            "withheld": withheld,
            "tp": sum(r["tp"] for r in rows),
            "fn": sum(r["fn"] for r in rows),
            "fp": sum(r["fp"] for r in rows),
            "traps": sum(len(r["traps"]) for r in rows),
            "labels": len(gt_cols),
            "micro": precision_recall_fscore_support(Y, P, average="micro", zero_division=0)[:3],
            "macro": precision_recall_fscore_support(Y[:, gt_cols], P[:, gt_cols],
                                                     average="macro", zero_division=0)[:3],
            "sample": precision_recall_fscore_support(Y, P, average="samples", zero_division=0)[:3]}


# --------------------------------------------------------------------------- reporting
def spread(values: Sequence[float], decimals: int = 3) -> str:
    """'0.879' for one run, '0.879 +/- 0.006' for several. Counts print as integers."""
    if len(values) == 1:
        value = values[0]
        return f"{value:d}" if isinstance(value, int) else f"{value:.{decimals}f}"
    mean, sd = statistics.mean(values), statistics.stdev(values)
    if all(isinstance(v, int) for v in values):
        return f"{mean:.1f} +/- {sd:.1f}"
    return f"{mean:.{decimals}f} +/- {sd:.{decimals}f}"


def print_per_image(scored: dict[str, Any]) -> None:
    rows = scored["rows"]
    width = max(len(r["image"]) for r in rows) + 2
    print("\nPER-IMAGE RESULTS")
    print(LINE)
    print(f'{"IMAGE":{width}}{"TP":>4}{"FN":>4}{"FP":>4}{"PREC":>8}{"REC":>7}{"SEC":>7}  '
          f'{"MISSED (ground truth not reported)":38}EXTRA (reported, no ground truth)')
    print(THIN)
    for r in rows:
        sec = f'{r["sec"]:.1f}' if r["sec"] is not None else "-"
        flag = "*" if r["tiled"] else " "
        print(f'{r["image"]:{width}}{r["tp"]:>4}{r["fn"]:>4}{r["fp"]:>4}'
              f'{r["precision"]:>8.2f}{r["recall"]:>7.2f}{sec:>6}{flag}  '
              f'{", ".join(r["missed"]) or "-":38}{", ".join(r["extra"]) or "-"}')
        if r["traps"]:
            print(f'{"":{width}}{"":34}  TRAP non-food object reported: {", ".join(r["traps"])}')
    if any(r["tiled"] for r in rows):
        print("\n* image was re-scanned as overlapping tiles")


def print_summary(scored_runs: list[dict[str, Any]], min_conf: float,
                  provenances: list[dict[str, Any]]) -> None:
    first = scored_runs[0]
    n_runs = len(scored_runs)

    print("\nSUMMARY" + (f"  ({n_runs} runs, mean +/- sd)" if n_runs > 1 else ""))
    print(LINE)
    print(f'{"Images evaluated":26}{len(first["rows"])}')
    print(f'{"Ground-truth labels":26}{first["tp"] + first["fn"]}')
    print(f'{"Predicted items":26}{spread([sum(r["n_pred"] for r in s["rows"]) for s in scored_runs])}')
    if min_conf > 0:
        print(f'{"Withheld below " + str(min_conf):26}'
              f'{spread([s["withheld"] for s in scored_runs]):<12}dropped by --min-conf')
    print()
    print(f'{"TP  true positive":26}{spread([s["tp"] for s in scored_runs]):<14}'
          "ground-truth label that the model reported")
    print(f'{"FN  false negative":26}{spread([s["fn"] for s in scored_runs]):<14}'
          "ground-truth label that the model did not report")
    print(f'{"FP  false positive":26}{spread([s["fp"] for s in scored_runs]):<14}'
          "reported item with no ground-truth label behind it")
    print(f'{"    of which traps":26}{spread([s["traps"] for s in scored_runs]):<14}'
          "non-food objects the prompt forbids reporting")

    secs = [r["sec"] for s in scored_runs for r in s["rows"] if r["sec"] is not None]
    if secs:
        ordered = sorted(secs)
        p95 = ordered[min(len(ordered) - 1, int(0.95 * len(ordered)))]
        print()
        print(f'{"Latency per image":26}mean {statistics.mean(secs):.1f}s   '
              f'median {statistics.median(secs):.1f}s   p95 {p95:.1f}s   max {max(secs):.1f}s')

    print()
    print(f'{"AVERAGING":14}{"PRECISION":>18}{"RECALL":>18}{"F1":>18}   BASIS')
    print(THIN)
    bases = {
        "micro": f'all {first["tp"] + first["fn"] + first["fp"]} label decisions  <- headline',
        "macro": f'{first["labels"]} distinct ground-truth labels, unweighted',
        "sample": f'{len(first["rows"])} images, unweighted',
    }
    for name, basis in bases.items():
        p = spread([s[name][0] for s in scored_runs])
        r = spread([s[name][1] for s in scored_runs])
        f = spread([s[name][2] for s in scored_runs])
        label = "per-sample" if name == "sample" else name
        print(f"{label:14}{p:>18}{r:>18}{f:>18}   {basis}")

    if provenances:
        print()
        prompts = {p.get("prompt_sha256") for p in provenances if p}
        models = {p.get("model") for p in provenances if p}
        if not models and not prompts:
            print(f'{"Provenance":26}not recorded (predictions file predates provenance logging)')
        else:
            print(f'{"Provenance":26}model {", ".join(sorted(filter(None, models)))}   '
                  f'prompt {", ".join(sorted(filter(None, prompts)))}')
            if len(prompts) > 1 or len(models) > 1:
                print("WARNING: runs do not share one configuration - they are not comparable.")


def print_diagnostics(scored: dict[str, Any]) -> None:
    rows = scored["rows"]
    width = max(len(r["image"]) for r in rows) + 2

    subs = [r for r in rows if r["missed"] and r["extra"]]
    if subs:
        print("\nLIKELY SUBSTITUTIONS")
        print(LINE)
        print("Images where a miss and an unmatched prediction co-occur. These are usually one")
        print("object read as the wrong thing, not an object that was overlooked.")
        print(THIN)
        for r in subs:
            print(f'  {r["image"]:{width}}{", ".join(r["missed"]):34} -> {", ".join(r["extra"])}')

    suspect = [r for r in rows if r["fp"] >= AUDIT_AT]
    if suspect:
        print("\nGROUND-TRUTH AUDIT")
        print(LINE)
        print(f"Images with {AUDIT_AT}+ unmatched predictions. Inspect each one before trusting")
        print("its precision: the ground truth may simply be missing items that are really there.")
        print(THIN)
        for r in suspect:
            print(f'  {r["image"]:{width}}{r["fp"]} unmatched: {", ".join(r["extra"])}')


def print_sweep(gt: dict[str, Any], preds: list[dict[str, Any]]) -> None:
    print("\nCONFIDENCE SWEEP")
    print(LINE)
    print("Same saved predictions, different thresholds. No API calls are spent.")
    print(THIN)
    print(f'{"--min-conf":>12}{"PRECISION":>18}{"RECALL":>18}{"F1":>18}{"WITHHELD":>16}')
    for threshold in SWEEP_POINTS:
        scored = [score_run(gt, p, threshold) for p in preds]
        print(f"{threshold:>12.1f}"
              f'{spread([s["micro"][0] for s in scored]):>18}'
              f'{spread([s["micro"][1] for s in scored]):>18}'
              f'{spread([s["micro"][2] for s in scored]):>18}'
              f'{spread([s["withheld"] for s in scored]):>16}')


# --------------------------------------------------------------------------- entry point
def main(argv: Sequence[str] | None = None) -> None:
    parser = argparse.ArgumentParser(
        description=__doc__, formatter_class=argparse.RawDescriptionHelpFormatter)
    parser.add_argument("ground_truth")
    parser.add_argument("results", nargs="+",
                        help="one or more predictions files; several are reported as mean +/- sd")
    parser.add_argument("--min-conf", type=float, default=0.0,
                        help="drop predictions below this confidence (default: 0.0)")
    parser.add_argument("--sweep", action="store_true",
                        help="also print the precision/recall curve over thresholds")
    args = parser.parse_args(argv)
    if not 0.0 <= args.min_conf <= 1.0:
        parser.error("--min-conf must be between 0.0 and 1.0")

    with open(args.ground_truth, encoding="utf-8") as handle:
        gt = json.load(handle)
    preds = []
    for path in args.results:
        with open(path, encoding="utf-8") as handle:
            preds.append(json.load(handle))

    scored_runs = [score_run(gt, p, args.min_conf) for p in preds]
    provenances = [p.get("_run", {}) for p in preds]

    print_per_image(scored_runs[0])
    if len(scored_runs) > 1:
        print(f"\n(per-image table shows run 1 of {len(scored_runs)}; "
              "summary figures aggregate all runs)")
    print_summary(scored_runs, args.min_conf, provenances)
    print_diagnostics(scored_runs[0])
    if args.sweep:
        print_sweep(gt, preds)


if __name__ == "__main__":
    sys.exit(main())