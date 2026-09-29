from __future__ import annotations

from dataclasses import dataclass, asdict
from typing import Mapping

AGE_GROUPS = ["0", "1-4"] + [f"{a}-{a+4}" for a in range(5, 85, 5)] + ["85+"]

def interval_width(age_group: str) -> float | None:
    if age_group == "0":
        return 1.0
    if age_group == "1-4":
        return 4.0
    if age_group.endswith("+"):
        return None
    lo, hi = age_group.split("-")
    return float(int(hi) - int(lo) + 1)

def nax_fraction(age_group: str) -> float:
    if age_group == "0":
        return 0.10
    if age_group == "1-4":
        return 0.40
    return 0.50

@dataclass
class LifeTableRow:
    age_group: str
    exposure: float
    observed_deaths: float
    mx: float
    nax_fraction: float
    qx: float
    lx: float
    dx: float
    Lx: float
    Tx: float = 0.0
    ex: float = 0.0

def calculate_from_counts(
    population_by_age: Mapping[str, float],
    deaths_by_age: Mapping[str, float],
    radix: float = 100_000.0,
) -> list[dict]:
    mx = {}
    for age in AGE_GROUPS:
        p = float(population_by_age.get(age, 0.0))
        d = float(deaths_by_age.get(age, 0.0))
        if p < 0 or d < 0:
            raise ValueError(f"negative input at {age}")
        if p == 0 and d > 0:
            raise ValueError(f"deaths with zero population at {age}")
        mx[age] = d / p if p > 0 else 0.0
    return calculate_from_mx(mx, population_by_age, deaths_by_age, radix=radix)

def calculate_from_mx(
    mx_by_age: Mapping[str, float],
    exposure_by_age: Mapping[str, float] | None = None,
    observed_deaths_by_age: Mapping[str, float] | None = None,
    radix: float = 100_000.0,
) -> list[dict]:
    exposure_by_age = exposure_by_age or {}
    observed_deaths_by_age = observed_deaths_by_age or {}

    rows: list[LifeTableRow] = []
    lx = float(radix)

    for age in AGE_GROUPS:
        mx = max(float(mx_by_age.get(age, 0.0)), 0.0)
        n = interval_width(age)
        f = nax_fraction(age)

        if n is None:
            if mx <= 0 and lx > 0:
                raise ValueError("terminal open interval requires Mx > 0")
            qx = 1.0 if lx > 0 else 0.0
            dx = lx * qx
            Lx = lx / mx if mx > 0 else 0.0
        else:
            denom = 1.0 + n * (1.0 - f) * mx
            qx = (n * mx / denom) if denom > 0 else 0.0
            qx = min(max(qx, 0.0), 1.0)
            dx = lx * qx
            next_lx = max(lx - dx, 0.0)
            Lx = n * (next_lx + f * dx)

        rows.append(LifeTableRow(
            age_group=age,
            exposure=float(exposure_by_age.get(age, 0.0)),
            observed_deaths=float(observed_deaths_by_age.get(age, 0.0)),
            mx=mx,
            nax_fraction=f,
            qx=qx,
            lx=lx,
            dx=dx,
            Lx=Lx,
        ))
        lx = max(lx - dx, 0.0)

    running = 0.0
    for row in reversed(rows):
        running += row.Lx
        row.Tx = running
        row.ex = running / row.lx if row.lx > 0 else 0.0

    return [asdict(r) for r in rows]

def e0_from_mx(mx_by_age: Mapping[str, float]) -> float:
    return float(calculate_from_mx(mx_by_age)[0]["ex"])
