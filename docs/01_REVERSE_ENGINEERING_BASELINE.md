# 01 — Reverse Engineering Baseline

Target: https://le-uthaihealth.com/

## Confirmed/high-confidence findings

### Visible analytical scope
- abridged life table
- e0 comparison
- e0 forecast labeled Lee-Carter
- annual death statistics
- top-10 causes
- R00-R99 cause-quality review
- data upload
- aggregate-data orientation

### Life-table convention
Current reverse-engineered mapping:
- age 0: nax fraction 0.1
- age 1-4: nax fraction 0.4
- age 5-84 closed intervals: nax fraction 0.5
- 85+: open interval

### Forecast
The correct architecture for reproduction is:
`age-specific mortality → Lee-Carter fit → forecast k_t → forecast m_x,t → life table → forecast e0`.

Direct regression of historical e0 is not considered conformant.

### WHO-derived priority
Methodological lineage uses seven criteria scored on a 1–5 scale:
1. problem size
2. severity
3. epidemic potential
4. social/economic impact
5. feasibility/ease of control
6. opportunity for health gain
7. public perception

Automated ranking is followed by committee/focus-group deliberation.

## Unknown items that must remain configurable

- exact original upload sheet/column names
- exact zero-death handling in Lee-Carter
- fit year window
- exact historical k_t second-stage adjustment
- uncertainty interval method
- exact API and storage names
- exact ICD grouping used by target

## Conformance closure evidence

Exact 1:1 conformance requires at least one authentic target artifact:
- source upload workbook/template
- HAR/Network capture
- successful upload validation response
- source/API documentation
