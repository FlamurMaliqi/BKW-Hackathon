-- BKW Hackathon - Mock Data aligned with extended schema
-- Inserts sample projects, teams, engineers, assignments, absences, and presence

-- ---------------------------------------------------------------------
INSERT INTO projects (name, description, start_date, deadline, status, priority, completion_percent, budget_total, budget_spent) VALUES
    ('Solar Roof Expansion', 'PV capacity increase across municipal buildings', '2025-09-01', '2026-03-15', 'active', 'high', 62.50, 1250000, 775000),
    ('District Heating Retrofit', 'Modernise district heating control loops for downtown grid', '2025-07-15', '2025-12-01', 'active', 'medium', 48.00, 890000, 432000),
    ('Battery Storage Pilot', 'Pilot-scale storage system for peak shaving', '2025-08-01', '2026-01-20', 'active', 'medium', 35.25, 640000, 210000),
    ('Hydro Plant Modernization', 'Turbine control upgrade and monitoring rollout', '2025-05-01', '2025-11-15', 'active', 'high', 78.90, 1560000, 1215000),
    ('HVAC Optimization Program', 'Energy efficiency improvements for office portfolio', '2025-10-15', '2026-02-10', 'planning', 'low', 18.00, 540000, 62000);

-- ---------------------------------------------------------------------
-- Teams
-- ---------------------------------------------------------------------

INSERT INTO teams (name, description, color, performance_score) VALUES
    ('Renewables Delivery', 'Solar and storage implementation specialists', '#007bff', 84.5),
    ('Thermal Systems', 'District heating and industrial heat projects', '#28a745', 79.0),
    ('Grid Innovation', 'Controls and automation initiatives', '#ffc107', 91.2)
ON CONFLICT (name) DO NOTHING;

-- ---------------------------------------------------------------------
-- Engineers
-- ---------------------------------------------------------------------

INSERT INTO engineers (name, email, phone, capacity_hours_per_week, role, team_id, status, availability, workload_percent, is_overworked, skills) VALUES
    ('Anna Keller', 'anna.keller@bkw.ch', '+41-31-000-0101', 40, 'Senior Engineer', (SELECT id FROM teams WHERE name = 'Renewables Delivery'), 'active', 'available', 88, TRUE, ARRAY['PV design','Project leadership','SCADA']),
    ('Lukas Meier', 'lukas.meier@bkw.ch', '+41-31-000-0102', 32, 'Electrical Engineer', (SELECT id FROM teams WHERE name = 'Thermal Systems'), 'active', 'busy', 76, FALSE, ARRAY['Power electronics','Commissioning','Safety audits']),
    ('Sofia Baumann', 'sofia.baumann@bkw.ch', '+41-31-000-0103', 40, 'Project Manager', (SELECT id FROM teams WHERE name = 'Thermal Systems'), 'active', 'available', 64, FALSE, ARRAY['Stakeholder management','Budgeting','Risk analysis']),
    ('Marco Steiner', 'marco.steiner@bkw.ch', '+41-31-000-0104', 30, 'Mechanical Engineer', (SELECT id FROM teams WHERE name = 'Renewables Delivery'), 'active', 'holiday', 0, FALSE, ARRAY['HVAC design','3D modelling','Retrofit planning']),
    ('Laura Brunner', 'laura.brunner@bkw.ch', '+41-31-000-0105', 35, 'Energy Analyst', (SELECT id FROM teams WHERE name = 'Renewables Delivery'), 'active', 'remote', 52, FALSE, ARRAY['Energy modelling','Reporting','Forecasting']),
    ('Jonas Frei', 'jonas.frei@bkw.ch', '+41-31-000-0106', 40, 'Controls Specialist', (SELECT id FROM teams WHERE name = 'Grid Innovation'), 'active', 'available', 94, TRUE, ARRAY['PLC programming','Automation','Cybersecurity'])
ON CONFLICT (email) DO NOTHING;

-- ---------------------------------------------------------------------
-- Project assignments
-- ---------------------------------------------------------------------

INSERT INTO project_assignments (engineer_id, project_id, hours_per_week, start_date, end_date) VALUES
    ((SELECT id FROM engineers WHERE email = 'anna.keller@bkw.ch'), (SELECT id FROM projects WHERE name = 'Solar Roof Expansion'), 25, '2025-09-01', '2026-03-01'),
    ((SELECT id FROM engineers WHERE email = 'anna.keller@bkw.ch'), (SELECT id FROM projects WHERE name = 'Hydro Plant Modernization'), 10, '2025-06-01', '2025-11-30'),
    ((SELECT id FROM engineers WHERE email = 'lukas.meier@bkw.ch'), (SELECT id FROM projects WHERE name = 'District Heating Retrofit'), 28, '2025-07-15', '2025-12-15'),
    ((SELECT id FROM engineers WHERE email = 'sofia.baumann@bkw.ch'), (SELECT id FROM projects WHERE name = 'District Heating Retrofit'), 18, '2025-04-01', '2025-12-01'),
    ((SELECT id FROM engineers WHERE email = 'sofia.baumann@bkw.ch'), (SELECT id FROM projects WHERE name = 'HVAC Optimization Program'), 12, '2025-10-15', '2026-02-10'),
    ((SELECT id FROM engineers WHERE email = 'marco.steiner@bkw.ch'), (SELECT id FROM projects WHERE name = 'Battery Storage Pilot'), 22, '2025-08-01', '2026-01-31'),
    ((SELECT id FROM engineers WHERE email = 'laura.brunner@bkw.ch'), (SELECT id FROM projects WHERE name = 'Solar Roof Expansion'), 18, '2025-09-15', '2026-03-10'),
    ((SELECT id FROM engineers WHERE email = 'laura.brunner@bkw.ch'), (SELECT id FROM projects WHERE name = 'HVAC Optimization Program'), 12, '2025-10-20', '2026-02-10'),
    ((SELECT id FROM engineers WHERE email = 'jonas.frei@bkw.ch'), (SELECT id FROM projects WHERE name = 'Hydro Plant Modernization'), 35, '2025-05-01', '2025-11-15'),
    ((SELECT id FROM engineers WHERE email = 'jonas.frei@bkw.ch'), (SELECT id FROM projects WHERE name = 'Battery Storage Pilot'), 10, '2025-08-01', '2026-01-20')
ON CONFLICT (engineer_id, project_id) DO NOTHING;

-- ---------------------------------------------------------------------
-- Absences
-- ---------------------------------------------------------------------

INSERT INTO absences (engineer_id, start_date, end_date, reason, type) VALUES
    ((SELECT id FROM engineers WHERE email = 'anna.keller@bkw.ch'), '2025-12-23', '2026-01-03', 'Winter holidays', 'holiday'),
    ((SELECT id FROM engineers WHERE email = 'lukas.meier@bkw.ch'), '2025-10-25', '2025-10-29', 'Grid automation course', 'personal'),
    ((SELECT id FROM engineers WHERE email = 'laura.brunner@bkw.ch'), '2025-11-11', '2025-11-13', 'Seasonal flu', 'sick'),
    ((SELECT id FROM engineers WHERE email = 'jonas.frei@bkw.ch'), '2025-12-02', '2025-12-06', 'Family event', 'personal');

-- ---------------------------------------------------------------------
-- Engineer presence (7 day snapshot)
-- ---------------------------------------------------------------------

WITH dates AS (
    SELECT generate_series(CURRENT_DATE - 6, CURRENT_DATE, INTERVAL '1 day')::date AS day
)
INSERT INTO engineer_presence (engineer_id, presence_date, status)
SELECT engineer_id, day,
       CASE
           WHEN engineer_email = 'marco.steiner@bkw.ch' THEN 'out_of_office'
           WHEN engineer_email = 'anna.keller@bkw.ch' AND EXTRACT(ISODOW FROM day) IN (6, 7) THEN 'out_of_office'
           WHEN engineer_email = 'jonas.frei@bkw.ch' AND day = CURRENT_DATE - 1 THEN 'out_of_office'
           WHEN engineer_email = 'laura.brunner@bkw.ch' AND EXTRACT(ISODOW FROM day) = 3 THEN 'out_of_office'
           ELSE 'in_office'
       END AS status
FROM (
    SELECT id AS engineer_id, email AS engineer_email FROM engineers
) e
CROSS JOIN dates
ON CONFLICT (engineer_id, presence_date) DO NOTHING;


