# 09 — API and Database Blueprint

## API v1

```text
POST /api/v1/imports
GET  /api/v1/imports/{id}
GET  /api/v1/imports/{id}/validation
POST /api/v1/imports/{id}/publish

GET  /api/v1/life-table
GET  /api/v1/life-expectancy
GET  /api/v1/life-expectancy/compare

POST /api/v1/forecast/lee-carter/fits
GET  /api/v1/forecast/lee-carter/fits/{fit_id}
GET  /api/v1/forecast/lee-carter/fits/{fit_id}/forecast

GET  /api/v1/mortality/annual
GET  /api/v1/mortality/top-causes
GET  /api/v1/mortality/yll
GET  /api/v1/quality/r-codes

POST /api/v1/priority/rounds
POST /api/v1/priority/rounds/{round_id}/scores
GET  /api/v1/priority/rounds/{round_id}/results

GET  /api/v1/methodology
```

## Response envelope

Every analytical response should carry:

```json
{
  "dataset_version": "2025-R1-v1",
  "algorithm_version": "life-v1.1",
  "generated_at": "ISO-8601",
  "filters": {},
  "data": []
}
```

## Core database entities

- import_batch
- dataset_version
- dim_area
- dim_age_group
- dim_cause
- fact_population
- fact_death
- life_table_result
- lee_carter_fit
- lee_carter_parameter_age
- lee_carter_parameter_time
- lee_carter_forecast
- priority_round
- priority_disease
- priority_rater
- priority_score
- priority_result
- audit_log

See `db/schema.sql`.

## Recommended production database

- SQLite: local prototype/single-writer pilot
- PostgreSQL: regional multi-user production

Avoid storing derived dashboard tables as the only copy of analytical outputs; keep source facts and method version sufficient to reproduce them.
