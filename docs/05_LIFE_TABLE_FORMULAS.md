# 05 — Abridged Life Table Formula Specification

## Age dictionary

`0`, `1-4`, then 5-year groups through `80-84`, terminal `85+`.

## nax mapping

| Age | n | nax fraction | ax in years |
|---|---:|---:|---:|
| 0 | 1 | 0.1 | 0.1 |
| 1-4 | 4 | 0.4 | 1.6 |
| 5-9 ... 80-84 | 5 | 0.5 | 2.5 |
| 85+ | open | terminal rule | not finite |

## Central mortality rate

```text
nMx = nDx / nPx
```

## Probability of dying

With nax stored as interval fraction:

```text
nqx = (n * nMx) / (1 + n * (1 - nax) * nMx)
```

Equivalent implementation using ax in years:

```text
nqx = (n * nMx) / (1 + (n - ax_years) * nMx)
```

Clamp numerical result to [0,1].

## Synthetic cohort

```text
l0 = 100000
ndx = lx * nqx
l(x+n) = lx - ndx
```

## Person-years

```text
nLx = n * [l(x+n) + nax * ndx]
```

## Open interval

For terminal 85+:

```text
q85+ = 1
L85+ = l85 / M85
```

A zero terminal mortality rate is invalid for life-table closure and must trigger a validation/modeling decision.

## Cumulative years and expectancy

```text
Tx = sum(Ly, y >= x)
ex = Tx / lx
e0 = T0 / l0
```

## Both-sex calculation

Pool population and deaths first, then build a new life table.

Do not average male and female e0.

## Algorithm versioning

Any change to:
- age bands
- nax
- radix
- terminal rule
- missing/zero handling

must produce a new `life_table_algorithm_version`.
