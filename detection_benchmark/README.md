# Jood — Ingredient Detection Benchmark

The held-out benchmark behind `backend/services/cv_service.py`: the dataset, the
scorer, and the number the detection stage is reported at.

## Result

22 real phone photos, 103 ingredient labels, no confidence floor:

| Metric | Value |
|---|---|
| **F1 (micro)** | **0.926** |
| Precision | 0.940 |
| Recall | 0.913 |
| Images fully correct | 14 / 22 |
| Non-food objects reported | 0 |
| Latency per image | 18.6 s median, 50.8 s worst |

`deepseek-flash`, temperature 0, top_p 1, prompt SHA-256 `0f3581548932546e`.
Full per-image output: `predictions_test.json`.

The benchmark was run twice. Both runs scored micro F1 0.926 with the same 94 / 9 / 6
split of true positives, misses and false positives, although the individual errors
differed — one run misread a butter tub as ghee, the other misread a jar of pizza sauce.
The aggregate is stable even though the endpoint is not deterministic.

With 103 labels the 95% interval is roughly ±5 points, so the honest range is 0.88–0.97.

## Approach

A vision-language model reads the photo directly and returns structured JSON — no
object detector, no OCR stage, no fine-tuning. Detector-based pipelines were evaluated
and rejected: an open-vocabulary detector still needs a second model to read the label,
and a closed-vocabulary one cannot name a Saudi retail SKU at all.

Two mechanisms carry most of the accuracy:

**Adaptive tiling.** The endpoint caps every image at a fixed token budget. In a
crowded scene each product lands at 20–40 px and the model starts inventing plausible
brand names instead of reading them. An image whose first pass returns 7 or more items
is re-scanned as 2×2 overlapping tiles and the results merged. Tiles are issued in
parallel, so a crowded image costs one extra call of wall-clock time, not four.

**Semantic merge.** The full image may return `cream` where a tile returns
`analogue cream` for the same can. Entries are folded when one token set contains the
other, singularised, with the more specific name surviving. Items the model explicitly
declined to identify are dropped rather than scored as hallucinations.

Low-confidence items are never discarded at capture time. Thresholding is a scoring
decision, so it lives in `evaluate_detection.py --min-conf` and can be swept over saved
predictions at zero API cost.

The production entry point is `backend/services/cv_service.py`, which runs the same
prompt, tiling rule and merge; this folder is the benchmark that measures it. The two
are kept in sync by the prompt hash above — if they diverge, the reported number is no
longer about the deployed code.

## Evaluation

Multi-label classification: each image carries a set of ingredient labels and the model
returns a set of predicted items, so precision / recall / F1 over label decisions is the
applicable protocol. mAP is not — it requires bounding boxes and IoU, which this task has
neither of and the product does not need.

Ground truth is a list of accepted aliases per ingredient. Each prediction is assigned to
the alias group it fits best by Jaccard overlap over singularised token sets, so a broad
label is never absorbed by a narrower one. Several predictions may map to one group: two
brands of the same ingredient are one ingredient, not one hit plus one false positive.

`ground_truth_dev.json` (28 images) was used for development. `ground_truth_test.json`
(22 images) was held out: labelled from the photos before any model was run, never used
to tune the prompt, the tiling, the merge or any threshold.

`validate_ground_truth.py` checks the benchmark before any API call is spent — that every
key has an image, that no two alias groups can be confused by the matcher, that a perfect
prediction scores exactly 1.000 and an empty one exactly 0.000. A benchmark whose ceiling
is below 1.0 understates every number it produces.

The reported figure uses no confidence floor. A floor of 0.4–0.6 scores marginally higher
(0.931), but that threshold would have been chosen after seeing the test results, so it
is not what the system is reported at.

## Known failure modes

Six of the nine misses are substitutions — one object read as a different one — and the
recurring pattern is containers that look alike rather than foods that look alike:
canned cream read as tuna (twice, in different photos), sweet corn as fava beans, grape
leaves as pickled cucumber, butter as ghee. Small metal cans and dairy-fat tubs are the
weak spot, not produce.

The remaining three are plain omissions, each a product standing beside something very
similar: one cream cheese next to another brand of cream cheese, a fresh tomato beside a
tomato-paste carton, a cheddar tin among other tins.

This is why the product asks the user to confirm the detected list before generating a
recipe. The system does not need to be perfect; its mistakes need to be visible and
correctable, and they are.

## Reproducing

Images are not in this repository: they are personal photos of the team's own kitchens.
Any folder of kitchen photos works — name each file after its key in the ground truth.

`run_benchmark.ipynb` is the Colab notebook that produced the result above. To run it
locally instead:

```bash
pip install -r requirements.txt
export DEEPSEEK_API_KEY=...          # or GEMINI_API_KEY with --provider gemini

python validate_ground_truth.py ground_truth_test.json /path/to/images
python detect_ingredients.py --gt-file ground_truth_test.json --out-file predictions_test.json
python evaluate_detection.py ground_truth_test.json predictions_test.json
```

The image folder is found by matching filenames against the ground truth, and the API key
is read from Colab Secrets or the environment. Nothing needs editing.

## Files

| File | Purpose |
|---|---|
| `run_benchmark.ipynb` | the Colab notebook that produced the reported result |
| `detect_ingredients.py` | photo → structured ingredient JSON, over a whole folder |
| `evaluate_detection.py` | precision / recall / F1, confidence sweep, diagnostics |
| `validate_ground_truth.py` | checks the benchmark itself before it is trusted |
| `ground_truth_dev.json` | 28 development images |
| `ground_truth_test.json` | 22 held-out test images |
| `predictions_test.json` | the run behind the result above |

## Note on reproducibility

These endpoints expose no `seed`, and no hosted LLM is bit-reproducible even at
temperature 0. Decoding is pinned so the sampler adds no variance, and every run records
its provenance — provider, model, decoding parameters, prompt hash, pipeline settings —
so a number can always be traced back to the configuration that produced it. For a
variance estimate, `--runs N` writes N files and the evaluator reports mean ± sd.