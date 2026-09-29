# 03 — Canonical Data Dictionary

This is a regional compatibility contract, not a claim that target proprietary headers are identical.

## population

Grain: `dataset_version × year × area × sex × age_group`

| Field | Type | Required | Meaning |
|---|---|---:|---|
| year | integer | yes | analysis year |
| area_code | string | yes | official geography code |
| area_name | string | yes | display name |
| area_level | enum | yes | region/province/district/subdistrict |
| sex | M/F | yes | source sex; B is derived |
| age_group | enum | yes | canonical abridged age band |
| population | number >=0 | yes | mid-year population/exposure |
| source | string | yes | provenance |

## deaths

Grain: `dataset_version × year × area × sex × age_group × cause`

| Field | Type | Required | Meaning |
|---|---|---:|---|
| year | integer | yes | death year |
| area_code | string | yes | residence geography |
| area_name | string | yes | display name |
| area_level | enum | yes | geography level |
| sex | M/F | yes | sex |
| age_group | enum | yes | canonical age band |
| icd10 | string | yes | underlying cause/source code |
| deaths | number >=0 | yes | aggregated count |
| source | string | yes | provenance |

## age_group reference

Expected labels:
`0`, `1-4`, `5-9`, `10-14`, ... `80-84`, `85+`.

Reference attributes:
- age_start
- age_end
- interval_width
- nax_fraction
- open_interval
- sort_order

## cause mapping

| Field | Meaning |
|---|---|
| icd10 | raw/canonical ICD code |
| cause_group_code | analytical group |
| cause_name_th | Thai label |
| cause_name_en | English label |
| mapping_version | immutable mapping version |

## standard life expectancy

Optional for standard YLL:
- reference_name
- age_group
- remaining_le

The exact approved reference must be explicitly versioned; never silently replace it.

## import metadata

- dataset_name
- data_owner
- source_year_start
- source_year_end
- area_scope
- population_source
- death_source
- year_calendar
- extraction_date
- methodology_version
- notes
