# 12 — Web Product Architecture: Health Region 1

## Product intent

The website should answer three management questions without forcing the user to understand the underlying database:

1. **Where is health loss occurring?** — Region → Province → District
2. **What is driving it?** — mortality, cause, YLL, R00–R99, age/sex pattern
3. **What should the system do next?** — trend/forecast, data-quality action, structured priority setting

## Geographic drill-down

```mermaid
flowchart LR
  R[Health Region 1] --> P[8 Provinces]
  P --> D[103 Districts]
  D --> T[Subdistrict extension]
```

Current web prototype includes all 8 provinces and 103 districts. Subdistrict metadata is counted in the geography seed but is not yet exposed as a primary analytical route because small-area mortality requires disclosure/suppression and statistical-stability policy first.

## User types

### Regional executive
Needs:
- e0 and mortality overview
- province comparison
- forecast signal
- major quality warnings
- priority evidence pack

### Provincial public-health executive
Needs:
- own province trend
- district variation
- leading causes / YLL
- quality/completeness
- downloadable fact sheet

### Epidemiologist / analyst
Needs:
- life-table cells
- age/sex filters
- dataset versions
- Lee-Carter diagnostics
- QA and reconciliation

### Data manager
Needs:
- upload
- schema errors
- province completeness
- approve/publish workflow
- audit trail

## Navigation model

```text
ภาพรวม
  ภาพรวมเขต
  เปรียบเทียบ 8 จังหวัด
  จังหวัด / อำเภอ

ภาระสุขภาพ
  Life Expectancy
  Mortality / YLL
  Lee-Carter Forecast
  Data Quality
  WHO Priority

ระบบข้อมูล
  Flow of Data
  Data Management
  Methodology
  Site Map
```

## Interaction rules

- Region is the default scope.
- Clicking a province drills to districts.
- Clicking a district opens the district profile.
- Year and sex filters persist across analytic pages.
- Both-sex metrics must be calculated from pooled population/death facts, not averaged.
- Every official chart/table shows dataset version and method version.
- Quality warnings should be visible before users interpret small-area comparisons.
- No automated "good/bad province" color classification unless an approved threshold exists.

## District-level statistical safety

Before production release at district level, define:
- minimum death count for public display
- cell suppression rule
- pooling rule for sparse age-year cells
- smoothing policy if used
- uncertainty display
- minimum time-series length for Lee-Carter
- whether district forecast is allowed at all

A district route can exist while forecast remains disabled where the statistical gate fails.
