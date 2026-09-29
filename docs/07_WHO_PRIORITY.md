# 07 — WHO-derived Priority Setting Module

This module is based on the methodological lineage used in the Health Region 3 HALE work. It is decision support, not an automatic policy decision.

## Seven criteria

1. Problem size
2. Severity
3. Epidemic potential
4. Social and economic impact
5. Feasibility / ease of management
6. Opportunity for health gain
7. Public perception

## Criterion 1 — problem size per 100,000

| Rate | Score |
|---:|---:|
| 0–9 | 1 |
| 10–99 | 2 |
| 100–999 | 3 |
| 1000–1999 | 4 |
| >=2000 | 5 |

The measurement basis may be incidence, prevalence, mortality or case-fatality and must be stored per problem.

## Severity

Operational 1–5 scale:
- 1: non-severe; no additional health problem/stress
- 2: non-severe; may lead to additional health problem
- 3: severe; no disability/rapid death; manageable psychological impact
- 4: severe; disability; significant psychological impact
- 5: severe; disability/rapid death and major psychological impact requiring professional support

## Criteria 3–7

Use explicit ordinal descriptions 1–5 from very low to very high / least to most relevant.

## Aggregation

Per rater/disease:

```text
individual_total = sum(7 criterion scores)
range = 7..35
```

Across valid raters:

```text
group_total = sum(individual_total)
group_mean = group_total / N
normalized_percent = group_total / (35*N) * 100
computed_rank = descending(group_total)
```

Store separately:
- computed_rank
- final_consensus_rank
- committee rationale/minutes reference

## Governance

For Region 1, recommend:
1. compute regional burden evidence
2. provincial technical review
3. scoring by defined multidisciplinary panel
4. aggregate ranking
5. focus-group/committee review
6. document final consensus and rationale

Algorithm version must be stored for every scoring round.
