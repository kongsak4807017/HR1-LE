from __future__ import annotations

from dataclasses import dataclass
import numpy as np

@dataclass
class LeeCarterFit:
    ages: list[str]
    years: list[int]
    ax: np.ndarray
    bx: np.ndarray
    kt: np.ndarray
    drift: float
    innovation_variance: float
    zero_rate_policy: str

def mortality_matrix(
    deaths: np.ndarray,
    exposure: np.ndarray,
    zero_rate_policy: str = "half_death",
) -> np.ndarray:
    deaths = np.asarray(deaths, dtype=float)
    exposure = np.asarray(exposure, dtype=float)
    if deaths.shape != exposure.shape:
        raise ValueError("deaths and exposure shapes differ")
    if np.any(exposure <= 0):
        raise ValueError("Lee-Carter exposure must be > 0 in all fitted cells")
    if np.any(deaths < 0):
        raise ValueError("deaths must be nonnegative")

    if zero_rate_policy == "half_death":
        corrected = np.where(deaths == 0, 0.5, deaths)
        return corrected / exposure
    if zero_rate_policy == "epsilon":
        rates = deaths / exposure
        return np.maximum(rates, 1e-12)
    if np.any(deaths == 0):
        raise ValueError("zero deaths present and no correction policy selected")
    return deaths / exposure

def fit_lee_carter(
    deaths: np.ndarray,
    exposure: np.ndarray,
    ages: list[str],
    years: list[int],
    zero_rate_policy: str = "half_death",
) -> LeeCarterFit:
    m = mortality_matrix(deaths, exposure, zero_rate_policy)
    logm = np.log(m)

    ax = logm.mean(axis=1)
    z = logm - ax[:, None]

    u, s, vt = np.linalg.svd(z, full_matrices=False)
    b = u[:, 0].copy()
    k = (s[0] * vt[0, :]).copy()

    bsum = b.sum()
    if abs(bsum) < 1e-12:
        raise ValueError("cannot identify Lee-Carter parameters: sum(bx)≈0")

    b = b / bsum
    k = k * bsum

    kmean = k.mean()
    ax = ax + b * kmean
    k = k - kmean

    if len(k) >= 2:
        increments = np.diff(k)
        drift = float(increments.mean())
        innovation_variance = float(increments.var(ddof=1)) if len(increments) > 1 else 0.0
    else:
        drift = 0.0
        innovation_variance = 0.0

    return LeeCarterFit(
        ages=list(ages),
        years=list(years),
        ax=ax,
        bx=b,
        kt=k,
        drift=drift,
        innovation_variance=innovation_variance,
        zero_rate_policy=zero_rate_policy,
    )

def forecast_kt(fit: LeeCarterFit, horizon: int) -> np.ndarray:
    if horizon < 1:
        return np.array([], dtype=float)
    h = np.arange(1, horizon + 1, dtype=float)
    return fit.kt[-1] + h * fit.drift

def forecast_mx(fit: LeeCarterFit, horizon: int) -> np.ndarray:
    kf = forecast_kt(fit, horizon)
    return np.exp(fit.ax[:, None] + fit.bx[:, None] * kf[None, :])

def fitted_mx(fit: LeeCarterFit) -> np.ndarray:
    return np.exp(fit.ax[:, None] + fit.bx[:, None] * fit.kt[None, :])
