# AGENTS.md — HR1-LE working rules

## Mission

Develop an auditable, evidence-based Life Expectancy and mortality analytics platform for Thailand Health Region 1.

## Geographic scope

Exactly 8 provinces:
Chiang Mai, Chiang Rai, Lamphun, Lampang, Phayao, Phrae, Nan, Mae Hong Son.

## Evidence discipline

Every reverse-engineered claim must be tagged conceptually as:
- CONFIRMED
- HIGH
- PROPOSED
- UNKNOWN

Never silently convert a PROPOSED or UNKNOWN implementation detail into a claim about the target system.

## Non-negotiable analytical rules

1. Source facts are population and deaths; calculated outputs are reproducible derivatives.
2. Both-sex e0 must be recalculated from pooled M+F counts, never averaged from male/female e0.
3. Life-table age groups: 0, 1-4, 5-9 ... 80-84, 85+ unless a verified source requires another terminal group.
4. Current reverse-engineered nax mapping:
   - age 0 = 0.1
   - age 1-4 = 0.4
   - closed groups 5-84 = 0.5
   - 85+ = open interval rule
5. Forecast architecture is Lee-Carter on age-specific mortality, not direct linear regression on e0.
6. Every forecast fit must store model configuration and code/method version.
7. Priority scoring is decision support; final public-health priority requires documented committee review.
8. Dataset publication must be atomic and versioned.
9. Never overwrite source facts without creating a new dataset version.
10. Preserve raw source file checksum and import lineage.

## Privacy

Prefer aggregate facts. Do not place citizen identifiers in the analytical repository or GitHub.

## Required future conformance work

Highest priority is obtaining an authentic target upload workbook or HAR capture. Until then, repository import schemas are compatibility schemas, not claims of exact proprietary headers.

## Coding and documentation

- Keep formulas in docs and code synchronized.
- Add tests before changing life-table or Lee-Carter math.
- Any change to nax, terminal-age handling, zero-death handling, ICD mapping, or forecast method requires a new algorithm/method version.
- Keep province/area identifiers as strings to preserve leading zeroes.
