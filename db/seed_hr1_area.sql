-- Health Region 1 province seed.
-- Province codes follow Thailand's standard province code convention; verify against the production geography master before deployment.

INSERT INTO dim_area(area_code, area_name_th, area_name_en, area_level)
VALUES ('01','เขตสุขภาพที่ 1','Health Region 1','region')
ON CONFLICT DO NOTHING;

WITH r AS (
  SELECT area_id FROM dim_area WHERE area_code='01' AND area_level='region'
)
INSERT INTO dim_area(area_code, area_name_th, area_name_en, area_level, parent_area_id)
SELECT v.code, v.th, v.en, 'province', r.area_id
FROM r CROSS JOIN (
  VALUES
    ('50','เชียงใหม่','Chiang Mai'),
    ('51','ลำพูน','Lamphun'),
    ('52','ลำปาง','Lampang'),
    ('54','แพร่','Phrae'),
    ('55','น่าน','Nan'),
    ('56','พะเยา','Phayao'),
    ('57','เชียงราย','Chiang Rai'),
    ('58','แม่ฮ่องสอน','Mae Hong Son')
) AS v(code, th, en)
ON CONFLICT DO NOTHING;
