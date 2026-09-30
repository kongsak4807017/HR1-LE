# Source Register

## Target system

- https://le-uthaihealth.com/
  - Purpose: target public system for reverse engineering
  - Evidence use: modules, Lee-Carter label, abridged life-table framing, fixed nax statement where publicly exposed

## Health Region 3 methodological lineage

- https://kb.hsri.or.th/dspace/handle/11228/5823
  - HSRI record for HALE / priority-setting methodological work
- https://fliphtml5.com/ywsve/oqpv/
  - indexed report mirror useful for detailed tables when official PDF text retrieval is difficult

## WHO priority methodology

- https://www.who.int/publications/i/item/setting-priorities-incommunicable-disease-surveillance

## Lee-Carter

- https://gking.harvard.edu/files/gking/files/lc.pdf
- https://pmc.ncbi.nlm.nih.gov/articles/PMC1356525/

## Region 1 scope references

Official MOPH sources identify Health Region 1 as 8 provinces:
Chiang Mai, Chiang Rai, Lamphun, Lampang, Phayao, Phrae, Nan, Mae Hong Son.

When adding a new source record, store:
- URL/title
- publisher/owner
- publication date
- access date
- what claim it supports
- evidence confidence
- whether it is primary or secondary

## Health Region 1 / administrative geography sources

- https://spd.moph.go.th/wp-content/uploads/2025/08/%E0%B9%80%E0%B8%A5%E0%B9%88%E0%B8%A1-%E0%B8%97%E0%B8%A8%E0%B8%A7%E0%B8%A3%E0%B8%A3%E0%B8%A9%E0%B9%81%E0%B8%AB%E0%B9%88%E0%B8%87%E0%B8%81%E0%B8%B2%E0%B8%A3%E0%B8%A2%E0%B8%81%E0%B8%A3%E0%B8%B0%E0%B8%94%E0%B8%B1%E0%B8%9A-SAP-v.20-.pdf
  - MOPH service-system source confirming Health Region 1 covers 8 upper-northern provinces.
- https://healthkpi.moph.go.th/kpi2/kpi-list/view/?id=1939
  - MOPH KPI page listing the same eight provinces for Health Region 1.
- https://datacatalog.anamai.moph.go.th/dataset/0911_hpc1012
  - Anamai DataCatalog population dataset for Health Region 1; describes registered population from Department of Provincial Administration grouped by age and sex.
- https://github.com/open-admin-data/thailand-administrative-divisions
  - Prototype administrative geography seed. Version 2026.06, CC-BY-4.0; includes bilingual province/district/subdistrict hierarchy and coordinates.
- Department of Provincial Administration ITA district-count manual (used only as a district-count cross-check): district counts for Region 1 provinces sum to 103.

### Geography-use rule

The open administrative dataset is suitable for prototype routing and UI. Production deployment must reconcile it against the organization's current official geography master, document the result and store a `geography_version`.
