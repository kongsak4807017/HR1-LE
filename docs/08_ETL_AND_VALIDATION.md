# 08 — ETL, Validation and Reconciliation

## ETL

```mermaid
flowchart LR
    XLSX[Source workbook] --> HASH[SHA-256]
    HASH --> RAW[Raw staging]
    RAW --> MAP[Header/Value normalization]
    MAP --> SCHEMA[Schema validation]
    SCHEMA --> DOMAIN[Domain validation]
    DOMAIN --> RECON[Cross-table reconciliation]
    RECON -->|fail| REPORT[Validation report]
    RECON -->|pass| APPROVE[Approval]
    APPROVE --> VERSION[Immutable dataset version]
    VERSION --> FACTS[(facts)]
    FACTS --> CALC[Life table / Lee-Carter / YLL / Quality]
    CALC --> MART[Analytical mart]
```

## Hard-fail rules

- missing required sheet/column
- invalid/ambiguous year
- invalid source sex
- unknown age group
- negative population/death
- duplicate population grain
- population = 0 while deaths > 0
- unknown geography code
- geography parent mismatch
- missing terminal open age group
- incomplete population/death age join
- priority score outside 1–5
- Lee-Carter matrix unusable after configured zero correction

## Warning rules

- deaths > population in cell
- missing/ill-defined cause
- high R00–R99 proportion
- many zero-death age-year cells
- abrupt mortality break between years
- incomplete province coverage
- short Lee-Carter time series
- large year-to-year denominator jump
- source definition/cutoff changed

## Reconciliation outputs

For every import produce:
- row counts before/after normalization
- duplicate count
- invalid value count
- unmatched geography count
- population totals by province/year/sex
- death totals by province/year/sex
- age-band completeness
- ICD missing/R-code proportion
- publish eligibility

## Audit

Record:
- file name
- checksum
- uploader
- upload timestamp
- validation result
- approver
- publish timestamp
- dataset version
- method versions
