-- HR1-LE reference schema (PostgreSQL)
-- Source facts are immutable by dataset_version. Derived tables are reproducible caches.

CREATE TABLE import_batch (
  import_batch_id BIGSERIAL PRIMARY KEY,
  source_filename TEXT NOT NULL,
  sha256 CHAR(64) NOT NULL,
  status TEXT NOT NULL,
  uploader TEXT,
  received_at TIMESTAMPTZ NOT NULL DEFAULT now(),
  validation_json JSONB
);

CREATE TABLE dataset_version (
  dataset_version_id BIGSERIAL PRIMARY KEY,
  import_batch_id BIGINT NOT NULL REFERENCES import_batch(import_batch_id),
  version_code TEXT UNIQUE NOT NULL,
  published_at TIMESTAMPTZ,
  published_by TEXT,
  source_year_start SMALLINT,
  source_year_end SMALLINT,
  population_source TEXT,
  mortality_source TEXT,
  geography_version TEXT,
  cause_mapping_version TEXT,
  methodology_version TEXT NOT NULL,
  is_current BOOLEAN NOT NULL DEFAULT FALSE
);

CREATE TABLE dim_area (
  area_id BIGSERIAL PRIMARY KEY,
  area_code TEXT NOT NULL,
  area_name_th TEXT NOT NULL,
  area_name_en TEXT,
  area_level TEXT NOT NULL CHECK (area_level IN ('region','province','district','subdistrict')),
  parent_area_id BIGINT REFERENCES dim_area(area_id),
  valid_from DATE,
  valid_to DATE,
  UNIQUE(area_code, area_level)
);

CREATE TABLE dim_age_group (
  age_group_id SMALLSERIAL PRIMARY KEY,
  label TEXT UNIQUE NOT NULL,
  age_start SMALLINT NOT NULL,
  age_end SMALLINT,
  interval_width SMALLINT,
  nax_fraction NUMERIC(8,6),
  open_interval BOOLEAN NOT NULL DEFAULT FALSE,
  sort_order SMALLINT NOT NULL UNIQUE
);

CREATE TABLE dim_cause (
  cause_id BIGSERIAL PRIMARY KEY,
  icd10_code TEXT NOT NULL,
  cause_group_code TEXT,
  cause_name_th TEXT,
  cause_name_en TEXT,
  mapping_version TEXT NOT NULL,
  UNIQUE(icd10_code, mapping_version)
);

CREATE TABLE fact_population (
  dataset_version_id BIGINT NOT NULL REFERENCES dataset_version(dataset_version_id),
  year SMALLINT NOT NULL,
  area_id BIGINT NOT NULL REFERENCES dim_area(area_id),
  sex CHAR(1) NOT NULL CHECK (sex IN ('M','F')),
  age_group_id SMALLINT NOT NULL REFERENCES dim_age_group(age_group_id),
  population NUMERIC NOT NULL CHECK (population >= 0),
  source TEXT,
  PRIMARY KEY(dataset_version_id, year, area_id, sex, age_group_id)
);

CREATE TABLE fact_death (
  dataset_version_id BIGINT NOT NULL REFERENCES dataset_version(dataset_version_id),
  year SMALLINT NOT NULL,
  area_id BIGINT NOT NULL REFERENCES dim_area(area_id),
  sex CHAR(1) NOT NULL CHECK (sex IN ('M','F')),
  age_group_id SMALLINT NOT NULL REFERENCES dim_age_group(age_group_id),
  cause_id BIGINT NOT NULL REFERENCES dim_cause(cause_id),
  deaths NUMERIC NOT NULL CHECK (deaths >= 0),
  source TEXT,
  PRIMARY KEY(dataset_version_id, year, area_id, sex, age_group_id, cause_id)
);

CREATE TABLE life_table_result (
  dataset_version_id BIGINT NOT NULL REFERENCES dataset_version(dataset_version_id),
  year SMALLINT NOT NULL,
  area_id BIGINT NOT NULL REFERENCES dim_area(area_id),
  sex CHAR(1) NOT NULL CHECK (sex IN ('M','F','B')),
  age_group_id SMALLINT NOT NULL REFERENCES dim_age_group(age_group_id),
  npx_exposure NUMERIC NOT NULL,
  ndx_observed NUMERIC NOT NULL,
  nmx DOUBLE PRECISION,
  nax_fraction DOUBLE PRECISION,
  nqx DOUBLE PRECISION,
  lx DOUBLE PRECISION,
  ndx_lifetable DOUBLE PRECISION,
  nlx DOUBLE PRECISION,
  tx DOUBLE PRECISION,
  ex DOUBLE PRECISION,
  algorithm_version TEXT NOT NULL,
  PRIMARY KEY(dataset_version_id, year, area_id, sex, age_group_id, algorithm_version)
);

CREATE TABLE lee_carter_fit (
  fit_id BIGSERIAL PRIMARY KEY,
  dataset_version_id BIGINT NOT NULL REFERENCES dataset_version(dataset_version_id),
  area_id BIGINT NOT NULL REFERENCES dim_area(area_id),
  sex CHAR(1) NOT NULL CHECK (sex IN ('M','F','B')),
  fit_start_year SMALLINT NOT NULL,
  fit_end_year SMALLINT NOT NULL,
  zero_rate_policy TEXT NOT NULL,
  adjust_kt_to_deaths BOOLEAN NOT NULL,
  drift DOUBLE PRECISION,
  innovation_variance DOUBLE PRECISION,
  model_version TEXT NOT NULL,
  created_at TIMESTAMPTZ NOT NULL DEFAULT now()
);

CREATE TABLE lee_carter_parameter_age (
  fit_id BIGINT NOT NULL REFERENCES lee_carter_fit(fit_id),
  age_group_id SMALLINT NOT NULL REFERENCES dim_age_group(age_group_id),
  ax_log_mortality DOUBLE PRECISION NOT NULL,
  bx_sensitivity DOUBLE PRECISION NOT NULL,
  PRIMARY KEY(fit_id, age_group_id)
);

CREATE TABLE lee_carter_parameter_time (
  fit_id BIGINT NOT NULL REFERENCES lee_carter_fit(fit_id),
  year SMALLINT NOT NULL,
  kt_index DOUBLE PRECISION NOT NULL,
  PRIMARY KEY(fit_id, year)
);

CREATE TABLE lee_carter_forecast (
  fit_id BIGINT NOT NULL REFERENCES lee_carter_fit(fit_id),
  forecast_year SMALLINT NOT NULL,
  age_group_id SMALLINT NOT NULL REFERENCES dim_age_group(age_group_id),
  kt_hat DOUBLE PRECISION NOT NULL,
  mx_hat DOUBLE PRECISION NOT NULL,
  PRIMARY KEY(fit_id, forecast_year, age_group_id)
);

CREATE TABLE priority_round (
  round_id BIGSERIAL PRIMARY KEY,
  round_code TEXT UNIQUE NOT NULL,
  area_id BIGINT REFERENCES dim_area(area_id),
  method_version TEXT NOT NULL,
  status TEXT NOT NULL,
  created_at TIMESTAMPTZ NOT NULL DEFAULT now()
);

CREATE TABLE priority_disease (
  disease_id BIGSERIAL PRIMARY KEY,
  disease_code TEXT,
  disease_name TEXT NOT NULL
);

CREATE TABLE priority_rater (
  rater_id BIGSERIAL PRIMARY KEY,
  external_key TEXT UNIQUE,
  rater_group TEXT,
  active BOOLEAN NOT NULL DEFAULT TRUE
);

CREATE TABLE priority_score (
  round_id BIGINT NOT NULL REFERENCES priority_round(round_id),
  rater_id BIGINT NOT NULL REFERENCES priority_rater(rater_id),
  disease_id BIGINT NOT NULL REFERENCES priority_disease(disease_id),
  problem_size_basis TEXT,
  rate_per_100k DOUBLE PRECISION,
  problem_size_score SMALLINT CHECK (problem_size_score BETWEEN 1 AND 5),
  severity_score SMALLINT CHECK (severity_score BETWEEN 1 AND 5),
  epidemic_score SMALLINT CHECK (epidemic_score BETWEEN 1 AND 5),
  social_economic_score SMALLINT CHECK (social_economic_score BETWEEN 1 AND 5),
  feasibility_score SMALLINT CHECK (feasibility_score BETWEEN 1 AND 5),
  health_gain_score SMALLINT CHECK (health_gain_score BETWEEN 1 AND 5),
  public_perception_score SMALLINT CHECK (public_perception_score BETWEEN 1 AND 5),
  total_score SMALLINT CHECK (total_score BETWEEN 7 AND 35),
  PRIMARY KEY(round_id, rater_id, disease_id)
);

CREATE TABLE priority_result (
  round_id BIGINT NOT NULL REFERENCES priority_round(round_id),
  disease_id BIGINT NOT NULL REFERENCES priority_disease(disease_id),
  valid_raters INTEGER NOT NULL,
  group_total DOUBLE PRECISION NOT NULL,
  group_mean DOUBLE PRECISION NOT NULL,
  normalized_percent DOUBLE PRECISION NOT NULL,
  computed_rank INTEGER NOT NULL,
  final_consensus_rank INTEGER,
  committee_note TEXT,
  PRIMARY KEY(round_id, disease_id)
);

CREATE TABLE audit_log (
  audit_id BIGSERIAL PRIMARY KEY,
  actor TEXT,
  action TEXT NOT NULL,
  object_type TEXT,
  object_id TEXT,
  detail_json JSONB,
  created_at TIMESTAMPTZ NOT NULL DEFAULT now()
);
