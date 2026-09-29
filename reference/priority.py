from __future__ import annotations

from collections import defaultdict
from dataclasses import dataclass

CRITERIA = (
    "problem_size",
    "severity",
    "epidemic",
    "social_economic",
    "feasibility",
    "health_gain",
    "public_perception",
)

def problem_size_score(rate_per_100k: float) -> int:
    if rate_per_100k < 0:
        raise ValueError("rate must be nonnegative")
    if rate_per_100k < 10:
        return 1
    if rate_per_100k < 100:
        return 2
    if rate_per_100k < 1000:
        return 3
    if rate_per_100k < 2000:
        return 4
    return 5

def validate_scores(scores: dict[str, int]) -> None:
    missing = set(CRITERIA) - set(scores)
    if missing:
        raise ValueError(f"missing criteria: {sorted(missing)}")
    for c in CRITERIA:
        if int(scores[c]) not in range(1, 6):
            raise ValueError(f"{c} must be 1..5")

def individual_total(scores: dict[str, int]) -> int:
    validate_scores(scores)
    return sum(int(scores[c]) for c in CRITERIA)

def aggregate(records: list[dict]) -> list[dict]:
    # record: disease_code, rater_id, plus seven criterion score fields
    grouped: dict[str, list[int]] = defaultdict(list)
    for rec in records:
        score_map = {c: int(rec[c]) for c in CRITERIA}
        grouped[str(rec["disease_code"])].append(individual_total(score_map))

    out = []
    for disease, totals in grouped.items():
        n = len(totals)
        total = float(sum(totals))
        out.append({
            "disease_code": disease,
            "valid_raters": n,
            "group_total": total,
            "group_mean": total / n,
            "normalized_percent": total / (35.0 * n) * 100.0,
        })

    out.sort(key=lambda x: (-x["group_total"], x["disease_code"]))
    for i, row in enumerate(out, 1):
        row["computed_rank"] = i
    return out
