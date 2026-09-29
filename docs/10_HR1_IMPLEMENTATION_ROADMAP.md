# 10 — Health Region 1 Implementation Roadmap

## Phase 0 — Conformance evidence

Goal: reduce uncertainty against the target system.

Tasks:
- obtain authentic upload template or successful workbook
- obtain HAR/Network capture
- verify exact nax implementation
- verify Lee-Carter zero policy
- verify k_t adjustment
- verify forecast horizon and uncertainty output
- verify cause grouping and priority instrument version

Deliverable: conformance matrix with PASS/DIFF/UNKNOWN.

## Phase 1 — Regional data standard

Create Region 1 data agreement:
- population source
- mortality source
- residence rule
- year/cutoff rule
- ICD rule
- age dictionary
- geography dictionary
- province submission calendar

Pilot 2 contrasting provinces before all eight:
- one larger/urban-referral province
- one smaller/mountainous/sparse-count province

## Phase 2 — Eight-province baseline

Load historical data for all eight provinces using the same rules.

Minimum outputs:
- e0/ex by sex and both
- annual mortality
- top causes
- R00-R99
- data completeness
- province benchmark

## Phase 3 — Lee-Carter validation

Before operational forecast:
- define minimum historical window
- backtest rolling forecast
- compare observed vs predicted e0
- evaluate sparse-cell correction sensitivity
- publish model diagnostics
- define uncertainty interval

## Phase 4 — Priority setting

Use burden evidence as input, then run structured 7-criterion scoring and committee confirmation.

Do not substitute automated score for governance decision.

## Phase 5 — Production platform

Recommended components:
- PostgreSQL
- FastAPI/backend service
- object storage for source files
- SSO/OIDC if available
- immutable dataset versions
- role-based approval
- audit log
- scheduled backup
- regional dashboard

## Phase 6 — Expansion

Potential extensions:
- HALE
- YLD/DALY
- avoidable mortality
- age-standardized mortality rates
- small-area smoothing
- cause-specific forecasting
- district/tambon risk maps
- automated source ingestion
