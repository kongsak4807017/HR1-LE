# HR1-LE Web Prototype

Static single-page wireframe for Health Region 1.

## Preview locally

Because the prototype loads `data/hr1-admin.json` with `fetch()`, serve the directory over HTTP:

```bash
cd web
python -m http.server 8000
```

Then open:

`http://localhost:8000`

## Routes

- `#/overview`
- `#/benchmark`
- `#/province/:provinceCode`
- `#/district/:districtCode`
- `#/life-expectancy`
- `#/mortality`
- `#/forecast`
- `#/quality`
- `#/priority`
- `#/data-flow`
- `#/data-management`
- `#/methodology`
- `#/sitemap`

## Data status

All health metrics in this prototype are deterministic synthetic values generated in the browser. They exist only to evaluate navigation, information architecture, responsive layout and drill-down behavior.

Geographic province/district metadata comes from the Thailand Administrative Divisions Dataset 2026.06 (CC-BY-4.0) and must be checked against the production official geography master before operational use.

## Production migration

Replace the demo metric helpers in `assets/app.js` with API calls matching `docs/09_API_AND_DATABASE.md`.

Every production response should include:
- dataset_version
- algorithm_version
- generated_at
- filters
- data
