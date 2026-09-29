# 06 — Lee–Carter e0 Forecast

## Core model

For each geography and sex:

```text
m[x,t] = D[x,t] / P[x,t]
log(m[x,t]) = a[x] + b[x] * k[t] + error[x,t]
```

## Initial estimation

```text
a[x] = mean_t(log(m[x,t]))
Z[x,t] = log(m[x,t]) - a[x]
Z ≈ s1 * u1 * v1'
b_raw[x] = u1[x]
k_raw[t] = s1 * v1[t]
```

Identification constraints:

```text
sum_x b[x] = 1
sum_t k[t] = 0
```

Rescale parameters while preserving fitted mortality.

## Zero-death policy

Exact target rule is UNKNOWN.

Recommended Region 1 default for sparse cells:

```text
if D[x,t] == 0 and P[x,t] > 0:
    m[x,t] = 0.5 / P[x,t]
```

The chosen rule must be stored with each model fit.

## Optional second-stage k adjustment

Canonical Lee-Carter can adjust historical `k_t` so fitted total deaths match observed deaths:

```text
sum_x D[x,t] = sum_x P[x,t] * exp(a[x] + b[x] * k_adj[t])
```

Because target configuration is not public, expose this as a versioned option.

## Forecast

Baseline random walk with drift:

```text
k[t] = k[t-1] + drift + epsilon[t]
drift = (k[T] - k[1]) / (T - 1)
k_hat[T+h] = k[T] + h * drift
m_hat[x,T+h] = exp(a[x] + b[x] * k_hat[T+h])
```

Then convert forecast mortality to future e0 using the same life-table age/nax/terminal conventions.

## Required fit metadata

- fit_id
- dataset_version
- area/sex
- fit_start_year / fit_end_year
- zero_rate_policy
- k_adjustment policy
- age dictionary version
- life-table version
- a[x]
- b[x]
- k[t]
- drift
- innovation variance
- forecast horizon
- code commit/model version
- generated_at

## Regional interpretation rule

Forecasts should never be published without:
- observed-history plot
- fitted-history comparison
- number of years used
- data-quality warnings
- uncertainty method/version
