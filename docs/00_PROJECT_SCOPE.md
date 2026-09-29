# 00 — Project Scope: Health Region 1

## Regional objective

Build a single analytical platform that allows Health Region 1 to compare mortality and life expectancy using the same denominator definitions, age groups, algorithms and versioned datasets across all 8 provinces.

## Province scope

| Province | Thai |
|---|---|
| Chiang Mai | เชียงใหม่ |
| Chiang Rai | เชียงราย |
| Lamphun | ลำพูน |
| Lampang | ลำปาง |
| Phayao | พะเยา |
| Phrae | แพร่ |
| Nan | น่าน |
| Mae Hong Son | แม่ฮ่องสอน |

## Unit of analysis

The core analytical model should support:
- region
- province
- district
- optionally subdistrict when counts and data quality permit

## Core outputs

- e0 at birth
- ex by age group
- full abridged life table
- observed mortality by age/sex
- annual mortality trend
- top causes of death
- R00–R99 proportion
- YLL by cause
- Lee–Carter e0 forecast
- WHO-derived priority score/rank
- cross-province benchmark
- data quality and completeness dashboard

## Primary implementation principle

A regional benchmark is only valid when:
- age bands are identical
- population denominator definition is identical
- death source/cutoff is identical
- area-of-residence rule is identical
- ICD mapping version is identical
- algorithm version is identical
- all results point to a dataset version

## Recommended regional governance

- Region 1: data standard + algorithm owner + publication approval
- Provincial Health Offices: source submission + first-line QA
- hospitals/districts: source correction and cause-of-death verification
- technical team: ETL, validation, model fit, test suite
- epidemiology/public-health committee: interpretation and priority setting
