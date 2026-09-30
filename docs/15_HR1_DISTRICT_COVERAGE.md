# 15 — Health Region 1 District Coverage

The web geography seed contains **8 provinces and 103 districts**.

| Province | Province code | Districts |
|---|---:|---:|
| เชียงใหม่ | 50 | 25 |
| เชียงราย | 57 | 18 |
| ลำพูน | 51 | 8 |
| ลำปาง | 52 | 13 |
| พะเยา | 56 | 9 |
| แพร่ | 54 | 8 |
| น่าน | 55 | 15 |
| แม่ฮ่องสอน | 58 | 7 |
| **Total** |  | **103** |

This count is consistent with the district counts listed in a Department of Provincial Administration ITA manual and the current prototype geography dataset.

## Web seed

Machine-readable data:
`web/data/hr1-admin.json`

Fields per district:
- DOPA code
- Thai/English name
- slug
- number of subdistricts
- number of villages in source dataset
- centroid latitude/longitude

## Source

Prototype seed:
Thailand Administrative Divisions Dataset, version 2026.06, CC-BY-4.0.

For production, the project should reconcile this seed against the organization's official administrative-code master and record a `geography_version`.

## Why district-level support is included now

District is the appropriate operational drill-down for:
- provincial management
- mortality quality review
- district health-system response
- identifying where cause-of-death improvement is needed

However, district forecast/public comparison must be gated by count stability and privacy policy.
