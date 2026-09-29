# 04 — Import Template Specification

## Required workbook sheets

1. `metadata`
2. `population`
3. `deaths`

Optional:
- `cause_mapping`
- `standard_le`
- `priority_scores`

## Alias normalization

The importer may accept aliases but must normalize into canonical fields before validation.

Examples:

```yaml
year: [year, ปี, ปีพศ, year_be, year_ce]
area_code: [area_code, province_code, district_code, amp_code]
sex: [sex, gender, เพศ]
age_group: [age_group, agegrp, age_band, กลุ่มอายุ, ช่วงอายุ]
population: [population, pop, midyear_pop, ประชากรกลางปี]
icd10: [icd10, icd_10, cause_code, รหัสโรค, สาเหตุการตาย]
deaths: [deaths, death, n_death, จำนวนตาย, ตาย]
```

Alias behavior is PROPOSED for Region 1 compatibility.

## Population example

```csv
year,area_code,area_name,area_level,sex,age_group,population,source
2025,50,เชียงใหม่,province,M,0,10000,DOPA
2025,50,เชียงใหม่,province,F,0,9500,DOPA
```

## Death example

```csv
year,area_code,area_name,area_level,sex,age_group,icd10,deaths,source
2025,50,เชียงใหม่,province,M,65-69,I21,7,MOPH mortality
```

## Import state machine

```text
RECEIVED
→ HASHED
→ NORMALIZED
→ VALIDATED
→ RECONCILED
→ READY_FOR_APPROVAL
→ PUBLISHED
```

Failure states:
- SCHEMA_FAILED
- DOMAIN_FAILED
- RECONCILIATION_FAILED
- REJECTED

## Publication rule

Upload and publish must be separate actions in production. Provincial data managers upload; authorized regional approver publishes.
